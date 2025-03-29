import { motion } from 'framer-motion';
import { Radio, Clock, Users, TagIcon } from 'lucide-react';

interface StreamCardProps {
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  isLive?: boolean;
  viewers?: number;
  tags: string[];
}

const StreamCard = ({ 
  title, 
  description, 
  imageUrl, 
  date, 
  time, 
  isLive = false,
  viewers = 0,
  tags 
}: StreamCardProps) => {
  return (
    <motion.div 
      className="bg-space-deep rounded-xl overflow-hidden border border-space-purple hover:border-alien-glow/40 transition-all duration-300"
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(74, 255, 140, 0.1)' }}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
        />
        
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center space-x-2 bg-neon-pink px-3 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-xs font-bold uppercase">Live</span>
          </div>
        )}
        
        {!isLive && (
          <div className="absolute top-3 left-3 flex items-center space-x-2 bg-space-purple/80 px-3 py-1 rounded-full">
            <Clock size={14} className="text-alien-glow" />
            <span className="text-xs font-medium text-white">{date} • {time}</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-space-dark to-transparent opacity-80"></div>
        
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          {isLive && viewers > 0 && (
            <div className="flex items-center space-x-1 bg-space-purple/80 px-2 py-1 rounded-full">
              <Users size={14} className="text-alien-glow" />
              <span className="text-xs font-medium text-white">{viewers.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-space-dark/70 opacity-0 hover:opacity-100 transition-opacity duration-300"
          whileHover={{ opacity: 1 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-2 bg-alien-glow text-space-dark font-bold px-4 py-2 rounded-full"
          >
            <Radio size={16} />
            <span>{isLive ? 'Watch Now' : 'View Details'}</span>
          </motion.button>
        </motion.div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="inline-flex items-center text-xs bg-space-purple/50 text-alien-glow px-2 py-1 rounded-full"
            >
              <TagIcon size={10} className="mr-1" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StreamCard;