import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faDollarSign, 
  faEdit, 
  faPlus, 
  faSearch, 
  faShoppingCart, 
  faStar, 
  faTimes, 
  faTrash, 
  faUser, 
  faUtensils,
  faSpinner,
  faFire,
  faLeaf,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";

export default function MenuManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("Menu");
  
  // State for Firebase data
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    ingredients: [""],
    preparationTime: 30,
    isVegetarian: false,
    isSpicy: false,
    isFeatured: false,
    calories: 0,
    image: null,
    imagePreview: "",
    available: true
  });
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount / 1);
  };
  
  // Modal states
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Fetch data from Firebase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch menu items
      const menuQuery = query(collection(db, "menus"), orderBy("createdAt", "desc"));
      const menuSnapshot = await getDocs(menuQuery);
      const menuList = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(menuList);

      // Fetch categories
      const categoriesQuery = query(collection(db, "categories"), orderBy("displayOrder"));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file) => {
    try {
      const storageRef = ref(storage, `menu/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Handle menu submission - FIXED VERSION
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let imageUrl = '';
      
      // If editing and has an existing image URL in the form preview, use it
      if (editingItem && menuForm.imagePreview && !menuForm.image) {
        // If editing and no new image uploaded, keep the existing image URL
        // Check if imagePreview is a URL (starts with http) or a blob URL (starts with blob:)
        if (menuForm.imagePreview.startsWith('http') || menuForm.imagePreview.startsWith('blob:')) {
          // This is likely the existing image URL or a new blob preview
          imageUrl = editingItem.imageUrl || menuForm.imagePreview;
        } else {
          // Fallback to editingItem's imageUrl
          imageUrl = editingItem.imageUrl || '';
        }
      }
      
      // Upload new image if provided
      if (menuForm.image) {
        imageUrl = await uploadImage(menuForm.image);
      }
      
      // For new items without image, use placeholder
      if (!editingItem && !menuForm.image && !imageUrl) {
        imageUrl = '/api/placeholder/300/200';
      }

      const menuData = {
        name: menuForm.name,
        description: menuForm.description,
        price: parseFloat(menuForm.price),
        category: menuForm.category,
        ingredients: menuForm.ingredients.filter(ing => ing.trim() !== ''),
        preparationTime: parseInt(menuForm.preparationTime),
        isVegetarian: menuForm.isVegetarian,
        isSpicy: menuForm.isSpicy,
        isFeatured: menuForm.isFeatured,
        calories: parseInt(menuForm.calories) || 0,
        available: menuForm.available,
        imageUrl: imageUrl,
        createdAt: editingItem ? menuForm.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        // Update existing menu item
        await updateDoc(doc(db, "menus", editingItem.id), menuData);
      } else {
        // Add new menu item
        await addDoc(collection(db, "menus"), menuData);
      }

      // Reset form and close modal
      resetMenuForm();
      setShowMenuModal(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Failed to save menu item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit menu item - FIXED VERSION
  const handleEditMenu = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category || "",
      ingredients: item.ingredients || [""],
      preparationTime: item.preparationTime || 30,
      isVegetarian: item.isVegetarian || false,
      isSpicy: item.isSpicy || false,
      isFeatured: item.isFeatured || false,
      calories: item.calories || 0,
      image: null,
      imagePreview: item.imageUrl || "", // Store the existing image URL
      available: item.available !== false,
      createdAt: item.createdAt
    });
    setShowMenuModal(true);
  };

  // Handle delete menu item
  const handleDeleteMenu = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteDoc(doc(db, "menus", id));
        fetchData();
      } catch (error) {
        console.error("Error deleting menu item:", error);
        alert("Failed to delete menu item. Please try again.");
      }
    }
  };

  // Toggle featured status
  const toggleFeatured = async (item) => {
    try {
      await updateDoc(doc(db, "menus", item.id), {
        isFeatured: !item.isFeatured,
        updatedAt: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error("Error updating featured status:", error);
    }
  };

  // Reset menu form
  const resetMenuForm = () => {
    setMenuForm({
      name: "",
      description: "",
      price: "",
      category: "",
      ingredients: [""],
      preparationTime: 30,
      isVegetarian: false,
      isSpicy: false,
      isFeatured: false,
      calories: 0,
      image: null,
      imagePreview: "",
      available: true
    });
    setEditingItem(null);
  };

  // Add ingredient field
  const addIngredient = () => {
    setMenuForm({
      ...menuForm,
      ingredients: [...menuForm.ingredients, ""]
    });
  };

  // Remove ingredient field
  const removeIngredient = (index) => {
    const newIngredients = menuForm.ingredients.filter((_, i) => i !== index);
    setMenuForm({
      ...menuForm,
      ingredients: newIngredients
    });
  };

  // Update ingredient
  const updateIngredient = (index, value) => {
    const newIngredients = [...menuForm.ingredients];
    newIngredients[index] = value;
    setMenuForm({
      ...menuForm,
      ingredients: newIngredients
    });
  };

  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Function to clear image from form
  const clearImage = () => {
    setMenuForm({
      ...menuForm,
      image: null,
      imagePreview: editingItem?.imageUrl || "" // Keep original URL if editing
    });
  };

  return (
    <>
      <AdminNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
      <AdminSideBar 
        isOpen={isSidebarOpen} 
        closeSidebar={closeSidebar} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
      />
      <div className='md:flex md:justify-end'>
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div>
            <div className="flex justify-between items-center mb-6">
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
                  className="appearance-none w-full pl-3 pr-10 py-2 border border-black text-black rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FontAwesomeIcon icon={faChevronDown} className="text-black" />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                <span className="ml-3 text-gray-600">Loading menu items...</span>
              </div>
            ) : (
              <>
                {/* Menu Items Count */}
                <div className="mb-4">
                  <p className="text-gray-600">
                    Showing {filteredMenuItems.length} of {menuItems.length} menu items
                    {selectedCategory !== "all" && ` in "${selectedCategory}"`}
                  </p>
                </div>

                {/* Menu Items Grid */}
                {filteredMenuItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FontAwesomeIcon icon={faUtensils} className="text-4xl text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No menu items found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? `No results for "${searchTerm}"` : "No menu items yet"}
                    </p>
                    <button 
                      onClick={() => setShowMenuModal(true)}
                      className="bg-own-2 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Add Your First Menu Item
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {filteredMenuItems.map(item => (
                      <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        {/* Image Section */}
                        <div className="h-48 relative overflow-hidden bg-gradient-to-br from-own-2/20 to-amber-400/20">
                          {item.imageUrl && item.imageUrl !== '/api/placeholder/300/200' ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/api/placeholder/300/200';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FontAwesomeIcon icon={faUtensils} className="text-4xl text-own-2/50" />
                            </div>
                          )}
                          
                          {/* Featured Badge */}
                          {item.isFeatured && (
                            <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              <FontAwesomeIcon icon={faStar} className="mr-1" />
                              Featured
                            </div>
                          )}
                          
                          {/* Dietary Badges */}
                          <div className="absolute top-3 right-3 flex gap-1">
                            {item.isVegetarian && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                <FontAwesomeIcon icon={faLeaf} className="mr-1" />
                                Veg
                              </span>
                            )}
                            {item.isSpicy && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                <FontAwesomeIcon icon={faFire} className="mr-1" />
                                Spicy
                              </span>
                            )}
                          </div>
                          
                          {/* Availability Badge */}
                          <div className="absolute bottom-3 right-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-own-2">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                            <span className="font-bold text-own-2 text-lg">{formatCurrency(item.price)}</span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                          
                          {/* Preparation Time */}
                          {item.preparationTime && (
                            <div className="flex items-center text-gray-500 text-sm mb-3">
                              <FontAwesomeIcon icon={faClock} className="mr-2" />
                              {item.preparationTime} mins
                            </div>
                          )}
                          
                          {/* Ingredients Preview */}
                          {item.ingredients && item.ingredients.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-500 mb-1">Ingredients:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.ingredients.slice(0, 3).map((ingredient, index) => (
                                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {ingredient}
                                  </span>
                                ))}
                                {item.ingredients.length > 3 && (
                                  <span className="text-xs text-gray-500">+{item.ingredients.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-500">
                              {item.calories > 0 && `${item.calories} cal`}
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => toggleFeatured(item)}
                                className={`p-2 rounded-lg ${item.isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'} hover:bg-amber-200 transition-colors`}
                                title={item.isFeatured ? "Remove from featured" : "Mark as featured"}
                              >
                                <FontAwesomeIcon icon={faStar} />
                              </button>
                              <button 
                                onClick={() => handleEditMenu(item)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edit menu item"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button 
                                onClick={() => handleDeleteMenu(item.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete menu item"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Add/Edit Menu Item Modal */}
          {showMenuModal && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-own-2">
                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </h3>
                  <button 
                    onClick={() => {
                      setShowMenuModal(false);
                      resetMenuForm();
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <form onSubmit={handleMenuSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dish Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-own-2 transition-colors">
                      <div className="space-y-1 text-center">
                        {menuForm.imagePreview ? (
                          <div className="relative">
                            <img
                              src={menuForm.imagePreview}
                              alt="Preview"
                              className="mx-auto h-48 w-48 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/api/placeholder/300/200';
                              }}
                            />
                            <button
                              type="button"
                              onClick={clearImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                            </button>
                            <div className="text-xs text-gray-500 mt-2">
                              {editingItem && !menuForm.image ? "Current image" : "Image preview"}
                            </div>
                          </div>
                        ) : (
                          <>
                            <FontAwesomeIcon 
                              icon={faUtensils} 
                              className="mx-auto h-12 w-12 text-gray-400"
                            />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-own-2 hover:text-amber-600">
                                <span>Upload an image</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      setMenuForm({
                                        ...menuForm,
                                        image: file,
                                        imagePreview: URL.createObjectURL(file)
                                      });
                                    }
                                  }}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                            {editingItem && editingItem.imageUrl && (
                              <p className="text-xs text-green-600 mt-2">
                                Current image will be kept if no new image is uploaded
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={menuForm.name}
                        onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                        placeholder="e.g., Jollof Rice"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (£) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={menuForm.description}
                      onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                      placeholder="Describe the dish..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        required
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
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
                        min="0"
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={menuForm.preparationTime}
                        onChange={(e) => setMenuForm({...menuForm, preparationTime: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={menuForm.calories}
                        onChange={(e) => setMenuForm({...menuForm, calories: e.target.value})}
                        placeholder="Optional"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-own-2 focus:ring-own-2"
                          checked={menuForm.available}
                          onChange={(e) => setMenuForm({...menuForm, available: e.target.checked})}
                        />
                        <span className="ml-2 text-sm text-gray-700">Available for order</span>
                      </label>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                    <div className="space-y-2">
                      {menuForm.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => updateIngredient(index, e.target.value)}
                            className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            placeholder="Add ingredient"
                          />
                          {menuForm.ingredients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addIngredient}
                        className="text-own-2 hover:text-amber-600 text-sm font-medium flex items-center"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-1 h-4 w-4" />
                        Add Ingredient
                      </button>
                    </div>
                  </div>

                  {/* Dietary Options */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={menuForm.isVegetarian}
                          onChange={(e) => setMenuForm({...menuForm, isVegetarian: e.target.checked})}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <FontAwesomeIcon icon={faLeaf} className="h-4 w-4 mr-1 text-green-500" />
                          Vegetarian
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={menuForm.isSpicy}
                          onChange={(e) => setMenuForm({...menuForm, isSpicy: e.target.checked})}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <FontAwesomeIcon icon={faFire} className="h-4 w-4 mr-1 text-red-500" />
                          Spicy
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={menuForm.isFeatured}
                          onChange={(e) => setMenuForm({...menuForm, isFeatured: e.target.checked})}
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <FontAwesomeIcon icon={faStar} className="h-4 w-4 mr-1 text-yellow-500" />
                          Featured
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {saving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                          {editingItem ? 'Updating...' : 'Saving...'}
                        </>
                      ) : (
                        editingItem ? 'Update Menu Item' : 'Add Menu Item'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenuModal(false);
                        resetMenuForm();
                      }}
                      disabled={saving}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
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