import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import bg from "../assets/bgcont.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle, faLock, faEye, faEyeSlash, faSpinner, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function ResetPassword() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
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

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError("Invalid password reset link. Missing reset code.");
        setVerifying(false);
        return;
      }
      try {
        const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password || !formData.confirmPassword) return setError("Please fill in both password fields");
    if (formData.password.length < 6) return setError("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    if (!oobCode) return setError("Invalid reset code. Please request a new password reset link.");

    try {
      setLoading(true);
      setError("");
      await confirmPasswordReset(auth, oobCode, formData.password);
      setSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === "auth/expired-action-code") setError("This password reset link has expired. Please request a new one.");
      else if (err.code === "auth/invalid-action-code") setError("Invalid password reset link. Please request a new one.");
      else if (err.code === "auth/user-disabled") setError("This account has been disabled. Please contact support.");
      else if (err.code === "auth/user-not-found") setError("No account found with this email.");
      else setError(`Failed to reset password: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
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
              New Beginning
            </span>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-tight mb-4 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-1 [@media(max-height:400px)]:text-lg">
              Set New <span className="text-own-2">Password</span>
            </h1>
            <p className="text-lg text-white/80 [@media(max-height:500px)]:text-sm">
              Secure your account with a fresh password
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
              <h2 className="text-2xl md:text-3xl font-bold text-center text-[oklch(29.23%_0_0)] mb-8 font-display [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-4">
                Set New Password
              </h2>

              {verifying ? (
                <div className="py-12 text-center [@media(max-height:500px)]:py-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-own-2 mx-auto mb-4 flex items-center justify-center [@media(max-height:500px)]:h-12 [@media(max-height:500px)]:w-12 [@media(max-height:500px)]:mb-2">
                    <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-own-2 [@media(max-height:500px)]:h-6 [@media(max-height:500px)]:w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">Verifying Reset Link...</h3>
                  <p className="text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:text-sm">Please wait while we verify your password reset link</p>
                </div>
              ) : error && !success ? (
                <div className="py-8 text-center [@media(max-height:500px)]:py-3">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center [@media(max-height:500px)]:w-12 [@media(max-height:500px)]:h-12 [@media(max-height:500px)]:mb-2">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-8 w-8 text-red-500 [@media(max-height:500px)]:h-6 [@media(max-height:500px)]:w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">Link Verification Failed</h3>
                  <p className="text-red-600 mb-6 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-3">{error}</p>
                  <Link
                    to="/forgot-password"
                    className="inline-flex items-center justify-center w-full py-3 px-4 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold rounded-full transition-colors [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                  >
                    Request New Reset Link <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ) : success ? (
                <div className="py-8 text-center [@media(max-height:500px)]:py-3">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center [@media(max-height:500px)]:w-12 [@media(max-height:500px)]:h-12 [@media(max-height:500px)]:mb-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-8 w-8 text-green-500 [@media(max-height:500px)]:h-6 [@media(max-height:500px)]:w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">Password Reset Successful!</h3>
                  <p className="text-[oklch(40%_0.05_100)] mb-6 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-3">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                  {email && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-2.5">
                      <p className="text-sm text-blue-700 [@media(max-height:500px)]:text-xs">
                        Reset for: <span className="font-medium">{email}</span>
                      </p>
                    </div>
                  )}
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full py-3 px-4 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold rounded-full transition-colors [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                  >
                    Go to Login <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <>
                  {email && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-2.5">
                      <p className="text-sm text-blue-700 text-center [@media(max-height:500px)]:text-xs">
                        Reset password for: <span className="font-medium">{email}</span>
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5 [@media(max-height:500px)]:space-y-3">
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-xs">
                        New Password
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                          placeholder="Enter new password"
                          minLength="6"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-5 w-5 text-gray-400 hover:text-own-2" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-xs">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] disabled:bg-gray-100 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                          placeholder="Confirm new password"
                          minLength="6"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="h-5 w-5 text-gray-400 hover:text-own-2" />
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl [@media(max-height:500px)]:p-2.5">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-500 mr-3 [@media(max-height:500px)]:h-4 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:mr-2" />
                          <p className="text-red-700 text-sm [@media(max-height:500px)]:text-xs">{error}</p>
                        </div>
                      </div>
                    )}

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
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center [@media(max-height:500px)]:mt-3">
                    <Link to="/login" className="text-sm text-own-2 hover:text-amber-600 transition-colors [@media(max-height:500px)]:text-xs">
                      Back to Login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}