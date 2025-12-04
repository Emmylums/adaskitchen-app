import { faBox, faCalendarAlt, faChartBar, faClock, faFileInvoice, faImages, faMapMarkerAlt, faShoppingCart, faSignOutAlt, faTags, faTimes, faUser, faUtensils } from "@fortawesome/free-solid-svg-icons";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AdminSideBar = ({ isOpen, closeSidebar, activeTab, setActiveTab, userData }) => { 
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
          className="fixed top-0 left-0 h-full bg-own-2 shadow-xl z-40 lg:relative lg:left-0 lg:shadow-none lg:z-0 pb-20 md:pb-0"
        >
          <div className="flex justify-between items-center p-4 border-b lg:hidden">
            <span className="font-bold text-white text-lg">Admin Panel</span>
            <button onClick={closeSidebar} className="text-black text-lg">
              <FontAwesomeIcon icon={faTimes}/>
            </button>
          </div>
          
          {/* Scrollable content with hidden scrollbar */}
          <div className="h-full overflow-y-auto p-6 sidebar-scroll">
            <h1 className="text-white font-bold text-2xl pb-5 pt-3 hidden md:block">Admin Panel</h1>
            <div className="mt-5 flex mb-10 rounded-xl p-3.5 items-center bg-amber-600">
              <div className="w-10 h-10 mr-5 bg-white rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-xl text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-0.5">{userData.name}</h3>
                <p className="text-xs text-white mb-0.5">{userData.email}</p>
                <p className="text-xs text-white font-bold uppercase">{userData.position}</p>
              </div>
            </div>

            <nav>
              {[
                { id: "Dashboard", icon: faChartBar, label: "Dashboard" },
                { id: "Menu", icon: faUtensils, label: "Menu Management" },
                { id: "Categories", icon: faTags, label: "Categories" },
                { id: "Gallery", icon: faImages, label: "Gallery" },
                { id: "Catering", icon: faBox, label: "Catering Packages" },
                { id: "Orders", icon: faShoppingCart, label: "Orders" },
                { id: "Invoices", icon: faFileInvoice, label: "Invoices" },
              ].map((item) => (
                <Link to={`/admin/${item.id}`} key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors mb-3 ${
                      activeTab === item.id 
                        ? "bg-amber-600 hover:bg-amber-800 text-white" 
                        : "text-white hover:bg-amber-400"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="mr-3" />
                    {item.label}
                  </button>
                </Link>
              ))}

              <button className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-white transition-colors mt-5">
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

export default AdminSideBar;