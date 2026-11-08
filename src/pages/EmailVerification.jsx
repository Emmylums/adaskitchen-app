import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import bg from "../assets/bgcont.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faEnvelope,
  faSpinner,
  faArrowRight,
  faExclamationTriangle,
  faKey,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import {
  applyActionCode,
  checkActionCode,
  verifyPasswordResetCode,
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
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  /* ---------- Main effect (logic unchanged) ---------- */
  useEffect(() => {
    const code = searchParams.get("oobCode");
    const modeParam = searchParams.get("mode");
    const apiKey = searchParams.get("apiKey");
    const lang = searchParams.get("lang") || "en";

    console.log("📧 EmailVerification component loaded with params:", {
      oobCode: code ? `${code.substring(0, 10)}...` : "none",
      mode: modeParam,
      apiKey: apiKey ? "present" : "none",
      lang: lang,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    if (code && modeParam) {
      setOobCode(code);
      setMode(modeParam);

      if (modeParam === "verifyEmail") {
        handleEmailVerification(code);
      } else if (modeParam === "resetPassword") {
        handlePasswordResetVerification(code);
      } else {
        setError(`Unknown action mode: ${modeParam}`);
        setVerifying(false);
      }
    } else {
      setError("Invalid verification link. Missing required parameters.");
      console.error("❌ Missing parameters in verification link");
      setVerifying(false);
    }
  }, [searchParams]);

  /* ---------- Email verification (logic unchanged) ---------- */
  const handleEmailVerification = async (code) => {
    try {
      console.log("🔐 Starting email verification process...");

      console.log("🔍 Checking action code validity...");
      const actionCodeInfo = await checkActionCode(auth, code);
      console.log("✅ Action code info:", {
        email: actionCodeInfo.data.email,
        uid: actionCodeInfo.data.uid,
        operation: actionCodeInfo.data.operation,
      });

      const userEmail = actionCodeInfo.data.email;
      const userUid = actionCodeInfo.data.uid;
      setEmail(userEmail);
      setUserId(userUid);

      console.log("📝 Applying action code to verify email...");
      await applyActionCode(auth, code);
      console.log("✅ Email verification applied successfully");

      console.log("📊 Updating Firestore for user:", userUid);
      try {
        const userRef = doc(db, "users", userUid);
        await updateDoc(userRef, {
          emailVerified: true,
          updatedAt: new Date().toISOString(),
          lastVerification: new Date().toISOString(),
        });
        console.log("✅ Firestore updated successfully");

        try {
          const notificationId = `verified_${Date.now()}`;
          const notificationRef = doc(db, "users", userUid, "notifications", notificationId);

          await updateDoc(
            notificationRef,
            {
              id: notificationId,
              type: "verification_success",
              title: "Email Verified!",
              message: `Your email ${userEmail} has been successfully verified.`,
              read: false,
              createdAt: new Date().toISOString(),
              actionUrl: "/login",
            },
            { merge: true }
          );
          console.log("✅ Verification notification created");
        } catch (notifError) {
          console.warn("⚠️ Could not create notification:", notifError);
        }
      } catch (firestoreError) {
        console.warn("⚠️ Could not update Firestore:", firestoreError);
      }

      setVerified(true);
      console.log("🎉 Email verification COMPLETE!");
    } catch (err) {
      console.error("❌ Email verification error:", {
        code: err.code,
        message: err.message,
        fullError: err,
      });

      if (err.code === "auth/expired-action-code") {
        setError("This verification link has expired. Please request a new verification email.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("Invalid verification link. The link may have already been used or is malformed.");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled. Please contact support.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/argument-error") {
        setError("Invalid verification link format. Please check the link and try again.");
      } else {
        setError(`Failed to verify email: ${err.message || "Please try again."}`);
      }
    } finally {
      setVerifying(false);
    }
  };

  /* ---------- Password reset verification (logic unchanged) ---------- */
  const handlePasswordResetVerification = async (code) => {
    try {
      console.log("🔐 Handling password reset verification...");

      const verifiedEmail = await verifyPasswordResetCode(auth, code);
      console.log("✅ Password reset code verified for:", verifiedEmail);

      sessionStorage.setItem("resetPasswordCode", code);
      sessionStorage.setItem("resetPasswordEmail", verifiedEmail);

      console.log("↪️ Redirecting to reset password page...");
      navigate(
        `/reset-password?oobCode=${encodeURIComponent(code)}&email=${encodeURIComponent(verifiedEmail)}`
      );
    } catch (err) {
      console.error("❌ Password reset verification error:", err);

      if (err.code === "auth/expired-action-code") {
        setError("This password reset link has expired. Please request a new one.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("Invalid password reset link. Please request a new one.");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled. Please contact support.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError(`Invalid password reset link: ${err.message || "Please try again."}`);
      }
      setVerifying(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      setVerifying(true);
      setError("");
      navigate("/login");
    } catch (err) {
      setError(`Failed to resend verification: ${err.message}`);
      setVerifying(false);
    }
  };

  /* ---------- Render ---------- */
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
              {mode === "verifyEmail" ? "Account Verification" : mode === "resetPassword" ? "Password Reset" : "Verification"}
            </span>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-tight [@media(max-height:500px)]:text-xl [@media(max-height:400px)]:text-lg">
              {mode === "verifyEmail" ? (
                <>Email <span className="text-own-2">Verification</span></>
              ) : (
                <>Password <span className="text-own-2">Reset</span></>
              )}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50 [@media(max-height:600px)]:py-6 [@media(max-height:500px)]:py-4 [@media(max-height:500px)]:px-2">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden [@media(max-height:500px)]:rounded-2xl"
          >
            <div className="h-1.5 bg-gradient-to-r from-own-2 via-[oklch(85%_0.171_83.42)] to-own-2" />
            <div className="p-8 md:p-10 text-center [@media(max-height:600px)]:p-5 [@media(max-height:500px)]:p-4">

              {/* STATE 1: resetPassword redirect */}
              {mode === "resetPassword" && verifying ? (
                <div className="py-8 [@media(max-height:500px)]:py-3">
                  <div className="relative w-20 h-20 mx-auto mb-6 [@media(max-height:500px)]:w-14 [@media(max-height:500px)]:h-14 [@media(max-height:500px)]:mb-3">
                    <div className="absolute inset-0 bg-own-2/30 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-full bg-own-2 flex items-center justify-center [@media(max-height:500px)]:w-14 [@media(max-height:500px)]:h-14">
                      <FontAwesomeIcon icon={faSpinner} className="h-9 w-9 text-[oklch(29.23%_0_0)] animate-spin [@media(max-height:500px)]:h-6 [@media(max-height:500px)]:w-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">
                    Processing Password Reset...
                  </h3>
                  <p className="text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:text-sm">
                    Redirecting you to password reset page...
                  </p>
                </div>

              /* STATE 2: verifying */
              ) : verifying ? (
                <div className="py-8 [@media(max-height:500px)]:py-3">
                  <div className="relative w-20 h-20 mx-auto mb-6 [@media(max-height:500px)]:w-14 [@media(max-height:500px)]:h-14 [@media(max-height:500px)]:mb-3">
                    <div className="absolute inset-0 bg-own-2/30 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-full bg-own-2 flex items-center justify-center [@media(max-height:500px)]:w-14 [@media(max-height:500px)]:h-14">
                      <FontAwesomeIcon icon={faSpinner} className="h-9 w-9 text-[oklch(29.23%_0_0)] animate-spin [@media(max-height:500px)]:h-6 [@media(max-height:500px)]:w-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">
                    Verifying Your Email...
                  </h3>
                  <p className="text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:text-sm">
                    Please wait while we verify your email address
                  </p>
                  <div className="mt-6 inline-block bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-left [@media(max-height:500px)]:mt-3 [@media(max-height:500px)]:px-3 [@media(max-height:500px)]:py-2">
                    <p className="text-xs text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:text-[10px]">
                      Mode: <span className="font-medium text-[oklch(29.23%_0_0)]">{mode || "Loading..."}</span>
                    </p>
                    <p className="text-xs text-[oklch(40%_0.05_100)] mt-1 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:mt-0.5">
                      Code:{" "}
                      <span className="font-mono text-[oklch(29.23%_0_0)]">
                        {oobCode ? `${oobCode.substring(0, 15)}...` : "No code"}
                      </span>
                    </p>
                  </div>
                </div>

              /* STATE 3: error */
              ) : error ? (
                <div className="py-4 [@media(max-height:500px)]:py-1">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center [@media(max-height:500px)]:w-12 [@media(max-height:500px)]:h-12 [@media(max-height:500px)]:mb-2">
                    <FontAwesomeIcon icon={faExclamationCircle} className="h-8 w-8 text-red-500 [@media(max-height:500px)]:h-6 [@media(max-height:500px)]:w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">
                    {mode === "verifyEmail" ? "Verification Failed" : "Password Reset Failed"}
                  </h3>
                  <p className="text-red-600 mb-4 px-2 text-sm [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:text-xs">{error}</p>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:rounded-xl">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0 [@media(max-height:500px)]:h-4 [@media(max-height:500px)]:w-4" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 mb-2 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mb-1">
                          {mode === "verifyEmail" ? "Troubleshooting Tips:" : "What to do next:"}
                        </p>
                        <ul className="text-xs text-amber-700 space-y-1 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:space-y-0.5">
                          {mode === "verifyEmail" ? (
                            <>
                              <li>• Verification links expire after 24 hours</li>
                              <li>• Try requesting a new verification email from the login page</li>
                              <li>• Check that you haven't already verified this email</li>
                              <li>• Make sure you're clicking the exact link from the email</li>
                            </>
                          ) : (
                            <>
                              <li>• Password reset links expire after 1 hour</li>
                              <li>• Request a new password reset link from the login page</li>
                              <li>• Make sure you're using the exact link from the email</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 [@media(max-height:500px)]:space-y-2">
                    {mode === "verifyEmail" ? (
                      <>
                        <button
                          onClick={resendVerificationEmail}
                          className="w-full inline-flex items-center justify-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold py-3 rounded-full tracking-wide transition-all duration-300 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                        >
                          <FontAwesomeIcon icon={faEnvelope} />
                          Request New Verification Email
                        </button>
                        <Link
                          to="/login"
                          className="w-full inline-flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-own-2 text-[oklch(29.23%_0_0)] font-medium py-3 rounded-full transition-colors [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                        >
                          <FontAwesomeIcon icon={faArrowRight} className="rotate-180" />
                          Go to Login
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/forgot-password"
                          className="w-full inline-flex items-center justify-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold py-3 rounded-full tracking-wide transition-all duration-300 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                        >
                          <FontAwesomeIcon icon={faKey} />
                          Request New Reset Link
                        </Link>
                        <Link
                          to="/login"
                          className="w-full inline-flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-own-2 text-[oklch(29.23%_0_0)] font-medium py-3 rounded-full transition-colors [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                        >
                          <FontAwesomeIcon icon={faArrowRight} className="rotate-180" />
                          Back to Login
                        </Link>
                      </>
                    )}
                  </div>
                </div>

              /* STATE 4: verified success */
              ) : verified && mode === "verifyEmail" ? (
                <div className="py-4 [@media(max-height:500px)]:py-1">
                  <div className="relative w-20 h-20 mx-auto mb-6 [@media(max-height:500px)]:w-14 [@media(max-height:500px)]:h-14 [@media(max-height:500px)]:mb-3">
                    <div className="absolute inset-0 bg-green-400/40 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center [@media(max-height:500px)]:w-14 [@media(max-height:500px)]:h-14">
                      <FontAwesomeIcon icon={faCheckCircle} className="h-10 w-10 text-green-500 [@media(max-height:500px)]:h-7 [@media(max-height:500px)]:w-7" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-4 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-2">
                    Email Verified Successfully!
                  </h3>

                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:rounded-xl">
                    <div className="flex items-center justify-center mb-2 [@media(max-height:500px)]:mb-1">
                      <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-green-500 mr-2 [@media(max-height:500px)]:h-4 [@media(max-height:500px)]:w-4" />
                      <span className="font-semibold text-[oklch(29.23%_0_0)] break-all [@media(max-height:500px)]:text-sm">{email}</span>
                    </div>
                    <p className="text-sm text-green-700 [@media(max-height:500px)]:text-xs">
                      Your email has been verified. You can now log in to your account.
                    </p>
                  </div>

                  <div className="space-y-3 [@media(max-height:500px)]:space-y-2">
                    <Link
                      to="/login"
                      className="w-full inline-flex items-center justify-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold py-3 rounded-full tracking-wide transition-all duration-300 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                    >
                      Go to Login <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </Link>
                    <Link
                      to="/"
                      className="w-full inline-flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-own-2 text-[oklch(29.23%_0_0)] font-medium py-3 rounded-full transition-colors [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-sm"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>

          {/* HELP BOX */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl [@media(max-height:500px)]:mt-3 [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:rounded-xl"
          >
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-1.5">
              <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4" />
              Need help with verification?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1.5 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:space-y-1">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0 [@media(max-height:500px)]:mt-1.5" />
                <span>Check your spam/junk folder for verification emails</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0 [@media(max-height:500px)]:mt-1.5" />
                <span>Email verification links expire after 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0 [@media(max-height:500px)]:mt-1.5" />
                <span>Try requesting a new email from the login page</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0 [@media(max-height:500px)]:mt-1.5" />
                <span>Contact support if you continue to have issues</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}