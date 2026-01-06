import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export const useUserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData;
        if (userDoc.exists()) {
          const data = userDoc.data();
          userData = {
            ...data,
            uid: user.uid,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || user.email,
            phone: data.phone || "",
            displayName: data.displayName || user.displayName || "User",
            walletBalance: data.walletBalance || 0
          };
        } else {
          userData = {
            uid: user.uid,
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
            email: user.email,
            phone: "",
            displayName: user.displayName || "User",
            walletBalance: 0
          };
        }
        
        setUserData(userData);
        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  return { userData, loading, error };
};