import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Video, Radio, BookOpen, FileText, Zap, Braces, Star, Users, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Components
import AlienAvatar from '../components/AlienAvatar';
import StreamCard from '../components/StreamCard';
import KnowledgeCard from '../components/KnowledgeCard';
import MissionLogCard from '../components/MissionLogCard';
import TechTerminal from '../components/TechTerminal';

const Home = () => {
  const navigate = useNavigate();
  const featuredRef = useRef<HTMLDivElement>(null);
  const featuredInView = useInView(featuredRef, { once: true, amount: 0.3 });
  
  const knowledgeRef = useRef<HTMLDivElement>(null);
  const knowledgeInView = useInView(knowledgeRef, { once: true, amount: 0.3 });
  
  const logRef = useRef<HTMLDivElement>(null);
  const logInView = useInView(logRef, { once: true, amount: 0.3 });
  
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.5 });
  
  const [isLive, setIsLive] = useState(false);
  
  // Coming soon state - set to true to show overlay
  const [showComingSoon, setShowComingSoon] = useState(true);
  
  // Knowledge archive entries - now fetched from Supabase
  const [knowledgeEntries, setKnowledgeEntries] = useState([
    {
      title: "Introduction to Non-Euclidean AI Geometries",
      description: "Understanding how AI models can be structured in spaces that defy traditional mathematical principles.",
      category: "Theory",
      difficulty: "intermediate" as const,
      imageUrl: "https://images.unsplash.com/photo-1650989826579-33e962acfe57?q=80&w=1932",
      link: "/knowledge/non-euclidean-ai"
    },
    {
      title: "Alien Machine Learning 101",
      description: "A beginner's guide to how intergalactic civilizations approach artificial intelligence and machine learning.",
      category: "Fundamentals",
      difficulty: "beginner" as const,
      imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974",
      link: "/knowledge/alien-ml-101"
    },
    {
      title: "Quantum Consciousness and AI Sentience",
      description: "Exploring the theoretical frameworks for true AI consciousness using quantum principles from distant galaxies.",
      category: "Philosophy",
      difficulty: "advanced" as const,
      imageUrl: "https://images.unsplash.com/photo-1639628735078-ed2f038a193e?q=80&w=1974",
      link: "/knowledge/quantum-consciousness"
    }
  ]);
  
  // Fetch knowledge entries from Supabase
  useEffect(() => {
    const fetchKnowledgeEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('knowledge_entries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setKnowledgeEntries(data);
        }
      } catch (error) {
        console.error('Error fetching knowledge entries:', error);
      }
    };

    fetchKnowledgeEntries();
  }, []);
  
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
  
  const terminalMessages = [
    "Tuning intergalactic frequencies...",
    "Adjusting cosmic signal strength...",
    "Warming up the quantum microphone...",
    "Checking Earth's weather patterns...",
    "Loading today's hottest space tracks...",
    "Brewing the morning coffee (extra strong for humans)...",
    "Broadcasting live across the galaxy! Rise and shine, Earth!"
  ];
  
  // Featured streams data
  const featuredStreams = [
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
    }
  ];
  
  // Mission logs (blog posts)
  const missionLogs = [
    {
      title: "Why Earth's Approach to AI Safety Is Centuries Behind",
      excerpt: "An intergalactic perspective on the current state of AI alignment and safety protocols on Earth, and what we can learn from advanced civilizations.",
      date: "Apr 10, 2025",
      readTime: "8 min",
      author: {
        name: "Kain Jarres",
        avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2662"
      },
      imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1530",
      slug: "earth-ai-safety-behind"
    },
    {
      title: "Multidimensional Data Processing: Breaking Free from 3D Constraints",
      excerpt: "How alien civilizations process information in higher dimensions and the implications for next-generation AI architectures on Earth.",
      date: "Apr 5, 2025",
      readTime: "6 min",
      author: {
        name: "Kain Jarres",
        avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2662"
      },
      imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2022",
      slug: "multidimensional-data-processing"
    }
  ];
  
  return (
    <div className="relative">
      {/* Coming Soon Overlay */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-space-dark/80 backdrop-blur-md z-50 flex items-center justify-center overflow-hidden"
          >
            <div className="relative max-w-2xl mx-auto px-6 py-16 text-center">
              {/* Background decoration elements */}
              <div className="absolute -z-10 inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-space-purple opacity-20 rounded-full filter blur-[60px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-alien-glow opacity-10 rounded-full filter blur-[80px]"></div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                {/* Add Kain image above the coming soon text */}
                <div className="flex justify-center mb-8">
                  <motion.img 
                    src="/images/Kain.png" 
                    alt="Kain the Alien" 
                    className="w-40 h-40 object-contain"
                    animate={{ 
                      y: [0, -8, 0],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                
                <motion.div 
                  className="mb-8 relative"
                  animate={{ 
                    y: [0, -6, 0],
                    textShadow: [
                      "0 0 8px rgba(74, 255, 140, 0.6), 0 0 12px rgba(74, 255, 140, 0.4)", 
                      "0 0 16px rgba(74, 255, 140, 0.8), 0 0 24px rgba(74, 255, 140, 0.6)",
                      "0 0 8px rgba(74, 255, 140, 0.6), 0 0 12px rgba(74, 255, 140, 0.4)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="relative text-5xl lg:text-7xl font-bold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-alien-glow via-white to-alien-bright pb-2 inline-block">
                    Coming Soon
                    <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-gradient-to-r from-alien-glow via-alien-bright to-alien-glow animate-pulse"></div>
                  </span>
                </motion.div>
                
                <h4 className="text-alien-glow font-mono mb-6 text-xl">TRANSMISSION INITIALIZING</h4>
                <p className="text-xl text-gray-300 mb-10 max-w-lg mx-auto">
                  Our intergalactic broadcast is being calibrated. Get ready for Earth's most out-of-this-world morning show!
                </p>
                
                <TechTerminal 
                  messages={[
                    "Establishing connection...",
                    "Aligning cosmic antennas...",
                    "Charging quantum batteries...",
                    "Brewing alien coffee...",
                    "Almost ready for transmission..."
                  ]} 
                  className="max-w-lg mx-auto" 
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-space-purple opacity-20 rounded-full filter blur-[80px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-alien-glow opacity-10 rounded-full filter blur-[100px]"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="mb-8 relative"
                  animate={{ 
                    y: [0, -6, 0],
                    textShadow: [
                      "0 0 8px rgba(74, 255, 140, 0.6), 0 0 12px rgba(74, 255, 140, 0.4)", 
                      "0 0 16px rgba(74, 255, 140, 0.8), 0 0 24px rgba(74, 255, 140, 0.6)",
                      "0 0 8px rgba(74, 255, 140, 0.6), 0 0 12px rgba(74, 255, 140, 0.4)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Decorative radio wave elements */}
                  <div className="absolute -left-4 sm:-left-8 top-1/2 -translate-y-1/2 flex items-center">
                    <motion.div 
                      className="w-1.5 h-6 bg-alien-glow rounded-full opacity-70"
                      animate={{ height: [6, 14, 6], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                    />
                    <motion.div 
                      className="w-1.5 h-8 bg-alien-glow mx-1 rounded-full opacity-70" 
                      animate={{ height: [8, 22, 8], opacity: [0.5, 0.9, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-1.5 h-10 bg-alien-glow rounded-full opacity-70"
                      animate={{ height: [10, 30, 10], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                    />
                  </div>
                  
                  <span className="relative text-4xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-alien-glow via-white to-alien-bright pb-2 inline-block">
                    <span>AIMorning</span>
                    <span className="text-white">.</span>
                    <span>Show</span>
                    <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-gradient-to-r from-alien-glow via-alien-bright to-alien-glow animate-pulse"></div>
                  </span>
                </motion.div>
                <h4 className="text-alien-glow font-mono mb-3">GREETINGS, HUMANS</h4>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  I'm Kain Jares,<br />
                  The <span className="text-alien-glow glow-text">Gen AI Alien</span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-lg">
                  Your morning companion from the stars! Tune in for hot takes, cosmic tunes, and just a splash of AI chatter to jumpstart your day.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/streams')}
                    className="flex items-center gap-2 px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-full hover:shadow-alien-glow transition-all duration-300"
                  >
                    <Video size={20} />
                    <span>Tune In Live</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/knowledge')}
                    className="flex items-center gap-2 px-6 py-3 bg-transparent border border-alien-glow text-alien-glow font-bold rounded-full hover:bg-alien-glow/10 transition-all duration-300"
                  >
                    <BookOpen size={20} />
                    <span>Past Shows</span>
                  </motion.button>
                </div>
                
                <div className="mt-12">
                  <TechTerminal messages={terminalMessages} className="max-w-lg" />
                </div>
              </motion.div>
            </div>
            
            <div className="order-1 md:order-2 mx-auto md:mx-0">
              <div className="relative w-64 sm:w-80 md:w-96 aspect-square">
                {/* Only show ON AIR when live */}
                {isLive && (
                  <motion.div
                    className="absolute -top-16 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl z-30 font-mono font-bold text-lg tracking-widest flex items-center gap-2 bg-red-500/90 text-white"
                    animate={{
                      opacity: [1, 0.7, 1],
                      boxShadow: ['0 0 10px rgba(239, 68, 68, 0.5)', '0 0 20px rgba(239, 68, 68, 0.7)', '0 0 10px rgba(239, 68, 68, 0.5)']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    ON AIR
                  </motion.div>
                )}
                
                <AlienAvatar className="w-full h-full" />
                
                {/* Tech circles around alien */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border border-alien-glow/20"></div>
                  <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-12 h-12 rounded-full border border-alien-glow/30"></div>
                  <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-16 h-16 rounded-full border border-space-light/20"></div>
                  
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full rounded-full border border-alien-glow/10"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  ></motion.div>
                  
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] rounded-full border border-space-purple/20"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-gray-400 text-sm mb-2">Scroll to explore</p>
          <ChevronRight size={20} className="text-alien-glow transform rotate-90" />
        </motion.div>
      </section>
      
      {/* Live Stream Hub */}
      <section className="py-24" ref={featuredRef}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h4 className="text-alien-glow font-mono mb-2">LIVE STREAM HUB</h4>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Broadcasts</h2>
            </div>
            <button 
              onClick={() => navigate('/streams')}
              className="mt-4 sm:mt-0 group flex items-center text-alien-glow font-medium hover:text-alien-bright transition-colors"
            >
              View All Streams
              <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
          
          {isLive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featuredInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/live_stream?channel=UCSiL5EC9INdjd_Qxz0NR-Lg" 
                  frameBorder="0" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
                
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-neon-pink px-3 py-1 rounded-full z-10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-xs font-bold uppercase">Live Now</span>
                </div>
                
                <div className="absolute bottom-4 right-4 z-10">
                  <motion.a
                    href="https://www.youtube.com/@aimorningshow/live"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-alien-glow text-space-dark font-bold rounded-full hover:shadow-alien-glow transition-all duration-300"
                  >
                    <Radio size={16} />
                    <span>Watch on YouTube</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStreams.map((stream, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuredInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                <StreamCard {...stream} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Knowledge Archive */}
      <section className="py-24 bg-space-deep relative" ref={knowledgeRef}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-alien-glow/5 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-space-light/5 blur-3xl"></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, #4AFF8C 1px, transparent 1px)', 
              backgroundSize: '30px 30px' 
            }}>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={knowledgeInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h4 className="text-alien-glow font-mono mb-2">KNOWLEDGE ARCHIVE</h4>
              <h2 className="text-3xl md:text-4xl font-bold">Show Archives</h2>
              <p className="text-gray-400 mt-2 max-w-2xl">
                Catch up on episodes you've missed! The best segments from across the cosmic airwaves.
              </p>
            </div>
            <button 
              onClick={() => navigate('/knowledge')}
              className="mt-4 sm:mt-0 group flex items-center text-alien-glow font-medium hover:text-alien-bright transition-colors"
            >
              Browse All Episodes
              <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeEntries.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={knowledgeInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                <KnowledgeCard {...entry} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Key Features */}
      <section className="py-24 bg-gradient-to-b from-space-dark via-space-deep to-space-dark" ref={statsRef}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-alien-glow font-mono mb-2">INTERGALACTIC MORNING SHOW</h4>
            <h2 className="text-3xl md:text-4xl font-bold">Your Cosmic Drive-Time DJ</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Wake up with Kain Jares! AI talk, traffic reports from the asteroid belt, and the hottest gossip from across the galaxy. Earth's most out-of-this-world morning show!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap size={32} className="text-alien-glow" />,
                title: "Cosmic Hot Takes",
                description: "Daily AI discussions mixed with my signature alien humor and perspective on Earth's peculiar habits."
              },
              {
                icon: <Braces size={32} className="text-alien-glow" />,
                title: "Space Traffic Updates",
                description: "Avoid those pesky asteroid jams and meteor showers with my real-time intergalactic traffic reports."
              },
              {
                icon: <Star size={32} className="text-alien-glow" />,
                title: "Celebrity Gossip",
                description: "The latest buzz on Earth's tech celebrities, with exclusive insights from my home planet's tabloids."
              },
              {
                icon: <Users size={32} className="text-alien-glow" />,
                title: "Call-in Segments",
                description: "Join the conversation! Humans welcome to call in with questions about AI, space, or what I had for breakfast."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-space-purple/20 backdrop-blur-sm rounded-lg p-6 border border-space-purple/50 hover:border-alien-glow/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(74, 255, 140, 0.1)' }}
              >
                <div className="w-16 h-16 rounded-full bg-space-purple/40 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "15,000+", label: "Listeners" },
              { value: "248", label: "Episodes" },
              { value: "47", label: "Planets Reached" },
              { value: "98%", label: "Cosmic Rating" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
              >
                <div className="text-4xl font-bold text-alien-glow mb-2 glow-text">{stat.value}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Mission Log */}
      <section className="py-24" ref={logRef}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={logInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h4 className="text-alien-glow font-mono mb-2">MISSION LOG</h4>
              <h2 className="text-3xl md:text-4xl font-bold">Show Highlights</h2>
              <p className="text-gray-400 mt-2 max-w-2xl">
                Read transcripts and highlights from the most entertaining segments of the show.
              </p>
            </div>
            <button 
              onClick={() => navigate('/mission-log')}
              className="mt-4 sm:mt-0 group flex items-center text-alien-glow font-medium hover:text-alien-bright transition-colors"
            >
              More Highlights
              <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {missionLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={logInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                <MissionLogCard {...log} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-space-deep relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-alien-glow/5 via-transparent to-transparent opacity-70"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <h4 className="text-alien-glow font-mono mb-2">JOIN THE BROADCAST</h4>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Start Your Day with <span className="text-alien-glow">Alien Radio?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Tune in for laughs, music, and just enough AI talk to make you sound smart at work.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/streams')}
                  className="px-8 py-4 bg-alien-glow text-space-dark font-bold rounded-full hover:shadow-alien-glow transition-all duration-300"
                >
                  Listen Live
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/knowledge')}
                  className="px-8 py-4 bg-transparent border border-alien-glow text-alien-glow font-bold rounded-full hover:bg-alien-glow/10 transition-all duration-300"
                >
                  Check Show Schedule
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;