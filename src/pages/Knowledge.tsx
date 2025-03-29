import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, Filter, Lightbulb, Star, ChevronDown, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import KnowledgeCard from '../components/KnowledgeCard';
import { supabase } from '../lib/supabase';

const Knowledge = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const knowledgeListRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(knowledgeListRef, { once: true, amount: 0.1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch all knowledge entries from Supabase
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('knowledge_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setAllEntries(data);
          setFilteredEntries(data);
        }
      } catch (error) {
        console.error('Error fetching knowledge entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);
  
  // Apply filters whenever search term or filters change
  useEffect(() => {
    applyFilters(searchTerm, selectedCategory, selectedDifficulty);
  }, [searchTerm, selectedCategory, selectedDifficulty, allEntries]);
  
  // Filter handler functions - remain mostly the same
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDifficulty(e.target.value);
  };
  
  const applyFilters = (search: string, category: string, difficulty: string) => {
    let filtered = [...allEntries];
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(search.toLowerCase()) || 
        entry.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(entry => entry.category === category);
    }
    
    // Apply difficulty filter
    if (difficulty !== 'all') {
      filtered = filtered.filter(entry => entry.difficulty === difficulty);
    }
    
    setFilteredEntries(filtered);
  };
  
  // Extract unique categories from entries for the filter
  const categories = ['all', ...new Set(allEntries.map(entry => entry.category))];
  
  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Show Archives</h1>
          <p className="text-xl text-gray-300">
            Catch up on past episodes and special segments that you might have missed while sleeping or commuting.
          </p>
        </motion.div>
        
        {/* Featured Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="text-alien-glow" size={20} />
            <h2 className="text-2xl font-bold">Featured Episode</h2>
          </div>
          
          <div className="relative rounded-xl overflow-hidden bg-space-purple/30 border border-space-purple/50">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-space-purple/70 text-white text-xs font-medium rounded-full">Advanced Theory</span>
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-400" fill="currentColor" />
                    <Star size={14} className="text-yellow-400" fill="currentColor" />
                    <Star size={14} className="text-yellow-400" fill="currentColor" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Hyperspace Computing Fundamentals</h3>
                <p className="text-gray-300 mb-6">
                  Core principles for developing AI algorithms that operate in fold-space and hyperspace environments. 
                  This knowledge module covers computational techniques that transcend traditional space-time constraints.
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="text-alien-glow mr-2 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-gray-300">Non-locality principles in algorithmic design</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-alien-glow mr-2 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-gray-300">Implementing temporal folding in predictive models</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-alien-glow mr-2 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-gray-300">Quantum entanglement for distributed computing</span>
                  </li>
                </ul>
                
                <motion.a
                  href="/knowledge/hyperspace-computing"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full hover:shadow-alien-glow transition-all duration-300"
                >
                  <BookOpen size={18} />
                  <span>Read Full Article</span>
                </motion.a>
              </div>
              
              <div className="relative aspect-auto md:aspect-auto h-full">
                <img 
                  src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2022" 
                  alt="Hyperspace Computing" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-space-purple/80 to-transparent md:bg-gradient-to-l"></div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search the knowledge archive..."
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
              className="bg-space-purple/20 border border-space-purple rounded-lg p-4 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedCategory === category
                            ? 'bg-alien-glow text-space-dark font-medium'
                            : 'bg-space-purple/40 text-white hover:bg-space-purple/60'
                        } transition-colors`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
                  <div className="flex items-center gap-2">
                    <div className="text-alien-glow">
                      <Star size={18} />
                    </div>
                    <select
                      value={selectedDifficulty}
                      onChange={handleDifficultyChange}
                      className="flex-1 px-3 py-2 bg-space-deep rounded-lg border border-space-purple text-white focus:outline-none focus:border-alien-glow"
                    >
                      <option value="all">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Knowledge Entries List */}
        <div ref={knowledgeListRef}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="text-alien-glow" size={20} />
              <h2 className="text-2xl font-bold">Knowledge Archive</h2>
            </div>
            
            <div className="text-sm text-gray-400">
              Showing {filteredEntries.length} of {allEntries.length} entries
            </div>
          </div>
          
          {filteredEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center py-16 bg-space-purple/20 rounded-xl"
            >
              <p className="text-xl text-gray-400">No knowledge entries found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setFilteredEntries(allEntries);
                }}
                className="mt-4 px-4 py-2 bg-space-purple/40 text-white rounded-lg hover:bg-space-purple/60 transition-colors"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 % 0.9 }}
                >
                  <KnowledgeCard {...entry} />
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {filteredEntries.length > 0 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center space-x-2">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 bg-space-purple/30 hover:bg-space-purple/50 disabled:opacity-50 transition-colors">
                  <ArrowLeft size={16} />
                </button>
                
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-alien-glow">
                  1
                </button>
                
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-space-purple/50 transition-colors">
                  2
                </button>
                
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-space-purple/50 transition-colors">
                  3
                </button>
                
                <span className="text-gray-400">...</span>
                
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-space-purple/50 transition-colors">
                  8
                </button>
                
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 bg-space-purple/30 hover:bg-space-purple/50 transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Knowledge;