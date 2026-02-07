import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import cooking from "../assets/cooking5.jpeg";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import bg from "../assets/background.jpeg";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, doc, getDoc } from "firebase/firestore";

export default function OurStory() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [activeFAQ, setActiveFAQ] = useState(null);
    const [chef, setChef] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch chef data and gallery images from Firebase
    // Updated fetchData function - replace the existing one
const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
        // Fetch chef data - check all possible paths including the Settings page location
        let chefData = null;
        
        try {
                const chefRef = doc(db, "settings", "chefInfo"); 
                const chefSnapshot = await getDoc(chefRef);
                console.log(chefSnapshot);
                
                if (chefSnapshot.exists()) {
                    const data = chefSnapshot.data();
                    console.log("Fetched chef data from settings/chefInfo:", data);
                    
                    // Map the data to match your Settings.jsx structure
                    chefData = {
                        id: chefSnapshot.id,
                        name: data.name || "Ada Johnson",
                        bio: data.bio || "With over 15 years of culinary experience, Ada brings her grandmother's traditional recipes to life with a modern twist.",
                        image: data.imageUrl || null // This should be the Firebase Storage URL
                    };
                }
            } catch (chefError) {
                console.error("Error fetching chef info:", chefError);
            }
            
            // If no chef data found, use defaults
            if (!chefData) {
                console.log("Using default chef data");
                chefData = {
                    name: "Ada Johnson",
                    bio: "With over 15 years of culinary experience, Ada brings her grandmother's traditional recipes to life with a modern twist.",
                    image: null
                };
            }
            
            setChef(chefData);
            
        // Fetch gallery images
        try {
            const galleryRef = collection(db, "gallery");
            const galleryQuery = query(galleryRef);
            const gallerySnapshot = await getDocs(galleryQuery);
            
            let galleryData = [];
            
            if (!gallerySnapshot.empty) {
                gallerySnapshot.forEach((doc) => {
                    try {
                        const data = doc.data();
                        // Validate the data
                        if (data && (data.image || data.imageUrl || data.url || data.photo)) {
                            galleryData.push({
                                id: doc.id,
                                alt: data.alt || data.title || data.name || data.description || "Gallery image",
                                image: data.image || data.imageUrl || data.url || data.photo,
                                title: data.title || data.name || data.caption || ""
                            });
                        }
                    } catch (docError) {
                        console.error(`Error processing gallery doc ${doc.id}:`, docError);
                    }
                });
            }
            
            // Use default gallery images if none found
            if (galleryData.length === 0) {
                console.log("No gallery images found, using defaults");
                galleryData = [
                    { id: 1, alt: "Traditional Nigerian Jollof Rice", title: "Signature Jollof Rice" },
                    { id: 2, alt: "Chef preparing Suya", title: "Suya Preparation" },
                    { id: 3, alt: "Colorful African spices", title: "Our Spices" },
                    { id: 4, alt: "Customers enjoying meal", title: "Happy Customers" },
                    { id: 5, alt: "Catering event setup", title: "Event Catering" },
                    { id: 6, alt: "Fresh ingredients preparation", title: "Fresh Ingredients" }
                ];
            }
            
            setGalleryImages(galleryData);
            
        } catch (galleryError) {
            console.error("Error fetching gallery:", galleryError);
            // Set default gallery images
            setGalleryImages([
                { id: 1, alt: "Traditional Nigerian Jollof Rice", title: "Signature Jollof Rice" },
                { id: 2, alt: "Chef preparing Suya", title: "Suya Preparation" },
                { id: 3, alt: "Colorful African spices", title: "Our Spices" },
                { id: 4, alt: "Customers enjoying meal", title: "Happy Customers" },
                { id: 5, alt: "Catering event setup", title: "Event Catering" },
                { id: 6, alt: "Fresh ingredients preparation", title: "Fresh Ingredients" }
            ]);
        }
        
    } catch (err) {
        console.error("Critical error in fetchData:", err);
        setError("We're having trouble loading our story. Please refresh the page or try again later.");
        
        // Set defaults
        setChef({
            name: "Ada Johnson",
            bio: "With over 15 years of culinary experience, Ada brings her grandmother's traditional recipes to life with a modern twist.",
            image: null
        });
        
        setGalleryImages([
            { id: 1, alt: "Traditional Nigerian Jollof Rice", title: "Gallery image" },
            { id: 2, alt: "Chef preparing Suya", title: "Gallery image" },
            { id: 3, alt: "Colorful African spices", title: "Gallery image" },
            { id: 4, alt: "Customers enjoying meal", title: "Gallery image" },
            { id: 5, alt: "Catering event setup", title: "Gallery image" },
            { id: 6, alt: "Fresh ingredients preparation", title: "Gallery image" }
        ]);
    } finally {
        setLoading(false);
    }
};
    useEffect(() => {
        fetchData();
    }, []);

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
                    setTimeout(() => {
                        faqSection.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // Loading state
    if (loading) {
        return (
            <>
                <NavBar activeLink="Our Story" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
                <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Our Story" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
                <div className="flex justify-center items-center h-screen bg-own-1">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading ...</p>
                    </div>
                </div>
                <Footer/>
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <NavBar activeLink="Our Story" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
                <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Our Story" onClose={() => setMobileNavBarVisible(false)} className="md:colspan-1 pt-7"/>
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center p-6 bg-red-50 rounded-lg">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-own-2 text-black px-4 py-2 rounded-md"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
                <Footer/>
            </>
        );
    }

    return (
        <>
            <NavBar activeLink="Our Story" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
            <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Our Story" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
            
            {/* Hero Section */}
            <section style={{ backgroundImage: `url(${bg})` }} className="relative h-[50vh] bg-center bg-cover">
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
                    <h2 className="text-4xl font-bold text-center text-own-2 mb-16 font-display2">About The Chef</h2>
                    <div className="flex justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center bg-white p-8 rounded-2xl shadow-md max-w-md"
                        >
                            {chef?.image ? (
                                <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-own-2">
                                    <img 
                                        src={chef.image} 
                                        alt={chef.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<span class="text-4xl text-white bg-own-2 w-full h-full flex items-center justify-center">👨‍🍳</span>';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-own-2 to-amber-400 rounded-full flex items-center justify-center">
                                    <span className="text-4xl text-white">👨‍🍳</span>
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-own-2 mb-2">{chef?.name || "Ada Johnson"}</h3>
                            <p className="text-gray-700">{chef?.bio || "With over 15 years of culinary experience, Ada brings her grandmother's traditional recipes to life with a modern twist."}</p>
                        </motion.div>
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
                                key={image.id || index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg flex items-center justify-center"
                            >
                                {image.image ? (
                                    <img 
                                        src={image.image} 
                                        alt={image.alt || image.title || "Gallery image"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `<span class="text-3xl text-gray-400">📸</span><p class="text-sm text-gray-600 mt-2 text-center px-2">${image.alt || image.title || "Gallery image"}</p>`;
                                        }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <span className="text-3xl text-gray-400 mb-2">📸</span>
                                        <p className="text-sm text-gray-600 text-center">{image.alt || image.title || "Gallery image"}</p>
                                    </div>
                                )}
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
                                className="border-b border-gray-200 pb-4 w-full"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="flex items-center justify-between w-full text-left py-4 font-semibold text-lg text-own-2 hover:text-amber-600 transition-colors"
                                >
                                    <span className="pr-4">{faq.question}</span>
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
                                    className="overflow-hidden w-full"
                                >
                                    <p className="text-gray-700 pb-4 w-full">{faq.answer}</p>
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
                <Link to="/menu">
                    <button className="px-8 py-4 bg-white text-own-2 font-semibold text-lg rounded-full shadow-lg hover:bg-gray-100 transition">
                        Order Online
                    </button>
                </Link>
            </div>
            
            <Footer/>
        </>
    );
}