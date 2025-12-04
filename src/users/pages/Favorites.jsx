import React, { useState } from "react";
import { motion } from 'framer-motion';
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function Favorites() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Favorites");

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

  const favorites = [
    {
      id: 1,
      name: "Jollof Rice",
      price: 3000,
      lastOrdered: "2 days ago"
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
              <div className="bg-white rounded-2xl shadow-lg p-6 text-black">
                <h3 className="text-xl font-bold text-own-2 mb-6">Favorite Dishes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-own-2 to-amber-400 rounded-xl flex items-center justify-center">
                        <span className="text-2xl text-white">🍛</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-own-2">{item.name}</h4>
                        <p className="text-sm text-gray-600">Last ordered: {item.lastOrdered}</p>
                        <p className="font-bold text-own-2">£{(item.price / 100).toFixed(2)}</p>
                      </div>
                      <button className="bg-own-2 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors">
                        Order Again
                      </button>
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