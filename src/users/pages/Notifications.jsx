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
  Timestamp 
} from "firebase/firestore";

export default function Notifications() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
    setIsSidebarOpen(prev => !prev);
  };
  const [activeTab, setActiveTab] = useState("Notifications");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { userData, loading: userLoading } = useUserData();

  // Fetch user notifications from Firestore subcollection
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to fetch from notifications subcollection
        try {
          // Reference to the notifications subcollection under the user document
          const notificationsRef = collection(db, "users", user.uid, "notifications");
          const notificationsQuery = query(
            notificationsRef,
            orderBy("createdAt", "desc")
          );
          
          const querySnapshot = await getDocs(notificationsQuery);
          const fetchedNotifications = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convert createdAt to Date object
            let createdAtDate;
            if (data.createdAt) {
              // Check if createdAt is a Firestore Timestamp
              if (data.createdAt.toDate) {
                createdAtDate = data.createdAt.toDate();
              } 
              // Check if createdAt is a string (ISO format)
              else if (typeof data.createdAt === 'string') {
                createdAtDate = new Date(data.createdAt);
              }
              // Check if createdAt is a number (timestamp)
              else if (typeof data.createdAt === 'number') {
                createdAtDate = new Date(data.createdAt);
              }
              // If it's already a Date object
              else if (data.createdAt instanceof Date) {
                createdAtDate = data.createdAt;
              }
            } else {
              // Fallback to current date
              createdAtDate = new Date();
            }
            
            fetchedNotifications.push({ 
              id: doc.id, 
              ...data,
              createdAt: createdAtDate,
              time: formatTimeAgo(createdAtDate)
            });
          });
          
          setNotifications(fetchedNotifications);
          return; // Success, exit early
          
        } catch (collectionError) {
          
          // Fallback to notifications array in user document
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const userNotifications = data.notifications || [];
            
            // Format time for each notification
            const formattedNotifications = userNotifications.map(notification => {
              // Convert createdAt to Date object
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
              
              return {
                ...notification,
                createdAt: createdAtDate,
                time: formatTimeAgo(createdAtDate)
              };
            }).sort((a, b) => b.createdAt - a.createdAt); // Sort by date (newest first)
            
            setNotifications(formattedNotifications);
          }
        }
        
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      // Try to update in notifications subcollection first
      try {
        const notificationDocRef = doc(db, "users", user.uid, "notifications", notificationId);
        await updateDoc(notificationDocRef, {
          read: true,
          readAt: new Date().toISOString() // Store as ISO string
        });
        
      } catch (error) {

        
        // Update in user document array
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userNotifications = data.notifications || [];
          
          // Find and update the notification
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
    }
  };

  // Function to mark all as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const unreadNotifications = notifications.filter(notif => !notif.read);
      
      if (unreadNotifications.length === 0) return;
      
      // Try to update in notifications subcollection
      try {
        // Update each unread notification in subcollection
        const updatePromises = unreadNotifications.map(async (notif) => {
          const notificationDocRef = doc(db, "users", user.uid, "notifications", notif.id);
          await updateDoc(notificationDocRef, {
            read: true,
            readAt: new Date().toISOString()
          });
        });
        
        await Promise.all(updatePromises);
        
      } catch (error) {

        
        // Update in user document array
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userNotifications = data.notifications || [];
          
          // Mark all as read
          const updatedNotifications = userNotifications.map(notif => ({
            ...notif,
            read: true,
            readAt: notif.read ? notif.readAt : new Date().toISOString()
          }));
          
          await updateDoc(userDocRef, {
            notifications: updatedNotifications
          });
        }
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          read: true,
          readAt: notif.read ? notif.readAt : new Date().toISOString()
        }))
      );
      
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
    }
  };

  // Function to format time ago - FIXED to handle all date formats
  const formatTimeAgo = (dateInput) => {
    let date;
    
    // Handle different input types
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else if (dateInput?.toDate) {
      // Firestore Timestamp
      date = dateInput.toDate();
    } else {
      date = new Date();
    }
    
    // Check if date is valid
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
        return '📦';
      case 'payment':
        return '💰';
      case 'promotion':
        return '🎉';
      case 'system':
        return '⚙️';
      case 'delivery':
        return '🚚';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'welcome':
        return '👋';
      default:
        return '🔔';
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
      
    } catch (error) {
      console.error("Error clearing notifications:", error);
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

  const unreadCount = notifications.filter(notif => !notif.read).length;

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
                          {unreadCount > 0 && ` • ${unreadCount} unread`}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="px-4 py-2 text-sm bg-own-2 text-white rounded-xl hover:bg-amber-600 transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                      
                      {notifications.length > 0 && (
                        <button 
                          onClick={clearAllNotifications}
                          className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
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
                          className={`p-4 border border-gray-200 rounded-xl flex items-start gap-4 transition-all ${!notification.read ? 'bg-amber-50 border-amber-200' : 'hover:bg-gray-50'}`}
                        >
                          <div className="text-2xl mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">
                                  {notification.title || "Notification"}
                                </h4>
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
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                  {notification.time || formatTimeAgo(notification.createdAt)}
                                </span>
                                
                                {!notification.read && (
                                  <button 
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-sm text-own-2 hover:text-amber-600 font-medium"
                                  >
                                    Mark as read
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-sm text-gray-500 hover:text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">🔔</div>
                      <h4 className="text-xl font-semibold text-gray-700 mb-3">
                        No notifications yet
                      </h4>
                      <p className="text-gray-500 max-w-md mx-auto">
                        You're all caught up! When you have new orders, promotions, or account updates, they'll appear here.
                      </p>
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