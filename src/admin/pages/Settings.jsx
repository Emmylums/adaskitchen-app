import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faUser, 
  faClock,
  faUtensils,
  faMoneyBillWave,
  faCreditCard,
  faGlobe,
  faMobileAlt,
  faSpinner,
  faUpload,
  faTrash,
  faTimes,
  faStore
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
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
    
    // Restaurant Status (Open/Closed)
    isRestaurantOpen: true,   // default: open
    
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
      
      // Fetch restaurant status from 'settings/restaurantStatus'
      try {
        const statusRef = doc(db, "settings", "restaurantStatus");
        const statusSnapshot = await getDoc(statusRef);
        
        if (statusSnapshot.exists()) {
          const statusData = statusSnapshot.data();
          console.log("Fetched restaurant status:", statusData);
          setSettings(prev => ({
            ...prev,
            isRestaurantOpen: statusData.isOpen !== undefined ? statusData.isOpen : true
          }));
        } else {
          // No document yet, default to open
          console.log("No restaurant status found, defaulting to open");
          setSettings(prev => ({ ...prev, isRestaurantOpen: true }));
        }
      } catch (error) {
        console.error("Error fetching restaurant status:", error);
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

  // Upload image to Firebase Storage (similar to Menu Management)
  const uploadImageToStorage = async (file) => {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `chef_${timestamp}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, `chef-profile/${fileName}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Delete image from Firebase Storage
  const deleteImageFromStorage = async (imageUrl) => {
    try {
      // Extract the path from the URL
      const url = new URL(imageUrl);
      const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
      
      // Create a reference to the file
      const imageRef = ref(storage, path);
      
      // Delete the file
      await deleteObject(imageRef);
      console.log("Image deleted from storage");
    } catch (error) {
      console.error("Error deleting image:", error);
      // Don't throw error if image doesn't exist
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
          chefImageUrl: reader.result, // Temporary base64 preview
          chefImageFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeChefImage = async () => {
    try {
      // If there's an existing image URL (not base64 preview), delete from storage
      if (settings.chefImageUrl && settings.chefImageUrl.startsWith('https://')) {
        // Only delete from storage if it's a Firebase Storage URL
        if (settings.chefImageUrl.includes('firebasestorage.googleapis.com')) {
          await deleteImageFromStorage(settings.chefImageUrl);
        }
      }
      
      setSettings(prev => ({
        ...prev,
        chefImageUrl: "",
        chefImageFile: null
      }));
      
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Error removing image. Please try again.");
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      let imageUrl = settings.chefImageUrl;
      
      // Upload new image if provided
      if (settings.chefImageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToStorage(settings.chefImageFile);
          console.log("Image uploaded successfully:", imageUrl);
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          alert("Failed to upload image. Please try again.");
          setUploadingImage(false);
          setSaving(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      } else {
        // No new image uploaded
        // If chefImageUrl is a base64 string (from preview), we need to check if we have an original URL
        if (settings.chefImageUrl && settings.chefImageUrl.startsWith('data:')) {
          // This is a base64 preview
          // Check if we previously had a Firebase Storage URL by looking at the original data
          // or just keep the existing URL in Firestore
          const chefRef = doc(db, "settings", "chefInfo");
          const chefSnapshot = await getDoc(chefRef);
          
          if (chefSnapshot.exists()) {
            const existingData = chefSnapshot.data();
            if (existingData.imageUrl && existingData.imageUrl.startsWith('https://')) {
              // Keep the original Firebase Storage URL
              imageUrl = existingData.imageUrl;
            } else {
              // No original URL, set to empty
              imageUrl = "";
            }
          }
        }
        // If chefImageUrl is already a Firebase URL or empty, keep it as is
      }
      
      // If user removed image and there's no file
      if (!imageUrl && settings.chefImageUrl && !settings.chefImageFile) {
        imageUrl = "";
      }

      // Prepare all data to save
      const chefData = {
        name: settings.chefName || "",
        bio: settings.chefBio || "",
        imageUrl: imageUrl, // Store the Firebase Storage URL
        updatedAt: serverTimestamp()
      };

      // Restaurant status
      const restaurantStatusData = {
        isOpen: settings.isRestaurantOpen,
        updatedAt: serverTimestamp()
      };

      const paymentData = {
        ...settings.paymentMethods,
        updatedAt: serverTimestamp()
      };

      console.log("Saving chef data:", chefData);
      console.log("Saving restaurant status:", restaurantStatusData);
      console.log("Saving payment data:", paymentData);

      // Use batch write for atomic operations
      const batch = writeBatch(db);

      // Save chef information
      const chefRef = doc(db, "settings", "chefInfo");
      batch.set(chefRef, chefData, { merge: true });

      // Save restaurant status
      const statusRef = doc(db, "settings", "restaurantStatus");
      batch.set(statusRef, restaurantStatusData, { merge: true });

      // Save payment settings
      const paymentRef = doc(db, "settings", "paymentMethods");
      batch.set(paymentRef, paymentData, { merge: true });

      // Commit the batch
      await batch.commit();

      console.log("All settings saved successfully!");
      
      // Clear the temporary file after successful save
      if (settings.chefImageFile) {
        setSettings(prev => ({
          ...prev,
          chefImageFile: null,
          // Update the preview to show the actual Firebase URL, not base64
          chefImageUrl: imageUrl
        }));
      } else {
        // Ensure we show the actual URL, not base64 preview
        setSettings(prev => ({
          ...prev,
          chefImageUrl: imageUrl
        }));
      }
      
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
    { id: "General", icon: faUtensils, label: "General" },
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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/api/placeholder/300/300';
                    e.target.className = 'w-full h-full object-cover';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 flex space-x-2">
              <label className={`cursor-pointer ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''} bg-own-2 text-white p-2 rounded-full hover:bg-amber-600 transition-colors`}>
                {uploadingImage ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUpload} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleChefImageUpload}
                      disabled={uploadingImage || saving}
                    />
                  </>
                )}
              </label>
              {settings.chefImageUrl && !uploadingImage && (
                <button
                  onClick={removeChefImage}
                  disabled={saving}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {uploadingImage ? 'Uploading image...' : 'Upload chef profile picture (Max 5MB)'}
          </p>
          {settings.chefImageFile && !uploadingImage && (
            <p className="text-xs text-green-600 mt-1">
              New image selected. Click "Save All Changes" to upload.
            </p>
          )}
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
              disabled={saving}
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
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {/* Restaurant Status Section */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4 flex items-center">
          <FontAwesomeIcon icon={faStore} className="mr-2" />
          Restaurant Status
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4">
          <div>
            <div className="font-medium text-gray-800">
              {settings.isRestaurantOpen ? '🟢 Open' : '🔴 Closed'}
            </div>
            <div className="text-sm text-gray-500">
              {settings.isRestaurantOpen 
                ? 'Customers can place orders.' 
                : 'Customers cannot place orders.'}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.isRestaurantOpen}
              onChange={(e) => {
                setSettings(prev => ({
                  ...prev,
                  isRestaurantOpen: e.target.checked
                }));
              }}
              disabled={saving}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 transition-colors"></div>
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Toggle to open or close the restaurant for orders.
        </p>
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                        disabled={saving}
                        className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-colors font-medium ${saving ? 'opacity-50 cursor-not-allowed' : ''} ${
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
                      {uploadingImage ? 'Uploading image...' : 'Changes will be saved to Firestore'}
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving || uploadingImage}
                      className="bg-own-2 text-white px-8 py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-md"
                    >
                      {saving || uploadingImage ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          {uploadingImage ? 'Uploading...' : 'Saving...'}
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