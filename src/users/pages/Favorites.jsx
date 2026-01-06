import React, { useState, useEffect } from "react";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function Favorites() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Favorites");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { userData, loading: userLoading } = useUserData();

  // Format currency function
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "£0.00";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  // Format time ago function
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get dish emoji based on name or category
  const getDishEmoji = (dishName, category) => {
    const name = dishName.toLowerCase();
    const cat = category ? category.toLowerCase() : "";
    
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
        
        const userOrders = [];
        const itemCounts = {};
        
        // Filter orders by customerId and process items
        allOrdersSnapshot.forEach((doc) => {
          const orderData = doc.data();
          
          // Check if this order belongs to the current user
          if (orderData.customerId === user.uid) {
            userOrders.push(orderData);
            
            // Count items in this order
            if (orderData.items && Array.isArray(orderData.items)) {
              orderData.items.forEach(item => {
                const itemId = item.id;
                if (itemId) {
                  // Initialize item data if not exists
                  if (!itemCounts[itemId]) {
                    itemCounts[itemId] = {
                      id: itemId,
                      name: item.name || "Unknown Dish",
                      price: item.price || 0,
                      count: 0,
                      totalQuantity: 0,
                      lastOrdered: orderData.createdAt?.toDate?.() || orderData.createdAt,
                      orders: [] // Store order IDs for reference
                    };
                  }
                  
                  // Update counts
                  itemCounts[itemId].count += 1; // Number of orders containing this item
                  itemCounts[itemId].totalQuantity += item.quantity || 1; // Total quantity ordered
                  
                  // Keep track of which orders contained this item
                  if (!itemCounts[itemId].orders.includes(doc.id)) {
                    itemCounts[itemId].orders.push(doc.id);
                  }
                  
                  // Update last ordered date (most recent)
                  const currentDate = itemCounts[itemId].lastOrdered;
                  const newDate = orderData.createdAt?.toDate?.() || orderData.createdAt;
                  
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
          }
        });
        
        // Convert itemCounts to array and calculate favorite scores
        const calculatedFavorites = Object.values(itemCounts).map(item => {
          // Calculate a score based on:
          // 1. Number of orders containing the item (count)
          // 2. Total quantity ordered (totalQuantity)
          // 3. Recency (boost for recently ordered items)
          
          let score = item.count * 2 + item.totalQuantity;
          
          // Add recency bonus if ordered recently
          if (item.lastOrdered) {
            const lastOrderDate = new Date(item.lastOrdered);
            const now = new Date();
            const daysSinceLastOrder = Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastOrder < 7) {
              score += 5; // Bonus for items ordered in the last week
            } else if (daysSinceLastOrder < 30) {
              score += 2; // Smaller bonus for items ordered in the last month
            }
          }
          
          return {
            ...item,
            score: score
          };
        });
        
        // Sort by score (highest first) and take top 20
        const sortedFavorites = calculatedFavorites
          .sort((a, b) => b.score - a.score)
          .slice(0, 20);
        
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

  // Function to handle "Order Again"
  const handleOrderAgain = (dishName) => {
    alert(`Adding ${dishName} to your cart!`);
    // In a real app, this would add the item to the cart
    // You would use your cart context here
  };

  // Function to get order frequency text
  const getFrequencyText = (item) => {
    if (item.count === 1) return "Ordered once";
    if (item.count <= 3) return `Ordered ${item.count} times`;
    if (item.count <= 10) return `Frequent choice`;
    return "Your favorite!";
  };

  // Loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyzing your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserNavBar 
        toggleSidebar={toggleSidebars} 
        isSidebarOpen={isSidebarOpen}
        user={userData}
      />
      <UserSideBar 
        isOpen={isSidebarOpen} 
        closeSidebar={closeSidebar} 
        userData={userData} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
      />
      <div className="md:flex md:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-black">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-own-2">Your Favorite Dishes</h3>
                      <p className="text-gray-600 mt-1">
                        Based on your order history - dishes you order most frequently
                      </p>
                    </div>
                    {favorites.length > 0 && (
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          {favorites.length} dish{favorites.length !== 1 ? 'es' : ''} analyzed
                        </span>
                        <p className="text-xs text-gray-400">
                          From your order history
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {favorites.length > 0 ? (
                    <div className="space-y-6">
                      {/* Top Favorites (first 3) */}
                      {favorites.slice(0, 3).map((item, index) => (
                        <div 
                          key={item.id} 
                          className="flex items-center gap-4 p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-all bg-gradient-to-r from-own-2/5 to-transparent"
                        >
                          <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-own-2 to-amber-500 rounded-xl flex items-center justify-center">
                              <span className="text-3xl text-white">
                                {getDishEmoji(item.name, item.category)}
                              </span>
                            </div>
                            {index < 3 && (
                              <div className="absolute -top-2 -left-2 w-8 h-8 bg-own-2 text-white rounded-full flex items-center justify-center font-bold">
                                #{index + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xl text-own-2">{item.name}</h4>
                              <span className="text-sm bg-own-2 text-white px-3 py-1 rounded-full">
                                {getFrequencyText(item)}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-1">
                              Ordered {item.count} time{item.count !== 1 ? 's' : ''} • 
                              Total {item.totalQuantity} item{item.totalQuantity !== 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-sm text-gray-500">
                                Last ordered: {formatTimeAgo(item.lastOrdered)}
                              </div>
                              <div className="font-bold text-lg text-own-2">
                                {formatCurrency(item.price || 0)}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleOrderAgain(item.name)}
                            className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors whitespace-nowrap font-medium"
                          >
                            Order Again
                          </button>
                        </div>
                      ))}
                      
                      {/* Other Favorites (grid layout for rest) */}
                      {favorites.length > 3 && (
                        <>
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">More Favorites</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {favorites.slice(3).map(item => (
                                <div 
                                  key={item.id} 
                                  className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-own-2 to-amber-400 rounded-lg flex items-center justify-center">
                                      <span className="text-xl text-white">
                                        {getDishEmoji(item.name, item.category)}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-own-2">{item.name}</h5>
                                      <p className="text-xs text-gray-500 mb-1">
                                        {getFrequencyText(item)}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Ordered {item.count} time{item.count !== 1 ? 's' : ''}
                                      </p>
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm text-gray-500">
                                          {formatTimeAgo(item.lastOrdered)}
                                        </span>
                                        <span className="font-bold text-own-2">
                                          {formatCurrency(item.price || 0)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => handleOrderAgain(item.name)}
                                    className="w-full mt-3 bg-gray-100 text-own-2 px-3 py-2 rounded-lg hover:bg-own-2 hover:text-white transition-colors text-sm font-medium"
                                  >
                                    Add to Cart
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📊</div>
                      <h4 className="text-xl font-semibold text-gray-600 mb-2">
                        No order history yet
                      </h4>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Your favorite dishes will be calculated based on your order patterns. 
                        Start ordering to see your personalized favorites here!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                          to="/user/menu"
                          className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors font-medium"
                        >
                          Browse Menu
                        </Link>
                        <Link
                          to="/user/orders"
                          className="border border-own-2 text-own-2 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                          View Order History
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