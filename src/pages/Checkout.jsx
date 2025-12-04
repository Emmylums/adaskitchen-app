import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import AlertBanner from "../components/AlertBanner";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      setAlert({ message: "Please fill in all fields", type: "error" });
      return;
    }

    // Simulate placing order
    setAlert({ message: "Order placed successfully!", type: "success" });

    setTimeout(() => {
      clearCart();
      navigate("/");
    }, 2000);
  };

  return (
    <>
      {alert && (
        <AlertBanner
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <NavBar activeLink="Checkout" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Checkout" onClose={() => setMobileNavBarVisible(false)} />

      <section className="relative bg-[url(./assets/background4.jpg)] h-[50vh] bg-center bg-cover">
        <div className="absolute inset-0 h-[50vh] opacity-70 bg-black" />
        <div className="relative flex items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0 }}
          >
            <div className="p-10 text-center text-white mt-10">
              <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg drop-shadow-black">Checkout</h2>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 text-black">
        {/* Left - Form */}
        <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-own-2 mb-6">Customer Information</h3>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl"
              placeholder="John Doe"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl"
              placeholder="08123456789"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Delivery Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl"
              rows="4"
              placeholder="123 Ada's Kitchen Street, PH"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-own-2 text-white font-bold py-4 rounded-full hover:bg-own-2/90 transition"
          >
            Place Order
          </button>
        </form>

        {/* Right - Cart Summary */}
        <div className="bg-gray-50 rounded-2xl shadow-md p-8 text-black">
          <h3 className="text-2xl font-bold text-own-2 mb-6">Order Summary</h3>
          <ul className="divide-y divide-gray-200">
            {cart.map(item => (
              <li key={item.id} className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-gray-600">₦{item.price.toLocaleString()} × {item.quantity}</p>
                </div>
                <span className="font-semibold text-own-2">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between text-lg font-bold text-black">
            <span>Total:</span>
            <span>₦{getCartTotal().toLocaleString()}</span>
          </div>
          <p className="text-sm mt-3 text-gray-500">
            Delivery fee not included. You will be contacted shortly after placing your order.
          </p>
        </div>
      </div>
      <Footer/>
    </>
  );
}
