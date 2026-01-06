import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHistory,
  faClock,
  faCheckCircle,
  faTruck,
  faWallet, 
  faPlus,
  faMinus,
  faUtensils,
  faMapMarkerAlt,
  faCartShopping,
  faCalendar,
  faRefresh
} from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useUserData } from "../hooks/useUserData";

export default function Dashboard() { 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Dashboard");

  
  const { user, logout } = useAuth();
  const { userData, loading: userLoading } = useUserData();
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0
  });

  // Fetch user data and orders from Firestore
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch all orders from orders collection
        const ordersCollection = collection(db, "orders");
        const allOrdersSnapshot = await getDocs(ordersCollection);
        
        const userOrders = [];
        let totalSpent = 0;
        
        // Filter orders by customerId and calculate stats
        allOrdersSnapshot.forEach((doc) => {
          const orderData = doc.data();
          
          // Check if this order belongs to the current user
          if (orderData.customerId === user.uid) {
            userOrders.push({
              id: doc.id,
              ...orderData,
              createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt || new Date()
            });
            
            // Add to total spent (convert from pence to pounds)
            if (orderData.total) {
              totalSpent += orderData.total / 100;
            }
          }
        });
        
        // Sort orders by date (most recent first)
        const sortedOrders = userOrders.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Get recent orders (first 3)
        const recentOrdersList = sortedOrders.slice(0, 3);
        setRecentOrders(recentOrdersList);
        
        // Calculate stats
        const totalOrders = userOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        
        setStats({
          totalOrders: totalOrders,
          totalSpent: Math.round(totalSpent * 100), // Convert back to pence
          averageOrderValue: Math.round(averageOrderValue * 100) // Convert back to pence
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Refresh data function
  const handleRefresh = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all orders from orders collection
      const ordersCollection = collection(db, "orders");
      const allOrdersSnapshot = await getDocs(ordersCollection);
      
      const userOrders = [];
      let totalSpent = 0;
      
      // Filter orders by customerId and calculate stats
      allOrdersSnapshot.forEach((doc) => {
        const orderData = doc.data();
        
        if (orderData.customerId === user.uid) {
          userOrders.push({
            id: doc.id,
            ...orderData,
            createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt || new Date()
          });
          
          if (orderData.total) {
            totalSpent += orderData.total / 100;
          }
        }
      });
      
      // Sort orders by date
      const sortedOrders = userOrders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      const recentOrdersList = sortedOrders.slice(0, 3);
      setRecentOrders(recentOrdersList);
      
      // Update stats
      const totalOrders = userOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      
      setStats({
        totalOrders: totalOrders,
        totalSpent: Math.round(totalSpent * 100),
        averageOrderValue: Math.round(averageOrderValue * 100)
      });
      
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
    
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case "preparing":
      case "processing":
        return <FontAwesomeIcon icon={faTruck} className="text-blue-500" />;
      case "cancelled":
      case "canceled":
        return <FontAwesomeIcon icon={faMinus} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Processing";
    
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return "Delivered";
      case "preparing":
      case "processing":
        return "Preparing";
      case "cancelled":
      case "canceled":
        return "Cancelled";
      default:
        return "Processing";
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "bg-yellow-100 text-yellow-800";
    
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      case "preparing":
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      return dateObj.toLocaleDateString('en-US', options);
    } catch {
      return "Invalid Date";
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return "Just now";
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(dateObj.getTime())) return "Just now";
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - dateObj) / 1000);
      
      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return formatDate(date);
    } catch {
      return "Just now";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to access your dashboard.</p>
            <Link
              to="/login"
              className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors"
            >
              Go to Login
            </Link>
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
        user={userData}
      />
      <UserSideBar 
        isOpen={isSidebarOpen} 
        closeSidebar={closeSidebar} 
        userData={userData} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
      />
      <div className="md:flex  md:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            {/* Refresh Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors"
              >
                <FontAwesomeIcon icon={faRefresh} />
                Refresh Dashboard
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Welcome Message */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">
                      Welcome back, {userData?.firstName || "Guest"}! 👋
                    </h1>
                    {userData?.joinDate && (
                      <div className="flex items-center gap-1 text-gray-600 mt-2 md:mt-0">
                        <FontAwesomeIcon icon={faCalendar} />
                        <span className="text-sm">Joined {userData.joinDate}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">
                    Here's what's happening with your account today.
                  </p>
                </div>

                {/* Overview Tab */}
                {activeTab === "Dashboard" && (
                  <div className="">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Total Orders Card */}
                      <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <FontAwesomeIcon icon={faHistory} className="text-xl text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-500 text-sm mb-1">Total Orders</h3>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {stats.totalOrders === 0 
                                ? "No orders yet" 
                                : `${formatCurrency(stats.averageOrderValue)} average`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Wallet Balance Card */}
                      <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <FontAwesomeIcon icon={faWallet} className="text-xl text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-500 text-sm mb-1">Wallet Balance</h3>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(userData?.walletBalance || 0)}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Add funds for faster checkout
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Total Spent Card */}
                      <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                            <FontAwesomeIcon icon={faUtensils} className="text-xl text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-500 text-sm mb-1">Total Spent</h3>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalSpent)}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Across {stats.totalOrders} orders
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Your latest {recentOrders.length} orders
                          </p>
                        </div>
                        {recentOrders.length > 0 && (
                          <Link 
                            to="/user/orders"
                            className="text-own-2 hover:text-amber-600 font-medium flex items-center gap-1"
                          >
                            View All Orders
                            <FontAwesomeIcon icon={faHistory} />
                          </Link>
                        )}
                      </div>
                      
                      {recentOrders.length > 0 ? (
                        <div className="space-y-4">
                          {recentOrders.map((order, index) => (
                            <motion.div
                              key={order.id || index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-gray-800">
                                      {order.orderNumber || `ORD-${order.id.substring(0, 8).toUpperCase()}`}
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(order.orderStatus)}`}>
                                      {getStatusIcon(order.orderStatus)}
                                      <span className="ml-1">{getStatusText(order.orderStatus)}</span>
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <p className="text-gray-600 mb-1">
                                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                      </p>
                                      {order.items && order.items.slice(0, 2).map((item, i) => (
                                        <p key={i} className="text-gray-500">
                                          • {item.quantity}x {item.name}
                                        </p>
                                      ))}
                                      {order.items && order.items.length > 2 && (
                                        <p className="text-gray-400 text-xs">
                                          +{order.items.length - 2} more items
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="text-gray-600">
                                      <p className="mb-1">
                                        {formatDate(order.createdAt)}
                                      </p>
                                      <p className="text-xs">
                                        {formatTimeAgo(order.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="md:text-right">
                                  <p className="font-bold text-lg text-gray-800 mb-1">
                                    {formatCurrency(order.total || 0)}
                                  </p>
                                  <div className="text-sm text-gray-500">
                                    {order.paymentMethod && (
                                      <p className="capitalize">{order.paymentMethod} • {order.paymentStatus || 'pending'}</p>
                                    )}
                                  </div>
                                  <Link 
                                    to={`/user/orders/${order.id}`}
                                    className="inline-block mt-2 text-own-2 hover:text-amber-600 text-sm font-medium"
                                  >
                                    View Details →
                                  </Link>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FontAwesomeIcon 
                            icon={faUtensils} 
                            className="text-4xl text-gray-300 mb-4"
                          />
                          <h4 className="text-lg font-semibold text-gray-600 mb-2">
                            No orders yet
                          </h4>
                          <p className="text-gray-500 mb-4">
                            Start your culinary journey with Ada's Kitchen
                          </p>
                          <Link
                            to="/user/menu"
                            className="inline-flex items-center gap-2 bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                            Browse Menu
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                          to="/user/menu"
                          className="flex flex-col items-center justify-center p-4 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors"
                        >
                          <FontAwesomeIcon icon={faUtensils} className="text-xl mb-2" />
                          <span className="text-sm font-medium">Order Food</span>
                        </Link>
                        
                        <Link to="/user/payments"
                          className="flex flex-col items-center justify-center p-4 border-2 border-own-2 text-own-2 rounded-xl hover:bg-amber-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faWallet} className="text-xl mb-2" />
                          <span className="text-sm font-medium">Add Money</span>
                        </Link>
                        
                        <Link to="/user/addresses"
                          className="flex flex-col items-center justify-center p-4 border-2 border-own-2 text-own-2 rounded-xl hover:bg-amber-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xl mb-2" />
                          <span className="text-sm font-medium">Add Address</span>
                        </Link>
                        
                        <Link to="/user/cart"
                          className="flex flex-col items-center justify-center p-4 border-2 border-own-2 text-own-2 rounded-xl hover:bg-amber-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faCartShopping} className="text-xl mb-2" />
                          <span className="text-sm font-medium">Cart</span>
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
    </>
  );
}