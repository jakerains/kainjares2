import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cancel = () => {
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
              className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto"
            >
              <XCircle className="w-16 h-16 text-red-500" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Order Cancelled</h1>
          <p className="text-xl text-gray-300 mb-8">
            Your order has been cancelled. No charges have been made to your account.
          </p>
          
          <div className="bg-space-purple/20 border border-space-purple rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
            <p className="text-gray-300 mb-4">
              If you encountered any issues during checkout or have questions about our products, 
              we're here to help!
            </p>
            <Link
              to="/contact"
              className="text-alien-glow hover:text-alien-bright transition-colors"
            >
              Contact our support team
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/store"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full hover:bg-alien-bright transition-colors"
            >
              <ArrowLeft size={20} />
              Return to Store
            </Link>
            <Link
              to="/cart"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-alien-glow text-alien-glow font-bold rounded-full hover:bg-alien-glow/10 transition-colors"
            >
              <ShoppingCart size={20} />
              View Cart
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cancel;