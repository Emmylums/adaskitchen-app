import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import bg from "../assets/background.jpeg";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Gallery() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);

  const images = [
    { src: "src/assets/jollof.jpeg", alt: "Jollof Rice" },
    { src: "src/assets/egusi.jpg", alt: "Egusi Soup" },
    { src: "src/assets/suya.jpg", alt: "Suya" },
    { src: "src/assets/pepper-soup.jpeg", alt: "Pepper Soup" },
    { src: "src/assets/egusi2.jpg", alt: "Fufu and Egusi" },
    { src: "src/assets/plantain.jpg", alt: "Fried Plantain" },
    { src: "src/assets/moimoi.jpg", alt: "Moi Moi" },
    { src: "src/assets/yam-porridge.jpg", alt: "Yam Porridge" },
  ];

  return (
    <>
        <NavBar activeLink="Gallery" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
        <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Gallery" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
        <section style={{ backgroundImage: `url(${bg})` }} className="relative h-[50vh] bg-center bg-cover">
            <div className="absolute inset-0 h-[50vh] opacity-70 bg-black" />
            <div className="relative flex items-center justify-center h-full">
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                    <div className="p-10 text-center text-white mt-10 ">
                        <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg drop-shadow-black">Gallery</h2>
                    </div>
                </motion.div>
            </div>
        </section>

      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-10 text-center text-own-2 font-display2">Our Delicious Dishes</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0, }} transition={{ duration: 0.3 }} viewport={{ once: true, amount: 0.05 }} 
              key={index}
              className="overflow-hidden rounded-3xl shadow-lg transform transition duration-500 hover:scale-105"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-72 object-cover transition duration-500 hover:brightness-90"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="pb-20 text-center text-white">
        <h2 className="text-4xl font-bold mb-6">Like What You See?</h2>
        <p className="text-lg mb-8">Order online and taste the passion behind every dish.</p>
        <Link to="/menu">
          <button className="px-8 py-4 bg-own-2 font-semibold text-lg rounded-full shadow-lg hover:bg-gray-100 hover:text-own-2 transition">
              Order Online
          </button>
        </Link>
      </div>
      <Footer/>
    </>
  );
}