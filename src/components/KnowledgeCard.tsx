import { motion } from 'framer-motion';
import { BookOpen, Star, ExternalLink } from 'lucide-react';

interface KnowledgeCardProps {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
  link: string;
}

const KnowledgeCard = ({
  title,
  description,
  category,
  difficulty,
  imageUrl,
  link
}: KnowledgeCardProps) => {
  // Map difficulty to stars
  const difficultyStars = () => {
    switch (difficulty) {
      case 'beginner':
        return 1;
      case 'intermediate':
        return 2;
      case 'advanced':
        return 3;
      default:
        return 1;
    }
  };
  
  // Map difficulty to color
  const difficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-green-400';
    }
  };
  
  return (
    <motion.div
      className="bg-space-deep rounded-lg overflow-hidden border border-space-purple hover:border-alien-glow/40 transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-space-dark to-transparent"></div>
        
        <div className="absolute top-3 left-3 bg-space-purple/80 text-white text-xs font-medium px-3 py-1 rounded-full">
          {category}
        </div>
        
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-space-deep/80 text-xs font-medium px-2 py-1 rounded-full">
          {[...Array(difficultyStars())].map((_, i) => (
            <Star key={i} size={12} className={difficultyColor()} fill={difficultyColor()} />
          ))}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{description}</p>
        
        <a 
          href={link} 
          className="inline-flex items-center text-alien-glow hover:text-alien-bright transition-colors text-sm font-medium"
        >
          <BookOpen size={15} className="mr-1" />
          Read Knowledge Entry
          <ExternalLink size={12} className="ml-1" />
        </a>
      </div>
    </motion.div>
  );
};

export default KnowledgeCard;