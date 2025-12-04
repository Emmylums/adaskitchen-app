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
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const UserSideBar = ({ isOpen, closeSidebar, activeTab, setActiveTab, userData }) => { 
  // Format last login date
  const formatLastLogin = (dateString) => {
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
  };

  const lastLogin = formatLastLogin(userData.lastLogin);

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
            <span className="font-bold text-own-2 text-lg">Menu</span>
            <button onClick={closeSidebar} className="text-black text-lg">
              <FontAwesomeIcon icon={faX}/>
            </button>
          </div>
          
          {/* Scrollable content with hidden scrollbar */}
          <div className="h-full overflow-y-auto p-6 sidebar-scroll">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-own-2 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-3xl text-white" />
              </div>
              <h3 className="text-lg font-bold text-own-2">{userData.name}</h3>
              <p className="text-sm text-gray-600">{userData.email}</p>
            </div>

            <nav>
              {[
                { id: "Dashboard", icon: faHome, label: "Dashboard" },
                { id: "Menu", icon: faUtensils, label: "Menu" },
                { id: "Cart", icon: faCartShopping, label: "Cart" },
                { id: "Orders", icon: faHistory, label: "Order History" },
                { id: "Payments", icon: faCreditCard, label: "Payments & Wallet" },
                { id: "Notifications", icon: faBell, label: "Notifications" },
                { id: "Favorites", icon: faHeart, label: "Favorites" },
                { id: "Addresses", icon: faMapMarkerAlt, label: "Addresses" },
                { id: "Security", icon: faShieldAlt, label: "Security" },
                { id: "Support", icon: faQuestionCircle, label: "Help & Support" },
                { id: "Settings", icon: faCog, label: "Settings" }
              ].map((item) => (
                <Link to={`/user/${item.id}`} key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors mb-3 ${
                      activeTab === item.id 
                        ? "bg-own-2 text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="mr-3" />
                    {item.label}
                  </button>
                </Link>
              ))}

              <button className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors">
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                Sign Out
              </button>
            </nav>

            {/* Last Login Session */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-own-2 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faClock} className="text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Last Login</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-own-2" />
                  {lastLogin.date}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <FontAwesomeIcon icon={faClock} className="mr-2 text-own-2" />
                  {lastLogin.time}
                </p>
                <p className="text-xs text-gray-500">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                  {userData.loginLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Add custom CSS for hiding scrollbar */}
          <style jsx>{`
            .sidebar-scroll {
              scrollbar-width: none;  /* Firefox */
              -ms-overflow-style: none;  /* IE and Edge */
            }
            
            .sidebar-scroll::-webkit-scrollbar {
              display: none;  /* Chrome, Safari and Opera */
            }
          `}</style>
        </motion.div>
      </div>
    </>
  );
};

export default UserSideBar;