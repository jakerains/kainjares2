import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Tag, Package, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product, Category } from '../../types/store';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onItemAdded: (e: MouseEvent) => void;
}

const ProductGrid = ({ products, categories, onItemAdded }: ProductGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0; // Featured order (original order)
      }
    });
  
  return (
    <div>
      {/* Search and filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-space-purple/20 border border-space-purple rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-alien-glow"
            />
          </div>
          
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 px-4 py-3 bg-space-purple/20 border border-space-purple rounded-lg text-white hover:border-alien-glow transition-colors"
          >
            <Filter size={18} />
            <span>Filters</span>
            <ChevronDown size={18} className={`ml-1 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-space-purple/20 border border-space-purple rounded-lg p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      !selectedCategory
                        ? 'bg-alien-glow text-space-dark font-medium'
                        : 'bg-space-purple/40 text-white hover:bg-space-purple/60'
                    } transition-colors`}
                  >
                    <Tag size={12} />
                    <span>All</span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        selectedCategory === category.id
                          ? 'bg-alien-glow text-space-dark font-medium'
                          : 'bg-space-purple/40 text-white hover:bg-space-purple/60'
                      } transition-colors`}
                    >
                      <Tag size={12} />
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-space-deep rounded-lg border border-space-purple text-white focus:outline-none focus:border-alien-glow"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-space-purple/20 rounded-xl">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-300">No products found</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
            className="mt-4 px-4 py-2 bg-alien-glow text-space-dark rounded-lg hover:bg-alien-bright transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onItemAdded={onItemAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;