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
  faCheckCircle
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
import { db } from "../../firebaseConfig";

export default function Categories() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const [activeTab, setActiveTab] = useState("Categories");
  
  // Firebase data states
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Mock user data (you can also fetch this from Firebase)
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

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    displayOrder: 0,
    active: true
  });

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from Firebase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories with order
      const categoriesQuery = query(collection(db, "categories"), orderBy("displayOrder"));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);

      // Fetch menu items to count items per category
      const menuQuery = query(collection(db, "menus"));
      const menuSnapshot = await getDocs(menuQuery);
      const menuList = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(menuList);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate item count for each category
  const getItemCountForCategory = (categoryName) => {
    return menuItems.filter(item => item.category === categoryName).length;
  };

  // Handle category submission
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const categoryData = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        displayOrder: categoryForm.displayOrder || categories.length,
        active: categoryForm.active !== false,
        createdAt: editingCategory ? categoryForm.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingCategory) {
        // Update existing category
        await updateDoc(doc(db, "categories", editingCategory.id), categoryData);
      } else {
        // Add new category
        await addDoc(collection(db, "categories"), categoryData);
      }

      // Reset form and close modal
      resetCategoryForm();
      setShowCategoryModal(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      displayOrder: category.displayOrder || categories.length,
      active: category.active !== false,
      createdAt: category.createdAt
    });
    setShowCategoryModal(true);
  };

  // Handle delete category
  const handleDeleteCategory = async (id) => {
    // Check if category has menu items
    const category = categories.find(cat => cat.id === id);
    const itemCount = getItemCountForCategory(category.name);
    
    if (itemCount > 0) {
      if (!window.confirm(
        `This category has ${itemCount} menu item(s). Deleting it will remove these items from the category. Are you sure you want to proceed?`
      )) {
        return;
      }
    } else {
      if (!window.confirm("Are you sure you want to delete this category?")) {
        return;
      }
    }

    try {
      await deleteDoc(doc(db, "categories", id));
      
      // If there were items in this category, update them to have no category
      if (itemCount > 0) {
        const itemsInCategory = menuItems.filter(item => item.category === category.name);
        
        // You might want to update these items to have a default category or remove the category
        // For now, we'll just log a warning
        console.warn(`${itemCount} items lost their category. Consider updating them.`);
      }
      
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    }
  };

  // Toggle category active status
  const toggleCategoryActive = async (category) => {
    try {
      await updateDoc(doc(db, "categories", category.id), {
        active: !category.active,
        updatedAt: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error("Error updating category status:", error);
    }
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      displayOrder: categories.length,
      active: true
    });
    setEditingCategory(null);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <>
      <AdminNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
      <AdminSideBar 
        isOpen={isSidebarOpen} 
        closeSidebar={closeSidebar} 
        userData={userData} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
      />
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

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10 pr-4 py-3 w-full border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                <span className="ml-3 text-gray-600">Loading categories...</span>
              </div>
            ) : (
              <>
                {/* Categories Count */}
                <div className="mb-4">
                  <p className="text-gray-600">
                    Showing {filteredCategories.length} of {categories.length} categories
                    {searchTerm && ` for "${searchTerm}"`}
                  </p>
                </div>

                {/* Categories Grid */}
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FontAwesomeIcon icon={faUtensils} className="text-4xl text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      {searchTerm ? 'No categories found' : 'No categories yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? `No results for "${searchTerm}"` : "Start by adding your first category"}
                    </p>
                    <button 
                      onClick={() => setShowCategoryModal(true)}
                      className="bg-own-2 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Add Your First Category
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {filteredCategories.map(category => {
                      const itemCount = getItemCountForCategory(category.name);
                      
                      return (
                        <div key={category.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-lg text-own-2">{category.name}</h3>
                              {category.active ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <span className="bg-own-2 text-white text-sm px-3 py-1 rounded-full font-medium">
                              {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {category.description || "No description provided"}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                              Display order: {category.displayOrder || 0}
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => toggleCategoryActive(category)}
                                className={`p-2 rounded-lg ${category.active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} hover:opacity-80 transition-colors`}
                                title={category.active ? "Deactivate category" : "Activate category"}
                              >
                                {category.active ? "Deactivate" : "Activate"}
                              </button>
                              <button 
                                onClick={() => handleEditCategory(category)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edit category"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete category"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Add/Edit Category Modal */}
          {showCategoryModal && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-own-2">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button 
                    onClick={() => {
                      setShowCategoryModal(false);
                      resetCategoryForm();
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      placeholder="e.g., Appetizers, Main Course"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      placeholder="Describe what this category includes..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={categoryForm.displayOrder}
                        onChange={(e) => setCategoryForm({...categoryForm, displayOrder: parseInt(e.target.value) || 0})}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Lower numbers appear first
                      </p>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-own-2 focus:ring-own-2"
                          checked={categoryForm.active}
                          onChange={(e) => setCategoryForm({...categoryForm, active: e.target.checked})}
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
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
                          {editingCategory ? 'Updating...' : 'Saving...'}
                        </>
                      ) : (
                        editingCategory ? 'Update Category' : 'Add Category'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryModal(false);
                        resetCategoryForm();
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