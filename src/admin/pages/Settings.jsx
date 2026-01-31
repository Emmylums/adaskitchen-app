import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faUser, 
  faBell, 
  faLock, 
  faPalette, 
  faShieldAlt, 
  faDatabase, 
  faGlobe,
  faCreditCard,
  faStore,
  faTruck,
  faPrint,
  faEnvelope,
  faMobileAlt,
  faCheckCircle,
  faTimes,
  faSpinner,
  faEye,
  faEyeSlash,
  faUpload,
  faTrash,
  faClock,
  faUtensils,
  faMapMarkerAlt,
  faLanguage,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  setDoc,
  serverTimestamp,
  getDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
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

  // Settings states
  const [settings, setSettings] = useState({
    // Chef Information
    chefName: "",
    chefBio: "",
    chefImageUrl: "",
    chefImageFile: null,
    
    // Business Hours
    businessHours: {
      monday: { open: "09:00", close: "22:00", closed: false },
      tuesday: { open: "09:00", close: "22:00", closed: false },
      wednesday: { open: "09:00", close: "22:00", closed: false },
      thursday: { open: "09:00", close: "22:00", closed: false },
      friday: { open: "09:00", close: "23:00", closed: false },
      saturday: { open: "10:00", close: "23:00", closed: false },
      sunday: { open: "11:00", close: "21:00", closed: false }
    },
    
    // Payment Settings
    paymentMethods: {
      cash: true,
      card: true,
      transfer: true,
      wallet: true
    },
  });

  // Fetch settings from Firebase
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch chef information from 'settings' collection
      try {
        const settingsRef = doc(db, "settings", "chefInfo");
        const settingsSnapshot = await getDoc(settingsRef);
        
        if (settingsSnapshot.exists()) {
          const data = settingsSnapshot.data();
          console.log("Fetched chef data:", data);
          setSettings(prev => ({ 
            ...prev, 
            chefName: data.name || "",
            chefBio: data.bio || "",
            chefImageUrl: data.imageUrl || ""
          }));
        } else {
          console.log("No chef info found, using defaults");
        }
      } catch (error) {
        console.error("Error fetching chef information:", error);
      }
      
      // Fetch business hours from 'settings' collection
      try {
        const hoursRef = doc(db, "settings", "businessHours");
        const hoursSnapshot = await getDoc(hoursRef);
        
        if (hoursSnapshot.exists()) {
          const hoursData = hoursSnapshot.data();
          console.log("Fetched business hours:", hoursData);
          
          // Merge with existing hours, ensuring all days exist
          const mergedHours = { ...settings.businessHours };
          Object.keys(mergedHours).forEach(day => {
            if (hoursData[day]) {
              mergedHours[day] = {
                ...mergedHours[day],
                ...hoursData[day]
              };
            }
          });
          
          setSettings(prev => ({ 
            ...prev, 
            businessHours: mergedHours
          }));
        }
      } catch (error) {
        console.error("Error fetching business hours:", error);
      } 
      
      // Fetch payment settings from 'settings' collection
      try {
        const paymentRef = doc(db, "settings", "paymentMethods");
        const paymentSnapshot = await getDoc(paymentRef);
        
        if (paymentSnapshot.exists()) {
          const paymentData = paymentSnapshot.data();
          console.log("Fetched payment methods:", paymentData);
          setSettings(prev => ({ 
            ...prev, 
            paymentMethods: {
              cash: paymentData.cash !== undefined ? paymentData.cash : true,
              card: paymentData.card !== undefined ? paymentData.card : true,
              transfer: paymentData.transfer !== undefined ? paymentData.transfer : true,
              wallet: paymentData.wallet !== undefined ? paymentData.wallet : true
            }
          }));
        }
      } catch (error) {
        console.error("Error fetching payment settings:", error);
      }
      
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section, field, value) => {
    if (section.includes('.')) {
      const [mainSection, subSection, subField] = section.split('.');
      setSettings(prev => ({
        ...prev,
        [mainSection]: {
          ...prev[mainSection],
          [subSection]: {
            ...prev[mainSection][subSection],
            [subField || subSection]: value
          }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [section]: field // Note: field is the value when called directly
      }));
    }
  };

  const handleChefImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          chefImageUrl: reader.result,
          chefImageFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeChefImage = () => {
    setSettings(prev => ({
      ...prev,
      chefImageUrl: "",
      chefImageFile: null
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Prepare all data to save
      const chefData = {
        name: settings.chefName || "",
        bio: settings.chefBio || "",
        imageUrl: settings.chefImageUrl || "",
        updatedAt: serverTimestamp()
      };

      const businessHoursData = {
        ...settings.businessHours,
        updatedAt: serverTimestamp()
      };

      const paymentData = {
        ...settings.paymentMethods,
        updatedAt: serverTimestamp()
      };

      console.log("Saving chef data:", chefData);
      console.log("Saving business hours:", businessHoursData);
      console.log("Saving payment data:", paymentData);

      // Use batch write for atomic operations
      const batch = writeBatch(db);

      // Save chef information
      const chefRef = doc(db, "settings", "chefInfo");
      batch.set(chefRef, chefData, { merge: true });

      // Save business hours
      const hoursRef = doc(db, "settings", "businessHours");
      batch.set(hoursRef, businessHoursData, { merge: true });

      // Save payment settings
      const paymentRef = doc(db, "settings", "paymentMethods");
      batch.set(paymentRef, paymentData, { merge: true });

      // Commit the batch
      await batch.commit();

      console.log("All settings saved successfully!");
      alert("Settings saved successfully!");
      
    } catch (error) {
      console.error("Error saving settings:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      alert(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "General", icon: faStore, label: "General" },
    { id: "Payments", icon: faCreditCard, label: "Payments" },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Chef Information Section */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4 flex items-center">
          <FontAwesomeIcon icon={faUtensils} className="mr-2" />
          Chef Information
        </h3>
        
        {/* Chef Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-own-2">
              {settings.chefImageUrl ? (
                <img 
                  src={settings.chefImageUrl} 
                  alt="Chef" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 flex space-x-2">
              <label className="cursor-pointer bg-own-2 text-white p-2 rounded-full hover:bg-amber-600 transition-colors">
                <FontAwesomeIcon icon={faUpload} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleChefImageUpload}
                />
              </label>
              {settings.chefImageUrl && (
                <button
                  onClick={removeChefImage}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Upload chef profile picture (Max 5MB)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chef Name *</label>
            <input
              type="text"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 transition-colors"
              value={settings.chefName}
              onChange={(e) => setSettings(prev => ({ ...prev, chefName: e.target.value }))}
              placeholder="Enter chef's full name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Chef Bio *</label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 transition-colors"
              value={settings.chefBio}
              onChange={(e) => setSettings(prev => ({ ...prev, chefBio: e.target.value }))}
              placeholder="Tell us about the chef's experience, specialties, and story..."
            />
          </div>
        </div>
      </div>

      {/* Responsive Business Hours Section */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4 flex items-center">
          <FontAwesomeIcon icon={faClock} className="mr-2" />
          Business Hours
        </h3>
        <div className="space-y-3 text-black">
          {Object.entries(settings.businessHours).map(([day, hours]) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-own-2 rounded focus:ring-own-2 cursor-pointer"
                  checked={!hours.closed}
                  onChange={(e) => {
                    const updatedHours = { ...settings.businessHours };
                    updatedHours[day].closed = !e.target.checked;
                    setSettings(prev => ({ ...prev, businessHours: updatedHours }));
                  }}
                />
                <span className="capitalize font-medium text-gray-800 min-w-[100px]">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
              </div>
              
              {!hours.closed ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Open:</span>
                    <input
                      type="time"
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-own-2 focus:border-own-2 w-full sm:w-32 transition-colors"
                      value={hours.open}
                      onChange={(e) => {
                        const updatedHours = { ...settings.businessHours };
                        updatedHours[day].open = e.target.value;
                        setSettings(prev => ({ ...prev, businessHours: updatedHours }));
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Close:</span>
                    <input
                      type="time"
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-own-2 focus:border-own-2 w-full sm:w-32 transition-colors"
                      value={hours.close}
                      onChange={(e) => {
                        const updatedHours = { ...settings.businessHours };
                        updatedHours[day].close = e.target.value;
                        setSettings(prev => ({ ...prev, businessHours: updatedHours }));
                      }}
                    />
                  </div>
                </div>
              ) : (
                <span className="text-red-600 font-medium bg-red-50 px-4 py-2 rounded-lg w-full sm:w-auto text-center">
                  Closed
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Quick Actions for Business Hours */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const updatedHours = { ...settings.businessHours };
                Object.keys(updatedHours).forEach(day => {
                  updatedHours[day] = { ...updatedHours[day], closed: false };
                });
                setSettings(prev => ({ ...prev, businessHours: updatedHours }));
              }}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              Open All Days
            </button>
            <button
              onClick={() => {
                const updatedHours = { ...settings.businessHours };
                Object.keys(updatedHours).forEach(day => {
                  updatedHours[day] = { ...updatedHours[day], closed: true };
                });
                setSettings(prev => ({ ...prev, businessHours: updatedHours }));
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Close All Days
            </button>
            <button
              onClick={() => {
                const standardHours = {
                  monday: { open: "09:00", close: "22:00", closed: false },
                  tuesday: { open: "09:00", close: "22:00", closed: false },
                  wednesday: { open: "09:00", close: "22:00", closed: false },
                  thursday: { open: "09:00", close: "22:00", closed: false },
                  friday: { open: "09:00", close: "23:00", closed: false },
                  saturday: { open: "10:00", close: "23:00", closed: false },
                  sunday: { open: "11:00", close: "21:00", closed: false }
                };
                setSettings(prev => ({ ...prev, businessHours: standardHours }));
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Set Standard Hours
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4">Payment Methods</h3>
        <div className="space-y-4 text-black">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-own-2 rounded-lg flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-white" />
              </div>
              <div>
                <div className="font-medium">Cash on Delivery</div>
                <div className="text-sm text-gray-500">Accept cash payments on delivery</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.paymentMethods.cash}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: {
                      ...prev.paymentMethods,
                      cash: e.target.checked
                    }
                  }));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-own-2 transition-colors"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faCreditCard} className="text-white" />
              </div>
              <div>
                <div className="font-medium">Credit/Debit Card</div>
                <div className="text-sm text-gray-500">Accept card payments online</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.paymentMethods.card}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: {
                      ...prev.paymentMethods,
                      card: e.target.checked
                    }
                  }));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 transition-colors"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faGlobe} className="text-white" />
              </div>
              <div>
                <div className="font-medium">Bank Transfer</div>
                <div className="text-sm text-gray-500">Accept bank transfers</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.paymentMethods.transfer}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: {
                      ...prev.paymentMethods,
                      transfer: e.target.checked
                    }
                  }));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 transition-colors"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faMobileAlt} className="text-white" />
              </div>
              <div>
                <div className="font-medium">Wallet Payment</div>
                <div className="text-sm text-gray-500">Accept payments from customer wallet</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.paymentMethods.wallet}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: {
                      ...prev.paymentMethods,
                      wallet: e.target.checked
                    }
                  }));
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500 transition-colors"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return renderGeneralSettings();
      case "Payments":
        return renderPaymentSettings();
      default:
        return renderGeneralSettings();
    }
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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-own-2">Settings</h2>
                <p className="text-gray-600">Manage your restaurant and account settings</p>
              </div>
              {!loading && (
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                <span className="ml-3 text-gray-600 mt-4">Loading settings...</span>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-colors font-medium ${
                          activeTab === tab.id
                            ? 'bg-own-2 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                        }`}
                      >
                        <FontAwesomeIcon icon={tab.icon} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="mb-8">
                  {renderContent()}
                </div>

                {/* Save Button */}
                <div className="sticky bottom-0 bg-white border-t p-4 mt-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Changes will be saved to Firestore
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="bg-own-2 text-white px-8 py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-md"
                    >
                      {saving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} />
                          Save All Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}