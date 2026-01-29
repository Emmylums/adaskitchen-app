import React, { useState } from "react";
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
  faLock, 
  faEye, 
  faEyeSlash,
  faSpinner,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function ResetPassword() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const oobCode = searchParams.get("oobCode");
    const emailParam = searchParams.get("email");

    React.useEffect(() => {
        const verifyCode = async () => {
            if (!oobCode) {
                setError("Invalid password reset link. Missing reset code.");
                setVerifying(false);
                return;
            }

            try {
                console.log("Verifying password reset code...");
                const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
                console.log("Code verified for email:", verifiedEmail);
                setEmail(verifiedEmail || emailParam || "");
                setVerifying(false);
            } catch (err) {
                console.error("Password reset code verification error:", err);
                setError(`Invalid or expired password reset link: ${err.message}`);
                setVerifying(false);
            }
        };

        verifyCode();
    }, [oobCode, emailParam]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.password || !formData.confirmPassword) {
            setError("Please fill in both password fields");
            return;
        }
        
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        if (!oobCode) {
            setError("Invalid reset code. Please request a new password reset link.");
            return;
        }
        
        try {
            setLoading(true);
            setError("");
            
            console.log("Confirming password reset with code...");
            await confirmPasswordReset(auth, oobCode, formData.password);
            
            console.log("Password reset successful!");
            setSuccess(true);
            
            // Update user's last password change timestamp in Firestore if we can identify the user
            try {
                // You might want to add logic here to update Firestore
                // This would require getting the user ID from the email
                console.log("Password reset completed for:", email);
            } catch (firestoreError) {
                console.warn("Could not update Firestore:", firestoreError);
            }
            
        } catch (err) {
            console.error("Password reset error:", err);
            
            if (err.code === "auth/expired-action-code") {
                setError("This password reset link has expired. Please request a new one.");
            } else if (err.code === "auth/invalid-action-code") {
                setError("Invalid password reset link. Please request a new one.");
            } else if (err.code === "auth/user-disabled") {
                setError("This account has been disabled. Please contact support.");
            } else if (err.code === "auth/user-not-found") {
                setError("No account found with this email.");
            } else {
                setError(`Failed to reset password: ${err.message || "Please try again."}`);
            }
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
                                Reset Password
                            </h2>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Reset Password Form Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-8"
                    >
                        <h2 className="text-3xl font-bold text-center text-own-2 mb-8 font-display2">
                            Set New Password
                        </h2>

                        {verifying ? (
                            <div className="py-12 text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-own-2 mx-auto mb-4 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-own-2" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Verifying Reset Link...</h3>
                                <p className="text-gray-600">Please wait while we verify your password reset link</p>
                            </div>
                        ) : error ? (
                            <div className="py-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Link Verification Failed</h3>
                                <p className="text-red-600 mb-6">{error}</p>
                                <Link 
                                    to="/forgot-password" 
                                    className="inline-flex items-center justify-center w-full py-3 px-4 bg-own-2 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                                >
                                    Request New Reset Link
                                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        ) : success ? (
                            <div className="py-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheckCircle} className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Password Reset Successful!</h3>
                                <p className="text-gray-600 mb-6">
                                    Your password has been successfully reset. You can now log in with your new password.
                                </p>
                                {email && (
                                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <p className="text-sm text-blue-700">
                                            Reset for: <span className="font-medium">{email}</span>
                                        </p>
                                    </div>
                                )}
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center justify-center w-full py-3 px-4 bg-own-2 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                                >
                                    Go to Login
                                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        ) : (
                            <>
                                {email && (
                                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <p className="text-sm text-blue-700 text-center">
                                            Reset password for: <span className="font-medium">{email}</span>
                                        </p>
                                    </div>
                                )}
                                
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-500 mr-3" />
                                            <p className="text-red-700">{error}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit}>
                                    {/* New Password Field */}
                                    <div className="mb-6">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password (min. 6 characters)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                                                placeholder="Enter new password"
                                                minLength="6"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={togglePasswordVisibility}
                                                disabled={loading}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={showPassword ? faEyeSlash : faEye} 
                                                    className="h-5 w-5 text-gray-400 hover:text-own-2" 
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="mb-8">
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                                                placeholder="Confirm new password"
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
                                                    className="h-5 w-5 text-gray-400 hover:text-own-2" 
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-own-2 hover:bg-amber-600 disabled:bg-amber-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-own-2 transition-colors flex justify-center items-center"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Resetting Password...
                                            </>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>
                                
                                <div className="mt-6 text-center">
                                    <Link 
                                        to="/login" 
                                        className="text-sm text-own-2 hover:text-amber-600 transition-colors"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </section>

            <Footer/>
        </>
    );
}