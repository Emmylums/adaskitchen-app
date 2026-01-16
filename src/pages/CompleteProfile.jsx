// CompleteProfile.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bg from "../assets/background.jpeg";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faUser } from "@fortawesome/free-solid-svg-icons";

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
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!phone.trim()) {
            setError("Phone number is required");
            return;
        }

        // Basic phone validation
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
            setError("Please enter a valid phone number");
            return;
        }

        try {
            setLoading(true);
            
            const userRef = doc(db, "users", user.uid);
            
            await updateDoc(userRef, {
                phone: phone.trim(),
                updatedAt: new Date().toISOString(),
                // Enable SMS notifications now that we have phone
                contactPreferences: {
                    email: true,
                    sms: true,
                    push: true
                }
            });

            // Redirect based on context
            if (existing) {
                navigate("/user/dashboard");
            } else {
                navigate("/user/welcome");
            }
            
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Complete Your Profile
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {source === "google" 
                        ? "Google didn't provide your phone number. Please add it below."
                        : "Please provide your phone number to complete your profile."
                    }
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number *
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faPhone} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={loading}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-own-2 focus:border-own-2 sm:text-sm"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Required for delivery updates and SMS notifications
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-own-2 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-own-2 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Complete Profile"}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate("/user/dashboard")}
                                className="text-sm text-own-2 hover:text-amber-600"
                            >
                                Skip for now
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}