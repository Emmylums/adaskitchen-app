import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import bg from "../assets/bgcont.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faExclamationCircle,
  faCheckCircle,
  faExclamationTriangle,
  faTruckFast,
  faCreditCard,
  faGift,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification as firebaseSendEmailVerification,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import CartTransferHandler from "../components/CartTransferHandler";

export default function Login() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const navigate = useNavigate();

  /* ---------- Remember me ---------- */
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("userEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  /* ---------- Resend verification (logic unchanged) ---------- */
  const resendVerificationEmail = async (email) => {
    try {
      setResendLoading(true);
      setError("");

      const userCredential = await signInWithEmailAndPassword(auth, email, formData.password);
      const user = userCredential.user;

      const actionUrl = `${window.location.origin}/verify-email`;
      console.log("Resending verification email to:", user.email, "with URL:", actionUrl);

      await firebaseSendEmailVerification(user, { url: actionUrl, handleCodeInApp: true });
      await firebaseSignOut(auth);

      setSuccess(
        <div className="space-y-2">
          <p className="font-semibold text-green-700">✅ New verification email sent!</p>
          <p className="text-sm text-gray-600">
            Check your inbox (and spam folder) for the verification link. Click the link to verify
            your email before logging in.
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> The verification link will take you to our verification page.
            </p>
          </div>
        </div>
      );

      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      console.error("Resend verification error:", err);
      setError(`Failed to resend verification: ${err.message}`);
    } finally {
      setResendLoading(false);
    }
  };

  /* ---------- Email login (logic unchanged) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setUnverifiedEmail("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setUnverifiedEmail(user.email);

        setError(
          <div className="space-y-2">
            <p className="font-semibold">Please verify your email address before logging in.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-yellow-700 mb-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                <strong>Email not verified:</strong> {user.email}
              </p>
              <button
                onClick={() => resendVerificationEmail(user.email)}
                disabled={resendLoading}
                className="text-sm bg-own-2 text-[oklch(29.23%_0_0)] px-3 py-1 rounded-full font-semibold hover:bg-[oklch(85%_0.171_83.42)] transition-colors disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>
              <p className="text-xs text-yellow-600 mt-2">
                Check your spam/junk folder if you don't see the email
              </p>
            </div>
          </div>
        );

        await firebaseSignOut(auth);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      let userRole = "customer";

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.isActive === false) {
          setError("Your account has been deactivated. Please contact support.");
          await firebaseSignOut(auth);
          setLoading(false);
          return;
        }
        userRole = userData.role || "customer";
        await updateDoc(userDocRef, { lastLogin: new Date().toISOString() });
        if (!userData.emailVerified) {
          await updateDoc(userDocRef, { emailVerified: true });
        }
      } else {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
          emailVerified: user.emailVerified,
          isActive: true,
          role: "customer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      }

      if (rememberMe) {
        localStorage.setItem("userEmail", formData.email);
      } else {
        localStorage.removeItem("userEmail");
      }

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

      localStorage.setItem("userData", JSON.stringify(userDoc.exists() ? userDoc.data() : {}));

      setTimeout(() => navigate(redirectPath), 1500);
    } catch (err) {
      console.error("Login error:", err);
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

  /* ---------- Google login (logic unchanged) ---------- */
  const handleGoogleLogin = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      let userRole = "customer";
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const firstName = user.displayName?.split(" ")[0] || "";
        const lastName = user.displayName?.split(" ").slice(1).join(" ") || "";

        const userData = {
          uid: user.uid,
          firstName,
          lastName,
          email: user.email,
          phone: "",
          displayName: user.displayName || `${firstName} ${lastName}`,
          emailVerified: true,
          isActive: true,
          role: "customer",
          photoURL: user.photoURL || "",
          provider: ["google"],
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
        };

        await setDoc(userDocRef, userData);

        const notificationId = `welcome_${Date.now()}`;
        const notificationRef = doc(db, "users", user.uid, "notifications", notificationId);
        await setDoc(notificationRef, {
          id: notificationId,
          type: "welcome",
          title: "Welcome to Ada's Kitchen!",
          message: "Thank you for joining with Google. Start exploring delicious meals!",
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: "/menu",
        });

        setSuccess("Welcome! Your account has been created with Google. Redirecting...");
        localStorage.setItem("userData", JSON.stringify(userData));

        setTimeout(() => navigate("/complete-profile?source=google"), 1500);
        return;
      } else {
        const userData = userDoc.data();
        userRole = userData.role || "customer";

        const profileUpdates = {};

        if (user.displayName && user.displayName !== userData.displayName) {
          profileUpdates.displayName = user.displayName;
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

        let providers = userData.provider || [];
        if (!providers.includes("google")) {
          providers = [...providers, "google"];
          profileUpdates.provider = providers;
        }

        if (Object.keys(profileUpdates).length > 0) {
          profileUpdates.updatedAt = new Date().toISOString();
        }

        profileUpdates.lastLogin = new Date().toISOString();
        profileUpdates.emailVerified = true;

        await updateDoc(userDocRef, profileUpdates);

        if (userData.isActive === false) {
          setError("Your account has been deactivated. Please contact support.");
          setLoading(false);
          await firebaseSignOut(auth);
          return;
        }

        if (!userData.phone || userData.phone.trim() === "") {
          setSuccess("Google login successful! Please complete your profile...");
          localStorage.setItem("userData", JSON.stringify(userData));
          setTimeout(() => navigate("/complete-profile?source=google&existing=true"), 1500);
          return;
        }

        localStorage.setItem("userData", JSON.stringify(userData));
        setSuccess("Google login successful! Redirecting...");
      }

      let redirectPath = "/user/dashboard";
      if (userRole === "admin" || userRole === "superadmin") redirectPath = "/admin/dashboard";
      else if (userRole === "manager") redirectPath = "/admin/dashboard";
      else if (userRole === "staff") redirectPath = "/admin/orders";

      setTimeout(() => navigate(redirectPath), 1500);
    } catch (err) {
      console.error("Google login error:", err);
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

  const benefits = [
    { icon: faTruckFast, title: "Quick Reordering", desc: "Access your order history and reorder favorites with one click" },
    { icon: faCreditCard, title: "Saved Payments", desc: "Securely save payment methods for faster checkout" },
    { icon: faGift, title: "Exclusive Offers", desc: "Get member-only discounts and early access to promotions" },
  ];

  /* ---------- Render ---------- */
  return (
    <>
      <NavBar activeLink="Login" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Login" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      {/* HERO — reduced min-height + text scale on short landscape viewports */}
      <section className="relative h-[60vh] min-h-[260px] max-h-[800px] overflow-hidden [@media(max-height:500px)]:h-[70vh] [@media(max-height:500px)]:min-h-[220px] [@media(max-height:400px)]:min-h-[200px]">
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
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:tracking-[0.2em]">
              Welcome Back
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight mb-4 [@media(max-height:500px)]:text-3xl [@media(max-height:500px)]:mb-2 [@media(max-height:400px)]:text-2xl">
              Sign In to <span className="text-own-2">Ada's Kitchen</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 [@media(max-height:500px)]:text-sm [@media(max-height:400px)]:text-xs">
              Your next delicious meal is just one click away
            </p>
          </motion.div>
        </div>
      </section>

      {/* LOGIN FORM — tighter vertical padding on short landscape */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50 [@media(max-height:600px)]:py-8 [@media(max-height:500px)]:py-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden [@media(max-height:600px)]:rounded-2xl"
          >
            <div className="h-1.5 bg-gradient-to-r from-own-2 via-[oklch(85%_0.171_83.42)] to-own-2" />
            <div className="p-8 md:p-10 [@media(max-height:600px)]:p-5 [@media(max-height:500px)]:p-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-[oklch(29.23%_0_0)] mb-8 font-display [@media(max-height:600px)]:mb-4 [@media(max-height:600px)]:text-xl">
                Sign In
              </h2>

              {/* ERROR */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl [@media(max-height:600px)]:mb-4 [@media(max-height:600px)]:p-3">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      {typeof error === "string" ? (
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      ) : (
                        error
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl [@media(max-height:600px)]:mb-4 [@media(max-height:600px)]:p-3">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      {typeof success === "string" ? (
                        <>
                          <p className="text-sm text-green-700 font-medium">{success}</p>
                          {loading && (
                            <div className="mt-2 flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>
                              <span className="text-xs text-green-600">Redirecting...</span>
                            </div>
                          )}
                        </>
                      ) : (
                        success
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 [@media(max-height:600px)]:space-y-3">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-xs">
                    Email Address
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

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-xs">
                    Password
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className="h-5 w-5 text-gray-400 hover:text-own-2 transition-colors"
                      />
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4 text-own-2 focus:ring-own-2 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:text-xs">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-own-2 hover:text-amber-600 transition-colors [@media(max-height:500px)]:text-xs"
                    onClick={(e) => { if (loading) e.preventDefault(); }}
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold py-4 rounded-full tracking-wide transition-all duration-300 shadow-md disabled:opacity-50 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    <>Sign In <FontAwesomeIcon icon={faArrowRight} className="text-sm" /></>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 [@media(max-height:600px)]:mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="px-3 bg-white text-[oklch(40%_0.05_100)]">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 [@media(max-height:600px)]:mt-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-full text-sm font-medium text-[oklch(29.23%_0_0)] hover:border-own-2 hover:bg-amber-50 transition-all duration-300 disabled:opacity-50 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-xs"
                  >
                    <FontAwesomeIcon icon={faGoogle} className="h-5 w-5" style={{ color: "#DB4437" }} />
                    {loading ? "Please wait..." : "Sign in with Google"}
                  </button>
                </div>
              </div>

              {/* Signup link */}
              <div className="mt-8 text-center [@media(max-height:600px)]:mt-4">
                <p className="text-sm text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:text-xs">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-own-2 hover:text-amber-600 transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS — tighter padding & 3-col only on tall-enough landscape */}
      <section className="py-24 px-4 sm:px-6 bg-own-1 [@media(max-height:600px)]:py-12 [@media(max-height:500px)]:py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 [@media(max-height:600px)]:mb-6 [@media(max-height:500px)]:mb-4"
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Account Benefits
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display [@media(max-height:500px)]:text-xl">
              Why Members Love Ada's Kitchen
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 [@media(max-height:600px)]:gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-own-2/50 transition-all duration-300 text-center [@media(max-height:600px)]:p-5 [@media(max-height:500px)]:p-4"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-own-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 [@media(max-height:500px)]:w-12 [@media(max-height:500px)]:h-12 [@media(max-height:500px)]:mb-2">
                  <FontAwesomeIcon icon={b.icon} className="text-[oklch(29.23%_0_0)] text-xl [@media(max-height:500px)]:text-base" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">{b.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed [@media(max-height:500px)]:text-xs">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CartTransferHandler />
      <Footer />
    </>
  );
}