import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function Payments() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Payments");
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

  const paymentMethods = [
    {
      id: 1,
      type: "card",
      last4: "4242",
      expiry: "12/25",
      isDefault: true
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
            
            {/* Payments & Wallet Tab */}
            {activeTab === "Payments" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-own-2 mb-6">Payments & Wallet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Wallet Balance */}
                  <div className="p-6 bg-own-2 rounded-xl text-white">
                    <h4 className="text-lg font-semibold mb-2">Wallet Balance</h4>
                    <p className="text-3xl font-bold mb-4">£{(userData.walletBalance / 100).toFixed(2)}</p>
                    <button className="bg-white text-own-2 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
                      Add Money
                    </button>
                  </div>

                  {/* Payment Methods */}
                  <div className="p-6 border border-gray-200 rounded-xl text-black">
                    <h4 className="text-lg font-semibold mb-4">Payment Methods</h4>
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2">
                        <div>
                          <p className="font-semibold">Card ending in {method.last4}</p>
                          <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                        </div>
                        {method.isDefault && (
                          <span className="bg-own-2 text-white text-xs px-2 py-1 rounded-full">Default</span>
                        )}
                      </div>
                    ))}
                    <button className="w-full mt-4 py-2 border-2 border-dashed border-own-2 text-own-2 rounded-lg hover:bg-amber-50">
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Payment Method
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