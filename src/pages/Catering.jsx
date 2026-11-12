import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import bg from "../assets/bgcont.jpeg";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faCheck,
    faPlus,
    faMinus,
    faPhone,
    faHeart,
    faBuilding,
    faGlassCheers,
    faGlobe,
    faAward,
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

/* ------------------------------------------------------------------ */
/*  Contact links (single source of truth)                            */
/* ------------------------------------------------------------------ */
const WHATSAPP_URL =
    "https://wa.me/447466385015?text=Hi%20Ada%27s%20Kitchen!%20I%27d%20like%20to%20enquire%20about%20catering%20for%20an%20event.";

const EMAIL_URL =
    "mailto:info@adaskitchen.uk?subject=Catering%20Booking%20Enquiry&body=Hi%20Ada%27s%20Kitchen%20team%2C%0D%0A%0D%0AI%27d%20like%20to%20book%20catering%20for%20an%20event.%0D%0A%0D%0AEvent%20details%3A%0D%0A-%20Date%3A%20%0D%0A-%20Number%20of%20guests%3A%20%0D%0A-%20Event%20type%3A%20%0D%0A-%20Location%3A%20";

export default function Catering() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [activeFAQ, setActiveFAQ] = useState(null);

    /* ------------------------------------------------------------------ */
    /*  Data                                                              */
    /* ------------------------------------------------------------------ */
    const cateringServices = [
        {
            title: "Wedding Catering",
            description:
                "Make your special day unforgettable with our exquisite wedding catering services. From traditional Nigerian dishes to international cuisine, we create memorable dining experiences for you and your guests.",
            icon: faHeart,
        },
        {
            title: "Corporate Events",
            description:
                "Impress your clients and colleagues with our professional corporate catering. Perfect for meetings, conferences, office parties, and corporate gatherings.",
            icon: faBuilding,
        },
        {
            title: "Private Parties",
            description:
                "From birthday celebrations to family reunions, we bring the authentic taste of Nigeria to your private events with customizable menus and professional service.",
            icon: faGlassCheers,
        },
        {
            title: "Cultural Events",
            description:
                "Celebrate your heritage with our authentic African cuisine. Perfect for cultural festivals, traditional ceremonies, and community events.",
            icon: faGlobe,
        },
    ];

    /* ------------------------------------------------------------------ */
    /*  PACKAGES DATA — temporarily disabled until packages are ready     */
    /*  To re-enable: uncomment the array below AND the Packages section  */
    /*  further down (search for "PACKAGES — DISABLED").                  */
    /* ------------------------------------------------------------------ */
    // const cateringPackages = [
    //     {
    //         name: "Basic Package",
    //         price: "£15",
    //         perPerson: "per person",
    //         featured: false,
    //         features: [
    //             "2 Main Course Options",
    //             "2 Side Dishes",
    //             "Soft Drinks",
    //             "Basic Setup & Service",
    //             "Up to 50 guests",
    //         ],
    //     },
    //     {
    //         name: "Premium Package",
    //         price: "£25",
    //         perPerson: "per person",
    //         featured: true,
    //         features: [
    //             "3 Main Course Options",
    //             "3 Side Dishes",
    //             "Appetizers",
    //             "Soft Drinks & Juice",
    //             "Full Setup & Professional Service",
    //             "Up to 100 guests",
    //         ],
    //     },
    //     {
    //         name: "Executive Package",
    //         price: "£40",
    //         perPerson: "per person",
    //         featured: false,
    //         features: [
    //             "4 Main Course Options",
    //             "4 Side Dishes",
    //             "Premium Appetizers",
    //             "Full Bar Service (optional)",
    //             "Dessert Station",
    //             "Premium Setup & Staff",
    //             "Custom Menu Planning",
    //             "Unlimited guests",
    //         ],
    //     },
    // ];

    const processSteps = [
        {
            step: "1",
            title: "Consultation",
            description:
                "We discuss your event needs, preferences, and dietary requirements to create a customized catering plan.",
        },
        {
            step: "2",
            title: "Menu Planning",
            description:
                "Our chefs craft a personalized menu featuring authentic Nigerian dishes tailored to your event.",
        },
        {
            step: "3",
            title: "Booking",
            description:
                "Secure your date with a deposit and we'll handle all the details from there.",
        },
        {
            step: "4",
            title: "Execution",
            description:
                "Our professional team delivers, sets up, and serves your guests with excellence.",
        },
    ];

    const faqs = [
        {
            question: "How far in advance should I book catering?",
            answer:
                "We recommend booking at least 2-3 weeks in advance for smaller events and 4-6 weeks for larger events or weddings to ensure availability.",
        },
        {
            question: "Do you provide serving staff and equipment?",
            answer:
                "Yes, our premium and executive packages include professional serving staff, heating equipment, and serving utensils. Basic setup is included in all packages.",
        },
        {
            question: "Can you accommodate dietary restrictions?",
            answer:
                "Absolutely! We can accommodate vegetarian, vegan, gluten-free, and other dietary needs. Please inform us during the consultation.",
        },
        {
            question: "What areas do you serve?",
            answer:
                "We cater events throughout the city and surrounding areas. Delivery fees may apply for locations outside our primary service area.",
        },
        {
            question: "Do you offer tastings?",
            answer:
                "Yes, we offer tasting sessions for wedding and large event packages. Contact us to schedule a tasting appointment.",
        },
    ];

    const toggleFAQ = (index) => {
        setActiveFAQ(activeFAQ === index ? null : index);
    };

    /* ------------------------------------------------------------------ */
    /*  Hash-navigation for #faq                                          */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === "#faq") {
                const faqSection = document.getElementById("faq");
                if (faqSection) {
                    setTimeout(() => {
                        faqSection.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                }
            }
        };

        handleHashChange();
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    /* ------------------------------------------------------------------ */
    /*  Render                                                            */
    /* ------------------------------------------------------------------ */
    return (
        <>
            <NavBar
                activeLink="Home"
                onToggleMobileNavBar={() =>
                    setMobileNavBarVisible(!mobileNavBarVisible)
                }
            />
            <MobileNavBar
                isVisible={mobileNavBarVisible}
                activeLink="Catering"
                onClose={() => setMobileNavBarVisible(false)}
                className="md:col-span-1 pt-7"
            />

            {/* ============================================================ */}
            {/*  HERO — full-screen video, cinematic overlays                */}
            {/* ============================================================ */}
            <section
                style={{ backgroundImage: `url(${bg})` }}
                className="relative h-screen min-h-[420px] bg-center bg-cover overflow-hidden [@media(max-height:500px)]:min-h-[340px]"
            >

                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/90" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

                <div className="relative flex items-center justify-center h-full px-4 sm:px-6 [@media(max-height:500px)]:px-3">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="text-center text-white max-w-4xl"
                    >
                        <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-6 [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:tracking-[0.2em]">
                            Catering Services
                        </span>
                        <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl leading-tight mb-6 [@media(max-height:500px)]:text-2xl [@media(max-height:500px)]:mb-2 [@media(max-height:400px)]:text-xl">
                            Exceptional Catering for{" "}
                            <span className="text-own-2">Every Occasion</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
                            Bring the authentic taste of Nigeria to your special
                            events
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center [@media(max-height:500px)]:gap-2">
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 inline-flex items-center gap-3 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                                    <FontAwesomeIcon
                                        icon={faWhatsapp}
                                        className="text-lg"
                                    />
                                    Book on WhatsApp
                                </button>
                            </a>
                            <a href={EMAIL_URL}>
                                <button className="border-2 border-white/40 hover:border-own-2 hover:text-own-2 text-white font-semibold px-8 py-4 rounded-full tracking-wide backdrop-blur-sm transition-all duration-300 inline-flex items-center gap-3 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="text-sm"
                                    />
                                    Email Us
                                </button>
                            </a>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 [@media(max-height:500px)]:hidden"
                >
                    <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white/60 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* ============================================================ */}
            {/*  STATS STRIP                                                 */}
            {/* ============================================================ */}
            <section className="bg-own-2 py-10 [@media(max-height:600px)]:py-6 [@media(max-height:500px)]:py-4">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center [@media(max-height:500px)]:gap-3 [@media(max-height:500px)]:px-3">
                    {[
                        { value: "500+", label: "Events Catered" },
                        { value: "10K+", label: "Happy Guests" },
                        { value: "100%", label: "Fresh Ingredients" },
                        { value: "24/7", label: "Booking Enquiries" },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="text-2xl md:text-4xl font-black text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-lg">
                                {s.value}
                            </div>
                            <div className="text-[oklch(29.23%_0_0)]/70 text-[10px] md:text-sm mt-1 tracking-widest uppercase [@media(max-height:500px)]:text-[9px] [@media(max-height:500px)]:mt-0">
                                {s.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ============================================================ */}
            {/*  INTRO / OUR PROMISE                                         */}
            {/* ============================================================ */}
            <section className="py-24 px-4 sm:px-6 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center [@media(max-height:500px)]:gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="rounded-3xl overflow-hidden shadow-2xl [@media(max-height:500px)]:rounded-2xl">
                            <img
                                src={bg}
                                alt="Catering spread"
                                className="w-full h-[300px] md:h-[500px] object-cover [@media(max-height:500px)]:h-[220px]"
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            viewport={{ once: true }}
                            className="absolute -bottom-6 -right-4 md:-right-8 bg-own-2 p-5 md:p-6 rounded-2xl shadow-2xl [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:-bottom-3 [@media(max-height:500px)]:-right-2"
                        >
                            <div className="flex items-center gap-4 [@media(max-height:500px)]:gap-2">
                                <FontAwesomeIcon
                                    icon={faAward}
                                    className="text-3xl md:text-4xl text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-xl"
                                />
                                <div>
                                    <div className="text-lg md:text-2xl font-black text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-sm">
                                        Top Rated
                                    </div>
                                    <div className="text-[10px] md:text-sm text-[oklch(29.23%_0_0)]/70 [@media(max-height:500px)]:text-[9px]">
                                        Catering Service
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                            Our Promise
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-[oklch(29.23%_0_0)] font-display mb-6 leading-tight [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
                            Exceptional Catering for Every Occasion
                        </h2>
                        <p className="text-lg leading-relaxed text-[oklch(40%_0.05_100)] mb-6 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:leading-snug">
                            At Ada's Kitchen, we bring the vibrant flavors of
                            authentic Nigerian cuisine to your special events.
                            Whether you're planning an intimate gathering or a
                            grand celebration, our catering services ensure your
                            guests experience the rich culinary heritage of West
                            Africa.
                        </p>
                        <p className="text-lg leading-relaxed text-[oklch(40%_0.05_100)] mb-8 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:leading-snug">
                            Our experienced team handles every detail, from menu
                            planning to execution — so you can focus on enjoying
                            your event while we take care of the culinary
                            experience.
                        </p>

                        <div className="space-y-3 mb-8 [@media(max-height:500px)]:space-y-1.5 [@media(max-height:500px)]:mb-3">
                            {[
                                "Fresh, locally-sourced ingredients",
                                "Traditional recipes passed down generations",
                                "Professional, friendly service team",
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 [@media(max-height:500px)]:gap-2">
                                    <div className="w-6 h-6 rounded-full bg-own-2 flex items-center justify-center flex-shrink-0 [@media(max-height:500px)]:w-5 [@media(max-height:500px)]:h-5">
                                        <FontAwesomeIcon
                                            icon={faCheck}
                                            className="text-[oklch(29.23%_0_0)] text-xs [@media(max-height:500px)]:text-[9px]"
                                        />
                                    </div>
                                    <span className="text-[oklch(29.23%_0_0)] font-medium [@media(max-height:500px)]:text-sm">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 [@media(max-height:500px)]:gap-2">
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button className="inline-flex items-center gap-3 bg-[oklch(29.23%_0_0)] hover:bg-own-2 hover:text-[oklch(29.23%_0_0)] text-white font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                                    <FontAwesomeIcon
                                        icon={faWhatsapp}
                                        className="text-lg"
                                    />
                                    Book Your Event
                                </button>
                            </a>
                            <a href={EMAIL_URL}>
                                <button className="inline-flex items-center gap-3 border-2 border-[oklch(29.23%_0_0)]/20 hover:border-own-2 text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="text-sm"
                                    />
                                    Email Us
                                </button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================================ */}
            {/*  SERVICES — glass-morphism on dark                           */}
            {/* ============================================================ */}
            <section className="py-24 px-4 sm:px-6 bg-own-1 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 [@media(max-height:600px)]:mb-8 [@media(max-height:500px)]:mb-4"
                    >
                        <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                            What We Offer
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white font-display [@media(max-height:500px)]:text-xl">
                            Our Catering Services
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [@media(max-height:500px)]:gap-3">
                        {cateringServices.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                                className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-own-2/50 transition-all duration-300 [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:rounded-2xl"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-own-2 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 [@media(max-height:500px)]:w-10 [@media(max-height:500px)]:h-10 [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:rounded-xl">
                                    <FontAwesomeIcon
                                        icon={service.icon}
                                        className="text-[oklch(29.23%_0_0)] text-xl [@media(max-height:500px)]:text-sm"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">
                                    {service.title}
                                </h3>
                                <p className="text-white/70 leading-relaxed [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:leading-snug">
                                    {service.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/*  PACKAGES — DISABLED                                         */}
            {/*  Re-enable this entire section AND the `cateringPackages`    */}
            {/*  array above when packages go live.                          */}
            {/* ============================================================ */}
            {/* ... (unchanged block) ... */}

            {/* ============================================================ */}
            {/*  PROCESS — timeline with connector                           */}
            {/* ============================================================ */}
            <section className="py-24 px-4 sm:px-6 bg-own-2 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 [@media(max-height:600px)]:mb-8 [@media(max-height:500px)]:mb-4"
                    >
                        <span className="inline-block text-[oklch(29.23%_0_0)]/70 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                            How It Works
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-[oklch(29.23%_0_0)] font-display [@media(max-height:500px)]:text-xl">
                            Our Simple Process
                        </h2>
                    </motion.div>

                    <div className="relative">
                        <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-[oklch(29.23%_0_0)]/20" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 [@media(max-height:500px)]:gap-3">
                            {processSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.15,
                                    }}
                                    viewport={{ once: true }}
                                    className="relative text-center"
                                >
                                    <div className="relative z-10 w-16 h-16 mx-auto mb-6 bg-[oklch(29.23%_0_0)] rounded-full flex items-center justify-center shadow-lg [@media(max-height:500px)]:w-10 [@media(max-height:500px)]:h-10 [@media(max-height:500px)]:mb-2">
                                        <span className="text-2xl font-black text-own-2 [@media(max-height:500px)]:text-base">
                                            {step.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[oklch(29.23%_0_0)] mb-3 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">
                                        {step.title}
                                    </h3>
                                    <p className="text-[oklch(29.23%_0_0)]/70 text-sm leading-relaxed [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:leading-snug">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/*  FAQ — animated accordion                                    */}
            {/* ============================================================ */}
            <section id="faq" className="py-24 px-4 sm:px-6 bg-white [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 [@media(max-height:600px)]:mb-8 [@media(max-height:500px)]:mb-4"
                    >
                        <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                            FAQ
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-[oklch(29.23%_0_0)] font-display [@media(max-height:500px)]:text-xl">
                            Frequently Asked Questions
                        </h2>
                    </motion.div>

                    <div className="space-y-4 [@media(max-height:500px)]:space-y-2">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 [@media(max-height:500px)]:rounded-xl ${
                                    activeFAQ === index
                                        ? "border-own-2 bg-amber-50/50 shadow-md"
                                        : "border-gray-200 hover:border-own-2/50"
                                }`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-6 text-left [@media(max-height:500px)]:p-3"
                                >
                                    <span className="font-semibold text-base md:text-lg text-[oklch(29.23%_0_0)] pr-4 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:pr-2">
                                        {faq.question}
                                    </span>
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6 ${
                                            activeFAQ === index
                                                ? "bg-own-2 rotate-180"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                activeFAQ === index
                                                    ? faMinus
                                                    : faPlus
                                            }
                                            className={`text-sm [@media(max-height:500px)]:text-xs ${
                                                activeFAQ === index
                                                    ? "text-[oklch(29.23%_0_0)]"
                                                    : "text-gray-500"
                                            }`}
                                        />
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {activeFAQ === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: "auto",
                                                opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-6 pb-6 text-[oklch(40%_0.05_100)] leading-relaxed [@media(max-height:500px)]:px-3 [@media(max-height:500px)]:pb-3 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:leading-snug">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/*  CTA                                                         */}
            {/* ============================================================ */}
            <section className="relative py-24 px-4 sm:px-6 overflow-hidden [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
                <div className="absolute inset-0 bg-gradient-to-br from-[oklch(29.23%_0_0)] via-[oklch(29.23%_0_0)] to-own-2/30" />
                <div className="relative max-w-4xl mx-auto text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold font-display mb-6 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
                            Ready to Plan Your{" "}
                            <span className="text-own-2">Event?</span>
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
                            Reach out today for a personalized catering
                            consultation — we'll craft a bespoke quote for your
                            event.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center [@media(max-height:500px)]:gap-2">
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button className="inline-flex items-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                                    <FontAwesomeIcon
                                        icon={faWhatsapp}
                                        className="text-lg"
                                    />
                                    WhatsApp Us
                                </button>
                            </a>
                            <a href={EMAIL_URL}>
                                <button className="inline-flex items-center gap-3 border-2 border-white/40 hover:border-own-2 hover:text-own-2 text-white font-semibold px-8 py-4 rounded-full tracking-wide backdrop-blur-sm transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="text-sm"
                                    />
                                    Email Us
                                </button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </>
    );
}