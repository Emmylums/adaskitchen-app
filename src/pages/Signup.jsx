import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope, faLock, faUser, faPhone } from "@fortawesome/free-solid-svg-icons";

export default function SignUp() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Sign up attempt:", formData);
        // Add your signup logic here
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
            <section className="relative bg-[url(./assets/background4.jpg)] h-[40vh] bg-center bg-cover">
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

                        <form onSubmit={handleSubmit} className="">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
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
                                            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm"
                                            placeholder="First name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
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
                                            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm"
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>
                            </div>

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
                                        className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div className="mb-6">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
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
                                        className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm"
                                        placeholder="Enter your phone number"
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
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm"
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={togglePasswordVisibility}
                                    >
                                        <FontAwesomeIcon 
                                            icon={showPassword ? faEyeSlash : faEye} 
                                            className="h-5 w-5 text-gray-400 hover:text-own-2" 
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="mb-6">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
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
                                        className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-xl placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm"
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={toggleConfirmPasswordVisibility}
                                    >
                                        <FontAwesomeIcon 
                                            icon={showConfirmPassword ? faEyeSlash : faEye} 
                                            className="h-5 w-5 text-gray-400 hover:text-own-2" 
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-center mb-6">
                                <input
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    type="checkbox"
                                    checked={formData.acceptTerms}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-own-2 focus:ring-own-2 border-gray-300 rounded"
                                />
                                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                                    I agree to the{" "}
                                    <Link to="/Terms&Conditions" className="text-own-2 hover:text-amber-600">
                                        Terms and Conditions
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/Privacy Policy" className="text-own-2 hover:text-amber-600">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!formData.acceptTerms}
                                className="w-full py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-own-2 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-own-2 transition-colors"
                            >
                                Create Account
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
                                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <span>Google</span>
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
                    </motion.div>
                </div>
            </section>
            {/* Benefits Section - Moved to top */}
            <section className="py-16 bg-own-2 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 font-display2">
                        Why Create an Account?
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
                                <span className="text-2xl">🚀</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Faster Checkout</h3>
                            <p className="text-gray-100">Save your details for quick and easy ordering</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📦</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Order Tracking</h3>
                            <p className="text-gray-100">Track your orders and view order history</p>
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
                            <p className="text-gray-100">Get access to special deals and promotions</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer/>
        </>
    );
}