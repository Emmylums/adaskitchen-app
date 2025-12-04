import React, { useState } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faShoppingCart, faUser, faUtensils } from '@fortawesome/free-solid-svg-icons';

export default function ManagerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const [activeTab, setActiveTab] = useState("Dashboard");
  // Mock user data
  const userData = {
    name: "Ada Johnson",
    email: "ada.johnson@email.com",
    position: "Manager",
    phone: "+234 912 345 6789",
    joinDate: "January 2024",
    lastLogin: "2024-01-15 14:30",
    loginLocation: "Lagos, Nigeria",
    walletBalance: 12500
  };

  // Mock data for all sections
      const menuItems = [
        {
          id: 1,
          name: "Jollof Rice",
          description: "Traditional Nigerian rice cooked in tomato and pepper sauce",
          price: 3000,
          category: "Main Course",
          image: "/api/placeholder/300/200",
          featured: true,
          available: true,
          ingredients: ["Rice", "Tomatoes", "Bell peppers", "Onions", "Spices"],
          preparationTime: 30
        },
        {
          id: 2,
          name: "Suya",
          description: "Spicy grilled meat skewers",
          price: 2500,
          category: "Appetizer",
          image: "/api/placeholder/300/200",
          featured: true,
          available: true,
          ingredients: ["Beef", "Suya spice", "Onions", "Tomatoes"],
          preparationTime: 20
        },
        {
          id: 3,
          name: "Pounded Yam & Egusi",
          description: "Yam flour with melon seed soup",
          price: 3500,
          category: "Main Course",
          image: "/api/placeholder/300/200",
          featured: false,
          available: true,
          ingredients: ["Yam flour", "Melon seeds", "Vegetables", "Meat"],
          preparationTime: 45
        }
      ];
  
      const categories = [
        { id: 1, name: "Appetizer", description: "Starters and small bites", itemCount: 5, active: true },
        { id: 2, name: "Main Course", description: "Main dishes and entrees", itemCount: 12, active: true },
        { id: 3, name: "Desserts", description: "Sweet treats and desserts", itemCount: 3, active: true },
        { id: 4, name: "Drinks", description: "Beverages and drinks", itemCount: 8, active: true }
      ];
  
      const orders = [
        {
          id: "ORD-001",
          customer: "Ada Johnson",
          date: "2024-01-15",
          items: [
            { name: "Jollof Rice", price: 3000, quantity: 2 },
            { name: "Suya", price: 2500, quantity: 1 }
          ],
          total: 8500,
          status: "completed",
          paymentMethod: "Card",
          deliveryAddress: "123 Main Street, Lagos"
        },
        {
          id: "ORD-002",
          customer: "John Smith",
          date: "2024-01-14",
          items: [
            { name: "Pounded Yam & Egusi", price: 3500, quantity: 1 }
          ],
          total: 3500,
          status: "preparing",
          paymentMethod: "Wallet",
          deliveryAddress: "456 Oak Avenue, Lagos"
        }
      ];
  
  return (
    <>
      <AdminNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
      <AdminSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userData={userData} setActiveTab={setActiveTab} activeTab={activeTab}/>
      <div className='md:flex md:justify-end'>
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-own-2">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <FontAwesomeIcon icon={faShoppingCart} className="text-3xl text-own-2 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Total Orders</h3>
                <p className="text-2xl font-bold text-own-2">{orders.length}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <FontAwesomeIcon icon={faDollarSign} className="text-3xl text-own-2 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Revenue</h3>
                <p className="text-2xl font-bold text-own-2">₦{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <FontAwesomeIcon icon={faUtensils} className="text-3xl text-own-2 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Menu Items</h3>
                <p className="text-2xl font-bold text-own-2">{menuItems.length}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <FontAwesomeIcon icon={faUser} className="text-3xl text-own-2 mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Categories</h3>
                <p className="text-2xl font-bold text-own-2">{categories.length}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-own-2 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-own-2">{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₦{order.total.toLocaleString()}</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-own-2 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-own-2 text-white text-center rounded-xl hover:bg-amber-600 transition-colors">
                    Add Menu Item
                  </button>
                  <button o className="p-4 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors">
                    View Orders
                  </button>
                  <button  className="p-4 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors">
                    Catering Packages
                  </button>
                  <button className="p-4 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors">
                    Manage Gallery
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