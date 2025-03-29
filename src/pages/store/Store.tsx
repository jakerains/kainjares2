import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ProductGrid from '../../components/store/ProductGrid';
import CartDrawer from '../../components/store/CartDrawer';
import type { Product, Category } from '../../types/store';
import { useCart } from '../../context/CartContext';

const Store = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedItem, setAddedItem] = useState<{
    x: number;
    y: number;
    image: string;
  } | null>(null);
  const { totalItems } = useCart();
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleItemAdded = (e: MouseEvent, productImage: string) => {
    const cartButton = document.querySelector('.cart-button');
    if (!cartButton) return;

    const cartRect = cartButton.getBoundingClientRect();
    const cartX = cartRect.left + cartRect.width / 2;
    const cartY = cartRect.top + cartRect.height / 2;

    setAddedItem({
      x: e.clientX - cartX,
      y: e.clientY - cartY,
      image: productImage
    });

    // Clear animation after it completes
    setTimeout(() => setAddedItem(null), 1500); // Increased duration
  };
  
  return (
    <div className="min-h-screen bg-space-dark">
      {/* Hero Banner */}
      <div className="relative h-[500px] bg-space-deep">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-alien-glow/5 via-transparent to-transparent opacity-70"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-6"
            >
              Intergalactic <span className="text-alien-glow">Merch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 mb-8"
            >
              Authentic alien merchandise, straight from my home planet to your doorstep.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <a 
                href="#products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full hover:bg-alien-bright transition-colors"
              >
                Shop Now
                <ChevronRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 w-1/3 h-full">
          <div className="absolute inset-0 bg-gradient-to-l from-alien-glow/5 to-transparent" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-0 right-0 w-full h-full bg-[url('/images/alien.svg')] bg-contain bg-no-repeat bg-bottom"
          />
        </div>
      </div>

      {/* Main Content */}
      <div id="products" className="container mx-auto px-4 py-16">
        {/* Cart button with enhanced animation */}
        <motion.button
          onClick={() => setIsCartOpen(true)}
          className="cart-button fixed bottom-8 right-8 z-30 p-4 bg-alien-glow text-space-dark rounded-full shadow-lg hover:bg-alien-bright transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ShoppingBag size={24} />
        
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.div
                key="cart-count"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-space-purple text-white rounded-full flex items-center justify-center text-sm font-bold"
              >
                {totalItems}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {addedItem && (
              <>
                {/* Enhanced UFO beam effect */}
                <motion.div
                  key="beam"
                  initial={{ 
                    height: 0,
                    opacity: 0,
                    x: addedItem.x,
                    y: addedItem.y,
                    scaleX: 0.2
                  }}
                  animate={{
                    height: [0, 200, 0],
                    opacity: [0, 0.8, 0],
                    x: 0,
                    y: 0,
                    scaleX: [0.2, 1, 0.2]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1,
                    ease: "easeInOut"
                  }}
                  style={{
                    position: "absolute",
                    width: "100px",
                    background: "linear-gradient(to bottom, transparent, #4AFF8C)",
                    transformOrigin: "top",
                    left: "-50px",
                    zIndex: -1,
                    borderRadius: "50%",
                    filter: "blur(8px)"
                  }}
                />

                {/* Enhanced product image animation */}
                <motion.div
                  key="product"
                  initial={{ 
                    scale: 1,
                    x: addedItem.x,
                    y: addedItem.y,
                    opacity: 1,
                    rotate: 0
                  }}
                  animate={{
                    scale: [1, 1.5, 0],
                    x: [addedItem.x, 0, 0],
                    y: [addedItem.y, 0, 0],
                    opacity: [1, 1, 0],
                    rotate: [0, 720, 1080]
                  }}
                  transition={{
                    duration: 1,
                    times: [0, 0.7, 1],
                    ease: "easeInOut"
                  }}
                  style={{
                    position: "absolute",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    boxShadow: "0 0 20px rgba(74, 255, 140, 0.5)"
                  }}
                >
                  <img 
                    src={addedItem.image} 
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Enhanced particle effects */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      opacity: 1,
                      scale: 0
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 150,
                      y: (Math.random() - 0.5) * 150,
                      opacity: [1, 0],
                      scale: [0, 1.5]
                    }}
                    transition={{
                      duration: 1,
                      ease: "easeOut"
                    }}
                    className="absolute w-2 h-2 bg-alien-glow rounded-full"
                    style={{
                      boxShadow: "0 0 20px #4AFF8C"
                    }}
                  />
                ))}

                {/* Ripple effect */}
                <motion.div
                  key="ripple"
                  initial={{ scale: 0.3, opacity: 0.8 }}
                  animate={{ 
                    scale: 2,
                    opacity: 0
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-full border-2 border-alien-glow"
                  style={{
                    boxShadow: "0 0 20px rgba(74, 255, 140, 0.3)"
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.button>
        
        {/* Cart drawer */}
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
        
        {/* Main content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-alien-glow"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-alien-glow text-space-dark rounded-md hover:bg-alien-bright transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <ProductGrid 
            products={products} 
            categories={categories}
            onItemAdded={handleItemAdded} 
          />
        )}
      </div>
    </div>
  );
};

export default Store;