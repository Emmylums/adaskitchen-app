// ResetPassword.jsx
import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faExclamationCircle, faCheckCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function ResetPassword() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [searchParams] = useSearchParams();
    const [oobCode, setOobCode] = useState("");
    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get("oobCode");
        if (code) {
            setOobCode(code);
            verifyResetCode(code);
        } else {
            setError("Invalid or expired reset link.");
            setVerifying(false);
        }
    }, [searchParams]);

    const verifyResetCode = async (code) => {
        try {
            await verifyPasswordResetCode(auth, code);
            setVerified(true);
        } catch (err) {
            console.error("Reset code verification error:", err);
            switch (err.code) {
                case "auth/expired-action-code":
                    setError("This reset link has expired. Please request a new one.");
                    break;
                case "auth/invalid-action-code":
                    setError("Invalid reset link. Please request a new one.");
                    break;
                case "auth/user-disabled":
                    setError("This account has been disabled.");
                    break;
                case "auth/user-not-found":
                    setError("No account found with this email.");
                    break;
                default:
                    setError("Invalid or expired reset link.");
            }
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validate passwords
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Password strength validation
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }

        setLoading(true);

        try {
            await confirmPasswordReset(auth, oobCode, password);
            setSuccess("Password reset successfully! Redirecting to login...");
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);
            
        } catch (err) {
            console.error("Password reset error:", err);
            switch (err.code) {
                case "auth/expired-action-code":
                    setError("This reset link has expired. Please request a new one.");
                    break;
                case "auth/invalid-action-code":
                    setError("Invalid reset link. Please request a new one.");
                    break;
                case "auth/user-disabled":
                    setError("This account has been disabled.");
                    break;
                case "auth/weak-password":
                    setError("Password is too weak. Please choose a stronger password.");
                    break;
                default:
                    setError("Failed to reset password. Please try again.");
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
            <section className="relative bg-[url(./assets/background4.jpg)] h-[40vh] bg-center bg-cover">
                <div className="absolute inset-0 h-[40vh] opacity-70 bg-black" />
                <div className="relative flex items-center justify-center h-full">
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                        <div className="p-10 text-center text-white mt-10">
                            <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg">Reset Password</h2>
                            <p className="text-lg mt-2">Set a new password for your account</p>
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
                        {verifying ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto mb-4"></div>
                                <p className="text-gray-600">Verifying reset link...</p>
                            </div>
                        ) : !verified ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Invalid Reset Link</h3>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <Link 
                                    to="/forgot-password" 
                                    className="inline-block py-3 px-6 bg-own-2 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                                >
                                    Request New Link
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-center text-own-2 mb-6 font-display2">
                                    Set New Password
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
                                    {/* New Password Field */}
                                    <div className="mb-6">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
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
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={loading}
                                                className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black transition-all duration-200"
                                                placeholder="Enter new password"
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
                                        <p className="mt-2 text-xs text-gray-500">
                                            Must be at least 8 characters with uppercase, lowercase, number, and special character
                                        </p>
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
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={loading}
                                                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed text-black transition-all duration-200"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                                        <ul className="space-y-1 text-xs text-gray-600">
                                            <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : ''}`}>
                                                <span className="mr-2">•</span>
                                                At least 8 characters
                                            </li>
                                            <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                                                <span className="mr-2">•</span>
                                                One uppercase letter
                                            </li>
                                            <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                                                <span className="mr-2">•</span>
                                                One lowercase letter
                                            </li>
                                            <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : ''}`}>
                                                <span className="mr-2">•</span>
                                                One number
                                            </li>
                                            <li className={`flex items-center ${/[@$!%*?&]/.test(password) ? 'text-green-600' : ''}`}>
                                                <span className="mr-2">•</span>
                                                One special character (@$!%*?&)
                                            </li>
                                        </ul>
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
                                                Resetting Password...
                                            </div>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                    <p className="text-sm text-gray-600">
                                        Remember your password?{" "}
                                        <Link 
                                            to="/login" 
                                            className="font-medium text-own-2 hover:text-amber-600 transition-colors"
                                        >
                                            Back to Login
                                        </Link>
                                    </p>
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