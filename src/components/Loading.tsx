import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-space-dark z-50"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Alien Logo */}
      <motion.div
        className="relative"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img src="/images/alien.svg" alt="Alien Logo" className="w-20 h-20 text-white" />
        <motion.div
          className="absolute inset-0 rounded-full bg-alien-glow opacity-30"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      <motion.div
        className="mt-6 font-mono text-lg text-alien-glow glow-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center">
          <p>Initializing alien technology</p>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="ml-1"
          >
            ...
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        className="mt-8 w-64 h-1.5 bg-space-purple/30 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div 
          className="h-full bg-alien-glow glow-box"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-4 text-sm text-gray-400 font-mono"
      >
        Establishing intergalactic connection...
      </motion.p>
    </motion.div>
  );
};

export default Loading;