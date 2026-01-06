import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion, useInView } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faShoppingCart, faPlus, faMinus, faFilter } from "@fortawesome/free-solid-svg-icons";
import AlertBanner from "../components/AlertBanner";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import { db } from "../firebaseConfig";
import { collection, getDocs, query } from "firebase/firestore";

export default function Menu() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });
  const [categories, setCategories] = useState(["All"]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart, getTotalItems } = useCart();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let categoryList = ["All"];
      try {
        const categoriesRef = collection(db, "categories");
        const categoriesQuery = query(categoriesRef);
        const categoriesSnapshot = await getDocs(categoriesQuery);
        
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name) {
            categoryList.push(data.name);
          }
        });
      } catch (catError) {
        categoryList = ["All", "Main Course", "Appetizers", "Desserts", "Drinks", "Specials"];
      }
      
      setCategories(categoryList);
      
      const items = [];
      
      try {
        const menusRef = collection(db, "menus");
        const menusQuery = query(menusRef);
        const menusSnapshot = await getDocs(menusQuery);
        
        if (menusSnapshot.size === 0) {
          try {
            const dishesRef = collection(db, "dishes");
            const dishesQuery = query(dishesRef);
            const dishesSnapshot = await getDocs(dishesQuery);
            
            dishesSnapshot.forEach((dishDoc) => {
              const dishData = dishDoc.data();
              
              items.push({
                id: dishDoc.id,
                name: dishData.name || dishData.menuItemName || `Dish ${dishDoc.id}`,
                description: dishData.description || dishData.menuItemDescription || "Delicious dish",
                price: dishData.price || dishData.menuItemPrice || 0,
                image: dishData.image || dishData.imageUrl,
                category: dishData.category || dishData.categoryName || "Uncategorized",
                rating: dishData.rating || 5,
                available: dishData.available !== undefined ? dishData.available : true,
                originalIndex: items.length
              });
            });
          } catch (dishesError) {
            // Continue with empty items array
          }
        } else {
          menusSnapshot.forEach((menuDoc) => {
            const menuData = menuDoc.data();
            
            if (menuData.menuItems && Array.isArray(menuData.menuItems)) {
              menuData.menuItems.forEach((item, index) => {
                items.push({
                  id: `${menuDoc.id}_${index}`,
                  name: item.menuItemName || item.name || `Menu Item ${index + 1}`,
                  description: item.menuItemDescription || item.description || "Delicious dish",
                  price: item.menuItemPrice || item.price || 0,
                  image: item.menuItemImage || item.image || "https://via.placeholder.com/300x200?text=Dish+Image",
                  category: menuData.categoryName || menuData.category || "Uncategorized",
                  rating: item.rating || 5,
                  available: item.available !== undefined ? item.available : true,
                  originalIndex: items.length
                });
              });
            } else if (menuData.items && Array.isArray(menuData.items)) {
              menuData.items.forEach((item, index) => {
                items.push({
                  id: `${menuDoc.id}_${index}`,
                  name: item.name || `Item ${index + 1}`,
                  description: item.description || "Delicious dish",
                  price: item.price || 0,
                  image: item.image,
                  category: menuData.categoryName || menuData.category || "Uncategorized",
                  rating: item.rating || 5,
                  available: item.available !== undefined ? item.available : true,
                  originalIndex: items.length
                });
              });
            } else if (menuData.name || menuData.menuItemName) {
              items.push({
                id: menuDoc.id,
                name: menuData.menuItemName || menuData.name || menuDoc.id,
                description: menuData.menuItemDescription || menuData.description || "Delicious dish",
                price: menuData.menuItemPrice || menuData.price || 0,
                image: menuData.imageUrl || menuData.image,
                category: menuData.categoryName || menuData.category || "Uncategorized",
                rating: menuData.rating || 5,
                available: menuData.available !== undefined ? menuData.available : true,
                originalIndex: items.length
              });
            }
          });
        }
      } catch (menuError) {
        if (menuError.code === 'permission-denied' || menuError.message.includes('permission')) {
          setError("Permission denied. Please check Firebase security rules or contact administrator.");
        } else {
          setError("Failed to load menu items. Please try again later.");
        }
        
        const sampleItems = [
          {
            id: "1",
            name: "Jollof Rice",
            description: "Traditional Nigerian rice dish",
            price: 12.99,
            image: "https://via.placeholder.com/300x200?text=Jollof+Rice",
            category: "Main Course",
            rating: 5,
            available: true,
            originalIndex: 0
          },
          {
            id: "2",
            name: "Egusi Soup",
            description: "Melon seed soup with assorted meat",
            price: 14.99,
            image: "https://via.placeholder.com/300x200?text=Egusi+Soup",
            category: "Main Course",
            rating: 4,
            available: false,
            originalIndex: 1
          }
        ];
        setMenuItems(sampleItems);
        setLoading(false);
        return;
      }
      
      if (items.length === 0) {
        const sampleItems = [
          {
            id: "1",
            name: "Jollof Rice",
            description: "Traditional Nigerian rice dish",
            price: 12.99,
            image: "https://via.placeholder.com/300x200?text=Jollof+Rice",
            category: "Main Course",
            rating: 5,
            available: true,
            originalIndex: 0
          },
          {
            id: "2",
            name: "Egusi Soup",
            description: "Melon seed soup with assorted meat",
            price: 14.99,
            image: "https://via.placeholder.com/300x200?text=Egusi+Soup",
            category: "Main Course",
            rating: 4,
            available: false,
            originalIndex: 1
          },
          {
            id: "3",
            name: "Fried Rice",
            description: "Vegetable fried rice with chicken",
            price: 11.99,
            image: "https://via.placeholder.com/300x200?text=Fried+Rice",
            category: "Main Course",
            rating: 5,
            available: true,
            originalIndex: 2
          }
        ];
        setMenuItems(sampleItems);
      } else {
        const sortedItems = items.sort((a, b) => {
          if (a.available === b.available) {
            return a.originalIndex - b.originalIndex;
          }
          return a.available ? -1 : 1;
        });
        
        setMenuItems(sortedItems);
      }
      
    } catch (err) {
      setError(`Error loading menu: ${err.message}`);
      
      setCategories(["All", "Main Course", "Appetizers", "Desserts", "Drinks"]);
      setMenuItems([
        {
          id: "1",
          name: "Sample Dish 1",
          description: "This is a sample dish for testing",
          price: 9.99,
          image: "https://via.placeholder.com/300x200?text=Sample+Dish",
          category: "Main Course",
          rating: 4,
          available: true,
          originalIndex: 0
        },
        {
          id: "2",
          name: "Sample Dish 2",
          description: "This dish is currently unavailable",
          price: 11.99,
          image: "https://via.placeholder.com/300x200?text=Unavailable",
          category: "Main Course",
          rating: 3,
          available: false,
          originalIndex: 1
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [quantities, setQuantities] = useState({});
  
  useEffect(() => {
    if (menuItems.length > 0) {
      const initialQuantities = menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {});
      setQuantities(initialQuantities);
    }
  }, [menuItems]);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = searchTerm.trim() === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedFilteredItems = [...filteredItems].sort((a, b) => {
    if (a.available === b.available) {
      return a.originalIndex - b.originalIndex;
    }
    return a.available ? -1 : 1;
  });

  const availableCount = sortedFilteredItems.filter(item => item.available).length;
  const unavailableCount = sortedFilteredItems.filter(item => !item.available).length;

  const showAlert = (message, type) => {
    setAlert({ message, type, visible: true });
    setTimeout(() => setAlert({ message: "", type: "", visible: false }), 3000);
  };

  const increaseQuantity = (id, isAvailable) => {
    if (!isAvailable) return;
    setQuantities(prev => ({ ...prev, [id]: Math.min(prev[id] + 1, 99) }));
  };

  const decreaseQuantity = (id, isAvailable) => {
    if (!isAvailable) return;
    setQuantities(prev => ({ ...prev, [id]: Math.max(prev[id] - 1, 1) }));
  };

  const handleInputChange = (e, id, isAvailable) => {
    if (!isAvailable) return;
    const value = e.target.value;
    if (value === "") {
      setQuantities(prev => ({ ...prev, [id]: "" }));
      return;
    }
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setQuantities(prev => ({ ...prev, [id]: Math.min(Math.max(parsedValue, 1), 99) }));
    }
  };

  const handleInputBlur = (id, isAvailable) => {
    if (!isAvailable) return;
    setQuantities(prev => ({
      ...prev,
      [id]: prev[id] === "" || prev[id] < 1 ? 1 : prev[id]
    }));
  };

  const handleAddToCart = (item) => {
    if (!item.available) {
      showAlert(`${item.name} is currently not available`, "error");
      return;
    }
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

  const rows = [];
  for (let i = 0; i < sortedFilteredItems.length; i += 3) {
    rows.push(sortedFilteredItems.slice(i, i + 3));
  }

  if (loading) {
    return (
      <>
        <NavBar activeLink="Menu" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
        <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Menu" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />
        <div className="flex justify-center items-center h-screen bg-own-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading menu items...</p>
          </div>
        </div>
        <Footer/>
      </>
    );
  }

  return (
    <>
      <div>
        {alert.visible && (
          <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, visible: false })} />
        )}

        <NavBar activeLink="Menu" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
        <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Menu" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

        <div className="fixed bottom-28 right-5 z-50">
          <Link to="/cart" className="relative bg-own-2 p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
            <FontAwesomeIcon icon={faShoppingCart} />
            {getTotalItems() > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg">
                {getTotalItems()}
              </div>
            )}
          </Link>
        </div>

        <section className="relative bg-[url(./assets/background4.jpg)] h-[50vh] bg-center bg-cover">
          <div className="absolute inset-0 h-[50vh] opacity-70 bg-black" />
          <div className="relative flex items-center justify-center h-full">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
              <div className="p-10 text-center text-white mt-10">
                <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg drop-shadow-black">MENU</h2>
              </div>
            </motion.div>
          </div>
        </section>

        {error && (
          <div className="max-w-6xl mx-auto mt-8 px-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {error}. Showing sample data. <button onClick={fetchData} className="font-medium underline text-yellow-700 hover:text-yellow-600">Try again</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto pt-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row gap-4 justify-center items-center">
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

          <div className="text-center mt-4 text-gray-600">
            Showing {sortedFilteredItems.length} item{sortedFilteredItems.length !== 1 ? 's' : ''}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
            {availableCount > 0 && unavailableCount > 0 && ` (${availableCount} available, ${unavailableCount} unavailable)`}
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-4 pb-8 px-4 sm:px-6 lg:px-8">
          {rows.length > 0 ? (
            <>
              {rows.map((row, index) => (
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
                />
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No dishes found matching your criteria.</p>
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
      <Footer/>
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
  renderStars
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="grid gap-10 pt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 landscape:grid-cols-2 landscape:lg:grid-cols-3"
    >
      {row.map((item, itemIndex) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: itemIndex * 0.2, duration: 0.6, ease: "easeOut" }}
          className={`bg-white rounded-3xl shadow-lg overflow-hidden transition-transform transform ${
            item.available ? 'hover:scale-105' : 'opacity-70 cursor-not-allowed'
          }`}
        >
          <div className="relative">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-60 object-cover"
            />
            {!item.available && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-xl font-bold bg-red-600 px-4 py-2 rounded-md">
                  Not Available
                </span>
              </div>
            )}
          </div>
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-2 ${item.available ? 'text-own-2' : 'text-gray-500'}`}>
              {item.name}
            </h3>
            <p className={`mb-2 ${item.available ? 'text-gray-700' : 'text-gray-500'}`}>
              {item.description}
            </p>
            <div className="flex items-center mb-2">
              {renderStars(item.rating)}
              <span className={`ml-2 text-sm ${item.available ? 'text-gray-500' : 'text-gray-400'}`}>
                ({item.rating})
              </span>
            </div>
            <div className="mb-4">
              <p className={`text-sm font-medium ${item.available ? 'text-green-600' : 'text-red-600'}`}>
                {item.available ? 'Available' : 'Not Available'}
              </p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => decreaseQuantity(item.id, item.available)}
                  className={`p-2 rounded-full z-30 ${item.available ? 'bg-own-2 text-white cursor-pointer hover:bg-own-2/90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  disabled={!item.available}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={item.available ? (quantities[item.id] || 1) : 0}
                  onChange={(e) => handleInputChange(e, item.id, item.available)}
                  onBlur={() => handleInputBlur(item.id, item.available)}
                  className={`w-16 text-center z-30 p-2 border rounded-lg font-bold text-lg ${
                    item.available 
                      ? 'text-black border-gray-300 focus:border-own-2 focus:ring-1 focus:ring-own-2' 
                      : 'text-gray-400 border-gray-200 bg-gray-100 cursor-not-allowed'
                  }`}
                  disabled={!item.available}
                  readOnly={!item.available}
                />
                <button
                  onClick={() => increaseQuantity(item.id, item.available)}
                  className={`p-2 rounded-full z-30 ${item.available ? 'bg-own-2 text-white cursor-pointer hover:bg-own-2/90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  disabled={!item.available}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
              <span className={`text-lg font-semibold ${item.available ? 'text-gray-800' : 'text-gray-500'}`}>
                £{item.price?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => handleAddToCart(item)}
                className={`w-full py-3 rounded-full font-semibold transition z-30 ${
                  item.available 
                    ? 'bg-own-2 text-white hover:bg-own-2/90 cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!item.available}
              >
                {item.available ? 'Add to Cart' : 'Unavailable'}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}