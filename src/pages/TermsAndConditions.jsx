import React from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function TermsAndConditions() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);

    // Terms sections data
    const termsSections = [
        {
            title: "Acceptance of Terms",
            content: "By accessing and using Ada's Kitchen website, mobile application, and services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services."
        },
        {
            title: "Ordering and Payments",
            content: "All orders are subject to availability and confirmation. Prices are subject to change without notice. We accept various payment methods including credit/debit cards and digital wallets. Payment is processed securely through our payment gateway partners."
        },
        {
            title: "Delivery Policy",
            content: "Delivery times are estimates and may vary due to traffic, weather conditions, and order volume. We are not liable for delays beyond our control. Customers must provide accurate delivery addresses. Failed deliveries due to incorrect addresses may result in additional charges."
        },
        {
            title: "Cancellations and Refunds",
            content: "Orders can be cancelled within 15 minutes of placement. Once food preparation begins, cancellations may not be possible. Refunds are processed according to our refund policy and may take 5-10 business days to reflect in your account."
        },
        {
            title: "User Accounts",
            content: "You are responsible for maintaining the confidentiality of your account credentials. Any activities under your account are your responsibility. We reserve the right to terminate accounts that violate our terms or engage in fraudulent activities."
        },
        {
            title: "Intellectual Property",
            content: "All content on our platform including logos, menu designs, recipes, and website content are property of Ada's Kitchen and protected by intellectual property laws. Unauthorized use is strictly prohibited."
        },
        {
            title: "Limitation of Liability",
            content: "Ada's Kitchen is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific order in question."
        },
        {
            title: "Food Allergies and Dietary Requirements",
            content: "While we take precautions to accommodate dietary needs, we cannot guarantee complete allergen-free preparation. Customers with severe allergies should contact us directly before ordering. We are not liable for allergic reactions."
        },
        {
            title: "Governing Law",
            content: "These terms are governed by the laws of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts in Lagos, Nigeria."
        },
        {
            title: "Changes to Terms",
            content: "We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms."
        }
    ];

    // Important notices
    const importantNotices = [
        "Minimum order value may apply for delivery",
        "Service charges and taxes are included in the final price",
        "Age verification may be required for alcohol purchases",
        "We reserve the right to refuse service to anyone",
        "Promotional offers cannot be combined unless specified"
    ];

    return (
        <>
            <NavBar activeLink="Terms" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
            <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Terms" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
            
            {/* Hero Section */}
            <section className="relative bg-[url(./assets/background4.jpg)] h-[40vh] bg-center bg-cover">
                <div className="absolute inset-0 h-[40vh] opacity-70 bg-black" />
                <div className="relative flex items-center justify-center h-full">
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                        <div className="p-10 text-center text-white mt-10 ">
                            <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg drop-shadow-black">Terms & Conditions</h2>
                            <p className="mt-4 text-lg">Understanding our service agreement</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto pt-10 pb-20 px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }} 
                    viewport={{ once: true, amount: 0.15 }}
                    className="text-center mb-12"
                >
                    <p className="text-lg text-gray-700 mb-6">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-gray-600 max-w-4xl mx-auto">
                        Please read these Terms and Conditions carefully before using our services. These terms outline the rules and regulations for the use of Ada's Kitchen's Website and Services.
                    </p>
                </motion.div>

                {/* Important Notices */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: 0.2 }} 
                    viewport={{ once: true, amount: 0.15 }}
                    className="bg-amber-50 border-l-4 border-own-2 p-6 rounded-lg mb-12"
                >
                    <h3 className="text-2xl font-bold text-own-2 mb-4">Important Notices</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {importantNotices.map((notice, index) => (
                            <li key={index}>{notice}</li>
                        ))}
                    </ul>
                </motion.div>

                {/* Terms Sections */}
                <div className="space-y-8">
                    {termsSections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true, amount: 0.15 }}
                            className="bg-white p-8 rounded-2xl shadow-md border-l-4 border-own-2"
                        >
                            <h3 className="text-2xl font-bold text-own-2 mb-4">{section.title}</h3>
                            <p className="text-gray-700 leading-relaxed">{section.content}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Information */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, amount: 0.15 }}
                    className="mt-12 text-center p-8 bg-gray-50 rounded-2xl"
                >
                    <h3 className="text-2xl font-bold text-own-2 mb-4">Questions?</h3>
                    <p className="text-gray-700 mb-4">
                        If you have any questions about these Terms and Conditions, please contact us:
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 text-own-2 font-semibold">
                        <span>📧 hello@adaskitchen.com</span>
                        <span>📞 +234 912 345 6789</span>
                        <span>📍 123 Main Street, Lagos Island, Lagos</span>
                    </div>
                </motion.div>
            </div>

            <Footer/>
        </>
    );
}