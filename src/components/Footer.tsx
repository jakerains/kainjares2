import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenIcon as AlienIcon, Twitter, Youtube, Twitch, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-space-deep relative overflow-hidden">
      {/* Animated stars in footer */}
      <div className="absolute inset-0 opacity-30">
        <div className="stars"></div>
      </div>
      
      {/* Subscribe section */}
      <div id="subscribe" className="container mx-auto px-4 py-16">
        <div className="relative max-w-3xl mx-auto p-8 rounded-2xl bg-space-purple/30 backdrop-blur-md border border-space-light/20 overflow-hidden">
          {/* Decorative glowing orb */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-alien-glow/20 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Subscribe to <span className="text-alien-glow glow-text">Intergalactic Updates</span>
            </h2>
            <p className="text-gray-300 text-center mb-8">
              Join my cosmic community and receive updates on live streams, new alien tech discoveries, and AI insights.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md bg-space-dark/60 border border-space-light/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-alien-glow/50"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-alien-glow text-space-dark font-bold rounded-md hover:bg-alien-bright transition-all duration-300"
              >
                Subscribe
              </motion.button>
            </form>
            
            <p className="text-xs text-gray-400 mt-4 text-center">
              By subscribing, you agree to receive emails from Kain Jarres. No spam, just alien wisdom.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/images/alien.svg" alt="Alien Logo" className="w-7 h-7 text-white" />
              <span className="font-mono font-bold text-xl tracking-wide text-white">
                Kain<span className="text-alien-glow">.Jares</span>
              </span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-md">
              Your favorite intergalactic DJ bringing you Earth's most unique morning show! Wake up to cosmic tunes, alien perspectives, and out-of-this-world entertainment.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4 mt-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-alien-glow transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-alien-glow transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-alien-glow transition-colors">
                <Twitch size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-alien-glow transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-alien-glow transition-colors">Show Home</Link></li>
              <li><Link to="/streams" className="text-gray-400 hover:text-alien-glow transition-colors">Live Streams</Link></li>
              <li><Link to="/knowledge" className="text-gray-400 hover:text-alien-glow transition-colors">Show Archive</Link></li>
              <li><Link to="/mission-log" className="text-gray-400 hover:text-alien-glow transition-colors">Behind the Scenes</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-alien-glow transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-alien-glow transition-colors">Show Schedule</a></li>
              <li><a href="#" className="text-gray-400 hover:text-alien-glow transition-colors">Podcast Episodes</a></li>
              <li><a href="#" className="text-gray-400 hover:text-alien-glow transition-colors">Listener Stories</a></li>
              <li><a href="#" className="text-gray-400 hover:text-alien-glow transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-alien-glow transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-space-purple mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} The Intergalactic Morning Show. All rights reserved across the galaxy.
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0 flex items-center">
            Broadcasting with <Heart size={14} className="mx-1 text-neon-pink" /> from somewhere in the cosmos
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;