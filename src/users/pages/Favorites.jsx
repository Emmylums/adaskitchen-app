import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faUtensils,
  faHistory,
  faPlus,
  faShoppingCart,
  faStar,
  faFire,
  faClock,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

export default function Favorites() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Favorites");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFavorites, setExpandedFavorites] = useState([]);
  
  const { user } = useAuth();
  const { userData, loading: userLoading } = useUserData();
  const { addToCart } = useCart();

  // Format currency function
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "£0.00";
    const pounds = amount / 100;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(pounds);
  };

  // Format time ago function
  const formatTimeAgo = (dateInput) => {
    if (!dateInput) return "Never";
    
    let date;
    if (dateInput?.toDate) {
      date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return "Never";
    }
    
    if (isNaN(date.getTime())) return "Never";
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks}w ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get dish icon based on name or category
  const getDishIcon = (dishName, category) => {
    const name = dishName?.toLowerCase() || '';
    const cat = category?.toLowerCase() || '';
    
    if (name.includes("jollof") || name.includes("rice")) return "🍛";
    if (name.includes("soup") || name.includes("pepper")) return "🍲";
    if (name.includes("suya") || name.includes("meat")) return "🥩";
    if (name.includes("plantain") || name.includes("dodo")) return "🍌";
    if (name.includes("yam") || name.includes("amala")) return "🥔";
    if (name.includes("fish")) return "🐟";
    if (name.includes("drink") || name.includes("chapman")) return "🥤";
    if (cat.includes("dessert") || name.includes("cake")) return "🍰";
    if (cat.includes("appetizer") || name.includes("starter")) return "🥗";
    
    return "🍽️";
  };

  // Fetch user orders and calculate favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch all orders from orders collection
        const ordersCollection = collection(db, "orders");
        const allOrdersSnapshot = await getDocs(ordersCollection);
        
        const itemCounts = {};
        
        // Filter orders by customerId and process items
        allOrdersSnapshot.forEach((doc) => {
          const orderData = doc.data();
          
          if (orderData.customerId === user.uid && orderData.items) {
            orderData.items.forEach(item => {
              const itemId = item.id;
              if (itemId) {
                if (!itemCounts[itemId]) {
                  itemCounts[itemId] = {
                    id: itemId,
                    name: item.name || "Unknown Dish",
                    price: item.price || 0,
                    count: 0,
                    totalQuantity: 0,
                    lastOrdered: orderData.createdAt,
                    orders: []
                  };
                }
                
                itemCounts[itemId].count += 1;
                itemCounts[itemId].totalQuantity += item.quantity || 1;
                
                if (!itemCounts[itemId].orders.includes(doc.id)) {
                  itemCounts[itemId].orders.push(doc.id);
                }
                
                const currentDate = itemCounts[itemId].lastOrdered;
                const newDate = orderData.createdAt;
                
                if (currentDate && newDate) {
                  const currentDateObj = new Date(currentDate);
                  const newDateObj = new Date(newDate);
                  if (newDateObj > currentDateObj) {
                    itemCounts[itemId].lastOrdered = newDate;
                  }
                } else if (newDate) {
                  itemCounts[itemId].lastOrdered = newDate;
                }
              }
            });
          }
        });
        
        // Calculate favorites with scoring
        const calculatedFavorites = Object.values(itemCounts).map(item => {
          let score = item.count * 2 + item.totalQuantity;
          
          if (item.lastOrdered) {
            const lastOrderDate = new Date(item.lastOrdered);
            const now = new Date();
            const daysSinceLastOrder = Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastOrder < 7) score += 5;
            else if (daysSinceLastOrder < 30) score += 2;
          }
          
          return {
            ...item,
            score: score,
            category: "Food" // Default category
          };
        });
        
        // Sort by score (highest first)
        const sortedFavorites = calculatedFavorites
          .sort((a, b) => b.score - a.score);
        
        setFavorites(sortedFavorites);
        
      } catch (error) {
        console.error("Error calculating favorites from orders:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Toggle favorite details
  const toggleFavoriteDetails = (itemId) => {
    setExpandedFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle "Add to Cart"
  const handleAddToCart = (item) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price / 100,
      quantity: 1,
      specialInstructions: '',
      stock: 100
    };
    
    addToCart(cartItem);
    
    // Show success message (you can implement a toast/notification)
    alert(`✅ "${item.name}" added to cart!`);
  };

  // Handle "Order Again"
  const handleOrderAgain = (item) => {
    handleAddToCart(item);
  };

  // Get frequency badge
  const getFrequencyBadge = (count) => {
    if (count === 1) return { text: "Once", color: "bg-gray-100 text-gray-800" };
    if (count <= 3) return { text: `${count} times`, color: "bg-blue-100 text-blue-800" };
    if (count <= 10) return { text: "Frequent", color: "bg-purple-100 text-purple-800" };
    return { text: "Favorite!", color: "bg-own-2 text-white" };
  };

  // Loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyzing your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserNavBar 
        toggleSidebar={toggleSidebars} 
        isSideBarOpen={isSidebarOpen}
        userData={userData}
      />
      <UserSideBar 
        isOpen={isSidebarOpen} 
        closeSidebar={closeSidebar} 
        userData={userData} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
      />
      
      <div className="lg:flex lg:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "lg:w-[75%]" : "lg:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-own-2">Favorite Dishes</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Based on your order history • Personal recommendations
                      </p>
                    </div>
                    
                    {favorites.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-own-2">{favorites.length}</span> favorite dishes
                        </p>
                        <p className="text-xs text-gray-400">
                          Updated in real-time
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {favorites.length > 0 ? (
                    <>
                      {/* Top 3 Favorites */}
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FontAwesomeIcon icon={faFire} className="text-red-500" />
                          Your Top Picks
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {favorites.slice(0, 3).map((item, index) => {
                            const frequency = getFrequencyBadge(item.count);
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-5 hover:shadow-lg transition-shadow"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-own-2 to-amber-500 rounded-lg flex items-center justify-center">
                                      <span className="text-2xl">
                                        {getDishIcon(item.name, item.category)}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-bold text-own-2">{item.name}</h5>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${frequency.color}`}>
                                          #{index + 1}
                                        </span>
                                      </div>
                                      <span className={`text-xs px-2 py-1 rounded-full ${frequency.color}`}>
                                        {frequency.text}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span className="flex items-center gap-1">
                                      <FontAwesomeIcon icon={faHistory} className="text-xs" />
                                      Ordered {item.count} time{item.count !== 1 ? 's' : ''}
                                    </span>
                                    <span className="font-bold text-lg text-own-2">
                                      {formatCurrency(item.price)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <FontAwesomeIcon icon={faClock} className="text-xs" />
                                      Last: {formatTimeAgo(item.lastOrdered)}
                                    </span>
                                    <span>
                                      {item.totalQuantity} item{item.totalQuantity !== 1 ? 's' : ''} total
                                    </span>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleOrderAgain(item)}
                                  className="w-full py-2.5 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                  <FontAwesomeIcon icon={faShoppingCart} />
                                  Order Again
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* All Favorites */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FontAwesomeIcon icon={faHeart} className="text-red-400" />
                            All Favorites
                          </h4>
                          <p className="text-sm text-gray-500">
                            {favorites.length} dishes • Sorted by popularity
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          {favorites.slice(3).map((item, index) => {
                            const frequency = getFrequencyBadge(item.count);
                            const isExpanded = expandedFavorites.includes(item.id);
                            
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: (index + 3) * 0.05 }}
                                className="border border-gray-200 rounded-xl overflow-hidden hover:border-own-2 transition-colors"
                              >
                                {/* Item Header */}
                                <div className="p-4 bg-white">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-own-2/20 to-amber-100 rounded-lg flex items-center justify-center">
                                        <span className="text-lg">
                                          {getDishIcon(item.name, item.category)}
                                        </span>
                                      </div>
                                      <div>
                                        <h5 className="font-semibold text-gray-800">{item.name}</h5>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${frequency.color}`}>
                                            {frequency.text}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {item.count} order{item.count !== 1 ? 's' : ''}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                      <div className="text-right">
                                        <p className="font-bold text-own-2">{formatCurrency(item.price)}</p>
                                        <p className="text-xs text-gray-500">
                                          Last: {formatTimeAgo(item.lastOrdered)}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => toggleFavoriteDetails(item.id)}
                                        className="text-own-2 hover:text-amber-600"
                                      >
                                        <FontAwesomeIcon 
                                          icon={isExpanded ? faArrowRight : faArrowRight} 
                                          className={`transform ${isExpanded ? 'rotate-90' : ''} transition-transform`}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Expanded Details */}
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-gray-100 p-4 bg-gray-50"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <h6 className="font-semibold text-gray-700 mb-2">Order Statistics</h6>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Total Orders:</span>
                                            <span className="font-medium">{item.count} time{item.count !== 1 ? 's' : ''}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Total Quantity:</span>
                                            <span className="font-medium">{item.totalQuantity} item{item.totalQuantity !== 1 ? 's' : ''}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Average per Order:</span>
                                            <span className="font-medium">
                                              {Math.round(item.totalQuantity / item.count)} item{Math.round(item.totalQuantity / item.count) !== 1 ? 's' : ''}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Last Ordered:</span>
                                            <span className="font-medium">{formatTimeAgo(item.lastOrdered)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h6 className="font-semibold text-gray-700 mb-2">Quick Actions</h6>
                                        <div className="space-y-3">
                                          <button
                                            onClick={() => handleAddToCart(item)}
                                            className="w-full py-2.5 border-2 border-own-2 text-own-2 rounded-xl hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                                          >
                                            <FontAwesomeIcon icon={faPlus} />
                                            Add to Cart
                                          </button>
                                          <button
                                            onClick={() => handleOrderAgain(item)}
                                            className="w-full py-2.5 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                          >
                                            <FontAwesomeIcon icon={faShoppingCart} />
                                            Order Again
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="bg-gradient-to-r from-own-2/10 to-transparent border border-own-2/20 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-own-2 mb-3">Missing a Favorite?</h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Link
                            to="/user/menu"
                            className="flex-1 px-4 py-3 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            <FontAwesomeIcon icon={faUtensils} />
                            Browse Full Menu
                          </Link>
                          <Link
                            to="/user/orders"
                            className="flex-1 px-4 py-3 border-2 border-own-2 text-own-2 rounded-xl hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            <FontAwesomeIcon icon={faHistory} />
                            View Order History
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-own-2/20 to-amber-100 rounded-full flex items-center justify-center mx-auto">
                          <FontAwesomeIcon icon={faHeart} className="text-4xl text-own-2" />
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-700 mb-3">No favorites yet</h4>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Your favorite dishes will appear here based on your order history. 
                        Start ordering to build your personalized favorites list!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                          to="/user/menu"
                          className="px-6 py-3 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2 font-medium"
                        >
                          <FontAwesomeIcon icon={faUtensils} />
                          Start Ordering
                        </Link>
                        <Link
                          to="/user/cart"
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
                        >
                          <FontAwesomeIcon icon={faShoppingCart} />
                          View Cart
                        </Link>
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