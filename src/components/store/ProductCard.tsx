import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types/store';

interface ProductCardProps {
  product: Product;
  onItemAdded: (e: MouseEvent, productImage: string) => void;
}

const ProductCard = ({ product, onItemAdded }: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const { addToCart } = useCart();
  const controls = useAnimation();
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    if (product.sizes.length > 0 && !selectedSize) {
      return; // Don't add if size is required but not selected
    }

    // Start dramatic hover animation
    await controls.start({
      scale: [1, 1.2, 0.9, 1.1, 1],
      rotate: [0, -5, 5, -3, 0],
      transition: { duration: 0.4 }
    });

    // Add to cart
    addToCart({ ...product, selectedSize });

    // Trigger the alien beam animation
    onItemAdded(e.nativeEvent, product.images[0]);
  };
  
  return (
    <motion.div 
      className="group bg-space-deep rounded-xl overflow-hidden border border-space-purple hover:border-alien-glow/40 transition-all duration-300"
      whileHover={{ y: -4 }}
      animate={controls}
    >
      <div className="relative aspect-square overflow-hidden">
        <motion.img 
          src={product.images[0] || 'https://via.placeholder.com/400'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        
        {/* Out of stock badge */}
        {product.inventory_status === 'out_of_stock' && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300">
            Out of Stock
          </div>
        )}

        {/* Alien glow effect on hover */}
        <motion.div
          className="absolute inset-0 bg-alien-glow/10 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false}
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0, 0.2, 0],
            background: [
              "radial-gradient(circle, rgba(74, 255, 140, 0.1) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(74, 255, 140, 0.2) 0%, transparent 90%)",
              "radial-gradient(circle, rgba(74, 255, 140, 0.1) 0%, transparent 70%)"
            ]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-alien-glow">
            ${product.price.toFixed(2)}
          </div>
        </div>
        
        {/* Size selector if product has sizes */}
        {product.sizes.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Size
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <motion.button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'bg-alien-glow text-space-dark'
                      : 'bg-space-purple/40 text-white hover:bg-space-purple/60'
                  }`}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        <motion.button
          onClick={handleAddToCart}
          disabled={product.inventory_status === 'out_of_stock'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-alien-glow text-space-dark font-medium rounded-lg hover:bg-alien-bright disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative overflow-hidden group"
        >
          <ShoppingBag size={18} className="relative z-10" />
          <span className="relative z-10">
            {product.inventory_status === 'out_of_stock' 
              ? 'Out of Stock'
              : 'Add to Cart'
            }
          </span>

          {/* Enhanced button hover effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-alien-glow via-alien-bright to-alien-glow"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          
          {/* Alien tech circles */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={false}
            animate={{
              background: [
                'radial-gradient(circle at center, rgba(74, 255, 140, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at center, rgba(74, 255, 140, 0.4) 0%, transparent 70%)',
                'radial-gradient(circle at center, rgba(74, 255, 140, 0.2) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;