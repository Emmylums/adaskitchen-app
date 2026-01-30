import {
  faUser, 
  faHistory, 
  faHeart, 
  faMapMarkerAlt, 
  faCreditCard, 
  faCog,
  faSignOutAlt,
  faClock,
  faCalendarAlt,
  faBell,
  faShieldAlt,
  faGift,
  faUtensils,
  faInfoCircle,
  faQuestionCircle,
  faX,
  faHome,
  faCartShopping
} from "@fortawesome/free-solid-svg-icons";
import { motion } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";

const UserSideBar = ({ isOpen, closeSidebar, activeTab, setActiveTab, userData }) => { 
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Format last login date
  const formatLastLogin = (dateString) => {
    if (!dateString) return { date: "N/A", time: "" };
    
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
          minute: '2-digit'
        })
      };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { date: "N/A", time: "" };
    }
  };

  const lastLogin = userData?.lastLogin ? formatLastLogin(userData.lastLogin) : { date: "N/A", time: "" };

  const handleSignOut = async () => {
    try {
      // Show confirmation dialog
      if (window.confirm("Are you sure you want to sign out?")) {
        await logout();
        console.log("User signed out successfully");
        
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
          closeSidebar();
        }
        
        // Navigate to home page
        navigate("/");
        
        // Show success message (optional)
        // You can add a toast notification here if you have one
      }
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
    // Close sidebar on mobile after clicking a link
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeSidebar}
        className={`${
          isOpen ? "bg-black/50 backdrop-blur-sm lg:hidden z-50 fixed top-0 w-full h-screen" : ""
        }`}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 w-80 lg:w-[25%] h-screen bg-own-1 lg:bg-transparent text-[#dfe3e7] transform ${
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
          className="fixed top-0 left-0 h-full bg-white shadow-xl z-40 lg:relative lg:left-0 lg:shadow-none lg:z-0 pb-20 lg:pb-0"
        >
          <div className="w-80 flex justify-between items-center p-4 border-b lg:hidden">
            <span className="font-bold text-own-2 text-lg">Menu</span>
            <button onClick={closeSidebar} className="text-black text-lg">
              <FontAwesomeIcon icon={faX}/>
            </button>
          </div>
          
          {/* Scrollable content with hidden scrollbar */}
          <div className="h-full overflow-y-auto p-6 sidebar-scroll">
            {/* User Profile */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-own-2 rounded-full flex items-center justify-center">
                {userData?.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData?.displayName || "User"} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-3xl text-white" />
                )}
              </div>
              <h3 className="text-lg font-bold text-own-2">
                {userData?.displayName || "Welcome!"}
              </h3>
              <p className="text-sm text-gray-600">
                {userData?.email || "Sign in to continue"}
              </p>
            </div>

            {/* Navigation Menu */}
            <nav>
              {[
                { id: "Dashboard", icon: faHome, label: "Dashboard", path: "/user/dashboard" },
                { id: "Menu", icon: faUtensils, label: "Menu", path: "/user/menu" },
                { id: "Cart", icon: faCartShopping, label: "Cart", path: "/user/cart" },
                { id: "Orders", icon: faHistory, label: "Order History", path: "/user/orders" },
                { id: "Payments", icon: faCreditCard, label: "Payments & Wallet", path: "/user/payments" },
                { id: "Notifications", icon: faBell, label: "Notifications", path: "/user/notifications" },
                { id: "Favorites", icon: faHeart, label: "Favorites", path: "/user/favorites" },
                { id: "Addresses", icon: faMapMarkerAlt, label: "Addresses", path: "/user/addresses" },
                // { id: "Security", icon: faShieldAlt, label: "Security", path: "/user/security" },
                // { id: "Support", icon: faQuestionCircle, label: "Help & Support", path: "/user/support" },
                { id: "Settings", icon: faCog, label: "Settings", path: "/user/settings" }
              ].map((item) => (
                <Link to={item.path} key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
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
                className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors flex items-center mb-3"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>

            {/* Last Login Session */}
            {userData?.lastLogin && (
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
                  {userData?.loginLocation && (
                    <p className="text-xs text-gray-500 flex items-center justify-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                      {userData.loginLocation}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default UserSideBar;