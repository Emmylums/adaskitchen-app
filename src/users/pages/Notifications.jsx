import React, { useState } from "react";
import { motion } from 'framer-motion';
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Notifications");

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

  const notifications = [
    {
      id: 1,
      type: "order",
      message: "Your order ORD-001 has been delivered",
      time: "2 hours ago",
      read: false
    }
  ];

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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-own-2 mb-6">Notifications</h3>
                <div className="">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border mb-4 border-gray-200 rounded-xl ${!notification.read ? 'bg-amber-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <p className="text-gray-800">{notification.message}</p>
                        <span className="text-sm text-gray-500">{notification.time}</span>
                      </div>
                      {!notification.read && (
                        <button className="text-sm text-own-2 mt-2 hover:text-amber-600">
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </>
  );
}