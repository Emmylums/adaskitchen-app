// Maintenance.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRocket, 
  faGem, 
  faSeedling, 
  faHeart,
  faStar,
  faFire,
  faBolt,
  faTrophy,
  faMagnet,
  faUtensils,
  faShieldAlt,
  faLeaf,
  faAward,
  faCrown,
  faPepperHot
} from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram, faTiktok } from "@fortawesome/free-brands-svg-icons";

export default function Maintenance() {
    const [launchDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 14); // 14 days from now
        return date;
    });

    const [countdown, setCountdown] = useState("");
    const navigate = useNavigate();

    // Countdown to launch
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const diff = launchDate - now;
            
            if (diff <= 0) {
                setCountdown("We're Live! Launching Now...");
                setTimeout(() => navigate("/"), 2000);
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setCountdown(`${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
        };
        
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        
        return () => clearInterval(interval);
    }, [launchDate, navigate]);

    const launchFeatures = [
        {
            icon: faUtensils, // Replaced faChefHat with faUtensils
            title: "Secret Family Recipes",
            description: "Ada's treasured recipes passed down through generations",
            color: "from-yellow-500 to-amber-600"
        },
        {
            icon: faPepperHot, // Added faPepperHot for fiery flavors
            title: "Fiery Flavors",
            description: "Authentic Nigerian spices that will ignite your taste buds",
            color: "from-red-500 to-orange-600"
        },
        {
            icon: faGem,
            title: "Premium Ingredients",
            description: "Sourced from the finest local markets and producers",
            color: "from-emerald-500 to-teal-600"
        },
        {
            icon: faHeart,
            title: "Made with Love",
            description: "Every dish prepared with passion and tradition",
            color: "from-pink-500 to-rose-600"
        }
    ];

    const anticipationMoments = [
        "The perfect jollof rice is almost ready...",
        "Our kitchen is heating up with anticipation...",
        "Traditional flavors are being perfected...",
        "Something delicious is brewing...",
        "Get ready for a taste of home..."
    ];

    const [currentMoment, setCurrentMoment] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMoment((prev) => (prev + 1) % anticipationMoments.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Main Content */}
            <section className="relative min-h-screen bg-gradient-to-br from-own-1 via-gray-900 to-own-1 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Floating particles */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-4 h-4 bg-own-2/20 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -100, 0],
                                x: [0, Math.random() * 50 - 25, 0],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                    
                    {/* Gradient orbs */}
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-own-2/20 to-amber-600/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-600/20 to-own-2/20 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-6xl mx-auto text-center"
                    >
                        {/* Launch Icon */}
                        <div className="mb-8">
                            <motion.div
                                animate={{ 
                                    y: [0, -20, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                                className="inline-flex items-center justify-center w-40 h-40 bg-gradient-to-br from-own-2 via-amber-500 to-own-2 rounded-full shadow-2xl mb-6 relative"
                            >
                                <FontAwesomeIcon 
                                    icon={faRocket} 
                                    className="text-white text-6xl"
                                />
                                
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-own-2/40 to-amber-600/40 rounded-full blur-xl animate-pulse"></div>
                                
                                {/* Particle trail */}
                                <motion.div
                                    animate={{
                                        x: [0, 50, 100],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                    className="absolute -right-4 top-1/2 w-20 h-1 bg-gradient-to-r from-own-2 to-transparent"
                                />
                            </motion.div>
                        </div>

                        {/* Main Title */}
                        <motion.h1
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-display relative"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-own-2 via-amber-400 to-own-2">
                                ANTICIPATE
                            </span>
                            
                            {/* Text shadow glow */}
                            <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-own-2 via-amber-400 to-own-2 blur-xl opacity-50 -z-10">
                                ANTICIPATE
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-2xl md:text-3xl text-gray-300 mb-4"
                        >
                            Ada's Kitchen is Launching Soon!
                        </motion.p>

                        {/* Animated anticipation moment */}
                        <motion.div
                            key={currentMoment}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-xl md:text-2xl text-own-2 italic mb-8 min-h-[3rem]"
                        >
                            {anticipationMoments[currentMoment]}
                        </motion.div>

                        {/* Countdown Timer
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="mb-12"
                        >
                            <div className="inline-block bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl">
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Launching In
                                </h2>
                                <div className="text-4xl md:text-6xl font-bold font-mono mb-2">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-own-2 via-yellow-400 to-own-2 animate-pulse">
                                        {countdown}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    Estimated launch: {launchDate.toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                        </motion.div> */}

                        {/* Launch Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                            {launchFeatures.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30, rotateX: 90 }}
                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                    transition={{ 
                                        delay: 0.8 + (index * 0.1), 
                                        duration: 0.5,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    whileHover={{ 
                                        y: -10, 
                                        scale: 1.05,
                                        transition: { duration: 0.2 }
                                    }}
                                    className="relative group"
                                >
                                    <div className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 shadow-xl transform transition-all duration-300`}>
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                                            <FontAwesomeIcon 
                                                icon={feature.icon} 
                                                className="text-white text-2xl"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                        <p className="text-gray-100 text-sm opacity-90">{feature.description}</p>
                                        
                                        {/* Glow effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    
                                    {/* Floating sparkle */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 180, 360],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="absolute -top-2 -right-2"
                                    >
                                        <FontAwesomeIcon 
                                            icon={faStar} 
                                            className="text-yellow-300 text-sm"
                                        />
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Coming Soon Highlights */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            className="mb-16"
                        >
                            <h2 className="text-3xl font-bold text-white mb-8">
                                What's Cooking...
                            </h2>
                            <div className="flex flex-wrap justify-center gap-4">
                                {["Jollof Rice", "Egusi Soup", "Pounded Yam", "Suya", "Plantain"].map((dish, index) => (
                                    <motion.span
                                        key={dish}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.4 + (index * 0.05), duration: 0.3 }}
                                        whileHover={{ scale: 1.1 }}
                                        className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20 hover:border-own-2 transition-all cursor-default"
                                    >
                                        {dish}
                                    </motion.span>
                                ))}
                            </div>
                            <p className="text-white pt-10 text-3xl font-black font-display2 animate-bounce">And Many More ...</p>
                        </motion.div>

                        {/* Social Media */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.6, duration: 0.5 }}
                            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
                        >
                            <h3 className="text-2xl font-bold text-white mb-6">
                                Join the Anticipation
                            </h3>
                            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                                Follow us for exclusive sneak peeks, behind-the-scenes, and launch announcements!
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                                <div className="flex gap-8 text-5xl">
                                    <motion.a
                                        href="https://www.facebook.com/share/164XsAbtot/?mibextid=wwXIfr"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ y: -5, scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faFacebook} />
                                    </motion.a>
                                    <motion.a
                                        href="https://www.instagram.com/adaskitchen56?igsh=anhpMHFob29sM294&utm_source=qr"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ y: -5, scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-pink-400 hover:text-pink-300 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faInstagram} />
                                    </motion.a>
                                    <motion.a
                                        href="https://www.tiktok.com/@adaskitchen56?_r=1&_t=ZN-93JbvXrIsWU"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ y: -5, scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-white hover:text-gray-300 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTiktok} />
                                    </motion.a>
                                </div>
                                
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                    className="flex items-center gap-3 bg-gradient-to-r from-own-2/20 to-amber-600/20 px-6 py-3 rounded-full border border-own-2/30"
                                >
                                    <FontAwesomeIcon icon={faMagnet} className="text-own-2" />
                                    <span className="text-white font-medium">#AdasKitchenLaunch</span>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Final CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2, duration: 0.5 }}
                            className="mt-16"
                        >
                            <div className="text-gray-400 italic text-lg">
                                <p className="mb-2">Get ready to experience Nigerian cuisine like never before</p>
                                <div className="flex items-center justify-center gap-2">
                                    <motion.span
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        •
                                    </motion.span>
                                    <span>Tradition meets innovation</span>
                                    <motion.span
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                                    >
                                        •
                                    </motion.span>
                                    <span>Flavors that tell stories</span>
                                    <motion.span
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                                    >
                                        •
                                    </motion.span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Floating elements */}
                <motion.div
                    animate={{
                        y: [0, -100, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-1/4 left-10 opacity-10"
                >
                    <FontAwesomeIcon icon={faSeedling} className="text-6xl text-own-2" />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, 100, 0],
                        rotate: [0, -180, -360],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-1/4 right-10 opacity-10"
                >
                    <FontAwesomeIcon icon={faTrophy} className="text-6xl text-amber-500" />
                </motion.div>
            </section>
        </>
    );
}