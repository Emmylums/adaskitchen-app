import React from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);

    // Privacy policy sections
    const privacySections = [
        {
            title: "Information We Collect",
            content: "We collect personal information you provide directly to us, including name, email address, phone number, delivery address, payment information, and dietary preferences. We also automatically collect certain information about your device and usage patterns through cookies and similar technologies.",
            points: [
                "Contact information for order processing and delivery",
                "Payment details for transaction processing",
                "Delivery preferences and address history",
                "Communication preferences and feedback"
            ]
        },
        {
            title: "How We Use Your Information",
            content: "We use the collected information for various purposes including:",
            points: [
                "Processing and delivering your food orders",
                "Communicating order status and updates",
                "Personalizing your dining experience",
                "Improving our services and menu offerings",
                "Sending promotional offers (with your consent)",
                "Ensuring food safety and allergy considerations"
            ]
        },
        {
            title: "Data Sharing and Disclosure",
            content: "We do not sell your personal information. We may share your information with:",
            points: [
                "Delivery partners to fulfill your orders",
                "Payment processors to complete transactions",
                "Service providers who assist our operations",
                "Legal authorities when required by law"
            ]
        },
        {
            title: "Data Security",
            content: "We implement appropriate security measures to protect your personal information. This includes encryption, secure servers, and restricted access to personal data. However, no method of transmission over the Internet is 100% secure.",
            points: []
        },
        {
            title: "Your Rights and Choices",
            content: "You have the right to:",
            points: [
                "Access and review your personal information",
                "Correct inaccurate data",
                "Request deletion of your data",
                "Opt-out of marketing communications",
                "Object to certain processing activities"
            ]
        },
        {
            title: "Cookies and Tracking",
            content: "We use cookies and similar technologies to enhance your experience, analyze site usage, and deliver personalized content. You can control cookie preferences through your browser settings.",
            points: []
        },
        {
            title: "Data Retention",
            content: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.",
            points: []
        },
        {
            title: "Children's Privacy",
            content: "Our services are not directed to individuals under 16. We do not knowingly collect personal information from children without parental consent.",
            points: []
        },
        {
            title: "International Transfers",
            content: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers.",
            points: []
        },
        {
            title: "Changes to This Policy",
            content: "We may update this privacy policy periodically. We will notify you of significant changes through our website or direct communication.",
            points: []
        }
    ];

    // Contact information for data protection
    const contactInfo = {
        dataProtectionOfficer: "dpo@adaskitchen.com",
        generalContact: "hello@adaskitchen.com",
        phone: "+234 912 345 6789",
        address: "123 Main Street, Lagos Island, Lagos, Nigeria"
    };

    return (
        <>
            <NavBar activeLink="Privacy" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
            <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Privacy" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
            
            {/* Hero Section */}
            <section className="relative bg-[url(./assets/background4.jpg)] h-[40vh] bg-center bg-cover">
                <div className="absolute inset-0 h-[40vh] opacity-70 bg-black" />
                <div className="relative flex items-center justify-center h-full">
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                        <div className="p-10 text-center text-white mt-10 ">
                            <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg drop-shadow-black">Privacy Policy</h2>
                            <p className="mt-4 text-lg">How we protect and use your information</p>
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
                        Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        At Ada's Kitchen, we are committed to protecting your privacy and ensuring the security of your personal information. 
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
                    </p>
                </motion.div>

                {/* Key Privacy Principles */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: 0.2 }} 
                    viewport={{ once: true, amount: 0.15 }}
                    className="grid md:grid-cols-3 gap-6 mb-12"
                >
                    <div className="bg-own-2 text-white p-6 rounded-2xl text-center">
                        <div className="text-3xl mb-3">🔒</div>
                        <h3 className="font-bold text-lg mb-2">Transparency</h3>
                        <p className="text-sm">We're clear about how we use your data</p>
                    </div>
                    <div className="bg-amber-600 text-white p-6 rounded-2xl text-center">
                        <div className="text-3xl mb-3">🛡️</div>
                        <h3 className="font-bold text-lg mb-2">Security</h3>
                        <p className="text-sm">Your data is protected with advanced security</p>
                    </div>
                    <div className="bg-own-2 text-white p-6 rounded-2xl text-center">
                        <div className="text-3xl mb-3">⚖️</div>
                        <h3 className="font-bold text-lg mb-2">Control</h3>
                        <p className="text-sm">You have control over your personal information</p>
                    </div>
                </motion.div>

                {/* Privacy Sections */}
                <div className="space-y-8">
                    {privacySections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true, amount: 0.15 }}
                            className="bg-white p-8 rounded-2xl shadow-md border-l-4 border-own-2"
                        >
                            <h3 className="text-2xl font-bold text-own-2 mb-4">{section.title}</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">{section.content}</p>
                            {section.points.length > 0 && (
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    {section.points.map((point, pointIndex) => (
                                        <li key={pointIndex}>{point}</li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, amount: 0.15 }}
                    className="mt-12 bg-gray-50 p-8 rounded-2xl"
                >
                    <h3 className="text-2xl font-bold text-own-2 mb-6 text-center">Contact Our Privacy Team</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-lg mb-4">Data Protection Officer</h4>
                            <p className="text-gray-700">Email: {contactInfo.dataProtectionOfficer}</p>
                            <p className="text-gray-700 mt-2">For privacy-specific inquiries and data subject requests</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-4">General Contact</h4>
                            <p className="text-gray-700">Email: {contactInfo.generalContact}</p>
                            <p className="text-gray-700">Phone: {contactInfo.phone}</p>
                            <p className="text-gray-700">Address: {contactInfo.address}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Consent Acknowledgement */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true, amount: 0.15 }}
                    className="mt-8 text-center text-sm text-gray-600"
                >
                    <p>
                        By using our services, you acknowledge that you have read and understood this Privacy Policy 
                        and agree to the collection, use, and disclosure of your information as described herein.
                    </p>
                </motion.div>
            </div>

            <Footer/>
        </>
    );
}