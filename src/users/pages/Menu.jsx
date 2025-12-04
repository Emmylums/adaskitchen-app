import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faShoppingCart, faPlus, faMinus, faFilter } from "@fortawesome/free-solid-svg-icons";
import AlertBanner from "../../components/AlertBanner";
import { useCart } from "../../context/CartContext";
import allDishes from "../../data/alldishes";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";

export default function Menu() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Menu");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [alert, setAlert] = useState({ message: "", type: "", visible: false }); 

  const { addToCart, getTotalItems } = useCart();

  // Get unique categories
  const categories = ["All", ...new Set(allDishes.map(item => item.category))];

  const filteredItems = allDishes.filter(item => {
    const matchesSearch = searchTerm.trim() === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const [quantities, setQuantities] = useState(
    allDishes.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
  );

  const showAlert = (message, type) => {
    setAlert({ message, type, visible: true });
    setTimeout(() => setAlert({ message: "", type: "", visible: false }), 3000);
  };

  const increaseQuantity = (id, stock) => {
    setQuantities(prev => ({ ...prev, [id]: Math.min(prev[id] + 1, stock) }));
  };

  const decreaseQuantity = (id) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(prev[id] - 1, 1) }));
  };

  const handleInputChange = (e, id, stock) => {
    const value = e.target.value;
    if (value === "") {
      setQuantities(prev => ({ ...prev, [id]: "" }));
      return;
    }
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setQuantities(prev => ({ ...prev, [id]: Math.min(Math.max(parsedValue, 1), stock) }));
    }
  };

  const handleInputBlur = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: prev[id] === "" || prev[id] < 1 ? 1 : prev[id]
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = quantities[item.id];
    addToCart(item, quantity);
    showAlert(`${quantity} ${item.name} added to cart!`, "success");
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.24 3.826a1 1 0 00.95.69h4.016c.969 0 1.371 1.24.588 1.81l-3.248 2.357a1 1 0 00-.364 1.118l1.24 3.826c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.248 2.357c-.785.57-1.84-.197-1.54-1.118l1.24-3.826a1 1 0 00-.364-1.118L2.84 9.253c-.783-.57-.38-1.81.588-1.81h4.016a1 1 0 00.95-.69l1.24-3.826z" />
      </svg>
    ));
  };

  // Simple grouping for grid layout
  const rows = [];
  for (let i = 0; i < filteredItems.length; i += 3) {
    rows.push(filteredItems.slice(i, i + 3));
  }

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
        {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
      <UserSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userData={userData} setActiveTab={setActiveTab} activeTab={activeTab}/>
      
      {/* Floating Cart Icon */}
      <div className="fixed bottom-28 right-5 z-50">
        <Link to="/user/Cart" className="relative bg-own-2 p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
          <FontAwesomeIcon icon={faShoppingCart} />
          {getTotalItems() > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg">
              {getTotalItems()}
            </div>
          )}
        </Link>
      </div>

      <div className="md:flex md:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <h3 className="text-own-2 mb-6 uppercase font-bold text-2xl font-display2 tracking-wider">Menu</h3>
                
                {/* Search Bar and Category Filter */}
                <div className="max-w-6xl mx-auto pt-5">
                  <div className="flex flex-row gap-4 justify-center items-center">
                    {/* Search Input */}
                    <div className="relative w-2/3">
                      <input
                        type="text"
                        placeholder="Search for dishes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-6 py-4 pr-14 rounded-full border border-own-2 focus:ring-own-2 focus:ring-2 text-lg shadow-md placeholder:text-own-2 text-own-2"
                      />
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-own-2" />
                      </div>
                    </div>
        
                    {/* Category Dropdown */}
                    <div className="relative w-1/3">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-6 py-4 pr-10 rounded-full border border-own-1 focus:ring-own-1 focus:ring-2 text-lg shadow-md appearance-none bg-own-2 cursor-pointer"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faFilter} className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
        
                  {/* Results Count */}
                  <div className="text-center mt-4 text-gray-600">
                    Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                    {selectedCategory !== "All" && ` in ${selectedCategory}`}
                    {searchTerm && ` matching "${searchTerm}"`}
                  </div>
                </div>
        
                {/* Menu Items */}
                <div className="max-w-7xl mx-auto pt-4 pb-8">
                  {rows.length > 0 ? (
                    rows.map((row, index) => (
                      <RowWithAnimation
                        key={index}
                        row={row}
                        quantities={quantities}
                        increaseQuantity={increaseQuantity}
                        decreaseQuantity={decreaseQuantity}
                        handleInputChange={handleInputChange}
                        handleInputBlur={handleInputBlur}
                        handleAddToCart={handleAddToCart}
                        renderStars={renderStars} 
                        isSideBarOpen={isSidebarOpen}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xl text-black">No dishes found matching your criteria.</p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("All");
                        }}
                        className="mt-4 bg-own-2 text-white px-6 py-2 rounded-full hover:bg-own-2/90 transition"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RowWithAnimation({
  row,
  quantities,
  increaseQuantity,
  decreaseQuantity,
  handleInputChange,
  handleInputBlur,
  handleAddToCart,
  renderStars, 
  isSideBarOpen
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Determine grid columns based on sidebar state and number of items
  const getGridClass = () => {
    if (isSideBarOpen) {
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
    } else {
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className={`grid gap-10 pt-10 ${getGridClass()}`}
    >
      {row.map((item, itemIndex) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: itemIndex * 0.2, duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden transition-transform transform hover:scale-105"
        >
          <img src={item.image} alt={item.name} className="w-full h-60 object-cover" />
          <div className="p-6">
            <h3 className="text-xl font-bold text-own-2 mb-2">{item.name}</h3>
            <p className="text-gray-700 mb-2">{item.description}</p>
            <div className="flex items-center mb-2">
              {renderStars(item.rating)}
              <span className="ml-2 text-sm text-gray-500">({item.rating})</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">In stock: {item.stock}</p>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => decreaseQuantity(item.id)} className="bg-own-2 text-white p-2 rounded-full z-30">
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={quantities[item.id]}
                  onChange={(e) => handleInputChange(e, item.id, item.stock)}
                  onBlur={() => handleInputBlur(item.id)}
                  className="w-16 text-center z-30 text-black p-2 border rounded-lg font-bold text-lg"
                />
                <button
                  onClick={() => increaseQuantity(item.id, item.stock)}
                  className={`p-2 rounded-full z-30 text-white ${quantities[item.id] >= item.stock ? 'bg-gray-400 cursor-not-allowed' : 'bg-own-2'}`}
                  disabled={quantities[item.id] >= item.stock}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
              <span className="text-lg font-semibold text-gray-800">£{item.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full py-3 bg-own-2 text-white rounded-full font-semibold hover:bg-own-2/90 transition z-30"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}