import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faEyeSlash, 
  faEnvelope, 
  faLock, 
  faUser, 
  faPhone, 
  faExclamationTriangle,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext"; 
import bg from "../assets/background.jpeg";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { updateProfile, signOut, sendEmailVerification as firebaseSendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function SignUp() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null); // null, "verify", or "completed"
    
    const { signup, signInWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
        subscribeNewsletter: true,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(null);

        // Validation
        if (!formData.acceptTerms) {
            return setError("You must accept the Terms and Conditions");
        }

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        if (formData.password.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        try {
            setLoading(true);
            
            // 1. Create user with Firebase Authentication
            const userCredential = await signup(formData.email, formData.password);
            const firebaseUser = userCredential.user;
            
            // 2. Update user profile with display name
            await updateProfile(firebaseUser, {
                displayName: `${formData.firstName} ${formData.lastName}`
            });

            // 3. Send email verification with proper URL
            const actionUrl = `${window.location.origin}/verify-email`;
            console.log("Sending verification email to:", firebaseUser.email, "with URL:", actionUrl);
            
            await firebaseSendEmailVerification(firebaseUser, {
                url: actionUrl,
                handleCodeInApp: true
            });

            // 4. Create user document in Firestore
            const userRef = doc(db, "users", firebaseUser.uid);
            
            const userData = {
                // Basic Info
                uid: firebaseUser.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                displayName: `${formData.firstName} ${formData.lastName}`,
                
                // Auth & Verification
                emailVerified: false,
                isActive: true,
                role: "customer",
                
                // Profile
                photoURL: "",
                
                // Contact Preferences
                contactPreferences: {
                    email: true,
                    sms: true,
                    push: true
                },
                
                // Newsletter Subscription
                subscribeNewsletter: formData.subscribeNewsletter,
                
                // Notifications Settings
                notifications: {
                    orderUpdates: true,
                    promotions: true,
                    newItems: true,
                    priceDrops: true,
                    orderReminders: true,
                    deliveryStatus: true,
                    marketingEmails: formData.subscribeNewsletter
                },
                
                // Addresses
                addresses: [],
                defaultAddressId: null,
                
                // Favorites
                favorites: [],
                
                // Orders and Cart
                cart: [],
                orderHistory: [],
                
                // Timestamps
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLogin: null,
                lastOrderDate: null,
                
                // Statistics
                stats: {
                    totalOrders: 0,
                    totalSpent: 0,
                    averageOrderValue: 0
                }
            };

            await setDoc(userRef, userData);

            // 5. Create verification notification
            const notificationId = `verify_${Date.now()}`;
            const notificationRef = doc(db, "users", firebaseUser.uid, "notifications", notificationId);
            
            await setDoc(notificationRef, {
                id: notificationId,
                type: "verification",
                title: "Verify Your Email",
                message: `Please check your email (${formData.email}) to verify your account. You must verify before logging in.`,
                read: false,
                createdAt: new Date().toISOString(),
                actionUrl: "/login",
                isUrgent: true
            });

            // 6. Sign out the user immediately after signup
            await signOut(auth);
            
            // 7. Set success state to "verify" to show verification message
            setSuccess("verify");
            
        } catch (err) {
            console.error("Signup error:", err);
            
            // Handle specific Firebase errors
            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("Email is already registered. Please login instead.");
                    break;
                case "auth/invalid-email":
                    setError("Invalid email address.");
                    break;
                case "auth/weak-password":
                    setError("Password is too weak. Please use a stronger password.");
                    break;
                case "auth/network-request-failed":
                    setError("Network error. Please check your connection.");
                    break;
                case "permission-denied":
                    setError("Database permission denied. Please check your security rules.");
                    break;
                case "auth/too-many-requests":
                    setError("Too many requests. Please try again later.");
                    break;
                default:
                    setError(`Signup failed: ${err.message || "Unknown error"}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setError("");
            setLoading(true);
            setSuccess(null);
            
            const userCredential = await signInWithGoogle();
            const firebaseUser = userCredential.user;
            
            // Check if user already exists in Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            
            if (!userDoc.exists()) {
                // Create user document for new Google signups
                const userRef = doc(db, "users", firebaseUser.uid);
                await setDoc(userRef, {
                    uid: firebaseUser.uid,
                    firstName: firebaseUser.displayName?.split(" ")[0] || "",
                    lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
                    email: firebaseUser.email,
                    phone: "",
                    displayName: firebaseUser.displayName || "",
                    emailVerified: true,
                    isActive: true,
                    role: "customer",
                    photoURL: firebaseUser.photoURL || "",
                    contactPreferences: {
                        email: true,
                        sms: false,
                        push: true
                    },
                    subscribeNewsletter: true,
                    notifications: {
                        orderUpdates: true,
                        promotions: true,
                        newItems: true,
                        priceDrops: true,
                        orderReminders: true,
                        deliveryStatus: true,
                        marketingEmails: true
                    },
                    addresses: [],
                    defaultAddressId: null,
                    favorites: [],
                    cart: [],
                    orderHistory: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    lastOrderDate: null,
                    stats: {
                        totalOrders: 0,
                        totalSpent: 0,
                        averageOrderValue: 0
                    }
                });

                // Add welcome notification
                const notificationId = `welcome_${Date.now()}`;
                const notificationRef = doc(db, "users", firebaseUser.uid, "notifications", notificationId);
                
                await setDoc(notificationRef, {
                    id: notificationId,
                    type: "welcome",
                    title: "Welcome to Ada's Kitchen!",
                    message: "Thank you for joining with Google. Start exploring delicious meals!",
                    read: false,
                    createdAt: new Date().toISOString(),
                    actionUrl: "/menu"
                });
            }
            
            // Navigate to dashboard for Google signup
            setSuccess("completed");
            setTimeout(() => {
                navigate("/user/dashboard");
            }, 1500);
            
        } catch (err) {
            console.error("Google signup error:", err);
            setError(`Google signup failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // If user is already logged in and verified, redirect to dashboard
    useEffect(() => {
        if (user && user.emailVerified) {
            navigate("/user/dashboard");
        }
    }, [user, navigate]);

    const handleResendVerification = async () => {
        if (!user) {
            setError("Please sign in first to resend verification email.");
            return;
        }
        
        try {
            setLoading(true);
            const actionUrl = `${window.location.origin}/verify-email`;
            await firebaseSendEmailVerification(user, {
                url: actionUrl,
                handleCodeInApp: true
            });
            setSuccess("verify");
            setError("");
        } catch (err) {
            setError(`Failed to resend verification: ${err.message}`);
        } finally {
            setLoading(false);
        }
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
                            <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg">Join Ada's Kitchen</h2>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Sign Up Form Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-8"
                    >
                        <h2 className="text-3xl font-bold text-center text-own-2 mb-8 font-display2">
                            Create Account
                        </h2>

                        {/* Email Verification Success Message */}
                        {success === "verify" && (
                            <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon 
                                        icon={faEnvelope} 
                                        className="w-8 h-8 text-blue-600" 
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-blue-700 mb-3 text-center">
                                    Check Your Email to Verify!
                                </h3>
                                <div className="space-y-3 text-center">
                                    <p className="text-blue-600">
                                        We've sent a verification email to: <br/>
                                        <span className="font-semibold text-lg">{formData.email}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Please check your inbox and click the verification link to activate your account.
                                    </p>
                                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mt-4">
                                        <div className="flex items-start">
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-700 mb-2">
                                                    Important Verification Instructions:
                                                </p>
                                                <ul className="text-xs text-yellow-600 space-y-1">
                                                    <li>• Click the verification link in the email sent to {formData.email}</li>
                                                    <li>• Check your spam/junk folder if you don't see the email</li>
                                                    <li>• The verification link expires in 24 hours</li>
                                                    <li>• You must verify your email before you can log in</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-3">
                                        <Link 
                                            to="/login" 
                                            className="block w-full text-center bg-own-2 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors font-medium"
                                        >
                                            Go to Login
                                        </Link>
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={loading}
                                            className="block w-full text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin inline-block h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </>
                                            ) : "Resend Verification Email"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Google Signup Success Message */}
                        {success === "completed" && (
                            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheckCircle} className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-green-700 mb-2">Account Created Successfully!</h3>
                                <p className="text-green-600 mb-4">
                                    Redirecting to your dashboard...
                                </p>
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
                                    <span className="text-sm text-gray-600">Please wait</span>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-start">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-700 font-medium">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Only show form if not successful */}
                        {!success && (
                            <>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="firstName"
                                                    name="firstName"
                                                    type="text"
                                                    autoComplete="given-name"
                                                    required
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                                                    placeholder="First name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="lastName"
                                                    name="lastName"
                                                    type="text"
                                                    autoComplete="family-name"
                                                    required
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                                                    placeholder="Last name"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
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
                                                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Field */}
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faPhone} className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                required
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Password (min. 6 characters) *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                required
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                                                placeholder="Create a password"
                                                minLength="6"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-black"
                                                onClick={togglePasswordVisibility}
                                                disabled={loading}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={showPassword ? faEyeSlash : faEye} 
                                                    className="h-5 w-5 text-gray-400 hover:text-own-2 disabled:opacity-50" 
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                                                placeholder="Confirm your password"
                                                minLength="6"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={toggleConfirmPasswordVisibility}
                                                disabled={loading}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={showConfirmPassword ? faEyeSlash : faEye} 
                                                    className="h-5 w-5 text-gray-400 hover:text-own-2 disabled:opacity-50" 
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Newsletter Subscription */}
                                    <div className="flex items-center">
                                        <input
                                            id="subscribeNewsletter"
                                            name="subscribeNewsletter"
                                            type="checkbox"
                                            checked={formData.subscribeNewsletter}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-own-2 focus:ring-own-2 border-gray-300 rounded disabled:opacity-50"
                                        />
                                        <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-gray-700">
                                            Subscribe to our newsletter for updates and promotions
                                        </label>
                                    </div>

                                    {/* Terms and Conditions */}
                                    <div className="flex items-center">
                                        <input
                                            id="acceptTerms"
                                            name="acceptTerms"
                                            type="checkbox"
                                            checked={formData.acceptTerms}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            className="h-4 w-4 text-own-2 focus:ring-own-2 border-gray-300 rounded disabled:opacity-50"
                                        />
                                        <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                                            I agree to the{" "}
                                            <Link to="/terms-and-conditions" className="text-own-2 hover:text-amber-600">
                                                Terms and Conditions
                                            </Link>{" "}
                                            and{" "}
                                            <Link to="/privacy-policy" className="text-own-2 hover:text-amber-600">
                                                Privacy Policy
                                            </Link>
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={!formData.acceptTerms || loading}
                                        className="w-full py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-own-2 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-own-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Account...
                                            </div>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </button>
                                </form>

                                {/* Social Sign Up Divider */}
                                <div className="mt-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={handleGoogleSignUp}
                                            disabled={loading}
                                            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 mr-3 text-red-500" />
                                            <span>Continue with Google</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Login Link */}
                                <div className="mt-8 text-center">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{" "}
                                        <Link 
                                            to="/login" 
                                            className="font-medium text-own-2 hover:text-amber-600 transition-colors"
                                        >
                                            Sign in here
                                        </Link>
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-own-2 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 font-display2">
                        Your Account Features
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
                                <span className="text-2xl">❤️</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Save Favorites</h3>
                            <p className="text-gray-100">Bookmark your favorite meals for quick reordering</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📍</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Multiple Addresses</h3>
                            <p className="text-gray-100">Save home, work, and other delivery locations</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📱</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Order Tracking</h3>
                            <p className="text-gray-100">Track your orders and view complete order history</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer/>
        </>
    );
}