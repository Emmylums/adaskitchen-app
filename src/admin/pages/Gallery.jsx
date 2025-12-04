import React, { useState } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faDollarSign, faEdit, faPlus, faSearch, faShoppingCart, faStar, faTimes, faTrash, faUpload, faUser, faUtensils } from '@fortawesome/free-solid-svg-icons';

export default function Gallery() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [expandedItem, setExpandedItem] = useState(null);

  const [activeTab, setActiveTab] = useState("Gallery");
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
              <h2 className="text-2xl font-bold text-own-2">Gallery Management</h2>
              <button className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2">
                <FontAwesomeIcon icon={faUpload} />
                Upload Images
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
        </div>
      </div>
    </>
  );
}