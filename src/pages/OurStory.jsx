import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import cooking from "../assets/cooking5.jpeg";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import bg from "../assets/bgcont.jpeg";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, doc, getDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faPlus,
  faMinus,
  faSeedling,
  faHandsHoldingCircle,
  faLeaf,
  faStar,
  faQuoteLeft,
  faUtensils,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

export default function OurStory() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [chef, setChef] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ------------------------------------------------------------------ */
  /*  Firebase fetch (unchanged)                                         */
  /* ------------------------------------------------------------------ */
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let chefData = null;

      try {
        const chefRef = doc(db, "settings", "chefInfo");
        const chefSnapshot = await getDoc(chefRef);

        if (chefSnapshot.exists()) {
          const data = chefSnapshot.data();
          chefData = {
            id: chefSnapshot.id,
            name: data.name || "Ada Johnson",
            bio:
              data.bio ||
              "With years of culinary experience, Franklyn brings his mother's traditional recipes to life with a modern twist.",
            image: data.imageUrl || null,
          };
        }
      } catch (chefError) {
        console.error("Error fetching chef info:", chefError);
      }

      setChef(chefData);

      try {
        const galleryRef = collection(db, "gallery");
        const galleryQuery = query(galleryRef);
        const gallerySnapshot = await getDocs(galleryQuery);

        let galleryData = [];

        if (!gallerySnapshot.empty) {
          gallerySnapshot.forEach((doc) => {
            try {
              const data = doc.data();
              if (data && (data.image || data.imageUrl || data.url || data.photo)) {
                galleryData.push({
                  id: doc.id,
                  alt:
                    data.alt ||
                    data.title ||
                    data.name ||
                    data.description ||
                    "Gallery image",
                  image: data.image || data.imageUrl || data.url || data.photo,
                  title: data.title || data.name || data.caption || "",
                });
              }
            } catch (docError) {
              console.error(`Error processing gallery doc ${doc.id}:`, docError);
            }
          });
        }

        if (galleryData.length === 0) {
          galleryData = [
            { id: 1, alt: "Traditional Nigerian Jollof Rice", title: "Signature Jollof Rice" },
            { id: 2, alt: "Chef preparing Suya", title: "Suya Preparation" },
            { id: 3, alt: "Colorful African spices", title: "Our Spices" },
            { id: 4, alt: "Customers enjoying meal", title: "Happy Customers" },
            { id: 5, alt: "Catering event setup", title: "Event Catering" },
            { id: 6, alt: "Fresh ingredients preparation", title: "Fresh Ingredients" },
          ];
        }

        setGalleryImages(galleryData);
      } catch (galleryError) {
        console.error("Error fetching gallery:", galleryError);
        setGalleryImages([
          { id: 1, alt: "Traditional Nigerian Jollof Rice", title: "Signature Jollof Rice" },
          { id: 2, alt: "Chef preparing Suya", title: "Suya Preparation" },
          { id: 3, alt: "Colorful African spices", title: "Our Spices" },
          { id: 4, alt: "Customers enjoying meal", title: "Happy Customers" },
          { id: 5, alt: "Catering event setup", title: "Event Catering" },
          { id: 6, alt: "Fresh ingredients preparation", title: "Fresh Ingredients" },
        ]);
      }
    } catch (err) {
      console.error("Critical error in fetchData:", err);
      setError(
        "We're having trouble loading our story. Please refresh the page or try again later."
      );

      setChef({
        name: "Ada Johnson",
        bio:
          "With over 15 years of culinary experience, Ada brings her mother's traditional recipes to life with a modern twist.",
        image: null,
      });

      setGalleryImages([
        { id: 1, alt: "Traditional Nigerian Jollof Rice", title: "Gallery image" },
        { id: 2, alt: "Chef preparing Suya", title: "Gallery image" },
        { id: 3, alt: "Colorful African spices", title: "Gallery image" },
        { id: 4, alt: "Customers enjoying meal", title: "Gallery image" },
        { id: 5, alt: "Catering event setup", title: "Gallery image" },
        { id: 6, alt: "Fresh ingredients preparation", title: "Gallery image" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Data                                                              */
  /* ------------------------------------------------------------------ */
  const missionValues = [
    {
      title: "Our Mission",
      description:
        "To share the authentic flavors of African cuisine with the world, preserving traditional recipes while innovating for modern palates. We strive to create memorable dining experiences that celebrate our rich cultural heritage.",
      icon: faStar,
    },
    {
      title: "Community First",
      description:
        "We believe in building strong community connections. Through local sourcing, community events, and supporting African-owned businesses, we're committed to giving back to the community that supports us.",
      icon: faHandsHoldingCircle,
    },
    {
      title: "Sustainability",
      description:
        "We're committed to environmentally responsible practices, from sourcing local ingredients to reducing food waste and using eco-friendly packaging in our operations.",
      icon: faLeaf,
    },
    {
      title: "Quality & Excellence",
      description:
        "Every dish is prepared with the highest quality ingredients and meticulous attention to detail. We never compromise on quality, ensuring each meal meets our exacting standards.",
      icon: faSeedling,
    },
  ];

  const faqs = [
    {
      question: "Where do you source your ingredients?",
      answer:
        "We source our ingredients from local African markets and specialty suppliers to ensure authenticity and freshness. Many of our spices are imported directly from West Africa.",
    },
    {
      question: "Do you offer catering for events?",
      answer:
        "Yes! We provide catering services for weddings, corporate events, and private parties. Contact us for custom menu options and pricing.",
    },
    {
      question: "Are your dishes suitable for vegetarians?",
      answer:
        "Absolutely! We have several vegetarian options including our famous Moi Moi, vegetable soups, and plant-based protein dishes.",
    },
    {
      question: "How did Ada's Kitchen get started?",
      answer:
        "Ada started by cooking for friends and family from her home kitchen. The demand grew so much that she decided to share her passion with the community through this restaurant.",
    },
    {
      question: "Do you take custom orders?",
      answer:
        "Yes, we welcome custom orders for special occasions. Please give us at least 48 hours notice for personalized dishes.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  /* ------------------------------------------------------------------ */
  /*  Hash navigation                                                   */
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
  /*  Loading / Error states                                            */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <>
        <NavBar
          activeLink="Our Story"
          onToggleMobileNavBar={() =>
            setMobileNavBarVisible(!mobileNavBarVisible)
          }
        />
        <MobileNavBar
          isVisible={mobileNavBarVisible}
          activeLink="Our Story"
          onClose={() => setMobileNavBarVisible(false)}
          className="md:col-span-1 pt-7"
        />
        <div className="flex justify-center items-center h-screen bg-own-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-own-2 mx-auto"></div>
            <p className="mt-4 text-white/70">Loading our story...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar
          activeLink="Our Story"
          onToggleMobileNavBar={() =>
            setMobileNavBarVisible(!mobileNavBarVisible)
          }
        />
        <MobileNavBar
          isVisible={mobileNavBarVisible}
          activeLink="Our Story"
          onClose={() => setMobileNavBarVisible(false)}
          className="md:col-span-1 pt-7"
        />
        <div className="flex justify-center items-center h-screen bg-gray-50 px-6">
          <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <>
      <NavBar
        activeLink="Our Story"
        onToggleMobileNavBar={() =>
          setMobileNavBarVisible(!mobileNavBarVisible)
        }
      />
      <MobileNavBar
        isVisible={mobileNavBarVisible}
        activeLink="Our Story"
        onClose={() => setMobileNavBarVisible(false)}
        className="md:col-span-1 pt-7"
      />

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative h-screen min-h-[420px] overflow-hidden [@media(max-height:500px)]:min-h-[340px] [@media(max-height:400px)]:min-h-[300px]">
        <div
          style={{ backgroundImage: `url(${bg})` }}
          className="absolute inset-0 bg-center bg-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        <div className="relative flex items-center justify-center h-full px-4 sm:px-6 [@media(max-height:500px)]:px-3">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center text-white max-w-4xl"
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-6 [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:tracking-[0.2em]">
              Our Story
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl leading-tight mb-6 [@media(max-height:500px)]:text-2xl [@media(max-height:500px)]:mb-2 [@media(max-height:400px)]:text-xl">
              The Heart Behind{" "}
              <span className="text-own-2">Our Kitchen</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
              A story of tradition, family, and the joy of sharing good food
              with good company
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center [@media(max-height:500px)]:gap-2">
              <a href="#story">
                <button className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 inline-flex items-center gap-3 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Read Our Story{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </a>
              <Link to="/menu">
                <button className="border-2 border-white/40 hover:border-own-2 hover:text-own-2 text-white font-semibold px-8 py-4 rounded-full tracking-wide backdrop-blur-sm transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Explore Menu
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
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
      {/*  STAT STRIP                                                  */}
      {/* ============================================================ */}
      <section className="bg-own-2 py-10 [@media(max-height:600px)]:py-6 [@media(max-height:500px)]:py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center [@media(max-height:500px)]:gap-3 [@media(max-height:500px)]:px-3">
          {[
            { value: "15+", label: "Years of Tradition" },
            { value: "50+", label: "Signature Recipes" },
            { value: "100%", label: "Authentic Flavors" },
            { value: "1", label: "Family Legacy" },
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
      {/*  STORY — split layout                                        */}
      {/* ============================================================ */}
      <section id="story" className="py-24 px-4 sm:px-6 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center [@media(max-height:500px)]:gap-6">
          {/* Image with floating quote badge */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl [@media(max-height:500px)]:rounded-2xl">
              <img
                src={cooking}
                alt="Chef cooking"
                className="w-full h-[300px] md:h-[550px] object-cover object-top [@media(max-height:500px)]:h-[220px]"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -right-4 md:-right-8 bg-own-2 p-5 md:p-6 rounded-2xl shadow-2xl max-w-[220px] [@media(max-height:500px)]:p-3 [@media(max-height:500px)]:-bottom-3 [@media(max-height:500px)]:-right-2 [@media(max-height:500px)]:max-w-[150px] [@media(max-height:500px)]:rounded-xl"
            >
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="text-[oklch(29.23%_0_0)]/40 text-2xl mb-2 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1"
              />
              <p className="text-[oklch(29.23%_0_0)] font-semibold text-sm md:text-base leading-snug [@media(max-height:500px)]:text-xs">
                &ldquo;Food is love, and love is best shared.&rdquo;
              </p>
              <p className="text-[oklch(29.23%_0_0)]/60 text-xs mt-2 italic [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:mt-1">
                — Ada
              </p>
            </motion.div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Our Beginning
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[oklch(29.23%_0_0)] font-display mb-6 leading-tight [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
              A Legacy Passed Down Through Generations
            </h2>
            <p className="text-lg leading-relaxed text-[oklch(40%_0.05_100)] mb-6 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:leading-snug">
              Ada's Kitchen was born from a passion for sharing authentic
              African flavors with the world. Inspired by family recipes passed
              down through generations, every dish we serve tells a story of
              tradition, culture, and love.
            </p>
            <p className="text-lg leading-relaxed text-[oklch(40%_0.05_100)] mb-8 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:leading-snug">
              Our journey began in a small kitchen where Ada experimented with
              spices, herbs, and unique cooking methods to create the perfect
              balance of flavors. What started as cooking for loved ones soon
              became a calling to share that warmth with the whole community.
            </p>

            <div className="space-y-3 mb-8 [@media(max-height:500px)]:space-y-1.5 [@media(max-height:500px)]:mb-3">
              {[
                "Recipes preserved across generations",
                "Authentic West African spices",
                "Made with love, served with pride",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 [@media(max-height:500px)]:gap-2">
                  <div className="w-6 h-6 rounded-full bg-own-2 flex items-center justify-center flex-shrink-0 [@media(max-height:500px)]:w-5 [@media(max-height:500px)]:h-5">
                    <FontAwesomeIcon
                      icon={faHeart}
                      className="text-[oklch(29.23%_0_0)] text-xs [@media(max-height:500px)]:text-[9px]"
                    />
                  </div>
                  <span className="text-[oklch(29.23%_0_0)] font-medium [@media(max-height:500px)]:text-sm">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link to="/menu">
              <button className="inline-flex items-center gap-3 bg-[oklch(29.23%_0_0)] hover:bg-own-2 hover:text-[oklch(29.23%_0_0)] text-white font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                Taste Our Food{" "}
                <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  MISSION & VALUES — glass cards on dark                       */}
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
              What We Stand For
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-display [@media(max-height:500px)]:text-xl">
              Our Mission &amp; Values
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [@media(max-height:500px)]:gap-3">
            {missionValues.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-own-2/50 transition-all duration-300 [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:rounded-2xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-own-2 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 [@media(max-height:500px)]:w-10 [@media(max-height:500px)]:h-10 [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:rounded-xl">
                  <FontAwesomeIcon
                    icon={item.icon}
                    className="text-[oklch(29.23%_0_0)] text-xl [@media(max-height:500px)]:text-sm"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-1">
                  {item.title}
                </h3>
                <p className="text-white/70 leading-relaxed [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:leading-snug">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CHEF — premium card                                         */}
      {/* ============================================================ */}
      <section className="py-24 px-4 sm:px-6 bg-gray-50 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 [@media(max-height:600px)]:mb-8 [@media(max-height:500px)]:mb-4"
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Meet the Heart
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[oklch(29.23%_0_0)] font-display [@media(max-height:500px)]:text-xl">
              About The Chef
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-white rounded-3xl shadow-2xl overflow-hidden [@media(max-height:500px)]:rounded-2xl"
          >
            {/* Decorative gold bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-own-2 via-[oklch(85%_0.171_83.42)] to-own-2" />

            <div className="grid md:grid-cols-5 gap-8 p-8 md:p-12 items-center [@media(max-height:600px)]:p-5 [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:gap-3">
              {/* Photo */}
              <div className="md:col-span-2 flex justify-center">
                <div className="relative">
                  {/* Gold ring glow */}
                  <div className="absolute inset-0 bg-own-2/30 blur-2xl rounded-full scale-110" />
                  <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-own-2 shadow-xl [@media(max-height:500px)]:w-36 [@media(max-height:500px)]:h-36">
                    {chef?.image ? (
                      <img
                        src={chef.image}
                        alt={chef.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<div class="w-full h-full bg-gradient-to-br from-own-2 to-amber-400 flex items-center justify-center text-6xl">👨‍🍳</div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-own-2 to-amber-400 flex items-center justify-center text-6xl">
                        👨‍🍳
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[oklch(29.23%_0_0)] text-own-2 text-[10px] font-bold px-4 py-1.5 rounded-full tracking-[0.2em] uppercase whitespace-nowrap shadow-lg [@media(max-height:500px)]:text-[8px] [@media(max-height:500px)]:px-2 [@media(max-height:500px)]:py-0.5 [@media(max-height:500px)]:-bottom-1">
                    Head Chef
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-3 text-center md:text-left">
                <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs mb-3 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                  The Heart of the Kitchen
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-[oklch(29.23%_0_0)] font-display mb-6 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
                  {chef?.name || "Ada Johnson"}
                </h3>
                <p className="text-lg leading-relaxed text-[oklch(40%_0.05_100)] mb-8 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:leading-snug">
                  {chef?.bio ||
                    "With over 15 years of culinary experience, Ada brings her mother's traditional recipes to life with a modern twist."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start [@media(max-height:500px)]:gap-2">
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full [@media(max-height:500px)]:px-2 [@media(max-height:500px)]:py-1">
                    <FontAwesomeIcon icon={faUtensils} className="text-own-2 text-sm [@media(max-height:500px)]:text-xs" />
                    <span className="text-sm font-semibold text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-xs">
                      Traditional Recipes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full [@media(max-height:500px)]:px-2 [@media(max-height:500px)]:py-1">
                    <FontAwesomeIcon icon={faStar} className="text-own-2 text-sm [@media(max-height:500px)]:text-xs" />
                    <span className="text-sm font-semibold text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-xs">
                      Award-Winning
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  GALLERY                                                     */}
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
              A Peek Inside
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-display [@media(max-height:500px)]:text-xl">
              Behind the Scenes
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 [@media(max-height:500px)]:gap-2">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-own-2 transition-all duration-300 [@media(max-height:500px)]:rounded-2xl"
              >
                {image.image ? (
                  <img
                    src={image.image}
                    alt={image.alt || image.title || "Gallery image"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center p-4 text-center"><span class="text-4xl mb-3">📸</span><p class="text-sm text-white/60">${
                        image.alt || image.title || "Gallery image"
                      }</p></div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-4xl mb-3">📸</span>
                    <p className="text-sm text-white/60">
                      {image.alt || image.title || "Gallery image"}
                    </p>
                  </div>
                )}

                {/* Hover overlay with title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-5 w-full [@media(max-height:500px)]:p-3">
                    <div className="w-8 h-1 bg-own-2 rounded-full mb-3 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-0.5" />
                    <p className="text-white font-semibold text-sm md:text-base [@media(max-height:500px)]:text-xs">
                      {image.title || image.alt || "Ada's Kitchen"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                         */}
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
                      icon={activeFAQ === index ? faMinus : faPlus}
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
                      animate={{ height: "auto", opacity: 1 }}
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
      {/*  CLOSING CTA                                                 */}
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
              Be Part of <span className="text-own-2">Our Story</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
              Order online and taste the passion behind every dish.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center [@media(max-height:500px)]:gap-2">
              <Link to="/menu">
                <button className="inline-flex items-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Order Online{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </Link>
              <Link to="/catering">
                <button className="inline-flex items-center gap-3 border-2 border-white/40 hover:border-own-2 hover:text-own-2 text-white font-semibold px-8 py-4 rounded-full tracking-wide backdrop-blur-sm transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Book Catering
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}