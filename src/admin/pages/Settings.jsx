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
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  serverTimestamp
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
    // General Settings
    restaurantName: "AfriKitch Restaurant",
    restaurantEmail: "info@afrikitch.com",
    restaurantPhone: "+234 123 456 7890",
    restaurantAddress: "123 Restaurant Street, Lagos, Nigeria",
    currency: "NGN",
    timezone: "Africa/Lagos",
    language: "en",
    
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
    
    // Notification Settings
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderUpdates: true,
      paymentUpdates: true,
      marketingEmails: false
    },
  });

  const [profile, setProfile] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    position: userData.position,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profileImage: null,
    profileImageUrl: ""
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fetch settings from Firebase
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = collection(db, "settings");
      const snapshot = await getDocs(settingsRef);
      
      if (!snapshot.empty) {
        const settingsData = snapshot.docs[0].data();
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
      
      // Fetch profile data
      const profileRef = collection(db, "users");
      const profileSnapshot = await getDocs(profileRef);
      if (!profileSnapshot.empty) {
        const userProfile = profileSnapshot.docs.find(doc => doc.data().email === userData.email)?.data();
        if (userProfile) {
          setProfile(prev => ({ ...prev, ...userProfile }));
        }
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
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // In a real app, you would save to Firebase
      // await updateDoc(doc(db, "settings", "main"), {
      //   ...settings,
      //   updatedAt: serverTimestamp()
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      setSaving(true);
      // In a real app, you would save to Firebase
      // await updateDoc(doc(db, "users", userId), {
      //   name: profile.name,
      //   phone: profile.phone,
      //   position: profile.position,
      //   updatedAt: serverTimestamp()
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          profileImage: file,
          profileImageUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfile(prev => ({
      ...prev,
      profileImage: null,
      profileImageUrl: ""
    }));
  };

  const tabs = [
    { id: "General", icon: faStore, label: "General" },
    { id: "Profile", icon: faUser, label: "Profile" },
    { id: "Payments", icon: faCreditCard, label: "Payments" },
    { id: "Notifications", icon: faBell, label: "Notifications" },
    { id: "Advanced", icon: faDatabase, label: "Advanced" }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4">Restaurant Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label>
            <input
              type="text"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
              value={settings.restaurantName}
              onChange={(e) => handleSettingChange("restaurantName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
              value={settings.restaurantEmail}
              onChange={(e) => handleSettingChange("restaurantEmail", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
              value={settings.restaurantPhone}
              onChange={(e) => handleSettingChange("restaurantPhone", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              rows={2}
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
              value={settings.restaurantAddress}
              onChange={(e) => handleSettingChange("restaurantAddress", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4">Business Hours</h3>
        <div className="space-y-4 text-black">
          {Object.entries(settings.businessHours).map(([day, hours]) => (
            <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-own-2 rounded"
                  checked={!hours.closed}
                  onChange={(e) => handleSettingChange(`businessHours.${day}`, "closed", !e.target.checked)}
                />
                <span className="ml-3 capitalize font-medium">{day}</span>
              </div>
              {!hours.closed ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded bg-own-2 text-white"
                    value={hours.open}
                    onChange={(e) => handleSettingChange(`businessHours.${day}`, "open", e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded bg-own-2 text-white"
                    value={hours.close}
                    onChange={(e) => handleSettingChange(`businessHours.${day}`, "close", e.target.value)}
                  />
                </div>
              ) : (
                <span className="text-red-600 font-medium">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4">Profile Information</h3>
        
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-own-2">
              {profile.profileImageUrl ? (
                <img 
                  src={profile.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 flex space-x-2">
              <label className="cursor-pointer bg-own-2 text-white p-2 rounded-full hover:bg-amber-600">
                <FontAwesomeIcon icon={faUpload} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
              {profile.profileImageUrl && (
                <button
                  onClick={removeProfileImage}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Click the upload icon to change your profile picture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
              value={profile.name}
              onChange={(e) => handleProfileChange("name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <input
              type="text"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
              value={profile.position}
              onChange={(e) => handleProfileChange("position", e.target.value)} disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
              value={profile.email}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
              value={profile.phone}
              onChange={(e) => handleProfileChange("phone", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                value={profile.currentPassword}
                onChange={(e) => handleProfileChange("currentPassword", e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
              >
                <FontAwesomeIcon icon={showPassword.current ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                value={profile.newPassword}
                onChange={(e) => handleProfileChange("newPassword", e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
              >
                <FontAwesomeIcon icon={showPassword.new ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                value={profile.confirmPassword}
                onChange={(e) => handleProfileChange("confirmPassword", e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                <FontAwesomeIcon icon={showPassword.confirm ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className="w-full bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {saving ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            Saving...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Save Profile Changes
          </>
        )}
      </button>
    </div>
  );


  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4">Payment Methods</h3>
        <div className="space-y-4 text-black">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCreditCard} className="text-own-2 mr-3" />
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
                onChange={(e) => handleSettingChange("paymentMethods", "cash", e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-own-2"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 mr-3" />
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
                onChange={(e) => handleSettingChange("paymentMethods", "card", e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faGlobe} className="text-green-500 mr-3" />
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
                onChange={(e) => handleSettingChange("paymentMethods", "transfer", e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMobileAlt} className="text-purple-500 mr-3" />
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
                onChange={(e) => handleSettingChange("paymentMethods", "wallet", e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4">Notification Preferences</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Notification Channels</h4>
            <div className="space-y-3 text-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 mr-3" />
                  <span>Email Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange("notifications", "emailNotifications", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-own-2"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faMobileAlt} className="text-gray-500 mr-3" />
                  <span>SMS Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleSettingChange("notifications", "smsNotifications", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-own-2"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBell} className="text-gray-500 mr-3" />
                  <span>Push Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleSettingChange("notifications", "pushNotifications", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-own-2"></div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Notification Types</h4>
            <div className="space-y-3 text-black">
              <div className="flex items-center justify-between">
                <span>Order Updates</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.orderUpdates}
                    onChange={(e) => handleSettingChange("notifications", "orderUpdates", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-own-2"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span>Payment Updates</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.paymentUpdates}
                    onChange={(e) => handleSettingChange("notifications", "paymentUpdates", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-own-2"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span>Marketing Emails</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.marketingEmails}
                    onChange={(e) => handleSettingChange("notifications", "marketingEmails", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-own-2"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-own-2 mb-4">Advanced Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 px-4 py-3 border text-black border-gray-300 rounded-l-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                value="sk_live_********************************"
                readOnly
              />
              <button className="bg-own-2 text-white px-6 py-3 rounded-r-xl hover:bg-amber-600 transition-colors">
                Regenerate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <input
              type="text"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
              placeholder="https://your-domain.com/webhook"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="debugMode"
              className="h-4 w-4 text-own-2 rounded"
            />
            <label htmlFor="debugMode" className="ml-3 text-gray-700">
              Enable Debug Mode
            </label>
          </div>

          <div className="pt-4 border-t">
            <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
              Clear All Data
            </button>
            <p className="text-sm text-gray-500 mt-2">
              This will remove all orders, customers, and menu items. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return renderGeneralSettings();
      case "Profile":
        return renderProfileSettings();
      case "Payments":
        return renderPaymentSettings();
      case "Notifications":
        return renderNotificationSettings();
      case "Advanced":
        return renderAdvancedSettings();
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-own-2">Settings</h2>
                <p className="text-gray-600">Manage your restaurant and account settings</p>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                <span className="ml-3 text-gray-600">Loading settings...</span>
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
                        className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-colors ${
                          activeTab === tab.id
                            ? 'bg-own-2 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
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

                {/* Save Button (for settings tabs except Profile) */}
                {activeTab !== "Profile" && (
                  <div className="sticky bottom-0 bg-white border-t p-4">
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="bg-own-2 text-white px-8 py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSave} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
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