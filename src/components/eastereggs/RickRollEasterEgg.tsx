import React, { useState, useEffect } from 'react';

interface RickRollEasterEggProps {
  isActive: boolean;
  onClose: () => void;
}

const RickRollEasterEgg: React.FC<RickRollEasterEggProps> = ({ isActive, onClose }) => {
  const [artContent, setArtContent] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [colorIndex, setColorIndex] = useState<number>(0);

  // Rainbow color effect for the text
  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-green-500',
    'text-blue-500',
    'text-indigo-500',
    'text-purple-500',
  ];

  // Audio element for playing "Never Gonna Give You Up"
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Load the ASCII art from the markdown file
  useEffect(() => {
    const fetchAsciiArt = async () => {
      try {
        // Fetch the content from the rickroll.md file
        const response = await fetch('/src/components/eastereggs/rickroll.md');
        const text = await response.text();
        setArtContent(text);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load ASCII art:', error);
        // Fallback to a hardcoded snippet in case the file can't be loaded
        const fallbackArt = `⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⡹⢎⡔⢠⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⡀⠄⡀⠠⢀⢛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿`;
        setArtContent(fallbackArt);
        setIsLoaded(true);
      }
    };

    fetchAsciiArt();
  }, []);

  // Set up audio playback when the component becomes active
  useEffect(() => {
    if (isActive) {
      // Create audio element and play Rick Astley
      try {
        audioRef.current = new Audio('/sounds/never-gonna-give-you-up.mp3');
        audioRef.current.volume = 0.5;
        audioRef.current.loop = true;
        
        // Try to play the audio (may be blocked by browser policies)
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Audio playback was prevented:', error);
            // Continue with visual experience even if audio fails
          });
        }
      } catch (error) {
        console.error('Error setting up audio:', error);
        // Continue with visual experience even if audio fails
      }
      
      // Cycle through rainbow colors
      const colorInterval = setInterval(() => {
        setColorIndex(prevIndex => (prevIndex + 1) % colors.length);
      }, 500);
      
      return () => {
        clearInterval(colorInterval);
        if (audioRef.current) {
          try {
            audioRef.current.pause();
          } catch (error) {
            console.error('Error pausing audio:', error);
          }
          audioRef.current = null;
        }
      };
    }
  }, [isActive, colors.length]);

  // Create an escape handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onClose]);

  if (!isActive || !isLoaded) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 h-full w-full">
      <div className="absolute top-4 right-4">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Exit
        </button>
      </div>
      
      <div className="text-center mb-8 animate-bounce">
        <h1 className="text-3xl font-bold text-white mb-2">You just got</h1>
        <h2 className={`text-5xl font-bold ${colors[colorIndex]} transition-colors duration-300`}>
          RICK ROLLED!
        </h2>
      </div>
      
      <div className="h-[70vh] w-full flex items-center justify-center">
        <pre className={`text-xs ${colors[colorIndex]} transition-colors duration-300 font-mono whitespace-pre scale-100 transform-gpu`}>
          {artContent}
        </pre>
      </div>
      
      <div className="mt-8 text-center animate-pulse">
        <p className="text-white text-lg font-semibold">Never gonna give you up, never gonna let you down...</p>
        <p className="text-gray-400 mt-2">Press ESC to exit</p>
      </div>
    </div>
  );
};

export default RickRollEasterEgg; 