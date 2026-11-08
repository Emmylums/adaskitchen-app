import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
import bg from "../assets/bgcont.jpeg";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScroll, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export default function TermsAndConditions() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);

  const termsSections = [
    { title: "Acceptance of Terms", content: "By accessing and using Ada's Kitchen website, mobile application, and services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services." },
    { title: "Ordering and Payments", content: "All orders are subject to availability and confirmation. Prices are subject to change without notice. We accept various payment methods including credit/debit cards and digital wallets. Payment is processed securely through our payment gateway partners." },
    { title: "Cancellations and Refunds", content: "Orders can be cancelled within 15 minutes of placement. Once food preparation begins, cancellations may not be possible. Refunds are processed according to our refund policy and may take 5-10 business days to reflect in your account." },
    { title: "User Accounts", content: "You are responsible for maintaining the confidentiality of your account credentials. Any activities under your account are your responsibility. We reserve the right to terminate accounts that violate our terms or engage in fraudulent activities." },
    { title: "Intellectual Property", content: "All content on our platform including logos, menu designs, recipes, and website content are property of Ada's Kitchen and protected by intellectual property laws. Unauthorized use is strictly prohibited." },
    { title: "Limitation of Liability", content: "Ada's Kitchen is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific order in question." },
    { title: "Food Allergies and Dietary Requirements", content: "While we take precautions to accommodate dietary needs, we cannot guarantee complete allergen-free preparation. Customers with severe allergies should contact us directly before ordering. We are not liable for allergic reactions." },
    { title: "Changes to Terms", content: "We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms." },
  ];

  const importantNotices = [
    "Minimum order value may apply for delivery",
    "Service charges and taxes are included in the final price",
    "Age verification may be required for alcohol purchases",
    "We reserve the right to refuse service to anyone",
    "Promotional offers cannot be combined unless specified",
  ];

  return (
    <>
      <NavBar activeLink="Terms" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Terms" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

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
              Terms &amp; <span className="text-own-2">Conditions</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 [@media(max-height:500px)]:text-sm">
              Understanding our service agreement
            </p>
          </motion.div>
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
              Last Updated
            </span>
            <p className="text-lg font-semibold text-[oklch(29.23%_0_0)] mb-4 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-2">
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-[oklch(40%_0.05_100)] max-w-2xl mx-auto leading-relaxed [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:leading-snug">
              Please read these Terms and Conditions carefully before using our services. These terms outline the rules and regulations for the use of Ada's Kitchen's Website and Services.
            </p>
          </motion.div>

          {/* Important Notices */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-amber-50 border-l-4 border-own-2 rounded-2xl p-8 mb-8 [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:mb-4 [@media(max-height:500px)]:rounded-xl"
          >
            <h3 className="text-2xl font-bold text-[oklch(29.23%_0_0)] mb-4 flex items-center gap-3 [@media(max-height:500px)]:text-lg [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-own-2" />
              Important Notices
            </h3>
            <ul className="space-y-2 [@media(max-height:500px)]:space-y-1">
              {importantNotices.map((notice, i) => (
                <li key={i} className="flex items-start gap-3 text-[oklch(40%_0.05_100)] [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:text-sm">
                  <div className="w-1.5 h-1.5 bg-own-2 rounded-full mt-2.5 flex-shrink-0 [@media(max-height:500px)]:mt-2" />
                  <span>{notice}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Sections */}
          <div className="space-y-4 [@media(max-height:500px)]:space-y-2">
            {termsSections.map((section, index) => (
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
                <p className="text-[oklch(40%_0.05_100)] leading-relaxed [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:leading-snug">{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-own-1 text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden text-center [@media(max-height:500px)]:mt-4 [@media(max-height:500px)]:p-4 [@media(max-height:500px)]:rounded-2xl"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-own-2/20 rounded-full blur-3xl" />
            <div className="relative">
              <FontAwesomeIcon icon={faScroll} className="text-own-2 text-3xl mb-4 [@media(max-height:500px)]:text-2xl [@media(max-height:500px)]:mb-2" />
              <h3 className="text-2xl md:text-3xl font-bold font-display mb-4 [@media(max-height:500px)]:text-lg [@media(max-height:500px)]:mb-2">
                Questions About Our Terms?
              </h3>
              <p className="text-white/80 mb-6 max-w-xl mx-auto [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mb-3">
                If you have any questions about these Terms and Conditions, please don't hesitate to contact us.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-own-2 font-semibold text-sm md:text-base [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:text-xs">
                <a href="mailto:info@adaskitchen.uk" className="hover:text-white transition-colors">📧 info@adaskitchen.uk</a>
                <a href="tel:+447466385015" className="hover:text-white transition-colors">📞 +44 74663 85015</a>
                <span className="text-white/60">📍 Brixton Station Road, London, SW9 8PA</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}