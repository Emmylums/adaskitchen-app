import { db } from "../../firebaseConfig";
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Create a notification for a user and store it in Firestore
 * @param {string} userId - User ID
 * @param {object} notification - Notification data
 * @returns {Promise<boolean>} Success status
 */
export const createNotification = async (userId, notification) => {
  if (!userId) {
    console.error("User ID is required to create notification");
    return false;
  }

  try {
    const notificationData = {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Option 1: Try to add to notifications subcollection (preferred)
    try {
      await addDoc(collection(db, "users", userId, "notifications"), notificationData);
      console.log("Notification added to subcollection:", notification.title);
    } catch (subcollectionError) {
      console.log("Subcollection not available, using user document array");
      
      // Option 2: Add to notifications array in user document
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const currentNotifications = data.notifications || [];
        
        const notificationWithId = {
          ...notificationData,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        
        await updateDoc(userDocRef, {
          notifications: [...currentNotifications, notificationWithId],
          updatedAt: new Date().toISOString()
        });
        
        console.log("Notification added to user document array:", notification.title);
      } else {
        console.error("User document not found");
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};

/**
 * Common notification templates for consistent messaging
 */
export const NotificationTemplates = {
  // Order notifications
  ORDER_CONFIRMED: (orderNumber, amount) => ({
    title: "🎉 Order Confirmed!",
    message: `Your order #${orderNumber} has been confirmed and is being prepared. Total: £${(amount/100).toFixed(2)}`,
    type: "order",
    orderId: orderNumber,
    amount: amount
  }),
  
  ORDER_PREPARING: (orderNumber) => ({
    title: "👨‍🍳 Order Being Prepared",
    message: `Your order #${orderNumber} is now being prepared in the kitchen.`,
    type: "order",
    orderId: orderNumber
  }),
  
  ORDER_OUT_FOR_DELIVERY: (orderNumber) => ({
    title: "🚚 Order Out for Delivery",
    message: `Your order #${orderNumber} is on its way! Estimated delivery: 30-45 minutes.`,
    type: "delivery",
    orderId: orderNumber
  }),
  
  ORDER_DELIVERED: (orderNumber) => ({
    title: "✅ Order Delivered",
    message: `Your order #${orderNumber} has been delivered. Enjoy your meal!`,
    type: "delivery",
    orderId: orderNumber
  }),
  
  // Payment notifications
  PAYMENT_SUCCESS: (amount, method) => ({
    title: "💰 Payment Successful",
    message: `Payment of £${(amount/100).toFixed(2)} via ${method} was completed successfully.`,
    type: "payment",
    amount: amount
  }),
  
  PAYMENT_FAILED: (amount, reason = "Payment failed") => ({
    title: "❌ Payment Failed",
    message: `Payment of £${(amount/100).toFixed(2)} failed. Reason: ${reason}`,
    type: "payment",
    amount: amount
  }),
  
  WALLET_TOPUP: (amount, newBalance) => ({
    title: "💳 Wallet Topped Up",
    message: `£${(amount/100).toFixed(2)} added to your wallet. New balance: £${(newBalance/100).toFixed(2)}`,
    type: "wallet",
    amount: amount
  }),
  
  WALLET_USED: (amount, newBalance, orderNumber) => ({
    title: "💸 Wallet Used",
    message: `£${(amount/100).toFixed(2)} deducted from wallet for order #${orderNumber}. New balance: £${(newBalance/100).toFixed(2)}`,
    type: "wallet",
    amount: amount,
    orderId: orderNumber
  }),
  
  // Address notifications
  ADDRESS_ADDED: (addressName) => ({
    title: "📍 Address Added",
    message: `"${addressName}" has been added to your saved addresses.`,
    type: "address"
  }),
  
  ADDRESS_UPDATED: (addressName) => ({
    title: "✏️ Address Updated",
    message: `"${addressName}" has been updated successfully.`,
    type: "address"
  }),
  
  ADDRESS_DELETED: (addressName) => ({
    title: "🗑️ Address Removed",
    message: `"${addressName}" has been removed from your addresses.`,
    type: "address"
  }),
  
  DEFAULT_ADDRESS_CHANGED: (addressName) => ({
    title: "⭐ Default Address Changed",
    message: `"${addressName}" is now your default delivery address.`,
    type: "address"
  }),
  
  // Card notifications
  CARD_ADDED: (last4, brand) => ({
    title: "💳 Card Added",
    message: `${brand.toUpperCase()} card ending in ${last4} has been added to your account.`,
    type: "payment"
  }),
  
  CARD_REMOVED: (last4, brand) => ({
    title: "🗑️ Card Removed",
    message: `${brand.toUpperCase()} card ending in ${last4} has been removed from your account.`,
    type: "payment"
  }),
  
  DEFAULT_CARD_CHANGED: (last4, brand) => ({
    title: "⭐ Default Card Changed",
    message: `${brand.toUpperCase()} card ending in ${last4} is now your default payment method.`,
    type: "payment"
  }),
  
  // Security notifications
  PASSWORD_CHANGED: () => ({
    title: "🔒 Password Changed",
    message: "Your password has been updated successfully.",
    type: "security"
  }),
  
  PROFILE_UPDATED: () => ({
    title: "👤 Profile Updated",
    message: "Your profile information has been updated successfully.",
    type: "profile"
  }),
  
  // System notifications
  WELCOME: (firstName) => ({
    title: "👋 Welcome to FoodDeliver!",
    message: `Hi ${firstName}! Welcome to our food delivery service. Enjoy your first order!`,
    type: "welcome"
  }),
  
  PROMOTION: (title, description) => ({
    title: `🎉 ${title}`,
    message: description,
    type: "promotion"
  })
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  // Implementation for marking notifications as read
  // This would be used in the Notifications.jsx component
  return true;
};