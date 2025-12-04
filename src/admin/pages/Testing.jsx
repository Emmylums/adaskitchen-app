  import React, { useState } from "react";
  import { motion } from 'framer-motion';
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { 
    faUtensils,
    faTags,
    faImages,
    faBox,
    faReceipt,
    faFileInvoice,
    faPlus,
    faEdit,
    faTrash,
    faEye,
    faStar,
    faSearch,
    faFilter,
    faChevronDown,
    faChevronUp,
    faSave,
    faTimes,
    faUpload,
    faPrint,
    faDownload,
    faCalendarAlt,
    faUser,
    faDollarSign,
    faShoppingCart,
    faClipboardList,
    faChartBar,
    faCog
  } from "@fortawesome/free-solid-svg-icons";

  export default function Testing() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [expandedItem, setExpandedItem] = useState(null);

    // Mock admin data
    const adminData = {
      name: "Admin User",
      email: "admin@tasteofnigeria.com",
      role: "Administrator"
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
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-own-2 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <div className="flex items-center justify-between p-4 border-b border-amber-400">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-lg hover:bg-amber-600">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <nav className="p-4">
            <div className="mb-8">
              <div className="flex items-center gap-3 p-3 bg-amber-600 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-own-2 font-bold">
                  {adminData.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{adminData.name}</p>
                  <p className="text-sm text-amber-100">{adminData.role}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={() => setActiveTab("overview")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "overview" ? 'bg-amber-600' : 'hover:bg-amber-600'}`}>
                <FontAwesomeIcon icon={faChartBar} />
                Overview
              </button>
              
              <button onClick={() => setActiveTab("menu")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "menu" ? 'bg-amber-600' : 'hover:bg-amber-600'}`}>
                <FontAwesomeIcon icon={faUtensils} />
                Menu Management
              </button>
              
              <button onClick={() => setActiveTab("categories")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "categories" ? 'bg-amber-600' : 'hover:bg-amber-600'}`}>
                <FontAwesomeIcon icon={faTags} />
                Categories
              </button>
              
              <button onClick={() => setActiveTab("gallery")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "gallery" ? 'bg-amber-600' : 'hover:bg-amber-600'}`}>
                <FontAwesomeIcon icon={faImages} />
                Gallery
              </button>
              
              <button onClick={() => setActiveTab("catering")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "catering" ? 'bg-amber-600' : 'hover:bg-amber-600'}`}>
                <FontAwesomeIcon icon={faBox} />
                Catering Packages
              </button>
              
              <button onClick={() => setActiveTab("orders")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "orders" ? 'bg-amber-600' : 'hover:bg-amber-600'}`}>
                <FontAwesomeIcon icon={faShoppingCart} />
                Orders
              </button>
              
              <button onClick={() => setActiveTab("invoices")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "invoices" ? 'bg-amber-600' : 'hover:bg-amber-600'}`}>
                <FontAwesomeIcon icon={faFileInvoice} />
                Invoices
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between p-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} className="text-own-2" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <FontAwesomeIcon icon={faCog} className="text-own-2" />
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
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
                      <button onClick={() => setActiveTab("menu")} className="p-4 bg-own-2 text-white text-center rounded-xl hover:bg-amber-600 transition-colors">
                        Add Menu Item
                      </button>
                      <button onClick={() => setActiveTab("orders")} className="p-4 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors">
                        View Orders
                      </button>
                      <button onClick={() => setActiveTab("catering")} className="p-4 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors">
                        Catering Packages
                      </button>
                      <button onClick={() => setActiveTab("gallery")} className="p-4 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors">
                        Manage Gallery
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Management Tab */}
            {activeTab === "menu" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-own-2">Menu Management</h2>
                  <button 
                    onClick={() => setShowMenuModal(true)}
                    className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Menu Item
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="relative">
                    <select
                      className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-own-2">Categories</h2>
                  <button 
                    onClick={() => setShowCategoryModal(true)}
                    className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Category
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            )}

            {/* Gallery Tab */}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-own-2">Gallery Management</h2>
                  <button className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2">
                    <FontAwesomeIcon icon={faUpload} />
                    Upload Images
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryImages.map(image => (
                    <div key={image.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-own-2 to-amber-400"></div>
                      <div className="p-4">
                        <h3 className="font-semibold text-own-2 mb-1">{image.caption}</h3>
                        <p className="text-sm text-gray-600 mb-3">{image.category}</p>
                        <div className="flex gap-2">
                          <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm">
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteItem(image.id, 'image')}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catering Packages Tab */}
            {activeTab === "catering" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-own-2">Catering Packages</h2>
                  <button 
                    onClick={() => setShowPackageModal(true)}
                    className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Package
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {cateringPackages.map(pkg => (
                    <div key={pkg.id} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-own-2">{pkg.name}</h3>
                        <span className="bg-own-2 text-white text-sm px-3 py-1 rounded-full">
                          ₦{pkg.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{pkg.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-own-2 mb-2">Includes:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {pkg.includes.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {pkg.minGuests}-{pkg.maxGuests} guests
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingItem(pkg);
                              setPackageForm({
                                name: pkg.name,
                                description: pkg.description,
                                price: pkg.price,
                                minGuests: pkg.minGuests,
                                maxGuests: pkg.maxGuests,
                                includes: pkg.includes.join(', ')
                              });
                              setShowPackageModal(true);
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button 
                            onClick={() => deleteItem(pkg.id, 'package')}
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
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-own-2">Order Management</h2>
                  <button 
                    onClick={() => setShowOrderModal(true)}
                    className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Order
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-own-2">{order.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{order.total.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button className="text-own-2 hover:text-amber-600">View</button>
                              <button className="text-blue-600 hover:text-blue-900">Edit</button>
                              <button 
                                onClick={() => deleteItem(order.id, 'order')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                              <button 
                                onClick={() => createInvoice(order.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Create Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-own-2">Invoice Management</h2>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map(invoice => (
                          <tr key={invoice.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-own-2">{invoice.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.orderId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.customer}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{invoice.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button className="text-own-2 hover:text-amber-600">View</button>
                              <button className="text-blue-600 hover:text-blue-900">Edit</button>
                              <button 
                                onClick={() => printInvoice(invoice.id)}
                                className="text-green-600 hover:text-green-900 flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faPrint} />
                                Print PDF
                              </button>
                              <button 
                                onClick={() => deleteItem(invoice.id, 'invoice')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Add Menu Item Modal */}
        {showMenuModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

        {/* Add Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">
                  {editingItem ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
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
                    className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    {editingItem ? 'Update Category' : 'Add Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Package Modal */}
        {showPackageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">
                  {editingItem ? 'Edit Catering Package' : 'Add New Catering Package'}
                </h3>
                <button onClick={() => setShowPackageModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handlePackageSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦)</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({...packageForm, price: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Guests</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={packageForm.minGuests}
                      onChange={(e) => setPackageForm({...packageForm, minGuests: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Guests</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={packageForm.maxGuests}
                      onChange={(e) => setPackageForm({...packageForm, maxGuests: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What's Included (comma separated)</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    value={packageForm.includes}
                    onChange={(e) => setPackageForm({...packageForm, includes: e.target.value})}
                    placeholder="Jollof Rice, Fried Rice, Chicken, Salad, Drinks..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    {editingItem ? 'Update Package' : 'Add Package'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPackageModal(false)}
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
    );
  }