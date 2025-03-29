import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AlienAvatarProps {
  className?: string;
}

const AlienAvatar = ({ className = '' }: AlienAvatarProps) => {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchBroadcastStatus = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('broadcast_status')
          .select('is_live')
          .single();

        if (error) {
          throw error;
        }

        if (mounted) {
          setIsLive(data?.is_live || false);
        }
      } catch (error) {
        console.error('Error fetching broadcast status:', error);
        if (mounted) {
          toast.error('Failed to check broadcast status');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

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
          if (mounted) {
            setIsLive(payload.new.is_live);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current) return;
      
      const avatar = avatarRef.current;
      const eyeLeft = avatar.querySelector('#eye-left') as SVGElement;
      const eyeRight = avatar.querySelector('#eye-right') as SVGElement;
      
      // Get avatar position relative to viewport
      const rect = avatar.getBoundingClientRect();
      const avatarCenterX = rect.left + rect.width / 2;
      const avatarCenterY = rect.top + rect.height / 2;
      
      // Calculate mouse position relative to avatar center
      const mouseX = e.clientX - avatarCenterX;
      const mouseY = e.clientY - avatarCenterY;
      
      // Limit eye movement
      const maxEyeMove = 5;
      let eyeLeftX = mouseX / 50;
      let eyeLeftY = mouseY / 50;
      let eyeRightX = mouseX / 50;
      let eyeRightY = mouseY / 50;
      
      // Clamp values
      eyeLeftX = Math.max(-maxEyeMove, Math.min(maxEyeMove, eyeLeftX));
      eyeLeftY = Math.max(-maxEyeMove, Math.min(maxEyeMove, eyeLeftY));
      eyeRightX = Math.max(-maxEyeMove, Math.min(maxEyeMove, eyeRightX));
      eyeRightY = Math.max(-maxEyeMove, Math.min(maxEyeMove, eyeRightY));
      
      // Apply translations
      if (eyeLeft) eyeLeft.style.transform = `translate(${eyeLeftX}px, ${eyeLeftY}px)`;
      if (eyeRight) eyeRight.style.transform = `translate(${eyeRightX}px, ${eyeRightY}px)`;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <motion.div 
      ref={avatarRef}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative w-full h-full">
        {/* "ON AIR" sign */}
        {!isLoading && isLive && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/90 rounded-lg z-20"
            animate={{
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="font-mono font-bold text-white text-sm tracking-wider">ON AIR</span>
          </motion.div>
        )}

        {/* Background glow effect */}
        <motion.ellipse
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full bg-alien-glow/20 blur-2xl"
          animate={{ 
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main avatar image */}
        <motion.img
          src="/images/Kain.png"
          alt="Kain Jares"
          className="relative z-10 w-full h-full"
          animate={{
            y: [0, -5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Add floating elements around the avatar */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Audio visualizer bars */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-alien-glow"
                animate={{
                  height: ["10px", "30px", "10px"],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1
                }}
              />
            ))}
          </div>

          {/* Coffee cup glow */}
          <motion.div 
            className="absolute bottom-[35%] left-[15%] w-8 h-8 rounded-full bg-blue-500/20 blur-xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          
          {/* Microphone glow */}
          <motion.div 
            className="absolute top-[35%] right-[15%] w-10 h-10 rounded-full bg-alien-glow/20 blur-xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AlienAvatar;