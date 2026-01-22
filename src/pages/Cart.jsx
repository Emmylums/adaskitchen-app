import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from 'framer-motion';
import { useCart } from "../context/CartContext"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faPlus, faTrashCan, faArrowLeft, faBan, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import AlertBanner from "../components/AlertBanner";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx"; 
import bg from "../assets/background.jpeg";
// Firebase imports
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust this path

export default function Cart() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const { cart, getTotalQuantity, updateQuantity, removeFromCart, addToCart, clearCart, savePendingCart } = useCart();
  const [alert, setAlert] = useState(null);
  const [menuDishes, setMenuDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  const navigate = useNavigate();


  const handleCheckoutRedirect = () => {
    if (availableCartItems.length === 0) return;
    
    // Save current cart as pending transfer using CartContext
    const saveSuccess = savePendingCart(cart);
    
    if (saveSuccess) {
      // Redirect to login with checkout as destination
      // window.location.href = `/login?redirect=${encodeURIComponent('/user/checkout')}`;
      // OR if using React Router navigate:
      navigate(`/login?redirect=${encodeURIComponent('/user/checkout')}`);
    } else {
      setAlert({ 
        message: 'Failed to save cart. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  // Fetch dishes from Firebase menus collection
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "menus"));
        const dishesArray = [];
        
        querySnapshot.forEach((doc) => {
          const dishData = doc.data();
          
          // Map Firebase document fields to your expected structure
          dishesArray.push({
            id: doc.id,
            name: dishData.name || dishData.menuItemName || `Dish ${doc.id}`,
            description: dishData.description || dishData.menuItemDescription || "Delicious dish",
            price: dishData.price || dishData.menuItemPrice || 0,
            image: dishData.image || dishData.imageUrl || "default-image.jpg",
            category: dishData.category || dishData.categoryName || "Uncategorized",
            rating: dishData.rating || 5,
            available: dishData.available !== undefined ? dishData.available : true,
            originalIndex: dishesArray.length
          });
        });
        
        setMenuDishes(dishesArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching menu items: ", err);
        setError("Failed to load menu items. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, []);

  const handleQuantityChange = (id, newQuantity) => {
    updateQuantity(id, newQuantity);
    setAlert({ message: 'Quantity updated', type: 'success' });
    setTimeout(() => setAlert(null), 2000);
  };

  const handleRemoveFromCart = (id, name) => {
    removeFromCart(id);
    setAlert({ message: `${name} removed from cart`, type: 'success' });
    setTimeout(() => setAlert(null), 2000);
  };

  const handleAddToCart = (dish) => {
    if (!dish.available) {
      setAlert({ 
        message: `${dish.name} is currently unavailable`, 
        type: 'error' 
      });
      setTimeout(() => setAlert(null), 2000);
      return;
    }
    addToCart(dish);
    setAlert({ message: `${dish.name} added to cart!`, type: 'success' });
    setTimeout(() => setAlert(null), 2000);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      // Check if item is still available
      const dishDetails = menuDishes.find(dish => dish.id === item.id);
      if (dishDetails && !dishDetails.available) return total;
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateDelivery = () => {
    return calculateSubtotal() > 5000 ? 0 : 800;
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  // Filter related dishes from Firebase data (only available ones)
  const relatedDishes = menuDishes
    .filter(dish => dish.available && !cart.some(cartItem => cartItem.id === dish.id))
    .slice(0, 4);

  // Separate cart items into available and unavailable
  const availableCartItems = [];
  const unavailableCartItems = [];
  
  cart.forEach(item => {
    const dishDetails = menuDishes.find(dish => dish.id === item.id);
    if (dishDetails && !dishDetails.available) {
      unavailableCartItems.push({ ...item, available: false });
    } else {
      availableCartItems.push({ ...item, available: true });
    }
  });

  // Combine with unavailable items at the bottom
  const sortedCartItems = [...availableCartItems, ...unavailableCartItems];

  return (
    <>
      {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <NavBar activeLink="Cart" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Cart" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      {/* Hero Section */}
      <section style={{ backgroundImage: `url(${bg})` }} className="relative h-[40vh] bg-center bg-cover">
        <div className="absolute inset-0 h-[40vh] opacity-70 bg-black" />
        <div className="relative flex items-center justify-center h-full">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
            <div className="p-10 text-center text-white mt-10">
              <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg">Your Cart</h2>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {cart.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faCartShopping} className="text-own-2 text-6xl mb-6 opacity-80"/>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Browse our mouthwatering dishes and treat yourself to something special!
            </p>
            <Link to="/menu">
              <button className="px-8 py-4 bg-own-2 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors flex items-center mx-auto">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Browse Menu
              </button>
            </Link>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-own-2">
                    Your Order ({getTotalQuantity()} items)
                    {unavailableCartItems.length > 0 && (
                      <span className="text-sm font-normal text-red-600 ml-2">
                        ({unavailableCartItems.length} unavailable)
                      </span>
                    )}
                  </h2>
                  <button 
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                {/* Warning banner for unavailable items */}
                {unavailableCartItems.length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <p className="text-yellow-800 font-medium">
                          {unavailableCartItems.length} item{unavailableCartItems.length > 1 ? 's are' : ' is'} currently unavailable
                        </p>
                        <p className="text-yellow-700 text-sm mt-1">
                          These items have been moved to the bottom and cannot be modified. 
                          You can remove them or wait for them to become available again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {sortedCartItems.map(item => {
                    // Find the current dish details from Firebase data
                    const dishDetails = menuDishes.find(dish => dish.id === item.id);
                    const isAvailable = dishDetails ? dishDetails.available : true;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center gap-6 pb-6 border-b border-gray-100 last:border-0 ${!isAvailable ? 'opacity-60' : ''}`}
                      >
                        <div className="relative">
                          <img 
                            src={item.image || dishDetails?.image || "default-image.jpg"} 
                            alt={item.name} 
                            className={`w-20 h-20 object-cover rounded-xl border-2 flex-shrink-0 ${
                              isAvailable ? 'border-own-2' : 'border-gray-300'
                            }`}
                          />
                          {!isAvailable && (
                            <div className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-xl flex items-center justify-center">
                              <FontAwesomeIcon icon={faBan} className="text-white text-sm" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className={`text-lg font-semibold mb-1 truncate ${
                              isAvailable ? 'text-own-2' : 'text-gray-500'
                            }`}>
                              {item.name}
                            </h3>
                            {!isAvailable && (
                              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                Unavailable
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">£{(item.price).toFixed(2)} each</p>
                          <p className={`text-lg font-bold ${isAvailable ? 'text-own-2' : 'text-gray-500 line-through'}`}>
                            £{(item.price * item.quantity).toFixed(2)}
                            {!isAvailable && (
                              <span className="text-sm font-normal text-red-600 ml-2">Not included in total</span>
                            )}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          {isAvailable ? (
                            <>
                              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity === 1}
                                  className={`w-8 h-8 rounded-full transition ${
                                    item.quantity === 1
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-own-2 text-white hover:bg-amber-600"
                                  }`}
                                >
                                  −
                                </button>

                                <span className="w-8 text-center font-semibold text-black">{item.quantity}</span>

                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-own-2 text-white hover:bg-amber-600 transition"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveFromCart(item.id, item.name)}
                                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                                Remove
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 opacity-50">
                                <button
                                  disabled
                                  className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 cursor-not-allowed"
                                >
                                  −
                                </button>

                                <span className="w-8 text-center font-semibold text-gray-500">{item.quantity}</span>

                                <button
                                  disabled
                                  className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 cursor-not-allowed"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveFromCart(item.id, item.name)}
                                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Related Dishes (only available ones) */}
              {!loading && relatedDishes.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-own-2 mb-4">You might also like</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedDishes.map(dish => (
                      <div key={dish.id} className="text-center group">
                        <img 
                          src={dish.image || "default-image.jpg"} 
                          alt={dish.name} 
                          className="w-full h-20 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                        />
                        <h4 className="text-sm font-semibold text-own-2 mb-1 truncate">{dish.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">£{(dish.price).toFixed(2)}</p>
                        <button
                          onClick={() => handleAddToCart(dish)}
                          className="text-xs bg-own-2 text-white px-3 py-1 rounded-full hover:bg-amber-600 transition-colors"
                        >
                          Add +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state for related dishes */}
              {loading && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-own-2 mb-4">You might also like</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="text-center">
                        <div className="w-full h-20 bg-gray-200 rounded-xl mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-2 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error state for related dishes */}
              {error && !loading && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-own-2 mb-4">You might also like</h3>
                  <p className="text-gray-500 text-center py-4">{error}</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-own-2 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6 text-black">
                  <div className="flex justify-between">
                    <span>Subtotal ({availableCartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>£{(calculateSubtotal()).toFixed(2)}</span>
                  </div>
                  
                  {unavailableCartItems.length > 0 && (
                    <div className="flex justify-between text-red-600 text-sm">
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 text-xs" />
                        {unavailableCartItems.length} unavailable item{unavailableCartItems.length > 1 ? 's' : ''}
                      </span>
                      <span>£0.00</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-own-2">£{(calculateTotal()).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-6">
                  <p>✓ Orders prepared fresh daily</p>
                  {unavailableCartItems.length > 0 && (
                    <p className="text-red-600 mt-2">
                      ⚠ Unavailable items are excluded from the total
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => handleCheckoutRedirect()}
                  className={`w-full py-4 font-bold rounded-xl transition-colors shadow-md ${
                    availableCartItems.length > 0
                      ? 'bg-own-2 text-white hover:bg-amber-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={availableCartItems.length === 0}
                >
                  {availableCartItems.length > 0 
                    ? 'Proceed to Checkout' 
                    : 'Add available items to checkout'}
                </button>

                <Link to="/menu">
                  <button className="w-full py-3 border border-own-2 text-own-2 font-bold rounded-xl hover:bg-gray-50 transition-colors mt-3">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer/>
    </>
  );
}