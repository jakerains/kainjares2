import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity,
    totalItems,
    totalPrice
  } = useCart();

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      // Create checkout session
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity
          })),
          successUrl: `${window.location.origin}/store/success`,
          cancelUrl: `${window.location.origin}/store/cancel`,
        }),
      });

      const { sessionId, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }
      
      // Redirect to Stripe checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      console.error('Error in checkout:', error);
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  return (
    <Fragment>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40"
          />
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-space-deep border-l border-space-purple z-50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-space-purple">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="text-alien-glow mr-2" />
                <h2 className="text-xl font-bold">Your Cart</h2>
                <span className="ml-2 px-2 py-1 bg-space-purple/40 rounded-full text-sm">
                  {totalItems} items
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-space-purple/40 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}`}
                    className="flex gap-4 bg-space-purple/20 rounded-lg p-3"
                  >
                    <div className="w-20 h-20 rounded-md overflow-hidden">
                      <img
                        src={item.images[0] || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-400">Size: {item.selectedSize}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item, Math.max(0, item.quantity - 1))}
                            className="p-1 hover:bg-space-purple/40 rounded transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="p-1 hover:bg-space-purple/40 rounded transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-2 text-right font-medium text-alien-glow">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-space-purple">
            <div className="flex justify-between mb-4">
              <span className="text-gray-400">Subtotal</span>
              <span className="font-medium">${totalPrice.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-alien-glow text-space-dark font-medium rounded-md hover:bg-alien-bright disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </motion.div>
    </Fragment>
  );
};

export default CartDrawer;