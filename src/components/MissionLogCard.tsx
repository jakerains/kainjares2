import { motion } from 'framer-motion';
import { Calendar, User, Clock } from 'lucide-react';

interface MissionLogCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  imageUrl: string;
  slug: string;
}

const MissionLogCard = ({
  title,
  excerpt,
  date,
  readTime,
  author,
  imageUrl,
  slug
}: MissionLogCardProps) => {
  return (
    <motion.article
      className="bg-space-deep rounded-lg overflow-hidden border border-space-purple hover:border-alien-glow/40 transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-space-dark to-transparent opacity-70"></div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center text-xs text-gray-400 mb-3">
          <div className="flex items-center mr-4">
            <Calendar size={12} className="mr-1 text-alien-glow" />
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <Clock size={12} className="mr-1 text-alien-glow" />
            <span>{readTime} read</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{excerpt}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="w-8 h-8 rounded-full mr-2 border border-alien-glow/30"
            />
            <span className="text-sm text-gray-300">{author.name}</span>
          </div>
          
          <a
            href={`/mission-log/${slug}`}
            className="inline-flex items-center text-alien-glow hover:text-alien-bright transition-colors text-sm font-medium"
          >
            Read More
          </a>
        </div>
      </div>
    </motion.article>
  );
};

export default MissionLogCard;