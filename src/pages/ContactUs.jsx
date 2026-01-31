import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import bg from "../assets/background.jpeg";
import { motion } from 'framer-motion';
import Footer from "../components/Footer";

export default function ContactUs() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent("Contact Form Submission");
    const body = encodeURIComponent(
      `Name: ${formData.name}\n\n\nMessage:\n${formData.message}`
    );

    const mailtoLink = `mailto:info@adaskitchen.uk?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  return (
    <>
      <NavBar 
        activeLink="Contact Us" 
        onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} 
      />
      <MobileNavBar 
        isVisible={mobileNavBarVisible} 
        activeLink="Contact Us" 
        onClose={() => setMobileNavBarVisible(false)} 
        className="md:col-span-1 pt-7"
      />
      
      <section 
        style={{ backgroundImage: `url(${bg})` }}  
        className="relative h-[50vh] bg-center bg-cover"
      >
        <div className="absolute inset-0 h-[50vh] opacity-70 bg-black" />
        <div className="relative flex items-center justify-center h-full">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1.0 }}
          >
            <div className="p-10 text-center text-white mt-10">
              <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg drop-shadow-black">
                Contact Us
              </h2>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold text-own-2 mb-8">Get In Touch</h2>
            <form onSubmit={handleSubmit}>
              <div className="mt-6 text-black">
                <label className="block font-medium mb-2">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-own-2" 
                  placeholder="Your Name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  id="name" 
                  name="name"
                />
              </div>

              <div className="mt-6 text-black">
                <label className="block font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-own-2" 
                  placeholder="Your Email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  id="email" 
                  name="email"
                />
              </div>

              <div className="mt-6 text-black">
                <label className="block font-medium mb-2">Message</label>
                <textarea 
                  rows="5" 
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-own-2" 
                  placeholder="Your Message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  id="message" 
                  name="message"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="bg-own-2 text-white font-semibold px-8 py-4 rounded-full hover:bg-own-2/90 transition mt-7"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="bg-own-2 text-white p-10 rounded-3xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6">Visit Us</h2>
            <p className="mb-4">
              Ada’s Kitchen<br />
              Brixton Station Road<br />
              London, SW9 8PA
            </p>

            <p className="mb-4">
              Phone: <a href="tel:+447737176235" className="underline">+44 7737 176235</a>
            </p>

            <p className="mb-8">
              Email: <a href="mailto:info@adaskitchen.com" className="underline">info@adaskitchen.com</a>
            </p>

            {/* what3words Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-3">Find us with what3words</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a 
                  href="https://w3w.co/call.opera.tens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-own-2 font-bold text-lg py-3 px-6 rounded-full hover:bg-gray-100 transition-colors text-center"
                >
                  call.opera.tens
                </a>
                <span className="text-sm opacity-90">
                  Tap to open in what3words app
                </span>
              </div>
            </div>

            {/* Simple what3words map placeholder */}
            <div className="aspect-video w-full overflow-hidden rounded-2xl mt-6">
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-6">
                <div className="text-center">
                  <p className="text-own-2 font-bold text-xl mb-3">call.opera.tens</p>
                  <p className="text-gray-700 text-sm mb-4">
                    Enter this code in the what3words app<br />
                    to find our exact location
                  </p>
                  <a 
                    href="https://what3words.com/call.opera.tens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-own-2 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition"
                  >
                    Open in what3words
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}