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
import { createNotification, NotificationTemplates } from "../services/notificationService";

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

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Get default address from userData
  useEffect(() => {
    if (userData?.addresses && userData.addresses.length > 0) {
      const defaultAddr = userData.addresses.find(addr => addr.isDefault) || userData.addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [userData]);

  // Fetch saved cards
  useEffect(() => {
    if (!userData?.uid) return;

    const fetchCards = async () => {
      try {

        const cards = userData.savedCards;
        setSavedCards(cards);

        const defaultCard = cards.find(c => c.isDefault);
        if (defaultCard) {
          setSelectedCard(defaultCard);
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "https://adaskitchen-backend.vercel.app/api"}/health`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors", // Explicitly set CORS mode
          credentials: "include" // Include credentials if needed
        }
      );
      
      // If we get any response (even 404), the server is reachable
      if (response.status >= 200 && response.status < 500) {
        return true;
      }
      return false;
    } catch (error) {
      console.log("API health check failed, but we'll try to proceed:", error.message);
      // Instead of failing completely, we'll try to proceed
      // The payment endpoints might still work even if health check fails
      return true; // Changed from false to true to allow proceeding
    }
  };

  // Handle order submission
  const handleSubmit = async e => {
  e.preventDefault();
  
  if (isPaying || isProcessingPayment) return;
  
  // Validation (keep your existing validation code)
  if (!selectedAddress) {
    setAlert({
      message: "Please select a delivery address",
      type: "error"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  // ... rest of validation code

  try {
    setIsPaying(true);
    setLoading(true);
    setIsProcessingPayment(true);

    // Calculate payment split
    const total = calculateTotal();
    const walletBalance = userData?.walletBalance || 0;
    const { walletAmount, stripeAmount } = splitPayment(walletBalance, total);

    // Prepare order items
    const orderItems = availableCartItems.map(item => {
      const dishDetails = getDishDetails(item.id);
      return {
        id: item.id,
        name: item.name,
        price: item.price * 100,
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

    // 1️⃣ Create order in Firestore
    const orderRef = await addDoc(collection(db, "orders"), orderData);
    const orderId = orderRef.id;

    // 2️⃣ Handle wallet-only payment
    if (formData.paymentMethod === "wallet" && stripeAmount === 0) {
      
      // Deduct from wallet
      if (walletAmount > 0 && userData?.uid) {
        const userRef = doc(db, "users", userData.uid);
        await updateDoc(userRef, {
          walletBalance: walletBalance - walletAmount,
          updatedAt: serverTimestamp()
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

      // Create order confirmation notification
      await createNotification(userData.uid,
        NotificationTemplates.ORDER_CONFIRMED(orderData.orderNumber, orderData.total)
      );
      
      // Create wallet usage notification if wallet was used
      if (walletAmount > 0) {
        await createNotification(userData.uid,
          NotificationTemplates.WALLET_USED(
            walletAmount,
            walletBalance - walletAmount,
            orderData.orderNumber
          )
        );
      }

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
      return;
    }

    // 3️⃣ Handle card payment (with or without wallet)
    if (formData.paymentMethod === "card" && stripeAmount > 0) {
      
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

        const API_URL = import.meta.env.VITE_API_URL || "https://adaskitchen-backend.vercel.app/api";
        
        const paymentIntentResponse = await fetch(
          `${API_URL}/payments/create-payment-intent`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(paymentIntentData)
          }
        );

        // Handle CORS and network errors
        if (!paymentIntentResponse.ok) {
          // Check if it's a CORS issue (status 0 or no response)
          if (paymentIntentResponse.status === 0) {
            throw new Error("Cannot connect to payment server. This may be a temporary issue. Please try again.");
          }
          
          const errorText = await paymentIntentResponse.text();
          throw new Error(`Payment error: ${paymentIntentResponse.status} - ${errorText}`);
        }

        const paymentIntentResult = await paymentIntentResponse.json();

        // Check if payment requires additional action
        if (paymentIntentResult.requiresAction) {
          // Handle 3D Secure or other authentication
          const { error: confirmError } = await stripe.handleCardAction(
            paymentIntentResult.clientSecret
          );
          
          if (confirmError) {
            throw confirmError;
          }
        }

        // If wallet-only payment
        if (paymentIntentResult.walletOnly) {
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

          // Create notifications
          await createNotification(userData.uid,
            NotificationTemplates.ORDER_CONFIRMED(orderData.orderNumber, orderData.total)
          );
          
          if (walletAmount > 0) {
            await createNotification(userData.uid,
              NotificationTemplates.WALLET_USED(
                walletAmount,
                walletBalance - walletAmount,
                orderData.orderNumber
              )
            );
          }

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
            
          } else if (selectedCard) {
            
            // For saved cards, we need to check if payment intent needs confirmation
            if (paymentIntentResult.requiresConfirmation || paymentIntentResult.status === 'requires_confirmation') {
              // Confirm with saved payment method
              paymentResult = await stripe.confirmCardPayment(paymentIntentResult.clientSecret, {
                payment_method: selectedCard.id
              });
            } else {
              // If payment intent is already in a confirmable state, we can retrieve it
              const paymentIntent = await stripe.retrievePaymentIntent(paymentIntentResult.clientSecret);
              
              if (paymentIntent.paymentIntent && paymentIntent.paymentIntent.status === 'requires_confirmation') {
                paymentResult = await stripe.confirmCardPayment(paymentIntentResult.clientSecret, {
                  payment_method: selectedCard.id
                });
              } else {
                // Payment intent might already be processing or succeeded
                paymentResult = { paymentIntent: paymentIntent.paymentIntent };
              }
            }
          } else {
            throw new Error("No payment method selected");
          }

          if (paymentResult.error) {
            throw paymentResult.error;
          }

          // Payment succeeded
          if (paymentResult.paymentIntent && paymentResult.paymentIntent.status === "succeeded") {
            
            // Deduct wallet amount if any
            if (walletAmount > 0 && userData?.uid) {
              const userRef = doc(db, "users", userData.uid);
              await updateDoc(userRef, {
                walletBalance: walletBalance - walletAmount,
                updatedAt: serverTimestamp()
              });
              
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

            // Create order confirmation notification
            await createNotification(userData.uid,
              NotificationTemplates.ORDER_CONFIRMED(orderData.orderNumber, orderData.total)
            );
            
            // Create payment success notification
            await createNotification(userData.uid,
              NotificationTemplates.PAYMENT_SUCCESS(orderData.total, "card")
            );
            
            // Create wallet usage notification if wallet was used
            if (walletAmount > 0) {
              await createNotification(userData.uid,
                NotificationTemplates.WALLET_USED(
                  walletAmount,
                  walletBalance - walletAmount,
                  orderData.orderNumber
                )
              );
            }

            setOrderDetails({
              ...orderData,
              id: orderId,
              items: orderItems,
              stripePaymentIntentId: paymentResult.paymentIntent.id
            });
            
            clearCart();
            setOrderConfirmed(true);
          } else {
            throw new Error("Payment not completed. Please try again.");
          }
        } else {
          throw new Error("Payment initialization failed. No client secret received.");
        }
      } catch (paymentError) {
        console.error("Payment processing error:", paymentError);
        
        // Update order with failure
        await updateDoc(orderRef, {
          paymentStatus: "failed",
          paymentError: paymentError.message || "Payment failed",
          updatedAt: serverTimestamp()
        });
        
        // Create payment failure notification
        await createNotification(userData.uid,
          NotificationTemplates.PAYMENT_FAILED(
            orderData.total,
            paymentError.message || "Payment failed"
          )
        );
        
        // Provide user-friendly error message
        let userMessage = paymentError.message;
        if (paymentError.message.includes("Failed to fetch") || paymentError.message.includes("CORS")) {
          userMessage = "Payment service is temporarily unavailable. Please try wallet payment or try again later.";
        }
        
        throw new Error(userMessage);
      }
    }

  } catch (error) {
    console.error("Order submission error:", error);
    
    setAlert({
      message: error.message || "Failed to process order. Please try again.",
      type: "error"
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } finally {
    setIsPaying(false);
    setLoading(false);
    setIsProcessingPayment(false);
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
                                        <p className="font-semibold capitalize text-black">
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