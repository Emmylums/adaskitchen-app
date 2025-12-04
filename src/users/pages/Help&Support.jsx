import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faInfoCircle,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function Support() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Support");

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
                <h3 className="text-xl font-bold text-own-2 mb-6">Help & Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-3xl text-own-2 mb-3" />
                    <h4 className="font-semibold mb-2">FAQs</h4>
                    <p className="text-gray-600 mb-3">Find answers to common questions</p>
                    <button className="text-own-2 hover:text-amber-600">View FAQs</button>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-3xl text-own-2 mb-3" />
                    <h4 className="font-semibold mb-2">Contact Support</h4>
                    <p className="text-gray-600 mb-3">Get help from our support team</p>
                    <button className="text-own-2 hover:text-amber-600">Contact Us</button>
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