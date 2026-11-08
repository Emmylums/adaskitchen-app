import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import AlertBanner from "../components/AlertBanner";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bgcont.jpeg";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhone,
  faMapLocationDot,
  faLock,
  faArrowRight,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";

export default function Checkout() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const { cart, getCartTotal, clearCart } = useCart();
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      setAlert({ message: "Please fill in all fields", type: "error" });
      return;
    }

    setAlert({ message: "Order placed successfully!", type: "success" });

    setTimeout(() => {
      clearCart();
      navigate("/");
    }, 2000);
  };

  return (
    <>
      {alert && (
        <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
      )}

      <NavBar activeLink="Checkout" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Checkout" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      {/* HERO */}
      <section className="relative h-[50vh] min-h-[280px] overflow-hidden [@media(max-height:500px)]:h-[45vh] [@media(max-height:500px)]:min-h-[200px]">
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
            <span className="inline-block text-own-2 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
              Almost There
            </span>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-tight [@media(max-height:500px)]:text-2xl [@media(max-height:400px)]:text-xl">
              Check<span className="text-own-2">out</span>
            </h1>
            <p className="text-lg text-white/80 mt-3 [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:mt-1">
              Complete your order in just a few steps
            </p>
          </motion.div>
        </div>
      </section>

      {/* MAIN */}
      <section className="py-16 px-4 bg-gray-50 [@media(max-height:600px)]:py-6 [@media(max-height:500px)]:py-4 [@media(max-height:500px)]:px-2">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 [@media(max-height:500px)]:gap-3">
          {/* FORM */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onSubmit={handlePlaceOrder}
            className="bg-white rounded-3xl shadow-lg overflow-hidden [@media(max-height:500px)]:rounded-2xl"
          >
            <div className="h-1.5 bg-gradient-to-r from-own-2 via-[oklch(85%_0.171_83.42)] to-own-2" />
            <div className="p-6 md:p-8 [@media(max-height:600px)]:p-4 [@media(max-height:500px)]:p-3">
              <div className="flex items-center gap-3 mb-6 [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:mb-3">
                <div className="w-10 h-10 rounded-xl bg-own-2 flex items-center justify-center [@media(max-height:500px)]:w-8 [@media(max-height:500px)]:h-8 [@media(max-height:500px)]:rounded-lg">
                  <FontAwesomeIcon icon={faUser} className="text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-sm" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[oklch(29.23%_0_0)] font-display [@media(max-height:500px)]:text-base">
                  Delivery Information
                </h3>
              </div>

              <div className="space-y-5 [@media(max-height:600px)]:space-y-3 [@media(max-height:500px)]:space-y-2">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                    Full Name
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                      placeholder="+44 7xxx xxxxxx"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-xs font-semibold text-[oklch(29.23%_0_0)] mb-2 uppercase tracking-wider [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faMapLocationDot} className="absolute left-4 top-5 text-gray-400 text-sm [@media(max-height:500px)]:top-4" />
                    <textarea
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-own-2 transition-colors text-[oklch(29.23%_0_0)] resize-none [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:rounded-xl [@media(max-height:500px)]:text-sm"
                      placeholder="123 Brixton Station Road, London SW9 8PA"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-3 bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-bold py-4 rounded-full tracking-wide transition-all duration-300 shadow-md hover:shadow-lg [@media(max-height:600px)]:py-3 [@media(max-height:500px)]:py-2.5 [@media(max-height:500px)]:text-sm"
                >
                  <FontAwesomeIcon icon={faLock} className="text-sm" />
                  Place Order
                </button>

                <p className="text-center text-xs text-[oklch(40%_0.05_100)] flex items-center justify-center gap-1.5 [@media(max-height:500px)]:text-[10px]">
                  <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                  Secure checkout — your info is safe
                </p>
              </div>
            </div>
          </motion.form>

          {/* SUMMARY */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-own-1 text-white rounded-3xl shadow-lg overflow-hidden relative [@media(max-height:500px)]:rounded-2xl"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-own-2/20 rounded-full blur-3xl" />
            <div className="relative p-6 md:p-8 [@media(max-height:600px)]:p-4 [@media(max-height:500px)]:p-3">
              <div className="flex items-center gap-3 mb-6 [@media(max-height:500px)]:gap-2 [@media(max-height:500px)]:mb-3">
                <div className="w-10 h-10 rounded-xl bg-own-2 flex items-center justify-center [@media(max-height:500px)]:w-8 [@media(max-height:500px)]:h-8 [@media(max-height:500px)]:rounded-lg">
                  <FontAwesomeIcon icon={faShoppingBag} className="text-[oklch(29.23%_0_0)] [@media(max-height:500px)]:text-sm" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-display [@media(max-height:500px)]:text-base">Order Summary</h3>
              </div>

              <ul className="divide-y divide-white/10 mb-6 [@media(max-height:500px)]:mb-3">
                {cart.map((item) => (
                  <li key={item.id} className="py-4 flex justify-between items-start gap-4 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate [@media(max-height:500px)]:text-sm">{item.name}</h4>
                      <p className="text-sm text-white/60 mt-0.5 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:mt-0">
                        £{(item.price || 0).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-own-2 whitespace-nowrap [@media(max-height:500px)]:text-sm">
                      £{((item.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/20 pt-4 mb-4 [@media(max-height:500px)]:pt-2 [@media(max-height:500px)]:mb-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold [@media(max-height:500px)]:text-base">Total</span>
                  <span className="text-2xl md:text-3xl font-black text-own-2 [@media(max-height:500px)]:text-xl">
                    £{getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-white/60 flex items-start gap-2 [@media(max-height:500px)]:text-xs">
                <span className="text-own-2 mt-0.5">•</span>
                Delivery fee not included. You will be contacted shortly after placing your order.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}