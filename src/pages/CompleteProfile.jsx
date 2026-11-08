import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faArrowRight, faUser } from "@fortawesome/free-solid-svg-icons";
import bg from "../assets/bgcont.jpeg";

export default function CompleteProfile() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const source = queryParams.get("source");
  const existing = queryParams.get("existing") === "true";

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return setError("Phone number is required");

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
      return setError("Please enter a valid phone number");
    }

    try {
      setLoading(true);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        phone: phone.trim(),
        updatedAt: new Date().toISOString(),
        contactPreferences: { email: true, sms: true, push: true },
      });
      navigate("/user/dashboard");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div style={{ backgroundImage: `url(${bg})` }} className="absolute inset-0 bg-center bg-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 py-16 [@media(max-height:500px)]:py-6 [@media(max-height:500px)]:px-3">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden [@media(max-height:500px)]:rounded-2xl"
        >
          {/* Gold top bar */}
          <div className="h-1.5 bg-gradient-to-r from-own-2 via-[oklch(85%_0.171_83.42)] to-own-2" />

          <div className="p-8 md:p-10 [@media(max-height:600px)]:p-5 [@media(max-height:500px)]:p-4">
            <div className="text-center mb-8 [@media(max-height:600px)]:mb-4 [@media(max-height:500px)]:mb-3">
              <div className="w-16 h-16 mx-auto mb-4 bg-own-2 rounded-full flex items-center justify-center [@media(max-height:500px)]:w-12 [@media(max-height:500px)]:h-12 [@media(max-height:500px)]:mb-2">
                <FontAwesomeIcon icon={faUser} className="text-[oklch(29.23%_0_0)] text-2xl [@media(max-height:500px)]:text-lg" />
              </div>
              <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs mb-2 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                One More Step
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[oklch(29.23%_0_0)] font-display [@media(max-height:500px)]:text-xl">
                Complete Your Profile
              </h2>
              <p className="text-[oklch(40%_0.05_100)] text-sm mt-2 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mt-1">
                {source === "google"
                  ? "Google didn't provide your phone number. Please add it below."
                  : "Please provide your phone number to complete your profile."}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:p-2">
                <p className="text-sm text-red-700 font-medium [@media(max-height:500px)]:text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 [@media(max-height:500px)]:space-y-3">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-xs">
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <p className="mt-2 text-xs text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:mt-1 [@media(max-height:500px)]:text-[10px]">
                  Required for delivery updates and SMS notifications
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold py-4 rounded-full tracking-wide transition-all duration-300 shadow-md disabled:opacity-50 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm"
              >
                {loading ? "Saving..." : "Complete Profile"}
                {!loading && <FontAwesomeIcon icon={faArrowRight} className="text-sm" />}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/user/dashboard")}
                  className="text-sm text-[oklch(40%_0.05_100)] hover:text-own-2 transition-colors [@media(max-height:500px)]:text-xs"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}