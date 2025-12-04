import React, { useState } from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import { motion } from 'framer-motion';
import { useCart } from "../context/CartContext"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faPlus, faTrashCan, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import allDishes from "../data/allDishes";
import AlertBanner from "../components/AlertBanner";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";

export default function Cart() {
  const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
  const { cart, getTotalQuantity, updateQuantity, removeFromCart, addToCart, clearCart } = useCart();
  const [alert, setAlert] = useState(null);

  const handleQuantityChange = (id, newQuantity) => {
    updateQuantity(id, newQuantity);
    setAlert({ message: 'Quantity updated', type: 'success' });
    setTimeout(() => setAlert(null), 2000);
  };

  const handleRemoveFromCart = (id, name) => {
    removeFromCart(id);
    setAlert({ message: `${name} removed from cart`, type: 'success' });
    setTimeout(() => setAlert(null), 2000);
  };

  const handleAddToCart = (dish) => {
    addToCart(dish);
    setAlert({ message: `${dish.name} added to cart!`, type: 'success' });
    setTimeout(() => setAlert(null), 2000);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDelivery = () => {
    return calculateSubtotal() > 5000 ? 0 : 800; // Free delivery over £50
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDelivery();
  };

  const relatedDishes = allDishes
    .filter(dish => !cart.some(cartItem => cartItem.id === dish.id))
    .slice(0, 4);

  return (
    <>
      {alert && <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <NavBar activeLink="Cart" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)} />
      <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Cart" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7" />

      {/* Hero Section */}
      <section className="relative bg-[url(./assets/background4.jpg)] h-[40vh] bg-center bg-cover">
        <div className="absolute inset-0 h-[40vh] opacity-70 bg-black" />
        <div className="relative flex items-center justify-center h-full">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
            <div className="p-10 text-center text-white mt-10">
              <h2 className="font-display tracking-widest font-black text-4xl drop-shadow-lg">Your Cart</h2>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {cart.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faCartShopping} className="text-own-2 text-6xl mb-6 opacity-80"/>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Browse our mouthwatering dishes and treat yourself to something special!
            </p>
            <Link to="/menu">
              <button className="px-8 py-4 bg-own-2 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors flex items-center mx-auto">
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Browse Menu
              </button>
            </Link>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-own-2">Your Order ({getTotalQuantity()} items)</h2>
                  <button 
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-6 pb-6 border-b border-gray-100 last:border-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover rounded-xl border-2 border-own-2 flex-shrink-0" 
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-own-2 mb-1 truncate">{item.name}</h3>
                        <p className="text-gray-600 mb-2">£{(item.price).toFixed(2)} each</p>
                        <p className="text-lg font-bold text-own-2">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity === 1}
                            className={`w-8 h-8 rounded-full transition ${
                              item.quantity === 1
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-own-2 text-white hover:bg-amber-600"
                            }`}
                          >
                            −
                          </button>

                          <span className="w-8 text-center font-semibold text-black">{item.quantity}</span>

                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity === item.stock}
                            className={`w-8 h-8 rounded-full transition ${
                              item.quantity === item.stock
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-own-2 text-white hover:bg-amber-600"
                            }`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(item.id, item.name)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Dishes */}
              {relatedDishes.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-own-2 mb-4">You might also like</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedDishes.map(dish => (
                      <div key={dish.id} className="text-center group">
                        <img 
                          src={dish.image} 
                          alt={dish.name} 
                          className="w-full h-20 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                        />
                        <h4 className="text-sm font-semibold text-own-2 mb-1 truncate">{dish.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">£{(dish.price / 100).toFixed(2)}</p>
                        <button
                          onClick={() => handleAddToCart(dish)}
                          className="text-xs bg-own-2 text-white px-3 py-1 rounded-full hover:bg-amber-600 transition-colors"
                        >
                          Add +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-own-2 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6 text-black">
                  <div className="flex justify-between">
                    <span>Subtotal ({getTotalQuantity()} items)</span>
                    <span>£{(calculateSubtotal()).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{calculateDelivery() === 0 ? 'FREE' : `£${(calculateDelivery()).toFixed(2)}`}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-own-2">£{(calculateTotal()).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-6">
                  <p>✓ Free delivery on orders over £200</p>
                  <p>✓ Orders prepared fresh daily</p>
                </div>

                <Link to="/checkout">
                  <button className="w-full py-4 bg-own-2 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-md">
                    Proceed to Checkout
                  </button>
                </Link>

                <Link to="/menu">
                  <button className="w-full py-3 border border-own-2 text-own-2 font-bold rounded-xl hover:bg-gray-50 transition-colors mt-3">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer/>
    </>
  );
}