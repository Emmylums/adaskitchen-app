import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
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
  faCheckCircle,
  faHeart,
  faLocationDot,
  faMobileScreen,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import bg from "../assets/bgcont.jpeg";
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
  const [success, setSuccess] = useState(null);

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
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  };

  /* ---------- Email signup (logic unchanged) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!formData.acceptTerms) return setError("You must accept the Terms and Conditions");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    if (formData.password.length < 6) return setError("Password must be at least 6 characters");

    try {
      setLoading(true);

      const userCredential = await signup(formData.email, formData.password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      const actionUrl = `${window.location.origin}/verify-email`;
      console.log("Sending verification email to:", firebaseUser.email, "with URL:", actionUrl);

      await firebaseSendEmailVerification(firebaseUser, { url: actionUrl, handleCodeInApp: true });

      const userRef = doc(db, "users", firebaseUser.uid);

      const userData = {
        uid: firebaseUser.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        displayName: `${formData.firstName} ${formData.lastName}`,
        emailVerified: false,
        isActive: true,
        role: "customer",
        photoURL: "",
        contactPreferences: { email: true, sms: true, push: true },
        subscribeNewsletter: formData.subscribeNewsletter,
        notifications: {
          orderUpdates: true,
          promotions: true,
          newItems: true,
          priceDrops: true,
          orderReminders: true,
          deliveryStatus: true,
          marketingEmails: formData.subscribeNewsletter,
        },
        addresses: [],
        defaultAddressId: null,
        favorites: [],
        cart: [],
        orderHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        lastOrderDate: null,
        stats: { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
      };

      await setDoc(userRef, userData);

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
        isUrgent: true,
      });

      await signOut(auth);
      setSuccess("verify");
    } catch (err) {
      console.error("Signup error:", err);
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

  /* ---------- Google signup (logic unchanged) ---------- */
  const handleGoogleSignUp = async () => {
    try {
      setError("");
      setLoading(true);
      setSuccess(null);

      const userCredential = await signInWithGoogle();
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
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
          contactPreferences: { email: true, sms: false, push: true },
          subscribeNewsletter: true,
          notifications: {
            orderUpdates: true,
            promotions: true,
            newItems: true,
            priceDrops: true,
            orderReminders: true,
            deliveryStatus: true,
            marketingEmails: true,
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
          stats: { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
        });

        const notificationId = `welcome_${Date.now()}`;
        const notificationRef = doc(db, "users", firebaseUser.uid, "notifications", notificationId);
        await setDoc(notificationRef, {
          id: notificationId,
          type: "welcome",
          title: "Welcome to Ada's Kitchen!",
          message: "Thank you for joining with Google. Start exploring delicious meals!",
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: "/menu",
        });
      }

      setSuccess("completed");
      setTimeout(() => navigate("/user/dashboard"), 1500);
    } catch (err) {
      console.error("Google signup error:", err);
      setError(`Google signup failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Redirect if logged in ---------- */
  useEffect(() => {
    if (user && user.emailVerified) navigate("/user/dashboard");
  }, [user, navigate]);

  /* ---------- Resend verification ---------- */
  const handleResendVerification = async () => {
    if (!user) {
      setError("Please sign in first to resend verification email.");
      return;
    }
    try {
      setLoading(true);
      const actionUrl = `${window.location.origin}/verify-email`;
      await firebaseSendEmailVerification(user, { url: actionUrl, handleCodeInApp: true });
      setSuccess("verify");
      setError("");
    } catch (err) {
      setError(`Failed to resend verification: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: faHeart, title: "Save Favorites", desc: "Bookmark your favorite meals for quick reordering" },
    { icon: faLocationDot, title: "Multiple Addresses", desc: "Save home, work, and other delivery locations" },
    { icon: faMobileScreen, title: "Order Tracking", desc: "Track your orders and view complete order history" },
  ];

  /* ---------- Render ---------- */
  return (
    <>
      <NavBar activeLink="Login" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Login" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      {/* HERO */}
      <section className="relative h-[60vh] min-h-[300px] overflow-hidden [@media(max-height:500px)]:h-[55vh] [@media(max-height:500px)]:min-h-[220px] [@media(max-height:400px)]:min-h-[200px]">
        <div style={{ backgroundImage: `url(${bg})` }} className="absolute inset-0 bg-center bg-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        <div className="relative flex items-center justify-center h-full px-4 sm:px-6 [@media(max-height:500px)]:px-3">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center text-white max-w-4xl"
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Get Started
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl leading-tight mb-4 [@media(max-height:500px)]:text-2xl [@media(max-height:500px)]:mb-1 [@media(max-height:400px)]:text-xl">
              Join <span className="text-own-2">Ada's Kitchen</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 [@media(max-height:500px)]:text-xs">
              Create your account and unlock a world of Nigerian flavor
            </p>
          </motion.div>
        </div>
      </section>

      {/* SIGNUP FORM */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50 [@media(max-height:600px)]:py-8 [@media(max-height:500px)]:py-4 [@media(max-height:500px)]:px-2">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden [@media(max-height:500px)]:rounded-2xl"
          >
            <div className="h-1.5 bg-gradient-to-r from-own-2 via-[oklch(85%_0.171_83.42)] to-own-2" />
            <div className="p-8 md:p-10 [@media(max-height:600px)]:p-5 [@media(max-height:500px)]:p-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-[oklch(29.23%_0_0)] mb-8 font-display [@media(max-height:600px)]:mb-4 [@media(max-height:600px)]:text-xl">
                Create Account
              </h2>

              {/* SUCCESS: VERIFY EMAIL */}
              {success === "verify" && (
                <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:rounded-xl">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center [@media(max-height:500px)]:w-12 [@media(max-height:500px)]:h-12 [@media(max-height:500px)]:mb-2">
                    <FontAwesomeIcon icon={faEnvelope} className="w-8 h-8 text-blue-600 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-700 mb-3 text-center [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-2">
                    Check Your Email to Verify!
                  </h3>
                  <div className="space-y-3 text-center [@media(max-height:500px)]:space-y-2">
                    <p className="text-blue-600 [@media(max-height:500px)]:text-sm">
                      We've sent a verification email to:
                      <br />
                      <span className="font-semibold text-lg [@media(max-height:500px)]:text-base">{formData.email}</span>
                    </p>
                    <p className="text-sm text-gray-600 [@media(max-height:500px)]:text-xs">
                      Please check your inbox and click the verification link to activate your account.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mt-4 text-left [@media(max-height:500px)]:p-2 [@media(max-height:500px)]:mt-2">
                      <div className="flex items-start">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0 [@media(max-height:500px)]:h-4 [@media(max-height:500px)]:w-4" />
                        <div>
                          <p className="text-sm font-medium text-yellow-700 mb-2 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mb-1">
                            Important Verification Instructions:
                          </p>
                          <ul className="text-xs text-yellow-600 space-y-1 [@media(max-height:500px)]:text-[10px]">
                            <li>• Click the verification link in the email sent to {formData.email}</li>
                            <li>• Check your spam/junk folder if you don't see the email</li>
                            <li>• The verification link expires in 24 hours</li>
                            <li>• You must verify your email before you can log in</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 space-y-3 [@media(max-height:500px)]:pt-2 [@media(max-height:500px)]:space-y-2">
                      <Link
                        to="/login"
                        className="block w-full text-center bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] px-6 py-3 rounded-full font-semibold transition-colors [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                      >
                        Go to Login
                      </Link>
                      <button
                        onClick={handleResendVerification}
                        disabled={loading}
                        className="block w-full text-center bg-white border-2 border-gray-200 text-[oklch(29.23%_0_0)] px-6 py-3 rounded-full font-medium hover:border-own-2 transition-colors disabled:opacity-50 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                      >
                        {loading ? "Sending..." : "Resend Verification Email"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUCCESS: GOOGLE COMPLETE */}
              {success === "completed" && (
                <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-2xl text-center [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-3">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center [@media(max-height:500px)]:w-12 [@media(max-height:500px)]:h-12 [@media(max-height:500px)]:mb-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-8 h-8 text-green-600 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">
                    Account Created Successfully!
                  </h3>
                  <p className="text-green-600 mb-4 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-2">Redirecting to your dashboard...</p>
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Please wait</span>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-2">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0 [@media(max-height:500px)]:h-4 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:mr-2" />
                    <p className="text-red-700 font-medium text-sm [@media(max-height:500px)]:text-xs">{error}</p>
                  </div>
                </div>
              )}

              {/* FORM */}
              {!success && (
                <>
                  <form onSubmit={handleSubmit} className="space-y-5 [@media(max-height:600px)]:space-y-3 [@media(max-height:500px)]:space-y-2">
                    {/* Names */}
                    <div className="grid grid-cols-2 gap-3 [@media(max-height:500px)]:gap-2">
                      <div>
                        <label htmlFor="firstName" className="block text-xs font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                          First Name *
                        </label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            autoComplete="given-name"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="w-full pl-11 pr-3 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 text-sm [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:pl-9 [@media(max-height:500px)]:pr-2 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-xs"
                            placeholder="First name"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-xs font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                          Last Name *
                        </label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            autoComplete="family-name"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="w-full pl-11 pr-3 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 text-sm [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:pl-9 [@media(max-height:500px)]:pr-2 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-xs"
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="block text-xs font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                        Password * <span className="text-[oklch(40%_0.05_100)] font-normal normal-case tracking-normal">(min. 6 chars)</span>
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                          placeholder="Create a password"
                          minLength="6"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className="h-5 w-5 text-gray-400 hover:text-own-2 transition-colors"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                          placeholder="Confirm your password"
                          minLength="6"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          <FontAwesomeIcon
                            icon={showConfirmPassword ? faEyeSlash : faEye}
                            className="h-5 w-5 text-gray-400 hover:text-own-2 transition-colors"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 pt-2 [@media(max-height:500px)]:space-y-2 [@media(max-height:500px)]:pt-0">
                      <div className="flex items-start">
                        <input
                          id="subscribeNewsletter"
                          name="subscribeNewsletter"
                          type="checkbox"
                          checked={formData.subscribeNewsletter}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="mt-1 h-4 w-4 text-own-2 focus:ring-own-2 border-gray-300 rounded"
                        />
                        <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:text-xs">
                          Subscribe to our newsletter for updates and promotions
                        </label>
                      </div>

                      <div className="flex items-start">
                        <input
                          id="acceptTerms"
                          name="acceptTerms"
                          type="checkbox"
                          checked={formData.acceptTerms}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="mt-1 h-4 w-4 text-own-2 focus:ring-own-2 border-gray-300 rounded"
                        />
                        <label htmlFor="acceptTerms" className="ml-2 block text-sm text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:text-xs">
                          I agree to the{" "}
                          <Link to="/terms-and-conditions" className="font-medium text-own-2 hover:text-amber-600">
                            Terms and Conditions
                          </Link>{" "}
                          and{" "}
                          <Link to="/privacy-policy" className="font-medium text-own-2 hover:text-amber-600">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!formData.acceptTerms || loading}
                      className="w-full inline-flex items-center justify-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold py-4 rounded-full tracking-wide transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        <>Create Account <FontAwesomeIcon icon={faArrowRight} className="text-sm" /></>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="mt-8 [@media(max-height:600px)]:mt-4 [@media(max-height:500px)]:mt-3">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase tracking-widest">
                        <span className="px-3 bg-white text-[oklch(40%_0.05_100)]">Or sign up with</span>
                      </div>
                    </div>

                    <div className="mt-6 [@media(max-height:600px)]:mt-4 [@media(max-height:500px)]:mt-2">
                      <button
                        type="button"
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                        className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-full text-sm font-medium text-[oklch(29.23%_0_0)] hover:border-own-2 hover:bg-amber-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-xs"
                      >
                        <FontAwesomeIcon icon={faGoogle} className="h-5 w-5" style={{ color: "#DB4437" }} />
                        <span>Continue with Google</span>
                      </button>
                    </div>
                  </div>

                  {/* Login link */}
                  <div className="mt-8 text-center [@media(max-height:600px)]:mt-4 [@media(max-height:500px)]:mt-3">
                    <p className="text-sm text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:text-xs">
                      Already have an account?{" "}
                      <Link to="/login" className="font-semibold text-own-2 hover:text-amber-600 transition-colors">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4 sm:px-6 bg-own-1 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 [@media(max-height:600px)]:mb-6 [@media(max-height:500px)]:mb-4"
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Account Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display [@media(max-height:500px)]:text-xl">
              Everything You Need in One Account
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 [@media(max-height:500px)]:gap-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-own-2/50 transition-all duration-300 text-center [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:rounded-2xl"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-own-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 [@media(max-height:500px)]:w-12 [@media(max-height:500px)]:h-12 [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:rounded-xl">
                  <FontAwesomeIcon icon={f.icon} className="text-[oklch(29.23%_0_0)] text-xl [@media(max-height:500px)]:text-base" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">{f.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:leading-snug">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}