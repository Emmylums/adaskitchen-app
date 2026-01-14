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
  faExclamationTriangle,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import AlertBanner from "../../components/AlertBanner";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";
import { 
  getDocs, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function Checkout() {
  // Move all hooks to the top level - NO CONDITIONAL HOOKS
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Cart");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuDishes, setMenuDishes] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    deliveryInstructions: "",
    paymentMethod: "wallet",
    saveInfo: false
  });

  // External hooks
  const { userData, loading: userLoading } = useUserData();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const addDebugLog = (message, data = null) => {
    console.log(`[DEBUG] ${message}`, data);
    setDebugLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    }]);
  };

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Get default address from userData
  useEffect(() => {
    if (userData?.addresses && userData.addresses.length > 0) {
      const defaultAddr = userData.addresses.find(addr => addr.isDefault) || userData.addresses[0];
      setSelectedAddress(defaultAddr);
      addDebugLog("Default address set", defaultAddr);
    }
  }, [userData]);

  // Fetch saved cards
  useEffect(() => {
    if (!userData?.uid) return;

    const fetchCards = async () => {
      try {
        addDebugLog("Fetching saved cards for user", { uid: userData.uid });

        const cards = userData.savedCards;
        setSavedCards(cards);
        addDebugLog("Cards fetched", { count: cards.length });

        const defaultCard = cards.find(c => c.isDefault);
        if (defaultCard) {
          setSelectedCard(defaultCard);
          addDebugLog("Default card set", defaultCard);
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
        addDebugLog("Error fetching cards", error.message);
      }
    };

    fetchCards();
  }, [userData]);

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
      addDebugLog("Form data updated from user profile");
    }
  }, [userData]);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        addDebugLog("Fetching menu items");
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
        addDebugLog("Menu items fetched", { count: dishesArray.length });
      } catch (err) {
        console.error("Error fetching menu items: ", err);
        addDebugLog("Error fetching menu items", err.message);
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
    const subtotal = calculateSubtotal();
    return subtotal > 200 ? 0 : 8.99;
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

  const splitPayment = (walletBalance, total) => {
    const totalInPence = Math.round(total * 100);
    walletBalance = walletBalance || 0;
    
    addDebugLog("Split payment calculation", {
      walletBalance,
      totalInPence,
      total
    });
    
    if (walletBalance >= totalInPence) {
      return { walletAmount: totalInPence, stripeAmount: 0 };
    }
    return {
      walletAmount: walletBalance,
      stripeAmount: totalInPence - walletBalance
    };
  };

  // Test API endpoint
  const testAPIEndpoint = async () => {
    try {
      addDebugLog("Testing API endpoint connection");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/health`
      );
      const data = await response.json();
      addDebugLog("API health check response", data);
      return data.status === "ok";
    } catch (error) {
      addDebugLog("API health check failed", error.message);
      return false;
    }
  };

  // Handle order submission
  const handleSubmit = async e => {
    e.preventDefault();
    
    if (isPaying || isProcessingPayment) return;
    
    addDebugLog("=== STARTING ORDER SUBMISSION ===");
    
    // Validation
    if (!selectedAddress) {
      setAlert({
        message: "Please select a delivery address",
        type: "error"
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      addDebugLog("Validation failed - No address selected");
      return;
    }
    
    if (availableCartItems.length === 0) {
      setAlert({
        message: "No available items in cart",
        type: "error"
      });
      addDebugLog("Validation failed - No available items");
      return;
    }
    
    if (formData.paymentMethod === "wallet" && !isWalletSufficient()) {
      setAlert({
        message: "Insufficient wallet balance. Please add funds or choose another payment method.",
        type: "error"
      });
      addDebugLog("Validation failed - Insufficient wallet balance");
      return;
    }
    
    if (formData.paymentMethod === "card" && !selectedCard && !useNewCard) {
      setAlert({
        message: "Please select a payment method or add a new card",
        type: "error"
      });
      addDebugLog("Validation failed - No card selected");
      return;
    }

    try {
      setIsPaying(true);
      setLoading(true);
      setIsProcessingPayment(true);
      addDebugLog("Payment process started");

      // Test API connection first
      const apiHealthy = await testAPIEndpoint();
      if (!apiHealthy) {
        throw new Error("Unable to connect to payment server. Please try again later.");
      }

      // Calculate payment split
      const total = calculateTotal();
      const walletBalance = userData?.walletBalance || 0;
      const { walletAmount, stripeAmount } = splitPayment(walletBalance, total);
      
      addDebugLog("Payment split", {
        total: total * 100,
        walletBalance,
        walletAmount,
        stripeAmount,
        paymentMethod: formData.paymentMethod
      });

      // Prepare order items
      const orderItems = availableCartItems.map(item => {
        const dishDetails = getDishDetails(item.id);
        return {
          id: item.id,
          name: item.name,
          price: item.price * 100, // Store in pence
          quantity: item.quantity,
          image: dishDetails?.image || item.image || "/images/fallback-food.jpg",
          total: (item.price * item.quantity) * 100
        };
      });

      // Prepare order data
      const orderData = {
        customerId: userData.uid,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: orderItems,
        subtotal: calculateSubtotal() * 100,
        deliveryFee: calculateDelivery() * 100,
        total: total * 100,
        walletAmount: walletAmount,
        stripeAmount: stripeAmount,
        paymentMethod: formData.paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        deliveryAddress: selectedAddress,
        deliveryInstructions: formData.deliveryInstructions || "",
        orderNumber: generateOrderNumber(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      addDebugLog("Order data prepared", orderData);

      // 1️⃣ Create order in Firestore
      const orderRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = orderRef.id;
      addDebugLog("Order created in Firestore", { orderId });

      // 2️⃣ Handle wallet-only payment
      if (formData.paymentMethod === "wallet" && stripeAmount === 0) {
        addDebugLog("Processing wallet-only payment");
        
        // Deduct from wallet
        if (walletAmount > 0 && userData?.uid) {
          const userRef = doc(db, "users", userData.uid);
          await updateDoc(userRef, {
            walletBalance: walletBalance - walletAmount,
            updatedAt: serverTimestamp()
          });
          
          addDebugLog("Wallet balance updated", {
            previous: walletBalance,
            deducted: walletAmount,
            newBalance: walletBalance - walletAmount
          });
        }
        
        // Update order status
        await updateDoc(orderRef, {
          paymentStatus: "paid",
          orderStatus: "confirmed",
          verified: true,
          paidAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        addDebugLog("Order status updated to paid");

        // Set order details and confirm
        setOrderDetails({
          ...orderData,
          id: orderId,
          items: orderItems
        });
        
        clearCart();
        setOrderConfirmed(true);
        setIsPaying(false);
        setLoading(false);
        setIsProcessingPayment(false);
        addDebugLog("=== WALLET-ONLY PAYMENT COMPLETED ===");
        return;
      }

      // 3️⃣ Handle card payment (with or without wallet)
      if (formData.paymentMethod === "card" && stripeAmount > 0) {
        addDebugLog("Processing card payment", { stripeAmount });
        
        try {
          // Create payment intent
          const paymentIntentData = {
            amount: total * 100,
            orderId: orderId,
            userId: userData.uid,
            walletAmount: walletAmount,
            currency: "gbp"
          };

          if (selectedCard && !useNewCard) {
            paymentIntentData.paymentMethodId = selectedCard.id;
          }

          addDebugLog("Sending payment intent request", paymentIntentData);

          const paymentIntentResponse = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/payments/create-payment-intent`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentIntentData)
            }
          );

          addDebugLog("Payment intent response status", {
            status: paymentIntentResponse.status,
            ok: paymentIntentResponse.ok
          });

          if (!paymentIntentResponse.ok) {
            const errorText = await paymentIntentResponse.text();
            addDebugLog("Payment intent error response", errorText);
            throw new Error(`Payment server error: ${paymentIntentResponse.status}`);
          }

          const paymentIntentResult = await paymentIntentResponse.json();
          addDebugLog("Payment intent created", paymentIntentResult);

          // Check if payment requires additional action
          if (paymentIntentResult.requiresAction) {
            addDebugLog("Payment requires additional action", paymentIntentResult.nextAction);
            // Handle 3D Secure or other authentication
            const { error: confirmError } = await stripe.handleCardAction(
              paymentIntentResult.clientSecret
            );
            
            if (confirmError) {
              throw confirmError;
            }
          }

          // If wallet-only payment (shouldn't happen here but check)
          if (paymentIntentResult.walletOnly) {
            addDebugLog("Unexpected wallet-only payment for card method");
            // Handle as wallet payment
            if (walletAmount > 0 && userData?.uid) {
              const userRef = doc(db, "users", userData.uid);
              await updateDoc(userRef, {
                walletBalance: walletBalance - walletAmount,
                updatedAt: serverTimestamp()
              });
            }
            
            await updateDoc(orderRef, {
              paymentStatus: "paid",
              orderStatus: "confirmed",
              verified: true,
              paidAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });

            setOrderDetails({
              ...orderData,
              id: orderId,
              items: orderItems
            });
            
            clearCart();
            setOrderConfirmed(true);
            setIsPaying(false);
            setLoading(false);
            setIsProcessingPayment(false);
            return;
          }

          // Handle card payment with Stripe
          if (paymentIntentResult.clientSecret) {
            let paymentResult;
            
            if (useNewCard) {
              addDebugLog("Processing new card payment");
              // New card payment
              if (!stripe || !elements) {
                throw new Error("Stripe not loaded. Please refresh the page.");
              }
              
              const cardElement = elements.getElement(CardElement);
              if (!cardElement) {
                throw new Error("Card element not found. Please enter card details.");
              }

              paymentResult = await stripe.confirmCardPayment(paymentIntentResult.clientSecret, {
                payment_method: {
                  card: cardElement,
                  billing_details: {
                    email: userData.email,
                    name: `${formData.firstName} ${formData.lastName}`,
                    phone: formData.phone,
                    address: {
                      line1: selectedAddress.line1 || selectedAddress.address,
                      city: selectedAddress.city,
                      postal_code: selectedAddress.postcode,
                      country: 'GB'
                    }
                  }
                },
                return_url: `${window.location.origin}/order-success/${orderId}`
              });
              
              addDebugLog("New card payment result", paymentResult);
            } else if (selectedCard) {
              addDebugLog("Processing saved card payment", { cardId: selectedCard.id });
              
              // For saved cards, we need to check if payment intent needs confirmation
              if (paymentIntentResult.requiresConfirmation || paymentIntentResult.status === 'requires_confirmation') {
                // Confirm with saved payment method
                paymentResult = await stripe.confirmCardPayment(paymentIntentResult.clientSecret, {
                  payment_method: selectedCard.id
                });
              } else {
                // If payment intent is already in a confirmable state, we can retrieve it
                const paymentIntent = await stripe.retrievePaymentIntent(paymentIntentResult.clientSecret);
                addDebugLog("Retrieved payment intent", paymentIntent);
                
                if (paymentIntent.paymentIntent && paymentIntent.paymentIntent.status === 'requires_confirmation') {
                  paymentResult = await stripe.confirmCardPayment(paymentIntentResult.clientSecret, {
                    payment_method: selectedCard.id
                  });
                } else {
                  // Payment intent might already be processing or succeeded
                  paymentResult = { paymentIntent: paymentIntent.paymentIntent };
                }
              }
              
              addDebugLog("Saved card payment result", paymentResult);
            } else {
              throw new Error("No payment method selected");
            }

            if (paymentResult.error) {
              addDebugLog("Payment error", paymentResult.error);
              throw paymentResult.error;
            }

            // Payment succeeded
            if (paymentResult.paymentIntent && paymentResult.paymentIntent.status === "succeeded") {
              addDebugLog("Payment succeeded", paymentResult.paymentIntent);
              
              // Deduct wallet amount if any
              if (walletAmount > 0 && userData?.uid) {
                const userRef = doc(db, "users", userData.uid);
                await updateDoc(userRef, {
                  walletBalance: walletBalance - walletAmount,
                  updatedAt: serverTimestamp()
                });
                
                addDebugLog("Wallet amount deducted", { amount: walletAmount });
              }

              // Update order with payment success
              await updateDoc(orderRef, {
                paymentStatus: "paid",
                orderStatus: "confirmed",
                stripePaymentIntentId: paymentResult.paymentIntent.id,
                stripeChargeId: paymentResult.paymentIntent.latest_charge || null,
                verified: true,
                paidAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });

              addDebugLog("Order updated with payment success");

              setOrderDetails({
                ...orderData,
                id: orderId,
                items: orderItems,
                stripePaymentIntentId: paymentResult.paymentIntent.id
              });
              
              clearCart();
              setOrderConfirmed(true);
              addDebugLog("=== CARD PAYMENT COMPLETED SUCCESSFULLY ===");
            } else {
              addDebugLog("Payment not completed", paymentResult);
              throw new Error("Payment not completed. Please try again.");
            }
          } else {
            addDebugLog("No client secret in response", paymentIntentResult);
            throw new Error("Payment initialization failed. No client secret received.");
          }
        } catch (paymentError) {
          console.error("Payment processing error:", paymentError);
          addDebugLog("Payment processing error", paymentError);
          
          // Update order with failure
          await updateDoc(orderRef, {
            paymentStatus: "failed",
            paymentError: paymentError.message || "Payment failed",
            updatedAt: serverTimestamp()
          });
          
          addDebugLog("Order marked as failed", { error: paymentError.message });
          
          throw paymentError;
        }
      }

    } catch (error) {
      console.error("Order submission error:", error);
      addDebugLog("Order submission error", error);
      
      setAlert({
        message: error.message || "Failed to process order. Please try again.",
        type: "error"
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } finally {
      setIsPaying(false);
      setLoading(false);
      setIsProcessingPayment(false);
      addDebugLog("=== PAYMENT PROCESS ENDED ===");
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "£0.00";
    
    return new Intl.NumberFormat('en-GB', {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
                  <p className="text-gray-600">Thank you for your order</p>
                  <div className="mt-4 inline-block bg-own-2 text-white px-4 py-2 rounded-full font-semibold">
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
                      {selectedAddress?.line1 || selectedAddress?.address}
                      {selectedAddress?.line2 && <>, {selectedAddress.line2}</>}
                      {selectedAddress?.city && <>, {selectedAddress.city}</>}
                      {selectedAddress?.postcode && <>, {selectedAddress.postcode}</>}
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
                      {orderDetails.paymentMethod === "wallet" && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>New Wallet Balance:</span>
                            <span className="font-bold">
                              {formatCurrency((userData?.walletBalance || 0) - orderDetails.walletAmount)}
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
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
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
                      </motion.div>
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
              </motion.div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Checkout Form View
  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  // Main Checkout Form Render
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
      
      {/* Debug Toggle Button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm z-50"
      >
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>
      
      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
              <h3 className="font-bold">Debug Logs</h3>
              <button onClick={() => setShowDebug(false)} className="text-white">Close</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {debugLogs.map((log, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="text-xs text-gray-500">{log.timestamp}</div>
                    <div className="font-medium">{log.message}</div>
                    {log.data && (
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {log.data}
                      </pre>
                    )}
                  </div>
                ))}
                {debugLogs.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No debug logs yet. Try placing an order.
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setDebugLogs([])}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="md:flex md:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[70%] lg:w-[75%]" : "md:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <h3 className="text-own-2 mb-6 uppercase font-bold text-2xl font-display2 tracking-wider">Checkout</h3>
                
                {/* Debug Information Banner */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-800">Payment Debug Info</p>
                      <p className="text-sm text-blue-600">
                        API URL: {import.meta.env.VITE_API_URL || "http://localhost:5000"}
                      </p>
                      <p className="text-sm text-blue-600">
                        User ID: {userData?.uid || "Not logged in"}
                      </p>
                      <p className="text-sm text-blue-600">
                        Wallet Balance: {formatCurrency(userData?.walletBalance || 0)}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const healthy = await testAPIEndpoint();
                        setAlert({
                          message: healthy ? "API is connected ✓" : "API connection failed ✗",
                          type: healthy ? "success" : "error"
                        });
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
                
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
                                    required
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
                            {/* Wallet Option */}
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
                            
                            {/* Card Option */}
                            <div className={`p-4 border rounded-xl cursor-pointer transition-all ${
                              formData.paymentMethod === "card" 
                                ? 'border-own-2 bg-own-2/5' 
                                : 'border-gray-300 hover:border-own-2'
                            }`}>
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  id="card"
                                  name="paymentMethod"
                                  value="card"
                                  checked={formData.paymentMethod === "card"}
                                  onChange={handleInputChange}
                                  className="mt-1 text-own-2 focus:ring-own-2"
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
                            </div>
                            
                            {/* PayPal Option */}
                            <div className={`p-4 border rounded-xl cursor-pointer transition-all ${
                              formData.paymentMethod === "paypal" 
                                ? 'border-own-2 bg-own-2/5' 
                                : 'border-gray-300 hover:border-own-2'
                            }`}>
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  id="paypal"
                                  name="paymentMethod"
                                  value="paypal"
                                  checked={formData.paymentMethod === "paypal"}
                                  onChange={handleInputChange}
                                  className="mt-1 text-own-2 focus:ring-own-2"
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
                            </div>
                          </div>

                          {/* Card Details Section */}
                          {formData.paymentMethod === "card" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.3 }}
                              className="mt-6 pt-6 border-t border-gray-200"
                            >
                              <h3 className="text-lg font-medium text-gray-800 mb-4">Select Card</h3>
                              
                              <div className="space-y-3 mb-4">
                                {savedCards.length > 0 ? (
                                  savedCards.map(card => (
                                    <label
                                      key={card.id}
                                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                                        selectedCard?.id === card.id
                                          ? "border-own-2 bg-amber-50"
                                          : "border-gray-200 hover:border-own-2"
                                      }`}
                                    >
                                      <div>
                                        <p className="font-semibold capitalize">
                                          {card.brand} •••• {card.last4}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          Expires {card.expMonth}/{card.expYear}
                                        </p>
                                      </div>

                                      <input
                                        type="radio"
                                        name="selectedCard"
                                        checked={selectedCard?.id === card.id}
                                        onChange={() => {
                                          setSelectedCard(card);
                                          setUseNewCard(false);
                                        }}
                                        className="text-own-2"
                                      />
                                    </label>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    No saved cards
                                  </div>
                                )}
                              </div>

                              <div className="mt-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUseNewCard(true);
                                    setSelectedCard(null);
                                  }}
                                  className={`text-sm ${useNewCard ? 'text-own-2 font-semibold' : 'text-own-2 underline'}`}
                                >
                                  {useNewCard ? '✓ Using new card' : 'Use a new card'}
                                </button>
                              </div>

                              {useNewCard && (
                                <div className="mt-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Card Details
                                  </label>
                                  <div className="p-4 border rounded-xl bg-gray-50">
                                    <CardElement
                                      options={{
                                        style: {
                                          base: {
                                            fontSize: "16px",
                                            color: "#000",
                                            "::placeholder": { color: "#a0aec0" }
                                          },
                                          invalid: { color: "#e53e3e" }
                                        },
                                        hidePostalCode: true
                                      }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Your card details are securely processed by Stripe
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>

                        {/* Submit Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                          {/* Validation Messages */}
                          {!selectedAddress && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                              Please select a delivery address to continue.
                            </div>
                          )}
                          
                          {formData.paymentMethod === "wallet" && !isWalletSufficient() && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                              Insufficient wallet balance. Please add funds or choose another payment method.
                            </div>
                          )}
                          
                          {formData.paymentMethod === "card" && !selectedCard && !useNewCard && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                              Please select a card or add a new one.
                            </div>
                          )}
                          
                          {unavailableCartItems.length > 0 && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
                              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                              {unavailableCartItems.length} item{unavailableCartItems.length > 1 ? 's' : ''} removed from order because they're no longer available.
                            </div>
                          )}

                          <div className="flex gap-4">
                            <Link to="/user/cart" className="flex-1">
                              <button
                                type="button"
                                className="w-full py-4 border border-own-2 text-own-2 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                disabled={isPaying}
                              >
                                <FontAwesomeIcon icon={faArrowLeft} />
                                Back to Cart
                              </button>
                            </Link>
                            
                            <button
                              type="submit"
                              disabled={
                                loading || 
                                isPaying || 
                                availableCartItems.length === 0 || 
                                !selectedAddress || 
                                (formData.paymentMethod === "wallet" && !isWalletSufficient()) ||
                                (formData.paymentMethod === "card" && !selectedCard && !useNewCard)
                              }
                              className={`flex-1 py-4 font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 ${
                                loading || isPaying || availableCartItems.length === 0 || !selectedAddress || 
                                (formData.paymentMethod === "wallet" && !isWalletSufficient()) ||
                                (formData.paymentMethod === "card" && !selectedCard && !useNewCard)
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-own-2 text-white hover:bg-amber-600'
                              }`}
                            >
                              {isPaying || loading ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                  {isProcessingPayment ? 'Processing Payment...' : 'Placing Order...'}
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                  Place Order - £{calculateTotal().toFixed(2)}
                                </>
                              )}
                            </button>
                          </div>
                          
                          <p className="text-xs text-gray-500 text-center mt-4">
                            By placing your order, you agree to our Terms of Service and Privacy Policy
                          </p>
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
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
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
                              <div className="flex justify-between items-center text-sm text-gray-700 mb-2">
                                <span>Wallet Balance</span>
                                <span className="font-bold">{formatCurrency(userData.walletBalance)}</span>
                              </div>
                              {formData.paymentMethod === "wallet" && (
                                <div className="text-sm">
                                  <div className="flex justify-between text-gray-600">
                                    <span>Will use from wallet:</span>
                                    <span className="font-semibold">
                                      {formatCurrency(
                                        isWalletSufficient() 
                                          ? calculateTotal() * 100 
                                          : userData.walletBalance
                                      )}
                                    </span>
                                  </div>
                                  {!isWalletSufficient() && (
                                    <div className="flex justify-between text-gray-600 mt-1">
                                      <span>Remaining to pay:</span>
                                      <span className="font-semibold">
                                        {formatCurrency((calculateTotal() * 100) - userData.walletBalance)}
                                      </span>
                                    </div>
                                  )}
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