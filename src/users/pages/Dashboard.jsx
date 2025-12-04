import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHistory,
  faClock,
  faCheckCircle,
  faTruck,
  faWallet,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [orderFilter, setOrderFilter] = useState("all");
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case "preparing":
        return <FontAwesomeIcon icon={faTruck} className="text-blue-500" />;
      case "cancelled":
        return <FontAwesomeIcon icon={faMinus} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
    }
  };

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

  return (
    <>
      <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
      <UserSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userData={userData} setActiveTab={setActiveTab} activeTab={activeTab}/>
      <div className="md:flex  md:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Overview Tab */}
                {activeTab === "Dashboard" && (
                  <div className="">
                    <h2 className="text-own-2 mb-6 uppercase font-bold text-2xl font-display2 tracking-wider">Dashboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                        <FontAwesomeIcon icon={faHistory} className="text-3xl text-own-2 mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-1">Total Orders</h3>
                        <p className="text-2xl font-bold text-own-2">{orders.length}</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                        <FontAwesomeIcon icon={faWallet} className="text-3xl text-own-2 mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-1">Wallet Balance</h3>
                        <p className="text-2xl font-bold text-own-2">£{(userData.walletBalance / 100).toFixed(2)}</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                        <FontAwesomeIcon icon={faClock} className="text-3xl text-own-2 mb-3" />
                        <h3 className="font-semibold text-gray-800 mb-1">Member Since</h3>
                        <p className="text-lg font-bold text-own-2">{userData.joinDate}</p>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                      <h3 className="text-xl font-bold text-own-2 mb-4">Recent Orders</h3>
                      <div className="">
                        {orders.slice(0, 3).map(order => (
                          <div key={order.id} className="mb-5 flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                            <div>
                              <h4 className="font-semibold text-own-2">{order.id}</h4>
                              <p className="text-sm text-gray-600">{order.date}</p>
                              <p className="text-sm text-black">{order.items.map(item => item.name).join(", ")}</p>
                            </div>
                            <div className="text-right text-black">
                              <p className="font-bold">£{(order.total / 100).toFixed(2)}</p>
                              <div className="flex items-center gap-2 text-sm">
                                {getStatusIcon(order.status)}
                                <span>{getStatusText(order.status)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setActiveTab("orders")} className="block text-center mt-4 text-own-2 hover:text-amber-600">
                        View all orders →
                      </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-own-2 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/menu" className="p-4 bg-own-2 text-white text-center rounded-xl hover:bg-amber-600 transition-colors">
                          Order Food
                        </Link>
                        <button onClick={() => setActiveTab("payments")} className="p-4 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors">
                          Add Money
                        </button>
                        <button onClick={() => setActiveTab("referrals")} className="p-4 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors">
                          Refer Friends
                        </button>
                        <button onClick={() => setActiveTab("preferences")} className="p-4 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors">
                          Preferences
                        </button>
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