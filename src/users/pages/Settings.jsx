import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Settings");

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
                <h3 className="text-xl font-bold text-own-2 mb-6">Account Settings</h3>
                <div className="">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input type="text" defaultValue={userData.name.split(' ')[0]} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input type="text" defaultValue={userData.name.split(' ')[1]} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2" />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" defaultValue={userData.email} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" defaultValue={userData.phone} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2" />
                  </div>

                  <div className="pt-4 border-t border-gray-200 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Password</h4>
                    <button className="text-own-2 hover:text-amber-600">Change Password</button>
                  </div>

                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors">
                      Save Changes
                    </button>
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
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