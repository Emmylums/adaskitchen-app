import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus,
  faEdit,
  faTrash,
  faHome,
  faBuilding,
  faMapMarkerAlt,
  faTimes,
  faSave
} from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createNotification, NotificationTemplates } from "../services/notificationService";

export default function Addresses() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Addresses");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "home",
    line1: "",
    line2: "",
    city: "",
    county: "",
    postcode: "",
    country: "United Kingdom",
    phone: "",
    isDefault: false,
    instructions: ""
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const { user } = useAuth();
  const { userData, loading: userLoading } = useUserData();

  // UK counties list
  const ukCounties = [
    "Greater London", "West Midlands", "Greater Manchester", "West Yorkshire", 
    "Kent", "Merseyside", "Essex", "South Yorkshire", "Hampshire", "Lancashire",
    "Surrey", "Hertfordshire", "Derbyshire", "Staffordshire", "Nottinghamshire",
    "Devon", "Cheshire", "Berkshire", "Somerset", "Dorset", "Leicestershire",
    "Norfolk", "Suffolk", "Cambridgeshire", "Oxfordshire", "Gloucestershire",
    "Warwickshire", "Buckinghamshire", "Wiltshire", "Shropshire", "Worcestershire",
    "Lincolnshire", "Herefordshire", "North Yorkshire", "East Sussex", "West Sussex",
    "Cornwall", "Cumbria", "Northumberland", "Durham", "Tyne and Wear"
  ];

  // Address type options
  const addressTypes = [
    { value: "home", label: "Home", icon: faHome },
    { value: "work", label: "Work", icon: faBuilding },
    { value: "other", label: "Other", icon: faMapMarkerAlt }
  ];

  // Fetch user addresses from Firestore (from user document)
  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userAddresses = data.addresses || [];
        
        // Sort addresses: default first, then by name
        const sortedAddresses = userAddresses.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setAddresses(sortedAddresses);
      } else {
        // If user document doesn't exist yet, create it with empty addresses array
        await setDoc(userDocRef, { addresses: [] }, { merge: true });
        setAddresses([]);
      }
      
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to get address icon
  const getAddressIcon = (addressType) => {
    switch (addressType?.toLowerCase()) {
      case "home":
        return <FontAwesomeIcon icon={faHome} className="text-own-2" />;
      case "work":
      case "office":
        return <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />;
      default:
        return <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500" />;
    }
  };

  // Function to handle address deletion
  const handleDeleteAddress = async (addressId, addressName) => {
    if (!window.confirm(`Are you sure you want to delete "${addressName}"?`)) {
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      
      // Get current user document
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) return;
      
      const data = userDoc.data();
      const currentAddresses = data.addresses || [];
      
      // Remove the address with matching id
      const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);
      
      // Update Firestore
      await updateDoc(userDocRef, {
        addresses: updatedAddresses
      });
      
      // Update local state
      setAddresses(updatedAddresses);
      
      // Create notification
      await createNotification(user.uid, NotificationTemplates.ADDRESS_DELETED(addressName));
      
      // Show success message
      setFormSuccess(`"${addressName}" has been deleted successfully.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setFormSuccess(""), 3000);
      
    } catch (error) {
      console.error("Error deleting address:", error);
      setFormError("Failed to delete address. Please try again.");
      setTimeout(() => setFormError(""), 3000);
    }
  };

  // Function to handle setting default address
  const handleSetDefault = async (addressId) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      
      // Get current user document
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) return;
      
      const data = userDoc.data();
      const currentAddresses = data.addresses || [];
      
      // Find the address being set as default
      const newDefaultAddress = currentAddresses.find(addr => addr.id === addressId);
      
      // Update all addresses: set the selected one as default, others as non-default
      const updatedAddresses = currentAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      
      // Update Firestore
      await updateDoc(userDocRef, {
        addresses: updatedAddresses
      });
      
      // Update local state
      setAddresses(updatedAddresses);
      
      // Create notification
      if (newDefaultAddress) {
        await createNotification(user.uid, 
          NotificationTemplates.DEFAULT_ADDRESS_CHANGED(newDefaultAddress.name)
        );
      }
      
      setFormSuccess("Default address updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setFormSuccess(""), 3000);
      
    } catch (error) {
      console.error("Error setting default address:", error);
      setFormError("Failed to update default address. Please try again.");
      setTimeout(() => setFormError(""), 3000);
    }
  };

  // Function to handle edit address
  const handleEditAddress = (address) => {
    // Populate form with existing address data
    setFormData({
      name: address.name || "",
      type: address.type || "home",
      line1: address.line1 || address.address?.split(",")[0] || "",
      line2: address.line2 || "",
      city: address.city || "",
      county: address.county || "",
      postcode: address.postcode || "",
      country: address.country || "United Kingdom",
      phone: address.phone || "",
      isDefault: address.isDefault || false,
      instructions: address.instructions || ""
    });
    
    setIsEditing(true);
    setEditingAddressId(address.id);
    setShowModal(true);
    setFormError("");
    setFormSuccess("");
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validate UK postcode
  const validateUKPostcode = (postcode) => {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode.trim());
  };

  // Validate UK phone number
  const validateUKPhone = (phone) => {
    const phoneRegex = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/;
    return phoneRegex.test(phone.trim());
  };

  // Generate a unique ID for new addresses
  const generateAddressId = () => {
    return `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle form submission (for both add and edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    
    // Validate required fields
    if (!formData.name.trim()) {
      setFormError("Please enter a name for this address");
      return;
    }
    
    if (!formData.line1.trim()) {
      setFormError("Please enter the first line of your address");
      return;
    }
    
    if (!formData.city.trim()) {
      setFormError("Please enter your city");
      return;
    }
    
    if (!formData.county) {
      setFormError("Please select a county");
      return;
    }
    
    if (!formData.postcode.trim()) {
      setFormError("Please enter your postcode");
      return;
    }
    
    // Validate postcode format
    if (!validateUKPostcode(formData.postcode)) {
      setFormError("Please enter a valid UK postcode (e.g., SW1A 1AA)");
      return;
    }
    
    if (!formData.phone.trim()) {
      setFormError("Please enter your phone number");
      return;
    }
    
    // Validate phone format
    if (!validateUKPhone(formData.phone)) {
      setFormError("Please enter a valid UK phone number");
      return;
    }
    
    try {
      setFormLoading(true);
      
      // Format the full address
      const fullAddress = [
        formData.line1,
        formData.line2,
        formData.city,
        formData.county,
        formData.postcode.toUpperCase(),
        formData.country
      ].filter(line => line.trim()).join(", ");
      
      const addressData = {
        id: isEditing ? editingAddressId : generateAddressId(),
        name: formData.name,
        type: formData.type,
        line1: formData.line1,
        line2: formData.line2 || "",
        city: formData.city,
        county: formData.county,
        postcode: formData.postcode.toUpperCase(),
        country: formData.country,
        phone: formData.phone,
        isDefault: formData.isDefault,
        instructions: formData.instructions || "",
        fullAddress: fullAddress,
        address: fullAddress, // Keep for backward compatibility
        createdAt: isEditing 
          ? addresses.find(addr => addr.id === editingAddressId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const userDocRef = doc(db, "users", user.uid);
      
      // Get current user document
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const currentAddresses = data.addresses || [];
        
        let updatedAddresses;
        
        if (isEditing) {
          // Update existing address
          updatedAddresses = currentAddresses.map(addr => 
            addr.id === editingAddressId ? addressData : addr
          );
        } else {
          // Add new address
          // If setting as default, remove default from all other addresses
          if (formData.isDefault) {
            updatedAddresses = currentAddresses.map(addr => ({
              ...addr,
              isDefault: false
            }));
          } else {
            updatedAddresses = [...currentAddresses];
          }
          
          // Add new address
          updatedAddresses.push(addressData);
        }
        
        // If setting as default during edit, remove default from others
        if (formData.isDefault && isEditing) {
          updatedAddresses = updatedAddresses.map(addr => ({
            ...addr,
            isDefault: addr.id === editingAddressId
          }));
        }
        
        // Update Firestore
        await updateDoc(userDocRef, {
          addresses: updatedAddresses
        });
        
        // Update local state
        setAddresses(updatedAddresses.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return a.name.localeCompare(b.name);
        }));
        
        // Create appropriate notification
        if (isEditing) {
          await createNotification(user.uid, 
            NotificationTemplates.ADDRESS_UPDATED(formData.name)
          );
          setFormSuccess("Address updated successfully!");
        } else {
          await createNotification(user.uid, 
            NotificationTemplates.ADDRESS_ADDED(formData.name)
          );
          setFormSuccess("Address added successfully!");
        }
        
      } else {
        // If user document doesn't exist, create it with the new address
        await setDoc(userDocRef, {
          addresses: [addressData]
        });
        
        // Update local state
        setAddresses([addressData]);
        
        // Create notification
        await createNotification(user.uid, 
          NotificationTemplates.ADDRESS_ADDED(formData.name)
        );
        setFormSuccess("Address added successfully!");
      }
      
      // Reset form and close modal after delay
      setTimeout(() => {
        closeModal();
      }, 1500);
      
    } catch (error) {
      console.error("Error saving address:", error);
      setFormError(isEditing ? "Failed to update address. Please try again." : "Failed to add address. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "home",
      line1: "",
      line2: "",
      city: "",
      county: "",
      postcode: "",
      country: "United Kingdom",
      phone: "",
      isDefault: false,
      instructions: ""
    });
    setFormError("");
    setFormSuccess("");
    setIsEditing(false);
    setEditingAddressId(null);
  };

  // Open modal for adding new address
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setTimeout(resetForm, 300); // Reset after animation
  };

  // Format address for display
  const formatAddressDisplay = (address) => {
    if (address.fullAddress) {
      return address.fullAddress;
    }
    
    const parts = [
      address.line1 || address.address,
      address.line2,
      address.city,
      address.county,
      address.postcode
    ].filter(part => part && part.trim());
    
    return parts.join(", ");
  };

  // Get modal title based on mode
  const getModalTitle = () => {
    return isEditing ? "Edit Address" : "Add New Address";
  };

  // Get modal description based on mode
  const getModalDescription = () => {
    return isEditing 
      ? "Update your delivery address" 
      : "Add a delivery address for your orders";
  };

  // Loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your addresses...</p>
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
      
      {/* Address Modal (for both add and edit) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 backdrop-blur-sm bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"}`}
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-own-2">{getModalTitle()}</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  {getModalDescription()}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="p-6">
                {/* Error/Success Messages */}
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {formError}
                  </div>
                )}
                
                {formSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                    {formSuccess}
                  </div>
                )}

                {/* Address Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Home, Work, Mum's House"
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    required
                  />
                </div>

                {/* Address Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {addressTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                          formData.type === type.value
                            ? 'border-own-2 bg-amber-50 text-own-2'
                            : 'border-gray-200 hover:border-own-1 text-gray-600'
                        }`}
                      >
                        <FontAwesomeIcon icon={type.icon} className="mb-1" />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address Line 1 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="line1"
                    value={formData.line1}
                    onChange={handleFormChange}
                    placeholder="House number and street name"
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    required
                  />
                </div>

                {/* Address Line 2 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    name="line2"
                    value={formData.line2}
                    onChange={handleFormChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                  />
                </div>

                {/* City */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Town/City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    placeholder="e.g., London, Manchester, Birmingham"
                    className="w-full px-4 py-3 text-black  border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    required
                  />
                </div>

                {/* County */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    County *
                  </label>
                  <select
                    name="county"
                    value={formData.county}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 appearance-none bg-white"
                    required
                  >
                    <option value="">Select a county</option>
                    {ukCounties.map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Postcode */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleFormChange}
                    placeholder="e.g., SW1A 1AA"
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 uppercase"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a valid UK postcode (e.g., SW1A 1AA, M1 1AA, EH1 1AA)
                  </p>
                </div>

                {/* Country (Fixed as UK) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value="United Kingdom"
                    disabled
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl bg-gray-50"
                  />
                </div>

                {/* Phone Number */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="e.g., 07123 456789"
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For delivery updates. UK format (e.g., 07123 456789 or 020 7946 0958)
                  </p>
                </div>

                {/* Delivery Instructions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleFormChange}
                    placeholder="e.g., Leave with neighbour, Ring bell twice, Call on arrival"
                    rows="3"
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2 resize-none"
                  />
                </div>

                {/* Set as Default */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-own-2 focus:ring-own-2 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Set as default delivery address
                    </span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-3 bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isEditing ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} />
                        {isEditing ? "Update Address" : "Save Address"}
                      </>
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
                    <h3 className="text-xl font-bold text-own-2">Saved Addresses</h3>
                    {addresses.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {addresses.length} address{addresses.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                  
                  {addresses.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {addresses.map(address => (
                          <div 
                            key={address.id} 
                            className={`p-4 border-2 rounded-xl transition-colors ${address.isDefault ? 'border-own-2 bg-amber-50' : 'border-gray-100 hover:border-own-2'}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                {getAddressIcon(address.type || address.name)}
                                <h4 className="font-semibold text-own-2">{address.name}</h4>
                              </div>
                              {address.isDefault ? (
                                <span className="bg-own-2 text-white text-xs px-2 py-1 rounded-full">Default</span>
                              ) : (
                                <button 
                                  onClick={() => handleSetDefault(address.id)}
                                  className="text-xs text-gray-600 hover:text-own-2"
                                >
                                  Set as default
                                </button>
                              )}
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 whitespace-pre-line">
                                {formatAddressDisplay(address)}
                              </p>
                              {address.phone && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <span className="font-medium">Phone:</span> {address.phone}
                                </p>
                              )}
                              {address.instructions && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-700">Delivery Instructions:</p>
                                  <p className="text-xs text-gray-600 mt-1">{address.instructions}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-3">
                              <button 
                                onClick={() => handleEditAddress(address)}
                                className="text-sm text-own-2 hover:text-amber-600 flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(address.id, address.name)}
                                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={openAddModal}
                        className="w-full py-3 border-2 border-dashed border-own-2 text-own-2 rounded-xl hover:bg-amber-50 transition-colors flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add New Address
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📍</div>
                      <h4 className="text-lg font-semibold text-gray-600 mb-2">
                        No saved addresses yet
                      </h4>
                      <p className="text-gray-500 mb-4">
                        Add your UK delivery addresses to make ordering faster and easier.
                      </p>
                      <button 
                        onClick={openAddModal}
                        className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center mx-auto"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add Your First Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}