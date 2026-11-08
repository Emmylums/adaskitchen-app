import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import bg from "../assets/bgcont.jpeg";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faExclamationCircle, faCheckCircle, faArrowLeft, faKey, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
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

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: false,
      });
      setEmailSent(true);
      setSuccess(`Password reset link sent to ${email}. Please check your inbox.`);
    } catch (err) {
      console.error("Password reset error:", err);
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address format.");
          break;
        case "auth/user-not-found":
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
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Login" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      {/* HERO */}
      <section className="relative h-[50vh] min-h-[240px] overflow-hidden [@media(max-height:500px)]:h-[45vh] [@media(max-height:500px)]:min-h-[190px] [@media(max-height:400px)]:min-h-[170px]">
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
              Account Recovery
            </span>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-tight mb-4 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-1 [@media(max-height:400px)]:text-lg">
              Reset Password
            </h1>
            <p className="text-lg text-white/80 [@media(max-height:500px)]:text-sm">
              Recover access to your Ada's Kitchen account
            </p>
          </motion.div>
        </div>
      </section>

      {/* FORM */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50 [@media(max-height:600px)]:py-6 [@media(max-height:500px)]:py-4 [@media(max-height:500px)]:px-2">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden [@media(max-height:500px)]:rounded-2xl"
          >
            <div className="h-1.5 bg-gradient-to-r from-own-2 via-[oklch(85%_0.171_83.42)] to-own-2" />
            <div className="p-8 md:p-10 [@media(max-height:600px)]:p-5 [@media(max-height:500px)]:p-4">
              <div className="mb-6 [@media(max-height:500px)]:mb-3">
                <Link to="/login" className="inline-flex items-center text-sm text-own-2 hover:text-amber-600 transition-colors font-medium [@media(max-height:500px)]:text-xs">
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" />
                  Back to Login
                </Link>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-center text-[oklch(29.23%_0_0)] mb-2 font-display [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-1">
                Forgot Password
              </h2>
              <p className="text-center text-[oklch(40%_0.05_100)] mb-8 text-sm [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:text-xs">
                {emailSent ? "Check your email for reset instructions" : "Enter your email and we'll send you a reset link"}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-2.5">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0 [@media(max-height:500px)]:h-4 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:mr-2" />
                    <p className="text-sm text-red-700 font-medium [@media(max-height:500px)]:text-xs">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-2.5">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 [@media(max-height:500px)]:h-4 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:mr-2" />
                    <div className="flex-1">
                      <p className="text-sm text-green-700 font-medium mb-2 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mb-1">{success}</p>
                      {emailSent && (
                        <ul className="text-xs text-green-600 space-y-1 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:space-y-0.5">
                          <li>• Check your spam/junk folder if you don't see the email</li>
                          <li>• The reset link expires in 1 hour</li>
                          <li>• You can only request a new link after 1 minute</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!emailSent ? (
                <form onSubmit={handleSubmit} className="space-y-5 [@media(max-height:500px)]:space-y-3">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                        placeholder="Enter your registered email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold py-4 rounded-full tracking-wide transition-all duration-300 shadow-md disabled:opacity-50 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending Reset Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 [@media(max-height:500px)]:space-y-2">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 [@media(max-height:500px)]:p-3">
                    <h4 className="font-medium text-blue-800 mb-2 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-1">What to do next:</h4>
                    <ol className="list-decimal pl-5 space-y-1 text-sm text-blue-700 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:space-y-0.5">
                      <li>Open the email from Ada's Kitchen</li>
                      <li>Click the "Reset Password" button in the email</li>
                      <li>You'll be redirected to create a new password</li>
                      <li>Log in with your new password</li>
                    </ol>
                  </div>

                  <button
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="w-full py-3 px-4 border-2 border-own-2 rounded-full text-sm font-semibold text-own-2 hover:bg-amber-50 transition-colors disabled:opacity-50 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-xs"
                  >
                    Resend Email
                  </button>
                  <Link
                    to="/login"
                    className="block w-full py-3 px-4 bg-[oklch(29.23%_0_0)] hover:bg-own-2 hover:text-[oklch(29.23%_0_0)] text-white font-semibold rounded-full text-center transition-colors [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-xs"
                  >
                    Back to Login
                  </Link>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200 text-center [@media(max-height:500px)]:mt-4 [@media(max-height:500px)]:pt-3">
                <p className="text-sm text-[oklch(40%_0.05_100)] mb-2 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mb-1">Still having trouble?</p>
                <Link to="/contact" className="text-sm font-medium text-own-2 hover:text-amber-600 transition-colors [@media(max-height:500px)]:text-xs">
                  Contact our support team
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TIPS SECTION */}
      <section className="py-20 px-4 sm:px-6 bg-own-1 [@media(max-height:600px)]:py-8 [@media(max-height:500px)]:py-6 [@media(max-height:500px)]:px-3">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 [@media(max-height:600px)]:mb-6 [@media(max-height:500px)]:mb-3"
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Stay Protected
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display [@media(max-height:500px)]:text-xl">
              Password Security Tips
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [@media(max-height:500px)]:gap-3">
            {[
              { icon: faKey, title: "Create Strong Passwords", points: ["Use at least 12 characters", "Mix letters, numbers & symbols", "Avoid common words & phrases"] },
              { icon: faShieldAlt, title: "Stay Protected", points: ["Never share your password", "Use different passwords for different sites", "Consider using a password manager"] },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-own-2/50 transition-all duration-300 [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:rounded-2xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-own-2 flex items-center justify-center mb-6 [@media(max-height:500px)]:w-10 [@media(max-height:500px)]:h-10 [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:rounded-xl">
                  <FontAwesomeIcon icon={card.icon} className="text-[oklch(29.23%_0_0)] text-xl [@media(max-height:500px)]:text-sm" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">{card.title}</h3>
                <ul className="space-y-2 [@media(max-height:500px)]:space-y-1">
                  {card.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-3 text-white/70 text-sm [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:text-xs">
                      <div className="w-1.5 h-1.5 bg-own-2 rounded-full mt-2 flex-shrink-0 [@media(max-height:500px)]:mt-1.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}