import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faDollarSign, 
  faEdit, 
  faPlus, 
  faSearch, 
  faShoppingCart, 
  faStar, 
  faTimes, 
  faTrash, 
  faUpload, 
  faUser, 
  faUtensils,
  faSpinner,
  faUsers,
  faCheckCircle,
  faCalendarAlt,
  faUserFriends,
  faTruck,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";

export default function Catering() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Catering");
  
  // Firebase data states
  const [cateringPackages, setCateringPackages] = useState([]);
  const [cateringRequests, setCateringRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Package form state
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    price: "",
    minGuests: "",
    maxGuests: "",
    includes: [""],
    active: true,
    image: null,
    imagePreview: "",
    features: [""],
    preparationTime: "",
    deliveryFee: "",
    depositPercentage: 50
  });

  // Modal states
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeSection, setActiveSection] = useState("packages"); // "packages" or "requests"

  // Fetch data from Firebase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch catering packages
      const packagesQuery = query(collection(db, "cateringPackages"), orderBy("createdAt", "desc"));
      const packagesSnapshot = await getDocs(packagesQuery);
      const packagesList = packagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCateringPackages(packagesList);

      // Fetch catering requests
      const requestsQuery = query(collection(db, "cateringRequests"), orderBy("createdAt", "desc"));
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsList = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCateringRequests(requestsList);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file) => {
    try {
      const storageRef = ref(storage, `catering/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Handle package submission
  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (packageForm.image) {
        imageUrl = await uploadImage(packageForm.image);
      }

      const packageData = {
        name: packageForm.name.trim(),
        description: packageForm.description.trim(),
        price: parseFloat(packageForm.price),
        minGuests: parseInt(packageForm.minGuests),
        maxGuests: parseInt(packageForm.maxGuests),
        includes: packageForm.includes.filter(item => item.trim() !== ''),
        features: packageForm.features.filter(feature => feature.trim() !== ''),
        active: packageForm.active !== false,
        preparationTime: packageForm.preparationTime ? parseInt(packageForm.preparationTime) : null,
        deliveryFee: packageForm.deliveryFee ? parseFloat(packageForm.deliveryFee) : 0,
        depositPercentage: parseInt(packageForm.depositPercentage) || 50,
        imageUrl: imageUrl || '/api/placeholder/300/200',
        createdAt: editingPackage ? packageForm.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingPackage) {
        // Update existing package
        await updateDoc(doc(db, "cateringPackages", editingPackage.id), packageData);
      } else {
        // Add new package
        await addDoc(collection(db, "cateringPackages"), packageData);
      }

      // Reset form and close modal
      resetPackageForm();
      setShowPackageModal(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error("Error saving catering package:", error);
      alert("Failed to save catering package. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit package
  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price.toString(),
      minGuests: pkg.minGuests.toString(),
      maxGuests: pkg.maxGuests.toString(),
      includes: pkg.includes || [""],
      features: pkg.features || [""],
      active: pkg.active !== false,
      preparationTime: pkg.preparationTime ? pkg.preparationTime.toString() : "",
      deliveryFee: pkg.deliveryFee ? pkg.deliveryFee.toString() : "",
      depositPercentage: pkg.depositPercentage?.toString() || "50",
      image: null,
      imagePreview: pkg.imageUrl || "",
      createdAt: pkg.createdAt
    });
    setShowPackageModal(true);
  };

  // Handle delete package
  const handleDeletePackage = async (id) => {
    if (window.confirm("Are you sure you want to delete this catering package?")) {
      try {
        await deleteDoc(doc(db, "cateringPackages", id));
        fetchData();
      } catch (error) {
        console.error("Error deleting catering package:", error);
        alert("Failed to delete catering package. Please try again.");
      }
    }
  };

  // Toggle package active status
  const togglePackageActive = async (pkg) => {
    try {
      await updateDoc(doc(db, "cateringPackages", pkg.id), {
        active: !pkg.active,
        updatedAt: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error("Error updating package status:", error);
    }
  };

  // Handle request status update
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      await updateDoc(doc(db, "cateringRequests", requestId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update request status. Please try again.");
    }
  };

  // Reset package form
  const resetPackageForm = () => {
    setPackageForm({
      name: "",
      description: "",
      price: "",
      minGuests: "",
      maxGuests: "",
      includes: [""],
      features: [""],
      active: true,
      image: null,
      imagePreview: "",
      preparationTime: "",
      deliveryFee: "",
      depositPercentage: "50"
    });
    setEditingPackage(null);
  };

  // Add include field
  const addInclude = () => {
    setPackageForm({
      ...packageForm,
      includes: [...packageForm.includes, ""]
    });
  };

  // Remove include field
  const removeInclude = (index) => {
    const newIncludes = packageForm.includes.filter((_, i) => i !== index);
    setPackageForm({
      ...packageForm,
      includes: newIncludes
    });
  };

  // Update include
  const updateInclude = (index, value) => {
    const newIncludes = [...packageForm.includes];
    newIncludes[index] = value;
    setPackageForm({
      ...packageForm,
      includes: newIncludes
    });
  };

  // Add feature field
  const addFeature = () => {
    setPackageForm({
      ...packageForm,
      features: [...packageForm.features, ""]
    });
  };

  // Remove feature field
  const removeFeature = (index) => {
    const newFeatures = packageForm.features.filter((_, i) => i !== index);
    setPackageForm({
      ...packageForm,
      features: newFeatures
    });
  };

  // Update feature
  const updateFeature = (index, value) => {
    const newFeatures = [...packageForm.features];
    newFeatures[index] = value;
    setPackageForm({
      ...packageForm,
      features: newFeatures
    });
  };

  // Filter packages based on search
  const filteredPackages = cateringPackages.filter(pkg => {
    return pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter requests by status
  const pendingRequests = cateringRequests.filter(req => req.status === 'pending');
  const confirmedRequests = cateringRequests.filter(req => req.status === 'confirmed');
  const completedRequests = cateringRequests.filter(req => req.status === 'completed');
  const cancelledRequests = cateringRequests.filter(req => req.status === 'cancelled');

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
          <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-3 font-medium ${activeSection === 'packages' ? 'text-own-2 border-b-2 border-own-2' : 'text-gray-500 hover:text-own-2'}`}
                onClick={() => setActiveSection('packages')}
              >
                Catering Packages
              </button>
              <button
                className={`px-4 py-3 font-medium ${activeSection === 'requests' ? 'text-own-2 border-b-2 border-own-2' : 'text-gray-500 hover:text-own-2'}`}
                onClick={() => setActiveSection('requests')}
              >
                Catering Requests
                {pendingRequests.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Packages Section */}
            {activeSection === 'packages' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-own-2">Catering Packages</h2>
                  <button 
                    onClick={() => setShowPackageModal(true)}
                    className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Package
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search packages..."
                      className="pl-10 pr-4 py-3 w-full border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Loading State */}
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading catering packages...</span>
                  </div>
                ) : (
                  <>
                    {/* Packages Count */}
                    <div className="mb-4">
                      <p className="text-gray-600">
                        Showing {filteredPackages.length} of {cateringPackages.length} packages
                      </p>
                    </div>

                    {/* Packages Grid */}
                    {filteredPackages.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <FontAwesomeIcon icon={faUtensils} className="text-4xl text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                          {searchTerm ? 'No packages found' : 'No catering packages yet'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm ? `No results for "${searchTerm}"` : "Start by adding your first catering package"}
                        </p>
                        <button 
                          onClick={() => setShowPackageModal(true)}
                          className="bg-own-2 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                        >
                          Add Your First Package
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {filteredPackages.map(pkg => (
                          <div key={pkg.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            {/* Image Section */}
                            <div className="h-48 relative overflow-hidden bg-gradient-to-br from-own-2/20 to-amber-400/20">
                              {pkg.imageUrl ? (
                                <img 
                                  src={pkg.imageUrl} 
                                  alt={pkg.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FontAwesomeIcon icon={faUsers} className="text-4xl text-own-2/50" />
                                </div>
                              )}
                              
                              {/* Status Badge */}
                              <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${pkg.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {pkg.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              
                              {/* Price Badge */}
                              <div className="absolute bottom-3 left-3 bg-own-2/90 text-white px-3 py-2 rounded-lg">
                                <span className="font-bold text-lg">₦{pkg.price?.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="font-bold text-lg text-own-2">{pkg.name}</h3>
                                  <p className="text-sm text-gray-500">
                                    {pkg.minGuests}-{pkg.maxGuests} guests
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => togglePackageActive(pkg)}
                                    className={`p-2 rounded-lg ${pkg.active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} hover:opacity-80 transition-colors`}
                                    title={pkg.active ? "Deactivate package" : "Activate package"}
                                  >
                                    {pkg.active ? "Deactivate" : "Activate"}
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                              
                              {/* Includes Preview */}
                              {pkg.includes && pkg.includes.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Includes:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {pkg.includes.slice(0, 3).map((item, index) => (
                                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {item}
                                      </span>
                                    ))}
                                    {pkg.includes.length > 3 && (
                                      <span className="text-xs text-gray-500">+{pkg.includes.length - 3} more</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Package Info */}
                              <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                                {pkg.preparationTime && (
                                  <div className="flex items-center">
                                    <FontAwesomeIcon icon={faClock} className="mr-2 text-own-2" />
                                    {pkg.preparationTime} mins
                                  </div>
                                )}
                                {pkg.deliveryFee > 0 && (
                                  <div className="flex items-center">
                                    <FontAwesomeIcon icon={faTruck} className="mr-2 text-own-2" />
                                    ₦{pkg.deliveryFee.toLocaleString()} delivery
                                  </div>
                                )}
                                {pkg.depositPercentage && (
                                  <div className="col-span-2 text-xs">
                                    Deposit: {pkg.depositPercentage}% required
                                  </div>
                                )}
                              </div>
                              
                              {/* Actions */}
                              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <span className="text-sm text-gray-500">
                                  {pkg.features?.length || 0} features
                                </span>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleEditPackage(pkg)}
                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Edit package"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePackage(pkg.id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Delete package"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Requests Section */}
            {activeSection === 'requests' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-own-2">Catering Requests</h2>
                </div>

                {/* Requests Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{pendingRequests.length}</div>
                    <div className="text-sm text-blue-800">Pending</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{confirmedRequests.length}</div>
                    <div className="text-sm text-green-800">Confirmed</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{completedRequests.length}</div>
                    <div className="text-sm text-purple-800">Completed</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-red-600">{cancelledRequests.length}</div>
                    <div className="text-sm text-red-800">Cancelled</div>
                  </div>
                </div>

                {/* Requests Table */}
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading catering requests...</span>
                  </div>
                ) : cateringRequests.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No catering requests yet</h3>
                    <p className="text-gray-500">Catering requests from customers will appear here.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cateringRequests.map(request => (
                            <tr key={request.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-own-2">#{request.id.slice(0, 8)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{request.customerName}</div>
                                <div className="text-sm text-gray-500">{request.customerEmail || request.customerPhone}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{request.packageName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {request.eventDate ? new Date(request.eventDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{request.numberOfGuests}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">₦{request.totalAmount?.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRequestsModal(true);
                                  }}
                                  className="text-own-2 hover:text-amber-600 mr-3"
                                >
                                  View Details
                                </button>
                                {request.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateRequestStatus(request.id, 'confirmed')}
                                      className="text-green-600 hover:text-green-800 mr-3"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => updateRequestStatus(request.id, 'cancelled')}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {request.status === 'confirmed' && (
                                  <button
                                    onClick={() => updateRequestStatus(request.id, 'completed')}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    Mark Complete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Add/Edit Package Modal */}
          {showPackageModal && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-own-2">
                    {editingPackage ? 'Edit Catering Package' : 'Add New Catering Package'}
                  </h3>
                  <button 
                    onClick={() => {
                      setShowPackageModal(false);
                      resetPackageForm();
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <form onSubmit={handlePackageSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-own-2 transition-colors">
                      <div className="space-y-1 text-center">
                        {packageForm.imagePreview ? (
                          <div className="relative">
                            <img
                              src={packageForm.imagePreview}
                              alt="Preview"
                              className="mx-auto h-48 w-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setPackageForm({...packageForm, image: null, imagePreview: ""})}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <FontAwesomeIcon 
                              icon={faUsers} 
                              className="mx-auto h-12 w-12 text-gray-400"
                            />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-own-2 hover:text-amber-600">
                                <span>Upload an image</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      setPackageForm({
                                        ...packageForm,
                                        image: file,
                                        imagePreview: URL.createObjectURL(file)
                                      });
                                    }
                                  }}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={packageForm.name}
                        onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
                        placeholder="e.g., Standard Wedding Package"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({...packageForm, price: e.target.value})}
                        placeholder="50000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={packageForm.description}
                      onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                      placeholder="Describe this catering package..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Guests *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={packageForm.minGuests}
                        onChange={(e) => setPackageForm({...packageForm, minGuests: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Guests *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={packageForm.maxGuests}
                        onChange={(e) => setPackageForm({...packageForm, maxGuests: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Time (minutes)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={packageForm.preparationTime}
                        onChange={(e) => setPackageForm({...packageForm, preparationTime: e.target.value})}
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee (₦)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={packageForm.deliveryFee}
                        onChange={(e) => setPackageForm({...packageForm, deliveryFee: e.target.value})}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                      value={packageForm.depositPercentage}
                      onChange={(e) => setPackageForm({...packageForm, depositPercentage: e.target.value})}
                      placeholder="50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of total amount required as deposit
                    </p>
                  </div>

                  {/* Includes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What's Included</label>
                    <div className="space-y-2">
                      {packageForm.includes.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateInclude(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            placeholder="e.g., Jollof Rice, Chicken"
                          />
                          {packageForm.includes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeInclude(index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addInclude}
                        className="text-own-2 hover:text-amber-600 text-sm font-medium flex items-center"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-1 h-4 w-4" />
                        Add Included Item
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                    <div className="space-y-2">
                      {packageForm.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-own-2"
                            placeholder="e.g., Professional servers, Decoration"
                          />
                          {packageForm.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFeature}
                        className="text-own-2 hover:text-amber-600 text-sm font-medium flex items-center"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-1 h-4 w-4" />
                        Add Feature
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-own-2 focus:ring-own-2"
                        checked={packageForm.active}
                        onChange={(e) => setPackageForm({...packageForm, active: e.target.checked})}
                      />
                      <span className="ml-2 text-sm text-gray-700">Active Package</span>
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {saving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                          {editingPackage ? 'Updating...' : 'Saving...'}
                        </>
                      ) : (
                        editingPackage ? 'Update Package' : 'Add Package'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPackageModal(false);
                        resetPackageForm();
                      }}
                      disabled={saving}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Request Details Modal */}
          {showRequestsModal && selectedRequest && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-own-2">Catering Request Details</h3>
                  <button 
                    onClick={() => {
                      setShowRequestsModal(false);
                      setSelectedRequest(null);
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Request Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Request ID</h4>
                      <p className="text-own-2 font-medium">#{selectedRequest.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedRequest.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedRequest.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedRequest.status?.charAt(0).toUpperCase() + selectedRequest.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Customer Information</h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{selectedRequest.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedRequest.customerEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{selectedRequest.customerPhone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Company/Organization</p>
                          <p className="font-medium">{selectedRequest.company || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Event Details</h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Event Type</p>
                          <p className="font-medium">{selectedRequest.eventType || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Event Date</p>
                          <p className="font-medium">
                            {selectedRequest.eventDate ? new Date(selectedRequest.eventDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Event Time</p>
                          <p className="font-medium">{selectedRequest.eventTime || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Number of Guests</p>
                          <p className="font-medium">{selectedRequest.numberOfGuests}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Venue Address</p>
                          <p className="font-medium">{selectedRequest.venueAddress || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Special Instructions</p>
                          <p className="font-medium">{selectedRequest.specialInstructions || 'None'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package & Payment */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Package & Payment</h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Selected Package</p>
                          <p className="font-medium text-own-2">{selectedRequest.packageName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="font-medium text-lg">₦{selectedRequest.totalAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Deposit Required</p>
                          <p className="font-medium">₦{selectedRequest.depositAmount?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Status</p>
                          <p className="font-medium">{selectedRequest.paymentStatus || 'Pending'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    {selectedRequest.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            updateRequestStatus(selectedRequest.id, 'confirmed');
                            setShowRequestsModal(false);
                          }}
                          className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors"
                        >
                          Confirm Request
                        </button>
                        <button
                          onClick={() => {
                            updateRequestStatus(selectedRequest.id, 'cancelled');
                            setShowRequestsModal(false);
                          }}
                          className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors"
                        >
                          Cancel Request
                        </button>
                      </>
                    )}
                    {selectedRequest.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          updateRequestStatus(selectedRequest.id, 'completed');
                          setShowRequestsModal(false);
                        }}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Mark as Completed
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequestsModal(false);
                        setSelectedRequest(null);
                      }}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}