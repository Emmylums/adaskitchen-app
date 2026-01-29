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
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { 
  applyActionCode, 
  checkActionCode, 
  verifyPasswordResetCode 
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
        
        if (code && modeParam) {
            setOobCode(code);
            setMode(modeParam);
            handleActionCode(code, modeParam);
        } else {
            setError("Invalid verification link.");
            setVerifying(false);
        }
    }, [searchParams]);

    const handleActionCode = async (code, mode) => {
        try {
            if (mode === "verifyEmail") {
                // For email verification
                await applyActionCode(auth, code);
                
                // Get email from action code
                const info = await checkActionCode(auth, code);
                setEmail(info.data.email);
                
                // Update Firestore to mark email as verified
                if (auth.currentUser) {
                    const userRef = doc(db, "users", auth.currentUser.uid);
                    await updateDoc(userRef, {
                        emailVerified: true,
                        updatedAt: new Date().toISOString()
                    });
                }
                
                setVerified(true);
            } else if (mode === "resetPassword") {
                // For password reset - just verify the code is valid
                await verifyPasswordResetCode(auth, code);
                const info = await checkActionCode(auth, code);
                setEmail(info.data.email);
                setVerified(true);
                // Navigate to reset password page with the code
                navigate(`/reset-password?oobCode=${code}`);
                return;
            } else {
                setError("Invalid action mode.");
            }
        } catch (err) {
            console.error("Action code error:", err);
            switch (err.code) {
                case "auth/expired-action-code":
                    setError("This verification link has expired. Please request a new one.");
                    break;
                case "auth/invalid-action-code":
                    setError("Invalid verification link. Please request a new one.");
                    break;
                case "auth/user-disabled":
                    setError("This account has been disabled.");
                    break;
                case "auth/user-not-found":
                    setError("No account found with this email.");
                    break;
                default:
                    setError("Failed to verify email. Please try again.");
            }
        } finally {
            setVerifying(false);
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
                                {mode === "verifyEmail" ? "Email Verification" : "Reset Password"}
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
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-own-2 mx-auto mb-4">
                                    <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-own-2" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Verifying...</h3>
                                <p className="text-gray-600">Please wait while we verify your link</p>
                            </div>
                        ) : error ? (
                            <div className="py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h3>
                                <p className="text-red-600 mb-6">{error}</p>
                                <div className="space-y-3">
                                    {mode === "verifyEmail" ? (
                                        <Link 
                                            to="/login" 
                                            className="inline-block w-full py-3 px-4 bg-own-2 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                                        >
                                            Go to Login
                                        </Link>
                                    ) : (
                                        <Link 
                                            to="/forgot-password" 
                                            className="inline-block w-full py-3 px-4 bg-own-2 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                                        >
                                            Request New Reset Link
                                        </Link>
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
                                        <span className="font-medium">{email}</span>
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
                    </motion.div>

                    {/* Additional Information */}
                    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                        <h4 className="font-medium text-blue-800 mb-2">Need help?</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Check your spam/junk folder for verification emails</li>
                            <li>• Verification links expire after 24 hours</li>
                            <li>• Contact support if you continue to have issues</li>
                        </ul>
                    </div>
                </div>
            </section>

            <Footer/>
        </>
    );
}