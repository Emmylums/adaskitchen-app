import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faExclamationCircle, faCheckCircle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function ForgotPassword() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Validate email
        if (!email) {
            setError("Please enter your email address.");
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            // IMPORTANT: Configure actionCodeSettings with your custom URL
            const actionCodeSettings = {
                // URL to redirect to after email verification
                url: `${window.location.origin}/reset-password`,
                // This must be true for deep linking to work
                handleCodeInApp: true,
                // iOS app configuration (if you have one)
                // iOS: {
                //     bundleId: 'com.yourcompany.yourapp'
                // },
                // Android app configuration (if you have one)
                // android: {
                //     packageName: 'com.yourcompany.yourapp',
                //     installApp: true,
                //     minimumVersion: '12'
                // },
                // Additional dynamic link domain (for Firebase Dynamic Links)
                // dynamicLinkDomain: 'yourdomain.page.link'
            };

            console.log("Redirect URL:", actionCodeSettings.url); // Debug log
            
            // Send password reset email with custom settings
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            
            setEmailSent(true);
            setSuccess(`Password reset link sent to ${email}. Please check your inbox.`);
            
        } catch (err) {
            console.error("Password reset error:", err);
            console.error("Error details:", err.code, err.message);
            
            // Handle specific Firebase errors
            switch (err.code) {
                case "auth/invalid-email":
                    setError("Invalid email address format.");
                    break;
                case "auth/user-not-found":
                    // For security, show generic message
                    setEmailSent(true);
                    setSuccess(`If an account exists with ${email}, you will receive a password reset link shortly.`);
                    break;
                case "auth/too-many-requests":
                    setError("Too many reset attempts. Please try again later.");
                    break;
                case "auth/network-request-failed":
                    setError("Network error. Please check your internet connection.");
                    break;
                case "auth/operation-not-allowed":
                    setError("Password reset is not enabled. Please contact support.");
                    break;
                case "auth/invalid-continue-uri":
                    setError("Invalid redirect URL configuration. Please contact support.");
                    break;
                case "auth/unauthorized-continue-uri":
                    setError("The redirect URL is not authorized. Please contact support.");
                    break;
                default:
                    setError(`Failed to send reset email: ${err.message || "Please try again."}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = () => {
        setEmailSent(false);
        setSuccess("");
        setError("");
    };

    return (
        <>
            <NavBar activeLink="Login" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
            <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Login" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
            
            {/* Hero Section */}
            <section className="relative bg-[url(./assets/background4.jpg)] h-[40vh] bg-center bg-cover">
                <div className="absolute inset-0 h-[40vh] opacity-70 bg-black" />
                <div className="relative flex items-center justify-center h-full">
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                        <div className="p-10 text-center text-white mt-10">
                            <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg">Reset Password</h2>
                            <p className="text-lg mt-2">Recover access to your Ada's Kitchen account</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Forgot Password Form Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-8"
                    >
                        {/* Back to Login */}
                        <div className="mb-6">
                            <Link 
                                to="/login" 
                                className="inline-flex items-center text-sm text-own-2 hover:text-amber-600 transition-colors font-medium"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" />
                                Back to Login
                            </Link>
                        </div>

                        <h2 className="text-3xl font-bold text-center text-own-2 mb-2 font-display2">
                            Forgot Password
                        </h2>
                        
                        <p className="text-center text-gray-600 mb-8">
                            {emailSent 
                                ? "Check your email for reset instructions"
                                : "Enter your email address and we'll send you a link to reset your password"
                            }
                        </p>

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
                                    <div className="flex-1">
                                        <p className="text-sm text-green-700 font-medium mb-3">{success}</p>
                                        {emailSent && (
                                            <div className="space-y-2">
                                                <div className="flex items-center text-xs text-green-600">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    <span>Check your spam/junk folder if you don't see the email</span>
                                                </div>
                                                <div className="flex items-center text-xs text-green-600">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    <span>The reset link expires in 1 hour</span>
                                                </div>
                                                <div className="flex items-center text-xs text-green-600">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    <span>You can only request a new link after 1 minute</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!emailSent ? (
                            <form onSubmit={handleSubmit}>
                                {/* Email Field */}
                                <div className="mb-8">
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black transition-all duration-200"
                                            placeholder="Enter your registered email"
                                        />
                                    </div>
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
                                            Sending Reset Link...
                                        </div>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                {/* Success Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon 
                                            icon={faCheckCircle} 
                                            className="h-10 w-10 text-green-500" 
                                        />
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
                                    <h4 className="font-medium text-blue-800 mb-2">What to do next:</h4>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm text-blue-700">
                                        <li>Open the email from Ada's Kitchen</li>
                                        <li>Click the "Reset Password" button in the email</li>
                                        <li>You'll be redirected to create a new password</li>
                                        <li>Log in with your new password</li>
                                    </ol>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-4">
                                    <button
                                        onClick={handleResendEmail}
                                        disabled={loading}
                                        className={`w-full py-3 px-4 border border-own-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-amber-50'} text-own-2 active:scale-95`}
                                    >
                                        Resend Email
                                    </button>
                                    
                                    <Link 
                                        to="/login" 
                                        className={`block w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-center transition-all duration-300 transform hover:scale-[1.02] bg-gray-800 hover:bg-gray-900 text-white active:scale-95`}
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Additional Help */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    Still having trouble?
                                </p>
                                <Link 
                                    to="/contact" 
                                    className="text-sm font-medium text-own-2 hover:text-amber-600 transition-colors"
                                >
                                    Contact our support team
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Security Tips Section */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-own-2 mb-12 font-display2">
                        Password Security Tips
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                        >
                            <div className="w-12 h-12 mx-auto mb-4 bg-own-2 bg-opacity-10 rounded-full flex items-center justify-center">
                                <span className="text-xl">🔒</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-center">Create Strong Passwords</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start">
                                    <div className="w-1.5 h-1.5 bg-own-2 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span>Use at least 12 characters</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-1.5 h-1.5 bg-own-2 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span>Mix letters, numbers & symbols</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-1.5 h-1.5 bg-own-2 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span>Avoid common words & phrases</span>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                        >
                            <div className="w-12 h-12 mx-auto mb-4 bg-own-2 bg-opacity-10 rounded-full flex items-center justify-center">
                                <span className="text-xl">🛡️</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-center">Stay Protected</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start">
                                    <div className="w-1.5 h-1.5 bg-own-2 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span>Never share your password</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-1.5 h-1.5 bg-own-2 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span>Use different passwords for different sites</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-1.5 h-1.5 bg-own-2 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span>Consider using a password manager</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer/>
        </>
    );
}