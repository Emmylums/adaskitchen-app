import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer"; 
import bg from "../assets/background.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faEnvelope, 
  faSpinner,
  faArrowRight,
  faExclamationTriangle,
  faKey
} from "@fortawesome/free-solid-svg-icons";
import { 
  applyActionCode, 
  checkActionCode, 
  verifyPasswordResetCode,
  confirmPasswordReset
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function EmailVerification() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState("");
    const [oobCode, setOobCode] = useState("");
    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get("oobCode");
        const modeParam = searchParams.get("mode");
        const apiKey = searchParams.get("apiKey");
        const lang = searchParams.get("lang") || "en";
        
        console.log("EmailVerification component loaded with params:", {
            oobCode: code,
            mode: modeParam,
            apiKey: apiKey,
            lang: lang,
            allParams: Object.fromEntries(searchParams.entries())
        });
        
        if (code && modeParam) {
            setOobCode(code);
            setMode(modeParam);
            handleActionCode(code, modeParam);
        } else {
            setError("Invalid verification link. Missing required parameters.");
            console.error("Missing parameters in verification link");
            setVerifying(false);
        }
    }, [searchParams]);

    const handleActionCode = async (code, mode) => {
        try {
            console.log(`Handling action code for mode: ${mode}, code length: ${code?.length}`);
            
            if (mode === "verifyEmail") {
                // For email verification
                console.log("Attempting to verify email with code...");
                await applyActionCode(auth, code);
                
                // Get email from action code
                const info = await checkActionCode(auth, code);
                console.log("Action code info retrieved:", info.data.email);
                const userEmail = info.data.email;
                setEmail(userEmail);
                
                // Try to update Firestore to mark email as verified
                try {
                    // We need to find the user by email since we might not have currentUser
                    const userRef = doc(db, "users", info.data.uid || "unknown");
                    await updateDoc(userRef, {
                        emailVerified: true,
                        updatedAt: new Date().toISOString()
                    });
                    console.log("Firestore updated for user:", info.data.uid);
                } catch (firestoreError) {
                    console.warn("Could not update Firestore, but email verification succeeded:", firestoreError);
                    // Continue even if Firestore update fails
                }
                
                setVerified(true);
                console.log("Email verification successful!");
                
            } else if (mode === "resetPassword") {
                // For password reset - verify the code is valid without applying it
                console.log("Handling password reset verification...");
                
                // IMPORTANT: Use verifyPasswordResetCode to check if code is valid
                // but DON'T apply it yet - that happens on the reset password page
                const verifiedEmail = await verifyPasswordResetCode(auth, code);
                console.log("Password reset code verified for email:", verifiedEmail);
                setEmail(verifiedEmail);
                
                // Store the reset code in sessionStorage for the reset password page
                sessionStorage.setItem('resetPasswordCode', code);
                sessionStorage.setItem('resetPasswordEmail', verifiedEmail);
                
                setVerified(true);
                console.log("Password reset code verified, navigating to reset-password");
                
                // Navigate to reset password page
                navigate(`/reset-password?oobCode=${encodeURIComponent(code)}&email=${encodeURIComponent(verifiedEmail)}`);
                return;
                
            } else {
                console.error("Invalid mode parameter:", mode);
                setError(`Invalid action mode: ${mode}`);
            }
        } catch (err) {
            console.error("Action code error details:", {
                code: err.code,
                message: err.message,
                fullError: err
            });
            
            // More specific error handling
            if (err.code === "auth/expired-action-code") {
                setError("This verification link has expired. Please request a new one.");
            } else if (err.code === "auth/invalid-action-code") {
                setError("Invalid verification link. The link may have already been used or is malformed.");
            } else if (err.code === "auth/user-disabled") {
                setError("This account has been disabled. Please contact support.");
            } else if (err.code === "auth/user-not-found") {
                setError("No account found with this email address.");
            } else if (err.code === "auth/argument-error") {
                setError("Invalid verification link format. Please check the link and try again.");
            } else if (err.message?.includes("resetPassword")) {
                setError("This password reset link is invalid or has expired. Please request a new password reset email.");
            } else {
                setError(`Failed to process verification: ${err.message || "Please try again."}`);
            }
        } finally {
            setVerifying(false);
        }
    };

    // Handle reset password separately if needed
    const handlePasswordReset = async (code, newPassword) => {
        try {
            await confirmPasswordReset(auth, code, newPassword);
            return true;
        } catch (error) {
            console.error("Password reset error:", error);
            throw error;
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
                            <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg">
                                {mode === "verifyEmail" ? "Email Verification" : "Password Reset"}
                            </h2>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Verification Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-8 text-center"
                    >
                        {verifying ? (
                            <div className="py-12">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-own-2 mx-auto mb-4 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-own-2" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {mode === "verifyEmail" ? "Verifying Your Email..." : "Processing Password Reset..."}
                                </h3>
                                <p className="text-gray-600">
                                    {mode === "verifyEmail" 
                                        ? "Please wait while we verify your email address" 
                                        : "Please wait while we process your password reset request"}
                                </p>
                                <div className="mt-4 text-xs text-gray-500 space-y-1">
                                    <p>Mode: <span className="font-medium">{mode || "Loading..."}</span></p>
                                    <p>Code: <span className="font-mono">{oobCode ? `${oobCode.substring(0, 15)}...` : "No code"}</span></p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {mode === "verifyEmail" ? "Verification Failed" : "Password Reset Failed"}
                                </h3>
                                <p className="text-red-600 mb-4 px-4">{error}</p>
                                
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-start">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-700 mb-1">
                                                {mode === "verifyEmail" ? "Troubleshooting Tips:" : "What to do next:"}
                                            </p>
                                            <ul className="text-xs text-yellow-600 space-y-1">
                                                {mode === "verifyEmail" ? (
                                                    <>
                                                        <li>• Make sure you're clicking the link from the same device/browser where you requested verification</li>
                                                        <li>• Verification links expire after 24 hours</li>
                                                        <li>• Try requesting a new verification email from the login page</li>
                                                        <li>• Check that you haven't already verified this email</li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li>• Password reset links expire after 1 hour</li>
                                                        <li>• Request a new password reset link from the login page</li>
                                                        <li>• Make sure you're using the exact link from the email</li>
                                                        <li>• Try copying and pasting the link instead of clicking it</li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {mode === "verifyEmail" ? (
                                        <>
                                            <Link 
                                                to="/login" 
                                                className="inline-flex items-center justify-center w-full py-3 px-4 bg-own-2 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faArrowRight} className="mr-2 h-4 w-4 rotate-180" />
                                                Go to Login
                                            </Link>
                                            <Link 
                                                to="/forgot-password" 
                                                className="inline-flex items-center justify-center w-full py-3 px-4 border border-own-2 text-own-2 font-medium rounded-xl hover:bg-own-2 hover:text-white transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faKey} className="mr-2 h-4 w-4" />
                                                Reset Password
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link 
                                                to="/forgot-password" 
                                                className="inline-flex items-center justify-center w-full py-3 px-4 bg-own-2 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faKey} className="mr-2 h-4 w-4" />
                                                Request New Reset Link
                                            </Link>
                                            <Link 
                                                to="/login" 
                                                className="inline-flex items-center justify-center w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faArrowRight} className="mr-2 h-4 w-4 rotate-180" />
                                                Back to Login
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : verified && mode === "verifyEmail" ? (
                            <div className="py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheckCircle} className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Email Verified Successfully!</h3>
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center justify-center mb-2">
                                        <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="font-medium text-lg">{email}</span>
                                    </div>
                                    <p className="text-sm text-green-600">
                                        Your email has been verified. You can now log in to your account.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <Link 
                                        to="/login" 
                                        className="inline-flex items-center justify-center w-full py-3 px-4 bg-own-2 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                                    >
                                        Go to Login
                                        <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                                    </Link>
                                    <Link 
                                        to="/" 
                                        className="inline-block w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Return to Home
                                    </Link>
                                </div>
                            </div>
                        ) : null}
                        
                        {/* Show loading if navigating away for password reset */}
                        {mode === "resetPassword" && verifying === false && error === "" && !verified && (
                            <div className="py-12">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-own-2 mx-auto mb-4 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-own-2" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Redirecting to Password Reset...</h3>
                                <p className="text-gray-600">Please wait while we redirect you to set your new password</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Additional Information */}
                    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 mr-2" />
                            Need help with verification?
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Check your spam/junk folder for verification emails</li>
                            <li>• Email verification links expire after 24 hours</li>
                            <li>• Password reset links expire after 1 hour</li>
                            <li>• Try requesting a new email from the login page</li>
                            <li>• Contact support if you continue to have issues</li>
                        </ul>
                    </div>
                </div>
            </section>

            <Footer/>
        </>
    );
}