import { useState, useEffect, useRef } from 'react';

interface AsciiAquariumProps {
  width?: number;
  height?: number;
}

interface Fish {
  x: number;
  y: number;
  direction: 'left' | 'right';
  type: 'small' | 'medium' | 'large';
  speed: number;
  color: string;
}

interface Decoration {
  x: number;
  y: number;
  type: 'plant' | 'rock' | 'treasure' | 'coral';
}

// Water animation frames
const waterAnimationFrames = [
  '~',
  '^',
  '~',
  '°'
];

const AsciiAquarium = ({ width = 40, height = 15 }: AsciiAquariumProps) => {
  const [aquarium, setAquarium] = useState<string[]>([]);
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [waterAnimationFrame, setWaterAnimationFrame] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);

  // Fish ASCII representations
  const fishTypes = {
    small: {
      left: '<><',
      right: '><>'
    },
    medium: {
      left: '<º)))><',
      right: '><(((º>'
    },
    large: {
      left: '<³))))><',
      right: '><((((³>'
    }
  };

  const decorationTypes = {
    plant: ['╿╿╿', '╽╽╽', '┃┃┃'],
    rock: ['▅▅', '▅▟', '▅▅▅'],
    treasure: ['┌─$─┐', '│ $ │', '└───┘'],
    coral: ['╭╮╭╮', '╰╯╰╯', '╭╮╭╮']
  };

  // Color options for fish
  const fishColors = [
    'text-yellow-400',
    'text-orange-400',
    'text-red-400',
    'text-green-400',
    'text-blue-400',
    'text-purple-400',
    'text-pink-400',
    'text-cyan-400'
  ];

  // Initialize the aquarium
  useEffect(() => {
    // Create initial fishes (3-7 random fish)
    const initialFishes: Fish[] = [];
    const numFish = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < numFish; i++) {
      initialFishes.push(createRandomFish());
    }
    
    setFishes(initialFishes);

    // Create decorations (plants, rocks, treasure)
    const initialDecorations: Decoration[] = [];
    
    // Add 2-4 plants at the bottom
    const numPlants = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numPlants; i++) {
      initialDecorations.push({
        x: Math.floor(Math.random() * (width - 4)) + 2,
        y: height - 2,
        type: 'plant'
      });
    }
    
    // Add 1-2 rocks
    const numRocks = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numRocks; i++) {
      initialDecorations.push({
        x: Math.floor(Math.random() * (width - 4)) + 2,
        y: height - 2,
        type: 'rock'
      });
    }
    
    // Maybe add treasure (25% chance)
    if (Math.random() > 0.75) {
      initialDecorations.push({
        x: Math.floor(Math.random() * (width - 6)) + 3,
        y: height - 2,
        type: 'treasure'
      });
    }
    
    // Add some coral
    const numCoral = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numCoral; i++) {
      initialDecorations.push({
        x: Math.floor(Math.random() * (width - 5)) + 2,
        y: height - 2,
        type: 'coral'
      });
    }
    
    setDecorations(initialDecorations);
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(updateAquarium);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height]);

  // Create a random fish
  const createRandomFish = (): Fish => {
    const fishTypes = ['small', 'medium', 'large'] as const;
    const directions = ['left', 'right'] as const;
    
    return {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * (height - 4)) + 2, // Keep fish away from top/bottom
      direction: directions[Math.floor(Math.random() * 2)],
      type: fishTypes[Math.floor(Math.random() * 3)],
      speed: (Math.random() * 0.1) + 0.05, // Fish speed between 0.05-0.15
      color: fishColors[Math.floor(Math.random() * fishColors.length)]
    };
  };

  // Add a bubble where the fish is (randomly)
  const addBubble = (newFishes: Fish[]) => {
    if (Math.random() > 0.92 && newFishes.length > 0) {
      // Pick a random fish
      const randomFish = newFishes[Math.floor(Math.random() * newFishes.length)];
      
      // Add a bubble above the fish
      const newX = randomFish.x;
      const newY = randomFish.y - 1;
      
      // Only add bubble if it's not too close to the top
      if (newY > 1) {
        // Create a special bubble fish
        newFishes.push({
          x: newX,
          y: newY,
          direction: 'left', // Direction doesn't matter for bubbles
          type: 'small',
          speed: 0.2,
          color: 'text-cyan-200'
        });
      }
    }
    
    return newFishes;
  };

  // Main animation loop
  const updateAquarium = (timestamp: number) => {
    // Control frame rate (update every ~100ms)
    if (timestamp - lastUpdateTime.current < 100) {
      animationRef.current = requestAnimationFrame(updateAquarium);
      return;
    }
    
    lastUpdateTime.current = timestamp;
    
    // Update water animation frame every 3 updates
    if (timestamp % 300 < 100) {
      setWaterAnimationFrame(prev => (prev + 1) % waterAnimationFrames.length);
    }
    
    // Move fish
    setFishes(prevFishes => {
      const newFishes = [...prevFishes];
      
      // Process each fish
      for (let i = 0; i < newFishes.length; i++) {
        const fish = newFishes[i];
        
        // Check if it's a bubble (moves up)
        if (fish.type === 'small' && fish.speed > 0.15) {
          fish.y -= 1;
          
          // Random horizontal drift for bubbles
          if (Math.random() > 0.7) {
            fish.x += (Math.random() > 0.5) ? 0.2 : -0.2;
          }
          
          // Remove bubble if it reaches the top
          if (fish.y <= 1) {
            newFishes.splice(i, 1);
            i--;
            continue;
          }
        } else {
          // Regular fish movement
          if (fish.direction === 'right') {
            fish.x += fish.speed * 10;
            if (fish.x > width) {
              fish.x = -fishTypes[fish.type].right.length;
            }
          } else {
            fish.x -= fish.speed * 10;
            if (fish.x < -fishTypes[fish.type].left.length) {
              fish.x = width;
            }
          }
          
          // Randomly change direction (small chance)
          if (Math.random() > 0.98) {
            fish.direction = fish.direction === 'left' ? 'right' : 'left';
          }
          
          // Randomly change y position slightly
          if (Math.random() > 0.92) {
            const moveUp = Math.random() > 0.5;
            if (moveUp && fish.y > 2) {
              fish.y -= 0.5;
            } else if (!moveUp && fish.y < height - 3) {
              fish.y += 0.5;
            }
          }
        }
      }
      
      // Random chance to add a new fish
      if (Math.random() > 0.98 && newFishes.filter(f => f.speed <= 0.15).length < 10) {
        newFishes.push(createRandomFish());
      }
      
      // Add a bubble occasionally
      return addBubble(newFishes);
    });
    
    // Create the aquarium display
    updateAquariumDisplay();
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(updateAquarium);
  };

  // Create the visual representation of the aquarium
  const updateAquariumDisplay = () => {
    const newAquarium: string[] = [];
    
    // Create a blank aquarium
    for (let y = 0; y < height; y++) {
      if (y === 0) {
        // Top border
        newAquarium.push('╔' + '═'.repeat(width) + '╗');
      } else if (y === height - 1) {
        // Bottom border
        newAquarium.push('╚' + '═'.repeat(width) + '╝');
      } else if (y === 1) {
        // Water surface with animation
        let waterLine = '║';
        
        for (let x = 0; x < width; x++) {
          // Alternate water frames for visual effect
          const frameToUse = (x % 4 + waterAnimationFrame) % waterAnimationFrames.length;
          waterLine += waterAnimationFrames[frameToUse];
        }
        
        waterLine += '║';
        newAquarium.push(waterLine);
      } else {
        // Side borders with empty space
        let row = '║' + ' '.repeat(width) + '║';
        newAquarium.push(row);
      }
    }
    
    // Place decorations in the aquarium
    decorations.forEach(decoration => {
      const y = decoration.y;
      const x = decoration.x;
      
      // Skip if out of bounds
      if (y < 1 || y >= height - 1 || x < 1 || x >= width) {
        return;
      }
      
      const decorationArt = decorationTypes[decoration.type][Math.floor(Math.random() * decorationTypes[decoration.type].length)];
      
      // Place the decoration
      if (x + decorationArt.length < width) {
        let row = newAquarium[y];
        const newRow = row.substring(0, x + 1) + decorationArt + row.substring(x + decorationArt.length + 1);
        newAquarium[y] = newRow;
      }
    });
    
    // Place fish in the aquarium
    fishes.forEach(fish => {
      const y = Math.floor(fish.y);
      const x = Math.floor(fish.x);
      
      // Skip if fish is out of bounds
      if (y < 1 || y >= height - 1 || x < 0) {
        return;
      }
      
      // Get the current row and check if we can place the fish
      let row = newAquarium[y];
      
      // Check if it's a bubble
      if (fish.type === 'small' && fish.speed > 0.15) {
        // Choose bubble character
        const bubbleChar = Math.random() > 0.3 ? 'o' : 'O'; // Variation in bubble size
        
        // Replace the character with a bubble
        if (x >= 0 && x < row.length - 1) {
          row = row.substring(0, x + 1) + bubbleChar + row.substring(x + 2);
          newAquarium[y] = row;
        }
      } else {
        // It's a fish - place it facing the right direction
        const fishArt = fish.direction === 'left' 
          ? fishTypes[fish.type].left 
          : fishTypes[fish.type].right;
        
        // Make sure the fish fits in the row
        if (x + fishArt.length < row.length - 1) {
          // Place the fish in the row
          row = row.substring(0, x + 1) + fishArt + row.substring(x + fishArt.length + 1);
          newAquarium[y] = row;
        }
      }
    });
    
    setAquarium(newAquarium);
  };

  // Add water effect classes
  const getRowClasses = (index: number) => {
    if (index === 0) return 'text-cyan-500 font-bold';
    if (index === height - 1) return 'text-cyan-500 font-bold';
    if (index === 1) return 'text-cyan-300 animate-pulse';
    return '';
  };

  // Function to get fish color based on its type and position
  const getFishColor = (row: string, index: number) => {
    // Find the fish at this position
    for (const fish of fishes) {
      const y = Math.floor(fish.y);
      if (y === index) {
        const x = Math.floor(fish.x);
        const fishLength = fish.direction === 'left' 
          ? fishTypes[fish.type].left.length 
          : fishTypes[fish.type].right.length;
          
        // Check if the fish is visible in this row
        if (x >= 0 && x < row.length - fishLength) {
          return fish.color;
        }
      }
    }
    return '';
  };

  // Function to get decoration colors
  const getDecorationColor = (type: string) => {
    switch(type) {
      case 'plant': return 'text-green-500';
      case 'rock': return 'text-gray-500';
      case 'treasure': return 'text-yellow-500';
      case 'coral': return 'text-pink-500';
      default: return '';
    }
  };

  return (
    <div className="p-2 animate-[fadeIn_0.5s]">
      <pre className="whitespace-pre font-mono overflow-hidden text-center">
        {aquarium.map((row, index) => {
          // Find all decorations in this row
          const rowDecorations = decorations.filter(d => Math.floor(d.y) === index);
          
          // Find all fish in this row
          const rowFish = fishes.filter(f => Math.floor(f.y) === index);
          
          // Basic row class
          const baseClass = getRowClasses(index);
          
          if (rowDecorations.length === 0 && rowFish.length === 0) {
            // No special items in this row
            return (
              <div key={index} className={baseClass}>
                {row}
              </div>
            );
          }
          
          // Process row with special items
          let processedRow = row;
          let parts = [];
          let currentIndex = 0;
          
          // Add fish first
          rowFish.forEach(fish => {
            const x = Math.floor(fish.x);
            if (x < 1) return; // Skip if not visible
            
            const fishArt = fish.direction === 'left' 
              ? fishTypes[fish.type].left 
              : fishTypes[fish.type].right;
            
            // Fish is in this part of the row
            if (x >= currentIndex && x < processedRow.length) {
              // Add the part before the fish
              if (x > currentIndex) {
                parts.push({
                  text: processedRow.substring(currentIndex, x),
                  className: baseClass
                });
              }
              
              // Add the fish with its color
              if (fish.type === 'small' && fish.speed > 0.15) {
                // It's a bubble
                parts.push({
                  text: fish.direction === 'left' ? 'o' : 'O',
                  className: 'text-cyan-200'
                });
              } else {
                // It's a fish
                parts.push({
                  text: fishArt,
                  className: fish.color
                });
              }
              
              currentIndex = x + fishArt.length;
            }
          });
          
          // Add decorations
          rowDecorations.forEach(deco => {
            const x = Math.floor(deco.x);
            if (x < 1) return; // Skip if not visible
            
            const decoArt = decorationTypes[deco.type][0]; // Simple version
            
            // Decoration is in this part of the row
            if (x >= currentIndex && x < processedRow.length) {
              // Add the part before the decoration
              if (x > currentIndex) {
                parts.push({
                  text: processedRow.substring(currentIndex, x),
                  className: baseClass
                });
              }
              
              // Add the decoration with its color
              parts.push({
                text: decoArt,
                className: getDecorationColor(deco.type)
              });
              
              currentIndex = x + decoArt.length;
            }
          });
          
          // Add the rest of the row
          if (currentIndex < processedRow.length) {
            parts.push({
              text: processedRow.substring(currentIndex),
              className: baseClass
            });
          }
          
          // If no parts were added, just return the whole row
          if (parts.length === 0) {
            return (
              <div key={index} className={baseClass}>
                {processedRow}
              </div>
            );
          }
          
          // Return the row with colored parts
          return (
            <div key={index} className={baseClass}>
              {parts.map((part, i) => (
                <span key={i} className={part.className}>{part.text}</span>
              ))}
            </div>
          );
        })}
      </pre>
      <div className="text-xs text-cyan-400 text-center mt-2">
        Type 'clear' to exit • {fishes.filter(f => f.speed <= 0.15).length} fish • {fishes.filter(f => f.speed > 0.15).length} bubbles
      </div>
    </div>
  );
};

export default AsciiAquarium; 