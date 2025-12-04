import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function Security() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Security");

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

  const securitySettings = {
    twoFactor: false,
    lastDevices: ["Chrome on Windows", "Safari on iPhone"]
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
                  <h3 className="text-xl font-bold text-own-2 mb-6">Security Settings</h3>
                  <div >
                    <div className="mb-6">
                      <h4 className="font-semibold mb-4">Two-Factor Authentication</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Add an extra layer of security</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-own-2"></div>
                        </label>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-4">Recent Devices</h4>
                      <div className="">
                        {securitySettings.lastDevices.map((device, index) => (
                          <div key={index} className="mb-2 flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="text-gray-600">{device}</span>
                            <button className="text-red-600 hover:text-red-700 text-sm">
                              Revoke
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
      </div>
    </div>
  </>
  );
}