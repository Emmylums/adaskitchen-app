import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faShoppingCart, 
  faUser, 
  faUtensils,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faCalendarAlt,
  faUsers,
  faImage,
  faClipboardList,
  faTruck,
  faStar,
  faFire,
  faPoundSign
} from '@fortawesome/free-solid-svg-icons';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc, 
  setDoc,
  serverTimestamp,
  where,
  deleteDoc
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Link } from 'react-router-dom';

// Default sample data for collections
const DEFAULT_DATA = {
  menus: [
    {
      name: "Jollof Rice",
      description: "Traditional Nigerian rice cooked in tomato and pepper sauce",
      price: 30,
      category: "Main Course",
      imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFeatured: true,
      available: true,
      ingredients: ["Rice", "Tomatoes", "Bell peppers", "Onions", "Spices"],
      preparationTime: 30,
      isVegetarian: false,
      isSpicy: true,
      calories: 450,
      displayOrder: 1,
      featuredOrder: 1,
      featuredDescription: "Our signature dish with authentic Nigerian flavors",
      featuredBadge: "Best Seller",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: "Suya",
      description: "Spicy grilled meat skewers",
      price: 25,
      category: "Appetizer",
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFeatured: true,
      available: true,
      ingredients: ["Beef", "Suya spice", "Onions", "Tomatoes"],
      preparationTime: 20,
      isVegetarian: false,
      isSpicy: true,
      calories: 320,
      displayOrder: 2,
      featuredOrder: 2,
      featuredDescription: "Authentic Nigerian street food favorite",
      featuredBadge: "Spicy",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: "Pounded Yam & Egusi",
      description: "Yam flour with melon seed soup",
      price: 35,
      category: "Main Course",
      imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFeatured: false,
      available: true,
      ingredients: ["Yam flour", "Melon seeds", "Vegetables", "Meat"],
      preparationTime: 45,
      isVegetarian: false,
      isSpicy: false,
      calories: 520,
      displayOrder: 3,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],
  
  categories: [
    { 
      name: "Appetizer", 
      description: "Starters and small bites", 
      active: true,
      displayOrder: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { 
      name: "Main Course", 
      description: "Main dishes and entrees", 
      active: true,
      displayOrder: 2,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { 
      name: "Desserts", 
      description: "Sweet treats and desserts", 
      active: true,
      displayOrder: 3,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { 
      name: "Drinks", 
      description: "Beverages and drinks", 
      active: true,
      displayOrder: 4,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],
  
  cateringPackages: [
    {
      name: "Standard Package",
      description: "Perfect for small gatherings",
      price: 2500,
      minGuests: 10,
      maxGuests: 50,
      includes: ["Jollof Rice", "Fried Rice", "Chicken", "Salad", "Drinks"],
      features: ["Buffet Style", "2 Main Dishes", "1 Appetizer", "Soft Drinks"],
      preparationTime: 1440, // 24 hours in minutes
      deliveryFee: 5000,
      depositPercentage: 50,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      displayOrder: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      name: "Premium Package",
      description: "Ideal for corporate events",
      price: 5000,
      minGuests: 50,
      maxGuests: 200,
      includes: ["All Standard items", "Suya", "Small chops", "Dessert", "Premium drinks"],
      features: ["Plated Service", "3 Main Dishes", "2 Appetizers", "Dessert Bar", "Premium Bar"],
      preparationTime: 2880, // 48 hours in minutes
      deliveryFee: 10000,
      depositPercentage: 50,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      displayOrder: 2,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],
  
  gallery: [
    { 
      caption: "Jollof Rice Platter",
      description: "Our signature Jollof rice served with grilled chicken",
      category: "Food",
      url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFeatured: true,
      displayOrder: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { 
      caption: "Restaurant Interior",
      description: "Modern and cozy dining area",
      category: "Ambiance", 
      url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFeatured: true,
      displayOrder: 2,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { 
      caption: "Customer Event",
      description: "Wedding catering at a beautiful venue",
      category: "Events", 
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFeatured: false,
      displayOrder: 3,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],
  
  cateringRequests: [
    {
      customerName: "John Doe",
      customerEmail: "john.doe@email.com",
      customerPhone: "+234 901 234 5678",
      company: "Tech Solutions Ltd",
      eventType: "Corporate Lunch",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      eventTime: "13:00",
      numberOfGuests: 25,
      venueAddress: "123 Business Avenue, Lagos",
      packageName: "Standard Package",
      specialInstructions: "Please include vegetarian options for 5 guests",
      status: "pending",
      paymentStatus: "pending",
      totalAmount: 25000,
      depositAmount: 12500,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      customerName: "Sarah Johnson",
      customerEmail: "sarah.j@email.com",
      customerPhone: "+234 902 345 6789",
      company: "Personal Event",
      eventType: "Wedding Reception",
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      eventTime: "17:00",
      numberOfGuests: 150,
      venueAddress: "456 Wedding Hall, Lagos",
      packageName: "Premium Package",
      specialInstructions: "Need cake cutting ceremony setup",
      status: "confirmed",
      paymentStatus: "deposit_paid",
      totalAmount: 50000,
      depositAmount: 25000,
      paymentDate: new Date(),
      paymentMethod: "bank_transfer",
      referenceNumber: "REF-123456",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],
  
  orders: [
    {
      orderNumber: "ORD-" + Date.now().toString().slice(-6),
      customerName: "Ada Johnson",
      customerEmail: "ada.johnson@email.com",
      customerPhone: "+234 912 345 6789",
      deliveryAddress: "123 Main Street, Lagos",
      deliveryInstructions: "Call before arrival",
      orderType: "delivery",
      items: [
        { name: "Jollof Rice", price: 30, quantity: 2, total: 60 },
        { name: "Suya", price: 25, quantity: 1, total: 25 }
      ],
      subtotal: 8500,
      deliveryFee: 500,
      tax: 637.5,
      discount: 0,
      total: 9637.5,
      orderStatus: "completed",
      paymentMethod: "card",
      paymentStatus: "paid",
      notes: "Extra spicy please",
      assignedTo: "Delivery Team",
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      orderNumber: "ORD-" + (Date.now() + 1).toString().slice(-6),
      customerName: "Michael Brown",
      customerEmail: "michael.b@email.com",
      customerPhone: "+234 903 456 7890",
      deliveryAddress: "789 Oak Street, Lagos",
      deliveryInstructions: "Leave at reception",
      orderType: "pickup",
      items: [
        { name: "Pounded Yam & Egusi", price: 35, quantity: 1, total: 35 },
        { name: "Fried Rice", price: 28, quantity: 2, total: 56 }
      ],
      subtotal: 9100,
      deliveryFee: 0,
      tax: 682.5,
      discount: 500,
      total: 9282.5,
      orderStatus: "preparing",
      paymentMethod: "cash",
      paymentStatus: "pending",
      notes: "No onions in fried rice",
      assignedTo: "Kitchen Staff",
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],
  
  invoices: [
    {
      invoiceNumber: "INV-" + new Date().getFullYear() + "-" + (new Date().getMonth() + 1).toString().padStart(2, '0') + "-0001",
      orderId: "", // Will be set after orders are created
      customerName: "Ada Johnson",
      customerEmail: "ada.johnson@email.com",
      customerPhone: "+234 912 345 6789",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [
        { name: "Jollof Rice", price: 30, quantity: 2, total: 60},
        { name: "Suya", price: 25, quantity: 1, total: 25 }
      ],
      subtotal: 8500,
      tax: 637.5,
      discount: 0,
      total: 9137.5,
      notes: "Thank you for your business!",
      paymentInstructions: "Payment due within 7 days. Late payments subject to 5% fee.",
      status: "paid",
      paymentMethod: "card",
      paymentDate: new Date(),
      referenceNumber: "TXN-123456",
      createdBy: "System",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ]
};

export default function ManagerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const [activeTab, setActiveTab] = useState("Dashboard");
  
  // State for Firebase data
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cateringRequests, setCateringRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [initializationStatus, setInitializationStatus] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalMenuItems: 0,
    totalCategories: 0,
    totalFeaturedDishes: 0,
    pendingCateringRequests: 0,
    pendingOrders: 0
  });

  // Function to sync featured dishes
  const syncFeaturedDishes = async (menus) => {
    try {
      const featuredDishesRef = collection(db, "featuredDishes");
      
      // Get existing featured dishes
      const featuredSnapshot = await getDocs(featuredDishesRef);
      
      // Get featured menu items
      const featuredMenuItems = menus.filter(menu => menu.isFeatured);
      
      // Prepare featured dishes data
      const featuredDishesData = featuredMenuItems.map((menu, index) => ({
        menuItemId: menu.id || menu.name,
        menuItemName: menu.name,
        menuItemPrice: menu.price,
        menuItemCategory: menu.category,
        menuItemImage: menu.imageUrl,
        featuredDescription: menu.featuredDescription || `${menu.name} - ${menu.description.substring(0, 100)}...`,
        featuredBadge: menu.featuredBadge || "Featured",
        featuredOrder: menu.featuredOrder || index + 1,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }));

      // Delete all existing featured dishes
      const deletePromises = featuredSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Add new featured dishes
      const addPromises = featuredDishesData.map(dishData => {
        const docRef = doc(featuredDishesRef);
        return setDoc(docRef, dishData);
      });

      await Promise.all(addPromises);

      // Fetch and set featured dishes
      const updatedSnapshot = await getDocs(query(featuredDishesRef, orderBy("featuredOrder", "asc")));
      const dishes = updatedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFeaturedDishes(dishes);
      
      return dishes.length;
    } catch (error) {
      console.error("Error syncing featured dishes:", error);
      return 0;
    }
  };

  // Check if collections exist and create if they don't
  const initializeCollections = async () => {
    setInitializing(true);
    
    try {
      // Create collections in order to maintain relationships
      const collections = [
        { name: "menus", data: DEFAULT_DATA.menus },
        { name: "categories", data: DEFAULT_DATA.categories },
        { name: "cateringPackages", data: DEFAULT_DATA.cateringPackages },
        { name: "gallery", data: DEFAULT_DATA.gallery },
        { name: "orders", data: DEFAULT_DATA.orders },
        { name: "cateringRequests", data: DEFAULT_DATA.cateringRequests },
        { name: "invoices", data: DEFAULT_DATA.invoices },
        // featuredDishes will be created after menus
      ];

      // Create a map to store document IDs for relationship linking
      const documentIds = {
        menus: {},
        orders: {},
        cateringPackages: {},
        featuredDishes: {}
      };

      // Create each collection
      for (const collectionConfig of collections) {
        setInitializationStatus(`Creating ${collectionConfig.name}...`);
        
        // Check if collection exists
        const collectionRef = collection(db, collectionConfig.name);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          // Create all documents in this collection
          for (const data of collectionConfig.data) {
            const docRef = doc(collectionRef);
            
            // Store document ID for relationship linking
            if (collectionConfig.name === "menus") {
              documentIds.menus[data.name] = docRef.id;
            } else if (collectionConfig.name === "cateringPackages") {
              documentIds.cateringPackages[data.name] = docRef.id;
            }
            
            // Create document with timestamp
            await setDoc(docRef, {
              ...data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } else {
          // Store existing document IDs
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (collectionConfig.name === "menus" && data.name) {
              documentIds.menus[data.name] = docSnap.id;
            } else if (collectionConfig.name === "orders" && data.orderNumber) {
              documentIds.orders[data.orderNumber] = docSnap.id;
            } else if (collectionConfig.name === "cateringPackages" && data.name) {
              documentIds.cateringPackages[data.name] = docSnap.id;
            }
          });
        }
      }

      // Now create featuredDishes collection from featured menu items
      setInitializationStatus('Creating featured dishes...');
      const featuredDishesRef = collection(db, "featuredDishes");
      const featuredSnapshot = await getDocs(featuredDishesRef);
      
      if (featuredSnapshot.empty) {
        // Get all menu items to find featured ones
        const menusSnapshot = await getDocs(collection(db, "menus"));
        const menuItemsList = menusSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Create featured dishes from featured menu items
        const featuredMenuItems = menuItemsList.filter(item => item.isFeatured);
        
        for (const [index, menuItem] of featuredMenuItems.entries()) {
          const featuredDishDoc = doc(featuredDishesRef);
          const featuredDishData = {
            menuItemId: menuItem.id,
            menuItemName: menuItem.name,
            menuItemPrice: menuItem.price,
            menuItemCategory: menuItem.category,
            menuItemImage: menuItem.imageUrl,
            featuredDescription: menuItem.featuredDescription || `${menuItem.name} - ${menuItem.description.substring(0, 100)}...`,
            featuredBadge: menuItem.featuredBadge || "Featured",
            featuredOrder: menuItem.featuredOrder || index + 1,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          documentIds.featuredDishes[menuItem.id] = featuredDishDoc.id;
          await setDoc(featuredDishDoc, featuredDishData);
        }
      }

      // Now create invoices with proper order references
      setInitializationStatus('Finalizing invoices...');
      const invoicesRef = collection(db, "invoices");
      const invoicesSnapshot = await getDocs(invoicesRef);
      
      if (invoicesSnapshot.empty && Object.keys(documentIds.orders).length > 0) {
        // Get the first order ID for invoice linking
        const firstOrderId = Object.values(documentIds.orders)[0];
        
        const invoiceData = {
          ...DEFAULT_DATA.invoices[0],
          orderId: firstOrderId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const invoiceDocRef = doc(invoicesRef);
        await setDoc(invoiceDocRef, invoiceData);
      }

      setInitializationStatus('Collections initialized successfully!');
      setTimeout(() => {
        setInitializing(false);
        fetchDashboardData();
      }, 1000);
      
    } catch (error) {
      console.error("Error initializing collections:", error);
      setInitializationStatus(`Error: ${error.message}`);
      setInitializing(false);
    }
  };

  // Fetch data from Firebase
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if any collections exist
      const collections = ["menus", "categories", "orders", "cateringPackages", "gallery", "cateringRequests", "invoices", "featuredDishes"];
      let collectionsExist = false;
      
      for (const collectionName of collections) {
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(collectionRef);
          if (!snapshot.empty) {
            collectionsExist = true;
            break;
          }
        } catch (error) {
          console.log(`Collection ${collectionName} check failed:`, error);
        }
      }
      
      // If no collections exist, initialize them
      if (!collectionsExist) {
        await initializeCollections();
        return;
      }
      
      // Fetch all data concurrently
      const fetchPromises = {
        menus: getDocs(collection(db, "menus")),
        categories: getDocs(collection(db, "categories")),
        orders: getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5))),
        cateringRequests: getDocs(collection(db, "cateringRequests")),
        invoices: getDocs(collection(db, "invoices")),
        featuredDishes: getDocs(query(collection(db, "featuredDishes"), orderBy("featuredOrder", "asc")))
      };
      
      const results = await Promise.allSettled(Object.values(fetchPromises));
      
      // Process results
      const menuSnapshot = results[0].status === 'fulfilled' ? results[0].value : { docs: [] };
      const categoriesSnapshot = results[1].status === 'fulfilled' ? results[1].value : { docs: [] };
      const ordersSnapshot = results[2].status === 'fulfilled' ? results[2].value : { docs: [] };
      const cateringRequestsSnapshot = results[3].status === 'fulfilled' ? results[3].value : { docs: [] };
      const invoicesSnapshot = results[4].status === 'fulfilled' ? results[4].value : { docs: [] };
      const featuredDishesSnapshot = results[5].status === 'fulfilled' ? results[5].value : { docs: [] };
      
      // Set state with fetched data
      const menusList = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(menusList);
      
      setCategories(categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      
      const ordersList = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersList);
      
      const cateringRequestsList = cateringRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCateringRequests(cateringRequestsList);
      
      setInvoices(invoicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

      // Set featured dishes
      const featuredDishesList = featuredDishesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeaturedDishes(featuredDishesList);

      // Sync featured dishes if needed
      const featuredMenuItems = menusList.filter(item => item.isFeatured);
      if (featuredDishesList.length !== featuredMenuItems.length) {
        const newFeaturedCount = await syncFeaturedDishes(menusList);
        setFeaturedDishes(prev => {
          // Update state with new featured dishes count
          return Array(newFeaturedCount).fill({}).map((_, i) => ({
            id: `temp-${i}`,
            menuItemName: "Syncing..."
          }));
        });
      }

      // Calculate stats
      const totalRevenue = ordersList.reduce((sum, order) => {
        // Only count revenue if payment status is 'paid'
        return (order.paymentStatus === 'paid' || order.paymentStatus === 'deposit_paid') 
          ? sum + (order.total || 0) 
          : sum;
      }, 0);
      const pendingOrders = ordersList.filter(order => order.orderStatus === 'pending' || order.orderStatus === 'preparing').length;
      const pendingCateringRequests = cateringRequestsList.filter(req => req.status === 'pending').length;
      
      setStats({
        totalOrders: ordersList.length,
        totalRevenue: totalRevenue,
        totalMenuItems: menusList.length,
        totalCategories: categoriesSnapshot.docs.length,
        totalFeaturedDishes: featuredDishesList.length,
        pendingOrders: pendingOrders,
        pendingCateringRequests: pendingCateringRequests
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    switch(action) {
      case 'addMenuItem':
        setActiveTab('Menu');
        break;
      case 'viewOrders':
        setActiveTab('Orders');
        break;
      case 'cateringPackages':
        setActiveTab('Catering');
        break;
      case 'manageGallery':
        setActiveTab('Gallery');
        break;
      case 'manageInvoices':
        setActiveTab('Invoices');
        break;
      case 'manageCategories':
        setActiveTab('Categories');
        break;
      case 'manageFeaturedDishes':
        setActiveTab('FeaturedDishes');
        break;
      default:
        break;
    }
  };

  // Refresh featured dishes
  const refreshFeaturedDishes = async () => {
    try {
      await syncFeaturedDishes(menuItems);
      fetchDashboardData();
    } catch (error) {
      console.error("Error refreshing featured dishes:", error);
    }
  };

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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-own-2">Dashboard Overview</h2>
              <div className="flex items-center space-x-2">
                {initializing && (
                  <div className="flex items-center text-sm text-own-2">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    {initializationStatus}
                  </div>
                )}
                <button
                  onClick={refreshFeaturedDishes}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                  title="Refresh Featured Dishes"
                >
                  <FontAwesomeIcon icon={faStar} className="mr-1" />
                  Sync Featured
                </button>
              </div>
            </div>
            
            {initializing ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center">
                  <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Setting Up Your Dashboard</h3>
                  <p className="text-gray-600 mb-4">{initializationStatus}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-own-2 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Creating collections and adding sample data...
                  </p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                <span className="ml-3 text-gray-600">Loading dashboard data...</span>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-2xl text-own-2 mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">Total Orders</h3>
                    <p className="text-xl font-bold text-own-2">{stats.totalOrders}</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <p className="text-3xl text-own-2 mb-2 font-bold">£</p>
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">Revenue</h3>
                    <p className="text-xl font-bold text-own-2">{formatCurrency(stats.totalRevenue)}</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <FontAwesomeIcon icon={faUtensils} className="text-2xl text-own-2 mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">Menu Items</h3>
                    <p className="text-xl font-bold text-own-2">{stats.totalMenuItems}</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <FontAwesomeIcon icon={faStar} className="text-2xl text-own-2 mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">Featured Dishes</h3>
                    <p className="text-xl font-bold text-own-2">{stats.totalFeaturedDishes}</p>
                  </div>

                  {/* <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <FontAwesomeIcon icon={faUsers} className="text-2xl text-own-2 mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">Catering Requests</h3>
                    <p className="text-xl font-bold text-own-2">{cateringRequests.length}</p>
                  </div> */}

                  <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <FontAwesomeIcon icon={faClipboardList} className="text-2xl text-own-2 mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">Pending Orders</h3>
                    <p className="text-xl font-bold text-own-2">{stats.pendingOrders}</p>
                  </div>

                  {/* <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-2xl text-own-2 mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">Pending Catering</h3>
                    <p className="text-xl font-bold text-own-2">{stats.pendingCateringRequests}</p>
                  </div> */}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-own-2">Recent Orders</h3>
                      {orders.length === 0 && (
                        <span className="text-sm text-gray-500">No orders yet</span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                          <div>
                            <h4 className="font-semibold text-own-2 text-sm">{order.orderNumber}</h4>
                            <p className="text-xs text-gray-600">{order.customerName || 'Customer'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{(formatCurrency(order.total) || 0)}</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.orderStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.orderStatus === 'preparing' ? 'bg-yellow-100 text-yellow-800' : 
                              order.orderStatus === 'pending' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.orderStatus || 'pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <FontAwesomeIcon icon={faShoppingCart} className="text-3xl text-gray-300 mb-3" />
                          <p className="text-sm">No orders yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Featured Dishes */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-own-2">Featured Dishes</h3>
                      <span className="text-sm text-own-2 font-semibold">
                        {featuredDishes.length} dishes
                      </span>
                    </div>
                    <div className="space-y-3">
                      {featuredDishes.slice(0, 3).map(dish => (
                        <div key={dish.id} className="flex items-center p-3 border border-gray-100 rounded-xl">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 mr-3 overflow-hidden">
                            {dish.menuItemImage ? (
                              <img 
                                src={dish.menuItemImage} 
                                alt={dish.menuItemName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-amber-100">
                                <FontAwesomeIcon icon={faUtensils} className="text-amber-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-semibold text-own-2 text-sm">{dish.menuItemName || 'Loading...'}</h4>
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs flex items-center">
                                <FontAwesomeIcon icon={faStar} className="mr-1" />
                                {dish.featuredBadge || 'Featured'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{dish.menuItemCategory}</p>
                            <p className="text-xs font-bold">{(formatCurrency(dish.menuItemPrice) || 0)}</p>
                          </div>
                        </div>
                      ))}
                      {featuredDishes.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <FontAwesomeIcon icon={faStar} className="text-3xl text-gray-300 mb-3" />
                          <p className="text-sm">No featured dishes yet</p>
                          <p className="text-xs mt-2">Mark menu items as featured to see them here</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions & Recent Menu Items */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-own-2 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <Link to="/admin/menu" className="p-3 bg-own-2 text-white text-center rounded-xl hover:bg-amber-600 transition-colors text-sm">
                        <button>
                          Add Menu Item
                        </button>
                      </Link>

                      {/* <Link to="/admin/menu" className="p-3 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors text-sm">
                        <button>
                          Manage Featured
                        </button>
                      </Link> */}

                      <Link to="/admin/orders" className="p-3 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors text-sm">
                        <button>
                          View Orders
                        </button>
                      </Link>

                      {/* <Link to="/admin/catering" className="p-3 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors text-sm">
                        <button>
                          Catering Packages
                        </button>
                      </Link> */}

                      <Link to="/admin/gallery" className="p-3 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors text-sm">
                        <button>
                          Manage Gallery
                        </button>
                      </Link>

                      <Link to="/admin/categories" className="p-3 border border-own-2 text-own-2 text-center rounded-xl hover:bg-amber-50 transition-colors text-sm">
                        <button>
                          Manage Categories
                        </button>
                      </Link>
                    </div>
                    
                    {/* Recent Menu Items */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-700 mb-3">Recent Menu Items</h4>
                      <div className="space-y-2">
                        {menuItems.slice(0, 3).map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 border-b border-gray-100">
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                              <p className="text-xs text-gray-600">{formatCurrency(item.price*100) || '0'}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.isFeatured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.isFeatured ? 'Featured' : 'Regular'}
                            </span>
                          </div>
                        ))}
                        {menuItems.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            <FontAwesomeIcon icon={faUtensils} className="text-xl text-gray-300 mb-2" />
                            <p className="text-sm">No menu items yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Initialize Collections Button (if no data) */}
                {!loading && menuItems.length === 0 && categories.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-xl mr-3" />
                      <h3 className="text-lg font-bold text-yellow-800">No Data Found</h3>
                    </div>
                    <p className="text-yellow-700 mb-4">
                      Your collections are empty. Would you like to initialize with sample data?
                    </p>
                    <button
                      onClick={initializeCollections}
                      disabled={initializing}
                      className="px-6 py-3 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {initializing ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                          Initialize Collections with Sample Data
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}