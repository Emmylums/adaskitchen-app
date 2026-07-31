import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { useCart } from "../../context/CartContext"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCartShopping, 
  faPlus, 
  faTrashCan, 
  faArrowLeft, 
  faBan, 
  faExclamationTriangle, 
  faStoreAltSlash 
} from "@fortawesome/free-solid-svg-icons";
import AlertBanner from "../../components/AlertBanner";
import UserNavBar from "../components/UserNavbar"; 
import { useUserData } from "../hooks/useUserData";
import UserSideBar from "../components/UserSidebar";
import { getDocs, collection, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function Cart() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Cart");
  
  const { cart, getTotalQuantity, updateQuantity, removeFromCart, addToCart, clearCart } = useCart();
  const [alert, setAlert] = useState(null);
  const [menuDishes, setMenuDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const { userData, loading: userLoading } = useUserData();

  // Fetch restaurant status and menu items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch restaurant status
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

        // 2. Fetch menu items (ALL for availability checks)
        const menusCollection = collection(db, "menus");
        const allItemsQuery = query(menusCollection, orderBy("name"));
        const querySnapshot = await getDocs(allItemsQuery);
        const dishesArray = [];
        querySnapshot.forEach((doc) => {
          const dishData = doc.data();
          dishesArray.push({
            id: doc.id,
            name: dishData.name || dishData.menuItemName || `Dish ${doc.id}`,
            description: dishData.description || dishData.menuItemDescription || "Delicious dish",
            price: dishData.price || dishData.menuItemPrice || 0,
            image: dishData.image || dishData.imageUrl || dishData.img || "/images/fallback-food.jpg",
            category: dishData.category || dishData.categoryName || "Uncategorized",
            rating: dishData.rating || 5,
            stock: dishData.stock || dishData.quantity || 100,
            available: dishData.available !== undefined ? dishData.available : true
          });
        });
        setMenuDishes(dishesArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching data: ", err);
        setError("Failed to load cart data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDishDetails = (itemId) => {
    return menuDishes.find(dish => dish.id === itemId);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (!isRestaurantOpen) {
      setAlert({ message: "Cannot update cart while restaurant is closed.", type: "error" });
      setTimeout(() => setAlert(null), 2000);
      return;
    }
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
    if (!isRestaurantOpen) {
      setAlert({ message: "Restaurant is closed. Cannot add items.", type: "error" });
      setTimeout(() => setAlert(null), 2000);
      return;
    }
    if (!dish.available) {
      setAlert({ message: `${dish.name} is currently unavailable`, type: 'error' });
      setTimeout(() => setAlert(null), 2000);
      return;
    }
    addToCart(dish);
    setAlert({ message: `${dish.name} added to cart!`, type: 'success' });
    setTimeout(() => setAlert(null), 2000);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const dishDetails = getDishDetails(item.id);
      if (dishDetails && !dishDetails.available) return total;
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Delivery is not available – only pickup.
  // Original delivery fee logic (commented out):
  // const calculateDelivery = () => {
  //   return calculateSubtotal() > 200 ? 0 : 8.99;
  // };
  const calculateDelivery = () => {
    return 0; // No delivery fee for pickup
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDelivery();
  };

  const relatedDishes = menuDishes
    .filter(dish => dish.available && !cart.some(cartItem => cartItem.id === dish.id))
    .slice(0, 4);

  const availableCartItems = [];
  const unavailableCartItems = [];
  cart.forEach(item => {
    const dishDetails = getDishDetails(item.id);
    if (dishDetails && !dishDetails.available) {
      unavailableCartItems.push({ ...item, available: false });
    } else {
      availableCartItems.push({ ...item, available: true });
    }
  });
  const sortedCartItems = [...availableCartItems, ...unavailableCartItems];

  const getAvailableQuantity = () => {
    return availableCartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading || statusLoading || userLoading) {
    return (
      <>
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen} userData={userData} />
        <UserSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userData={userData} setActiveTab={setActiveTab} activeTab={activeTab} />
        <div className="lg:flex lg:justify-end">
          <div className={`pt-32 px-5 ${isSidebarOpen ? "lg:w-[75%]" : "lg:w-full"} transition-all duration-500`}>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen} userData={userData} />
      <UserSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userData={userData} setActiveTab={setActiveTab} activeTab={activeTab} />
      
      <div className="lg:flex lg:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "lg:w-[75%]" : "lg:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <h3 className="text-own-2 mb-6 uppercase font-bold text-2xl font-display2 tracking-wider">Cart</h3>
                
                {/* Restaurant closed banner */}
                {!isRestaurantOpen && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <FontAwesomeIcon icon={faStoreAltSlash} className="text-red-500 text-2xl mr-3" />
                    <div>
                      <p className="text-red-700 font-semibold">Restaurant is currently closed</p>
                      <p className="text-red-600 text-sm">Orders cannot be placed. You can still review your cart, but checkout is disabled.</p>
                    </div>
                  </div>
                )}

                <div className="max-w-7xl mx-auto pt-5 pb-12">
                  {cart.length === 0 ? (
                    <div className="text-center py-16">
                      <FontAwesomeIcon icon={faCartShopping} className="text-own-2 text-6xl mb-6 opacity-80"/>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Browse our mouthwatering dishes and treat yourself to something special!
                      </p>
                      <Link to="/user/Menu">
                        <button className="px-8 py-4 bg-own-2 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors flex items-center mx-auto">
                          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                          Browse Menu
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Cart Items */}
                      <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-own-2">
                              Your Order ({getTotalQuantity()} items)
                              {unavailableCartItems.length > 0 && (
                                <span className="text-sm font-normal text-red-600 ml-2">
                                  ({unavailableCartItems.length} unavailable)
                                </span>
                              )}
                            </h2>
                            <button 
                              onClick={clearCart}
                              className="text-red-500 hover:text-red-700 text-xs md:text-sm font-medium"
                            >
                              Clear Cart
                            </button>
                          </div>

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
                              const dishDetails = getDishDetails(item.id);
                              const isAvailable = dishDetails ? dishDetails.available : true;
                              const itemStock = dishDetails?.stock || item.stock || 100;
                              const canModify = isAvailable && isRestaurantOpen;
                              
                              return (
                                <div key={item.id} className={`flex items-center gap-6 pb-6 border-b border-gray-100 last:border-0 ${!isAvailable ? 'opacity-60' : ''}`}>
                                  <div className="relative">
                                    <img 
                                      src={dishDetails?.image || item.image || item.imageUrl || "/images/fallback-food.jpg"} 
                                      alt={item.name} 
                                      className={`w-20 h-20 object-cover rounded-xl border-2 flex-shrink-0 ${
                                        isAvailable ? 'border-own-2' : 'border-gray-300'
                                      }`}
                                      onError={(e) => { e.target.src = "/images/fallback-food.jpg"; }}
                                    />
                                    {!isAvailable && (
                                      <div className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-xl flex items-center justify-center">
                                        <FontAwesomeIcon icon={faBan} className="text-white text-sm" />
                                      </div>
                                    )}
                                    {!isRestaurantOpen && isAvailable && (
                                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
                                        <FontAwesomeIcon icon={faStoreAltSlash} className="text-white text-sm" />
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
                                      {!isRestaurantOpen && isAvailable && (
                                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                          Orders Paused
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
                                    {canModify ? (
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
                                            disabled={item.quantity >= itemStock}
                                            className={`w-8 h-8 rounded-full transition ${
                                              item.quantity >= itemStock
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-own-2 text-white hover:bg-amber-600"
                                            }`}
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
                                          <button disabled className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 cursor-not-allowed">−</button>
                                          <span className="w-8 text-center font-semibold text-gray-500">{item.quantity}</span>
                                          <button disabled className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 cursor-not-allowed">+</button>
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
        
                        {/* Related Dishes */}
                        {!loading && (
                          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-own-2 mb-4">You might also like</h3>
                            {relatedDishes.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {relatedDishes.map(dish => (
                                  <div key={dish.id} className="text-center group">
                                    <img 
                                      src={dish.image || dish.imageUrl || "/images/fallback-food.jpg"} 
                                      alt={dish.name} 
                                      className="w-full h-20 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                                      onError={(e) => { e.target.src = "/images/fallback-food.jpg"; }}
                                    />
                                    <h4 className="text-sm font-semibold text-own-2 mb-1 truncate">{dish.name}</h4>
                                    <p className="text-xs text-gray-600 mb-2">£{(dish.price).toFixed(2)}</p>
                                    <button
                                      onClick={() => handleAddToCart(dish)}
                                      disabled={!isRestaurantOpen}
                                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                        isRestaurantOpen 
                                          ? 'bg-own-2 text-white hover:bg-amber-600' 
                                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      }`}
                                    >
                                      {isRestaurantOpen ? 'Add +' : 'Closed'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">
                                {menuDishes.length === 0 ? "No dishes available" : "You've added all available dishes!"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
        
                      {/* Order Summary */}
                      <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                          <h2 className="text-xl font-bold text-own-2 mb-6">Order Summary</h2>
                          
                          <div className="space-y-3 mb-6 text-black">
                            <div className="flex justify-between">
                              <span>Subtotal ({getAvailableQuantity()} items)</span>
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
                            {/* Delivery fee section – pickup only, so delivery fee is always £0.00 */}
                            {/* Original delivery fee display (commented out):
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              <span>{calculateDelivery() === 0 ? 'FREE' : `£${(calculateDelivery()).toFixed(2)}`}</span>
                            </div> */}
                            <div className="flex justify-between">
                              <span>Pickup</span>
                              <span>No delivery fee</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-own-2">£{(calculateTotal()).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
        
                          <div className="text-sm text-gray-600 mb-6">
                            {/* <p>✓ Free delivery on orders over £200</p> */}
                            <p>✓ Pickup only – no delivery fee</p>
                            <p>✓ Orders prepared fresh daily</p>
                            {unavailableCartItems.length > 0 && (
                              <p className="text-red-600 mt-2">⚠ Unavailable items excluded from total</p>
                            )}
                            {!isRestaurantOpen && (
                              <p className="text-red-600 mt-2 font-semibold">⚠ Restaurant is closed – checkout disabled</p>
                            )}
                          </div>
        
                          <Link to={isRestaurantOpen ? "/user/checkout" : "#"}>
                            <button 
                              className={`w-full py-4 font-bold rounded-xl transition-colors shadow-md ${
                                availableCartItems.length > 0 && isRestaurantOpen
                                  ? 'bg-own-2 text-white hover:bg-amber-600'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              disabled={availableCartItems.length === 0 || !isRestaurantOpen}
                              onClick={(e) => {
                                if (!isRestaurantOpen) {
                                  e.preventDefault();
                                  setAlert({ message: "Restaurant is closed. Checkout is disabled.", type: "error" });
                                  setTimeout(() => setAlert(null), 3000);
                                }
                              }}
                            >
                              {!isRestaurantOpen 
                                ? 'Restaurant Closed' 
                                : availableCartItems.length > 0 
                                  ? 'Proceed to Checkout' 
                                  : 'Add available items'}
                            </button>
                          </Link>
        
                          <Link to="/user/menu">
                            <button className="w-full py-3 border border-own-2 text-own-2 font-bold rounded-xl hover:bg-gray-50 transition-colors mt-3">
                              Continue Shopping
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}