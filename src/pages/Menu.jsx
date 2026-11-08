import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faShoppingCart,
  faPlus,
  faMinus,
  faFilter,
  faStoreAltSlash,
  faStar,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import AlertBanner from "../components/AlertBanner";
import { useCart } from "../context/CartContext";
import bg from "../assets/bgcont.jpeg";
import Footer from "../components/Footer";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, doc, getDoc } from "firebase/firestore";

export default function Menu() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });
  const [categories, setCategories] = useState(["All"]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);

  const { addToCart, getTotalItems } = useCart();

  /* ---------- Fetch (verbatim) ---------- */
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let categoryList = ["All"];
      try {
        const categoriesRef = collection(db, "categories");
        const categoriesQuery = query(categoriesRef);
        const categoriesSnapshot = await getDocs(categoriesQuery);
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name) categoryList.push(data.name);
        });
      } catch (catError) {
        categoryList = ["All", "Main Course", "Appetizers", "Desserts", "Drinks", "Specials"];
      }
      setCategories(categoryList);

      const items = [];
      try {
        const menusRef = collection(db, "menus");
        const menusQuery = query(menusRef);
        const menusSnapshot = await getDocs(menusQuery);
        if (menusSnapshot.size === 0) {
          try {
            const dishesRef = collection(db, "dishes");
            const dishesQuery = query(dishesRef);
            const dishesSnapshot = await getDocs(dishesQuery);
            dishesSnapshot.forEach((dishDoc) => {
              const dishData = dishDoc.data();
              items.push({
                id: dishDoc.id,
                name: dishData.name || dishData.menuItemName || `Dish ${dishDoc.id}`,
                description: dishData.description || dishData.menuItemDescription || "Delicious dish",
                price: dishData.price || dishData.menuItemPrice || 0,
                image: dishData.image || dishData.imageUrl,
                category: dishData.category || dishData.categoryName || "Uncategorized",
                rating: dishData.rating || 5,
                available: dishData.available !== undefined ? dishData.available : true,
                originalIndex: items.length,
              });
            });
          } catch (dishesError) {}
        } else {
          menusSnapshot.forEach((menuDoc) => {
            const menuData = menuDoc.data();
            if (menuData.menuItems && Array.isArray(menuData.menuItems)) {
              menuData.menuItems.forEach((item, index) => {
                items.push({
                  id: `${menuDoc.id}_${index}`,
                  name: item.menuItemName || item.name || `Menu Item ${index + 1}`,
                  description: item.menuItemDescription || item.description || "Delicious dish",
                  price: item.menuItemPrice || item.price || 0,
                  image: item.menuItemImage || item.image || "https://via.placeholder.com/300x200?text=Dish+Image",
                  category: menuData.categoryName || menuData.category || "Uncategorized",
                  rating: item.rating || 5,
                  available: item.available !== undefined ? item.available : true,
                  originalIndex: items.length,
                });
              });
            } else if (menuData.items && Array.isArray(menuData.items)) {
              menuData.items.forEach((item, index) => {
                items.push({
                  id: `${menuDoc.id}_${index}`,
                  name: item.name || `Item ${index + 1}`,
                  description: item.description || "Delicious dish",
                  price: item.price || 0,
                  image: item.image,
                  category: menuData.categoryName || menuData.category || "Uncategorized",
                  rating: item.rating || 5,
                  available: item.available !== undefined ? item.available : true,
                  originalIndex: items.length,
                });
              });
            } else if (menuData.name || menuData.menuItemName) {
              items.push({
                id: menuDoc.id,
                name: menuData.menuItemName || menuData.name || menuDoc.id,
                description: menuData.menuItemDescription || menuData.description || "Delicious dish",
                price: menuData.menuItemPrice || menuData.price || 0,
                image: menuData.imageUrl || menuData.image,
                category: menuData.categoryName || menuData.category || "Uncategorized",
                rating: menuData.rating || 5,
                available: menuData.available !== undefined ? menuData.available : true,
                originalIndex: items.length,
              });
            }
          });
        }
      } catch (menuError) {
        const sampleItems = [
          { id: "1", name: "Jollof Rice", description: "Traditional Nigerian rice dish", price: 12.99, image: "https://via.placeholder.com/300x200?text=Jollof+Rice", category: "Main Course", rating: 5, available: true, originalIndex: 0 },
          { id: "2", name: "Egusi Soup", description: "Melon seed soup with assorted meat", price: 14.99, image: "https://via.placeholder.com/300x200?text=Egusi+Soup", category: "Main Course", rating: 4, available: false, originalIndex: 1 },
        ];
        setMenuItems(sampleItems);
        setError("Failed to load menu. Showing sample data.");
      }

      if (items.length === 0) {
        const sampleItems = [
          { id: "1", name: "Jollof Rice", description: "Traditional Nigerian rice dish", price: 12.99, image: "https://via.placeholder.com/300x200?text=Jollof+Rice", category: "Main Course", rating: 5, available: true, originalIndex: 0 },
          { id: "2", name: "Egusi Soup", description: "Melon seed soup with assorted meat", price: 14.99, image: "https://via.placeholder.com/300x200?text=Egusi+Soup", category: "Main Course", rating: 4, available: false, originalIndex: 1 },
          { id: "3", name: "Fried Rice", description: "Vegetable fried rice with chicken", price: 11.99, image: "https://via.placeholder.com/300x200?text=Fried+Rice", category: "Main Course", rating: 5, available: true, originalIndex: 2 },
        ];
        setMenuItems(sampleItems);
      } else {
        const sortedItems = items.sort((a, b) => {
          if (a.available === b.available) return a.originalIndex - b.originalIndex;
          return a.available ? -1 : 1;
        });
        setMenuItems(sortedItems);
      }

      try {
        const statusRef = doc(db, "settings", "restaurantStatus");
        const statusSnap = await getDoc(statusRef);
        if (statusSnap.exists()) {
          setIsRestaurantOpen(statusSnap.data().isOpen !== undefined ? statusSnap.data().isOpen : true);
        } else {
          setIsRestaurantOpen(true);
        }
      } catch (statusError) {
        console.error("Error fetching restaurant status:", statusError);
        setIsRestaurantOpen(true);
      }
      setStatusLoading(false);
    } catch (err) {
      setError(`Error loading menu: ${err.message}`);
      setCategories(["All", "Main Course", "Appetizers", "Desserts", "Drinks"]);
      setMenuItems([
        { id: "1", name: "Sample Dish 1", description: "This is a sample dish for testing", price: 9.99, image: "https://via.placeholder.com/300x200?text=Sample+Dish", category: "Main Course", rating: 4, available: true, originalIndex: 0 },
        { id: "2", name: "Sample Dish 2", description: "This dish is currently unavailable", price: 11.99, image: "https://via.placeholder.com/300x200?text=Unavailable", category: "Main Course", rating: 3, available: false, originalIndex: 1 },
      ]);
      setIsRestaurantOpen(true);
      setStatusLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [quantities, setQuantities] = useState({});
  useEffect(() => {
    if (menuItems.length > 0) {
      const initialQuantities = menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {});
      setQuantities(initialQuantities);
    }
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedFilteredItems = [...filteredItems].sort((a, b) => {
    if (a.available === b.available) return a.originalIndex - b.originalIndex;
    return a.available ? -1 : 1;
  });

  const availableCount = sortedFilteredItems.filter((item) => item.available).length;
  const unavailableCount = sortedFilteredItems.filter((item) => !item.available).length;

  const showAlert = (message, type) => {
    setAlert({ message, type, visible: true });
    setTimeout(() => setAlert({ message: "", type: "", visible: false }), 3000);
  };

  const increaseQuantity = (id, isAvailable) => {
    if (!isAvailable || !isRestaurantOpen) return;
    setQuantities((prev) => ({ ...prev, [id]: Math.min(prev[id] + 1, 99) }));
  };

  const decreaseQuantity = (id, isAvailable) => {
    if (!isAvailable || !isRestaurantOpen) return;
    setQuantities((prev) => ({ ...prev, [id]: Math.max(prev[id] - 1, 1) }));
  };

  const handleInputChange = (e, id, isAvailable) => {
    if (!isAvailable || !isRestaurantOpen) return;
    const value = e.target.value;
    if (value === "") {
      setQuantities((prev) => ({ ...prev, [id]: "" }));
      return;
    }
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setQuantities((prev) => ({ ...prev, [id]: Math.min(Math.max(parsedValue, 1), 99) }));
    }
  };

  const handleInputBlur = (id, isAvailable) => {
    if (!isAvailable || !isRestaurantOpen) return;
    setQuantities((prev) => ({ ...prev, [id]: prev[id] === "" || prev[id] < 1 ? 1 : prev[id] }));
  };

  const handleAddToCart = (item) => {
    if (!isRestaurantOpen) {
      showAlert("Restaurant is currently closed. Orders cannot be placed.", "error");
      return;
    }
    if (!item.available) {
      showAlert(`${item.name} is currently not available`, "error");
      return;
    }
    const quantity = quantities[item.id] || 1;
    addToCart(item, quantity);
    showAlert(`${quantity} ${item.name} added to cart!`, "success");
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < rating ? "text-own-2" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.24 3.826a1 1 0 00.95.69h4.016c.969 0 1.371 1.24.588 1.81l-3.248 2.357a1 1 0 00-.364 1.118l1.24 3.826c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.248 2.357c-.785.57-1.84-.197-1.54-1.118l1.24-3.826a1 1 0 00-.364-1.118L2.84 9.253c-.783-.57-.38-1.81.588-1.81h4.016a1 1 0 00.95-.69l1.24-3.826z" />
      </svg>
    ));
  };

  /* ---------- Loading ---------- */
  if (loading || statusLoading) {
    return (
      <>
        <NavBar activeLink="Menu" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
        <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Menu" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />
        <div className="flex justify-center items-center h-screen bg-own-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-white/70">Loading menu items...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ---------- Render ---------- */
  return (
    <>
      <div>
        {alert.visible && (
          <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, visible: false })} />
        )}

        <NavBar activeLink="Menu" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
        <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Menu" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

        {/* Floating cart */}
        <Link
          to="/cart"
          className={`fixed bottom-28 right-5 z-50 ${!isRestaurantOpen ? "pointer-events-none opacity-50" : ""}`}
        >
          <div className="relative bg-own-2 p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
            <FontAwesomeIcon icon={faShoppingCart} className="text-[oklch(29.23%_0_0)]" />
            {getTotalItems() > 0 && (
              <div className="absolute -top-1 -right-1 bg-[oklch(29.23%_0_0)] text-own-2 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg">
                {getTotalItems()}
              </div>
            )}
          </div>
        </Link>

        {/* HERO */}
        <section className="relative h-[60vh] min-h-[300px] overflow-hidden [@media(max-height:500px)]:h-[55vh] [@media(max-height:500px)]:min-h-[220px]">
          <div style={{ backgroundImage: `url(${bg})` }} className="absolute inset-0 bg-center bg-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

          <div className="relative flex items-center justify-center h-full px-4 sm:px-6 [@media(max-height:500px)]:px-3">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center text-white max-w-4xl"
            >
              <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:tracking-[0.2em]">
                Explore
              </span>
              <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl leading-tight mb-4 [@media(max-height:500px)]:text-2xl [@media(max-height:500px)]:mb-1 [@media(max-height:400px)]:text-xl">
                Our <span className="text-own-2">Menu</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 [@media(max-height:500px)]:text-xs">
                A taste of Nigeria's finest dishes, crafted with love
              </p>
            </motion.div>
          </div>
        </section>

        {/* CLOSED BANNER */}
        {!isRestaurantOpen && (
          <div className="max-w-6xl mx-auto mt-6 px-4 [@media(max-height:500px)]:mt-2 [@media(max-height:500px)]:px-2">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-center gap-4 [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:gap-3 [@media(max-height:500px)]:rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 [@media(max-height:500px)]:w-9 [@media(max-height:500px)]:h-9">
                <FontAwesomeIcon icon={faStoreAltSlash} className="text-red-500 text-xl [@media(max-height:500px)]:text-base" />
              </div>
              <div>
                <p className="text-red-700 font-bold [@media(max-height:500px)]:text-sm">Restaurant is currently closed</p>
                <p className="text-red-600 text-sm [@media(max-height:500px)]:text-xs">Orders cannot be placed right now. Please check back later.</p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR BANNER */}
        {error && (
          <div className="max-w-6xl mx-auto mt-4 px-4 [@media(max-height:500px)]:mt-2 [@media(max-height:500px)]:px-2">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 [@media(max-height:500px)]:p-2 [@media(max-height:500px)]:rounded-xl">
              <div className="flex items-start gap-3 [@media(max-height:500px)]:gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0 [@media(max-height:500px)]:h-4 [@media(max-height:500px)]:w-4" />
                <p className="text-sm text-amber-800 [@media(max-height:500px)]:text-xs">
                  {error}. Showing sample data.{" "}
                  <button onClick={fetchData} className="font-semibold underline text-amber-800 hover:text-amber-600">
                    Try again
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH + FILTER */}
        <div className="max-w-6xl mx-auto pt-12 px-4 sm:px-6 lg:px-8 [@media(max-height:600px)]:pt-6 [@media(max-height:500px)]:pt-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 justify-center items-stretch [@media(max-height:500px)]:gap-2"
          >
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm [@media(max-height:500px)]:left-4" />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] shadow-sm [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:pl-10 [@media(max-height:500px)]:text-sm"
              />
            </div>

            <div className="relative md:w-64">
              <FontAwesomeIcon icon={faFilter} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none [@media(max-height:500px)]:left-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-4 rounded-full border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] appearance-none bg-white cursor-pointer shadow-sm font-medium [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:pl-10 [@media(max-height:500px)]:text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>

          <div className="text-center mt-5 text-sm text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:mt-2 [@media(max-height:500px)]:text-xs">
            Showing <span className="font-semibold text-[oklch(29.23%_0_0)]">{sortedFilteredItems.length}</span> item
            {sortedFilteredItems.length !== 1 ? "s" : ""}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
            {availableCount > 0 && unavailableCount > 0 && ` (${availableCount} available, ${unavailableCount} unavailable)`}
            {!isRestaurantOpen && " — Orders disabled"}
          </div>
        </div>

        {/* ITEMS — single grid, no chunking, per-card whileInView animation */}
        <div className="max-w-7xl mx-auto pt-4 pb-16 px-4 sm:px-6 lg:px-8 [@media(max-height:500px)]:pb-8">
          {sortedFilteredItems.length > 0 ? (
            <div className="grid gap-8 pt-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [@media(max-height:600px)]:gap-4 [@media(max-height:600px)]:pt-4 [@media(max-height:500px)]:gap-3 [@media(max-height:500px)]:pt-3">
              {sortedFilteredItems.map((item, itemIndex) => {
                const disabled = !item.available || !isRestaurantOpen;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      delay: (itemIndex % 3) * 0.1,
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                    className={`bg-white rounded-3xl shadow-lg overflow-hidden border-2 transition-all duration-300 [@media(max-height:500px)]:rounded-2xl ${
                      disabled
                        ? "opacity-70 cursor-not-allowed border-transparent"
                        : "hover:scale-[1.02] border-transparent hover:border-own-2/30 hover:shadow-xl"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-60 object-cover transition-transform duration-500 hover:scale-105 [@media(max-height:500px)]:h-40"
                      />
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-white text-sm font-bold bg-red-600 px-4 py-2 rounded-full uppercase tracking-widest [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:px-2 [@media(max-height:500px)]:py-1">
                            Not Available
                          </span>
                        </div>
                      )}
                      {!isRestaurantOpen && item.available && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-white text-sm font-bold bg-[oklch(29.23%_0_0)] px-4 py-2 rounded-full uppercase tracking-widest [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:px-2 [@media(max-height:500px)]:py-1">
                            Orders Closed
                          </span>
                        </div>
                      )}
                      {/* Rating badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md [@media(max-height:500px)]:top-2 [@media(max-height:500px)]:right-2">
                        <FontAwesomeIcon icon={faStar} className="text-own-2 text-xs" />
                        <span className="text-xs font-bold text-[oklch(29.23%_0_0)]">{item.rating}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 [@media(max-height:500px)]:p-4">
                      <h3 className={`text-xl font-bold mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1 ${disabled ? "text-gray-500" : "text-[oklch(29.23%_0_0)]"}`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm mb-3 line-clamp-2 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mb-2 ${disabled ? "text-gray-400" : "text-[oklch(40%_0.05_100)]"}`}>
                        {item.description}
                      </p>

                      <div className="flex items-center mb-3 [@media(max-height:500px)]:mb-2">
                        {renderStars(item.rating)}
                      </div>

                      <div className="mb-4 [@media(max-height:500px)]:mb-2">
                        <span
                          className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full [@media(max-height:500px)]:text-[9px] [@media(max-height:500px)]:px-2 [@media(max-height:500px)]:py-0.5 ${
                            !item.available
                              ? "bg-red-100 text-red-700"
                              : isRestaurantOpen
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${!item.available ? "bg-red-500" : isRestaurantOpen ? "bg-green-500" : "bg-amber-500"}`} />
                          {!item.available ? "Not Available" : isRestaurantOpen ? "Available" : "Orders Paused"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-5 [@media(max-height:500px)]:mb-3">
                        <div className="flex items-center gap-2 [@media(max-height:500px)]:gap-1">
                          <button
                            onClick={() => decreaseQuantity(item.id, item.available)}
                            className={`p-2 rounded-full transition [@media(max-height:500px)]:p-1.5 ${
                              disabled
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-own-2 text-[oklch(29.23%_0_0)] hover:bg-[oklch(85%_0.171_83.42)]"
                            }`}
                            disabled={disabled}
                          >
                            <FontAwesomeIcon icon={faMinus} className="text-xs" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={disabled ? 0 : quantities[item.id] || 1}
                            onChange={(e) => handleInputChange(e, item.id, item.available)}
                            onBlur={() => handleInputBlur(item.id, item.available)}
                            className={`w-14 text-center p-2 border-2 rounded-xl font-bold [@media(max-height:500px)]:w-10 [@media(max-height:500px)]:p-1 [@media(max-height:500px)]:text-sm ${
                              disabled
                                ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed"
                                : "text-[oklch(29.23%_0_0)] border-gray-200 focus:border-own-2 focus:outline-none"
                            }`}
                            disabled={disabled}
                            readOnly={disabled}
                          />
                          <button
                            onClick={() => increaseQuantity(item.id, item.available)}
                            className={`p-2 rounded-full transition [@media(max-height:500px)]:p-1.5 ${
                              disabled
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-own-2 text-[oklch(29.23%_0_0)] hover:bg-[oklch(85%_0.171_83.42)]"
                            }`}
                            disabled={disabled}
                          >
                            <FontAwesomeIcon icon={faPlus} className="text-xs" />
                          </button>
                        </div>
                        <span className={`text-xl font-black [@media(max-height:500px)]:text-base ${disabled ? "text-gray-500" : "text-[oklch(29.23%_0_0)]"}`}>
                          £{(item.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`w-full py-3.5 rounded-full font-bold tracking-wide transition-all [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm ${
                          disabled
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] shadow-md hover:shadow-[oklch(79.58%_0.171_83.42)/40]"
                        }`}
                        disabled={disabled}
                      >
                        {!item.available ? "Unavailable" : !isRestaurantOpen ? "Closed" : "Add to Cart"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 [@media(max-height:500px)]:py-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center [@media(max-height:500px)]:w-14 [@media(max-height:500px)]:h-14 [@media(max-height:500px)]:mb-3">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-3xl [@media(max-height:500px)]:text-xl" />
              </div>
              <p className="text-xl font-semibold text-[oklch(29.23%_0_0)] mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">No dishes found</p>
              <p className="text-[oklch(40%_0.05_100)] mb-6 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-3">Try adjusting your search or category filter</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-3 rounded-full transition-colors [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}