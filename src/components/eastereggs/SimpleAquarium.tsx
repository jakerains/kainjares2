import { useState, useEffect } from 'react';

const SimpleAquarium = () => {
  const [frame, setFrame] = useState(0);
  const [bubbles, setBubbles] = useState<{x: number, y: number, size: number}[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  
  // Create different frames for animation
  const frames = [
    `   ___________________
   |                   |
   |   ><(((º>         |
   |                   |
   |        ><>        |
   |                   |
   |          <º))))>< |
   |                   |
   |        <><        |
   |___________________|`,
    
    `   ___________________
   |                   |
   |    ><(((º>        |
   |                   |
   |       ><>         |
   |                   |
   |         <º))))><  |
   |                   |
   |     <><           |
   |___________________|`,
    
    `   ___________________
   |                   |
   |     ><(((º>       |
   |                   |
   |        ><>        |
   |                   |
   |        <º))))><   |
   |                   |
   |          <><      |
   |___________________|`,
    
    `   ___________________
   |                   |
   |      ><(((º>      |
   |                   |
   |         ><>       |
   |                   |
   |       <º))))><    |
   |                   |
   |            <><    |
   |___________________|`,
    
    `   ___________________
   |                   |
   |       ><(((º>     |
   |                   |
   |          ><>      |
   |                   |
   |      <º))))><     |
   |                   |
   |              <><  |
   |___________________|`,
  ];
  
  // Generate bubbles randomly
  useEffect(() => {
    const addBubble = () => {
      // Add a bubble with a random horizontal position
      if (Math.random() < 0.3) { // 30% chance to add bubble on each frame
        const newBubble = {
          x: Math.floor(Math.random() * 17) + 2, // Position between 2-18
          y: 8, // Start at bottom
          size: Math.random() < 0.7 ? 1 : 2 // 70% small bubbles, 30% larger ones
        };
        setBubbles(prev => [...prev, newBubble]);
      }
    };
    
    // Move existing bubbles upward and remove ones that reach the top
    const moveBubbles = () => {
      setBubbles(prev => 
        prev
          .map(bubble => ({
            ...bubble,
            y: bubble.y - 1 // Move up
          }))
          .filter(bubble => bubble.y > 1) // Remove bubbles that reach the top
      );
    };
    
    // Animate the aquarium by cycling through frames
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % frames.length);
      setFrameCount(prev => prev + 1);
      
      // Add bubbles every so often
      addBubble();
      moveBubbles();
    }, 800);
    
    return () => clearInterval(interval);
  }, [frames.length]);
  
  // Function to render the current frame with bubbles
  const renderFrame = () => {
    let frameLines = frames[frame].split('\n');
    
    // Add bubbles to the frame
    bubbles.forEach(bubble => {
      // Make sure the bubble position is within bounds
      if (bubble.y >= 0 && bubble.y < frameLines.length && bubble.x >= 0) {
        let line = frameLines[bubble.y];
        
        // Generate bubble character based on size
        const bubbleChar = bubble.size === 1 ? 'o' : 'O';
        
        // Make sure we don't overflow the line
        if (bubble.x < line.length) {
          // Replace character at position
          const newLine = line.substring(0, bubble.x) + bubbleChar + line.substring(bubble.x + 1);
          frameLines[bubble.y] = newLine;
        }
      }
    });
    
    return frameLines.join('\n');
  };
  
  // Add a subtle animation effect to the entire aquarium
  const aquariumClasses = `text-blue-300 whitespace-pre font-mono overflow-hidden text-center 
                         ${frameCount % 10 === 0 ? 'animate-pulse' : ''}`;
  
  return (
    <div className="relative">
      <pre className={aquariumClasses}>
        {renderFrame()}
      </pre>
      <div className="absolute top-2 right-4 text-xs text-gray-400">
        Type 'clear' to exit
      </div>
    </div>
  );
};

export default SimpleAquarium; 