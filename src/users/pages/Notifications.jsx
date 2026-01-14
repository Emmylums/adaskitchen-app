import React, { useState, useEffect } from "react";
import UserNavBar from "../components/UserNavbar";
import UserSideBar from "../components/UserSidebar";
import { useUserData } from "../hooks/useUserData";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheck,
  faTrash,
  faBell,
  faShoppingBag,
  faCreditCard,
  faMapMarkerAlt,
  faUser,
  faLock,
  faExclamationTriangle,
  faGift,
  faTruck,
  faHome,
  faClock
} from "@fortawesome/free-solid-svg-icons";

export default function Notifications() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Notifications");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { user } = useAuth();
  const { userData, loading: userLoading } = useUserData();

  // Fetch user notifications from Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAllNotifications = async () => {
      try {
        setLoading(true);
        const allNotifications = [];
        
        // 1. Try to fetch from notifications subcollection
        try {
          const notificationsRef = collection(db, "users", user.uid, "notifications");
          const notificationsQuery = query(
            notificationsRef,
            orderBy("createdAt", "desc")
          );
          
          const querySnapshot = await getDocs(notificationsQuery);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            let createdAtDate;
            
            if (data.createdAt) {
              if (data.createdAt.toDate) {
                createdAtDate = data.createdAt.toDate();
              } else if (typeof data.createdAt === 'string') {
                createdAtDate = new Date(data.createdAt);
              } else if (typeof data.createdAt === 'number') {
                createdAtDate = new Date(data.createdAt);
              } else if (data.createdAt instanceof Date) {
                createdAtDate = data.createdAt;
              }
            } else {
              createdAtDate = new Date();
            }
            
            allNotifications.push({ 
              id: doc.id, 
              ...data,
              createdAt: createdAtDate,
              time: formatTimeAgo(createdAtDate),
              source: 'subcollection'
            });
          });
          
        } catch (collectionError) {
          console.log("Subcollection not available:", collectionError);
        }
        
        // 2. Also fetch from user document array (for backward compatibility)
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const userNotifications = data.notifications || [];
            
            userNotifications.forEach(notification => {
              let createdAtDate;
              
              if (notification.createdAt) {
                if (typeof notification.createdAt === 'string') {
                  createdAtDate = new Date(notification.createdAt);
                } else if (typeof notification.createdAt === 'number') {
                  createdAtDate = new Date(notification.createdAt);
                } else if (notification.createdAt instanceof Date) {
                  createdAtDate = notification.createdAt;
                } else if (notification.createdAt.toDate) {
                  createdAtDate = notification.createdAt.toDate();
                } else {
                  createdAtDate = new Date();
                }
              } else {
                createdAtDate = new Date();
              }
              
              // Only add if not already in allNotifications (avoid duplicates)
              const exists = allNotifications.some(n => n.id === notification.id);
              if (!exists) {
                allNotifications.push({
                  ...notification,
                  createdAt: createdAtDate,
                  time: formatTimeAgo(createdAtDate),
                  source: 'user-doc'
                });
              }
            });
          }
        } catch (userDocError) {
          console.log("Error fetching user doc notifications:", userDocError);
        }
        
        // Sort all notifications by date (newest first)
        const sortedNotifications = allNotifications.sort((a, b) => 
          b.createdAt - a.createdAt
        );
        
        setNotifications(sortedNotifications);
        
        // Calculate unread count
        const unread = sortedNotifications.filter(notif => !notif.read).length;
        setUnreadCount(unread);
        
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNotifications();

    // Set up real-time listener for new notifications
    if (user) {
      const notificationsRef = collection(db, "users", user.uid, "notifications");
      const notificationsQuery = query(
        notificationsRef,
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const newNotifications = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          let createdAtDate;
          
          if (data.createdAt) {
            if (data.createdAt.toDate) {
              createdAtDate = data.createdAt.toDate();
            } else if (typeof data.createdAt === 'string') {
              createdAtDate = new Date(data.createdAt);
            } else if (typeof data.createdAt === 'number') {
              createdAtDate = new Date(data.createdAt);
            } else if (data.createdAt instanceof Date) {
              createdAtDate = data.createdAt;
            }
          } else {
            createdAtDate = new Date();
          }
          
          newNotifications.push({ 
            id: doc.id, 
            ...data,
            createdAt: createdAtDate,
            time: formatTimeAgo(createdAtDate),
            source: 'subcollection'
          });
        });
        
        // Merge with existing notifications
        setNotifications(prev => {
          const merged = [...newNotifications];
          prev.forEach(prevNotif => {
            if (!merged.some(n => n.id === prevNotif.id)) {
              merged.push(prevNotif);
            }
          });
          return merged.sort((a, b) => b.createdAt - a.createdAt);
        });
        
        // Update unread count
        const unread = newNotifications.filter(notif => !notif.read).length;
        setUnreadCount(prev => prev + unread);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // Update in notifications subcollection
      try {
        const notificationDocRef = doc(db, "users", user.uid, "notifications", notificationId);
        await updateDoc(notificationDocRef, {
          read: true,
          readAt: new Date().toISOString()
        });
      } catch (error) {
        // Fallback to user document array
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userNotifications = data.notifications || [];
          
          const updatedNotifications = userNotifications.map(notif => 
            notif.id === notificationId ? { 
              ...notif, 
              read: true,
              readAt: new Date().toISOString()
            } : notif
          );
          
          await updateDoc(userDocRef, {
            notifications: updatedNotifications
          });
        }
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { 
            ...notif, 
            read: true,
            readAt: new Date().toISOString()
          } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Fallback: update local state only
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { 
            ...notif, 
            read: true,
            readAt: new Date().toISOString()
          } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Function to mark all as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const unreadNotifications = notifications.filter(notif => !notif.read);
      
      if (unreadNotifications.length === 0) return;
      
      // Update each unread notification
      const updatePromises = unreadNotifications.map(async (notif) => {
        try {
          const notificationDocRef = doc(db, "users", user.uid, "notifications", notif.id);
          await updateDoc(notificationDocRef, {
            read: true,
            readAt: new Date().toISOString()
          });
        } catch (error) {
          // Fallback not needed here since we're updating all
        }
      });
      
      await Promise.all(updatePromises);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          read: true,
          readAt: notif.read ? notif.readAt : new Date().toISOString()
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
    } catch (error) {
      console.error("Error marking all as read:", error);
      // Fallback: update local state only
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          read: true,
          readAt: notif.read ? notif.readAt : new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    }
  };

  // Function to format time ago
  const formatTimeAgo = (dateInput) => {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else if (dateInput?.toDate) {
      date = dateInput.toDate();
    } else {
      date = new Date();
    }
    
    if (isNaN(date.getTime())) {
      return "Recently";
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    }
    
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  };

  // Function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <FontAwesomeIcon icon={faShoppingBag} className="text-own-2" />;
      case 'payment':
        return <FontAwesomeIcon icon={faCreditCard} className="text-green-500" />;
      case 'promotion':
        return <FontAwesomeIcon icon={faGift} className="text-purple-500" />;
      case 'system':
        return <FontAwesomeIcon icon={faBell} className="text-blue-500" />;
      case 'delivery':
        return <FontAwesomeIcon icon={faTruck} className="text-orange-500" />;
      case 'warning':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />;
      case 'success':
        return <FontAwesomeIcon icon={faCheck} className="text-green-500" />;
      case 'welcome':
        return <FontAwesomeIcon icon={faHome} className="text-own-2" />;
      case 'address':
        return <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />;
      case 'wallet':
        return <FontAwesomeIcon icon={faCreditCard} className="text-green-500" />;
      case 'security':
        return <FontAwesomeIcon icon={faLock} className="text-red-500" />;
      case 'profile':
        return <FontAwesomeIcon icon={faUser} className="text-gray-500" />;
      default:
        return <FontAwesomeIcon icon={faBell} className="text-gray-400" />;
    }
  };

  // Function to delete notification
  const deleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }
    
    try {
      // Try to delete from subcollection
      try {
        // Note: In a real app, you would delete from Firestore
        // For now, we'll just update local state
      } catch (error) {
        // Silently fail
      }
      
      // Check if notification was unread to update count
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Function to clear all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) {
      return;
    }
    
    try {
      // In a real app, you would delete from Firestore
      // For now, just update local state
      setNotifications([]);
      setUnreadCount(0);
      
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Function to get notification background color based on type
  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-amber-50';
      case 'payment':
        return 'bg-green-50';
      case 'promotion':
        return 'bg-purple-50';
      case 'warning':
        return 'bg-red-50';
      case 'success':
        return 'bg-green-50';
      case 'security':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
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
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-own-2">Notifications</h3>
                      {notifications.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                          {unreadCount > 0 && (
                            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              {unreadCount} unread
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="px-4 py-2 text-sm bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                          Mark all as read
                        </button>
                      )}
                      
                      {notifications.length > 0 && (
                        <button 
                          onClick={clearAllNotifications}
                          className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border border-gray-200 rounded-xl flex items-start gap-4 transition-all ${
                            !notification.read ? 'bg-amber-50 border-amber-200' : getNotificationBgColor(notification.type)
                          }`}
                        >
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-800">
                                    {notification.title || "Notification"}
                                  </h4>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-own-2 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-gray-600 mt-1">
                                  {notification.message || notification.description}
                                </p>
                                
                                {notification.orderId && (
                                  <p className="text-sm text-own-2 mt-2">
                                    Order: {notification.orderId}
                                  </p>
                                )}
                                
                                {notification.amount && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    Amount: £{(notification.amount / 100).toFixed(2)}
                                  </p>
                                )}
                                
                                {notification.orderNumber && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    Order #: {notification.orderNumber}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                  {notification.time || formatTimeAgo(notification.createdAt)}
                                </span>
                                
                                <div className="flex gap-2">
                                  {!notification.read && (
                                    <button 
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-sm text-own-2 hover:text-amber-600 font-medium flex items-center gap-1"
                                    >
                                      <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                      Mark read
                                    </button>
                                  )}
                                  
                                  <button 
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">
                        <FontAwesomeIcon icon={faBell} className="text-gray-300" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-700 mb-3">
                        No notifications yet
                      </h4>
                      <p className="text-gray-500 max-w-md mx-auto">
                        You're all caught up! When you have new orders, promotions, or account updates, they'll appear here.
                      </p>
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Types of notifications you'll receive:</span>
                        </p>
                        <ul className="text-sm text-gray-500 mt-2 space-y-1">
                          <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faShoppingBag} className="text-own-2 text-xs" />
                            Order confirmations and updates
                          </li>
                          <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCreditCard} className="text-green-500 text-xs" />
                            Payment successes and failures
                          </li>
                          <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 text-xs" />
                            Address changes
                          </li>
                          <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faGift} className="text-purple-500 text-xs" />
                            Promotions and offers
                          </li>
                        </ul>
                      </div>
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