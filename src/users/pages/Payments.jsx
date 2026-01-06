import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faCreditCard, faWallet } from "@fortawesome/free-solid-svg-icons";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";

export default function Payments() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Payments");
  const [orderFilter, setOrderFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [selectedAmount, setSelectedAmount] = useState(null);
  
  const { userData, loading: userLoading, updateUserData } = useUserData();

  const paymentMethods = [
    {
      id: 1,
      type: "card",
      last4: "4242",
      expiry: "12/25",
      isDefault: true
    }
  ];

  // Predefined amounts for quick selection
  const quickAmounts = [500, 1000, 2000, 5000, 10000]; // In pence

  // Format currency function
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "£0.00";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  // Handle add money
  const handleAddMoney = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const amountInPence = Math.round(Number(amount) * 100); // Convert to pence
    const currentBalance = userData?.walletBalance || 0;
    const newBalance = currentBalance + amountInPence;

    // Update user data
    updateUserData({ ...userData, walletBalance: newBalance });
    
    // Reset and close modal
    setAmount("");
    setSelectedAmount(null);
    setShowAddMoneyModal(false);
    
    // In a real app, you would integrate with a payment gateway here
    console.log(`Adding ${formatCurrency(amountInPence)} to wallet`);
    
    // Show success message
    alert(`Successfully added ${formatCurrency(amountInPence)} to your wallet!`);
  };

  // Handle adding payment method
  const handleAddPaymentMethod = () => {
    // Validate card details
    if (!paymentMethod.cardNumber || paymentMethod.cardNumber.length < 16) {
      alert("Please enter a valid 16-digit card number");
      return;
    }
    if (!paymentMethod.expiryDate || !paymentMethod.expiryDate.includes("/")) {
      alert("Please enter expiry date in MM/YY format");
      return;
    }
    if (!paymentMethod.cvv || paymentMethod.cvv.length < 3) {
      alert("Please enter a valid CVV");
      return;
    }
    if (!paymentMethod.cardholderName) {
      alert("Please enter cardholder name");
      return;
    }

    // Extract last 4 digits
    const last4 = paymentMethod.cardNumber.slice(-4);
    const expiryParts = paymentMethod.expiryDate.split("/");
    const expiry = `${expiryParts[0]}/${expiryParts[1]}`;

    // In a real app, you would:
    // 1. Send to your backend
    // 2. Backend would tokenize with payment processor
    // 3. Store only the token and last 4 digits

    console.log("Adding payment method:", {
      last4,
      expiry,
      cardholderName: paymentMethod.cardholderName
    });

    // Reset form and close modal
    setPaymentMethod({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: ""
    });
    setShowAddPaymentModal(false);
    
    // Show success message
    alert("Payment method added successfully!");
  };

  // Handle quick amount selection
  const handleQuickAmountSelect = (amount) => {
    setAmount((amount / 100).toString());
    setSelectedAmount(amount);
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
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
              {/* Main Content */}
              <div className="lg:col-span-3">
                
                {/* Payments & Wallet Tab */}
                {activeTab === "Payments" && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-own-2 mb-6">Payments & Wallet</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Wallet Balance */}
                      <div className="p-6 bg-own-2 rounded-xl text-white">
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
                      </div>

                      {/* Payment Methods */}
                      <div className="p-6 border border-gray-200 rounded-xl text-black">
                        <h4 className="text-lg font-semibold mb-4">Payment Methods</h4>
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2">
                            <div>
                              <p className="font-semibold">Card ending in {method.last4}</p>
                              <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                            </div>
                            {method.isDefault && (
                              <span className="bg-own-2 text-white text-xs px-2 py-1 rounded-full">Default</span>
                            )}
                          </div>
                        ))}
                        <button 
                          onClick={() => setShowAddPaymentModal(true)}
                          className="w-full mt-4 py-2 border-2 border-dashed border-own-2 text-own-2 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          Add Payment Method
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
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
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Amount (£)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-3">Quick Select</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleQuickAmountSelect(amt)}
                      className={`py-2 rounded-lg border ${
                        selectedAmount === amt 
                          ? 'bg-own-2 text-white border-own-2' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 bg-amber-50 rounded-lg">
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
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMoney}
                  className="flex-1 py-3 bg-own-2 text-white rounded-lg hover:bg-own-1 transition-colors"
                  disabled={!amount || Number(amount) <= 0}
                >
                  Add Money
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
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
                    setPaymentMethod({
                      cardNumber: "",
                      expiryDate: "",
                      cvv: "",
                      cardholderName: ""
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentMethod.cardholderName}
                    onChange={(e) => setPaymentMethod({...paymentMethod, cardholderName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    value={paymentMethod.cardNumber}
                    onChange={(e) => setPaymentMethod({...paymentMethod, cardNumber: formatCardNumber(e.target.value)})}
                    maxLength="19"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={paymentMethod.expiryDate}
                      onChange={(e) => setPaymentMethod({...paymentMethod, expiryDate: formatExpiryDate(e.target.value)})}
                      maxLength="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-transparent"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      value={paymentMethod.cvv}
                      onChange={(e) => setPaymentMethod({...paymentMethod, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                      maxLength="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-own-2 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Note:</span> For demonstration purposes only. In a real application, 
                  card details would be securely tokenized with a payment processor.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddPaymentModal(false);
                    setPaymentMethod({
                      cardNumber: "",
                      expiryDate: "",
                      cvv: "",
                      cardholderName: ""
                    });
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="flex-1 py-3 bg-own-2 text-white rounded-lg hover:bg-own-1 transition-colors"
                >
                  Add Card
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}