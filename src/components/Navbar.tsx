import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Radio, BookOpen, FileText, MessageSquare, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [location]);
  
  const navLinks = [
    { name: 'Home', path: '/', icon: <img src="/images/alien.svg" alt="Home" className="w-5 h-5 mr-2 text-white" /> },
    { name: 'Live Show', path: '/streams', icon: <Radio className="mr-2 text-alien-glow" size={20} /> },
    { name: 'Show Archives', path: '/knowledge', icon: <BookOpen className="mr-2 text-alien-glow" size={20} /> },
    { name: 'Show Highlights', path: '/mission-log', icon: <FileText className="mr-2 text-alien-glow" size={20} /> },
    { name: 'Contact', path: '/contact', icon: <MessageSquare className="mr-2 text-alien-glow" size={20} /> },
  ];
  
  return (
    <nav 
      className={`fixed w-full z-40 transition-all duration-300 ${
        scrolled ? 'bg-space-dark/90 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="relative w-8 h-8">
              <img src="/images/alien.svg" alt="Alien Logo" className="w-full h-full text-white" />
              <motion.span 
                className="absolute -inset-1 rounded-full bg-space-blue opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
            <span className="font-mono font-bold text-xl tracking-wide text-white">
              Kain<span className="text-alien-glow">.Jares</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:text-alien-glow ${
                  location.pathname === link.path 
                    ? 'text-alien-glow bg-space-purple/30 glow-border' 
                    : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Cart Link with Badge */}
            <Link
              to="/store"
              className="relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:text-alien-glow"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-alien-glow text-space-dark rounded-full flex items-center justify-center text-xs font-bold"
                >
                  {totalItems}
                </motion.div>
              )}
            </Link>
            
            <a 
              href="#subscribe" 
              className="alien-button px-4 py-2 rounded-full bg-alien-gradient text-space-dark font-bold text-sm hover:shadow-alien-glow transition-all duration-300"
            >
              Subscribe
            </a>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-alien-glow hover:bg-space-purple/30"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <motion.div 
        className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-space-purple/80 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'bg-space-purple text-alien-glow'
                  : 'text-white hover:bg-space-purple/50 hover:text-alien-glow'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          
          {/* Mobile Cart Link */}
          <Link
            to="/store"
            className="flex items-center px-3 py-3 rounded-md text-base font-medium text-white hover:bg-space-purple/50 hover:text-alien-glow"
          >
            <ShoppingBag className="mr-2" size={20} />
            Store
            {totalItems > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 w-5 h-5 bg-alien-glow text-space-dark rounded-full flex items-center justify-center text-xs font-bold"
              >
                {totalItems}
              </motion.div>
            )}
          </Link>
          
          <a
            href="#subscribe"
            className="block w-full text-center px-3 py-3 rounded-md text-base font-medium bg-alien-glow text-space-dark hover:bg-alien-bright"
          >
            Subscribe
          </a>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;