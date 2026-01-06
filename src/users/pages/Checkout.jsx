import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { useCart } from "../../context/CartContext"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCreditCard, 
  faUser, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope,
  faLock,
  faCheckCircle,
  faArrowLeft,
  faShoppingBag,
  faTruck,
  faWallet,
  faHome,
  faClock,
  faReceipt
} from "@fortawesome/free-solid-svg-icons";
import AlertBanner from "../../components/AlertBanner";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";
// Firebase imports
import { getDocs, collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function Checkout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Cart"); 
  
  const { userData, loading: userLoading } = useUserData();
  const { cart, getTotalQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuDishes, setMenuDishes] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Get default address from userData
  useEffect(() => {
    if (userData?.addresses && userData.addresses.length > 0) {
      const defaultAddr = userData.addresses.find(addr => addr.isDefault) || userData.addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [userData]);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    deliveryInstructions: "",
    paymentMethod: "wallet",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    saveInfo: false
  });

  // Update form when userData changes
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        firstName: userData.firstName || prev.firstName,
        lastName: userData.lastName || prev.lastName,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone
      }));
    }
  }, [userData]);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const menusCollection = collection(db, "menus");
        const querySnapshot = await getDocs(menusCollection);
        const dishesArray = [];
        
        querySnapshot.forEach((doc) => {
          const dishData = doc.data();
          dishesArray.push({
            id: doc.id,
            name: dishData.name || `Dish ${doc.id}`,
            price: dishData.price || 0,
            image: dishData.image || dishData.imageUrl || "/images/fallback-food.jpg",
            available: dishData.available !== undefined ? dishData.available : true
          });
        });
        
        setMenuDishes(dishesArray);
      } catch (err) {
        console.error("Error fetching menu items: ", err);
      }
    };
    
    fetchMenuItems();
  }, []);

  // Redirect if cart is empty and no order confirmed
  useEffect(() => {
    if (cart.length === 0 && !orderConfirmed) {
      navigate('/user/cart');
    }
  }, [cart, navigate, orderConfirmed]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const dishDetails = menuDishes.find(dish => dish.id === item.id);
      if (dishDetails && !dishDetails.available) return total;
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateDelivery = () => {
    return calculateSubtotal() > 200 ? 0 : 8.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDelivery();
  };

  const isWalletSufficient = () => {
    if (!userData?.walletBalance) return false;
    return userData.walletBalance >= calculateTotal() * 100;
  };

  // Separate cart items
  const availableCartItems = [];
  const unavailableCartItems = [];
  
  cart.forEach(item => {
    const dishDetails = menuDishes.find(dish => dish.id === item.id);
    if (dishDetails && !dishDetails.available) {
      unavailableCartItems.push({ ...item, available: false });
    } else {
      availableCartItems.push({ ...item, available: true });
    }
  });

  const getDishDetails = (itemId) => {
    return menuDishes.find(dish => dish.id === itemId);
  };

  // Generate order number
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp.slice(-6)}-${random}`;
  };

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validations
    if (formData.paymentMethod === "wallet" && !isWalletSufficient()) {
      setAlert({
        message: 'Insufficient wallet balance. Please add funds or use another payment method.',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    if (!selectedAddress) {
      setAlert({
        message: 'Please select a delivery address.',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    if (availableCartItems.length === 0) {
      setAlert({
        message: 'No available items in your cart.',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    try {
      // Process payment
      let paymentStatus = "pending";
      
      if (formData.paymentMethod === "wallet") {
        paymentStatus = "paid";
        // Update wallet balance
        if (userData?.uid) {
          const userDocRef = doc(db, "users", userData.uid);
          const newBalance = (userData?.walletBalance || 0) - (calculateTotal() * 100);
          await updateDoc(userDocRef, {
            walletBalance: newBalance
          });
        }
      } else if (formData.paymentMethod === "card") {
        paymentStatus = "paid";
        if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvc) {
          throw new Error("Please enter all card details");
        }
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Prepare order data
      const orderData = {
        customerId: userData?.uid || "",
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerPhone: formData.phone || userData?.phone || "",
        customerEmail: formData.email || userData?.email || "",
        deliveryAddress: `${selectedAddress.line1 || selectedAddress.street || selectedAddress.address || ""}${
          selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""
        }${selectedAddress.city ? `, ${selectedAddress.city}` : ""}${
          selectedAddress.county ? `, ${selectedAddress.county}` : ""
        }${selectedAddress.postcode ? `, ${selectedAddress.postcode}` : ""}${
          selectedAddress.country ? `, ${selectedAddress.country}` : ""
        }`.trim(),
        deliveryInstructions: formData.deliveryInstructions || "",
        orderType: "delivery",
        paymentMethod: formData.paymentMethod,
        paymentStatus: paymentStatus,
        orderStatus: "pending",
        items: availableCartItems.map(item => {
          const dishDetails = getDishDetails(item.id);
          return {
            id: item.id,
            name: item.name || dishDetails?.name || `Item ${item.id}`,
            price: Math.round(item.price * 100),
            quantity: item.quantity,
            image: item.image || dishDetails?.image || "/images/fallback-food.jpg",
            total: Math.round(item.price * item.quantity * 100)
          };
        }),
        subtotal: Math.round(calculateSubtotal() * 100),
        deliveryFee: Math.round(calculateDelivery() * 100),
        tax: 0,
        discount: 0,
        total: Math.round(calculateTotal() * 100),
        notes: "",
        orderNumber: generateOrderNumber(),
        createdAt: serverTimestamp()
      };

      // Save to Firestore
      const ordersCollection = collection(db, "orders");
      const docRef = await addDoc(ordersCollection, orderData);
      
      // Update with orderId
      await updateDoc(docRef, {
        orderId: docRef.id
      });

      // Set complete order details
      const completeOrderData = {
        ...orderData,
        orderId: docRef.id,
        createdAt: new Date().toISOString()
      };

      // Clear cart and show confirmation
      clearCart();
      setOrderDetails(completeOrderData);
      setOrderConfirmed(true);
      
      setAlert({
        message: `Order placed successfully! Order #${completeOrderData.orderNumber}`,
        type: 'success'
      });

    } catch (error) {
      console.error("Error processing order:", error);
      setAlert({
        message: error.message || 'Failed to process order. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  // Get total quantity of available items
  const getAvailableQuantity = () => {
    return availableCartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Order Confirmation View
  if (orderConfirmed && orderDetails) {
    return (
      <>
        {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
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
        
        <div className="md:flex md:justify-end">
          <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
                  <p className="text-gray-600">Thank you for your order</p>
                  <div className="mt-4 inline-block bg-own-2 text-white px-4 py-2 rounded-full">
                    Order #{orderDetails.orderNumber}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faClock} className="text-own-2" />
                      <h3 className="text-lg font-bold text-black">Estimated Delivery</h3>
                    </div>
                    <p className="text-2xl font-bold text-own-2">30-45 minutes</p>
                    <p className="text-gray-600 mt-2">Your food is being prepared</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-own-2" />
                      <h3 className="text-lg font-bold text-black">Delivery Address</h3>
                    </div>
                    <p className="text-gray-800">
                      {orderDetails.deliveryAddress}
                    </p>
                    {orderDetails.deliveryInstructions && (
                      <p className="text-gray-600 mt-2 text-sm">
                        <span className="font-medium text-black">Instructions:</span> {orderDetails.deliveryInstructions}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faShoppingBag} className="text-own-2" />
                      <h3 className="text-lg font-bold text-black">Order Summary</h3>
                    </div>
                    <div className="space-y-2 text-black">
                      <div className="flex justify-between">
                        <span>Items ({orderDetails.items.length})</span>
                        <span>£{(orderDetails.subtotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>£{(orderDetails.deliveryFee / 100).toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>£{(orderDetails.total / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl text-black">
                    <div className="flex items-center gap-3 mb-4">
                      <FontAwesomeIcon icon={faCreditCard} className="text-own-2" />
                      <h3 className="text-lg font-bold">Payment</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Method</span>
                        <span className="capitalize">{orderDetails.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          orderDetails.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {orderDetails.paymentStatus}
                        </span>
                      </div>
                      {formData.paymentMethod === "wallet" && userData?.walletBalance !== undefined && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>New Wallet Balance:</span>
                            <span className="font-bold">
                              {formatCurrency((userData.walletBalance || 0) - (calculateTotal() * 100))}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8 text-black">
                  <h3 className="text-xl font-bold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-own-2 rounded-lg flex items-center justify-center text-white font-bold">
                            {item.quantity}
                          </div>
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-gray-600 text-sm">£{(item.price / 100).toFixed(2)} each</p>
                          </div>
                        </div>
                        <div className="font-bold">
                          £{((item.price * item.quantity) / 100).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/user/orders')}
                    className="flex-1 py-4 border border-own-2 text-own-2 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    View Order Status
                  </button>
                  <button
                    onClick={() => navigate('/user/menu')}
                    className="flex-1 py-4 bg-own-2 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faHome} />
                    Back to Menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Checkout Form View (original checkout form)
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faShoppingBag} className="text-own-2 text-6xl mb-6 opacity-80"/>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h3>
          <Link to="/user/menu">
            <button className="px-8 py-4 bg-own-2 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors">
              Browse Menu
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
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
      
      <div className="md:flex md:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <h3 className="text-own-2 mb-6 uppercase font-bold text-2xl font-display2 tracking-wider">Checkout</h3>
                
                <div className="max-w-7xl mx-auto pt-5 pb-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                      <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Delivery Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-own-2 text-white p-2 rounded-full">
                              <FontAwesomeIcon icon={faUser} />
                            </div>
                            <h2 className="text-xl font-bold text-own-2">Delivery Information</h2>
                            {userData && (
                              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                ✓ Logged in as {userData.firstName}
                              </span>
                            )}
                          </div>
                          
                          <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  First Name
                                </label>
                                <input
                                  type="text"
                                  value={formData.firstName}
                                  disabled
                                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">From your profile</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Last Name
                                </label>
                                <input
                                  type="text"
                                  value={formData.lastName}
                                  disabled
                                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">From your profile</p>
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Email Address
                                </label>
                                <div className="relative">
                                  <FontAwesomeIcon 
                                    icon={faEnvelope} 
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                  />
                                  <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-12 py-3 text-black border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Phone Number
                                </label>
                                <div className="relative">
                                  <FontAwesomeIcon 
                                    icon={faPhone} 
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                  />
                                  <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-12 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-transparent"
                                    placeholder="Update your phone number"
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Used for delivery updates</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Delivery Address</h3>
                            
                            {userData?.addresses && userData.addresses.length > 0 ? (
                              <div className="space-y-3">
                                {userData.addresses.map((address, index) => (
                                  <div 
                                    key={address.id || index}
                                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                                      selectedAddress?.id === address.id
                                        ? 'border-own-2 bg-own-2/5'
                                        : 'border-gray-200 hover:border-own-2'
                                    }`}
                                    onClick={() => setSelectedAddress(address)}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <FontAwesomeIcon 
                                            icon={faMapMarkerAlt} 
                                            className={`${
                                              selectedAddress?.id === address.id 
                                                ? 'text-own-2' 
                                                : 'text-gray-400'
                                            }`}
                                          />
                                          <span className="font-medium text-gray-800">{address.name || address.label || "Address"}</span>
                                          {address.isDefault && (
                                            <span className="px-2 py-0.5 bg-own-2 text-white text-xs rounded-full">Default</span>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                          {address.line1 || address.street || address.address}
                                          {address.line2 && <>, {address.line2}</>}
                                          {address.city && <>, {address.city}</>}
                                          {address.county && <>, {address.county}</>}
                                          {address.postcode && <>, {address.postcode}</>}
                                          {address.country && <>, {address.country}</>}
                                        </p>
                                        {address.phone && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            <FontAwesomeIcon icon={faPhone} className="mr-1" />
                                            {address.phone}
                                          </p>
                                        )}
                                        {address.instructions && (
                                          <p className="text-sm text-gray-500 mt-1">
                                            Instructions: {address.instructions}
                                          </p>
                                        )}
                                      </div>
                                      {selectedAddress?.id === address.id && (
                                        <div className="bg-own-2 text-white p-2 rounded-full">
                                          <FontAwesomeIcon icon={faCheckCircle} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-4xl text-gray-300 mb-3" />
                                <h4 className="text-lg font-semibold text-gray-600 mb-2">
                                  No saved addresses
                                </h4>
                                <p className="text-gray-500 mb-4">
                                  Please add an address to continue with checkout
                                </p>
                                <Link
                                  to="/user/addresses"
                                  className="inline-block bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors"
                                >
                                  Add Address
                                </Link>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Delivery Instructions (Optional)
                            </label>
                            <textarea
                              name="deliveryInstructions"
                              value={formData.deliveryInstructions}
                              onChange={handleInputChange}
                              rows="3"
                              className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-transparent"
                              placeholder="Leave at door, ring bell, call on arrival, etc."
                            />
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-own-2 text-white p-2 rounded-full">
                              <FontAwesomeIcon icon={faCreditCard} />
                            </div>
                            <h2 className="text-xl font-bold text-own-2">Payment Method</h2>
                          </div>
                          
                          <div className="space-y-4">
                            <div className={`p-4 border rounded-xl cursor-pointer transition-all ${
                              formData.paymentMethod === "wallet" 
                                ? 'border-own-2 bg-own-2/5' 
                                : 'border-gray-300 hover:border-own-2'
                            }`}>
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  id="wallet"
                                  name="paymentMethod"
                                  value="wallet"
                                  checked={formData.paymentMethod === "wallet"}
                                  onChange={handleInputChange}
                                  className="mt-1 text-own-2 focus:ring-own-2"
                                />
                                <label htmlFor="wallet" className="flex-1 cursor-pointer">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <FontAwesomeIcon icon={faWallet} className="text-own-2" />
                                        <span className="text-black font-medium">Wallet Balance</span>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        Use your wallet balance: {formatCurrency(userData?.walletBalance || 0)}
                                      </p>
                                    </div>
                                    {formData.paymentMethod === "wallet" && (
                                      <div className={`px-2 py-1 text-xs rounded ${
                                        isWalletSufficient() 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {isWalletSufficient() ? '✓ Sufficient' : 'Insufficient'}
                                      </div>
                                    )}
                                  </div>
                                  {formData.paymentMethod === "wallet" && !isWalletSufficient() && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                      <p className="text-sm text-red-700">
                                        You need {formatCurrency((calculateTotal() * 100) - (userData?.walletBalance || 0))} more
                                      </p>
                                      <Link 
                                        to="/user/payments" 
                                        className="text-sm text-own-2 hover:text-amber-600 font-medium mt-1 inline-block"
                                      >
                                        Add funds to wallet →
                                      </Link>
                                    </div>
                                  )}
                                </label>
                              </div>
                            </div>
                            
                            <div className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                              formData.paymentMethod === "card" 
                                ? 'border-own-2 bg-own-2/5' 
                                : 'border-gray-300 hover:border-own-2'
                            }`}>
                              <input
                                type="radio"
                                id="card"
                                name="paymentMethod"
                                value="card"
                                checked={formData.paymentMethod === "card"}
                                onChange={handleInputChange}
                                className="text-own-2 focus:ring-own-2"
                              />
                              <label htmlFor="card" className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-black font-medium">Credit/Debit Card</span>
                                    <p className="text-sm text-gray-600">Pay securely with your card</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-gray-300 text-xs rounded">Visa</span>
                                    <span className="px-2 py-1 bg-gray-300 text-xs rounded">MasterCard</span>
                                    <span className="px-2 py-1 bg-gray-300 text-xs rounded">Amex</span>
                                  </div>
                                </div>
                              </label>
                            </div>
                            
                            <div className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                              formData.paymentMethod === "paypal" 
                                ? 'border-own-2 bg-own-2/5' 
                                : 'border-gray-300 hover:border-own-2'
                            }`}>
                              <input
                                type="radio"
                                id="paypal"
                                name="paymentMethod"
                                value="paypal"
                                checked={formData.paymentMethod === "paypal"}
                                onChange={handleInputChange}
                                className="text-own-2 focus:ring-own-2"
                              />
                              <label htmlFor="paypal" className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-black font-medium">PayPal</span>
                                    <p className="text-sm text-gray-600">Fast and secure online payments</p>
                                  </div>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Popular</span>
                                </div>
                              </label>
                            </div>
                            
                            <div className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                              formData.paymentMethod === "cash" 
                                ? 'border-own-2 bg-own-2/5' 
                                : 'border-gray-300 hover:border-own-2'
                            }`}>
                              <input
                                type="radio"
                                id="cash"
                                name="paymentMethod"
                                value="cash"
                                checked={formData.paymentMethod === "cash"}
                                onChange={handleInputChange}
                                className="text-own-2 focus:ring-own-2"
                              />
                              <label htmlFor="cash" className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-black font-medium">Cash on Delivery</span>
                                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                                  </div>
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">No fees</span>
                                </div>
                              </label>
                            </div>
                          </div>

                          {formData.paymentMethod === "card" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                              className="mt-6 pt-6 border-t border-gray-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Card Number *
                                  </label>
                                  <div className="relative">
                                    <FontAwesomeIcon 
                                      icon={faCreditCard} 
                                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                      type="text"
                                      name="cardNumber"
                                      value={formData.cardNumber}
                                      onChange={handleInputChange}
                                      required
                                      maxLength="19"
                                      className="w-full px-12 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-transparent"
                                      placeholder="1234 5678 9012 3456"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiry Date *
                                  </label>
                                  <input
                                    type="text"
                                    name="cardExpiry"
                                    value={formData.cardExpiry}
                                    onChange={handleInputChange}
                                    required
                                    maxLength="5"
                                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-transparent"
                                    placeholder="MM/YY"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CVC *
                                  </label>
                                  <div className="relative">
                                    <FontAwesomeIcon 
                                      icon={faLock} 
                                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                      type="text"
                                      name="cardCvc"
                                      value={formData.cardCvc}
                                      onChange={handleInputChange}
                                      required
                                      maxLength="4"
                                      className="w-full px-12 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-own-2 focus:border-transparent"
                                      placeholder="123"
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <input
                              type="checkbox"
                              id="terms"
                              required
                              className="mt-1 text-own-2 focus:ring-own-2"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                              I agree to the Terms and Conditions and Privacy Policy.
                            </label>
                          </div>
                          
                          {!selectedAddress && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                              Please select a delivery address to continue.
                            </div>
                          )}
                          
                          {formData.paymentMethod === "wallet" && !isWalletSufficient() && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                              Insufficient wallet balance. Please add funds or choose another payment method.
                            </div>
                          )}
                          
                          <div className="flex gap-4">
                            <Link to="/user/cart" className="flex-1">
                              <button
                                type="button"
                                className="w-full py-4 border border-own-2 text-own-2 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                              >
                                <FontAwesomeIcon icon={faArrowLeft} />
                                Back to Cart
                              </button>
                            </Link>
                            
                            <button
                              type="submit"
                              disabled={loading || availableCartItems.length === 0 || !selectedAddress || (formData.paymentMethod === "wallet" && !isWalletSufficient())}
                              className={`flex-1 py-4 font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 ${
                                loading || availableCartItems.length === 0 || !selectedAddress || (formData.paymentMethod === "wallet" && !isWalletSufficient())
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-own-2 text-white hover:bg-amber-600'
                              }`}
                            >
                              {loading ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                  Place Order - £{calculateTotal().toFixed(2)}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-own-2 text-white p-2 rounded-full">
                            <FontAwesomeIcon icon={faShoppingBag} />
                          </div>
                          <h2 className="text-xl font-bold text-own-2">Order Summary</h2>
                        </div>
                        
                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                          {availableCartItems.map(item => {
                            const dishDetails = getDishDetails(item.id);
                            return (
                              <div key={item.id} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0">
                                <div className="relative">
                                  <div className="w-12 h-12 bg-own-2 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                    {item.quantity}
                                  </div>
                                  <img 
                                    src={dishDetails?.image || item.image || item.imageUrl || "/images/fallback-food.jpg"} 
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded-lg border-2 border-own-2"
                                    onError={(e) => {
                                      e.target.src = "/images/fallback-food.jpg";
                                    }}
                                  />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                                  <p className="text-sm text-gray-600">£{(item.price).toFixed(2)} each</p>
                                </div>
                                
                                <div className="font-bold text-own-2">
                                  £{(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                          
                          {unavailableCartItems.length > 0 && (
                            <div className="pt-4 border-t border-gray-200">
                              <p className="text-sm text-red-600 mb-2">
                                {unavailableCartItems.length} unavailable item{unavailableCartItems.length > 1 ? 's' : ''} removed from order
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3 mb-6 text-black">
                          <div className="flex justify-between">
                            <span>Subtotal ({getAvailableQuantity()} items)</span>
                            <span>£{(calculateSubtotal()).toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faTruck} className="text-gray-400" />
                              Delivery Fee
                            </span>
                            <span>{calculateDelivery() === 0 ? 'FREE' : `£${(calculateDelivery()).toFixed(2)}`}</span>
                          </div>
                          
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total</span>
                              <span className="text-own-2">£{(calculateTotal()).toFixed(2)}</span>
                            </div>
                          </div>
                          
                          {userData?.walletBalance !== undefined && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faWallet} className="text-own-2" />
                                  <span className="text-sm">Wallet Balance</span>
                                </span>
                                <span className="text-sm font-medium">
                                  {formatCurrency(userData.walletBalance)}
                                </span>
                              </div>
                              {formData.paymentMethod === "wallet" && (
                                <div className="mt-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>After payment:</span>
                                    <span className={`font-bold ${
                                      isWalletSufficient() ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {formatCurrency((userData.walletBalance || 0) - (calculateTotal() * 100))}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                          <h4 className="font-medium text-gray-800 mb-2">Estimated Delivery</h4>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-own-2">30-45 minutes</span> after order confirmation
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Orders are prepared fresh and delivered hot to your door
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                            <FontAwesomeIcon icon={faLock} className="text-green-500" />
                            <span>Secure SSL Encryption</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Your payment information is secure and encrypted
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}