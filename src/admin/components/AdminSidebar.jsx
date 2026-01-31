import React, { useState, useEffect } from 'react';
import { faBox, faCalendarAlt, faChartBar, faClock, faFileInvoice, faImages, faMapMarkerAlt, faShoppingCart, faSignOutAlt, faTags, faTimes, faUser, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { motion } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";

const AdminSideBar = ({ isOpen, closeSidebar, activeTab, setActiveTab }) => { 
  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "Loading...",
    position: "Manager",
    phone: "",
    joinDate: "",
    lastLogin: new Date().toISOString(),
    loginLocation: "Unknown",
    walletBalance: 0,
    photoURL: ""
  });
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async (user) => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user document from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userDataFromFirestore = userDoc.data();
          
          // Update last login timestamp
          const lastLogin = userDataFromFirestore.lastLogin || new Date().toISOString();
          
          // Get user's location (simulated for now)
          const getLocation = () => {
            if (navigator.geolocation) {
              return "Detecting...";
            }
            return "Lagos, Nigeria"; // Default location
          };
          
          setUserData({
            name: userDataFromFirestore.displayName || user.displayName || "User",
            email: userDataFromFirestore.email || user.email || "No email",
            position: userDataFromFirestore.role || userDataFromFirestore.position || "Manager",
            phone: userDataFromFirestore.phone || userDataFromFirestore.phoneNumber || "+234 000 000 0000",
            joinDate: userDataFromFirestore.createdAt ? 
              new Date(userDataFromFirestore.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
              }) : "Recently",
            lastLogin: lastLogin,
            loginLocation: getLocation(),
            walletBalance: userDataFromFirestore.walletBalance || 0,
            photoURL: userDataFromFirestore.photoURL || user.photoURL || ""
          });
        } else {
          // If user document doesn't exist, use auth data
          setUserData({
            name: user.displayName || "User",
            email: user.email || "No email",
            position: "Manager",
            phone: "",
            joinDate: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            }),
            lastLogin: new Date().toISOString(),
            loginLocation: "Unknown",
            walletBalance: 0,
            photoURL: user.photoURL || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        // Fallback to auth data if Firestore fails
        setUserData({
          name: user.displayName || "User",
          email: user.email || "No email",
          position: "Manager",
          phone: "",
          joinDate: "Recently",
          lastLogin: new Date().toISOString(),
          loginLocation: "Unknown",
          walletBalance: 0,
          photoURL: user.photoURL || ""
        });
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        fetchUserData(user);
      } else {
        // If no user is logged in, redirect to login
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Format last login date
  const formatLastLogin = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    } catch (error) {
      return {
        date: "Unknown",
        time: "Unknown"
      };
    }
  };

  const lastLogin = formatLastLogin(userData.lastLogin);

  // Menu items with proper routing
  const menuItems = [
    { id: "Dashboard", icon: faChartBar, label: "Dashboard", path: "/admin/dashboard" },
    { id: "Menu", icon: faUtensils, label: "Menu Management", path: "/admin/menu" },
    { id: "Categories", icon: faTags, label: "Categories", path: "/admin/categories" },
    { id: "Gallery", icon: faImages, label: "Gallery", path: "/admin/gallery" },
    // { id: "Catering", icon: faBox, label: "Catering Packages", path: "/admin/catering" },
    { id: "Orders", icon: faShoppingCart, label: "Orders", path: "/admin/orders" },
    // { id: "Invoices", icon: faFileInvoice, label: "Invoices", path: "/admin/invoices" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeSidebar}
        className={`${
          isOpen ? "bg-black/50 backdrop-blur-sm md:hidden z-50 fixed top-0 w-full h-screen" : ""
        }`}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 w-80 md:w-[30%] lg:w-[25%] h-screen bg-own-1 md:bg-transparent text-[#dfe3e7] transform ${
          isOpen ? "translate-x-0" : "translate-x-[-320px]"
        } transition-transform duration-500 z-50`}
      >
        <motion.div 
          initial={{ x: -300, opacity: 0 }}
          animate={{ 
            x: isOpen ? 0 : -300, 
            opacity: isOpen ? 1 : 0 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 h-full bg-white shadow-xl z-40 lg:relative lg:left-0 lg:shadow-none lg:z-0 pb-20 md:pb-0"
        >
          <div className="flex justify-between items-center p-4 border-b lg:hidden">
            <span className="font-bold text-own-2 text-lg">Admin Panel</span>
            <button onClick={closeSidebar} className="text-black text-lg">
              <FontAwesomeIcon icon={faTimes}/>
            </button>
          </div>
          
          {/* Scrollable content with hidden scrollbar */}
          <div className="h-full overflow-y-auto p-6 sidebar-scroll">
            <h1 className="text-own-2 font-bold text-2xl pb-5 pt-3 hidden md:block text-center">Admin Panel</h1>
            
            {/* User Profile Section - Updated to match UserSidebar */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-own-2 rounded-full flex items-center justify-center overflow-hidden">
                {loading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded-full"></div>
                ) : userData.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData.name || "Admin User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-3xl text-white" />
                )}
              </div>
              <h3 className="text-lg font-bold text-own-2">
                {userData.name || "Welcome!"}
              </h3>
              <p className="text-sm text-gray-600">
                {userData.email || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 font-bold uppercase mt-1">
                {userData.position === "customer" ? "Customer" : userData.position || "Manager"}
              </p>
            </div>

            {/* Navigation Menu */}
            <nav>
              {menuItems.map((item) => (
                <Link to={item.path} key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      closeSidebar();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors mb-3 flex items-center ${
                      activeTab === item.id 
                        ? "bg-own-2 text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="mr-3 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              ))}

              {/* Sign Out Button */}
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors flex items-center mb-3 mt-5"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>

            {/* Last Login Session */}
            {!loading && (
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-own-2 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Last Login</h4>
                  <p className="text-sm text-gray-600 mb-1 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-own-2" />
                    {lastLogin.date}
                  </p>
                  <p className="text-sm text-gray-600 mb-2 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="mr-2 text-own-2" />
                    {lastLogin.time}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                    {userData.loginLocation}
                  </p>
                  
                  {/* Additional Info */}
                  {userData.joinDate && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Member since: {userData.joinDate}
                      </p>
                      {userData.phone && (
                        <p className="text-xs text-gray-500 mt-1">
                          Phone: {userData.phone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading State for Last Login */}
            {loading && (
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-own-2 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="text-white animate-pulse" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Admin Stats (Optional) */}
            {!loading && userData.position !== "customer" && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2 text-center">Admin Access</h4>
                <p className="text-xs text-gray-600 text-center">
                  You have full administrative privileges
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-sm font-bold text-own-2">✓</div>
                    <div className="text-xs text-gray-600">Full Access</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-own-2">✓</div>
                    <div className="text-xs text-gray-600">Edit Content</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminSideBar;