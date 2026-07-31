import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faShoppingCart, faPlus, faMinus, faFilter, faBan, faStoreAltSlash } from "@fortawesome/free-solid-svg-icons";
import AlertBanner from "../../components/AlertBanner";
import { useCart } from "../../context/CartContext";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { getMenuItems, getCategories } from "../services/menuService"; 
import { useUserData } from "../hooks/useUserData";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function Menu() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Menu");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  const { addToCart, getTotalItems } = useCart();
  const { userData, loading: userLoading } = useUserData();

  // Fetch menu data and restaurant status
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch restaurant status
        try {
          const statusRef = doc(db, "settings", "restaurantStatus");
          const statusSnap = await getDoc(statusRef);
          if (statusSnap.exists()) {
            setIsRestaurantOpen(statusSnap.data().isOpen !== undefined ? statusSnap.data().isOpen : true);
          } else {
            setIsRestaurantOpen(true);
          }
        } catch (statusError) {
          console.error("Error fetching restaurant status:", statusError);
          setIsRestaurantOpen(true);
        }
        setStatusLoading(false);

        // 2. Fetch menu items
        const [items, cats] = await Promise.all([
          getMenuItems(),
          getCategories()
        ]);
        const sortedItems = [...items].sort((a, b) => {
          if (a.available && !b.available) return -1;
          if (!a.available && b.available) return 1;
          return 0;
        });
        setMenuItems(sortedItems);
        setCategories(cats);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setError("Failed to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = searchTerm.trim() === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return 0;
  });

  const [quantities, setQuantities] = useState({});
  useEffect(() => {
    if (menuItems.length > 0) {
      const initialQuantities = {};
      menuItems.forEach(item => {
        initialQuantities[item.id] = 1;
      });
      setQuantities(initialQuantities);
    }
  }, [menuItems]);

  const showAlert = (message, type) => {
    setAlert({ message, type, visible: true });
    setTimeout(() => setAlert(null), 3000);
  };

  const increaseQuantity = (id) => {
    if (!isRestaurantOpen) return;
    setQuantities(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const decreaseQuantity = (id) => {
    if (!isRestaurantOpen) return;
    setQuantities(prev => ({ ...prev, [id]: Math.max(prev[id] - 1, 1) }));
  };

  const handleInputChange = (e, id) => {
    if (!isRestaurantOpen) return;
    const value = e.target.value;
    if (value === "") {
      setQuantities(prev => ({ ...prev, [id]: "" }));
      return;
    }
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setQuantities(prev => ({ ...prev, [id]: Math.max(parsedValue, 1) }));
    }
  };

  const handleInputBlur = (id) => {
    if (!isRestaurantOpen) return;
    setQuantities(prev => ({
      ...prev,
      [id]: prev[id] === "" || prev[id] < 1 ? 1 : prev[id]
    }));
  };

  const handleAddToCart = (item) => {
    if (!isRestaurantOpen) {
      showAlert("Restaurant is currently closed. Cannot add items.", "error");
      return;
    }
    if (!item.available) return;
    const quantity = quantities[item.id] || 1;
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

  if (loading || statusLoading || userLoading) {
    return (
      <>
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen} userData={userData} />
        <UserSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userData={userData} setActiveTab={setActiveTab} activeTab={activeTab} />
        <div className="lg:flex lg:justify-end">
          <div className={`pt-32 px-5 ${isSidebarOpen ? "lg:w-[75%]" : "lg:w-full"} transition-all duration-500`}>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Loading menu...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen} userData={userData} />
      <UserSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userData={userData} setActiveTab={setActiveTab} activeTab={activeTab} />
      
      {/* Floating Cart Icon - disabled when closed */}
      <Link to="/user/Cart" className={`fixed bottom-28 right-5 z-50 ${!isRestaurantOpen ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="relative bg-own-2 p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
          <FontAwesomeIcon icon={faShoppingCart} />
          {getTotalItems() > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg">
              {getTotalItems()}
            </div>
          )}
        </div>
      </Link>

      <div className="lg:flex lg:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "lg:w-[75%]" : "lg:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <h3 className="text-own-2 mb-6 uppercase font-bold text-2xl font-display2 tracking-wider">Menu</h3>
                
                {/* Restaurant closed banner */}
                {!isRestaurantOpen && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <FontAwesomeIcon icon={faStoreAltSlash} className="text-red-500 text-2xl mr-3" />
                    <div>
                      <p className="text-red-700 font-semibold">Restaurant is currently closed</p>
                      <p className="text-red-600 text-sm">Orders cannot be placed right now. Please check back later.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center py-12">
                    <p className="text-xl text-red-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 bg-own-2 text-white px-6 py-2 rounded-full hover:bg-own-2/90 transition">Retry</button>
                  </div>
                )}

                {!error && (
                  <>
                    <div className="max-w-6xl mx-auto pt-5">
                      <div className="flex flex-row gap-4 justify-center items-center">
                        <div className="relative w-2/3">
                          <input type="text" placeholder="Search for dishes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-6 py-4 pr-14 rounded-full border border-own-2 focus:ring-own-2 focus:ring-2 text-lg shadow-md placeholder:text-own-2 text-own-2" />
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none"><FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-own-2" /></div>
                        </div>
                        <div className="relative w-1/3">
                          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-6 py-4 pr-10 rounded-full border border-own-1 focus:ring-own-1 focus:ring-2 text-lg shadow-md appearance-none bg-own-2 cursor-pointer">
                            {categories.map(category => <option key={category} value={category}>{category}</option>)}
                          </select>
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none"><FontAwesomeIcon icon={faFilter} className="w-5 h-5" /></div>
                        </div>
                      </div>
                      <div className="text-center mt-4 text-gray-600">
                        Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                        {selectedCategory !== "All" && ` in ${selectedCategory}`}
                        {searchTerm && ` matching "${searchTerm}"`}
                        {!isRestaurantOpen && " — Orders disabled"}
                      </div>
                    </div>

                    <div className="max-w-7xl mx-auto pt-4 pb-8">
                      {filteredItems.length > 0 ? (
                        <div className={`grid gap-10 pt-10 ${isSidebarOpen ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 landscape:sm:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 landscape:sm:grid-cols-2 landscape:lg:grid-cols-3"}`}>
                          {filteredItems.map((item, index) => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              index={index}
                              quantity={quantities[item.id] || 1}
                              increaseQuantity={increaseQuantity}
                              decreaseQuantity={decreaseQuantity}
                              handleInputChange={handleInputChange}
                              handleInputBlur={handleInputBlur}
                              handleAddToCart={handleAddToCart}
                              renderStars={renderStars}
                              isRestaurantOpen={isRestaurantOpen}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-xl text-black">No dishes found.</p>
                          <button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }} className="mt-4 bg-own-2 text-white px-6 py-2 rounded-full hover:bg-own-2/90 transition">Clear Filters</button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Individual Menu Item Card Component
function MenuItemCard({
  item,
  index,
  quantity,
  increaseQuantity,
  decreaseQuantity,
  handleInputChange,
  handleInputBlur,
  handleAddToCart,
  renderStars,
  isRestaurantOpen
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const disabled = !item.available || !isRestaurantOpen;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      className={`bg-white rounded-3xl shadow-lg overflow-hidden transition-transform transform ${!disabled ? 'hover:scale-105' : ''}`}
    >
      <div className="relative">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className={`w-full h-60 object-cover ${!item.available ? 'opacity-60' : ''}`}
          onError={(e) => { e.target.src = "/fallback-image.jpg"; }}
        />
        {!item.available && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <FontAwesomeIcon icon={faBan} className="w-3 h-3" /> Unavailable
          </div>
        )}
        {!isRestaurantOpen && item.available && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white text-xl font-bold bg-gray-700 px-4 py-2 rounded-md">Orders Closed</span>
          </div>
        )}
      </div>
      <div className={`p-6 ${disabled ? 'bg-gray-100' : ''}`}>
        <h3 className={`text-xl font-bold mb-2 ${disabled ? 'text-gray-500' : 'text-own-2'}`}>{item.name}</h3>
        <p className={`mb-2 ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>{item.description || "No description available"}</p>
        {item.rating && (
          <div className="flex items-center mb-4">
            {renderStars(item.rating)}
            <span className={`ml-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>({item.rating})</span>
          </div>
        )}
        <div className="mb-4">
          <p className={`text-sm font-medium ${!item.available ? 'text-red-600' : isRestaurantOpen ? 'text-green-600' : 'text-orange-600'}`}>
            {!item.available ? 'Not Available' : isRestaurantOpen ? 'Available' : 'Orders Paused'}
          </p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => decreaseQuantity(item.id)} 
              disabled={disabled}
              className={`${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-own-2 hover:bg-own-2/90'} text-white p-2 rounded-full z-30`}
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => handleInputChange(e, item.id)}
              onBlur={() => handleInputBlur(item.id)}
              disabled={disabled}
              className={`w-16 text-center p-2 border rounded-lg font-bold text-lg ${disabled ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'text-black'}`}
            />
            <button
              onClick={() => increaseQuantity(item.id)}
              disabled={disabled}
              className={`p-2 rounded-full z-30 text-white ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-own-2 hover:bg-own-2/90'}`}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          <span className={`text-lg font-semibold ${disabled ? 'text-gray-500' : 'text-gray-800'}`}>
            £{(item.price || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => handleAddToCart(item)}
            disabled={disabled}
            className={`w-full py-3 rounded-full font-semibold transition z-30 ${
              disabled ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-own-2 text-white hover:bg-own-2/90'
            }`}
          >
            {!item.available ? 'Unavailable' : !isRestaurantOpen ? 'Closed' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}