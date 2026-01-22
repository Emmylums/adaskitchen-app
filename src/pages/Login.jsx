import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer"; 
import bg from "../assets/background.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope, faLock, faExclamationCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import CartTransferHandler from "../components/CartTransferHandler";

export default function Login() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Load remembered email on component mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem("userEmail");
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Validate form
        if (!formData.email || !formData.password) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            // 1. Login with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );
            
            const user = userCredential.user;
            
            // 2. Check if user exists in Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            let userRole = "customer"; // Default role
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // 3. Check if user is active
                if (userData.isActive === false) {
                    setError("Your account has been deactivated. Please contact support.");
                    setLoading(false);
                    return;
                }
                
                // 4. Get user role (default to "customer" if not specified)
                userRole = userData.role || "customer";
                
                // 5. Update last login timestamp in Firestore
                await updateDoc(userDocRef, {
                    lastLogin: new Date().toISOString()
                });
                
            } else {
                // This shouldn't happen for existing users, but handle it
                console.warn("User document not found in Firestore, creating one...");
                
                // Create basic user document with default customer role
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || "",
                    firstName: user.displayName?.split(" ")[0] || "",
                    lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
                    emailVerified: user.emailVerified,
                    isActive: true,
                    role: "customer", // Default role for new users
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
            }
            
            // 6. Store remember me preference
            if (rememberMe) {
                localStorage.setItem("userEmail", formData.email);
            } else {
                localStorage.removeItem("userEmail");
            }
            
            // 7. Determine redirect path based on role
            let redirectPath = "/user/dashboard";
            
            if (userRole === "admin" || userRole === "superadmin") {
                redirectPath = "/admin/dashboard";
                setSuccess("Admin login successful! Redirecting to admin dashboard...");
            } else if (userRole === "manager") {
                redirectPath = "/admin/dashboard";
                setSuccess("Manager login successful! Redirecting to admin dashboard...");
            } else if (userRole === "staff") {
                redirectPath = "/admin/orders";
                setSuccess("Staff login successful! Redirecting to admin panel...");
            } else {
                setSuccess("Login successful! Redirecting to dashboard...");
            }
            
            localStorage.setItem("userData",userDoc.data);
            // const urlParams = new URLSearchParams(window.location.search);
            // 8. Redirect based on role after a short delay
            setTimeout(() => {
                navigate(redirectPath);
            }, 1500);
            
        } catch (err) {
            console.error("Login error:", err);
            
            // Handle specific Firebase errors
            switch (err.code) {
                case "auth/invalid-email":
                    setError("Invalid email address format.");
                    break;
                case "auth/user-disabled":
                    setError("This account has been disabled. Please contact support.");
                    break;
                case "auth/user-not-found":
                    setError("No account found with this email. Please sign up first.");
                    break;
                case "auth/wrong-password":
                    setError("Incorrect password. Please try again.");
                    break;
                case "auth/too-many-requests":
                    setError("Too many failed login attempts. Please try again later or reset your password.");
                    break;
                case "auth/network-request-failed":
                    setError("Network error. Please check your internet connection.");
                    break;
                case "auth/invalid-credential":
                    setError("Invalid email or password.");
                    break;
                case "auth/user-mismatch":
                    setError("This credential belongs to a different user.");
                    break;
                case "auth/requires-recent-login":
                    setError("Please log in again to perform this action.");
                    break;
                case "auth/operation-not-allowed":
                    setError("Email/password login is not enabled. Please contact support.");
                    break;
                default:
                    setError(`Login failed: ${err.message || "Please try again."}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
    try {
        setError("");
        setSuccess("");
        setLoading(true);
        
        // 1. Create Google provider
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        // 2. Sign in with Google popup
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        
        let userRole = "customer"; // Default role for Google users
        
        // 3. Check if email already exists with different provider (Account Merge Check)
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        let existingUserWithDifferentUid = null;
        querySnapshot.forEach((doc) => {
            if (doc.id !== user.uid) {
                existingUserWithDifferentUid = {
                    id: doc.id,
                    data: doc.data()
                };
            }
        });
        
        // 4. If user exists with same email but different UID (different auth provider)
        if (existingUserWithDifferentUid) {
            const shouldMerge = window.confirm(
                `An account with email ${user.email} already exists. Would you like to merge this Google account with your existing account?`
            );
            
            if (shouldMerge) {
                // Merge accounts: Update existing document with Google provider info
                const existingUserRef = doc(db, "users", existingUserWithDifferentUid.id);
                
                await updateDoc(existingUserRef, {
                    // Link Google authentication
                    googleUid: user.uid,
                    photoURL: user.photoURL || existingUserWithDifferentUid.data.photoURL,
                    emailVerified: user.emailVerified,
                    provider: existingUserWithDifferentUid.data.provider ? 
                        [...existingUserWithDifferentUid.data.provider, "google"] : 
                        ["google"],
                    updatedAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
                
                // Store the actual user ID to use for navigation
                userRole = existingUserWithDifferentUid.data.role || "customer";
                
                // Navigate based on merged account role
                let redirectPath = "/user/dashboard";
                if (userRole === "admin" || userRole === "superadmin") {
                    redirectPath = "/admin/dashboard";
                } else if (userRole === "manager") {
                    redirectPath = "/admin/dashboard";
                } else if (userRole === "staff") {
                    redirectPath = "/admin/orders";
                }
                
                setSuccess("Accounts merged successfully! Redirecting..."); 
                localStorage.setItem("userData",userDoc.data);
                setTimeout(() => {
                    navigate(redirectPath);
                }, 1500);
                return;
            } else {
                // User chose not to merge, sign them out
                await auth.signOut();
                setError("Please use your existing login method or create a new account with a different email.");
                setLoading(false);
                return;
            }
        }
        
        // 5. Check if user exists in Firestore with current UID
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            // 6. Extract first and last name from Google display name
            const firstName = user.displayName?.split(" ")[0] || "";
            const lastName = user.displayName?.split(" ").slice(1).join(" ") || "";
            
            // 7. Create COMPLETE user document matching signup page structure
            const userData = {
                // Basic Info (same as signup)
                uid: user.uid,
                firstName: firstName,
                lastName: lastName,
                email: user.email,
                phone: "", // Google doesn't provide phone
                displayName: user.displayName || `${firstName} ${lastName}`,
                
                // Auth & Verification
                emailVerified: user.emailVerified,
                isActive: true,
                role: "customer",
                
                // Profile
                photoURL: user.photoURL || "",
                provider: ["google"], // Track signup method as array for multiple providers
                
                // Contact Preferences (same as signup)
                contactPreferences: {
                    email: true,
                    sms: false, // No phone number from Google
                    push: true
                },
                
                // Newsletter Subscription
                subscribeNewsletter: true, // Default to true for Google users
                
                // Notifications Settings (same as signup)
                notifications: {
                    orderUpdates: true,
                    promotions: true,
                    newItems: true,
                    priceDrops: true,
                    orderReminders: true,
                    deliveryStatus: true,
                    marketingEmails: true
                },
                
                // Addresses (Empty array to start - same as signup)
                addresses: [],
                defaultAddressId: null,
                
                // Favorites (same as signup)
                favorites: [],
                
                // Orders and Cart (same as signup)
                cart: [],
                orderHistory: [],
                
                // Timestamps (same as signup)
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                lastOrderDate: null,
                
                // Statistics (same as signup)
                stats: {
                    totalOrders: 0,
                    totalSpent: 0,
                    averageOrderValue: 0
                }
            };

            // 8. Save complete user document
            await setDoc(userDocRef, userData);
            
            // 9. Create welcome notification for new users
            const notificationId = `welcome_${Date.now()}`;
            const notificationRef = doc(db, "users", user.uid, "notifications", notificationId);
            
            await setDoc(notificationRef, {
                id: notificationId,
                type: "welcome",
                title: "Welcome to Ada's Kitchen!",
                message: "Thank you for joining with Google. Start exploring delicious meals!",
                read: false,
                createdAt: new Date().toISOString(),
                actionUrl: "/menu"
            });
            
            setSuccess("Welcome! Your account has been created with Google. Redirecting..."); 
            localStorage.setItem("userData",userData);
            
            // 10. Check if phone is empty and redirect to profile completion
            setTimeout(() => {
                navigate("/complete-profile?source=google");
            }, 1500);
            return; // Don't continue to regular redirect
            
        } else {
            // 11. Get existing user data
            const userData = userDoc.data();
            userRole = userData.role || "customer";
            
            // 12. Sync Profile Updates from Google
            const profileUpdates = {};
            
            // Check if Google profile has newer/better information
            if (user.displayName && user.displayName !== userData.displayName) {
                profileUpdates.displayName = user.displayName;
                
                // Update first and last name if they're empty or different
                const firstName = user.displayName.split(" ")[0];
                const lastName = user.displayName.split(" ").slice(1).join(" ");
                
                if (!userData.firstName || firstName !== userData.firstName) {
                    profileUpdates.firstName = firstName;
                }
                if (!userData.lastName || lastName !== userData.lastName) {
                    profileUpdates.lastName = lastName;
                }
            }
            
            if (user.photoURL && user.photoURL !== userData.photoURL) {
                profileUpdates.photoURL = user.photoURL;
            }
            
            if (user.emailVerified && !userData.emailVerified) {
                profileUpdates.emailVerified = true;
            }
            
            // Add Google to providers array if not already there
            let providers = userData.provider || [];
            if (!providers.includes("google")) {
                providers = [...providers, "google"];
                profileUpdates.provider = providers;
            }
            
            // 13. Update last login and any profile updates
            if (Object.keys(profileUpdates).length > 0) {
                profileUpdates.updatedAt = new Date().toISOString();
            }
            
            profileUpdates.lastLogin = new Date().toISOString();
            
            await updateDoc(userDocRef, profileUpdates);
            
            // 14. Check if phone is empty for existing users
            if (!userData.phone || userData.phone.trim() === "") {
                setTimeout(() => {
                    navigate("/complete-profile?source=google&existing=true");
                }, 1500);
                setSuccess("Google login successful! Please complete your profile...");
                return;
            }
             

            localStorage.setItem("userData",userData);
            
            setSuccess("Google login successful! Redirecting...");
        }
        
        // 15. Check if user is active (for both new and existing users)
        const currentUserDoc = await getDoc(userDocRef);
        if (currentUserDoc.exists()) {
            const userData = currentUserDoc.data();
            
            if (userData.isActive === false) {
                setError("Your account has been deactivated. Please contact support.");
                setLoading(false);
                // Sign out since account is deactivated
                await auth.signOut();
                return;
            }
        }
        
        // 16. Determine redirect path based on role
        let redirectPath = "/user/dashboard";
        
        if (userRole === "admin" || userRole === "superadmin") {
            redirectPath = "/admin/dashboard";
        } else if (userRole === "manager") {
            redirectPath = "/admin/dashboard";
        } else if (userRole === "staff") {
            redirectPath = "/admin/orders";
        }
        
        // 17. Redirect to appropriate dashboard
        setTimeout(() => {
            navigate(redirectPath);
        }, 1500);
        
    } catch (err) {
        console.error("Google login error:", err);
        
        // Handle specific Google login errors
        switch (err.code) {
            case "auth/popup-closed-by-user":
                setError("Google login was cancelled. Please try again.");
                break;
            case "auth/popup-blocked":
                setError("Popup was blocked by your browser. Please allow popups for this site.");
                break;
            case "auth/unauthorized-domain":
                setError("This domain is not authorized for Google login. Please contact support.");
                break;
            case "auth/operation-not-allowed":
                setError("Google login is not enabled. Please contact support.");
                break;
            case "auth/network-request-failed":
                setError("Network error. Please check your internet connection.");
                break;
            case "auth/cancelled-popup-request":
                setError("Another login popup is already open. Please close it and try again.");
                break;
            case "auth/user-disabled":
                setError("This account has been disabled. Please contact support.");
                break;
            default:
                setError(`Google login failed: ${err.message || "Please try again."}`);
        }
    } finally {
        setLoading(false);
    }
};

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <NavBar activeLink="Login" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
            <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Login" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
            
            {/* Hero Section */}
            <section style={{ backgroundImage: `url(${bg})` }} className="relative h-[40vh] bg-center bg-cover">
                <div className="absolute inset-0 h-[40vh] opacity-70 bg-black" />
                <div className="relative flex items-center justify-center h-full">
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                        <div className="p-10 text-center text-white mt-10">
                            <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg text-nowrap">Welcome Back</h2>
                            <p className="text-lg mt-2">Sign in to your Ada's Kitchen account</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Login Form Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-8"
                    >
                        <h2 className="text-3xl font-bold text-center text-own-2 mb-8 font-display2">
                            Sign In
                        </h2>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-pulse">
                                <div className="flex items-start">
                                    <FontAwesomeIcon 
                                        icon={faExclamationCircle} 
                                        className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" 
                                    />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <div className="flex items-start">
                                    <FontAwesomeIcon 
                                        icon={faCheckCircle} 
                                        className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" 
                                    />
                                    <div>
                                        <p className="text-sm text-green-700 font-medium">{success}</p>
                                        {loading && (
                                            <div className="mt-2 flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>
                                                <span className="text-xs text-green-600">Redirecting...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black transition-all duration-200"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="mb-6">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black transition-all duration-200"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50 transition-colors"
                                        onClick={togglePasswordVisibility}
                                        disabled={loading}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <FontAwesomeIcon 
                                            icon={showPassword ? faEyeSlash : faEye} 
                                            className="h-5 w-5 text-gray-400 hover:text-own-2" 
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={loading}
                                        className="h-4 w-4 text-own-2 focus:ring-own-2 border-gray-300 rounded disabled:opacity-50 transition-colors"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <Link 
                                    to="/forgot-password" 
                                    className="text-sm text-own-2 hover:text-amber-600 transition-colors disabled:opacity-50"
                                    onClick={(e) => {
                                        if (loading) e.preventDefault();
                                    }}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all duration-300 transform hover:scale-[1.02] ${loading ? 'bg-amber-400 cursor-not-allowed' : 'bg-own-2 hover:bg-amber-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-own-2 active:scale-95`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        {/* Social Login Divider */}
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className={`w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} text-gray-700 active:scale-95`}
                                >
                                    <FontAwesomeIcon 
                                        icon={faGoogle} 
                                        className="h-5 w-5 mr-3" 
                                        style={{ color: "#DB4437" }}
                                    />
                                    {loading ? "Please wait..." : "Sign in with Google"}
                                </button>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link 
                                    to="/signup" 
                                    className={`font-medium text-own-2 hover:text-amber-600 transition-colors ${loading ? 'pointer-events-none opacity-50' : ''}`}
                                >
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-own-2 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 font-display2">
                        Benefits of Your Account
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🚚</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Quick Reordering</h3>
                            <p className="text-gray-100">Access your order history and reorder favorites with one click</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💳</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Saved Payments</h3>
                            <p className="text-gray-100">Securely save payment methods for faster checkout</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🎁</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Exclusive Offers</h3>
                            <p className="text-gray-100">Get member-only discounts and early access to promotions</p>
                        </motion.div>
                    </div>
                </div>
            </section>
            <CartTransferHandler/>
            <Footer/>
        </>
    );
}