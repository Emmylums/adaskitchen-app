import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import bg from "../assets/bg.jpeg";
import jollof from "../assets/food2.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faUtensils,
  faCalendarAlt,
  faClock,
  faUsers,
  faStar,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import TestimonialSlider from "../components/TestimonialSlider";
import MotionWrapper from "../components/MotionWrapper";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import AlertBanner from "../components/AlertBanner";
import { db } from "../firebaseConfig";
import { collection, getDocs, query } from "firebase/firestore";

export default function Home() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [slides, setSlides] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });

  const { addToCart } = useCart();

  const showAlert = (message, type) => {
    setAlert({ message, type, visible: true });
    setTimeout(() => setAlert({ message: "", type: "", visible: false }), 3000);
  };

  const handleAddToCart = (dish) => {
    addToCart(dish, 1);
    showAlert(`1 ${dish.name} added to cart!`, "success");
  };

  /* ==================================================================
     FETCH LOGIC — VERBATIM, DO NOT MODIFY
     ================================================================== */
  const fetchFeaturedDishes = async () => {
    try {
      const featuredRef = collection(db, "featuredDishes");
      const q = query(featuredRef);
      const querySnapshot = await getDocs(q);

      const dishes = [];
      querySnapshot.forEach((doc) => {
        dishes.push({ id: doc.id, ...doc.data() });
      });
      return dishes;
    } catch (error) {
      console.error("Error fetching featured dishes:", error);
      return [];
    }
  };

  const fetchPopularDishes = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const ordersQuery = query(ordersRef);
      const ordersSnapshot = await getDocs(ordersQuery);

      const dishCounts = {};

      if (ordersSnapshot.size > 0) {
        ordersSnapshot.forEach((orderDoc) => {
          const orderData = orderDoc.data();

          if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items.forEach((item) => {
              const dishName =
                item.name ||
                item.menuItemName ||
                item.dishName ||
                item.itemName ||
                item.title;

              if (dishName) {
                const cleanName = dishName.toLowerCase().trim();
                dishCounts[cleanName] =
                  (dishCounts[cleanName] || 0) + (item.quantity || 1);
              }
            });
          }
        });
      }

      let allMenuItems = [];

      try {
        const menusRef = collection(db, "menus");
        const menusQuery = query(menusRef);
        const menusSnapshot = await getDocs(menusQuery);

        menusSnapshot.forEach((menuDoc) => {
          const menuData = menuDoc.data();

          if (menuData.menuItems && Array.isArray(menuData.menuItems)) {
            menuData.menuItems.forEach((item, index) => {
              const menuItemName =
                item.menuItemName || item.name || item.title || `Menu Item ${index + 1}`;
              const cleanName = menuItemName.toLowerCase().trim();

              allMenuItems.push({
                id: `${menuDoc.id}_${index}`,
                name: menuItemName,
                description:
                  item.menuItemDescription || item.description || item.desc || "Delicious dish",
                price: item.menuItemPrice || item.price || item.cost || 0,
                image:
                  item.menuItemImage ||
                  item.image ||
                  item.img ||
                  item.imageUrl ||
                  "https://via.placeholder.com/300x200?text=Dish+Image",
                category: menuData.categoryName || menuData.category || "Uncategorized",
                cleanName: cleanName,
              });
            });
          } else if (menuData.items && Array.isArray(menuData.items)) {
            menuData.items.forEach((item, index) => {
              const menuItemName = item.name || item.title || `Item ${index + 1}`;
              const cleanName = menuItemName.toLowerCase().trim();

              allMenuItems.push({
                id: `${menuDoc.id}_${index}`,
                name: menuItemName,
                description: item.description || item.desc || "Delicious dish",
                price: item.price || item.cost || 0,
                image:
                  item.image ||
                  item.img ||
                  item.imageUrl ||
                  "https://via.placeholder.com/300x200?text=Dish+Image",
                category: menuData.categoryName || menuData.category || "Uncategorized",
                cleanName: cleanName,
              });
            });
          } else {
            const menuItemName =
              menuData.menuItemName || menuData.name || menuData.title || menuDoc.id;
            const cleanName = menuItemName.toLowerCase().trim();

            allMenuItems.push({
              id: menuDoc.id,
              name: menuItemName,
              description:
                menuData.menuItemDescription || menuData.description || menuData.desc || "Delicious dish",
              price: menuData.menuItemPrice || menuData.price || menuData.cost || 0,
              image:
                menuData.menuItemImage ||
                menuData.image ||
                menuData.img ||
                menuData.imageUrl ||
                "https://via.placeholder.com/300x200?text=Dish+Image",
              category: menuData.categoryName || menuData.category || "Uncategorized",
              cleanName: cleanName,
            });
          }
        });
      } catch (menuError) {
        // ignore
      }

      if (allMenuItems.length === 0) {
        try {
          const dishesRef = collection(db, "dishes");
          const dishesQuery = query(dishesRef);
          const dishesSnapshot = await getDocs(dishesQuery);

          dishesSnapshot.forEach((dishDoc) => {
            const dishData = dishDoc.data();
            const dishName = dishData.name || dishData.title || dishDoc.id;
            const cleanName = dishName.toLowerCase().trim();

            allMenuItems.push({
              id: dishDoc.id,
              name: dishName,
              description: dishData.description || dishData.desc || "Delicious dish",
              price: dishData.price || dishData.cost || 0,
              image:
                dishData.image ||
                dishData.img ||
                dishData.imageUrl ||
                "https://via.placeholder.com/300x200?text=Dish+Image",
              category: dishData.category || dishData.categoryName || "Uncategorized",
              cleanName: cleanName,
            });
          });
        } catch (dishError) {
          // ignore
        }
      }

      if (allMenuItems.length === 0) {
        return [];
      }

      if (Object.keys(dishCounts).length === 0) {
        return allMenuItems.slice(0, 4);
      }

      const sortedDishes = Object.entries(dishCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 8);

      const matchedDishes = [];

      sortedDishes.forEach(([orderedDishName, orderCount]) => {
        let foundDish = null;

        foundDish = allMenuItems.find((item) => item.cleanName === orderedDishName);

        if (!foundDish) {
          foundDish = allMenuItems.find(
            (item) =>
              item.cleanName.includes(orderedDishName) ||
              orderedDishName.includes(item.cleanName)
          );
        }

        if (!foundDish) {
          const cleanOrderedName = orderedDishName.replace(/[^a-z0-9]/g, "");
          foundDish = allMenuItems.find((item) => {
            const cleanItemName = item.cleanName.replace(/[^a-z0-9]/g, "");
            return (
              cleanItemName.includes(cleanOrderedName) ||
              cleanOrderedName.includes(cleanItemName)
            );
          });
        }

        if (foundDish && !matchedDishes.some((d) => d.id === foundDish.id)) {
          matchedDishes.push({ ...foundDish, orderCount: orderCount });
        }
      });

      const topPopular = matchedDishes
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 4)
        .map(({ orderCount, ...rest }) => rest);

      if (topPopular.length > 0) {
        return topPopular;
      }

      return allMenuItems.slice(0, 4);
    } catch (error) {
      console.error("Error fetching popular dishes:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [featured, popular] = await Promise.all([
          fetchFeaturedDishes(),
          fetchPopularDishes(),
        ]);

        if (featured.length > 0) {
          const formattedSlides = featured.map((dish) => {
            const imageUrl = dish.menuItemImage || dish.image || dish.imageUrl;
            return {
              imageUrl: imageUrl,
              title: dish.menuItemName || dish.name,
              description:
                dish.featuredDescription || dish.description || "Delicious Nigerian dish",
            };
          });
          setSlides(formattedSlides);
        } else {
          setSlides([
            {
              imageUrl: "./assets/jollof2.jpg",
              title: "Jollof Rice",
              description:
                "Original recipe simmered in a rich tomato and pepper sauce, served with tender Grilled Chicken, Sweet Fried Plantains, and a side of Spicy Slaw for that perfect crunch.",
            },
            {
              imageUrl: "./assets/egusi.jpg",
              title: "Egusi Soup",
              description:
                "Original recipe made with ground melon seeds, slow-cooked in a savory blend of spices, peppers, and palm oil. Served with tender pieces of meat and fish, and paired perfectly with pounded yam or fufu for a hearty, traditional meal.",
            },
            {
              imageUrl: "./assets/fried.jpg",
              title: "Fried Rice",
              description:
                "Fried Rice stir-fried with mixed vegetables, seasoned to perfection with curry and thyme for a vibrant, savory flavor. Served with succulent grilled chicken and a fresh side of salad for a balanced, delicious West African classic.",
            },
          ]);
        }

        setPopularDishes(popular);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load dishes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const testimonials = [
    { name: "Paul", description: "That was very tasty food Frank" },
    { name: "K & B", description: "The food was great - very tasty." },
  ];

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 7000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  /* ==================================================================
     LOADING
     ================================================================== */
  if (loading) {
    return (
      <>
        <NavBar activeLink="Home" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
        <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Home" onClose={() => setMobileNavBarVisible(false)} className="sm:col-span-1 pt-7" />
        <div className="flex justify-center items-center h-screen bg-own-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-white/70">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ==================================================================
     ERROR
     ================================================================== */
  if (error) {
    return (
      <>
        <NavBar activeLink="Home" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
        <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Home" onClose={() => setMobileNavBarVisible(false)} className="sm:col-span-1 pt-7" />
        <div className="flex justify-center items-center h-screen bg-gray-50 px-6">
          <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ==================================================================
     RENDER
     ================================================================== */
  return (
    <>
      <NavBar activeLink="Home" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Home" onClose={() => setMobileNavBarVisible(false)} className="sm:col-span-1 pt-7" />

      {alert.visible && (
        <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, visible: false })} />
      )}

      <div>
        <main>
          {/* ============================================================ */}
          {/* HERO                                                         */}
          {/* ============================================================ */}
          <section
            style={{ backgroundImage: `url(${bg})` }}
            className="relative h-screen min-h-[420px] bg-center bg-cover overflow-hidden [@media(max-height:500px)]:min-h-[340px]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

            <div className="relative flex items-center justify-center h-full px-4 sm:px-6 [@media(max-height:500px)]:px-3">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0 }}
                className="text-center text-white max-w-4xl"
              >
                <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-6 [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:tracking-[0.2em]">
                  Authentic Nigerian Cuisine
                </span>

                <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl leading-tight mb-6 [@media(max-height:500px)]:text-2xl [@media(max-height:500px)]:mb-2 [@media(max-height:400px)]:text-xl">
                  Welcome to <br />
                  <span className="text-own-2">Ada&rsquo;s Kitchen</span>
                </h1>

                <p className="text-lg md:text-2xl text-white/85 mb-4 max-w-2xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-2">
                  A Taste of Nigeria&rsquo;s Finest Flavors
                </p>

                <p className="text-sm md:text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mb-4">
                  Savor authentic Nigerian cuisine, crafted with love &amp; tradition
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center [@media(max-height:500px)]:gap-2">
                  <Link to="/menu">
                    <button className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 inline-flex items-center gap-3 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                      Order Now <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </button>
                  </Link>
                  <Link to="/our-story">
                    <button className="border-2 border-white/40 hover:border-own-2 hover:text-own-2 text-white font-semibold px-8 py-4 rounded-full tracking-wide backdrop-blur-sm transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                      Our Story
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Scroll indicator — hide on very short landscape */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 [@media(max-height:500px)]:hidden"
            >
              <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
                <div className="w-1 h-2 bg-white/60 rounded-full" />
              </div>
            </motion.div>
          </section>

          {/* ============================================================ */}
          {/* FEATURED DISHES — CAROUSEL                                   */}
          {/* ============================================================ */}
          <section className="w-full mx-auto overflow-hidden py-20 px-4 sm:px-6 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 [@media(max-height:600px)]:mb-6 [@media(max-height:500px)]:mb-3"
            >
              <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                Signature Selection
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-[oklch(29.23%_0_0)] font-display [@media(max-height:500px)]:text-xl">
                Featured Dishes
              </h2>
            </motion.div>

            {slides.length > 0 ? (
              <motion.div
                className="relative w-full h-[60vh] min-h-[360px] rounded-3xl overflow-hidden shadow-2xl [@media(max-height:600px)]:h-[45vh] [@media(max-height:500px)]:h-[50vh] [@media(max-height:500px)]:min-h-[240px] [@media(max-height:500px)]:rounded-2xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true, amount: 0.15 }}
              >
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                      index === currentIndex ? "opacity-100 z-20" : "opacity-0 z-10"
                    }`}
                  >
                    <div
                      className="relative h-full min-w-full bg-center bg-cover"
                      style={{ backgroundImage: `url('${slide.imageUrl}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/60 to-black/80" />
                      <div className="relative flex items-center justify-center h-full px-4 sm:px-6">
                        <div className="p-4 text-center text-white flex flex-col items-center">
                          <h3 className="font-display font-bold text-3xl md:text-5xl mb-4 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
                            {slide.title}
                          </h3>
                          <div className="w-16 h-1 bg-own-2 mb-6 rounded-full [@media(max-height:500px)]:w-10 [@media(max-height:500px)]:h-0.5 [@media(max-height:500px)]:mb-3"></div>
                          <p className="font-medium text-base md:text-lg md:w-[70%] lg:w-[60%] text-center leading-relaxed text-white/85 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:leading-snug">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Dot indicators */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30 [@media(max-height:500px)]:bottom-3">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentIndex
                          ? "w-8 bg-own-2"
                          : "w-2 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="w-full h-[60vh] min-h-[360px] rounded-3xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center [@media(max-height:500px)]:h-[40vh] [@media(max-height:500px)]:min-h-[200px]">
                <p className="text-[oklch(40%_0.05_100)] text-lg [@media(max-height:500px)]:text-sm">
                  No featured dishes available
                </p>
              </div>
            )}

            <div className="flex justify-center py-10 [@media(max-height:600px)]:py-4">
              <Link to="/menu">
                <button className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] text-base md:text-lg px-8 py-4 rounded-full inline-flex items-center justify-center gap-3 tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Order Now <FontAwesomeIcon className="text-xs" icon={faArrowRight} />
                </button>
              </Link>
            </div>
          </section>

          {/* ============================================================ */}
          {/* POPULAR DISHES                                               */}
          {/* ============================================================ */}
          {popularDishes.length > 0 && (
            <section className="py-20 px-4 sm:px-6 bg-gray-50 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-6">
              <div className="max-w-6xl mx-auto">
                <MotionWrapper direction="up">
                  <div className="text-center mb-12 [@media(max-height:600px)]:mb-6 [@media(max-height:500px)]:mb-3">
                    <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                      Customer Favorites
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-[oklch(29.23%_0_0)] font-display mb-4 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
                      Most Loved Dishes
                    </h2>
                    <p className="text-center text-[oklch(40%_0.05_100)] max-w-2xl mx-auto text-base md:text-lg [@media(max-height:500px)]:text-xs">
                      Discover our most loved dishes that keep customers coming back for more
                    </p>
                  </div>
                </MotionWrapper>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 [@media(max-height:600px)]:gap-3 [@media(max-height:500px)]:gap-2">
                  {popularDishes.map((dish, index) => (
                    <MotionWrapper key={dish.id || index} direction="up" delay={index * 0.1}>
                      <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl border-2 border-transparent hover:border-own-2/30 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full [@media(max-height:500px)]:rounded-2xl">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden [@media(max-height:500px)]:h-32">
                          {dish.image ? (
                            <>
                              <img
                                src={dish.image}
                                alt={dish.name}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/300x200?text=Dish+Image";
                                }}
                              />
                              {/* Gold rating badge */}
                              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <FontAwesomeIcon icon={faStar} className="text-own-2 text-[10px]" />
                                <span className="text-xs font-bold text-[oklch(29.23%_0_0)]">5</span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-own-2/20 to-amber-200 flex items-center justify-center">
                              <FontAwesomeIcon icon={faUtensils} className="text-5xl text-own-2" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-grow [@media(max-height:500px)]:p-3">
                          <h3 className="font-bold text-lg text-[oklch(29.23%_0_0)] mb-2 line-clamp-1 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-1">
                            {dish.name}
                          </h3>
                          <p className="text-[oklch(40%_0.05_100)] text-sm mb-4 flex-grow line-clamp-2 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mb-2">
                            {dish.description || "Delicious Nigerian dish"}
                          </p>
                          <div className="mb-3 [@media(max-height:500px)]:mb-1.5">
                            <span className="text-xl font-black text-own-2 [@media(max-height:500px)]:text-base">
                              £{dish.price?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          <button
                            className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-bold px-4 py-2.5 rounded-full w-full transition-all duration-300 shadow-sm hover:shadow-md [@media(max-height:500px)]:py-1.5 [@media(max-height:500px)]:text-xs"
                            onClick={() => handleAddToCart(dish)}
                          >
                            Add to Order
                          </button>
                        </div>
                      </div>
                    </MotionWrapper>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* OUR STORY                                                    */}
          {/* ============================================================ */}
          <section className="flex flex-col-reverse md:flex-row md:justify-between md:items-center md:gap-12 px-4 sm:px-6 py-24 bg-own-1 text-white [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              className="md:w-1/2"
            >
              <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                Our Beginning
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
                The Heart Behind Our Kitchen
              </h2>
              <div className="space-y-4 text-white/80 text-sm md:text-base leading-relaxed [@media(max-height:500px)]:space-y-2 [@media(max-height:500px)]:text-xs">
                <p>
                  At Ada&rsquo;s Kitchen, our journey began with a simple yet powerful idea: to
                  create delicious, wholesome meals that honor tradition while embracing modern
                  tastes. Named after the matriarch of our family, Ada, whose love for cooking
                  brought people together, we strive to keep her spirit alive in every dish we
                  serve.
                </p>
                <p>
                  Ada&rsquo;s recipes were more than just food. They were a celebration of culture,
                  warmth, and connection. From her cozy home kitchen to yours, we&rsquo;ve
                  preserved her timeless flavors while adding our own creative twist. Every bite
                  tells a story of heritage, passion, and the joy of sharing good food with good
                  company.
                </p>
                <p>
                  Whether you&rsquo;re joining us for a comforting classic or an exciting new
                  creation, we invite you to be part of Ada&rsquo;s Kitchen; where every meal is
                  made with love.
                </p>
              </div>
              <Link to="/our-story">
                <button className="mt-8 inline-flex items-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 [@media(max-height:500px)]:mt-4 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Learn More <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              className="md:w-1/2 relative mb-8 md:mb-0 [@media(max-height:500px)]:mb-4"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-own-2/20">
                <img
                  src={jollof}
                  alt="Jollof Rice"
                  className="w-full h-[300px] md:h-[500px] object-cover [@media(max-height:500px)]:h-[200px]"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-4 md:-right-8 bg-own-2 p-5 md:p-6 rounded-2xl shadow-2xl [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:-bottom-3 [@media(max-height:500px)]:-right-2">
                <div className="flex items-center gap-3 [@media(max-height:500px)]:gap-2">
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="text-2xl md:text-3xl text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-lg"
                  />
                  <div>
                    <div className="text-xs md:text-sm font-bold text-[oklch(29.23%_0_0)]/70 uppercase tracking-widest [@media(max-height:500px)]:text-[9px]">
                      Made with
                    </div>
                    <div className="text-base md:text-lg font-black text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-xs">
                      Love &amp; Tradition
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ============================================================ */}
          {/* CATERING SERVICES — FULL-BLEED VIDEO                        */}
          {/* ============================================================ */}
          <section className="relative py-24 px-4 sm:px-6 overflow-hidden [@media(max-height:600px)]:py-12 [@media(max-height:500px)]:py-8">
            {/* <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={cateringVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video> */}

            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

            <div className="relative max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center [@media(max-height:500px)]:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                >
                  <span className="inline-block text-own-2 font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                    Catering Services
                  </span>
                  <h2 className="text-3xl md:text-5xl font-bold text-white font-display leading-tight mb-6 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
                    Now Available for <span className="text-own-2">Catering Services</span>
                  </h2>
                  <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mb-4">
                    Bring the authentic taste of Nigeria to your next event! Whether it&rsquo;s a
                    wedding, corporate function, or family gathering, our catering services will
                    impress your guests with flavorful dishes made with the same care and attention
                    as in our kitchen.
                  </p>
                  <Link to="/catering">
                    <button className="inline-flex items-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                      Book Your Event <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-2 gap-4 [@media(max-height:500px)]:gap-2"
                >
                  {[
                    { icon: faUtensils, title: "Custom Menus", desc: "Tailored to your taste & theme" },
                    { icon: faCalendarAlt, title: "Any Occasion", desc: "Weddings, corporate & more" },
                    { icon: faClock, title: "24/7 Support", desc: "We're here whenever you need" },
                    { icon: faUsers, title: "Any Size", desc: "Intimate dinners to large crowds" },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-colors duration-300 [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:rounded-xl"
                    >
                      <div className="w-12 h-12 rounded-xl bg-own-2 flex items-center justify-center mb-4 [@media(max-height:500px)]:w-9 [@media(max-height:500px)]:h-9 [@media(max-height:500px)]:mb-2">
                        <FontAwesomeIcon icon={f.icon} className="text-[oklch(29.23%_0_0)] text-lg [@media(max-height:500px)]:text-sm" />
                      </div>
                      <h3 className="text-white font-semibold text-base md:text-lg mb-1 [@media(max-height:500px)]:text-sm">
                        {f.title}
                      </h3>
                      <p className="text-white/70 text-xs md:text-sm leading-snug [@media(max-height:500px)]:text-[10px]">{f.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                viewport={{ once: true }}
                className="mt-16 pt-8 border-t border-white/20 grid grid-cols-3 gap-4 text-center [@media(max-height:500px)]:mt-8 [@media(max-height:500px)]:pt-4 [@media(max-height:500px)]:gap-2"
              >
                {[
                  { value: "24/7", label: "Booking Enquiries" },
                  { value: "Custom", label: "Menus For Any Event" },
                  { value: "100%", label: "Fresh Ingredients" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl md:text-4xl font-bold text-own-2 [@media(max-height:500px)]:text-lg">{s.value}</div>
                    <div className="text-white/70 text-[10px] md:text-sm mt-1 tracking-widest uppercase [@media(max-height:500px)]:text-[9px]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* TESTIMONIALS                                                 */}
          {/* ============================================================ */}
          <section className="py-24 px-4 sm:px-6 [@media(max-height:600px)]:py-12 [@media(max-height:500px)]:py-8">
            <MotionWrapper direction="up">
              <div className="text-center mb-12 [@media(max-height:600px)]:mb-6 [@media(max-height:500px)]:mb-3">
                <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                  Testimonials
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-[oklch(29.23%_0_0)] font-display mb-4 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
                  What Our Customers Say
                </h2>
                <p className="text-center text-[oklch(40%_0.05_100)] max-w-2xl mx-auto text-base md:text-lg [@media(max-height:500px)]:text-xs">
                  Don&rsquo;t just take our word for it — hear from our satisfied customers
                </p>
              </div>
            </MotionWrapper>

            <MotionWrapper direction="up" delay={0.3}>
              <TestimonialSlider testimonials={testimonials} />
            </MotionWrapper>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}