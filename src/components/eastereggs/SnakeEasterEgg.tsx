import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SnakeEasterEggProps {
  isActive: boolean;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 120; // ms between moves (faster than original)
const SPEED_INCREASE = 8; // ms decrease per food eaten (more challenging)
const MAX_SPEED = 40; // Faster max speed

const SnakeEasterEgg = ({ isActive, onClose }: SnakeEasterEggProps) => {
  const [snake, setSnake] = useState<Position[]>([{ x: 5, y: 5 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>('right');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [fadeEffect, setFadeEffect] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const lastMoveTimeRef = useRef<number>(0);
  const foodFlashRef = useRef<number>(0);

  // Place food in a random position not occupied by the snake
  const placeFood = useCallback(() => {
    const newFood = { 
      x: Math.floor(Math.random() * GRID_SIZE), 
      y: Math.floor(Math.random() * GRID_SIZE) 
    };
    
    // Check if food is on snake
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    
    if (isOnSnake) {
      // Try again with a recursive call
      placeFood();
    } else {
      setFood(newFood);
      foodFlashRef.current = 10; // Start flashing animation
    }
  }, [snake]);

  // Game reset
  const resetGame = useCallback(() => {
    setSnake([{ x: 5, y: 5 }]);
    setDirection('right');
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setLevel(1);
    placeFood();
    setFadeEffect(true);
    setTimeout(() => setFadeEffect(false), 500);
  }, [placeFood]);

  // Initialize game when component mounts
  useEffect(() => {
    if (isActive) {
      resetGame();
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isActive, resetGame]);

  // Handle keyboard controls
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        return;
      }
      
      if (e.key === 'r' || e.key === 'R') {
        resetGame();
        return;
      }
      
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (isPaused || gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'down') setDirection('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'up') setDirection('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'right') setDirection('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'left') setDirection('right');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, direction, isPaused, gameOver, resetGame, onClose]);

  // Game loop
  useEffect(() => {
    if (!isActive || gameOver || isPaused) return;
    
    const moveSnake = (timestamp: number) => {
      if (timestamp - lastMoveTimeRef.current < speed) {
        gameLoopRef.current = requestAnimationFrame(moveSnake);
        return;
      }
      
      lastMoveTimeRef.current = timestamp;
      
      // Decrease food flash counter
      if (foodFlashRef.current > 0) {
        foodFlashRef.current--;
      }
      
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        
        // Move head based on direction
        switch (direction) {
          case 'up':
            head.y -= 1;
            break;
          case 'down':
            head.y += 1;
            break;
          case 'left':
            head.x -= 1;
            break;
          case 'right':
            head.x += 1;
            break;
        }
        
        // Check if out of bounds - wrap around instead of game over
        if (head.x < 0) head.x = GRID_SIZE - 1;
        else if (head.x >= GRID_SIZE) head.x = 0;
        
        if (head.y < 0) head.y = GRID_SIZE - 1;
        else if (head.y >= GRID_SIZE) head.y = 0;
        
        // Check if snake hit itself
        for (let i = 1; i < prevSnake.length; i++) {
          if (prevSnake[i].x === head.x && prevSnake[i].y === head.y) {
            setGameOver(true);
            
            // Update high score if needed
            if (score > highScore) {
              setHighScore(score);
            }
            
            return prevSnake;
          }
        }
        
        // Create new snake array with head at the front
        const newSnake = [head, ...prevSnake];
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
          // Increase score
          const newScore = score + 10;
          setScore(newScore);
          
          // Set level based on score
          const newLevel = Math.floor(newScore / 50) + 1;
          if (newLevel > level) {
            setLevel(newLevel);
            setFadeEffect(true);
            setTimeout(() => setFadeEffect(false), 300);
          }
          
          // Increase speed
          setSpeed(prev => Math.max(prev - SPEED_INCREASE, MAX_SPEED));
          
          // Place new food
          placeFood();
        } else {
          // Remove tail if didn't eat
          newSnake.pop();
        }
        
        return newSnake;
      });
      
      gameLoopRef.current = requestAnimationFrame(moveSnake);
    };
    
    gameLoopRef.current = requestAnimationFrame(moveSnake);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isActive, direction, food, gameOver, isPaused, placeFood, speed, score, highScore, level]);

  // Calculate width and height of the container
  const containerWidth = GRID_SIZE * CELL_SIZE;
  const containerHeight = GRID_SIZE * CELL_SIZE;

  return (
    <motion.div 
      className="flex flex-col items-center justify-center w-full py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={`flex justify-between w-full max-w-md mb-3 p-2 rounded-md ${fadeEffect ? 'bg-green-800/30' : ''} transition-colors duration-300`}>
        <div className="text-green-400 font-mono">SCORE: <span className="text-green-300 font-bold">{score}</span></div>
        <div className="text-purple-400 font-mono">LEVEL: <span className="text-purple-300 font-bold">{level}</span></div>
        <div className="text-yellow-400 font-mono">HIGH: <span className="text-yellow-300 font-bold">{highScore}</span></div>
      </div>
      
      <div 
        ref={containerRef}
        className={`relative bg-gray-900 border-2 border-green-700 rounded-md overflow-hidden shadow-lg ${fadeEffect ? 'border-green-400' : ''} transition-colors duration-300`}
        style={{ 
          width: `${containerWidth}px`, 
          height: `${containerHeight}px` 
        }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0">
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <div key={`h-${i}`} className="absolute border-t border-gray-800" style={{ top: `${i * CELL_SIZE}px`, width: '100%' }} />
          ))}
          {Array.from({ length: GRID_SIZE }).map((_, i) => (
            <div key={`v-${i}`} className="absolute border-l border-gray-800" style={{ left: `${i * CELL_SIZE}px`, height: '100%' }} />
          ))}
        </div>
        
        {/* Food */}
        <motion.div 
          className={`absolute rounded-full transition-colors duration-200`}
          style={{ 
            width: `${CELL_SIZE - 2}px`, 
            height: `${CELL_SIZE - 2}px`, 
            left: `${food.x * CELL_SIZE + 1}px`, 
            top: `${food.y * CELL_SIZE + 1}px`,
            backgroundColor: foodFlashRef.current > 0 ? '#ff6b6b' : '#fb5050',
            boxShadow: foodFlashRef.current > 0 ? '0 0 8px 2px rgba(255, 107, 107, 0.7)' : 'none'
          }}
          animate={{ 
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Snake */}
        {snake.map((segment, i) => {
          // Calculate color gradient from head to tail
          const headColor = 'rgb(74, 222, 128)'; // green-400
          const tailColor = 'rgb(22, 163, 74)';  // green-600
          
          const colorFactor = i / snake.length;
          const segmentColor = i === 0 ? headColor : tailColor;
          
          return (
            <motion.div 
              key={`${segment.x}-${segment.y}-${i}`}
              className="absolute rounded-sm"
              initial={{ scale: i === 0 ? 0.5 : 1 }}
              animate={{ scale: 1 }}
              style={{ 
                width: `${CELL_SIZE - (i === 0 ? 0 : 2)}px`, 
                height: `${CELL_SIZE - (i === 0 ? 0 : 2)}px`, 
                left: `${segment.x * CELL_SIZE + (i === 0 ? 0 : 1)}px`, 
                top: `${segment.y * CELL_SIZE + (i === 0 ? 0 : 1)}px`,
                backgroundColor: segmentColor,
                boxShadow: i === 0 ? '0 0 5px rgba(74, 222, 128, 0.5)' : 'none',
                zIndex: snake.length - i // Head appears on top
              }}
            />
          );
        })}
        
        {/* Game over overlay */}
        {gameOver && (
          <motion.div 
            className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-red-500 text-2xl font-bold mb-4">GAME OVER</h2>
            <p className="text-white mb-2">Score: {score}</p>
            <p className="text-yellow-400 mb-4">High Score: {highScore}</p>
            <div className="flex space-x-4">
              <button 
                onClick={resetGame}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
              >
                Play Again
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Pause overlay */}
        {isPaused && !gameOver && (
          <motion.div 
            className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-blue-400 text-2xl font-bold mb-4">PAUSED</h2>
            <p className="text-gray-300 mb-4">Press 'P' to resume</p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setIsPaused(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
              >
                Resume
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="mt-3 text-sm text-gray-400 flex flex-wrap justify-center gap-2">
        <span>Arrow keys or WASD to move</span>
        <span>P: Pause</span>
        <span>R: Restart</span>
        <span>ESC: Close</span>
      </div>
    </motion.div>
  );
};

export default SnakeEasterEgg; 