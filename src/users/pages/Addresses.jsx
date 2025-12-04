import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function Addresses() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Addresses");

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

  const addresses = [
    {
      id: 1,
      name: "Home",
      address: "123 Main Street, Lagos Island, Lagos",
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
              <div className="bg-white rounded-2xl shadow-lg p-6 text-black">
                <h3 className="text-xl font-bold text-own-2 mb-6">Saved Addresses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map(address => (
                    <div key={address.id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-own-2 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-own-2">{address.name}</h4>
                        {address.isDefault && (
                          <span className="bg-own-2 text-white text-xs px-2 py-1 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{address.address}</p>
                      <div className="flex gap-2">
                        <button className="text-sm text-own-2 hover:text-amber-600">
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          Edit
                        </button>
                        <button className="text-sm text-red-600 hover:text-red-700">
                          <FontAwesomeIcon icon={faTrash} className="mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full py-3 border-2 border-dashed border-own-2 text-own-2 rounded-xl hover:bg-amber-50 transition-colors">
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add New Address
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </>
  );
}