import React, { useState } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faDollarSign, faEdit, faPlus, faSearch, faShoppingCart, faStar, faTimes, faTrash, faUser, faUtensils } from '@fortawesome/free-solid-svg-icons';

export default function MenuManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [expandedItem, setExpandedItem] = useState(null);

  const [activeTab, setActiveTab] = useState("Menu");
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
  
      const cateringPackages = [
        {
          id: 1,
          name: "Standard Package",
          description: "Perfect for small gatherings",
          price: 25000,
          includes: ["Jollof Rice", "Fried Rice", "Chicken", "Salad", "Drinks"],
          minGuests: 10,
          maxGuests: 50,
          active: true
        },
        {
          id: 2,
          name: "Premium Package",
          description: "Ideal for corporate events",
          price: 50000,
          includes: ["All Standard items", "Suya", "Small chops", "Dessert", "Premium drinks"],
          minGuests: 50,
          maxGuests: 200,
          active: true
        }
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
  
      const invoices = [
        {
          id: "INV-001",
          orderId: "ORD-001",
          customer: "Ada Johnson",
          date: "2024-01-15",
          amount: 8500,
          status: "paid",
          dueDate: "2024-01-15"
        }
      ];
  
      const galleryImages = [
        { id: 1, url: "/api/placeholder/300/200", caption: "Jollof Rice", category: "Food" },
        { id: 2, url: "/api/placeholder/300/200", caption: "Restaurant Interior", category: "Ambiance" },
        { id: 3, url: "/api/placeholder/300/200", caption: "Customer Event", category: "Events" }
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
      const [showPackageModal, setShowPackageModal] = useState(false);
      const [showOrderModal, setShowOrderModal] = useState(false);
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
            <h2 className="text-2xl font-bold text-own-2 mb-6">Menu Management</h2>
            <button 
                onClick={() => setShowMenuModal(true)}
                className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2 mb-6"
            >
                <FontAwesomeIcon icon={faPlus} />
                Add Menu Item
            </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-black" />
                </div>
                <input
                type="text"
                placeholder="Search menu items..."
                className="pl-10 pr-4 py-2 w-full border border-black text-black placeholder:text-black rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="relative">
                <select
                className="appearance-none pl-3 pr-10 py-2 border border-black text-black rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FontAwesomeIcon icon={faChevronDown} className="text-black" />
                </div>
            </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {menuItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-own-2 to-amber-400 relative">
                    {item.featured && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-full text-sm">
                        <FontAwesomeIcon icon={faStar} className="mr-1" />
                        Featured
                    </div>
                    )}
                </div>
                
                <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-own-2">{item.name}</h3>
                    <span className="font-bold text-own-2">₦{item.price.toLocaleString()}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    
                    <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{item.category}</span>
                    <div className="flex gap-2">
                        <button 
                        onClick={() => toggleFeatured(item.id)}
                        className={`p-2 rounded-lg ${item.featured ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'} hover:bg-amber-200`}
                        >
                        <FontAwesomeIcon icon={faStar} />
                        </button>
                        <button 
                        onClick={() => {
                            setEditingItem(item);
                            setMenuForm({
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            ingredients: item.ingredients.join(', '),
                            preparationTime: item.preparationTime
                            });
                            setShowMenuModal(true);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                        <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                        onClick={() => deleteItem(item.id, 'menu item')}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                        <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
        {/* Add Menu Item Modal */}
        {showMenuModal && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:w-full"} transition-all duration-500`}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">
                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button onClick={() => setShowMenuModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                </div>

                <form onSubmit={handleMenuSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={menuForm.name}
                        onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦)</label>
                    <input
                        type="number"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={menuForm.category}
                        onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Time (minutes)</label>
                    <input
                        type="number"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={menuForm.preparationTime}
                        onChange={(e) => setMenuForm({...menuForm, preparationTime: e.target.value})}
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (comma separated)</label>
                    <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    value={menuForm.ingredients}
                    onChange={(e) => setMenuForm({...menuForm, ingredients: e.target.value})}
                    placeholder="Rice, Tomatoes, Bell peppers, Onions..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                    type="checkbox"
                    id="featured"
                    className="h-4 w-4 text-own-2 focus:ring-own-2"
                    />
                    <label htmlFor="featured" className="text-sm text-gray-700">
                    Feature this item on homepage
                    </label>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                    type="submit"
                    className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                    {editingItem ? 'Update Menu Item' : 'Add Menu Item'}
                    </button>
                    <button
                    type="button"
                    onClick={() => setShowMenuModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
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