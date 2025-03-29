import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, Filter, Calendar, Tag, ChevronDown, Disc, Clock } from 'lucide-react';
import StreamCard from '../components/StreamCard';
import { supabase } from '../lib/supabase';

const Streams = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const streamListRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(streamListRef, { once: true, amount: 0.1 });
  const [isLive, setIsLive] = useState(false);
  
  useEffect(() => {
    fetchBroadcastStatus();
    
    // Subscribe to broadcast status changes
    const channel = supabase
      .channel('broadcast_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'broadcast_status'
        },
        (payload) => {
          setIsLive(payload.new.is_live);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBroadcastStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcast_status')
        .select('is_live')
        .single();

      if (error) throw error;
      setIsLive(data.is_live);
    } catch (error) {
      console.error('Error fetching broadcast status:', error);
    }
  };
  
  // Mock data for streams
  const allStreams = [
    {
      title: "Quantum Neural Networks: An Alien Perspective",
      description: "Exploring how quantum computing principles can enhance neural network architectures with techniques from my home planet.",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070",
      date: "Apr 15, 2025",
      time: "18:00 UTC",
      isLive: true,
      viewers: 1247,
      tags: ["Quantum AI", "Neural Networks", "Advanced"]
    },
    {
      title: "Decoding Human Language with Alien Transformers",
      description: "How intergalactic civilizations approach language understanding and what Earth can learn from these methods.",
      imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965",
      date: "Apr 18, 2025",
      time: "15:30 UTC",
      isLive: false,
      tags: ["NLP", "Transformers", "Linguistics"]
    },
    {
      title: "Telepathic Interfaces: The Future of Human-AI Interaction",
      description: "Bridging the gap between thought-based computing and current human interface technologies.",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1770",
      date: "Apr 22, 2025",
      time: "19:00 UTC",
      isLive: false,
      tags: ["BCI", "User Interfaces", "Futurism"]
    },
    {
      title: "Multi-dimensional Data Structures for Advanced AI",
      description: "Understanding how to organize and process data in ways that transcend three-dimensional thinking.",
      imageUrl: "https://images.unsplash.com/photo-1620295045992-995c3b1ae077?q=80&w=1974",
      date: "Apr 25, 2025",
      time: "17:00 UTC",
      isLive: false,
      tags: ["Data Structures", "Mathematics", "Advanced"]
    },
    {
      title: "Alien Ethics in AI Development",
      description: "Comparing ethical frameworks from multiple planetary systems and their application to artificial intelligence.",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
      date: "Apr 30, 2025",
      time: "16:00 UTC",
      isLive: false,
      tags: ["Ethics", "Philosophy", "Governance"]
    },
    {
      title: "Intergalactic Code Review: Earth's Best AI Projects",
      description: "Analyzing notable Earth AI projects from an alien perspective and suggesting improvements.",
      imageUrl: "https://images.unsplash.com/photo-1581093196277-9f12b9d0f316?q=80&w=1770",
      date: "May 5, 2025",
      time: "18:30 UTC",
      isLive: false,
      tags: ["Code Review", "Best Practices", "Project Analysis"]
    }
  ];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStreams, setFilteredStreams] = useState(allStreams);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredStreams(allStreams);
      return;
    }
    
    const filtered = allStreams.filter(stream => 
      stream.title.toLowerCase().includes(term.toLowerCase()) || 
      stream.description.toLowerCase().includes(term.toLowerCase()) ||
      stream.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredStreams(filtered);
  };
  
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Live Show</h1>
          <p className="text-xl text-gray-300">
            Tune in to the most entertaining morning radio show from outer space! Streaming daily across the galaxy.
          </p>
        </motion.div>
        
        {/* Live Stream Section - Only shown when actually live */}
        {isLive ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-4">
              <Disc className="text-neon-pink" size={20} />
              <h2 className="text-2xl font-bold">Currently Live</h2>
            </div>
            
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/live_stream?channel=UCSiL5EC9INdjd_Qxz0NR-Lg" 
                frameBorder="0" 
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
              
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-neon-pink px-3 py-1 rounded-full z-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-xs font-bold uppercase">Live Now</span>
              </div>
              
              <div className="absolute bottom-8 left-8 max-w-2xl z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Quantum Neural Networks: An Alien Perspective</h3>
                <p className="text-gray-200 mb-4">Exploring how quantum computing principles can enhance neural network architectures with techniques from my home planet.</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center text-xs bg-space-purple/70 text-alien-glow px-2 py-1 rounded-full">
                    <Tag size={10} className="mr-1" />
                    Quantum AI
                  </span>
                  <span className="inline-flex items-center text-xs bg-space-purple/70 text-alien-glow px-2 py-1 rounded-full">
                    <Tag size={10} className="mr-1" />
                    Neural Networks
                  </span>
                  <span className="inline-flex items-center text-xs bg-space-purple/70 text-alien-glow px-2 py-1 rounded-full">
                    <Tag size={10} className="mr-1" />
                    Advanced
                  </span>
                </div>
                
                <motion.a
                  href="https://www.youtube.com/@aimorningshow/live"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full hover:shadow-alien-glow transition-all duration-300"
                >
                  <Disc size={20} />
                  <span>Watch on YouTube</span>
                </motion.a>
              </div>
              
              <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-space-purple/80 px-3 py-1 rounded-full">
                <span className="text-alien-glow text-sm font-medium">1,247 watching</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-gray-400" size={20} />
              <h2 className="text-2xl font-bold">Not Currently Live</h2>
            </div>
            
            <div className="bg-space-deep/70 border border-space-purple rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Stream Schedule</h3>
              <p className="text-gray-300 mb-6">I'm not currently broadcasting live. Check the upcoming streams below or subscribe to be notified when I go live.</p>
              
              <motion.a
                href="https://www.youtube.com/@aimorningshow?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full hover:shadow-alien-glow transition-all duration-300"
              >
                <span>Subscribe on YouTube</span>
              </motion.a>
            </div>
          </motion.div>
        )}
        
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
                placeholder="Search streams by title, description, or tags..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-alien-glow" />
                    <select className="flex-1 px-3 py-2 bg-space-deep rounded-lg border border-space-purple text-white focus:outline-none focus:border-alien-glow">
                      <option value="upcoming">Upcoming</option>
                      <option value="this-week">This Week</option>
                      <option value="this-month">This Month</option>
                      <option value="past">Past Streams</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
                  <div className="flex items-center gap-2">
                    <Tag size={18} className="text-alien-glow" />
                    <select className="flex-1 px-3 py-2 bg-space-deep rounded-lg border border-space-purple text-white focus:outline-none focus:border-alien-glow">
                      <option value="all">All Categories</option>
                      <option value="ai-research">AI Research</option>
                      <option value="programming">Programming</option>
                      <option value="ethics">Ethics & Philosophy</option>
                      <option value="applications">Practical Applications</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
                  <div className="flex items-center gap-2">
                    <div className="text-alien-glow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12h6"></path>
                        <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z"></path>
                        <path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1Z"></path>
                      </svg>
                    </div>
                    <select className="flex-1 px-3 py-2 bg-space-deep rounded-lg border border-space-purple text-white focus:outline-none focus:border-alien-glow">
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-alien-glow text-space-dark font-medium rounded-lg">
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Stream List */}
        <div ref={streamListRef}>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-alien-glow" size={20} />
            <h2 className="text-2xl font-bold">Upcoming & Recent Streams</h2>
          </div>
          
          {filteredStreams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center py-16 bg-space-purple/20 rounded-xl"
            >
              <p className="text-xl text-gray-400">No streams found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-space-purple/40 text-white rounded-lg hover:bg-space-purple/60 transition-colors"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStreams.map((stream, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StreamCard {...stream} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Streams;