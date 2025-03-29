import { useState } from 'react';
import { motion } from 'framer-motion';
import TechTerminal from '../components/TechTerminal';

const Terminal = () => {
  const messages = [
    "Initializing alien terminal interface...",
    "Establishing quantum connection...",
    "Accessing intergalactic database...",
    "Terminal ready! Type 'help' to see available commands.",
    "Try 'weather <city>' to get real weather data or 'matrix' for a surprise."
  ];

  return (
    <div className="fixed inset-0 bg-space-dark">
      <div className="container mx-auto px-4 h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          <TechTerminal 
            messages={messages} 
            className="h-full"
            isFullPage={true}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Terminal;