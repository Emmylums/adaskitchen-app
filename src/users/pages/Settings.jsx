import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, 
  faLock, 
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider 
} from "firebase/auth";
import { createNotification, NotificationTemplates } from "../services/notificationService";

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Settings");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { user, logout } = useAuth();
  const { userData, loading: userLoading } = useUserData();
  
  // Profile form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    displayName: ""
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Populate form with user data when loaded
  useEffect(() => {
    if (userData) {
      // Split displayName or use firstName/lastName if available
      const firstName = userData.firstName || userData.displayName?.split(' ')[0] || "";
      const lastName = userData.lastName || userData.displayName?.split(' ').slice(1).join(' ') || "";
      
      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: userData.email || user?.email || "",
        phone: userData.phone || "",
        displayName: userData.displayName || user?.displayName || ""
      });
    }
  }, [userData, user]);

  // Handle profile form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  // Handle profile form submission
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess("");
    setSaveError("");

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const userDocRef = doc(db, "users", user.uid);
      
      // Prepare update data
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        updatedAt: new Date().toISOString()
      };

      // Update Firestore
      await updateDoc(userDocRef, updateData);

      setSaveSuccess("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess("");
      }, 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError("Failed to update profile. Please try again.");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setSaveError("");
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordSuccess("");
    setPasswordError("");

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Validate passwords
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      if (passwordForm.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email || userData?.email || "",
        passwordForm.currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      // Success
      setPasswordSuccess("Password changed successfully!");
      
      // Clear form and close modal after delay
      setTimeout(() => {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 2000);

    } catch (error) {
      console.error("Error changing password:", error);
      
      // User-friendly error messages
      let errorMessage = "Failed to change password. ";
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage += "Current password is incorrect.";
          break;
        case 'auth/weak-password':
          errorMessage += "New password is too weak. Use at least 6 characters.";
          break;
        case 'auth/requires-recent-login':
          errorMessage += "Please log out and log back in to change your password.";
          break;
        default:
          errorMessage += error.message || "Please try again.";
      }
      
      setPasswordError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setPasswordError("");
      }, 5000);
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle cancel/reset profile form
  const handleCancel = () => {
    if (userData) {
      const firstName = userData.firstName || userData.displayName?.split(' ')[0] || "";
      const lastName = userData.lastName || userData.displayName?.split(' ').slice(1).join(' ') || "";
      
      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: userData.email || user?.email || "",
        phone: userData.phone || "",
        displayName: userData.displayName || user?.displayName || ""
      });
    }
    setSaveSuccess("");
    setSaveError("");
  };

  // Open password change modal
  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordSuccess("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  // Close password change modal
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setTimeout(() => {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordSuccess("");
      setPasswordError("");
    }, 300);
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "gray" };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengths = [
      { label: "Very Weak", color: "red" },
      { label: "Weak", color: "orange" },
      { label: "Fair", color: "yellow" },
      { label: "Good", color: "lightgreen" },
      { label: "Strong", color: "green" },
      { label: "Very Strong", color: "darkgreen" }
    ];
    
    return strengths[Math.min(strength, 5)];
  };

  const newPasswordStrength = getPasswordStrength(passwordForm.newPassword);

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserNavBar 
        toggleSidebar={toggleSidebars} 
        isSideBarOpen={isSidebarOpen}
        user={userData}
      />
      <UserSideBar 
        isOpen={isSidebarOpen} 
        closeSidebar={closeSidebar} 
        userData={userData} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
      />
      
      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closePasswordModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-own-2">Change Password</h2>
                  <button
                    onClick={closePasswordModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faEye} size="lg" />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Enter your current password and set a new one
                </p>
              </div>

              {/* Password Form */}
              <form onSubmit={handlePasswordSubmit} className="p-6">
                {/* Success/Error Messages */}
                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                    {passwordSuccess}
                  </div>
                )}
                
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}

                {/* Current Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 pr-12"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 pr-12"
                      placeholder="Enter new password (min. 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordForm.newPassword && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Password strength:</span>
                        <span className={`font-medium text-${newPasswordStrength.color}-600`}>
                          {newPasswordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`bg-${newPasswordStrength.color}-500 h-1.5 rounded-full`}
                          style={{ width: `${(newPasswordStrength.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Must be at least 6 characters long. Include uppercase, lowercase, numbers, and symbols for stronger security.
                  </p>
                </div>

                {/* Confirm New Password */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 pr-12"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {passwordForm.newPassword && passwordForm.confirmPassword && (
                    <p className={`text-xs mt-2 ${
                      passwordForm.newPassword === passwordForm.confirmPassword 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {passwordForm.newPassword === passwordForm.confirmPassword 
                        ? '✓ Passwords match' 
                        : '✗ Passwords do not match'
                      }
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={changingPassword}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 px-4 py-3 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="md:flex md:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-black">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-own-2">Account Settings</h3>
                    <p className="text-sm text-gray-500">
                      Manage your account information and preferences
                    </p>
                  </div>
                  
                  {/* Success/Error Messages */}
                  {saveSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                      {saveSuccess}
                    </div>
                  )}
                  
                  {saveError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                      {saveError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSaveChanges}>
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input 
                            type="text" 
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 transition-colors"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input 
                            type="text" 
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 transition-colors"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faEnvelope} className="text-own-2" />
                          Email Address
                        </div>
                      </label>
                      <input 
                        type="email" 
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                        title="Email cannot be changed"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        For security reasons, your email address cannot be changed.
                      </p>
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 transition-colors"
                        placeholder="e.g., +447123456789"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Used for delivery updates and order notifications
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-200 mb-8">
                      <h4 className="font-semibold text-gray-800 mb-4">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faLock} className="text-own-2" />
                          Security
                        </div>
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-700">Password</p>
                          <p className="text-sm text-gray-500">
                            Last changed: {user?.metadata?.lastSignInTime 
                              ? new Date(user.metadata.lastSignInTime).toLocaleDateString() 
                              : "Never"}
                          </p>
                        </div>
                        <button 
                          type="button"
                          className="px-4 py-2 border-2 border-own-2 text-own-2 rounded-xl hover:bg-amber-50 transition-colors"
                          onClick={openPasswordModal}
                        >
                          Change Password
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <button 
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                      <button 
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}