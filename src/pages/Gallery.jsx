import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import bg from "../assets/bgcont.jpeg";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCamera } from "@fortawesome/free-solid-svg-icons";

export default function Gallery() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);

  const images = [
    { src: "src/assets/jollof.jpeg", alt: "Jollof Rice", title: "Signature Jollof" },
    { src: "src/assets/egusi.jpg", alt: "Egusi Soup", title: "Rich Egusi" },
    { src: "src/assets/suya.jpg", alt: "Suya", title: "Grilled Suya" },
    { src: "src/assets/pepper-soup.jpeg", alt: "Pepper Soup", title: "Pepper Soup" },
    { src: "src/assets/egusi2.jpg", alt: "Fufu and Egusi", title: "Fufu & Egusi" },
    { src: "src/assets/plantain.jpg", alt: "Fried Plantain", title: "Fried Plantain" },
    { src: "src/assets/moimoi.jpg", alt: "Moi Moi", title: "Moi Moi" },
    { src: "src/assets/yam-porridge.jpg", alt: "Yam Porridge", title: "Yam Porridge" },
  ];

  return (
    <>
      <NavBar activeLink="Gallery" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Gallery" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      {/* HERO */}
      <section className="relative h-screen min-h-[420px] overflow-hidden [@media(max-height:500px)]:min-h-[340px] [@media(max-height:400px)]:min-h-[300px]">
        <div style={{ backgroundImage: `url(${bg})` }} className="absolute inset-0 bg-center bg-cover" />
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
              Our Gallery
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl leading-tight mb-6 [@media(max-height:500px)]:text-2xl [@media(max-height:500px)]:mb-2 [@media(max-height:400px)]:text-xl">
              A Feast for <span className="text-own-2">Your Eyes</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
              Every dish tells a story — here's a taste of what's cooking in our kitchen
            </p>
            <Link to="/menu">
              <button className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 inline-flex items-center gap-3 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                Order Now <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
              </button>
            </Link>
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

      {/* GALLERY GRID */}
      <section className="py-24 px-4 sm:px-6 bg-own-1 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 [@media(max-height:600px)]:mb-8 [@media(max-height:500px)]:mb-4"
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              The Collection
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-display [@media(max-height:500px)]:text-xl">
              Our Delicious Dishes
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 [@media(max-height:500px)]:gap-2">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-own-2 transition-all duration-300 [@media(max-height:500px)]:rounded-2xl"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-5 w-full [@media(max-height:500px)]:p-3">
                    <div className="w-8 h-1 bg-own-2 rounded-full mb-3 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-0.5" />
                    <p className="text-white font-semibold text-sm md:text-base [@media(max-height:500px)]:text-xs">
                      {image.title || image.alt}
                    </p>
                  </div>
                </div>

                {/* Camera badge */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6 [@media(max-height:500px)]:top-2 [@media(max-height:500px)]:right-2">
                  <FontAwesomeIcon icon={faCamera} className="text-white text-xs [@media(max-height:500px)]:text-[8px]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(29.23%_0_0)] via-[oklch(29.23%_0_0)] to-own-2/30" />
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-6 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
              Like What You <span className="text-own-2">See?</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
              Order online and taste the passion behind every dish.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center [@media(max-height:500px)]:gap-2">
              <Link to="/menu">
                <button className="inline-flex items-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Order Online <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
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