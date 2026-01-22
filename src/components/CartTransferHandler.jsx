import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CartTransferHandler() {
  const { loadAndMergePendingCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user just logged in and there's a pending cart
    const checkForPendingCart = () => {
      const result = loadAndMergePendingCart();
      
      if (result.success) {
        // Show success message if items were merged
        console.log(`Successfully merged ${result.itemCount} items from guest cart`);
        
        // If we're on the cart page, refresh the cart display
        if (location.pathname === '/user/cart') {
          // You could trigger a state update here if needed
          window.location.reload(); // Simple refresh approach
        }
      }
    };

    // Run the check when component mounts (after login)
    checkForPendingCart();
  }, [loadAndMergePendingCart, location.pathname]);

  return null; // This is a utility component, doesn't render anything
}