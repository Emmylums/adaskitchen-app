import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory, 
  faStar,
  faSearch,
  faChevronDown,
  faChevronUp,
  faRedo
} from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function OrderHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Orders");
  const [orderFilter, setOrderFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock user data
  const userData = {
    name: "Ada Johnson",
    email: "ada.johnson@email.com",
    phone: "+234 912 345 6789",
    joinDate: "January 2024",
    lastLogin: "2024-01-15 14:30",
    loginLocation: "Lagos, Nigeria",
    walletBalance: 12500
  };

  // Mock data for all sections
  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      items: [
        { name: "Jollof Rice", price: 2500, quantity: 2 },
        { name: "Suya", price: 2000, quantity: 1 },
        { name: "Plantains", price: 1500, quantity: 1 }
      ],
      total: 8500,
      status: "delivered",
      rating: 5,
      deliveryAddress: "123 Main Street, Lagos Island, Lagos",
      paymentMethod: "Card (4242)",
      deliveryTime: "45 mins",
      restaurant: "Taste of Nigeria"
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      items: [
        { name: "Pounded Yam & Egusi", price: 3200, quantity: 1 },
        { name: "Fried Rice", price: 2800, quantity: 1 },
        { name: "Chapman", price: 1200, quantity: 2 }
      ],
      total: 8400,
      status: "delivered",
      rating: 4,
      deliveryAddress: "123 Main Street, Lagos Island, Lagos",
      paymentMethod: "Wallet",
      deliveryTime: "55 mins",
      restaurant: "Naija Kitchen"
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      items: [
        { name: "Amala & Ewedu", price: 2200, quantity: 1 },
        { name: "Goat Meat", price: 1800, quantity: 1 }
      ],
      total: 4000,
      status: "cancelled",
      rating: null,
      deliveryAddress: "123 Main Street, Lagos Island, Lagos",
      paymentMethod: "Card (4242)",
      deliveryTime: "N/A",
      restaurant: "Yoruba Buka"
    },
    {
      id: "ORD-004",
      date: "2024-01-02",
      items: [
        { name: "Pepper Soup", price: 3000, quantity: 1 },
        { name: "Semo", price: 1500, quantity: 1 },
        { name: "Fish", price: 2500, quantity: 1 }
      ],
      total: 7000,
      status: "delivered",
      rating: 5,
      deliveryAddress: "123 Main Street, Lagos Island, Lagos",
      paymentMethod: "Wallet",
      deliveryTime: "40 mins",
      restaurant: "Coastal Delights"
    }
  ];

  const getStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "preparing":
        return "Preparing";
      case "cancelled":
        return "Cancelled";
      default:
        return "Processing";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderFilter === "all" || order.status === orderFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
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
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Function to reorder an item
  const reorderItem = (itemName) => {
    alert(`Adding ${itemName} to your cart!`);
    // In a real app, this would add the item to the cart
  };

  return (
    <>
      <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
      <UserSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userData={userData} setActiveTab={setActiveTab} activeTab={activeTab}/>
      <div className="md:flex  md:justify-end">
      <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>

            {activeTab === "Orders" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-black">
                <h3 className="text-xl font-bold text-own-2 mb-6">Order History</h3>
                
                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search orders, restaurants, or items..."
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
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Orders List */}
                <div className="">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <div key={order.id} className="border mb-5 border-gray-200 rounded-xl overflow-hidden">
                        {/* Order Header */}
                        <div className="p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-own-2">{order.id}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{formatDate(order.date)} • {order.restaurant}</p>
                          </div>
                          <div className="text-right mt-2 md:mt-0">
                            <p className="font-bold text-lg">£{(order.total / 100).toFixed(2)}</p>
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
                                <h5 className="font-semibold text-gray-800 mb-3">Items Ordered</h5>
                                <div className="">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="mb-3 flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-own-2 rounded-full flex items-center justify-center text-white text-sm">
                                          {item.quantity}
                                        </span>
                                        <span>{item.name}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-semibold">£{(item.price / 100).toFixed(2)}</span>
                                        <button 
                                          onClick={() => reorderItem(item.name)}
                                          className="text-own-2 hover:text-amber-600 text-sm"
                                        >
                                          <FontAwesomeIcon icon={faRedo} className="mr-1" />
                                          Reorder
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Order Information */}
                              <div>
                                <h5 className="font-semibold text-gray-800 mb-3">Order Information</h5>
                                <div className=" text-sm">
                                  <div className="flex justify-between mb-4">
                                    <span className="text-gray-600">Delivery Address:</span>
                                    <span className="text-right">{order.deliveryAddress}</span>
                                  </div>
                                  <div className="flex justify-between mb-4">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span>{order.paymentMethod}</span>
                                  </div>
                                  <div className="flex justify-between mb-4">
                                    <span className="text-gray-600">Delivery Time:</span>
                                    <span>{order.deliveryTime}</span>
                                  </div>
                                  {order.status === "delivered" && (
                                    <div className="flex justify-between mb-4">
                                      <span className="text-gray-600">Rating:</span>
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <FontAwesomeIcon 
                                            key={i}
                                            icon={faStar} 
                                            className={i < order.rating ? "text-yellow-400" : "text-gray-300"} 
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {order.status === "delivered" && (
                                  <button className="mt-4 px-4 py-2 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors">
                                    Order Again
                                  </button>
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
                      <p className="text-gray-500">No orders found</p>
                      <Link to="/menu" className="mt-4 inline-block px-4 py-2 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors">
                        Browse Menu
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
}