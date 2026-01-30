import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faTimes, 
  faCreditCard, 
  faWallet,
  faTrash,
  faCheck,
  faExclamationCircle,
  faRedo,
  faSave,
  faHistory,
  faLock,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";
import { 
  CardNumberElement, 
  CardExpiryElement, 
  CardCvcElement, 
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion,
  getDoc
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { createNotification, NotificationTemplates } from "../services/notificationService";

// Card type detection utility (for display purposes)
const getCardType = (number) => {
  const cleanNumber = number.replace(/\D/g, '');
  
  if (!cleanNumber) return null;
  
  if (/^4/.test(cleanNumber)) return {
    type: 'visa',
    name: 'Visa',
    color: 'bg-blue-500',
    textColor: 'text-blue-500'
  };
  
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return {
    type: 'mastercard',
    name: 'Mastercard',
    color: 'bg-red-500',
    textColor: 'text-red-500'
  };
  
  if (/^3[47]/.test(cleanNumber)) return {
    type: 'amex',
    name: 'American Express',
    color: 'bg-green-500',
    textColor: 'text-green-500'
  };
  
  if (/^6(?:011|5)/.test(cleanNumber)) return {
    type: 'discover',
    name: 'Discover',
    color: 'bg-orange-500',
    textColor: 'text-orange-500'
  };
  
  if (/^3(?:0[0-5]|[68])/.test(cleanNumber)) return {
    type: 'diners',
    name: 'Diners Club',
    color: 'bg-purple-500',
    textColor: 'text-purple-500'
  };
  
  if (/^35/.test(cleanNumber)) return {
    type: 'jcb',
    name: 'JCB',
    color: 'bg-pink-500',
    textColor: 'text-pink-500'
  };
  
  if (/^62/.test(cleanNumber)) return {
    type: 'unionpay',
    name: 'UnionPay',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-500'
  };
  
  return {
    type: 'unknown',
    name: 'Card',
    color: 'bg-gray-500',
    textColor: 'text-gray-500'
  };
};

export default function Payments() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Payments");
  const stripe = useStripe();
  const elements = useElements();

  const [savedCards, setSavedCards] = useState([]);
  const [defaultCardId, setDefaultCardId] = useState(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  
  // Card form states for Add Payment Method
  const [cardHolderName, setCardHolderName] = useState("");
  const [detectedCardType, setDetectedCardType] = useState(null);
  
  // Card form states for Add Money with new card
  const [newCardForMoneyHolderName, setNewCardForMoneyHolderName] = useState("");
  const [detectedCardTypeForMoney, setDetectedCardTypeForMoney] = useState(null);
  const [cardElementComplete, setCardElementComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false
  });
  
  const { userData, loading: userLoading } = useUserData();

  // Function to refresh user data manually
  const refreshUserData = async () => {
    if (!userData?.uid) return;
    
    setIsRefreshing(true);
    try {
      const userRef = doc(db, "users", userData.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setSavedCards(data.savedCards || []);
        setDefaultCardId(data.defaultPaymentMethod || null);
        setWalletTransactions(data.walletTransactions || []);
        if (data.savedCards?.length > 0) {
          setSelectedPaymentMethod(data.defaultPaymentMethod || data.savedCards[0].id);
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!userData?.uid) return;

    const userRef = doc(db, "users", userData.uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      setSavedCards(data.savedCards || []);
      setDefaultCardId(data.defaultPaymentMethod || null);
      setWalletTransactions(data.walletTransactions || []);
      if (data.savedCards?.length > 0 && !selectedPaymentMethod) {
        setSelectedPaymentMethod(data.defaultPaymentMethod || data.savedCards[0].id);
      }
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  // Clear card form for Add Payment Method
  const clearCardForm = () => {
    setCardHolderName("");
    setDetectedCardType(null);
    
    // Clear Stripe elements
    if (elements) {
      const cardNumberElement = elements.getElement(CardNumberElement);
      const cardExpiryElement = elements.getElement(CardExpiryElement);
      const cardCvcElement = elements.getElement(CardCvcElement);
      
      if (cardNumberElement) cardNumberElement.clear();
      if (cardExpiryElement) cardExpiryElement.clear();
      if (cardCvcElement) cardCvcElement.clear();
    }
  };

  // Clear card form for Add Money with new card
  const clearNewCardForMoneyForm = () => {
    setNewCardForMoneyHolderName("");
    setDetectedCardTypeForMoney(null);
    setCardElementComplete({
      cardNumber: false,
      cardExpiry: false,
      cardCvc: false
    });
  };

  // Predefined amounts for quick selection (in pence)
  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

  // Format currency function
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "£0.00";
    
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle add money with card payment
  const handleAddMoney = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setAlert({
        message: "Please enter a valid amount",
        type: "error"
      });
      return;
    }

    const amountInPence = Math.round(Number(amount) * 100);
    
    // Check if using saved card or new card
    if (!useNewCard && !selectedPaymentMethod && savedCards.length > 0) {
      setAlert({
        message: "Please select a payment method",
        type: "error"
      });
      return;
    }

    // For new card, validate form
    if (useNewCard) {
      if (!newCardForMoneyHolderName.trim()) {
        setAlert({
          message: "Please enter cardholder name",
          type: "error"
        });
        return;
      }
      
      // Check if all card elements are complete
      if (!cardElementComplete.cardNumber || !cardElementComplete.cardExpiry || !cardElementComplete.cardCvc) {
        setAlert({
          message: "Please complete all card details",
          type: "error"
        });
        return;
      }
    }

    try {
      setIsProcessing(true);
      setAlert(null);

      const paymentIntentData = {
        amount: amountInPence,
        userId: userData.uid,
        currency: "gbp",
        saveCard: saveNewCard
      };

      if (!useNewCard && selectedPaymentMethod) {
        // For saved card
        paymentIntentData.paymentMethodId = selectedPaymentMethod;
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "https://adaskitchen-backend.vercel.app/api"}/payments/add-money-to-wallet`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(paymentIntentData)
          }
        );
        
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Payment failed");
        }

        // If payment succeeded
        if (data.success) {
          // Refresh user data manually
          await refreshUserData();

          // Create wallet top-up notification
          await createNotification(userData.uid,
            NotificationTemplates.WALLET_TOPUP(amountInPence, (userData?.walletBalance || 0) + amountInPence)
          );

          // Show success
          setAlert({
            message: `Successfully added ${formatCurrency(amountInPence)} to your wallet!`,
            type: "success"
          });

          // Reset and close modal
          setTimeout(() => {
            setAmount("");
            setSelectedAmount(null);
            setShowAddMoneyModal(false);
            setAlert(null);
            setUseNewCard(false);
            setSaveNewCard(false);
            clearNewCardForMoneyForm();
          }, 2000);
        }
      } else if (useNewCard) {
        // For new card - create payment method first
        if (!stripe || !elements) {
          throw new Error("Stripe not loaded. Please refresh the page.");
        }

        // Create a new payment method with the card details
        const { paymentMethod, error: createPaymentMethodError } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: newCardForMoneyHolderName.trim(),
            email: userData.email
          }
        });

        if (createPaymentMethodError) {
          throw createPaymentMethodError;
        }

        // Now create payment intent with the new payment method
        paymentIntentData.paymentMethodId = paymentMethod.id;
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "https://adaskitchen-backend.vercel.app/api"}/payments/add-money-to-wallet`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(paymentIntentData)
          }
        );
        
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Payment failed");
        }

        // If payment requires confirmation (3D Secure), handle it
        if (data.requiresConfirmation) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
          setRequiresConfirmation(true);
          return;
        }

        // If payment succeeded
        if (data.success) { 
          // Refresh user data manually
          await refreshUserData();

          // Create wallet top-up notification
          await createNotification(userData.uid,
            NotificationTemplates.WALLET_TOPUP(amountInPence, (userData?.walletBalance || 0) + amountInPence)
          );

          // Show success
          setAlert({
            message: `Successfully added ${formatCurrency(amountInPence)} to your wallet!`,
            type: "success"
          });

          // Reset and close modal
          setTimeout(() => {
            setAmount("");
            setSelectedAmount(null);
            setShowAddMoneyModal(false);
            setAlert(null);
            setRequiresConfirmation(false);
            setClientSecret(null);
            setPaymentIntentId(null);
            setUseNewCard(false);
            setSaveNewCard(false);
            clearNewCardForMoneyForm();
          }, 2000);
        }
      }

    } catch (error) {
      console.error("Error adding money:", error);
      setAlert({
        message: error.message || "Failed to add money. Please try again.",
        type: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle 3D Secure confirmation for new cards
  const handlePaymentConfirmation = async () => {
    if (!stripe || !clientSecret) return;

    try {
      setIsProcessing(true);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
      
      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'succeeded') {
        // Refresh user data
        await refreshUserData();

        // Create wallet top-up notification
        await createNotification(userData.uid,
          NotificationTemplates.WALLET_TOPUP(paymentIntent.amount, (userData?.walletBalance || 0) + paymentIntent.amount)
        );

        setAlert({
          message: `Successfully added ${formatCurrency(paymentIntent.amount)} to your wallet!`,
          type: "success"
        });

        // Reset and close modal
        setTimeout(() => {
          setAmount("");
          setSelectedAmount(null);
          setShowAddMoneyModal(false);
          setAlert(null);
          setRequiresConfirmation(false);
          setClientSecret(null);
          setPaymentIntentId(null);
          setUseNewCard(false);
          setSaveNewCard(false);
          clearNewCardForMoneyForm();
        }, 2000);
      }
    } catch (error) {
      console.error("Payment confirmation error:", error);
      setAlert({
        message: error.message || "Payment failed. Please try again.",
        type: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle adding payment method (separate from wallet top-up) - USING STRIPE ELEMENTS
  const handleAddPaymentMethod = async () => {
    if (!stripe || !elements || isSavingCard) return;

    // Validate form
    if (!cardHolderName.trim()) {
      setAlert({
        message: "Please enter cardholder name",
        type: "error"
      });
      return;
    }

    setIsSavingCard(true);
    setAlert(null);

    try {
      // 1. Create setup intent
      const setupIntentResponse = await fetch(
        `${import.meta.env.VITE_API_URL || "https://adaskitchen-backend.vercel.app/api"}/payments/create-setup-intent`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            userId: userData.uid,
            email: userData.email
          })
        }
      );

      if (!setupIntentResponse.ok) {
        const errorData = await setupIntentResponse.json();
        throw new Error(errorData.error || "Failed to create setup intent");
      }

      const { clientSecret } = await setupIntentResponse.json();

      // 2. Confirm card setup using Stripe Elements
      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: {
              name: cardHolderName.trim(),
              email: userData.email
            }
          },
        }
      );

      if (error) throw error;

      // 3. Get payment method details
      const paymentMethodResponse = await fetch(
        `${import.meta.env.VITE_API_URL || "https://adaskitchen-backend.vercel.app/api"}/payments/payment-method/${setupIntent.payment_method}`
      );

      if (!paymentMethodResponse.ok) {
        throw new Error("Failed to retrieve payment method details");
      }

      const paymentMethod = await paymentMethodResponse.json();

      // 4. Save card to Firestore
      const userRef = doc(db, "users", userData.uid);
      const cardData = {
        id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
        isDefault: savedCards.length === 0, // Set as default if first card
        createdAt: new Date().toISOString()
      };

      await updateDoc(userRef, {
        savedCards: arrayUnion(cardData),
        ...(savedCards.length === 0 && { defaultPaymentMethod: paymentMethod.id }),
        updatedAt: new Date().toISOString()
      });

      // 5. Refresh data manually
      await refreshUserData();

      // Create card added notification
      await createNotification(userData.uid,
        NotificationTemplates.CARD_ADDED(paymentMethod.card.last4, paymentMethod.card.brand)
      );

      setAlert({
        message: "Card saved successfully!",
        type: "success"
      });

      // Close modal after success
      setTimeout(() => {
        setShowAddPaymentModal(false);
        setAlert(null);
        clearCardForm();
      }, 2000);

    } catch (err) {
      console.error("Error saving card:", err);
      setAlert({
        message: err.message || "Failed to save card. Please try again.",
        type: "error"
      });
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleSetDefault = async (paymentMethodId) => {
    if (!userData?.stripeCustomerId) {
      setAlert({
        message: "Customer information not found. Please try again later.",
        type: "error"
      });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://adaskitchen-backend.vercel.app/api"}/payments/set-default-card`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          customerId: userData.stripeCustomerId,
          paymentMethodId: paymentMethodId,
          userId: userData.uid
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update default card");
      }

      // Update Firestore
      const userRef = doc(db, "users", userData.uid);
      const updatedCards = savedCards.map((card) => ({
        ...card,
        isDefault: card.id === paymentMethodId
      }));

      await updateDoc(userRef, {
        savedCards: updatedCards,
        defaultPaymentMethod: paymentMethodId,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setDefaultCardId(paymentMethodId);
      setSavedCards(updatedCards);

      // Create default card changed notification
      const card = savedCards.find(c => c.id === paymentMethodId);
      if (card) {
        await createNotification(userData.uid,
          NotificationTemplates.DEFAULT_CARD_CHANGED(card.last4, card.brand)
        );
      }

      setAlert({
        message: "Default card updated successfully!",
        type: "success"
      });

      setTimeout(() => setAlert(null), 3000);

    } catch (err) {
      console.error("Error setting default card:", err);
      setAlert({
        message: err.message || "Failed to set default card",
        type: "error"
      });
    }
  };

  const handleRemoveCard = async (paymentMethodId) => {
    if (!window.confirm("Are you sure you want to remove this card?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "https://adaskitchen-backend.vercel.app/api"}/payments/card/${paymentMethodId}`,
        {
          method: "DELETE",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ userId: userData.uid })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove card");
      }

      // Update local state
      const updatedCards = savedCards.filter(card => card.id !== paymentMethodId);
      setSavedCards(updatedCards);

      // Create card removed notification
      const removedCard = savedCards.find(c => c.id === paymentMethodId);
      if (removedCard) {
        await createNotification(userData.uid,
          NotificationTemplates.CARD_REMOVED(removedCard.last4, removedCard.brand)
        );
      }

      // If removed card was default, set a new default or clear
      if (paymentMethodId === defaultCardId) {
        const newDefaultCard = updatedCards.length > 0 ? updatedCards[0].id : null;
        setDefaultCardId(newDefaultCard);

        // Update Firestore
        const userRef = doc(db, "users", userData.uid);
        await updateDoc(userRef, {
          defaultPaymentMethod: newDefaultCard,
          updatedAt: new Date().toISOString()
        });
      }

      setAlert({
        message: "Card removed successfully!",
        type: "success"
      });

      setTimeout(() => setAlert(null), 3000);

    } catch (err) {
      console.error("Error removing card:", err);
      setAlert({
        message: err.message || "Failed to remove card",
        type: "error"
      });
    }
  };

  // Handle quick amount selection
  const handleQuickAmountSelect = (amount) => {
    setAmount((amount / 100).toString());
    setSelectedAmount(amount);
  };

  // Handle card element change for Add Money
  const handleCardElementChange = (event, elementType) => {
    if (event.complete) {
      setCardElementComplete(prev => ({
        ...prev,
        [elementType]: true
      }));
    } else {
      setCardElementComplete(prev => ({
        ...prev,
        [elementType]: false
      }));
    }
    
    // Detect card type from card number
    if (elementType === 'cardNumber' && event.value) {
      const cardType = getCardType(event.value.replace(/\s/g, ''));
      setDetectedCardTypeForMoney(cardType);
    }
  };

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your payment information...</p>
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
        userData={userData}
      />
      <UserSideBar 
        isOpen={isSidebarOpen} 
        closeSidebar={closeSidebar} 
        userData={userData} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
      />
      
      {/* Alert Banner */}
      {alert && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md ${
          alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        } border rounded-lg p-4 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={alert.type === 'success' ? faCheck : faExclamationCircle} 
                className={`mr-2 ${alert.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
              />
              <span>{alert.message}</span>
            </div>
            <button 
              onClick={() => setAlert(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}
      
      <div className="lg:flex lg:justify-end">
        <div className={`pt-32 px-5 ${isSidebarOpen ? "lg:w-[75%]" : "lg:w-full"} transition-all duration-500`}>
          <div className="max-w-7xl mx-auto pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                
                {/* Payments & Wallet Tab */}
                {activeTab === "Payments" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-own-2">Payments & Wallet</h3>
                      <button
                        onClick={refreshUserData}
                        disabled={isRefreshing}
                        className="text-own-2 hover:text-amber-600 transition-colors"
                        title="Refresh data"
                      >
                        <FontAwesomeIcon 
                          icon={faRedo} 
                          className={isRefreshing ? "animate-spin" : ""}
                        />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Wallet Balance */}
                      <div className="p-6 bg-gradient-to-r from-own-2 to-amber-500 rounded-xl text-white">
                        <h4 className="text-lg font-semibold mb-2">Wallet Balance</h4>
                        <p className="text-3xl font-bold mb-4">
                          {formatCurrency(userData?.walletBalance || 0)}
                        </p>
                        <button 
                          onClick={() => setShowAddMoneyModal(true)}
                          className="bg-white text-own-2 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                          Add Money
                        </button>
                        <div className="flex items-center mt-4 text-sm opacity-90">
                          <FontAwesomeIcon icon={faLock} className="mr-2" />
                          <span>Secure payments with Stripe</span>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="p-6 border border-gray-200 rounded-xl text-black">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold">Payment Methods</h4>
                          <span className="text-sm text-gray-500">
                            {savedCards.length} saved
                          </span>
                        </div>
                        
                        {savedCards.length === 0 ? (
                          <div className="text-center py-8">
                            <FontAwesomeIcon icon={faCreditCard} className="text-4xl text-gray-300 mb-3" />
                            <p className="text-gray-500">No saved cards</p>
                            <p className="text-sm text-gray-400 mt-1">
                              Add a card for faster checkout
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {savedCards.map((card) => (
                              <div
                                key={card.id}
                                className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center">
                                  <div className={`w-10 h-6 rounded mr-3 flex items-center justify-center ${
                                    card.brand === 'visa' ? 'bg-blue-500' :
                                    card.brand === 'mastercard' ? 'bg-red-500' :
                                    card.brand === 'amex' ? 'bg-green-500' :
                                    'bg-gray-500'
                                  }`}>
                                    <span className="text-xs text-white font-bold">
                                      {card.brand === 'visa' ? 'VISA' :
                                       card.brand === 'mastercard' ? 'MC' :
                                       card.brand === 'amex' ? 'AMEX' : 'CARD'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold">
                                      •••• {card.last4}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear.toString().slice(-2)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {card.id === defaultCardId ? (
                                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                      Default
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleSetDefault(card.id)}
                                      className="text-sm text-own-2 hover:text-amber-600"
                                    >
                                      Set Default
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleRemoveCard(card.id)}
                                    className="text-gray-400 hover:text-red-500 ml-2"
                                    title="Remove card"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <button 
                          onClick={() => setShowAddPaymentModal(true)}
                          className="w-full mt-4 py-3 border-2 border-dashed border-own-2 text-own-2 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          Add Payment Method
                        </button>
                      </div>
                    </div>
                    
                    {/* Recent Transactions */}
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">Recent Wallet Activity</h4>
                        <button
                          onClick={() => setShowTransactions(!showTransactions)}
                          className="text-own-2 hover:text-amber-600 flex items-center"
                        >
                          <FontAwesomeIcon icon={faHistory} className="mr-2" />
                          {showTransactions ? 'Hide' : 'Show'} Transactions
                        </button>
                      </div>
                      
                      {showTransactions ? (
                        walletTransactions.length > 0 ? (
                          <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Type
                                    </th>
                                    <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Description
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {walletTransactions.slice().reverse().map((transaction, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(transaction.timestamp)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          transaction.type === 'deposit' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                          {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                                        {formatCurrency(transaction.amount)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          transaction.status === 'completed' 
                                            ? 'bg-green-100 text-green-800'
                                            : transaction.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                          {transaction.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-500">
                                        {transaction.description}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <FontAwesomeIcon icon={faHistory} className="text-4xl text-gray-300 mb-3" />
                            <p className="text-gray-500">No transaction history yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                              Start by adding money to your wallet
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-500 text-center">
                            {walletTransactions.length > 0 
                              ? `${walletTransactions.length} transactions found` 
                              : "No recent transactions"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Security Note */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-blue-500 mr-3 mt-1" />
                        <div>
                          <h5 className="font-semibold text-blue-800">Secure Payment Processing</h5>
                          <p className="text-sm text-blue-700 mt-1">
                            Your payment information is encrypted and secure. We use Stripe, a PCI-DSS compliant payment processor, to ensure your card details are never stored on our servers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">
                  <FontAwesomeIcon icon={faWallet} className="mr-2" />
                  Add Money to Wallet
                </h3>
                <button 
                  onClick={() => {
                    setShowAddMoneyModal(false);
                    setAmount("");
                    setSelectedAmount(null);
                    setAlert(null);
                    setRequiresConfirmation(false);
                    setClientSecret(null);
                    setPaymentIntentId(null);
                    setUseNewCard(false);
                    setSaveNewCard(false);
                    clearNewCardForMoneyForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isProcessing}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {alert && (
                <div className={`mb-4 p-3 rounded-lg ${
                  alert.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {alert.message}
                </div>
              )}

              {!requiresConfirmation ? (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Amount (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.50"
                      max="1000"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-transparent text-black"
                      placeholder="0.00"
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: £0.50 | Maximum: £1,000.00
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-700 mb-3">Quick Select</p>
                    <div className="grid grid-cols-3 gap-2">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => handleQuickAmountSelect(amt)}
                          disabled={isProcessing}
                          className={`py-3 rounded-lg border transition-colors ${
                            selectedAmount === amt 
                              ? 'bg-own-2 text-white border-own-2' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {formatCurrency(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <p className="text-gray-700 mb-3">Payment Method</p>
                    
                    {savedCards.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {savedCards.map((card) => (
                          <div
                            key={card.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              !useNewCard && selectedPaymentMethod === card.id
                                ? 'border-own-2 bg-own-2/5'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setUseNewCard(false);
                              setSelectedPaymentMethod(card.id);
                              clearNewCardForMoneyForm();
                            }}
                          >
                            <div className="flex items-center justify-between text-black">
                              <div className="flex items-center">
                                <div className={`w-10 h-6 rounded mr-3 flex items-center justify-center ${
                                  card.brand === 'visa' ? 'bg-blue-500' :
                                  card.brand === 'mastercard' ? 'bg-red-500' :
                                  card.brand === 'amex' ? 'bg-green-500' :
                                  'bg-gray-500'
                                }`}>
                                  <span className="text-xs text-white font-bold">
                                    {card.brand === 'visa' ? 'VISA' :
                                     card.brand === 'mastercard' ? 'MC' :
                                     card.brand === 'amex' ? 'AMEX' : 'CARD'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold">
                                    •••• {card.last4}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear.toString().slice(-2)}
                                  </p>
                                </div>
                              </div>
                              {!useNewCard && selectedPaymentMethod === card.id && (
                                <FontAwesomeIcon icon={faCheck} className="text-own-2" />
                              )}
                            </div>
                            {card.id === defaultCardId && (
                              <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Use New Card Option */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setUseNewCard(true);
                          setSelectedPaymentMethod(null);
                          setNewCardForMoneyHolderName(userData?.firstName || '');
                        }}
                        className={`text-sm ${useNewCard ? 'text-own-2 font-semibold' : 'text-own-2 underline'}`}
                      >
                        {useNewCard ? '✓ Using new card' : 'Use a new card'}
                      </button>
                    </div>

                    {/* New Card Form for Add Money - Using Stripe Elements */}
                    {useNewCard && (
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={newCardForMoneyHolderName}
                            onChange={(e) => setNewCardForMoneyHolderName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-transparent text-black"
                            placeholder="Name on card"
                            required
                            disabled={isProcessing}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                          </label>
                          <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-own-2 focus-within:border-transparent">
                            <CardNumberElement
                              options={{
                                placeholder: "4242 4242 4242 4242",
                                style: {
                                  base: {
                                    fontSize: "16px",
                                    color: "#32325d",
                                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                    "::placeholder": { color: "#a0aec0" },
                                  },
                                  invalid: {
                                    color: "#e53e3e",
                                  },
                                },
                              }}
                              onChange={(e) => handleCardElementChange(e, 'cardNumber')}
                              disabled={isProcessing}
                            />
                          </div>
                          {detectedCardTypeForMoney && (
                            <div className="mt-2 flex justify-end">
                              <div className={`px-2 py-1 rounded text-xs font-bold text-white ${detectedCardTypeForMoney.color}`}>
                                {detectedCardTypeForMoney.name}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-own-2 focus-within:border-transparent">
                              <CardExpiryElement
                                options={{
                                  placeholder: "MM/YY",
                                  style: {
                                    base: {
                                      fontSize: "16px",
                                      color: "#32325d",
                                      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                      "::placeholder": { color: "#a0aec0" },
                                    },
                                    invalid: {
                                      color: "#e53e3e",
                                    },
                                  },
                                }}
                                onChange={(e) => handleCardElementChange(e, 'cardExpiry')}
                                disabled={isProcessing}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CVC
                            </label>
                            <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-own-2 focus-within:border-transparent">
                              <CardCvcElement
                                options={{
                                  placeholder: "123",
                                  style: {
                                    base: {
                                      fontSize: "16px",
                                      color: "#32325d",
                                      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                      "::placeholder": { color: "#a0aec0" },
                                    },
                                    invalid: {
                                      color: "#e53e3e",
                                    },
                                  },
                                }}
                                onChange={(e) => handleCardElementChange(e, 'cardCvc')}
                                disabled={isProcessing}
                              />
                            </div>
                          </div>
                        </div>

                        {/* <div className="mt-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveNewCard}
                              onChange={(e) => setSaveNewCard(e.target.checked)}
                              className="rounded text-own-2 focus:ring-own-2"
                              disabled={isProcessing}
                            />
                            <span className="text-sm text-gray-700">Save this card for future purchases</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Your card details are securely stored and encrypted
                          </p>
                        </div> */}
                      </div>
                    )}
                  </div>

                  <div className="mb-6 p-4 bg-amber-50 rounded-lg text-black">
                    <p className="font-semibold text-own-2 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(userData?.walletBalance || 0)}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      New balance after adding {amount ? formatCurrency(Number(amount) * 100) : "£0.00"}:{" "}
                      <span className="font-bold">
                        {formatCurrency((userData?.walletBalance || 0) + (Number(amount) * 100 || 0))}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowAddMoneyModal(false);
                        setAmount("");
                        setSelectedAmount(null);
                        setAlert(null);
                        setUseNewCard(false);
                        setSaveNewCard(false);
                        clearNewCardForMoneyForm();
                      }}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isProcessing}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMoney}
                      className="flex-1 py-3 bg-own-2 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center"
                      disabled={
                        !amount || 
                        Number(amount) <= 0 || 
                        isProcessing || 
                        (!useNewCard && !selectedPaymentMethod && savedCards.length > 0) ||
                        (useNewCard && (!newCardForMoneyHolderName || !cardElementComplete.cardNumber || !cardElementComplete.cardExpiry || !cardElementComplete.cardCvc))
                      }
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        `Add ${amount ? formatCurrency(Number(amount) * 100) : 'Money'}`
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* 3D Secure Confirmation - For new cards in Add Money */
                <div className="text-center py-8">
                  <div className="mb-6">
                    <FontAwesomeIcon icon={faCreditCard} className="text-4xl text-own-2 mb-4" />
                    <h4 className="text-xl font-bold mb-2">Confirm Payment</h4>
                    <p className="text-gray-600 mb-4">
                      Please confirm the payment of {formatCurrency(Number(amount) * 100)} to add to your wallet.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      This might require additional verification from your bank.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setRequiresConfirmation(false);
                        setClientSecret(null);
                        setPaymentIntentId(null);
                      }}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isProcessing}
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePaymentConfirmation}
                      className="flex-1 py-3 bg-own-2 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Confirming...
                        </>
                      ) : (
                        'Confirm Payment'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Payment Method Modal - USING STRIPE ELEMENTS */} 
      {showAddPaymentModal && (
        <div className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50 ${isSidebarOpen ? "md:left-[30%] lg:left-[25%]" : "md:left-0"} transition-all duration-500`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-own-2">
                  <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                  Add Payment Method
                </h3>
                <button 
                  onClick={() => {
                    setShowAddPaymentModal(false);
                    setAlert(null);
                    clearCardForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isSavingCard}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {alert && (
                <div className={`mb-4 p-3 rounded-lg ${
                  alert.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {alert.message}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-transparent text-black"
                  placeholder="Name on card"
                  disabled={isSavingCard}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Card Number</label>
                <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-own-2 focus-within:border-transparent">
                  <CardNumberElement
                    options={{
                      placeholder: "4242 4242 4242 4242",
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#32325d",
                          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                          "::placeholder": { color: "#a0aec0" },
                        },
                        invalid: {
                          color: "#e53e3e",
                        },
                      },
                    }}
                    onChange={(e) => {
                      if (e.complete) {
                        const cardType = getCardType(e.value?.replace(/\s/g, '') || '');
                        setDetectedCardType(cardType);
                      }
                    }}
                    disabled={isSavingCard}
                  />
                </div>
                {detectedCardType && (
                  <div className="mt-2 flex justify-end">
                    <div className={`px-2 py-1 rounded text-xs font-bold text-white ${detectedCardType.color}`}>
                      {detectedCardType.name}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Expiry Date</label>
                  <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-own-2 focus-within:border-transparent">
                    <CardExpiryElement
                      options={{
                        placeholder: "MM/YY",
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#32325d",
                            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                            "::placeholder": { color: "#a0aec0" },
                          },
                          invalid: {
                            color: "#e53e3e",
                          },
                        },
                      }}
                      disabled={isSavingCard}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">CVC</label>
                  <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-own-2 focus-within:border-transparent">
                    <CardCvcElement
                      options={{
                        placeholder: "123",
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#32325d",
                            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                            "::placeholder": { color: "#a0aec0" },
                          },
                          invalid: {
                            color: "#e53e3e",
                          },
                        },
                      }}
                      disabled={isSavingCard}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Note:</span> Your card details are securely processed by Stripe and never stored on our servers.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddPaymentModal(false);
                    setAlert(null);
                    clearCardForm();
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSavingCard}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="flex-1 py-3 bg-own-2 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center"
                  disabled={!stripe || !elements || isSavingCard || !cardHolderName}
                >
                  {isSavingCard ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Card'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}