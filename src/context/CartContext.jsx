import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserData } from "../users/hooks/useUserData";

// Create context
const CartContext = createContext();

// Custom hook for easier usage
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }) => {
  const { userData, loading: userLoading } = useUserData();
  // Load cart from localStorage on initial render
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
    return [];
  });

  

  const addToCart = (item, quantityToAdd = 1) => {
    setCart(prevCart => {
      const exists = prevCart.find(cartItem => cartItem.id === item.id);
      if (exists) {
        const newQty = Math.min(exists.quantity + quantityToAdd, exists.stock || Infinity);
        const updatedCart = prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: newQty }
            : cartItem
        );
        return updatedCart;
      }
      // Add stock property from the item if it exists
      const newItem = { 
        ...item, 
        quantity: quantityToAdd,
        stock: item.stock || 100 // Default stock if not provided
      };
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.id === id
          ? {
              ...cartItem,
              quantity: Math.min(newQuantity, cartItem.stock || newQuantity),
            }
          : cartItem
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.length;
  };

  const getTotalQuantity = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Helper function to check if item exists in cart
  const isInCart = (id) => {
    return cart.some(item => item.id === id);
  };

  // Get item quantity in cart
  const getItemQuantity = (id) => {
    const item = cart.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        userData,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalQuantity,
        getCartTotal,
        isInCart,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};