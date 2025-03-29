import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, Calendar, Tag, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import MissionLogCard from '../components/MissionLogCard';
import { getMissionLogs } from '../services/missionLogService';
import { MissionLogWithTags } from '../types/missionLog';
import { format } from 'date-fns';

const MissionLog = () => {
  const logListRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(logListRef, { once: true, amount: 0.1 });
  
  // States for data and loading
  const [allLogs, setAllLogs] = useState<MissionLogWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<MissionLogWithTags[]>([]);
  
  // Extract all unique tags
  const allTags = [...new Set(allLogs.flatMap(log => log.tags))].sort();
  
  useEffect(() => {
    const fetchMissionLogs = async () => {
      try {
        setLoading(true);
        const logs = await getMissionLogs();
        setAllLogs(logs);
        setFilteredLogs(logs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching mission logs:', err);
        setError('Failed to load mission logs. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMissionLogs();
  }, []);
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterLogs(term, selectedTag);
  };
  
  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    const newSelectedTag = selectedTag === tag ? '' : tag;
    setSelectedTag(newSelectedTag);
    filterLogs(searchTerm, newSelectedTag);
  };
  
  // Filter logs based on search term and tag
  const filterLogs = (search: string, tag: string) => {
    let filtered = allLogs;
    
    if (search.trim() !== '') {
      filtered = filtered.filter(log => 
        log.title.toLowerCase().includes(search.toLowerCase()) || 
        log.excerpt.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (tag !== '') {
      filtered = filtered.filter(log => log.tags.includes(tag));
    }
    
    setFilteredLogs(filtered);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Find featured mission log (most recent published)
  const featuredLog = allLogs.length > 0 ? allLogs[0] : null;
  
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Show Highlights</h1>
          <p className="text-xl text-gray-300">
            The best moments, interviews, and stories from our cosmic morning show.
          </p>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-space-purple/20 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-space-purple/20 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-space-purple/20 rounded"></div>
                  <div className="h-4 bg-space-purple/20 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-alien-glow text-space-dark font-medium rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredLog && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-16"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="text-alien-glow" size={20} />
                  <h2 className="text-2xl font-bold">Featured Segment</h2>
                </div>
                
                <div className="relative rounded-xl overflow-hidden">
                  <div className="aspect-[21/9] relative">
                    <img 
                      src={featuredLog.image_url || 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1530'} 
                      alt={featuredLog.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-space-dark via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-3xl">
                      <div className="flex items-center text-xs text-gray-300 mb-3">
                        <div className="flex items-center mr-4">
                          <Calendar size={12} className="mr-1 text-alien-glow" />
                          <span>{formatDate(featuredLog.published_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <Tag size={12} className="mr-1 text-alien-glow" />
                          <span>{featuredLog.tags.join(', ')}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {featuredLog.title}
                      </h3>
                      
                      <p className="text-gray-200 mb-4 max-w-2xl">
                        {featuredLog.excerpt}
                      </p>
                      
                      <motion.a
                        href={`/mission-log/${featuredLog.slug}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full hover:shadow-alien-glow transition-all duration-300"
                      >
                        <span>Read Full Article</span>
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Search and Tag Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-12"
            >
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search mission logs..."
                    className="w-full pl-10 pr-4 py-3 bg-space-purple/20 border border-space-purple rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-alien-glow"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-gray-400 py-2 pr-2">Filter by tag:</span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTag === tag
                        ? 'bg-alien-glow text-space-dark font-medium'
                        : 'bg-space-purple/40 text-white hover:bg-space-purple/60'
                    } transition-colors`}
                  >
                    {tag}
                  </button>
                ))}
                
                {selectedTag && (
                  <button
                    onClick={() => {
                      setSelectedTag('');
                      filterLogs(searchTerm, '');
                    }}
                    className="px-3 py-1 bg-red-500/30 text-red-300 hover:bg-red-500/50 rounded-full text-sm transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              
              {/* Mission Log List */}
              <motion.div
                ref={logListRef}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                className="mt-10"
              >
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="text-alien-glow" size={20} />
                  <h2 className="text-2xl font-bold">All Mission Logs</h2>
                </div>
                
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-space-purple/40 rounded-xl bg-space-purple/10">
                    <FileText size={40} className="mx-auto mb-4 text-gray-500" />
                    <p className="text-xl text-gray-400">No mission logs found matching your criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <MissionLogCard 
                          title={log.title}
                          excerpt={log.excerpt}
                          date={formatDate(log.published_at)}
                          readTime={log.read_time}
                          author={{
                            name: log.author_name,
                            avatarUrl: log.author_avatar_url || ''
                          }}
                          imageUrl={log.image_url || ''}
                          slug={log.slug}
                          tags={log.tags}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default MissionLog;