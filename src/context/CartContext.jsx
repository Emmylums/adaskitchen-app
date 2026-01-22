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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  // NEW: Save pending cart to localStorage for transfer (public cart)
  const savePendingCart = (cartItems) => {
    try {
      const pendingCart = {
        items: cartItems,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        source: 'public_cart'
      };
      localStorage.setItem('pending_cart_transfer', JSON.stringify(pendingCart));
      // Also save to sessionStorage for additional security
      sessionStorage.setItem('pending_cart', JSON.stringify(pendingCart));
      return true;
    } catch (error) {
      console.error("Error saving pending cart:", error);
      return false;
    }
  };

  // NEW: Load and merge pending cart
  const loadAndMergePendingCart = () => {
    try {
      const pendingCartData = localStorage.getItem('pending_cart_transfer') || 
                             sessionStorage.getItem('pending_cart');
      
      if (!pendingCartData) return { success: false, message: 'No pending cart found' };

      const pendingCart = JSON.parse(pendingCartData);
      
      // Check if cart is expired
      const now = new Date();
      const expiresAt = new Date(pendingCart.expiresAt);
      
      if (now > expiresAt) {
        // Clear expired cart
        localStorage.removeItem('pending_cart_transfer');
        sessionStorage.removeItem('pending_cart');
        return { success: false, message: 'Cart has expired' };
      }

      if (pendingCart.source === 'public_cart') {
        // Merge the pending cart with current cart
        mergeCart(pendingCart.items);
        
        // Clear the pending cart storage
        localStorage.removeItem('pending_cart_transfer');
        sessionStorage.removeItem('pending_cart');
        
        return { 
          success: true, 
          message: 'Cart merged successfully', 
          itemCount: pendingCart.items.length 
        };
      }
      
      return { success: false, message: 'Invalid cart source' };
    } catch (error) {
      console.error("Error loading pending cart:", error);
      return { success: false, message: 'Error loading cart' };
    }
  };

  // NEW: Merge cart without duplicates
  const mergeCart = (newCartItems) => {
    setCart(prevCart => {
      const mergedCart = [...prevCart];
      
      newCartItems.forEach(newItem => {
        const existingItemIndex = mergedCart.findIndex(item => item.id === newItem.id);
        
        if (existingItemIndex > -1) {
          // Update quantity if item already exists
          const existingItem = mergedCart[existingItemIndex];
          const stockLimit = newItem.stock || existingItem.stock || 100;
          const newQuantity = Math.min(existingItem.quantity + newItem.quantity, stockLimit);
          
          mergedCart[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            stock: Math.max(existingItem.stock || 100, newItem.stock || 100)
          };
        } else {
          // Add new item
          mergedCart.push({
            ...newItem,
            stock: newItem.stock || 100
          });
        }
      });
      
      return mergedCart;
    });
  };

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
        getItemQuantity,
        // NEW: Add these functions
        savePendingCart,
        loadAndMergePendingCart,
        mergeCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};