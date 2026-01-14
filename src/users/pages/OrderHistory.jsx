import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory, 
  faStar,
  faSearch,
  faChevronDown,
  faChevronUp,
  faRedo,
  faCheckCircle,
  faTruck,
  faMinus,
  faCreditCard,
  faWallet,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext"; // Import CartContext
import { db } from "../../firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { faPaypal } from "@fortawesome/free-brands-svg-icons";

export default function OrderHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Orders");
  const [orderFilter, setOrderFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  
  const { user } = useAuth();
  const { userData, loading: userLoading } = useUserData();
  const { addToCart, clearCart, getTotalQuantity } = useCart(); // Use CartContext

  // Fetch user's order history from Firestore orders collection
  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Query orders collection where customerId matches user's uid
        const ordersQuery = query(
          collection(db, "orders"),
          where("customerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(ordersQuery);
        const fetchedOrders = [];
        
        querySnapshot.forEach((doc) => {
          const orderData = doc.data();
          fetchedOrders.push({ 
            id: doc.id, 
            ...orderData,
            // Ensure all required fields exist with defaults
            orderNumber: orderData.orderNumber || `ORD-${doc.id.substring(0, 8).toUpperCase()}`,
            orderStatus: orderData.orderStatus || "pending",
            paymentStatus: orderData.paymentStatus || "pending",
            items: orderData.items || [],
            total: orderData.total || 0,
            subtotal: orderData.subtotal || 0,
            deliveryFee: orderData.deliveryFee || 0,
            createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt || new Date()
          });
        });
        
        setOrders(fetchedOrders);
        
      } catch (error) {
        console.error("Error fetching order history:", error);
        // If there's an error (like no index), try a different approach
        try {
          // Fallback: Get all orders and filter client-side
          const ordersCollection = collection(db, "orders");
          const allOrdersSnapshot = await getDocs(ordersCollection);
          const allOrders = [];
          
          allOrdersSnapshot.forEach((doc) => {
            const orderData = doc.data();
            if (orderData.customerId === user.uid) {
              allOrders.push({ 
                id: doc.id, 
                ...orderData,
                orderNumber: orderData.orderNumber || `ORD-${doc.id.substring(0, 8).toUpperCase()}`,
                orderStatus: orderData.orderStatus || "pending",
                paymentStatus: orderData.paymentStatus || "pending",
                items: orderData.items || [],
                total: orderData.total || 0,
                subtotal: orderData.subtotal || 0,
                deliveryFee: orderData.deliveryFee || 0,
                createdAt: orderData.createdAt?.toDate?.() || orderData.createdAt || new Date()
              });
            }
          });
          
          // Sort by date (most recent first)
          const sortedOrders = allOrders.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          setOrders(sortedOrders);
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrderHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  const getStatusIcon = (status) => {
    if (!status) return <FontAwesomeIcon icon={faHistory} className="text-yellow-500" />;
    
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
        return <FontAwesomeIcon icon={faHistory} className="text-yellow-500" />;
    }
  };

  const getPaymentIcon = (paymentMethod) => {
    if (!paymentMethod) return <FontAwesomeIcon icon={faCreditCard} />;
    
    switch (paymentMethod.toLowerCase()) {
      case "wallet":
        return <FontAwesomeIcon icon={faWallet} />;
      case "card":
        return <FontAwesomeIcon icon={faCreditCard} />;
      case "cash":
        return <FontAwesomeIcon icon={faMoneyBill} />;
      case "paypal":
        return <FontAwesomeIcon icon={faPaypal} />;
      default:
        return <FontAwesomeIcon icon={faCreditCard} />;
    }
  };

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    // Use orderStatus field from your order data pattern
    const status = order.orderStatus || order.status;
    
    const matchesStatus = orderFilter === "all" || 
                         (status && status.toLowerCase() === orderFilter);
    
    const matchesSearch = searchTerm.trim() === "" || 
                         (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (order.items && order.items.some(item => 
                           item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    return matchesStatus && matchesSearch;
  });

  // Function to toggle order details expansion
  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Function to format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return dateObj.toLocaleDateString('en-US', options);
    } catch {
      return "Invalid Date";
    }
  };

  // Function to format currency (pence to pounds)
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "£0.00";
    
    // Convert from pence to pounds
    const pounds = amount / 100;
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(pounds);
  };

  // Function to reorder an individual item
  const reorderItem = (item) => {
    try {
      const confirmAdd = window.confirm(
        `Add "${item.name}" to your cart?`
      );
      
      if (!confirmAdd) return;
      
      const cartItem = {
        id: item.id || item.productId || Math.random().toString(36).substr(2, 9),
        name: item.name,
        price: item.price/100 || 0,
        quantity: item.quantity || 1,
        specialInstructions: item.specialInstructions || '',
        stock: item.stock || 100
      };
      
      addToCart(cartItem);
      
      alert(`✅ "${item.name}" added to cart!`);
    } catch (error) {
      console.error("Error reordering item:", error);
      alert("❌ Failed to add item to cart. Please try again.");
    }
  };

  // Function to handle "Order Again" for entire order
  const handleOrderAgain = async (order) => {
    try {
      // First, confirm with the user
      const confirmReorder = window.confirm(
        `Add all items from order #${order.orderNumber || `ORD-${order.id.substring(0, 8).toUpperCase()}`} to your cart?`
      );
      
      if (!confirmReorder) return;
      
      // Ask if user wants to clear existing cart
      const clearExisting = window.confirm(
        "Would you like to clear your current cart items before adding these?"
      );
      
      if (clearExisting) {
        clearCart();
      }
      
      // Add all items from the order to cart
      let addedCount = 0;
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const cartItem = {
            id: item.id || item.productId || Math.random().toString(36).substr(2, 9),
            name: item.name,
            price: item.price/100 || 0,
            quantity: item.quantity || 1,
            specialInstructions: item.specialInstructions || '',
            image: item.image || '',
            category: item.category || '',
            stock: item.stock || 100
          };
          
          addToCart(cartItem);
          addedCount++;
        });
      }
      
      // Show success message
      alert(`✅ Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to your cart!`);
      
    } catch (error) {
      console.error("Error reordering order:", error);
      alert("❌ Failed to add items to cart. Please try again.");
    }
  };

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
      <div className="md:flex md:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          {activeTab === "Orders" && (
            <div className="bg-white rounded-2xl shadow-lg p-6 text-black">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">Order History</h3>
                {orders.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {orders.length} order{orders.length !== 1 ? 's' : ''} total
                  </span>
                )}
              </div>
              
              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
                  <p className="mt-4 text-lg text-gray-600">Loading your orders...</p>
                </div>
              )}
              
              {!loading && (
                <>
                  {/* Search and Filter Section */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by order number, name, or items..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="relative">
                      <select
                        className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value)}
                      >
                        <option value="all">All Orders</option>
                        <option value="delivered">Delivered</option>
                        <option value="preparing">Preparing</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Orders List */}
                  <div className="">
                    {!loading && filteredOrders.length > 0 ? (
                      filteredOrders.map(order => (
                        <div key={order.id || Math.random()} className="border mb-5 border-gray-200 rounded-xl overflow-hidden">
                          {/* Order Header */}
                          <div className="p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-own-2">
                                  {order.orderNumber || `ORD-${order.id.substring(0, 8).toUpperCase()}`}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(order.orderStatus || order.status)}`}>
                                  {getStatusIcon(order.orderStatus || order.status)} 
                                  <span className="ml-1">{getStatusText(order.orderStatus || order.status)}</span>
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDate(order.createdAt)} 
                                {order.customerName && ` • ${order.customerName}`}
                              </p>
                            </div>
                            <div className="text-right mt-2 md:mt-0">
                              <p className="font-bold text-lg">
                                {formatCurrency(order.total || 0)}
                              </p>
                              <button 
                                onClick={() => toggleOrderDetails(order.id)}
                                className="text-own-2 text-sm hover:text-amber-600 mt-1"
                              >
                                {expandedOrder === order.id ? (
                                  <>
                                    <FontAwesomeIcon icon={faChevronUp} className="mr-1" />
                                    Hide details
                                  </>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faChevronDown} className="mr-1" />
                                    View details
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {/* Order Details (Expanded) */}
                          {expandedOrder === order.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                              className="p-4 border-t border-gray-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Order Items */}
                                <div>
                                  <h5 className="font-semibold text-gray-800 mb-3">Order Items ({order.items?.length || 0})</h5>
                                  <div className="">
                                    {order.items && order.items.length > 0 ? (
                                      order.items.map((item, index) => (
                                        <div key={index} className="mb-3 flex justify-between items-center">
                                          <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 bg-own-2 rounded-full flex items-center justify-center text-white text-sm">
                                              {item.quantity || 1}
                                            </span>
                                            <div>
                                              <span className="block font-medium">{item.name || "Item"}</span>
                                              {item.specialInstructions && (
                                                <span className="text-xs text-gray-500">Note: {item.specialInstructions}</span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className="font-semibold">
                                              {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                            </span>
                                            <button 
                                              onClick={() => reorderItem(item)}
                                              className="text-own-2 hover:text-amber-600 text-sm flex items-center gap-1"
                                            >
                                              <FontAwesomeIcon icon={faRedo} />
                                              Reorder
                                            </button>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-gray-500 text-sm">No items information available</p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Order Information */}
                                <div>
                                  <h5 className="font-semibold text-gray-800 mb-3">Order Information</h5>
                                  <div className="space-y-3 text-sm">
                                    {order.customerName && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Customer:</span>
                                        <span className="text-right">{order.customerName}</span>
                                      </div>
                                    )}
                                    
                                    {order.customerPhone && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span>{order.customerPhone}</span>
                                      </div>
                                    )}
                                    
                                    {order.deliveryAddress && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Address:</span>
                                        <span className="text-right max-w-xs">
                                          {typeof order.deliveryAddress === 'string' 
                                            ? order.deliveryAddress 
                                            : order.deliveryAddress.fullAddress || 
                                              order.deliveryAddress.address || 
                                              `${order.deliveryAddress.line1 || ''} ${order.deliveryAddress.city || ''}`.trim()}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {order.deliveryInstructions && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Instructions:</span>
                                        <span className="text-right max-w-xs">{order.deliveryInstructions}</span>
                                      </div>
                                    )}
                                    
                                    {order.paymentMethod && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Payment:</span>
                                        <div className="flex items-center gap-2">
                                          {getPaymentIcon(order.paymentMethod)}
                                          <span className="capitalize">{order.paymentMethod}</span>
                                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                                            order.paymentStatus === 'paid' 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {order.paymentStatus || 'pending'}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Order Totals */}
                                    <div className="border-t pt-3 mt-3">
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(order.subtotal || 0)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Delivery Fee:</span>
                                        <span>{formatCurrency(order.deliveryFee || 0)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Tax:</span>
                                        <span>{formatCurrency(order.tax || 0)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Discount:</span>
                                        <span>-{formatCurrency(order.discount || 0)}</span>
                                      </div>
                                      <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t">
                                        <span>Total:</span>
                                        <span>{formatCurrency(order.total || 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Show Order Again button for delivered/completed orders */}
                                  {(order.orderStatus === "delivered" || order.orderStatus === "completed") && (
                                    <div className="mt-4 flex gap-3">
                                      <button 
                                        onClick={() => handleOrderAgain(order)}
                                        className="px-4 py-2 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                                      >
                                        <FontAwesomeIcon icon={faRedo} />
                                        Order Again
                                      </button>
                                      <Link
                                        to="/user/cart"
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                      >
                                        View Cart
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FontAwesomeIcon icon={faHistory} className="text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">
                          {loading ? "Loading..." : "No orders found"}
                        </p>
                        {!loading && (
                          <>
                            <p className="text-sm text-gray-400 mt-1 mb-4">
                              {searchTerm || orderFilter !== "all" 
                                ? "Try adjusting your search or filter" 
                                : "You haven't placed any orders yet"}
                            </p>
                            <Link 
                              to="/user/menu" 
                              className="mt-4 inline-block px-4 py-2 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors"
                            >
                              Browse Menu
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}