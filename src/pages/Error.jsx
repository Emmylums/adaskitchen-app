import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import bg from "../assets/bgcont.jpeg";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faArrowRight, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const Error = ({ statusCode = 500, message = "Something went wrong" }) => {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);

  return (
    <>
      <NavBar activeLink="" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      <section className="relative min-h-screen min-h-[420px] overflow-hidden [@media(max-height:500px)]:min-h-[340px] [@media(max-height:400px)]:min-h-[300px]">
        <div style={{ backgroundImage: `url(${bg})` }} className="absolute inset-0 bg-center bg-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 py-24 [@media(max-height:500px)]:py-6 [@media(max-height:500px)]:px-3">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-2xl"
          >
            {/* Icon with pulsing golden glow */}
            <div className="relative inline-block mb-8 [@media(max-height:500px)]:mb-3">
              <div className="absolute inset-0 bg-own-2/40 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="relative w-24 h-24 mx-auto bg-own-2 rounded-full flex items-center justify-center shadow-2xl [@media(max-height:500px)]:w-16 [@media(max-height:500px)]:h-16">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-[oklch(29.23%_0_0)] text-4xl [@media(max-height:500px)]:text-2xl" />
              </div>
            </div>

            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:tracking-[0.2em]">
              Oops
            </span>

            <h1 className="font-display font-black text-6xl md:text-8xl text-own-2 mb-4 drop-shadow-lg [@media(max-height:500px)]:text-4xl [@media(max-height:500px)]:mb-2 [@media(max-height:400px)]:text-3xl">
              {statusCode}
            </h1>

            <h2 className="text-2xl md:text-3xl font-bold mb-4 [@media(max-height:500px)]:text-lg [@media(max-height:500px)]:mb-2">
              Something went wrong
            </h2>

            <p className="text-lg text-white/70 mb-10 max-w-md mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
              {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center [@media(max-height:500px)]:gap-2">
              <Link to="/">
                <button className="inline-flex items-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  <FontAwesomeIcon icon={faHome} /> Go Home
                </button>
              </Link>
              <Link to="/menu">
                <button className="inline-flex items-center gap-3 border-2 border-white/40 hover:border-own-2 hover:text-own-2 text-white font-semibold px-8 py-4 rounded-full tracking-wide backdrop-blur-sm transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Browse Menu <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Error;