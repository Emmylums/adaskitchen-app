import React, { useEffect } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom"; 
import bg from "../assets/background.jpeg";
import Footer from "../components/Footer";

export default function Catering() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [activeFAQ, setActiveFAQ] = useState(null);

    // Catering services data
    const cateringServices = [
        {
            title: "Wedding Catering",
            description: "Make your special day unforgettable with our exquisite wedding catering services. From traditional Nigerian dishes to international cuisine, we create memorable dining experiences for you and your guests.",
            image: "💍"
        },
        {
            title: "Corporate Events",
            description: "Impress your clients and colleagues with our professional corporate catering. Perfect for meetings, conferences, office parties, and corporate gatherings.",
            image: "🏢"
        },
        {
            title: "Private Parties",
            description: "From birthday celebrations to family reunions, we bring the authentic taste of Nigeria to your private events with customizable menus and professional service.",
            image: "🎉"
        },
        {
            title: "Cultural Events",
            description: "Celebrate your heritage with our authentic African cuisine. Perfect for cultural festivals, traditional ceremonies, and community events.",
            image: "🌍"
        }
    ];

    // Catering packages
    const cateringPackages = [
        {
            name: "Basic Package",
            price: "£15",
            perPerson: "per person",
            features: [
                "2 Main Course Options",
                "2 Side Dishes",
                "Soft Drinks",
                "Basic Setup & Service",
                "Up to 50 guests"
            ]
        },
        {
            name: "Premium Package",
            price: "£25",
            perPerson: "per person",
            features: [
                "3 Main Course Options",
                "3 Side Dishes",
                "Appetizers",
                "Soft Drinks & Juice",
                "Full Setup & Professional Service",
                "Up to 100 guests"
            ]
        },
        {
            name: "Executive Package",
            price: "£40",
            perPerson: "per person",
            features: [
                "4 Main Course Options",
                "4 Side Dishes",
                "Premium Appetizers",
                "Full Bar Service (optional)",
                "Dessert Station",
                "Premium Setup & Staff",
                "Custom Menu Planning",
                "Unlimited guests"
            ]
        }
    ];

    // Process steps
    const processSteps = [
        {
            step: "1",
            title: "Consultation",
            description: "We discuss your event needs, preferences, and dietary requirements to create a customized catering plan."
        },
        {
            step: "2",
            title: "Menu Planning",
            description: "Our chefs craft a personalized menu featuring authentic Nigerian dishes tailored to your event."
        },
        {
            step: "3",
            title: "Booking",
            description: "Secure your date with a deposit and we'll handle all the details from there."
        },
        {
            step: "4",
            title: "Execution",
            description: "Our professional team delivers, sets up, and serves your guests with excellence."
        }
    ];

    // FAQ data
    const faqs = [
        {
            question: "How far in advance should I book catering?",
            answer: "We recommend booking at least 2-3 weeks in advance for smaller events and 4-6 weeks for larger events or weddings to ensure availability."
        },
        {
            question: "Do you provide serving staff and equipment?",
            answer: "Yes, our premium and executive packages include professional serving staff, heating equipment, and serving utensils. Basic setup is included in all packages."
        },
        {
            question: "Can you accommodate dietary restrictions?",
            answer: "Absolutely! We can accommodate vegetarian, vegan, gluten-free, and other dietary needs. Please inform us during the consultation."
        },
        {
            question: "What areas do you serve?",
            answer: "We cater events throughout the city and surrounding areas. Delivery fees may apply for locations outside our primary service area."
        },
        {
            question: "Do you offer tastings?",
            answer: "Yes, we offer tasting sessions for wedding and large event packages. Contact us to schedule a tasting appointment."
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

    return (
        <>
            <NavBar activeLink="Catering" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
            <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Catering" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
            
            {/* Hero Section */}
            <section style={{ backgroundImage: `url(${bg})` }} className="relative h-[50vh] bg-center bg-cover">
                <div className="absolute inset-0 h-[50vh] opacity-70 bg-black" />
                <div className="relative flex items-center justify-center h-full">
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                        <div className="p-10 text-center text-white mt-10 ">
                            <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg drop-shadow-black">CATERING SERVICES</h2>
                            <p className="text-xl mt-4">Bring the authentic taste of Nigeria to your special events</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Introduction Section */}
            <div className="max-w-6xl mx-auto pt-10 pb-20 px-6">
                <h2 className="text-4xl font-bold mb-10 text-center text-own-2 font-display2">Exceptional Catering for Every Occasion</h2>
                <div className="grid md:grid-cols-2 gap-10 items-center text-black">
                    <div>
                        <p className="text-lg leading-8 mb-6">
                            At Ada's Kitchen, we bring the vibrant flavors of authentic Nigerian cuisine to your special events. 
                            Whether you're planning an intimate gathering or a grand celebration, our catering services ensure 
                            your guests experience the rich culinary heritage of West Africa.
                        </p>
                        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true, amount: 0.15 }}>
                            <p className="text-lg leading-8 mb-6">
                                Our experienced team handles every detail, from menu planning to execution, allowing you to 
                                focus on enjoying your event while we take care of the culinary experience.
                            </p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true, amount: 0.15 }}>
                            <p className="text-lg leading-8">
                                Using only the freshest ingredients and traditional recipes passed down through generations, 
                                we create unforgettable dining experiences that celebrate Nigerian culture and cuisine.
                            </p>
                        </motion.div>
                    </div>
                    <motion.div initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true, amount: 0.3 }} className="rounded-3xl overflow-hidden shadow-lg">
                        <div className="w-full h-96 bg-gradient-to-br from-own-2 to-amber-400 flex items-center justify-center">
                            <span className="text-8xl">🎂</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Services Section */}
            <section className="py-20 bg-own-2">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-white mb-16 font-display2">Our Catering Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {cateringServices.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="text-4xl mb-4">{service.image}</div>
                                <h3 className="text-2xl font-bold text-own-2 mb-4">{service.title}</h3>
                                <p className="text-gray-700 leading-relaxed">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Packages Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-own-2 mb-16 font-display2">Catering Packages</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {cateringPackages.map((pkg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="text-center bg-white p-6 rounded-2xl shadow-md border-2 border-own-2 text-black"
                            >
                                <h3 className="text-2xl font-bold text-own-2 mb-4">{pkg.name}</h3>
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-own-2">{pkg.price}</span>
                                    <span className="text-gray-600"> {pkg.perPerson}</span>
                                </div>
                                <ul className="text-left space-y-3 mb-6">
                                    {pkg.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <span className="w-2 h-2 bg-own-2 rounded-full mr-3"></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full py-3 bg-own-2 text-white rounded-full font-semibold hover:bg-amber-600 transition">
                                    Get Quote
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-20 bg-own-2">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-white mb-16 font-display2">Our Process</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {processSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center text-white"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-own-2">{step.step}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-gray-100">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <div className="py-20 bg-own-2 text-center text-white">
                <h2 className="text-4xl font-bold mb-6">Ready to Plan Your Event?</h2>
                <p className="text-lg mb-8">Contact us today for a personalized catering consultation and quote</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/ContactUs">
                        <button className="px-8 py-4 bg-white text-own-2 font-semibold text-lg rounded-full shadow-lg hover:bg-gray-100 transition">
                            Contact Us
                        </button>
                    </Link>
                    <a href="tel:+2349124354006">
                        <button className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-full shadow-lg hover:bg-white hover:text-own-2 transition">
                            Call Now
                        </button>
                    </a>
                </div>
            </div>
            
            <Footer/>
        </>
    );
}