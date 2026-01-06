import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  serverTimestamp,
  writeBatch,
  query,
  where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUtensils, 
  faStar, 
  faTags, 
  faImages, 
  faBirthdayCake,
  faPlus,
  faEdit,
  faTrash,
  faUpload,
  faSave,
  faTimes,
  faImage,
  faDollarSign,
  faFire,
  faLeaf,
  faBowlFood,
  faWineGlass,
  faDatabase,
  faDownload,
  faUpload as faCloudUpload,
  faCheckCircle,
  faExclamationTriangle,
  faSync
} from "@fortawesome/free-solid-svg-icons";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

// Sample data matching your structure
const SAMPLE_DATA = {
  menuItems: [
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
      preparationTime: 30,
      isVegetarian: false,
      isSpicy: true,
      calories: 450
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
      preparationTime: 20,
      isVegetarian: false,
      isSpicy: true,
      calories: 320
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
      preparationTime: 45,
      isVegetarian: false,
      isSpicy: false,
      calories: 520
    },
    {
      id: 4,
      name: "Moi Moi",
      description: "Steamed bean pudding",
      price: 1500,
      category: "Appetizer",
      image: "/api/placeholder/300/200",
      featured: false,
      available: true,
      ingredients: ["Beans", "Pepper", "Onions", "Egg"],
      preparationTime: 60,
      isVegetarian: true,
      isSpicy: false,
      calories: 280
    },
    {
      id: 5,
      name: "Chin Chin",
      description: "Sweet fried dough snacks",
      price: 1200,
      category: "Desserts",
      image: "/api/placeholder/300/200",
      featured: true,
      available: true,
      ingredients: ["Flour", "Sugar", "Butter", "Milk"],
      preparationTime: 40,
      isVegetarian: true,
      isSpicy: false,
      calories: 380
    },
    {
      id: 6,
      name: "Zobo Drink",
      description: "Refreshing hibiscus drink",
      price: 800,
      category: "Drinks",
      image: "/api/placeholder/300/200",
      featured: false,
      available: true,
      ingredients: ["Hibiscus", "Ginger", "Pineapple"],
      preparationTime: 15,
      isVegetarian: true,
      isSpicy: false,
      calories: 120
    }
  ],
  
  categories: [
    { 
      id: 1, 
      name: "Appetizer", 
      description: "Starters and small bites", 
      itemCount: 5, 
      active: true,
      color: "#4CAF50",
      icon: "faUtensils",
      displayOrder: 1
    },
    { 
      id: 2, 
      name: "Main Course", 
      description: "Main dishes and entrees", 
      itemCount: 12, 
      active: true,
      color: "#2196F3",
      icon: "faBowlFood",
      displayOrder: 2
    },
    { 
      id: 3, 
      name: "Desserts", 
      description: "Sweet treats and desserts", 
      itemCount: 3, 
      active: true,
      color: "#9C27B0",
      icon: "faBirthdayCake",
      displayOrder: 3
    },
    { 
      id: 4, 
      name: "Drinks", 
      description: "Beverages and drinks", 
      itemCount: 8, 
      active: true,
      color: "#FF9800",
      icon: "faWineGlass",
      displayOrder: 4
    }
  ],
  
  cateringPackages: [
    {
      id: 1,
      name: "Standard Package",
      description: "Perfect for small gatherings",
      pricePerPerson: 2500,
      includes: ["Jollof Rice", "Fried Rice", "Chicken", "Salad", "Drinks"],
      minGuests: 10,
      maxGuests: 50,
      active: true,
      image: "/api/placeholder/300/200",
      features: ["Buffet Style", "2 Main Dishes", "1 Appetizer", "Soft Drinks"],
      estimatedPrepTime: 24
    },
    {
      id: 2,
      name: "Premium Package",
      description: "Ideal for corporate events",
      pricePerPerson: 5000,
      includes: ["All Standard items", "Suya", "Small chops", "Dessert", "Premium drinks"],
      minGuests: 50,
      maxGuests: 200,
      active: true,
      image: "/api/placeholder/300/200",
      features: ["Plated Service", "3 Main Dishes", "2 Appetizers", "Dessert Bar", "Premium Bar"],
      estimatedPrepTime: 48
    },
    {
      id: 3,
      name: "Executive Package",
      description: "Luxury dining experience",
      pricePerPerson: 8000,
      includes: ["All Premium items", "Seafood platter", "International wines", "Personal chef"],
      minGuests: 20,
      maxGuests: 100,
      active: true,
      image: "/api/placeholder/300/200",
      features: ["Fine Dining", "4-Course Meal", "Sommelier Service", "Personalized Menu"],
      estimatedPrepTime: 72
    }
  ],
  
  featuredDishes: [
    {
      id: 1,
      menuItemId: 1,
      title: "Signature Jollof Rice",
      description: "Our famous Jollof Rice - a customer favorite!",
      badgeText: "Best Seller",
      displayOrder: 1
    },
    {
      id: 2,
      menuItemId: 2,
      title: "Authentic Suya",
      description: "Traditional Nigerian street food at its finest",
      badgeText: "Spicy Special",
      displayOrder: 2
    },
    {
      id: 3,
      menuItemId: 5,
      title: "Homemade Chin Chin",
      description: "Crunchy sweet snacks made fresh daily",
      badgeText: "Sweet Treat",
      displayOrder: 3
    }
  ],
  
  galleryImages: [
    { 
      id: 1, 
      url: "/api/placeholder/400/300", 
      title: "Jollof Rice Platter",
      description: "Our signature Jollof rice served with grilled chicken",
      category: "food",
      tags: ["jollof", "rice", "chicken"]
    },
    { 
      id: 2, 
      url: "/api/placeholder/400/300", 
      title: "Restaurant Interior",
      description: "Modern and cozy dining area",
      category: "restaurant", 
      tags: ["interior", "dining", "ambiance"]
    },
    { 
      id: 3, 
      url: "/api/placeholder/400/300", 
      title: "Customer Event",
      description: "Wedding catering at a beautiful venue",
      category: "events", 
      tags: ["catering", "wedding", "event"]
    },
    { 
      id: 4, 
      url: "/api/placeholder/400/300", 
      title: "Chef in Action",
      description: "Our chef preparing fresh Suya",
      category: "team", 
      tags: ["chef", "cooking", "preparation"]
    }
  ]
};

export default function ContentManager() {
  // State for all collections
  const [menus, setMenus] = useState([]);
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [cateringPackages, setCateringPackages] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    menus: true,
    featured: true,
    categories: true,
    gallery: true,
    catering: true
  });
  
  // Import states
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState({
    menus: { imported: 0, total: 0, status: '' },
    categories: { imported: 0, total: 0, status: '' },
    catering: { imported: 0, total: 0, status: '' },
    featured: { imported: 0, total: 0, status: '' },
    gallery: { imported: 0, total: 0, status: '' }
  });
  const [importMessage, setImportMessage] = useState('');
  
  // Form states
  const [activeTab, setActiveTab] = useState('menu');
  const [editingItem, setEditingItem] = useState(null);
  
  // Menu form
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVegetarian: false,
    isSpicy: false,
    isFeatured: false,
    image: null,
    imagePreview: '',
    ingredients: [''],
    preparationTime: 30,
    calories: 0,
    dietaryTags: []
  });
  
  // Featured dish form
  const [featuredForm, setFeaturedForm] = useState({
    menuItemId: '',
    title: '',
    description: '',
    badgeText: 'Chef\'s Choice',
    displayOrder: 1
  });
  
  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'faUtensils',
    displayOrder: 1,
    color: '#667eea'
  });
  
  // Gallery form
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    image: null,
    imagePreview: '',
    category: 'food',
    tags: []
  });
  
  // Catering package form
  const [cateringForm, setCateringForm] = useState({
    name: '',
    description: '',
    pricePerPerson: '',
    minGuests: 10,
    maxGuests: 100,
    includes: [''],
    image: null,
    imagePreview: '',
    features: [''],
    estimatedPrepTime: 24
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch Menus
      const menuSnapshot = await getDocs(collection(db, "menus"));
      const menuList = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenus(menuList);
      setLoading(prev => ({ ...prev, menus: false }));

      // Fetch Featured Dishes
      const featuredSnapshot = await getDocs(collection(db, "featuredDishes"));
      const featuredList = featuredSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeaturedDishes(featuredList);
      setLoading(prev => ({ ...prev, featured: false }));

      // Fetch Categories
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
      setLoading(prev => ({ ...prev, categories: false }));

      // Fetch Gallery
      const gallerySnapshot = await getDocs(collection(db, "gallery"));
      const galleryList = gallerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGallery(galleryList);
      setLoading(prev => ({ ...prev, gallery: false }));

      // Fetch Catering Packages
      const cateringSnapshot = await getDocs(collection(db, "cateringPackages"));
      const cateringList = cateringSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCateringPackages(cateringList);
      setLoading(prev => ({ ...prev, catering: false }));

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file, folder) => {
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // ==================== SAMPLE DATA IMPORT ====================
  const importSampleData = async () => {
    if (!window.confirm("This will import sample data. Existing data will not be deleted. Continue?")) {
      return;
    }

    setImporting(true);
    setImportMessage('Starting import...');
    
    const batch = writeBatch(db);
    
    try {
      // Import Categories
      setImportStatus(prev => ({
        ...prev,
        categories: { imported: 0, total: SAMPLE_DATA.categories.length, status: 'Importing...' }
      }));
      
      for (const category of SAMPLE_DATA.categories) {
        try {
          // Check if category already exists
          const existingQuery = query(collection(db, "categories"), where("name", "==", category.name));
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            const categoryData = {
              ...category,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            delete categoryData.id;
            
            await addDoc(collection(db, "categories"), categoryData);
            
            setImportStatus(prev => ({
              ...prev,
              categories: { 
                ...prev.categories, 
                imported: prev.categories.imported + 1,
                status: `Imported ${prev.categories.imported + 1}/${SAMPLE_DATA.categories.length}`
              }
            }));
          }
        } catch (error) {
          console.error(`Error importing category ${category.name}:`, error);
        }
      }
      
      // Import Menu Items
      setImportStatus(prev => ({
        ...prev,
        menus: { imported: 0, total: SAMPLE_DATA.menuItems.length, status: 'Importing...' }
      }));
      
      for (const menuItem of SAMPLE_DATA.menuItems) {
        try {
          // Check if menu item already exists
          const existingQuery = query(collection(db, "menus"), where("name", "==", menuItem.name));
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            const menuData = {
              ...menuItem,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            delete menuData.id;
            
            await addDoc(collection(db, "menus"), menuData);
            
            setImportStatus(prev => ({
              ...prev,
              menus: { 
                ...prev.menus, 
                imported: prev.menus.imported + 1,
                status: `Imported ${prev.menus.imported + 1}/${SAMPLE_DATA.menuItems.length}`
              }
            }));
          }
        } catch (error) {
          console.error(`Error importing menu item ${menuItem.name}:`, error);
        }
      }
      
      // Import Catering Packages
      setImportStatus(prev => ({
        ...prev,
        catering: { imported: 0, total: SAMPLE_DATA.cateringPackages.length, status: 'Importing...' }
      }));
      
      for (const packageItem of SAMPLE_DATA.cateringPackages) {
        try {
          // Check if package already exists
          const existingQuery = query(collection(db, "cateringPackages"), where("name", "==", packageItem.name));
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            const packageData = {
              ...packageItem,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            delete packageData.id;
            
            await addDoc(collection(db, "cateringPackages"), packageData);
            
            setImportStatus(prev => ({
              ...prev,
              catering: { 
                ...prev.catering, 
                imported: prev.catering.imported + 1,
                status: `Imported ${prev.catering.imported + 1}/${SAMPLE_DATA.cateringPackages.length}`
              }
            }));
          }
        } catch (error) {
          console.error(`Error importing package ${packageItem.name}:`, error);
        }
      }
      
      // Import Featured Dishes
      setImportStatus(prev => ({
        ...prev,
        featured: { imported: 0, total: SAMPLE_DATA.featuredDishes.length, status: 'Importing...' }
      }));
      
      for (const featured of SAMPLE_DATA.featuredDishes) {
        try {
          // Note: For featured dishes, we need to find the actual menu item ID
          // For now, we'll use the title as reference
          const existingQuery = query(collection(db, "featuredDishes"), where("title", "==", featured.title));
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            const featuredData = {
              ...featured,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            delete featuredData.id;
            
            await addDoc(collection(db, "featuredDishes"), featuredData);
            
            setImportStatus(prev => ({
              ...prev,
              featured: { 
                ...prev.featured, 
                imported: prev.featured.imported + 1,
                status: `Imported ${prev.featured.imported + 1}/${SAMPLE_DATA.featuredDishes.length}`
              }
            }));
          }
        } catch (error) {
          console.error(`Error importing featured dish ${featured.title}:`, error);
        }
      }
      
      // Import Gallery Images
      setImportStatus(prev => ({
        ...prev,
        gallery: { imported: 0, total: SAMPLE_DATA.galleryImages.length, status: 'Importing...' }
      }));
      
      for (const galleryItem of SAMPLE_DATA.galleryImages) {
        try {
          const existingQuery = query(collection(db, "gallery"), where("title", "==", galleryItem.title));
          const existingSnapshot = await getDocs(existingQuery);
          
          if (existingSnapshot.empty) {
            const galleryData = {
              ...galleryItem,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            delete galleryData.id;
            
            await addDoc(collection(db, "gallery"), galleryData);
            
            setImportStatus(prev => ({
              ...prev,
              gallery: { 
                ...prev.gallery, 
                imported: prev.gallery.imported + 1,
                status: `Imported ${prev.gallery.imported + 1}/${SAMPLE_DATA.galleryImages.length}`
              }
            }));
          }
        } catch (error) {
          console.error(`Error importing gallery item ${galleryItem.title}:`, error);
        }
      }
      
      setImportMessage('✅ Sample data imported successfully!');
      
      // Refresh data
      setTimeout(() => {
        fetchAllData();
        setImporting(false);
        setImportStatus({
          menus: { imported: 0, total: 0, status: '' },
          categories: { imported: 0, total: 0, status: '' },
          catering: { imported: 0, total: 0, status: '' },
          featured: { imported: 0, total: 0, status: '' },
          gallery: { imported: 0, total: 0, status: '' }
        });
      }, 2000);
      
    } catch (error) {
      console.error("Error importing sample data:", error);
      setImportMessage('❌ Error importing data. Please try again.');
      setImporting(false);
    }
  };

  // ==================== MENU MANAGEMENT ====================
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      
      if (menuForm.image) {
        imageUrl = await uploadImage(menuForm.image, 'menu');
      }

      const menuData = {
        name: menuForm.name,
        description: menuForm.description,
        price: parseFloat(menuForm.price),
        category: menuForm.category,
        isVegetarian: menuForm.isVegetarian,
        isSpicy: menuForm.isSpicy,
        isFeatured: menuForm.isFeatured,
        imageUrl: imageUrl || '/api/placeholder/300/200',
        ingredients: menuForm.ingredients.filter(ing => ing.trim() !== ''),
        preparationTime: parseInt(menuForm.preparationTime),
        calories: parseInt(menuForm.calories),
        dietaryTags: menuForm.dietaryTags,
        available: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        await updateDoc(doc(db, "menus", editingItem.id), menuData);
      } else {
        await addDoc(collection(db, "menus"), menuData);
      }

      resetMenuForm();
      fetchAllData();
      
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  const handleEditMenu = (menu) => {
    setMenuForm({
      name: menu.name,
      description: menu.description,
      price: menu.price.toString(),
      category: menu.category,
      isVegetarian: menu.isVegetarian || false,
      isSpicy: menu.isSpicy || false,
      isFeatured: menu.isFeatured || false,
      image: null,
      imagePreview: menu.imageUrl || '',
      ingredients: menu.ingredients || [''],
      preparationTime: menu.preparationTime || 30,
      calories: menu.calories || 0,
      dietaryTags: menu.dietaryTags || []
    });
    setEditingItem(menu);
  };

  const handleDeleteMenu = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteDoc(doc(db, "menus", id));
        fetchAllData();
      } catch (error) {
        console.error("Error deleting menu item:", error);
      }
    }
  };

  const resetMenuForm = () => {
    setMenuForm({
      name: '',
      description: '',
      price: '',
      category: '',
      isVegetarian: false,
      isSpicy: false,
      isFeatured: false,
      image: null,
      imagePreview: '',
      ingredients: [''],
      preparationTime: 30,
      calories: 0,
      dietaryTags: []
    });
    setEditingItem(null);
  };

  // ==================== FEATURED DISHES ====================
  const handleFeaturedSubmit = async (e) => {
    e.preventDefault();
    try {
      const featuredData = {
        menuItemId: featuredForm.menuItemId,
        title: featuredForm.title,
        description: featuredForm.description,
        badgeText: featuredForm.badgeText,
        displayOrder: parseInt(featuredForm.displayOrder),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "featuredDishes"), featuredData);
      setFeaturedForm({
        menuItemId: '',
        title: '',
        description: '',
        badgeText: 'Chef\'s Choice',
        displayOrder: 1
      });
      fetchAllData();
      
    } catch (error) {
      console.error("Error saving featured dish:", error);
    }
  };

  const handleDeleteFeatured = async (id) => {
    if (window.confirm("Remove from featured dishes?")) {
      try {
        await deleteDoc(doc(db, "featuredDishes", id));
        fetchAllData();
      } catch (error) {
        console.error("Error deleting featured dish:", error);
      }
    }
  };

  // ==================== CATEGORIES ====================
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description,
        icon: categoryForm.icon,
        displayOrder: parseInt(categoryForm.displayOrder),
        color: categoryForm.color,
        itemCount: 0,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "categories"), categoryData);
      setCategoryForm({
        name: '',
        description: '',
        icon: 'faUtensils',
        displayOrder: 1,
        color: '#667eea'
      });
      fetchAllData();
      
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  // ==================== GALLERY ====================
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      
      if (galleryForm.image) {
        imageUrl = await uploadImage(galleryForm.image, 'gallery');
      }

      const galleryData = {
        title: galleryForm.title,
        description: galleryForm.description,
        imageUrl: imageUrl || '/api/placeholder/400/300',
        category: galleryForm.category,
        tags: galleryForm.tags.filter(tag => tag.trim() !== ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "gallery"), galleryData);
      setGalleryForm({
        title: '',
        description: '',
        image: null,
        imagePreview: '',
        category: 'food',
        tags: []
      });
      fetchAllData();
      
    } catch (error) {
      console.error("Error saving gallery item:", error);
    }
  };

  // ==================== CATERING PACKAGES ====================
  const handleCateringSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      
      if (cateringForm.image) {
        imageUrl = await uploadImage(cateringForm.image, 'catering');
      }

      const cateringData = {
        name: cateringForm.name,
        description: cateringForm.description,
        pricePerPerson: parseFloat(cateringForm.pricePerPerson),
        minGuests: parseInt(cateringForm.minGuests),
        maxGuests: parseInt(cateringForm.maxGuests),
        includes: cateringForm.includes.filter(item => item.trim() !== ''),
        imageUrl: imageUrl || '/api/placeholder/300/200',
        features: cateringForm.features.filter(feature => feature.trim() !== ''),
        estimatedPrepTime: parseInt(cateringForm.estimatedPrepTime),
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "cateringPackages"), cateringData);
      setCateringForm({
        name: '',
        description: '',
        pricePerPerson: '',
        minGuests: 10,
        maxGuests: 100,
        includes: [''],
        image: null,
        imagePreview: '',
        features: [''],
        estimatedPrepTime: 24
      });
      fetchAllData();
      
    } catch (error) {
      console.error("Error saving catering package:", error);
    }
  };

  // Render loading skeletons
  if (Object.values(loading).some(l => l)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-own-2"></div>
      </div>
    );
  }

  return (
    <>
      <NavBar activeLink="Admin" />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-display2">
                  Content Management Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your restaurant's menu, featured dishes, categories, gallery, and catering packages
                </p>
              </div>
              
              {/* Import Sample Data Button */}
              <button
                onClick={importSampleData}
                disabled={importing}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${importing ? 'bg-gray-400' : 'bg-own-2 hover:bg-amber-600'} text-white font-medium`}
              >
                <FontAwesomeIcon icon={importing ? faSync : faCloudUpload} className={`mr-2 ${importing ? 'animate-spin' : ''}`} />
                {importing ? 'Importing...' : 'Import Sample Data'}
              </button>
            </div>
            
            {/* Import Status */}
            {importing && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faDatabase} className="text-blue-500 mr-2" />
                  <h3 className="font-medium text-blue-900">Importing Sample Data</h3>
                </div>
                
                {importMessage && (
                  <p className="text-blue-700 mb-3">{importMessage}</p>
                )}
                
                <div className="space-y-2">
                  {Object.entries(importStatus).map(([key, status]) => (
                    status.total > 0 && (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm capitalize text-gray-700">{key}:</span>
                        <span className="text-sm font-medium">
                          {status.status || `${status.imported}/${status.total}`}
                        </span>
                      </div>
                    )
                  ))}
                </div>
                
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(
                          (importStatus.menus.imported + 
                           importStatus.categories.imported + 
                           importStatus.catering.imported + 
                           importStatus.featured.imported + 
                           importStatus.gallery.imported) / 
                          (importStatus.menus.total + 
                           importStatus.categories.total + 
                           importStatus.catering.total + 
                           importStatus.featured.total + 
                           importStatus.gallery.total) * 100
                        ) || 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'menu', label: 'Menu Items', icon: faUtensils, color: 'text-blue-600', count: menus.length },
                  { id: 'featured', label: 'Featured Dishes', icon: faStar, color: 'text-yellow-600', count: featuredDishes.length },
                  { id: 'categories', label: 'Categories', icon: faTags, color: 'text-green-600', count: categories.length },
                  { id: 'gallery', label: 'Gallery', icon: faImages, color: 'text-purple-600', count: gallery.length },
                  { id: 'catering', label: 'Catering Packages', icon: faBirthdayCake, color: 'text-red-600', count: cateringPackages.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'border-own-2 text-own-2'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <FontAwesomeIcon 
                      icon={tab.icon} 
                      className={`mr-2 h-5 w-5 ${activeTab === tab.id ? tab.color : 'text-gray-400'}`}
                    />
                    {tab.label}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === tab.id 
                        ? 'bg-own-2 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-8"
              >
                
                {/* Menu Management Form */}
                {activeTab === 'menu' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                      </h2>
                      {editingItem && (
                        <button
                          onClick={resetMenuForm}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" />
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleMenuSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dish Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={menuForm.name}
                              onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              placeholder="e.g., Jollof Rice with Chicken"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description *
                            </label>
                            <textarea
                              required
                              value={menuForm.description}
                              onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                              rows="3"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              placeholder="Describe the dish..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price (₦) *
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              value={menuForm.price}
                              onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              placeholder="2500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Category *
                            </label>
                            <select
                              required
                              value={menuForm.category}
                              onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            >
                              <option value="">Select Category</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Image Upload & Details */}
                        <div className="space-y-4">
                          {/* Image Upload */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dish Image
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-own-2 transition-colors">
                              <div className="space-y-1 text-center">
                                {menuForm.imagePreview ? (
                                  <div className="relative">
                                    <img
                                      src={menuForm.imagePreview}
                                      alt="Preview"
                                      className="mx-auto h-48 w-48 object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setMenuForm({...menuForm, image: null, imagePreview: ''})}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                                    >
                                      <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <FontAwesomeIcon 
                                      icon={faImage} 
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
                                  </>
                                )}
                              </div>
                            </div>
                            {!menuForm.imagePreview && (
                              <p className="text-xs text-gray-500 mt-2">
                                Leave empty to use placeholder image
                              </p>
                            )}
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

                          {/* Preparation Details */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prep Time (mins)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={menuForm.preparationTime}
                                onChange={(e) => setMenuForm({...menuForm, preparationTime: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Calories
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={menuForm.calories}
                                onChange={(e) => setMenuForm({...menuForm, calories: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ingredients */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ingredients
                        </label>
                        <div className="space-y-2">
                          {menuForm.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex space-x-2">
                              <input
                                type="text"
                                value={ingredient}
                                onChange={(e) => {
                                  const newIngredients = [...menuForm.ingredients];
                                  newIngredients[index] = e.target.value;
                                  setMenuForm({...menuForm, ingredients: newIngredients});
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                                placeholder="Add ingredient"
                              />
                              {menuForm.ingredients.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newIngredients = menuForm.ingredients.filter((_, i) => i !== index);
                                    setMenuForm({...menuForm, ingredients: newIngredients});
                                  }}
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setMenuForm({...menuForm, ingredients: [...menuForm.ingredients, '']})}
                            className="text-own-2 hover:text-amber-600 text-sm font-medium flex items-center"
                          >
                            <FontAwesomeIcon icon={faPlus} className="mr-1 h-4 w-4" />
                            Add Ingredient
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="mt-8">
                        <button
                          type="submit"
                          className="w-full bg-own-2 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={editingItem ? faSave : faPlus} className="mr-2" />
                          {editingItem ? 'Update Menu Item' : 'Add Menu Item'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Featured Dishes Form */}
                {activeTab === 'featured' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Add Featured Dish
                      </h2>
                      <div className="text-sm text-gray-500">
                        {featuredDishes.length}/3 featured dishes
                      </div>
                    </div>
                    
                    {featuredDishes.length >= 3 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2" />
                          <p className="text-yellow-700">
                            Maximum of 3 featured dishes allowed. Remove one to add a new featured dish.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleFeaturedSubmit}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Menu Item *
                            </label>
                            <select
                              required
                              value={featuredForm.menuItemId}
                              onChange={(e) => {
                                const selectedMenu = menus.find(m => m.id === e.target.value);
                                setFeaturedForm({
                                  ...featuredForm,
                                  menuItemId: e.target.value,
                                  title: selectedMenu?.name || '',
                                  description: selectedMenu?.description || ''
                                });
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            >
                              <option value="">Select a menu item</option>
                              {menus.map(menu => (
                                <option key={menu.id} value={menu.id}>
                                  {menu.name} - ₦{menu.price}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Display Title
                            </label>
                            <input
                              type="text"
                              value={featuredForm.title}
                              onChange={(e) => setFeaturedForm({...featuredForm, title: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              placeholder="Featured dish title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={featuredForm.description}
                              onChange={(e) => setFeaturedForm({...featuredForm, description: e.target.value})}
                              rows="2"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              placeholder="Why this dish is featured..."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Badge Text
                              </label>
                              <input
                                type="text"
                                value={featuredForm.badgeText}
                                onChange={(e) => setFeaturedForm({...featuredForm, badgeText: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                                placeholder="Chef's Choice"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Display Order
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="3"
                                value={featuredForm.displayOrder}
                                onChange={(e) => setFeaturedForm({...featuredForm, displayOrder: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                          >
                            <FontAwesomeIcon icon={faStar} className="mr-2" />
                            Add to Featured
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Categories Form */}
                {activeTab === 'categories' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Add New Category
                    </h2>
                    <form onSubmit={handleCategorySubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            placeholder="e.g., Main Courses, Desserts, Drinks"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                            rows="2"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            placeholder="Brief description of this category..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Icon
                            </label>
                            <select
                              value={categoryForm.icon}
                              onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            >
                              <option value="faUtensils">Utensils</option>
                              <option value="faBowlFood">Bowl Food</option>
                              <option value="faWineGlass">Wine Glass</option>
                              <option value="faBirthdayCake">Cake</option>
                              <option value="faLeaf">Leaf</option>
                              <option value="faFire">Fire</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Display Order
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={categoryForm.displayOrder}
                              onChange={(e) => setCategoryForm({...categoryForm, displayOrder: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                          </label>
                          <input
                            type="color"
                            value={categoryForm.color}
                            onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                            className="w-full h-10 cursor-pointer"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          Add Category
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Gallery Form */}
                {activeTab === 'gallery' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Add Gallery Image
                    </h2>
                    <form onSubmit={handleGallerySubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={galleryForm.title}
                            onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            placeholder="Image title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={galleryForm.description}
                            onChange={(e) => setGalleryForm({...galleryForm, description: e.target.value})}
                            rows="2"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            placeholder="Image description..."
                          />
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image *
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-own-2 transition-colors">
                            <div className="space-y-1 text-center">
                              {galleryForm.imagePreview ? (
                                <div className="relative">
                                  <img
                                    src={galleryForm.imagePreview}
                                    alt="Preview"
                                    className="mx-auto h-48 w-48 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setGalleryForm({...galleryForm, image: null, imagePreview: ''})}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                                  >
                                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <FontAwesomeIcon 
                                    icon={faImage} 
                                    className="mx-auto h-12 w-12 text-gray-400"
                                  />
                                  <div className="flex text-sm text-gray-600">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-own-2 hover:text-amber-600">
                                      <span>Upload an image</span>
                                      <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        required
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            setGalleryForm({
                                              ...galleryForm,
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
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={galleryForm.category}
                            onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          >
                            <option value="food">Food</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="events">Events</option>
                            <option value="team">Team</option>
                            <option value="preparation">Preparation</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faUpload} className="mr-2" />
                          Upload to Gallery
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Catering Packages Form */}
                {activeTab === 'catering' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Add Catering Package
                    </h2>
                    <form onSubmit={handleCateringSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Package Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={cateringForm.name}
                            onChange={(e) => setCateringForm({...cateringForm, name: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            placeholder="e.g., Standard Wedding Package"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                          </label>
                          <textarea
                            required
                            value={cateringForm.description}
                            onChange={(e) => setCateringForm({...cateringForm, description: e.target.value})}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            placeholder="Describe the catering package..."
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price per Person (₦) *
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={cateringForm.pricePerPerson}
                              onChange={(e) => setCateringForm({...cateringForm, pricePerPerson: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                              placeholder="5000"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Min Guests
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={cateringForm.minGuests}
                              onChange={(e) => setCateringForm({...cateringForm, minGuests: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Max Guests
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={cateringForm.maxGuests}
                              onChange={(e) => setCateringForm({...cateringForm, maxGuests: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            />
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Package Image
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-own-2 transition-colors">
                            <div className="space-y-1 text-center">
                              {cateringForm.imagePreview ? (
                                <div className="relative">
                                  <img
                                    src={cateringForm.imagePreview}
                                    alt="Preview"
                                    className="mx-auto h-48 w-48 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setCateringForm({...cateringForm, image: null, imagePreview: ''})}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                                  >
                                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <FontAwesomeIcon 
                                    icon={faImage} 
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
                                            setCateringForm({
                                              ...cateringForm,
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
                                </>
                              )}
                            </div>
                          </div>
                          {!cateringForm.imagePreview && (
                            <p className="text-xs text-gray-500 mt-2">
                              Leave empty to use placeholder image
                            </p>
                          )}
                        </div>

                        {/* Features */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            What's Included
                          </label>
                          <div className="space-y-2">
                            {cateringForm.includes.map((item, index) => (
                              <div key={index} className="flex space-x-2">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newIncludes = [...cateringForm.includes];
                                    newIncludes[index] = e.target.value;
                                    setCateringForm({...cateringForm, includes: newIncludes});
                                  }}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                                  placeholder="e.g., Main course, dessert, drinks"
                                />
                                {cateringForm.includes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newIncludes = cateringForm.includes.filter((_, i) => i !== index);
                                      setCateringForm({...cateringForm, includes: newIncludes});
                                    }}
                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setCateringForm({...cateringForm, includes: [...cateringForm.includes, '']})}
                              className="text-own-2 hover:text-amber-600 text-sm font-medium flex items-center"
                            >
                              <FontAwesomeIcon icon={faPlus} className="mr-1 h-4 w-4" />
                              Add Included Item
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Preparation Time (hours)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={cateringForm.estimatedPrepTime}
                            onChange={(e) => setCateringForm({...cateringForm, estimatedPrepTime: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faBirthdayCake} className="mr-2" />
                          Add Catering Package
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Data List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeTab === 'menu' && 'All Menu Items'}
                    {activeTab === 'featured' && 'Featured Dishes'}
                    {activeTab === 'categories' && 'Categories'}
                    {activeTab === 'gallery' && 'Gallery Images'}
                    {activeTab === 'catering' && 'Catering Packages'}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {activeTab === 'menu' && menus.length}
                    {activeTab === 'featured' && featuredDishes.length}
                    {activeTab === 'categories' && categories.length}
                    {activeTab === 'gallery' && gallery.length}
                    {activeTab === 'catering' && cateringPackages.length}
                  </span>
                </div>

                {/* Menu Items List */}
                {activeTab === 'menu' && (
                  <div className="space-y-4">
                    {menus.length === 0 ? (
                      <div className="text-center py-8">
                        <FontAwesomeIcon icon={faUtensils} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No menu items yet</p>
                        <button
                          onClick={importSampleData}
                          className="mt-2 text-sm text-own-2 hover:text-amber-600"
                        >
                          Import sample data
                        </button>
                      </div>
                    ) : (
                      menus.map((menu) => (
                        <div key={menu.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-own-2 transition-colors">{menu.name}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{menu.description}</p>
                            </div>
                            <span className="font-bold text-own-2">₦{menu.price}</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              {menu.isVegetarian && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Veg
                                </span>
                              )}
                              {menu.isSpicy && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  Spicy
                                </span>
                              )}
                              {menu.isFeatured && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditMenu(menu)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDeleteMenu(menu.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Featured Dishes List */}
                {activeTab === 'featured' && (
                  <div className="space-y-4">
                    {featuredDishes.length === 0 ? (
                      <div className="text-center py-8">
                        <FontAwesomeIcon icon={faStar} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No featured dishes yet</p>
                        <p className="text-sm text-gray-400 mt-1">Max 3 featured dishes allowed</p>
                      </div>
                    ) : (
                      featuredDishes.map((featured) => {
                        const menuItem = menus.find(m => m.id === featured.menuItemId);
                        return (
                          <div key={featured.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50 hover:bg-yellow-100 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{featured.title || menuItem?.name}</h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{featured.description}</p>
                              </div>
                              <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                {featured.badgeText}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-sm text-gray-500">
                                Order: {featured.displayOrder}
                              </span>
                              <button
                                onClick={() => handleDeleteFeatured(featured.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Categories List */}
                {activeTab === 'categories' && (
                  <div className="space-y-4">
                    {categories.length === 0 ? (
                      <div className="text-center py-8">
                        <FontAwesomeIcon icon={faTags} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No categories yet</p>
                      </div>
                    ) : (
                      categories.map((category) => (
                        <div 
                          key={category.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                style={{ backgroundColor: category.color + '20' }}
                              >
                                <FontAwesomeIcon 
                                  icon={faUtensils} 
                                  style={{ color: category.color }}
                                  className="h-4 w-4"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{category.name}</h4>
                                <p className="text-sm text-gray-600 line-clamp-1">{category.description}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {category.itemCount || 0} items
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Gallery List */}
                {activeTab === 'gallery' && (
                  <div className="space-y-4">
                    {gallery.length === 0 ? (
                      <div className="text-center py-8">
                        <FontAwesomeIcon icon={faImages} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No gallery images yet</p>
                      </div>
                    ) : (
                      gallery.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 transition-colors group">
                          <div className="relative">
                            {item.imageUrl && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="w-full h-32 object-cover"
                              />
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{item.title}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Catering Packages List */}
                {activeTab === 'catering' && (
                  <div className="space-y-4">
                    {cateringPackages.length === 0 ? (
                      <div className="text-center py-8">
                        <FontAwesomeIcon icon={faBirthdayCake} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No catering packages yet</p>
                      </div>
                    ) : (
                      cateringPackages.map((packageItem) => (
                        <div key={packageItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">{packageItem.name}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{packageItem.description}</p>
                            </div>
                            <span className="font-bold text-red-600">₦{packageItem.pricePerPerson}/person</span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm text-gray-500">
                              {packageItem.minGuests}-{packageItem.maxGuests} guests
                            </span>
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                              {packageItem.estimatedPrepTime}h prep
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Statistics */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-own-2">
                        {activeTab === 'menu' && menus.length}
                        {activeTab === 'featured' && featuredDishes.length}
                        {activeTab === 'categories' && categories.length}
                        {activeTab === 'gallery' && gallery.length}
                        {activeTab === 'catering' && cateringPackages.length}
                      </div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide mt-1">
                        Total Items
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {activeTab === 'menu' && menus.filter(m => m.isFeatured).length}
                        {activeTab === 'featured' && '3 Max'}
                        {activeTab === 'categories' && 'Active'}
                        {activeTab === 'gallery' && gallery.length}
                        {activeTab === 'catering' && cateringPackages.length}
                      </div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide mt-1">
                        {activeTab === 'menu' ? 'Featured' : 'Status'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}