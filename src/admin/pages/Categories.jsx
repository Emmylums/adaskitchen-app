import React, { useState } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faDollarSign, faEdit, faPlus, faSearch, faShoppingCart, faStar, faTimes, faTrash, faUser, faUtensils } from '@fortawesome/free-solid-svg-icons';

export default function Categories() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const [activeTab, setActiveTab] = useState("Categories");
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
    
        // Form states
        const [menuForm, setMenuForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        ingredients: "",
        preparationTime: ""
        });
    
        const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: ""
        });
    
        const [packageForm, setPackageForm] = useState({
        name: "",
        description: "",
        price: "",
        minGuests: "",
        maxGuests: "",
        includes: ""
        });
    
        const [orderForm, setOrderForm] = useState({
        customer: "",
        items: [],
        deliveryAddress: "",
        paymentMethod: ""
        });
    
        // Modal states
        const [showMenuModal, setShowMenuModal] = useState(false);
        const [showCategoryModal, setShowCategoryModal] = useState(false);
        const [editingItem, setEditingItem] = useState(null);
    
        // Handlers
        const handleMenuSubmit = (e) => {
        e.preventDefault();
        // Handle menu item creation/editing
        console.log("Menu form submitted:", menuForm);
        setShowMenuModal(false);
        setMenuForm({ name: "", description: "", price: "", category: "", ingredients: "", preparationTime: "" });
        setEditingItem(null);
        };
    
        const handleCategorySubmit = (e) => {
        e.preventDefault();
        // Handle category creation/editing
        console.log("Category form submitted:", categoryForm);
        setShowCategoryModal(false);
        setCategoryForm({ name: "", description: "" });
        setEditingItem(null);
        };
    
        const handlePackageSubmit = (e) => {
        e.preventDefault();
        // Handle package creation/editing
        console.log("Package form submitted:", packageForm);
        setShowPackageModal(false);
        setPackageForm({ name: "", description: "", price: "", minGuests: "", maxGuests: "", includes: "" });
        setEditingItem(null);
        };
    
        const handleOrderSubmit = (e) => {
        e.preventDefault();
        // Handle order creation/editing
        console.log("Order form submitted:", orderForm);
        setShowOrderModal(false);
        setOrderForm({ customer: "", items: [], deliveryAddress: "", paymentMethod: "" });
        setEditingItem(null);
        };
    
        const toggleFeatured = (itemId) => {
        // Toggle featured status
        console.log("Toggle featured:", itemId);
        };
    
        const deleteItem = (itemId, type) => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            console.log(`Delete ${type}:`, itemId);
        }
        };
    
        const createInvoice = (orderId) => {
        console.log("Create invoice for:", orderId);
        };
    
        const printInvoice = (invoiceId) => {
        console.log("Print invoice:", invoiceId);
        // In real implementation, this would generate PDF
        };
  
  return (
    <>
      <AdminNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
      <AdminSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userData={userData} setActiveTab={setActiveTab} activeTab={activeTab}/>
      <div className='md:flex md:justify-end'>
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-own-2">Categories</h2>
                <button 
                onClick={() => setShowCategoryModal(true)}
                className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                <FontAwesomeIcon icon={faPlus} />
                Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {categories.map(category => (
                <div key={category.id} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-own-2">{category.name}</h3>
                    <span className="bg-own-2 text-white text-sm px-2 py-1 rounded-full">
                        {category.itemCount} items
                    </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    
                    <div className="flex justify-between items-center">
                    <span className={`text-sm ${category.active ? 'text-green-600' : 'text-red-600'}`}>
                        {category.active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex gap-2">
                        <button 
                        onClick={() => {
                            setEditingItem(category);
                            setCategoryForm({
                            name: category.name,
                            description: category.description
                            });
                            setShowCategoryModal(true);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                        <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                        onClick={() => deleteItem(category.id, 'category')}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                        <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
        </div>


        {/* Add Category Modal */}
        {showCategoryModal && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:w-full"} transition-all duration-500`}>
            <div className="bg-own-2 rounded-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                    {editingItem ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button onClick={() => setShowCategoryModal(false)} className="text-white hover:text-gray-600">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                </div>

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white mb-2">Category Name</label>
                    <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 text-white rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                    type="submit"
                    className="flex-1 shadow bg-amber-600 text-white py-3 rounded-xl hover:bg-amber-800 transition-colors"
                    >
                    {editingItem ? 'Update Category' : 'Add Category'}
                    </button>
                    <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 shadow border border-white text-white py-3 rounded-xl hover:bg-gray-50 hover:text-amber-800 transition-colors"
                    >
                    Cancel
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
      </div>
    </>
  );
}