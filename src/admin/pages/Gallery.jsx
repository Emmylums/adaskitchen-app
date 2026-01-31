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
  faImage,
  faEye,
  faDownload
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";

export default function Gallery() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedItem, setExpandedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("Gallery");
  
  // Firebase data states
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  
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

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    caption: "",
    category: "",
    description: "",
    isFeatured: false,
    displayOrder: 0
  });

  // Upload files state
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingImage, setEditingImage] = useState(null);

  // Fetch data from Firebase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch gallery images
      const galleryQuery = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const gallerySnapshot = await getDocs(galleryQuery);
      const galleryList = gallerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGalleryImages(galleryList);

      // Fetch categories
      const categoriesQuery = query(collection(db, "categories"));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
    
    // Create preview URLs
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  // Remove file from selection
  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviewUrls = [...previewUrls];
    
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  // Upload images to Firebase Storage
  const uploadImagesToStorage = async () => {
    const uploadPromises = files.map(async (file) => {
      try {
        // Generate unique filename
        const timestamp = Date.now();
        const filename = `gallery_${timestamp}_${file.name}`;
        const storageRef = ref(storage, `gallery/${filename}`);
        
        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          url: downloadURL,
          filename: filename,
          originalName: file.name,
          size: file.size,
          type: file.type
        };
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  // Save image data to Firestore
  const saveImageToFirestore = async (imageData) => {
    try {
      const imageDoc = {
        ...uploadForm,
        ...imageData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "gallery"), imageDoc);
    } catch (error) {
      console.error("Error saving image data:", error);
      throw error;
    }
  };

  // Handle upload submission
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      alert("Please select at least one image to upload.");
      return;
    }

    setUploading(true);
    
    try {
      // Upload images to storage
      const uploadedImages = await uploadImagesToStorage();
      
      // Save each image data to Firestore
      for (const imageData of uploadedImages) {
        await saveImageToFirestore(imageData);
      }

      // Clean up
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Reset form
      resetUploadForm();
      setShowUploadModal(false);
      
      // Refresh gallery
      fetchData();
      
      alert(`Successfully uploaded ${uploadedImages.length} image(s)!`);
      
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle edit image
  const handleEditImage = (image) => {
    setEditingImage(image);
    setUploadForm({
      caption: image.caption || "",
      category: image.category || "",
      description: image.description || "",
      isFeatured: image.isFeatured || false,
      displayOrder: image.displayOrder || 0
    });
    setShowUploadModal(true);
  };

  // Handle update image
  const handleUpdateImage = async (e) => {
    e.preventDefault();
    
    setUploading(true);
    
    try {
      const updateData = {
        ...uploadForm,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, "gallery", editingImage.id), updateData);

      resetUploadForm();
      setShowUploadModal(false);
      
      fetchData();
      
      alert("Image updated successfully!");
      
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Failed to update image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete image
  const handleDeleteImage = async (image) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "gallery", image.id));
      
      // Delete from Storage if URL exists
      if (image.url) {
        try {
          const storageRef = ref(storage, image.url);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn("Could not delete from storage:", storageError);
          // Continue even if storage delete fails
        }
      }
      
      fetchData();
      
      alert("Image deleted successfully!");
      
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
    }
  };

  // Toggle featured status
  const toggleFeatured = async (image) => {
    try {
      await updateDoc(doc(db, "gallery", image.id), {
        isFeatured: !image.isFeatured,
        updatedAt: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error("Error updating featured status:", error);
    }
  };

  // Reset upload form
  const resetUploadForm = () => {
    setUploadForm({
      caption: "",
      category: "",
      description: "",
      isFeatured: false,
      displayOrder: 0
    });
    setFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setEditingImage(null);
  };

  // Filter images based on search and category
  const filteredImages = galleryImages.filter(image => {
    const matchesSearch = image.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from images
  const imageCategories = ["all", ...new Set(galleryImages.map(img => img.category).filter(Boolean))];

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-own-2">Gallery Management</h2>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUpload} />
                Upload Images
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search images by caption or description..."
                  className="pl-10 pr-4 py-3 w-full border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <select
                  className="appearance-none w-full pl-4 pr-10 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {imageCategories
                    .filter(cat => cat !== "all")
                    .map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))
                  }
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-own-2 animate-spin" />
                <span className="ml-3 text-gray-600">Loading gallery...</span>
              </div>
            ) : (
              <>
                {/* Gallery Stats */}
                <div className="mb-4">
                  <p className="text-gray-600">
                    Showing {filteredImages.length} of {galleryImages.length} images
                    {selectedCategory !== "all" && ` in "${selectedCategory}"`}
                  </p>
                </div>

                {/* Gallery Grid */}
                {filteredImages.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      {searchTerm ? 'No images found' : 'No images in gallery yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? `No results for "${searchTerm}"` : "Start by uploading your first image"}
                    </p>
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="bg-own-2 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Upload Your First Image
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {filteredImages.map(image => (
                      <div key={image.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        {/* Image Container */}
                        <div 
                          className="h-64 relative overflow-hidden bg-gradient-to-br from-own-2/20 to-amber-400/20 cursor-pointer"
                          onClick={() => {
                            setSelectedImage(image);
                            setShowImageModal(true);
                          }}
                        >
                          {image.url ? (
                            <img 
                              src={image.url} 
                              alt={image.caption || 'Gallery image'}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FontAwesomeIcon icon={faImage} className="text-4xl text-own-2/50" />
                            </div>
                          )}
                          
                          {/* Featured Badge */}
                          {image.isFeatured && (
                            <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              <FontAwesomeIcon icon={faStar} className="mr-1" />
                              Featured
                            </div>
                          )}
                          
                          {/* View Overlay */}
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                            <FontAwesomeIcon icon={faEye} className="text-white text-2xl" />
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-own-2">{image.caption || "Untitled"}</h3>
                              {image.category && (
                                <p className="text-sm text-gray-500">{image.category}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => toggleFeatured(image)}
                                className={`p-2 rounded-lg ${image.isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'} hover:bg-amber-200 transition-colors`}
                                title={image.isFeatured ? "Remove from featured" : "Mark as featured"}
                              >
                                <FontAwesomeIcon icon={faStar} />
                              </button>
                            </div>
                          </div>
                          
                          {image.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{image.description}</p>
                          )}
                          
                          {/* Image Info */}
                          <div className="text-xs text-gray-500 mb-4">
                            {image.size && (
                              <div>
                                Size: {(image.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            )}
                            {image.createdAt && (
                              <div>
                                Uploaded: {image.createdAt.toDate ? 
                                  new Date(image.createdAt.toDate()).toLocaleDateString() : 
                                  'Recently'}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <a 
                              href={image.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-own-2 hover:text-amber-600 flex items-center gap-1"
                              title="Open full size"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                              Full Size
                            </a>
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditImage(image);
                                }}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edit image details"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(image);
                                }}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete image"
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
          </div>

          {/* Upload/Edit Image Modal */}
          {showUploadModal && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-own-2">
                    {editingImage ? 'Edit Image Details' : 'Upload Images'}
                  </h3>
                  <button 
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadForm();
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <form onSubmit={editingImage ? handleUpdateImage : handleUploadSubmit} className="space-y-6">
                  {!editingImage && (
                    <>
                      {/* File Upload Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Images *
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-own-2 transition-colors">
                          <div className="space-y-1 text-center">
                            <FontAwesomeIcon 
                              icon={faUpload} 
                              className="mx-auto h-12 w-12 text-gray-400"
                            />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-own-2 hover:text-amber-600">
                                <span>Select files</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  multiple
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB each
                            </p>
                            {files.length > 0 && (
                              <p className="text-sm text-own-2 mt-2">
                                {files.length} file(s) selected
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* File Previews */}
                      {files.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Files:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {files.map((file, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={previewUrls[index]}
                                  alt={file.name}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                                >
                                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                                </button>
                                <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Image Details Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={uploadForm.caption}
                        onChange={(e) => setUploadForm({...uploadForm, caption: e.target.value})}
                        placeholder="e.g., Restaurant Interior View"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={uploadForm.category}
                          onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                          <option value="Food">Food</option>
                          <option value="Ambiance">Ambiance</option>
                          <option value="Events">Events</option>
                          <option value="Staff">Staff</option>
                          <option value="Facilities">Facilities</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                          value={uploadForm.displayOrder}
                          onChange={(e) => setUploadForm({...uploadForm, displayOrder: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-own-2"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                        placeholder="Optional description for the image..."
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-own-2 focus:ring-own-2"
                          checked={uploadForm.isFeatured}
                          onChange={(e) => setUploadForm({...uploadForm, isFeatured: e.target.checked})}
                        />
                        <span className="ml-2 text-sm text-gray-700">Mark as Featured</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={uploading || (!editingImage && files.length === 0)}
                      className="flex-1 bg-own-2 text-white py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {uploading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                          {editingImage ? 'Updating...' : 'Uploading...'}
                        </>
                      ) : (
                        editingImage ? 'Update Image' : 'Upload Images'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadModal(false);
                        resetUploadForm();
                      }}
                      disabled={uploading}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Image View Modal */}
          {showImageModal && selectedImage && (
            <div className={`fixed inset-0 backdrop-blur-sm bg-black/90 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
              <div className="relative max-w-4xl max-h-[90vh]">
                <button 
                  onClick={() => setShowImageModal(false)}
                  className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.caption}
                  className="max-w-full max-h-[80vh] object-contain"
                />
                
                <div className="bg-white/10 backdrop-blur-sm text-white p-4 mt-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">{selectedImage.caption}</h3>
                  {selectedImage.description && (
                    <p className="mb-2">{selectedImage.description}</p>
                  )}
                  {selectedImage.category && (
                    <p className="text-sm opacity-80">Category: {selectedImage.category}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}