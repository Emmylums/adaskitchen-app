import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import bg from "../assets/bgcont.jpeg";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faShieldAlt, faBalanceScale, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function PrivacyPolicy() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);

  const privacySections = [
    { title: "Information We Collect", content: "We collect personal information you provide directly to us, including name, email address, phone number, delivery address, payment information, and dietary preferences. We also automatically collect certain information about your device and usage patterns through cookies and similar technologies.", points: ["Contact information for order processing and delivery", "Payment details for transaction processing", "Delivery preferences and address history", "Communication preferences and feedback"] },
    { title: "How We Use Your Information", content: "We use the collected information for various purposes including:", points: ["Processing and delivering your food orders", "Communicating order status and updates", "Personalizing your dining experience", "Improving our services and menu offerings", "Sending promotional offers (with your consent)", "Ensuring food safety and allergy considerations"] },
    { title: "Data Sharing and Disclosure", content: "We do not sell your personal information. We may share your information with:", points: ["Delivery partners to fulfill your orders", "Payment processors to complete transactions", "Service providers who assist our operations", "Legal authorities when required by law"] },
    { title: "Data Security", content: "We implement appropriate security measures to protect your personal information. This includes encryption, secure servers, and restricted access to personal data. However, no method of transmission over the Internet is 100% secure.", points: [] },
    { title: "Your Rights and Choices", content: "You have the right to:", points: ["Access and review your personal information", "Correct inaccurate data", "Request deletion of your data", "Opt-out of marketing communications", "Object to certain processing activities"] },
    { title: "Cookies and Tracking", content: "We use cookies and similar technologies to enhance your experience, analyze site usage, and deliver personalized content. You can control cookie preferences through your browser settings.", points: [] },
    { title: "Data Retention", content: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.", points: [] },
    { title: "Children's Privacy", content: "Our services are not directed to individuals under 16. We do not knowingly collect personal information from children without parental consent.", points: [] },
    { title: "International Transfers", content: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers.", points: [] },
    { title: "Changes to This Policy", content: "We may update this privacy policy periodically. We will notify you of significant changes through our website or direct communication.", points: [] },
  ];

  const principles = [
    { icon: faLock, title: "Transparency", desc: "We're clear about how we use your data" },
    { icon: faShieldAlt, title: "Security", desc: "Your data is protected with advanced security" },
    { icon: faBalanceScale, title: "Control", desc: "You have control over your personal information" },
  ];

  return (
    <>
      <NavBar activeLink="Privacy" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Privacy" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      {/* HERO */}
      <section className="relative h-[70vh] min-h-[280px] overflow-hidden [@media(max-height:500px)]:h-[55vh] [@media(max-height:500px)]:min-h-[220px] [@media(max-height:400px)]:min-h-[200px]">
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
              Legal
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl leading-tight mb-6 [@media(max-height:500px)]:text-2xl [@media(max-height:500px)]:mb-2 [@media(max-height:400px)]:text-xl">
              Privacy <span className="text-own-2">Policy</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 [@media(max-height:500px)]:text-sm">
              How we protect and use your information
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRINCIPLES STRIP */}
      <section className="bg-own-2 py-10 [@media(max-height:600px)]:py-6 [@media(max-height:500px)]:py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-4 [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:px-3">
          {principles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 p-4 [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:p-2"
            >
              <div className="w-12 h-12 rounded-xl bg-[oklch(29.23%_0_0)] flex items-center justify-center flex-shrink-0 [@media(max-height:500px)]:w-9 [@media(max-height:500px)]:h-9">
                <FontAwesomeIcon icon={p.icon} className="text-own-2 text-lg [@media(max-height:500px)]:text-sm" />
              </div>
              <div>
                <div className="text-sm md:text-base font-bold text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-xs">
                  {p.title}
                </div>
                <div className="text-xs md:text-sm text-[oklch(29.23%_0_0)]/70 [@media(max-height:500px)]:text-[10px]">
                  {p.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-24 px-4 sm:px-6 bg-gray-50 [@media(max-height:600px)]:py-10 [@media(max-height:500px)]:py-8 [@media(max-height:500px)]:px-3">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 [@media(max-height:600px)]:mb-6 [@media(max-height:500px)]:mb-4"
          >
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Effective Date
            </span>
            <p className="text-lg font-semibold text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-sm">
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-[oklch(40%_0.05_100)] max-w-2xl mx-auto mt-4 leading-relaxed [@media(max-height:500px)]:mt-2 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:leading-snug">
              At Ada's Kitchen, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
            </p>
          </motion.div>

          <div className="space-y-4 [@media(max-height:500px)]:space-y-2">
            {privacySections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-md p-8 border-l-4 border-own-2 hover:shadow-lg transition-shadow [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:rounded-xl"
              >
                <h3 className="text-xl md:text-2xl font-bold text-[oklch(29.23%_0_0)] mb-4 flex items-start gap-3 [@media(max-height:500px)]:text-base [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-own-2 text-[oklch(29.23%_0_0)] text-sm font-black flex-shrink-0 mt-0.5 [@media(max-height:500px)]:w-6 [@media(max-height:500px)]:h-6 [@media(max-height:500px)]:text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h3>
                <p className="text-[oklch(40%_0.05_100)] leading-relaxed mb-4 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:leading-snug">{section.content}</p>
                {section.points.length > 0 && (
                  <ul className="space-y-2 [@media(max-height:500px)]:space-y-1">
                    {section.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:text-sm">
                        <div className="w-1.5 h-1.5 bg-own-2 rounded-full mt-2.5 flex-shrink-0 [@media(max-height:500px)]:mt-2" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-own-1 text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden [@media(max-height:500px)]:mt-4 [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:rounded-2xl"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-own-2/20 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold font-display mb-6 text-center [@media(max-height:500px)]:text-lg [@media(max-height:500px)]:mb-3">
                Contact Our Privacy Team
              </h3>
              <div className="grid md:grid-cols-2 gap-6 [@media(max-height:500px)]:gap-3">
                <div>
                  <h4 className="font-semibold text-own-2 mb-2 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-1">Data Protection Officer</h4>
                  <p className="text-white/80 text-sm [@media(max-height:500px)]:text-xs">info@adaskitchen.uk</p>
                  <p className="text-white/60 text-xs mt-2 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:mt-1">For privacy-specific inquiries and data subject requests</p>
                </div>
                <div>
                  <h4 className="font-semibold text-own-2 mb-2 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-1">General Contact</h4>
                  <p className="text-white/80 text-sm [@media(max-height:500px)]:text-xs">info@adaskitchen.uk</p>
                  <p className="text-white/80 text-sm [@media(max-height:500px)]:text-xs">+44 74663 85015</p>
                  <p className="text-white/60 text-xs mt-2 [@media(max-height:500px)]:text-[10px] [@media(max-height:500px)]:mt-1">Ada's Kitchen, Brixton Station Road, London, SW9 8PA</p>
                </div>
              </div>
            </div>
          </motion.div>

          <p className="mt-8 text-center text-sm text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:mt-3 [@media(max-height:500px)]:text-xs">
            By using our services, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}