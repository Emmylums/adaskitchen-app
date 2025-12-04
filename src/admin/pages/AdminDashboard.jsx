import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUtensils,
  faEye,
  faCreditCard,
  faStar,
  faTags,
  faUsers,
  faImage,
  faBox,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faSearch,
  faFilter,
  faChevronDown,
  faChevronUp
} from "@fortawesome/free-solid-svg-icons";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("menu");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock data
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "Jollof Rice", price: 2500, category: "Main Course", featured: true, description: "Traditional Nigerian rice dish" },
    { id: 2, name: "Suya", price: 2000, category: "Appetizer", featured: true, description: "Spicy grilled meat skewers" },
    { id: 3, name: "Pounded Yam", price: 1800, category: "Main Course", featured: false, description: "Smooth yam dish with soup" },
    { id: 4, name: "Chin Chin", price: 1200, category: "Dessert", featured: false, description: "Crispy fried snacks" }
  ]);

  const [categories, setCategories] = useState(["Main Course", "Appetizer", "Dessert", "Drinks"]);
  const [employees, setEmployees] = useState([
    { id: 1, name: "John Doe", role: "Manager", email: "john@restaurant.com", phone: "+234 912 345 6789" },
    { id: 2, name: "Jane Smith", role: "Chef", email: "jane@restaurant.com", phone: "+234 912 345 6788" }
  ]);
  const [featuredDishes, setFeaturedDishes] = useState([1, 2, 3]);
  const [sceneryImages, setSceneryImages] = useState([]);
  const [cateringPackages, setCateringPackages] = useState([
    { id: 1, name: "Basic Package", price: 50000, description: "Perfect for small gatherings" },
    { id: 2, name: "Premium Package", price: 100000, description: "Ideal for corporate events" }
  ]);

  const [paymentDetails, setPaymentDetails] = useState({
    bankName: "Nigerian Bank",
    accountNumber: "1234567890",
    accountName: "Restaurant Name",
    paymentMethods: ["Card", "Transfer", "Cash"]
  });

  // State for forms
  const [newMenuItem, setNewMenuItem] = useState({ name: "", price: "", category: "", description: "" });
  const [newCategory, setNewCategory] = useState("");
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "", email: "", phone: "" });
  const [newPackage, setNewPackage] = useState({ name: "", price: "", description: "" });
  const [editingItem, setEditingItem] = useState(null);

  // Menu Management Functions
  const addMenuItem = () => {
    const newItem = {
      id: Date.now(),
      ...newMenuItem,
      price: parseInt(newMenuItem.price),
      featured: false
    };
    setMenuItems([...menuItems, newItem]);
    setNewMenuItem({ name: "", price: "", category: "", description: "" });
  };

  const updateMenuItem = () => {
    setMenuItems(menuItems.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditingItem(null);
  };

  const deleteMenuItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    setFeaturedDishes(featuredDishes.filter(dishId => dishId !== id));
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const deleteCategory = (category) => {
    if (menuItems.some(item => item.category === category)) {
      alert("Cannot delete category with existing menu items");
      return;
    }
    setCategories(categories.filter(cat => cat !== category));
  };

  // Employee Management Functions
  const addEmployee = () => {
    const employee = {
      id: Date.now(),
      ...newEmployee
    };
    setEmployees([...employees, employee]);
    setNewEmployee({ name: "", role: "", email: "", phone: "" });
  };

  const updateEmployee = (employee) => {
    setEmployees(employees.map(emp => 
      emp.id === employee.id ? employee : emp
    ));
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  // Featured Dishes Functions
  const toggleFeatured = (dishId) => {
    if (featuredDishes.includes(dishId)) {
      setFeaturedDishes(featuredDishes.filter(id => id !== dishId));
    } else {
      if (featuredDishes.length >= 3) {
        alert("Maximum 3 featured dishes allowed");
        return;
      }
      setFeaturedDishes([...featuredDishes, dishId]);
    }
  };

  // Image Upload Function
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));
    setSceneryImages([...sceneryImages, ...newImages]);
  };

  const deleteImage = (id) => {
    setSceneryImages(sceneryImages.filter(img => img.id !== id));
  };

  // Catering Packages Functions
  const addPackage = () => {
    const packageItem = {
      id: Date.now(),
      ...newPackage,
      price: parseInt(newPackage.price)
    };
    setCateringPackages([...cateringPackages, packageItem]);
    setNewPackage({ name: "", price: "", description: "" });
  };

  const updatePackage = (packageItem) => {
    setCateringPackages(cateringPackages.map(pkg => 
      pkg.id === packageItem.id ? packageItem : pkg
    ));
  };

  const deletePackage = (id) => {
    setCateringPackages(cateringPackages.filter(pkg => pkg.id !== id));
  };

  // Payment Details Functions
  const updatePaymentDetails = (updates) => {
    setPaymentDetails({ ...paymentDetails, ...updates });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-own-2 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-amber-400">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <button onClick={toggleSidebar} className="p-1 rounded-lg hover:bg-amber-600">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <nav className="p-4">
          {[
            { id: "menu", icon: faUtensils, label: "Menu Management" },
            { id: "payments", icon: faCreditCard, label: "Payment Details" },
            { id: "featured", icon: faStar, label: "Featured Dishes" },
            { id: "categories", icon: faTags, label: "Categories" },
            { id: "employees", icon: faUsers, label: "Employee Management" },
            { id: "scenery", icon: faImage, label: "Scenery Images" },
            { id: "catering", icon: faBox, label: "Catering Packages" }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                activeSection === item.id ? 'bg-amber-600 text-white' : 'hover:bg-amber-700'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between p-4">
            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100">
              <FontAwesomeIcon icon={isSidebarOpen ? faChevronDown : faChevronUp} />
            </button>
            <h1 className="text-2xl font-bold text-own-2">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace(/([A-Z])/g, ' $1')}
            </h1>
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Menu Management Section */}
          {activeSection === "menu" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">Menu Management</h3>
                <button 
                  onClick={() => setEditingItem({ id: Date.now(), name: "", price: "", category: "", description: "" })}
                  className="bg-own-2 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Menu Item
                </button>
              </div>

              {/* Add/Edit Form */}
              {(editingItem || newMenuItem.name) && (
                <div className="mb-6 p-4 border border-gray-200 rounded-xl">
                  <h4 className="font-semibold mb-4">
                    {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={editingItem ? editingItem.name : newMenuItem.name}
                      onChange={(e) => editingItem 
                        ? setEditingItem({...editingItem, name: e.target.value})
                        : setNewMenuItem({...newMenuItem, name: e.target.value})
                      }
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={editingItem ? editingItem.price : newMenuItem.price}
                      onChange={(e) => editingItem
                        ? setEditingItem({...editingItem, price: e.target.value})
                        : setNewMenuItem({...newMenuItem, price: e.target.value})
                      }
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                    <select
                      value={editingItem ? editingItem.category : newMenuItem.category}
                      onChange={(e) => editingItem
                        ? setEditingItem({...editingItem, category: e.target.value})
                        : setNewMenuItem({...newMenuItem, category: e.target.value})
                      }
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Description"
                      value={editingItem ? editingItem.description : newMenuItem.description}
                      onChange={(e) => editingItem
                        ? setEditingItem({...editingItem, description: e.target.value})
                        : setNewMenuItem({...newMenuItem, description: e.target.value})
                      }
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={editingItem ? updateMenuItem : addMenuItem}
                      className="bg-own-2 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      {editingItem ? "Update" : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setNewMenuItem({ name: "", price: "", category: "", description: "" });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Menu Items List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-lg text-own-2">{item.name}</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-own-2">₦{item.price}</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Details Section */}
          {activeSection === "payments" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-own-2 mb-6">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Bank Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={paymentDetails.bankName}
                        onChange={(e) => updatePaymentDetails({ bankName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={paymentDetails.accountNumber}
                        onChange={(e) => updatePaymentDetails({ accountNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                      <input
                        type="text"
                        value={paymentDetails.accountName}
                        onChange={(e) => updatePaymentDetails({ accountName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Accepted Payment Methods</h4>
                  <div className="space-y-2">
                    {paymentDetails.paymentMethods.map((method, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                        <span>{method}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2 border-2 border-dashed border-own-2 text-own-2 rounded-xl hover:bg-amber-50">
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Payment Method
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Featured Dishes Section */}
          {activeSection === "featured" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-own-2 mb-6">Featured Dishes</h3>
              <p className="text-gray-600 mb-4">Select up to 3 dishes to feature on the homepage</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item.id} className={`border-2 rounded-xl p-4 transition-all ${
                    featuredDishes.includes(item.id) 
                      ? 'border-own-2 bg-amber-50' 
                      : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-lg">{item.name}</h5>
                      <button
                        onClick={() => toggleFeatured(item.id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          featuredDishes.includes(item.id)
                            ? 'bg-own-2 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {featuredDishes.includes(item.id) ? 'Featured' : 'Feature'}
                      </button>
                    </div>
                    <p className="text-gray-600 mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-own-2">₦{item.price}</span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories Section */}
          {activeSection === "categories" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">Categories</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                  />
                  <button
                    onClick={addCategory}
                    className="bg-own-2 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(category => (
                  <div key={category} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                    <span className="font-medium">{category}</span>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employee Management Section */}
          {activeSection === "employees" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">Employee Management</h3>
                <button 
                  onClick={() => setNewEmployee({ name: "", role: "", email: "", phone: "" })}
                  className="bg-own-2 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Employee
                </button>
              </div>

              {/* Add Employee Form */}
              {newEmployee.name && (
                <div className="mb-6 p-4 border border-gray-200 rounded-xl">
                  <h4 className="font-semibold mb-4">Add New Employee</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={addEmployee}
                      className="bg-own-2 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setNewEmployee({ name: "", role: "", email: "", phone: "" })}
                      className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Employees List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {employees.map(employee => (
                  <div key={employee.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-lg">{employee.name}</h5>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          onClick={() => deleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{employee.role}</p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                    <p className="text-sm text-gray-500">{employee.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenery Images Section */}
          {activeSection === "scenery" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-own-2 mb-6">Scenery Images</h3>
              
              <div className="mb-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                />
                <p className="text-sm text-gray-500 mt-2">Upload images to showcase your restaurant's ambiance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sceneryImages.map(image => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FontAwesomeIcon icon={faTrash} size="xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catering Packages Section */}
          {activeSection === "catering" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">Catering Packages</h3>
                <button 
                  onClick={() => setNewPackage({ name: "", price: "", description: "" })}
                  className="bg-own-2 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Package
                </button>
              </div>

              {/* Add Package Form */}
              {newPackage.name && (
                <div className="mb-6 p-4 border border-gray-200 rounded-xl">
                  <h4 className="font-semibold mb-4">Add New Catering Package</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Package Name"
                      value={newPackage.name}
                      onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={newPackage.price}
                      onChange={(e) => setNewPackage({...newPackage, price: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newPackage.description}
                      onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                      className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={addPackage}
                      className="bg-own-2 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setNewPackage({ name: "", price: "", description: "" })}
                      className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Packages List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cateringPackages.map(pkg => (
                  <div key={pkg.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-lg">{pkg.name}</h5>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          onClick={() => deletePackage(pkg.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{pkg.description}</p>
                    <p className="font-bold text-own-2 text-xl">₦{pkg.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}