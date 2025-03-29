import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Success = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  useEffect(() => {
    // Clear the cart after successful purchase
    clearCart();
  }, [clearCart]);
  
  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2 
              }}
              className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Thank you for your purchase! Your order has been successfully processed.
          </p>
          
          <div className="bg-space-purple/20 border border-space-purple rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
            <ul className="text-left space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-alien-glow mr-2">•</span>
                You'll receive an order confirmation email shortly
              </li>
              <li className="flex items-start">
                <span className="text-alien-glow mr-2">•</span>
                Your items will be packaged with care using eco-friendly materials
              </li>
              <li className="flex items-start">
                <span className="text-alien-glow mr-2">•</span>
                Shipping updates will be sent to your email
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/store"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full hover:bg-alien-bright transition-colors"
            >
              <ArrowLeft size={20} />
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Success;