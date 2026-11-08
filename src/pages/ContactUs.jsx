import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import bg from "../assets/bgcont.jpeg";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faLocationDot,
  faClock,
  faPaperPlane,
  faArrowRight,
  faUser,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

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
      `Name: ${formData.name}\n\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    const mailtoLink = `mailto:info@adaskitchen.uk?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  /* ------------------------------------------------------------------ */
  /*  Quick-contact methods for the golden strip                        */
  /* ------------------------------------------------------------------ */
  const contactMethods = [
    {
      icon: faPhone,
      label: "Call Us",
      value: "+44 74663 85015",
      href: "tel:+447466385015",
    },
    {
      icon: faEnvelope,
      label: "Email Us",
      value: "info@adaskitchen.uk",
      href: "mailto:info@adaskitchen.uk",
    },
    {
      icon: faLocationDot,
      label: "Visit Us",
      value: "Brixton Station Road, London SW9 8PA",
      href: "https://w3w.co/call.opera.tens",
    },
  ];

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
        activeLink="Contact Us"
        onClose={() => setMobileNavBarVisible(false)}
        className="md:col-span-1 pt-7"
      />

      {/* ============================================================ */}
      {/*  HERO — full-screen image, cinematic gradients               */}
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
              Get In Touch
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl leading-tight mb-6 [@media(max-height:500px)]:text-2xl [@media(max-height:500px)]:mb-2 [@media(max-height:400px)]:text-xl">
              Let&rsquo;s Plan Something{" "}
              <span className="text-own-2">Delicious</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
              Questions, bookings, or just want to say hello — we&rsquo;d love
              to hear from you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center [@media(max-height:500px)]:gap-2">
              <a href="tel:+447466385015">
                <button className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 inline-flex items-center gap-3 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  <FontAwesomeIcon icon={faPhone} /> Call Now
                </button>
              </a>
              <a href="#contact-form">
                <button className="border-2 border-white/40 hover:border-own-2 hover:text-own-2 text-white font-semibold px-8 py-4 rounded-full tracking-wide backdrop-blur-sm transition-all duration-300 inline-flex items-center gap-3 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Send a Message{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </a>
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
      {/*  QUICK CONTACT STRIP                                         */}
      {/* ============================================================ */}
      <section className="bg-own-2 py-8 md:py-10 [@media(max-height:600px)]:py-5 [@media(max-height:500px)]:py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 [@media(max-height:500px)]:gap-1 [@media(max-height:500px)]:px-3">
          {contactMethods.map((method, i) => (
            <motion.a
              key={i}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={
                method.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[oklch(29.23%_0_0)]/10 transition-colors group [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:p-2 [@media(max-height:500px)]:rounded-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-[oklch(29.23%_0_0)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform [@media(max-height:500px)]:w-9 [@media(max-height:500px)]:h-9">
                <FontAwesomeIcon
                  icon={method.icon}
                  className="text-own-2 text-lg [@media(max-height:500px)]:text-sm"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[oklch(29.23%_0_0)]/60 [@media(max-height:500px)]:text-[9px]">
                  {method.label}
                </div>
                <div className="text-sm md:text-base font-semibold text-[oklch(29.23%_0_0)] truncate [@media(max-height:500px)]:text-xs">
                  {method.value}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FORM + INFO                                                 */}
      {/* ============================================================ */}
      <section id="contact-form" className="py-24 px-4 sm:px-6 bg-gray-50 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 [@media(max-height:600px)]:mb-8 [@media(max-height:500px)]:mb-4"
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Say Hello
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-[oklch(29.23%_0_0)] font-display mb-4 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
              Send Us a Message
            </h2>
            <p className="text-lg text-[oklch(40%_0.05_100)] max-w-2xl mx-auto [@media(max-height:500px)]:text-sm">
              Fill out the form below and we&rsquo;ll get back to you as soon as
              possible
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6 md:gap-8 [@media(max-height:500px)]:gap-3">
            {/* ============ FORM CARD ============ */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="md:col-span-3 bg-white rounded-3xl p-8 md:p-10 shadow-xl [@media(max-height:600px)]:p-5 [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:rounded-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6 [@media(max-height:600px)]:space-y-3 [@media(max-height:500px)]:space-y-2">
                {/* Name */}
                <div>
                  <label className="block font-semibold text-sm text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-xs">
                    Name
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                    />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block font-semibold text-sm text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-xs">
                    Email
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                    />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block font-semibold text-sm text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-xs">
                    Message
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faCommentDots}
                      className="absolute left-4 top-5 text-gray-400 text-sm [@media(max-height:500px)]:top-3.5"
                    />
                    <textarea
                      rows="6"
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your event or question..."
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] resize-none [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:rows-3"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-3 bg-[oklch(29.23%_0_0)] hover:bg-own-2 hover:text-[oklch(29.23%_0_0)] text-white font-semibold px-8 py-4 rounded-full tracking-wide transition-all duration-300 [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm"
                >
                  Send Message{" "}
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="text-sm"
                  />
                </button>
              </form>
            </motion.div>

            {/* ============ INFO CARD ============ */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="md:col-span-2 relative bg-own-1 text-white rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden [@media(max-height:600px)]:p-5 [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:rounded-2xl"
            >
              {/* Decorative glow blobs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-own-2/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-own-2/10 rounded-full blur-3xl" />

              <div className="relative">
                <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                  Visit Us
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-display mb-8 [@media(max-height:600px)]:mb-4 [@media(max-height:500px)]:text-lg [@media(max-height:500px)]:mb-2">
                  Come Say Hi
                </h3>

                <div className="space-y-6 [@media(max-height:600px)]:space-y-3 [@media(max-height:500px)]:space-y-2">
                  {/* Address */}
                  <div className="flex gap-4 [@media(max-height:500px)]:gap-2">
                    <div className="w-10 h-10 rounded-xl bg-own-2/20 flex items-center justify-center flex-shrink-0 [@media(max-height:500px)]:w-8 [@media(max-height:500px)]:h-8">
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="text-own-2 [@media(max-height:500px)]:text-xs"
                      />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-white/50 mb-1 font-bold [@media(max-height:500px)]:text-[9px] [@media(max-height:500px)]:mb-0">
                        Address
                      </div>
                      <p className="text-white/90 leading-relaxed [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:leading-snug">
                        Ada&rsquo;s Kitchen
                        <br />
                        Brixton Station Road
                        <br />
                        London, SW9 8PA
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4 [@media(max-height:500px)]:gap-2">
                    <div className="w-10 h-10 rounded-xl bg-own-2/20 flex items-center justify-center flex-shrink-0 [@media(max-height:500px)]:w-8 [@media(max-height:500px)]:h-8">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="text-own-2 [@media(max-height:500px)]:text-xs"
                      />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-white/50 mb-1 font-bold [@media(max-height:500px)]:text-[9px] [@media(max-height:500px)]:mb-0">
                        Phone
                      </div>
                      <a
                        href="tel:+447466385015"
                        className="text-white/90 hover:text-own-2 transition-colors [@media(max-height:500px)]:text-xs"
                      >
                        +44 74663 85015
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4 [@media(max-height:500px)]:gap-2">
                    <div className="w-10 h-10 rounded-xl bg-own-2/20 flex items-center justify-center flex-shrink-0 [@media(max-height:500px)]:w-8 [@media(max-height:500px)]:h-8">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="text-own-2 [@media(max-height:500px)]:text-xs"
                      />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-white/50 mb-1 font-bold [@media(max-height:500px)]:text-[9px] [@media(max-height:500px)]:mb-0">
                        Email
                      </div>
                      <a
                        href="mailto:info@adaskitchen.uk"
                        className="text-white/90 hover:text-own-2 transition-colors break-all [@media(max-height:500px)]:text-xs"
                      >
                        info@adaskitchen.uk
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4 [@media(max-height:500px)]:gap-2">
                    <div className="w-10 h-10 rounded-xl bg-own-2/20 flex items-center justify-center flex-shrink-0 [@media(max-height:500px)]:w-8 [@media(max-height:500px)]:h-8">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-own-2 [@media(max-height:500px)]:text-xs"
                      />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-white/50 mb-1 font-bold [@media(max-height:500px)]:text-[9px] [@media(max-height:500px)]:mb-0">
                        Hours
                      </div>
                      <p className="text-white/90 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:leading-snug">
                        Mon&ndash;Sat: 10am &ndash; 10pm
                        <br />
                        Sunday: 12pm &ndash; 8pm
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://w3w.co/call.opera.tens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-6 py-3 rounded-full transition-all duration-300 w-full justify-center [@media(max-height:500px)]:mt-3 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-xs"
                >
                  Find Us on what3words{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHAT3WORDS SHOWCASE                                         */}
      {/* ============================================================ */}
      <section className="py-24 px-4 sm:px-6 bg-own-1 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Find Our Exact Spot
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-display mb-6 [@media(max-height:500px)]:text-xl [@media(max-height:500px)]:mb-2">
              Pinpoint Our <span className="text-own-2">Location</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-12 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
              Use what3words to find our exact entrance &mdash; accurate to a
              3&nbsp;m square
            </p>

            {/* Big code display */}
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-own-2/20 blur-3xl rounded-full" />
              <a
                href="https://w3w.co/call.opera.tens"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block bg-white/5 backdrop-blur-md border border-white/20 hover:border-own-2 rounded-3xl px-8 md:px-16 py-8 md:py-12 transition-all duration-300 group [@media(max-height:500px)]:px-6 [@media(max-height:500px)]:py-4 [@media(max-height:500px)]:rounded-2xl"
              >
                <div className="flex items-center justify-center gap-3 mb-3 flex-wrap [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:mb-1">
                  <span className="text-white/50 text-2xl md:text-3xl font-light [@media(max-height:500px)]:text-lg">
                    ///
                  </span>
                  <span className="text-2xl sm:text-3xl md:text-5xl font-bold text-own-2 font-display tracking-wider break-all [@media(max-height:500px)]:text-xl">
                    call.opera.tens
                  </span>
                </div>
                <div className="text-white/60 text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 group-hover:text-own-2 transition-colors [@media(max-height:500px)]:text-[9px]">
                  Open in what3words{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </div>
              </a>
            </div>

            <p className="mt-10 text-white/50 text-sm [@media(max-height:500px)]:mt-4 [@media(max-height:500px)]:text-xs">
              Or enter{" "}
              <span className="text-own-2 font-semibold">
                ///call.opera.tens
              </span>{" "}
              manually in the what3words app
            </p>
          </motion.div>
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
              Hungry Yet? <span className="text-own-2">Let&rsquo;s Talk.</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-4">
              Whether it&rsquo;s a quick order or a grand celebration, we&rsquo;re
              here to make it delicious
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center [@media(max-height:500px)]:gap-2">
              <Link to="/menu">
                <button className="inline-flex items-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-semibold px-8 py-4 rounded-full tracking-wide shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/50] transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  Order Online{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </button>
              </Link>
              <a href="tel:+447466385015">
                <button className="inline-flex items-center gap-3 border-2 border-white/40 hover:border-own-2 hover:text-own-2 text-white font-semibold px-8 py-4 rounded-full tracking-wide backdrop-blur-sm transition-all duration-300 [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm">
                  <FontAwesomeIcon icon={faPhone} /> Call Now
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