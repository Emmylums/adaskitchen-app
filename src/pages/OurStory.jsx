import React, { useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import cooking from "../assets/cooking.png";
import { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function OurStory() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [activeFAQ, setActiveFAQ] = useState(null);

    // Team data
    const teamMembers = [
        {
            name: "Ada Johnson",
            role: "Founder & Head Chef",
            bio: "With over 15 years of culinary experience, Ada brings her grandmother's traditional recipes to life with a modern twist.",
        },
        {
            name: "Michael Chen",
            role: "Executive Chef",
            bio: "Specializing in West African cuisine, Michael ensures every dish maintains authentic flavors while meeting high standards.",
        },
        {
            name: "Sarah Williams",
            role: "Operations Manager",
            bio: "Sarah ensures smooth operations and that every customer experience exceeds expectations.",
        }
    ];

    // Gallery images
    const galleryImages = [
        { alt: "Traditional Nigerian Jollof Rice" },
        { alt: "Chef preparing Suya" },
        { alt: "Colorful African spices" },
        { alt: "Customers enjoying meal" },
        { alt: "Catering event setup" },
        { alt: "Fresh ingredients preparation" }
    ];

    // Mission & Values
    const missionValues = [
        {
            title: "Our Mission",
            description: "To share the authentic flavors of African cuisine with the world, preserving traditional recipes while innovating for modern palates. We strive to create memorable dining experiences that celebrate our rich cultural heritage."
        },
        {
            title: "Community First",
            description: "We believe in building strong community connections. Through local sourcing, community events, and supporting African-owned businesses, we're committed to giving back to the community that supports us."
        },
        {
            title: "Sustainability",
            description: "We're committed to environmentally responsible practices, from sourcing local ingredients to reducing food waste and using eco-friendly packaging in our operations."
        },
        {
            title: "Quality & Excellence",
            description: "Every dish is prepared with the highest quality ingredients and meticulous attention to detail. We never compromise on quality, ensuring each meal meets our exacting standards."
        }
    ];

    // FAQ data
    const faqs = [
        {
            question: "Where do you source your ingredients?",
            answer: "We source our ingredients from local African markets and specialty suppliers to ensure authenticity and freshness. Many of our spices are imported directly from West Africa."
        },
        {
            question: "Do you offer catering for events?",
            answer: "Yes! We provide catering services for weddings, corporate events, and private parties. Contact us for custom menu options and pricing."
        },
        {
            question: "Are your dishes suitable for vegetarians?",
            answer: "Absolutely! We have several vegetarian options including our famous Moi Moi, vegetable soups, and plant-based protein dishes."
        },
        {
            question: "How did Ada's Kitchen get started?",
            answer: "Ada started by cooking for friends and family from her home kitchen. The demand grew so much that she decided to share her passion with the community through this restaurant."
        },
        {
            question: "Do you take custom orders?",
            answer: "Yes, we welcome custom orders for special occasions. Please give us at least 48 hours notice for personalized dishes."
        }
    ];

    const toggleFAQ = (index) => {
        setActiveFAQ(activeFAQ === index ? null : index);
    };

    // Handle hash navigation
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#faq') {
                const faqSection = document.getElementById('faq');
                if (faqSection) {
                    // Small delay to ensure the page is fully rendered
                    setTimeout(() => {
                        faqSection.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
        };

        // Check on initial load
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    return (
        <>
            <NavBar activeLink="Our Story" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
            <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Our Story" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
            
            {/* Hero Section */}
            <section className="relative bg-[url(./assets/background4.jpg)] h-[50vh] bg-center bg-cover">
                <div className="absolute inset-0 h-[50vh] opacity-70 bg-black" />
                <div className="relative flex items-center justify-center h-full">
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                        <div className="p-10 text-center text-white mt-10 ">
                            <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg drop-shadow-black">Our Story</h2>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Story Section */}
            <div className="max-w-6xl mx-auto pt-10 pb-20 px-6">
                <h2 className="text-4xl font-bold mb-10 text-center text-own-2 font-display2">The Heart Behind Our Kitchen</h2>
                <div className="grid md:grid-cols-2 gap-10 items-center text-black">
                    <div>
                        <p className="text-lg leading-8 mb-6">
                            Ada's Kitchen was born from a passion for sharing authentic African flavors with the world. Inspired by family recipes passed down through generations, every dish we serve tells a story of tradition, culture, and love.
                        </p>
                        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true, amount: 0.15 }}>
                            <p className="text-lg leading-8 mb-6">
                                Our journey began in a small kitchen where Ada experimented with spices, herbs, and unique cooking methods to create the perfect balance of flavors.
                            </p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true, amount: 0.15 }}>
                            <p className="text-lg leading-8">
                                At Ada's Kitchen, food is more than sustenance — it's a celebration of life, community, and culture.
                            </p>
                        </motion.div>
                    </div>
                    <motion.div initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true, amount: 0.3 }} className="rounded-3xl overflow-hidden shadow-lg">
                        <img src={cooking} alt="Chef cooking" className="w-full object-cover" />
                    </motion.div>
                </div>
            </div>

            {/* Values Section */}
            {/* <div className="bg-own-2 py-20 text-black">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
                    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true, amount: 0.15 }} className="bg-white bg-opacity-10 backdrop-blur-sm p-7 rounded-3xl shadow-lg transition-transform hover:scale-105">
                        <h3 className="text-2xl font-bold mb-4">Fresh Ingredients</h3>
                        <p className="text-md">
                            We hand-pick the freshest produce and finest spices to ensure every meal bursts with authentic flavors.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true, amount: 0.15 }} className="bg-white bg-opacity-10 backdrop-blur-sm p-7 rounded-3xl shadow-lg transition-transform hover:scale-105">
                        <h3 className="text-2xl font-bold mb-4">Family Recipes</h3>
                        <p className="text-md">
                            Our menu is inspired by timeless family recipes that honor our African heritage and culinary traditions.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true, amount: 0.15 }} className="bg-white bg-opacity-10 backdrop-blur-sm p-7 rounded-3xl shadow-lg transition-transform hover:scale-105">
                        <h3 className="text-2xl font-bold mb-4">Passion for Service</h3>
                        <p className="text-md">
                            Every guest is family. We are committed to delivering warm hospitality and exceptional dining experiences.
                        </p>
                    </motion.div>
                </div>
            </div> */}

            {/* Mission & Values Statement Section */}
            <section className="py-20 bg-own-2">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-white mb-16 font-display2">Our Mission & Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {missionValues.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-2xl font-bold text-own-2 mb-4">{item.title}</h3>
                                <p className="text-gray-700 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet the Team Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-own-2 mb-16 font-display2">Meet Our Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="text-center bg-white p-6 rounded-2xl shadow-md"
                            >
                                <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-own-2 to-amber-400 rounded-full flex items-center justify-center">
                                    <span className="text-4xl text-white">👨‍🍳</span>
                                </div>
                                <h3 className="text-2xl font-bold text-own-2 mb-2">{member.name}</h3>
                                <p className="text-gray-600 mb-4">{member.role}</p>
                                <p className="text-gray-700">{member.bio}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Photo Gallery Section */}
            <section className="py-20 bg-own-2">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-white mb-16 font-display2">Behind the Scenes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleryImages.map((image, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg flex items-center justify-center"
                            >
                                <span className="text-3xl text-white">📸</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-own-2 mb-16 font-display2">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="border-b border-gray-200 pb-4 w-full" // Added w-full here
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="flex items-center justify-between w-full text-left py-4 font-semibold text-lg text-own-2 hover:text-amber-600 transition-colors"
                                >
                                    <span className="pr-4">{faq.question}</span> {/* Added padding to prevent text touching plus/minus */}
                                    <span className="text-lg flex-shrink-0">
                                        {activeFAQ === index ? '−' : '+'}
                                    </span>
                                </button>
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ 
                                        opacity: activeFAQ === index ? 1 : 0,
                                        height: activeFAQ === index ? 'auto' : 0
                                    }}
                                    transition={{ 
                                        duration: 0.3,
                                        ease: "easeInOut"
                                    }}
                                    className="overflow-hidden w-full" // Added w-full here
                                >
                                    <p className="text-gray-700 pb-4 w-full">{faq.answer}</p> {/* Added w-full here */}
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <div className="py-10 bg-own-2 text-center text-white">
                <h2 className="text-4xl font-bold mb-6">Be Part of Our Story</h2>
                <p className="text-lg mb-8">Order online and taste the passion behind every dish.</p>
                <Link to="/Menu">
                    <button className="px-8 py-4 bg-white text-own-2 font-semibold text-lg rounded-full shadow-lg hover:bg-gray-100 transition">
                        Order Online
                    </button>
                </Link>
            </div>
            
            <Footer/>
        </>
    );
}