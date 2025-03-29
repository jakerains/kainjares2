import { useRef, useEffect, useState, useCallback } from 'react';

interface MatrixEasterEggProps {
  isActive: boolean;
  onComplete: () => void;
}

const MatrixEasterEgg = ({ isActive, onComplete }: MatrixEasterEggProps) => {
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const matrixAnimationRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [raindrops, setRaindrops] = useState<{x: number; y: number; speed: number; char: string; opacity: number; color: string}[]>([]);

  // Handle ESC key to exit the Matrix
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onComplete();
    }
  }, [onComplete]);
  
  // Cleanup function to ensure we don't leave stray animations
  const cleanupMatrix = useCallback(() => {
    if (matrixAnimationRef.current) {
      cancelAnimationFrame(matrixAnimationRef.current);
      matrixAnimationRef.current = null;
    }
    setIsInitialized(false);
    window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isActive && matrixCanvasRef.current) {
      // Add ESC key listener
      window.addEventListener('keydown', handleKeyDown);
      
      // Set initialized state to trigger fade-in
      setIsInitialized(true);
      
      const canvas = matrixCanvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      
      // Set canvas size to match viewport
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Matrix characters - enhanced with more symbols and Japanese katakana
      const matrixChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/=?!@#$%^&()~[]{}|;:,.<>ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      
      // Array to track the y position of each column
      const drops: number[] = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -canvas.height);
      }
      
      // Create highlighted characters array for special effects
      const specialChars: {x: number, y: number, ttl: number}[] = [];
      
      // Add some Morpheus quotes to show occasionally
      const morpheusQuotes = [
        "The Matrix is everywhere.",
        "You take the blue pill, the story ends.",
        "You take the red pill, you stay in Wonderland.",
        "I'm trying to free your mind, Neo.",
        "Unfortunately, no one can be told what the Matrix is.",
        "You have to see it for yourself.",
        "Free your mind."
      ];
      
      let currentQuote = "";
      let showQuote = false;
      let quoteStartTime = 0;
      let quoteAlpha = 0;
      
      // Create a glitch effect occasionally
      let lastGlitchTime = Date.now();
      const glitchInterval = 2000; // 2 seconds between glitches
      let isGlitching = false;
      let glitchEndTime = 0;
      
      // Keep track of runtime to sync events
      const startTime = Date.now();
      
      // Drawing function with enhanced effects
      const draw = () => {
        const now = Date.now();
        const runTime = now - startTime;
        
        // Background with trail effect
        context.fillStyle = 'rgba(0, 0, 0, 0.05)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Random glitch effect
        if (now - lastGlitchTime > glitchInterval && Math.random() < 0.1) {
          isGlitching = true;
          glitchEndTime = now + 200; // Glitch for 200ms
          lastGlitchTime = now;
          
          // Occasionally show a Morpheus quote during glitches
          if (Math.random() < 0.3 && !showQuote) {
            showQuote = true;
            quoteStartTime = now;
            currentQuote = morpheusQuotes[Math.floor(Math.random() * morpheusQuotes.length)];
          }
        }
        
        if (isGlitching && now > glitchEndTime) {
          isGlitching = false;
        }
        
        if (isGlitching) {
          // Create glitch effect
          const glitchX = Math.floor(Math.random() * canvas.width);
          const glitchWidth = Math.floor(Math.random() * 100) + 50;
          const glitchHeight = Math.floor(Math.random() * 100) + 20;
          
          // Save a part of the canvas
          const imageData = context.getImageData(glitchX, 0, glitchWidth, glitchHeight);
          
          // Draw it elsewhere
          const offsetX = Math.random() > 0.5 ? 20 : -20;
          context.putImageData(imageData, glitchX + offsetX, 0);
        }
        
        context.font = `${fontSize}px monospace`;
        
        // Add occasional bright characters for emphasis
        if (Math.random() < 0.03) {
          const x = Math.floor(Math.random() * columns);
          const y = Math.floor(Math.random() * (canvas.height / fontSize));
          specialChars.push({
            x: x * fontSize,
            y: y * fontSize,
            ttl: 30 // frames to live
          });
        }
        
        // Draw the main matrix rain
        for (let i = 0; i < drops.length; i++) {
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          
          // First character in each column is brighter for "leader" effect
          const brightness = drops[i] === 0 || drops[i] === 1 ? 1 : Math.random() * 0.5 + 0.2;
          let green = Math.floor(150 + brightness * 105);
          context.fillStyle = `rgba(40, ${green}, 100, ${brightness})`;
          
          // Vertical offset for diagonal effect
          const offset = Math.sin(i * 0.1) * 0.5;
          
          context.fillText(char, i * fontSize, (drops[i] + offset) * fontSize);
          
          // Update drop position
          drops[i]++;
          
          // Reset drop back to top with some randomness
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
        }
        
        // Draw special bright characters
        context.font = `bold ${fontSize}px monospace`;
        for (let i = specialChars.length - 1; i >= 0; i--) {
          const special = specialChars[i];
          context.fillStyle = 'rgba(180, 255, 180, 1)';
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          context.fillText(char, special.x, special.y);
          
          special.ttl--;
          if (special.ttl <= 0) {
            specialChars.splice(i, 1);
          }
        }
        
        // Handle Morpheus quotes - show for 3 seconds then fade out
        if (showQuote) {
          const quoteTime = now - quoteStartTime;
          
          if (quoteTime < 500) {
            // Fade in
            quoteAlpha = quoteTime / 500;
          } else if (quoteTime < 3000) {
            // Stay visible
            quoteAlpha = 1;
          } else if (quoteTime < 4000) {
            // Fade out
            quoteAlpha = 1 - (quoteTime - 3000) / 1000;
          } else {
            // Done
            showQuote = false;
          }
          
          if (showQuote) {
            context.font = 'bold 26px monospace';
            const textMeasure = context.measureText(currentQuote);
            const textX = (canvas.width - textMeasure.width) / 2;
            const textY = canvas.height / 3;
            
            // Draw glow
            context.shadowColor = 'rgba(0, 255, 0, 0.7)';
            context.shadowBlur = 10;
            context.fillStyle = `rgba(220, 255, 220, ${quoteAlpha})`;
            context.fillText(currentQuote, textX, textY);
            context.shadowBlur = 0;
          }
        }
        
        // Draw "Neo" message that fades in at 3 seconds
        // Now with better timing to avoid overlap with other effects
        if (runTime > 3000 && runTime < 6000) {
          const messages = ["Wake up, Neo...", "The Matrix has you...", "Follow the white rabbit."];
          // Calculate which message to show based on time
          const messageIndex = Math.floor((runTime - 3000) / 1000);
          
          if (messageIndex < messages.length) {
            const message = messages[messageIndex];
            // Calculate fade-in alpha for this specific message
            const timeSinceMessageStart = (runTime - 3000) % 1000;
            const alpha = Math.min(1, timeSinceMessageStart / 400);
            
            // Prepare text rendering
            context.font = 'bold 28px monospace';
            const textMeasure = context.measureText(message);
            
            // Draw text with a subtle glow effect
            const centerX = (canvas.width - textMeasure.width) / 2;
            const centerY = canvas.height / 2;
            
            // Draw subtle glow/shadow
            context.shadowColor = 'rgba(0, 255, 0, 0.7)';
            context.shadowBlur = 15;
            context.fillStyle = `rgba(230, 255, 230, ${alpha})`;
            context.fillText(message, centerX, centerY);
            context.shadowBlur = 0;
            
            // Add a subtle underline that grows with the message
            const underlineWidth = textMeasure.width * Math.min(1, timeSinceMessageStart / 800);
            context.fillStyle = `rgba(0, 255, 0, ${alpha * 0.8})`;
            context.fillRect(
              centerX, 
              centerY + 10, 
              underlineWidth, 
              2
            );
          }
        }
        
        matrixAnimationRef.current = requestAnimationFrame(draw);
      };
      
      // Start animation
      matrixAnimationRef.current = requestAnimationFrame(draw);
      
      // Automatically exit the Matrix after 12 seconds unless user presses ESC
      const timeout = setTimeout(() => {
        cleanupMatrix();
        onComplete();
      }, 12000);
      
      return () => {
        cleanupMatrix();
        clearTimeout(timeout);
        window.removeEventListener('resize', resizeCanvas);
      };
    }
    
    return () => {
      cleanupMatrix();
    };
  }, [isActive, onComplete, handleKeyDown, cleanupMatrix]);

  if (!isActive) return null;

  return (
    <canvas
      ref={matrixCanvasRef}
      className={`fixed top-0 left-0 w-screen h-screen z-[9999] transition-opacity duration-1000 ${
        isInitialized ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        background: 'rgba(0, 0, 0, 1)',
        position: 'fixed',
        pointerEvents: 'none'
      }}
    />
  );
};

export default MatrixEasterEgg;