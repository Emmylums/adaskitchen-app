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
      <NavBar activeLink="Contact Us" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Contact Us" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>
        <section style={{ backgroundImage: `url(${bg})` }}  className="relative h-[50vh] bg-center bg-cover">
            <div className="absolute inset-0 h-[50vh] opacity-70 bg-black" />
            <div className="relative flex items-center justify-center h-full">
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                    <div className="p-10 text-center text-white mt-10 ">
                        <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg drop-shadow-black">Contact Us</h2>
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
                <input type="text" className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-own-2 " placeholder="Your Name" value={formData.name} onChange={handleChange} id="name" name="name"/>
              </div>

              <div className="mt-6 text-black">
                <label className="block font-medium mb-2">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-own-2" placeholder="Your Email" value={formData.email} onChange={handleChange} id="email" name="email"/>
              </div>

              <div className="mt-6 text-black">
                <label className="block font-medium mb-2">Message</label>
                <textarea rows="5" className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-own-2" placeholder="Your Message" value={formData.message} onChange={handleChange} id="message" name="message"></textarea>
              </div>

              <button type="submit" className="bg-own-2 text-white font-semibold px-8 py-4 rounded-full hover:bg-own-2/90 transition mt-7">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="bg-own-2 text-white p-10 rounded-3xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6">Visit Us</h2>
            <p className="mb-4">
              Ada’s Kitchen<br />
              123 African Spice Street<br />
              Lagos, Nigeria
            </p>

            <p className="mb-4">
              Phone: <a href="tel:+2348000000000" className="underline">+234 800 000 0000</a>
            </p>

            <p className="mb-8">
              Email: <a href="mailto:info@adaskitchen.com" className="underline">info@adaskitchen.com</a>
            </p>

            <div className="aspect-video w-full overflow-hidden rounded-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.46310757624!2d3.1191427001003085!3d6.548369371177914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos!5e0!3m2!1sen!2sng!4v1750158213112!5m2!1sen!2sng"
                width="100%"
                height="100%"
                className="border-none"
                allowFullScreen
                loading="lazy"
                title="Ada's Kitchen Location"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}
