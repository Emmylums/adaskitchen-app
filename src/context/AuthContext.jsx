import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification as firebaseSendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Signup with email and password
  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  // Send email verification - FIXED
  const sendEmailVerification = async (user) => {
    try {
      // Get the current origin
      const currentOrigin = window.location.origin;
      const actionUrl = `${currentOrigin}/verify-email`;
      
      console.log("📧 Sending verification email to:", user.email);
      console.log("🔗 Using action URL:", actionUrl);
      
      await firebaseSendEmailVerification(user, {
        url: actionUrl,
        handleCodeInApp: true
      });
      
      console.log("✅ Verification email sent successfully");
      return true;
    } catch (error) {
      console.error("❌ Error sending verification email:", error);
      throw error;
    }
  };

  // Login with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return signInWithPopup(auth, provider);
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log("✅ User signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Reset password - FIXED
  const resetPassword = (email) => {
    const actionUrl = `${window.location.origin}/verify-email`;
    console.log("🔐 Sending password reset email to:", email);
    console.log("🔗 Using action URL:", actionUrl);
    
    return sendPasswordResetEmail(auth, email, {
      url: actionUrl,
      handleCodeInApp: true
    });
  };

  // Update user profile
  const updateUserProfile = (profile) => {
    return updateProfile(auth.currentUser, profile);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    signInWithGoogle,
    sendEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};