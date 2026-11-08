import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faPlus,
  faMinus,
  faTrashCan,
  faArrowLeft,
  faArrowRight,
  faBan,
  faExclamationTriangle,
  faStoreAltSlash,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import AlertBanner from "../components/AlertBanner";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import bg from "../assets/bgcont.jpeg";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Cart() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const { cart, getTotalQuantity, updateQuantity, removeFromCart, addToCart, clearCart, savePendingCart } = useCart();
  const [alert, setAlert] = useState(null);
  const [menuDishes, setMenuDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);

  const navigate = useNavigate();

  /* ---------- Fetch (verbatim) ---------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
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

        const querySnapshot = await getDocs(collection(db, "menus"));
        const dishesArray = [];
        querySnapshot.forEach((doc) => {
          const dishData = doc.data();
          dishesArray.push({
            id: doc.id,
            name: dishData.name || dishData.menuItemName || `Dish ${doc.id}`,
            description: dishData.description || dishData.menuItemDescription || "Delicious dish",
            price: dishData.price || dishData.menuItemPrice || 0,
            image: dishData.image || dishData.imageUrl || "default-image.jpg",
            category: dishData.category || dishData.categoryName || "Uncategorized",
            rating: dishData.rating || 5,
            available: dishData.available !== undefined ? dishData.available : true,
            originalIndex: dishesArray.length,
          });
        });
        setMenuDishes(dishesArray);
      } catch (err) {
        console.error("Error fetching data: ", err);
        setError("Failed to load cart data. Please try again.");
        setIsRestaurantOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCheckoutRedirect = () => {
    if (availableCartItems.length === 0) return;
    if (!isRestaurantOpen) {
      setAlert({ message: "Restaurant is closed. Checkout is disabled.", type: "error" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    const saveSuccess = savePendingCart(cart);
    if (saveSuccess) {
      navigate(`/login?redirect=${encodeURIComponent("/user/checkout")}`);
    } else {
      setAlert({ message: "Failed to save cart. Please try again.", type: "error" });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (!isRestaurantOpen) {
      setAlert({ message: "Cannot update cart while restaurant is closed.", type: "error" });
      setTimeout(() => setAlert(null), 2000);
      return;
    }
    updateQuantity(id, newQuantity);
    setAlert({ message: "Quantity updated", type: "success" });
    setTimeout(() => setAlert(null), 2000);
  };

  const handleRemoveFromCart = (id, name) => {
    removeFromCart(id);
    setAlert({ message: `${name} removed from cart`, type: "success" });
    setTimeout(() => setAlert(null), 2000);
  };

  const handleAddToCart = (dish) => {
    if (!isRestaurantOpen) {
      setAlert({ message: "Restaurant is closed. Cannot add items.", type: "error" });
      setTimeout(() => setAlert(null), 2000);
      return;
    }
    if (!dish.available) {
      setAlert({ message: `${dish.name} is currently unavailable`, type: "error" });
      setTimeout(() => setAlert(null), 2000);
      return;
    }
    addToCart(dish);
    setAlert({ message: `${dish.name} added to cart!`, type: "success" });
    setTimeout(() => setAlert(null), 2000);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const dishDetails = menuDishes.find((dish) => dish.id === item.id);
      if (dishDetails && !dishDetails.available) return total;
      return total + item.price * item.quantity;
    }, 0);
  };

  const calculateTotal = () => calculateSubtotal();

  const relatedDishes = menuDishes
    .filter((dish) => dish.available && !cart.some((cartItem) => cartItem.id === dish.id))
    .slice(0, 4);

  const availableCartItems = [];
  const unavailableCartItems = [];
  cart.forEach((item) => {
    const dishDetails = menuDishes.find((dish) => dish.id === item.id);
    if (dishDetails && !dishDetails.available) {
      unavailableCartItems.push({ ...item, available: false });
    } else {
      availableCartItems.push({ ...item, available: true });
    }
  });
  const sortedCartItems = [...availableCartItems, ...unavailableCartItems];

  /* ---------- Loading ---------- */
  if (loading || statusLoading) {
    return (
      <>
        <NavBar activeLink="Cart" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
        <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Cart" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />
        <div className="flex justify-center items-center h-screen bg-own-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-white/70">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ---------- Render ---------- */
  return (
    <>
      {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <NavBar activeLink="Cart" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Cart" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      {/* HERO */}
      <section className="relative h-[50vh] min-h-[280px] overflow-hidden [@media(max-height:500px)]:h-[45vh] [@media(max-height:500px)]:min-h-[200px]">
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
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Your Order
            </span>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-tight [@media(max-height:500px)]:text-2xl [@media(max-height:400px)]:text-xl">
              Shopping <span className="text-own-2">Cart</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 [@media(max-height:600px)]:py-6 [@media(max-height:500px)]:py-4">
        {/* Closed banner */}
        {!isRestaurantOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 [@media(max-height:500px)]:mb-4 [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:rounded-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 [@media(max-height:500px)]:w-9 [@media(max-height:500px)]:h-9">
              <FontAwesomeIcon icon={faStoreAltSlash} className="text-red-500 text-xl [@media(max-height:500px)]:text-base" />
            </div>
            <div>
              <p className="text-red-700 font-bold [@media(max-height:500px)]:text-sm">Restaurant is currently closed</p>
              <p className="text-red-600 text-sm mt-1 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mt-0.5">
                Orders cannot be placed. You can still review your cart, but checkout is disabled.
              </p>
            </div>
          </motion.div>
        )}

        {cart.length === 0 ? (
          /* ---------- Empty state ---------- */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20 [@media(max-height:500px)]:py-10"
          >
            <div className="relative inline-block mb-8 [@media(max-height:500px)]:mb-4">
              <div className="absolute inset-0 bg-own-2/30 blur-3xl rounded-full scale-150" />
              <div className="relative w-28 h-28 mx-auto bg-own-2 rounded-full flex items-center justify-center shadow-2xl [@media(max-height:500px)]:w-20 [@media(max-height:500px)]:h-20">
                <FontAwesomeIcon icon={faCartShopping} className="text-[oklch(29.23%_0_0)] text-5xl [@media(max-height:500px)]:text-3xl" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[oklch(29.23%_0_0)] font-display mb-3 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
              Your cart is empty
            </h3>
            <p className="text-[oklch(40%_0.05_100)] mb-8 max-w-md mx-auto [@media(max-height:500px)]:mb-4 [@media(max-height:500px)]:text-sm">
              Browse our mouthwatering dishes and treat yourself to something special!
            </p>
            <Link to="/menu">
              <button className="inline-flex items-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-bold px-8 py-4 rounded-full tracking-wide shadow-lg transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                Browse Menu
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 [@media(max-height:500px)]:gap-4">
            {/* ---------- Cart items ---------- */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden [@media(max-height:500px)]:rounded-2xl">
                <div className="h-1.5 bg-gradient-to-r from-own-2 via-[oklch(85%_0.171_83.42)] to-own-2" />
                <div className="p-6 md:p-8 [@media(max-height:600px)]:p-4 [@media(max-height:500px)]:p-3">
                  <div className="flex justify-between items-center mb-6 [@media(max-height:500px)]:mb-3">
                    <h2 className="text-xl md:text-2xl font-bold text-[oklch(29.23%_0_0)] font-display [@media(max-height:500px)]:text-base">
                      Your Order ({getTotalQuantity()} {getTotalQuantity() === 1 ? "item" : "items"})
                      {unavailableCartItems.length > 0 && (
                        <span className="text-sm font-normal text-red-600 ml-2 [@media(max-height:500px)]:text-xs">
                          ({unavailableCartItems.length} unavailable)
                        </span>
                      )}
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors [@media(max-height:500px)]:text-xs"
                    >
                      Clear Cart
                    </button>
                  </div>

                  {unavailableCartItems.length > 0 && (
                    <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-2 [@media(max-height:500px)]:rounded-xl">
                      <div className="flex items-start gap-3 [@media(max-height:500px)]:gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 mt-0.5 flex-shrink-0 [@media(max-height:500px)]:text-xs" />
                        <div>
                          <p className="text-amber-800 font-semibold text-sm [@media(max-height:500px)]:text-xs">
                            {unavailableCartItems.length} item{unavailableCartItems.length > 1 ? "s are" : " is"} currently unavailable
                          </p>
                          <p className="text-amber-700 text-xs mt-1 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:mt-0.5">
                            These items have been moved to the bottom and cannot be modified. You can remove them or wait for them to become available again.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 [@media(max-height:500px)]:space-y-2">
                    {sortedCartItems.map((item) => {
                      const dishDetails = menuDishes.find((dish) => dish.id === item.id);
                      const isAvailable = dishDetails ? dishDetails.available : true;
                      const canModify = isAvailable && isRestaurantOpen;

                      return (
                        <div
                          key={item.id}
                          className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border-2 transition-colors [@media(max-height:500px)]:p-2 [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:rounded-xl ${
                            isAvailable ? "border-gray-100 hover:border-own-2/30" : "border-red-100 opacity-70"
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={item.image || dishDetails?.image || "default-image.jpg"}
                              alt={item.name}
                              className={`w-20 h-20 object-cover rounded-2xl border-2 [@media(max-height:500px)]:w-14 [@media(max-height:500px)]:h-14 [@media(max-height:500px)]:rounded-xl ${
                                isAvailable ? "border-own-2" : "border-gray-300"
                              }`}
                            />
                            {!isAvailable && (
                              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-sm [@media(max-height:500px)]:rounded-xl">
                                <FontAwesomeIcon icon={faBan} className="text-white text-sm" />
                              </div>
                            )}
                            {!isRestaurantOpen && isAvailable && (
                              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-sm [@media(max-height:500px)]:rounded-xl">
                                <FontAwesomeIcon icon={faStoreAltSlash} className="text-white text-sm" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className={`text-lg font-bold truncate [@media(max-height:500px)]:text-sm ${isAvailable ? "text-[oklch(29.23%_0_0)]" : "text-gray-500"}`}>
                                {item.name}
                              </h3>
                              {!isAvailable && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                  Unavailable
                                </span>
                              )}
                              {!isRestaurantOpen && isAvailable && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                  Orders Paused
                                </span>
                              )}
                            </div>
                            <p className="text-[oklch(40%_0.05_100)] text-sm mb-1 [@media(max-height:500px)]:text-xs">
                              £{(item.price || 0).toFixed(2)} each
                            </p>
                            <p className={`text-lg font-black [@media(max-height:500px)]:text-base ${isAvailable ? "text-[oklch(29.23%_0_0)]" : "text-gray-500 line-through"}`}>
                              £{((item.price || 0) * item.quantity).toFixed(2)}
                              {!isAvailable && (
                                <span className="text-xs font-normal text-red-600 ml-2 no-underline">
                                  Not included
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-end [@media(max-height:500px)]:gap-2">
                            {canModify ? (
                              <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 [@media(max-height:500px)]:gap-1">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity === 1}
                                  className={`w-8 h-8 rounded-full transition [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6 ${
                                    item.quantity === 1
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                      : "bg-own-2 text-[oklch(29.23%_0_0)] hover:bg-[oklch(85%_0.171_83.42)]"
                                  }`}
                                >
                                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                                </button>
                                <span className="w-8 text-center font-bold text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-own-2 text-[oklch(29.23%_0_0)] hover:bg-[oklch(85%_0.171_83.42)] transition [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6"
                                >
                                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 opacity-50">
                                <button disabled className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 cursor-not-allowed [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6">
                                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                                </button>
                                <span className="w-8 text-center font-bold text-gray-500 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:text-sm">{item.quantity}</span>
                                <button disabled className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 cursor-not-allowed [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6">
                                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => handleRemoveFromCart(item.id, item.name)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 transition-colors [@media(max-height:500px)]:text-[10px]"
                            >
                              <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Related dishes */}
              {!loading && relatedDishes.length > 0 && (
                <div className="mt-6 bg-white rounded-3xl shadow-lg overflow-hidden [@media(max-height:500px)]:mt-3 [@media(max-height:500px)]:rounded-2xl">
                  <div className="p-6 md:p-8 [@media(max-height:500px)]:p-3">
                    <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-5 font-display [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-3">
                      You might also like
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 [@media(max-height:500px)]:gap-2">
                      {relatedDishes.map((dish) => (
                        <div key={dish.id} className="group">
                          <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:mb-1.5">
                            <img
                              src={dish.image || "default-image.jpg"}
                              alt={dish.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <h4 className="text-sm font-bold text-[oklch(29.23%_0_0)] mb-1 truncate [@media(max-height:500px)]:text-xs">
                            {dish.name}
                          </h4>
                          <p className="text-xs font-semibold text-[oklch(40%_0.05_100)] mb-2 [@media(max-height:500px)]:mb-1">
                            £{(dish.price || 0).toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleAddToCart(dish)}
                            disabled={!isRestaurantOpen}
                            className={`text-xs w-full px-3 py-2 rounded-full font-semibold transition-colors [@media(max-height:500px)]:py-1.5 [@media(max-height:500px)]:text-[10px] ${
                              isRestaurantOpen
                                ? "bg-own-2 text-[oklch(29.23%_0_0)] hover:bg-[oklch(85%_0.171_83.42)]"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {isRestaurantOpen ? "Add +" : "Closed"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="mt-6 bg-white rounded-3xl shadow-lg p-6 md:p-8">
                  <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-5">You might also like</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="text-center">
                        <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-3 animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto mb-2 animate-pulse"></div>
                        <div className="h-8 bg-gray-100 rounded-full w-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && !loading && (
                <div className="mt-6 bg-white rounded-3xl shadow-lg p-6 md:p-8">
                  <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-4">You might also like</h3>
                  <p className="text-[oklch(40%_0.05_100)] text-center py-4">{error}</p>
                </div>
              )}
            </div>

            {/* ---------- Order summary ---------- */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden sticky top-6 [@media(max-height:500px)]:rounded-2xl">
                <div className="h-1.5 bg-gradient-to-r from-own-2 via-[oklch(85%_0.171_83.42)] to-own-2" />
                <div className="p-6 md:p-8 [@media(max-height:600px)]:p-4 [@media(max-height:500px)]:p-3">
                  <h2 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-6 font-display [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-3">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-6 text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:space-y-2 [@media(max-height:500px)]:mb-3">
                    <div className="flex justify-between text-sm [@media(max-height:500px)]:text-xs">
                      <span>
                        Subtotal ({availableCartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                      </span>
                      <span className="font-semibold text-[oklch(29.23%_0_0)]">
                        £{calculateSubtotal().toFixed(2)}
                      </span>
                    </div>

                    {unavailableCartItems.length > 0 && (
                      <div className="flex justify-between text-red-600 text-sm [@media(max-height:500px)]:text-xs">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                          {unavailableCartItems.length} unavailable item{unavailableCartItems.length > 1 ? "s" : ""}
                        </span>
                        <span>£0.00</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4 mt-4 [@media(max-height:500px)]:pt-2 [@media(max-height:500px)]:mt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-base">Total</span>
                        <span className="text-2xl font-black text-own-2 [@media(max-height:500px)]:text-xl">
                          £{calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-[oklch(40%_0.05_100)] mb-6 space-y-1.5 [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:space-y-1 [@media(max-height:500px)]:text-[10px]">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Orders prepared fresh daily
                    </p>
                    {unavailableCartItems.length > 0 && (
                      <p className="flex items-center gap-2 text-red-600">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        Unavailable items are excluded from the total
                      </p>
                    )}
                    {!isRestaurantOpen && (
                      <p className="flex items-center gap-2 text-red-600 font-semibold">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        Restaurant is currently closed – checkout disabled
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleCheckoutRedirect}
                    className={`w-full py-4 font-bold rounded-full transition-all duration-300 tracking-wide [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm ${
                      availableCartItems.length > 0 && isRestaurantOpen
                        ? "bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={availableCartItems.length === 0 || !isRestaurantOpen}
                  >
                    {!isRestaurantOpen
                      ? "Restaurant Closed"
                      : availableCartItems.length > 0
                      ? "Proceed to Checkout"
                      : "Add available items to checkout"}
                  </button>

                  <Link to="/menu">
                    <button className="w-full py-3 border-2 border-own-2 text-own-2 font-bold rounded-full hover:bg-amber-50 transition-colors mt-3 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:mt-2 [@media(max-height:500px)]:text-sm">
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}