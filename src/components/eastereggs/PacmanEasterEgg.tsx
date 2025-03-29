import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import useSound from 'use-sound';

interface PacmanEasterEggProps {
  isActive: boolean;
  onClose: () => void;
  isFullscreen?: boolean;
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

interface Ghost {
  position: Position;
  direction: Direction;
  color: string;
  name: 'blinky' | 'pinky' | 'inky' | 'clyde';
  mode: 'chase' | 'scatter' | 'frightened';
  eaten: boolean;
  previousPos?: Position;
  speed: number; // Movement speed factor
}

type Direction = 'left' | 'right' | 'up' | 'down';

// Use the original Pacman dimensions
const MAZE_WIDTH = 28;
const MAZE_HEIGHT = 31;
const CELL_SIZE = 16; // Adjust cell size for better fit

// Ghost modes timing (in milliseconds)
const CHASE_TIME = 20000;
const SCATTER_TIME = 7000;
const FRIGHTENED_TIME = 8000;

// Game states
const GAME_STATE = {
  INTRO: 'intro',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  WIN: 'win'
};

// Ghost home positions (for scatter mode)
const GHOST_HOMES = {
  blinky: { x: 25, y: 3 },   // Top right
  pinky: { x: 2, y: 3 },     // Top left
  inky: { x: 25, y: 29 },    // Bottom right
  clyde: { x: 2, y: 29 }     // Bottom left
};

// Ghost pen exit point
const PEN_EXIT = { x: 13, y: 13 };

// Fixed timestep for game physics (16.67ms ~ 60fps)
const FIXED_TIMESTEP = 16.67;

const PacmanEasterEgg = ({ isActive, onClose, isFullscreen = false, className = '' }: PacmanEasterEggProps) => {
  const [pacmanPos, setPacmanPos] = useState<Position>({ x: 13, y: 23 }); // Starting position at bottom center
  const [pacmanDirection, setPacmanDirection] = useState<Direction>('right');
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState<Position[]>([]);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [gameState, setGameState] = useState<string>(GAME_STATE.INTRO);
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [level, setLevel] = useState(1);
  const [fruitPosition, setFruitPosition] = useState<Position | null>(null);
  const [fruitType, setFruitType] = useState<number>(0);
  const [ghostMode, setGhostMode] = useState<'chase' | 'scatter'>('scatter');
  const [lives, setLives] = useState(3);
  const [scale, setScale] = useState(1);
  
  // Game loop references
  const gameLoopRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);
  const accumulator = useRef<number>(0);
  const ghostModeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fruitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gameBoardRef = useRef<HTMLDivElement>(null);
  
  // Sound effects using use-sound
  const [playWaka] = useSound('/sounds/pacman/waka.mp3', { 
    volume: 0.3,
    interrupt: true,
    sprite: {
      waka: [0, 200]
    },
    onplayerror: () => {
      console.error('Failed to play waka sound');
    }
  });
  const [playPowerUp] = useSound('/sounds/pacman/power_pellet.mp3', { 
    volume: 0.5,
    onplayerror: () => {
      console.error('Failed to play power pellet sound');
    }
  });
  const [playDeath] = useSound('/sounds/pacman/death.mp3', { 
    volume: 0.5,
    onplayerror: () => {
      console.error('Failed to play death sound');
    }
  });
  const [playGhostEat] = useSound('/sounds/pacman/eat_ghost.mp3', { 
    volume: 0.5, 
    onplayerror: () => {
      console.error('Failed to play ghost eat sound');
    }
  });
  const [playFruit] = useSound('/sounds/pacman/eat_fruit.mp3', { 
    volume: 0.5,
    onplayerror: () => {
      console.error('Failed to play fruit sound');
    }
  });
  const [playIntro] = useSound('/sounds/pacman/game_start.mp3', { 
    volume: 0.5,
    onplayerror: () => {
      console.error('Failed to play intro sound');
    }
  });
  const [playExtraLife] = useSound('/sounds/pacman/extend.mp3', { 
    volume: 0.5,
    onplayerror: () => {
      console.error('Failed to play extra life sound');
    }
  });

  // Authentic Pacman maze layout (0: wall, 1: path, 2: power pellet, 3: ghost pen, 4: teleport)
  const maze = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,2,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,2,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,0,0,0,3,3,0,0,0,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,0,3,3,3,3,3,3,0,3,0,0,1,0,0,0,0,0,0],
    [4,4,4,4,4,4,1,1,1,3,0,3,3,3,3,3,3,0,3,1,1,1,4,4,4,4,4,4], // Teleport tunnels
    [0,0,0,0,0,0,1,0,0,3,0,3,3,3,3,3,3,0,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,2,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,2,0],
    [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
    [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  // Audio - Background music
  const initAudio = useCallback(() => {
    // Only initialize audio context on user interaction
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Load background music
        fetch('/sounds/pacman/background.mp3')
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to load background music');
            }
            return response.arrayBuffer();
          })
          .then(arrayBuffer => audioContextRef.current?.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            if (audioContextRef.current && audioBuffer && gameState === GAME_STATE.PLAYING) {
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.loop = true;
              source.connect(audioContextRef.current.destination);
              source.start();
            }
          })
          .catch(error => console.error('Error loading audio:', error));
      } catch (error) {
        console.error('Audio initialization failed:', error);
      }
    }
  }, [gameState]);

  // Start game after intro
  const startGame = useCallback(() => {
    try {
      playIntro();
    } catch (error) {
      console.error('Failed to play intro sound:', error);
    }
    
    // Short intro delay before starting gameplay
    setTimeout(() => {
      setGameState(GAME_STATE.PLAYING);
      initAudio();
    }, 4200); // Length of intro sound
  }, [playIntro, initAudio]);

  // Initialize game state
  useEffect(() => {
    if (isActive) {
      // Initialize dots
      const initialDots: Position[] = [];
      const initialGhosts: Ghost[] = [
        { 
          position: { x: 13, y: 14 }, 
          direction: 'left', 
          color: '#ff0000', 
          name: 'blinky', 
          mode: 'scatter',
          eaten: false,
          speed: 0.80 // Base speed
        },
        { 
          position: { x: 14, y: 14 }, 
          direction: 'right', 
          color: '#00ffff', 
          name: 'inky', 
          mode: 'scatter',
          eaten: false,
          speed: 0.75
        },
        { 
          position: { x: 13, y: 15 }, 
          direction: 'up', 
          color: '#ff69b4', 
          name: 'pinky', 
          mode: 'scatter',
          eaten: false,
          speed: 0.85
        },
        { 
          position: { x: 14, y: 15 }, 
          direction: 'down', 
          color: '#ffa500', 
          name: 'clyde', 
          mode: 'scatter',
          eaten: false,
          speed: 0.70
        }
      ];
      
      maze.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1 || cell === 2) {
            initialDots.push({ x, y });
          }
        });
      });
      
      // Reset game state
      setDots(initialDots);
      setGhosts(initialGhosts);
      setScore(0);
      setPacmanPos({ x: 13, y: 23 });
      setPacmanDirection('right');
      setLevel(1);
      setGhostMode('scatter');
      setLives(3);
      setGameState(GAME_STATE.INTRO);
      
      // Start the intro
      startGame();
      
      // Add keyboard controls
      window.addEventListener('keydown', handleGlobalKeyPress);
      
      return () => {
        cleanupGame();
        window.removeEventListener('keydown', handleGlobalKeyPress);
      };
    }
  }, [isActive, startGame]);

  // Handlers for keyboard events
  const handleGlobalKeyPress = (e: KeyboardEvent) => {
    // Handle escape key to pause/exit
    if (e.key === 'Escape') {
      if (gameState === GAME_STATE.PLAYING) {
        setGameState(GAME_STATE.PAUSED);
      } else if (gameState === GAME_STATE.PAUSED) {
        setGameState(GAME_STATE.PLAYING);
      }
      return;
    }
    
    handleMovement(e.key);
  };
  
  const handleReactKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle escape key to pause/exit
    if (e.key === 'Escape') {
      if (gameState === GAME_STATE.PLAYING) {
        setGameState(GAME_STATE.PAUSED);
      } else if (gameState === GAME_STATE.PAUSED) {
        setGameState(GAME_STATE.PLAYING);
      }
      return;
    }
    
    handleMovement(e.key);
  };
  
  // Common movement logic
  const handleMovement = (key: string) => {
    // Don't process movement if not playing
    if (gameState !== GAME_STATE.PLAYING) return;
    
    const newPos = { ...pacmanPos };
    let newDirection = pacmanDirection;
    
    switch (key) {
      case 'ArrowLeft':
        newPos.x--;
        newDirection = 'left';
        break;
      case 'ArrowRight':
        newPos.x++;
        newDirection = 'right';
        break;
      case 'ArrowUp':
        newPos.y--;
        newDirection = 'up';
        break;
      case 'ArrowDown':
        newPos.y++;
        newDirection = 'down';
        break;
      default:
        return; // If it's not an arrow key, exit
    }
    
    // Handle teleport tunnels
    if (newPos.x < 0) newPos.x = MAZE_WIDTH - 1;
    if (newPos.x >= MAZE_WIDTH) newPos.x = 0;
    
    if (isValidMove(newPos)) {
      setPacmanPos(newPos);
      setPacmanDirection(newDirection);
      checkDotCollection(newPos);
      try {
        playWaka();
      } catch (error) {
        console.error('Failed to play waka sound:', error);
      }
    }
  };

  // Start gameplay systems when game state changes to PLAYING
  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING) {
      // Start with scatter mode and cycle between modes
      startGhostModeCycle();
      
      // Schedule fruit appearance
      scheduleFruitAppearance();
      
      // Start game loop with fixed timestep
      lastUpdateTimeRef.current = performance.now();
      accumulator.current = 0;
      gameLoopRef.current = requestAnimationFrame(gameLoopWithFixedTimestep);
    }
    
    return () => {
      if (gameState !== GAME_STATE.PLAYING && gameState !== GAME_STATE.PAUSED) {
        cleanupGame();
      }
    };
  }, [gameState, level]);

  // Auto-focus the game board when it becomes active
  useEffect(() => {
    if (isActive && gameBoardRef.current) {
      gameBoardRef.current.focus();
    }
  }, [isActive, gameState]);

  // Cleanup timers and animation frames
  const cleanupGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (ghostModeTimerRef.current) {
      clearTimeout(ghostModeTimerRef.current);
    }
    if (fruitTimerRef.current) {
      clearTimeout(fruitTimerRef.current);
    }
  };

  // Start the mode cycling between scatter and chase
  const startGhostModeCycle = () => {
    if (ghostModeTimerRef.current) {
      clearTimeout(ghostModeTimerRef.current);
    }
    
    ghostModeTimerRef.current = setTimeout(() => {
      setGhostMode(prevMode => {
        const newMode = prevMode === 'scatter' ? 'chase' : 'scatter';
        
        // Update all ghosts to the new mode (unless frightened)
        setGhosts(prevGhosts => 
          prevGhosts.map(ghost => ({
            ...ghost,
            mode: ghost.mode === 'frightened' ? 'frightened' : newMode,
            direction: getOppositeDirection(ghost.direction) // Reverse direction when mode changes
          }))
        );
        
        // Set next timer
        ghostModeTimerRef.current = setTimeout(() => {
          startGhostModeCycle();
        }, newMode === 'chase' ? CHASE_TIME : SCATTER_TIME);
        
        return newMode;
      });
    }, ghostMode === 'scatter' ? SCATTER_TIME : CHASE_TIME);
  };

  // Get opposite direction
  const getOppositeDirection = (dir: Direction): Direction => {
    switch(dir) {
      case 'left': return 'right';
      case 'right': return 'left';
      case 'up': return 'down';
      case 'down': return 'up';
    }
  };

  // Schedule a random fruit appearance
  const scheduleFruitAppearance = () => {
    // Clear any existing timer
    if (fruitTimerRef.current) {
      clearTimeout(fruitTimerRef.current);
    }
    
    const fruitDelay = 10000 + Math.random() * 20000; // Between 10-30 seconds
    fruitTimerRef.current = setTimeout(() => {
      // Place fruit at a random position on the board where there's a path
      const availablePositions: Position[] = [];
      maze.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            availablePositions.push({ x, y });
          }
        });
      });
      
      if (availablePositions.length > 0) {
        const randomPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        setFruitPosition(randomPos);
        setFruitType(Math.min(level - 1, 5)); // Fruit type based on level, max 6 types
        
        // Remove fruit after some time
        fruitTimerRef.current = setTimeout(() => {
          setFruitPosition(null);
          // Schedule next fruit
          scheduleFruitAppearance();
        }, 10000);
      } else {
        // Try again if no positions found
        scheduleFruitAppearance();
      }
    }, fruitDelay);
  };
  
  // Game loop with fixed timestep for consistent physics
  const gameLoopWithFixedTimestep = (timestamp: number) => {
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }
    
    // Calculate time delta
    const deltaTime = timestamp - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = timestamp;
    
    // Add to accumulator
    accumulator.current += deltaTime;
    
    // Update with fixed timestep
    while (accumulator.current >= FIXED_TIMESTEP) {
      updateGame();
      accumulator.current -= FIXED_TIMESTEP;
    }
    
    // Request next frame
    gameLoopRef.current = requestAnimationFrame(gameLoopWithFixedTimestep);
  };
  
  // Update game state - separated from rendering
  const updateGame = () => {
    moveGhosts();
    checkCollisions();
  };

  const isValidMove = (pos: Position): boolean => {
    // Teleport tunnels always valid
    if (pos.y === 16 && (pos.x < 6 || pos.x > 21)) return true;
    
    // Can't enter ghost pen
    if (maze[pos.y]?.[pos.x] === 3) return false;
    
    // Can't go through walls
    return maze[pos.y]?.[pos.x] !== 0;
  };

  const checkDotCollection = (pos: Position) => {
    // Check for dot collection
    const dotIndex = dots.findIndex((dot: Position) => dot.x === pos.x && dot.y === pos.y);
    if (dotIndex !== -1) {
      const newDots = [...dots];
      newDots.splice(dotIndex, 1);
      setDots(newDots);
      
      // Regular dot points
      const pointsEarned = 10;
      setScore(prev => {
        const newScore = prev + pointsEarned;
        
        // Award extra life every 10,000 points
        if (Math.floor(prev / 10000) < Math.floor(newScore / 10000)) {
          setLives(l => l + 1);
          try {
            playExtraLife();
          } catch (error) {
            console.error('Failed to play extra life sound:', error);
          }
        }
        
        return newScore;
      });
      
      // Check for power pellet
      if (maze[pos.y][pos.x] === 2) {
        setIsPowerMode(true);
        try {
        playPowerUp();
        } catch (error) {
          console.error('Failed to play power up sound:', error);
        }
        
        // Set all ghosts to frightened mode
        setGhosts(prevGhosts => 
          prevGhosts.map(ghost => ({
            ...ghost,
            mode: 'frightened',
            direction: getOppositeDirection(ghost.direction)
          }))
        );
        
        setTimeout(() => {
          setIsPowerMode(false);
          // Return to current mode
          setGhosts(prevGhosts => 
            prevGhosts.map(ghost => ({
              ...ghost,
              mode: ghost.eaten ? ghost.mode : ghostMode
            }))
          );
        }, FRIGHTENED_TIME);
      }
      
      // Check win condition
      if (newDots.length === 0) {
        nextLevel();
      }
    }
    
    // Check for fruit collection
    if (fruitPosition && pos.x === fruitPosition.x && pos.y === fruitPosition.y) {
      const fruitScores = [100, 200, 300, 400, 500, 1000]; // Different scores for different fruits
      setScore(prev => prev + fruitScores[fruitType]);
      setFruitPosition(null);
      try {
        playFruit();
      } catch (error) {
        console.error('Failed to play fruit sound:', error);
      }
    }
  };

  // Advance to next level
  const nextLevel = () => {
    // Cleanup current level
    cleanupGame();
    
    setLevel(prev => prev + 1);
    setGameState(GAME_STATE.WIN);
    
    // Short delay before starting next level
    setTimeout(() => {
      // Reset the game but keep the score and lives
      resetLevel();
    }, 3000);
  };
  
  // Reset the level after losing a life
  const resetLevel = () => {
    // Reset Pacman and ghosts to starting positions
    setPacmanPos({ x: 13, y: 23 });
    setPacmanDirection('right');
    
    // Reset ghosts with increased speed based on level
    setGhosts(prev => prev.map(ghost => ({
      ...ghost,
      position: { 
        x: ghost.name === 'blinky' ? 13 : ghost.name === 'inky' ? 14 : ghost.name === 'pinky' ? 13 : 14, 
        y: ghost.name === 'blinky' || ghost.name === 'inky' ? 14 : 15 
      },
      direction: ghost.name === 'blinky' ? 'left' : ghost.name === 'inky' ? 'right' : ghost.name === 'pinky' ? 'up' : 'down',
      mode: 'scatter',
      eaten: false,
      speed: ghost.speed * (1 + level * 0.05) // Increase speed with level
    })));
    
    // Reset power mode
    setIsPowerMode(false);
    
    // Start playing again
    setGameState(GAME_STATE.PLAYING);
  };

  const moveGhosts = () => {
    setGhosts((prevGhosts: Ghost[]) => 
      prevGhosts.map((ghost: Ghost) => {
        // Skip movement randomly based on ghost speed (lower speed = more skips)
        if (Math.random() > ghost.speed) {
          return ghost;
        }
        
        // If ghost is eaten, return to ghost house
        if (ghost.eaten) {
          const penDist = Math.abs(ghost.position.x - PEN_EXIT.x) + Math.abs(ghost.position.y - PEN_EXIT.y);
          
          // If at pen entrance, reset ghost
          if (penDist <= 1) {
            return {
              ...ghost,
              position: { x: 13 + (Math.random() > 0.5 ? 1 : 0), y: 14 + (Math.random() > 0.5 ? 1 : 0) },
              direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Direction,
              eaten: false,
              mode: ghostMode
            };
          }
          
          // Move toward pen entrance
          return moveGhostToTarget(ghost, PEN_EXIT);
        }
        
        // Store previous position for preventing reversals
        const prevPos = { ...ghost.position };
        
        // Get target position based on ghost personality
        let targetPos: Position;
        
        if (ghost.mode === 'frightened') {
          // In frightened mode, move randomly
          return moveGhostRandomly(ghost);
        } else if (ghost.mode === 'scatter') {
          // In scatter mode, move to home corner
          targetPos = GHOST_HOMES[ghost.name];
        } else {
          // In chase mode, use ghost-specific targeting
          targetPos = getChaseTarget(ghost, pacmanPos, pacmanDirection, prevGhosts);
        }
        
        // Move ghost toward target
        const updatedGhost = moveGhostToTarget(ghost, targetPos, prevPos);
        
        return updatedGhost;
      })
    );
  };

  // Get chase target based on ghost personality
  const getChaseTarget = (ghost: Ghost, pacmanPos: Position, pacmanDir: Direction, allGhosts: Ghost[]): Position => {
    switch (ghost.name) {
      case 'blinky': // Red: directly chases Pacman
        return { ...pacmanPos };
        
      case 'pinky': // Pink: targets 4 tiles ahead of Pacman
        return getPositionInDirection(pacmanPos, pacmanDir, 4);
        
      case 'inky': // Cyan: uses both Blinky and Pacman positions
        const twoAheadOfPacman = getPositionInDirection(pacmanPos, pacmanDir, 2);
        const blinky = allGhosts.find(g => g.name === 'blinky');
        if (blinky) {
          // Vector from Blinky to 2 ahead of Pacman, doubled
          const vectorX = (twoAheadOfPacman.x - blinky.position.x) * 2;
          const vectorY = (twoAheadOfPacman.y - blinky.position.y) * 2;
          return { 
            x: blinky.position.x + vectorX,
            y: blinky.position.y + vectorY 
          };
        }
        return twoAheadOfPacman;
        
      case 'clyde': // Orange: chases directly when far, runs away when close
        const distToPacman = Math.sqrt(
          Math.pow(ghost.position.x - pacmanPos.x, 2) + 
          Math.pow(ghost.position.y - pacmanPos.y, 2)
        );
        
        // If more than 8 tiles away, chase Pacman
        if (distToPacman > 8) {
          return { ...pacmanPos };
        } 
        // If close, go to home corner
        return GHOST_HOMES.clyde;
        
      default:
        return { ...pacmanPos };
    }
  };

  // Get position N tiles ahead in a specific direction
  const getPositionInDirection = (pos: Position, dir: Direction, distance: number): Position => {
    const newPos = { ...pos };
    
    switch (dir) {
      case 'left':
        newPos.x -= distance;
        break;
      case 'right':
        newPos.x += distance;
        break;
      case 'up':
        newPos.y -= distance;
        break;
      case 'down':
        newPos.y += distance;
        break;
    }
    
    // Ensure position is within bounds
    newPos.x = Math.max(0, Math.min(newPos.x, MAZE_WIDTH - 1));
    newPos.y = Math.max(0, Math.min(newPos.y, MAZE_HEIGHT - 1));
    
    return newPos;
  };

  // Move ghost randomly (for frightened mode)
  const moveGhostRandomly = (ghost: Ghost): Ghost => {
    const newPos = { ...ghost.position };
    const availableDirections: Direction[] = [];
    
    // Check which directions are valid moves
    if (isValidMove({ x: newPos.x - 1, y: newPos.y }) && ghost.direction !== 'right') {
      availableDirections.push('left');
    }
    if (isValidMove({ x: newPos.x + 1, y: newPos.y }) && ghost.direction !== 'left') {
      availableDirections.push('right');
    }
    if (isValidMove({ x: newPos.x, y: newPos.y - 1 }) && ghost.direction !== 'down') {
      availableDirections.push('up');
    }
    if (isValidMove({ x: newPos.x, y: newPos.y + 1 }) && ghost.direction !== 'up') {
      availableDirections.push('down');
    }
    
    // If no valid directions found (rare corner case), allow reversal
    if (availableDirections.length === 0) {
      availableDirections.push(getOppositeDirection(ghost.direction));
    }
    
    // Choose a random valid direction
    const newDir = availableDirections[Math.floor(Math.random() * availableDirections.length)];
    
    // Update position based on new direction
    switch (newDir) {
          case 'left': newPos.x--; break;
          case 'right': newPos.x++; break;
          case 'up': newPos.y--; break;
          case 'down': newPos.y++; break;
        }
        
    // Handle teleport tunnels
    if (newPos.x < 0) newPos.x = MAZE_WIDTH - 1;
    if (newPos.x >= MAZE_WIDTH) newPos.x = 0;
    
    return { ...ghost, position: newPos, direction: newDir };
  };

  // Move ghost toward a specific target
  const moveGhostToTarget = (ghost: Ghost, targetPos: Position, previousPos?: Position): Ghost => {
    const newPos = { ...ghost.position };
    const possibleMoves: {dir: Direction, distance: number}[] = [];
    
    // Calculate distances for each possible move
    const checkMove = (dir: Direction, x: number, y: number) => {
      // Don't allow reversing direction unless no other options
      if (previousPos && previousPos.x === x && previousPos.y === y) {
        return;
      }
      
      if (isValidMove({ x, y })) {
        // For ghosts, handle special teleport case
        const effectiveX = x < 0 ? MAZE_WIDTH - 1 : (x >= MAZE_WIDTH ? 0 : x);
        
        // Calculate Manhattan distance to target
        const distance = Math.abs(effectiveX - targetPos.x) + Math.abs(y - targetPos.y);
        possibleMoves.push({ dir, distance });
      }
    };
    
    // Check all four directions
    checkMove('left', newPos.x - 1, newPos.y);
    checkMove('right', newPos.x + 1, newPos.y);
    checkMove('up', newPos.x, newPos.y - 1);
    checkMove('down', newPos.x, newPos.y + 1);
    
    if (possibleMoves.length === 0) {
      // If nowhere to go, just stay still
        return ghost;
    }
    
    // Sort moves by distance (closest first)
    possibleMoves.sort((a, b) => a.distance - b.distance);
    
    // Choose direction - almost always the closest unless frightened
    const newDir = possibleMoves[0].dir;
    
    // Update position
    switch (newDir) {
      case 'left': newPos.x--; break;
      case 'right': newPos.x++; break;
      case 'up': newPos.y--; break;
      case 'down': newPos.y++; break;
    }
    
    // Handle teleport tunnels
    if (newPos.x < 0) newPos.x = MAZE_WIDTH - 1;
    if (newPos.x >= MAZE_WIDTH) newPos.x = 0;
    
    return { ...ghost, position: newPos, direction: newDir, previousPos: ghost.position };
  };

  const checkCollisions = () => {
    // Optimized collision detection with spatial grid
    const pacmanCell = `${pacmanPos.x},${pacmanPos.y}`;
    
    for (let i = 0; i < ghosts.length; i++) {
      const ghost = ghosts[i];
      const ghostCell = `${ghost.position.x},${ghost.position.y}`;
      
      if (ghostCell === pacmanCell) {
        if (ghost.mode === 'frightened' && !ghost.eaten) {
          // Eat ghost
          try {
          playGhostEat();
          } catch (error) {
            console.error('Failed to play ghost eat sound:', error);
          }
          setGhosts(prev => prev.map((g, idx) => 
            idx === i 
              ? { ...g, eaten: true, mode: 'chase' } 
              : g
          ));
          setScore(prev => prev + 200 * level); // More points on higher levels
        } else if (!ghost.eaten) {
          // Lose a life
          try {
            playDeath();
          } catch (error) {
            console.error('Failed to play death sound:', error);
          }
          setLives(prev => prev - 1);
          
          // Game over if no lives left
          if (lives <= 1) {
            handleGameOver(false);
        } else {
            // Pause briefly before resetting the level
            setGameState(GAME_STATE.PAUSED);
            setTimeout(() => {
              resetLevel();
            }, 2000);
          }
          break; // Stop checking other ghosts
        }
      }
    }
  };

  const handleGameOver = (won: boolean) => {
    setGameState(won ? GAME_STATE.WIN : GAME_STATE.GAME_OVER);
    cleanupGame();
  };

  // Add a resize handler to scale the game board
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      if (!gameBoardRef.current) return;
      
      const containerWidth = window.innerWidth - 40; // Account for some padding
      const containerHeight = window.innerHeight - 200; // Account for header/footer
      
      const maxGameWidth = MAZE_WIDTH * CELL_SIZE;
      const maxGameHeight = MAZE_HEIGHT * CELL_SIZE;
      
      // Calculate scale factor based on available space
      const widthScale = Math.min(1, containerWidth / maxGameWidth);
      const heightScale = Math.min(1, containerHeight / maxGameHeight);
      
      // Use the smaller scale to maintain aspect ratio
      const newScale = Math.min(widthScale, heightScale, 1);
      
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive]);

  // Touch controls
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    // Don't process touch events if game is not playing
    if (gameState !== GAME_STATE.PLAYING) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Minimum swipe distance to trigger a move
    const minSwipeDistance = 30;
    
    // Only register a swipe if it's greater than the minimum distance
    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;
    
    // Determine swipe direction based on which axis had the larger movement
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        handleMovement('ArrowRight');
      } else {
        handleMovement('ArrowLeft');
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        handleMovement('ArrowDown');
      } else {
        handleMovement('ArrowUp');
      }
    }
    
    // Reset touch start position
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  // Restart the game
  const restartGame = useCallback(() => {
    // Reset game state
    const initialDots: Position[] = [];
    const initialGhosts: Ghost[] = [
      { 
        position: { x: 13, y: 14 }, 
        direction: 'left', 
        color: '#ff0000', 
        name: 'blinky', 
        mode: 'scatter',
        eaten: false,
        speed: 0.80 // Base speed
      },
      { 
        position: { x: 14, y: 14 }, 
        direction: 'right', 
        color: '#00ffff', 
        name: 'inky', 
        mode: 'scatter',
        eaten: false,
        speed: 0.75
      },
      { 
        position: { x: 13, y: 15 }, 
        direction: 'up', 
        color: '#ff69b4', 
        name: 'pinky', 
        mode: 'scatter',
        eaten: false,
        speed: 0.85
      },
      { 
        position: { x: 14, y: 15 }, 
        direction: 'down', 
        color: '#ffa500', 
        name: 'clyde', 
        mode: 'scatter',
        eaten: false,
        speed: 0.70
      }
    ];
    
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1 || cell === 2) {
          initialDots.push({ x, y });
        }
      });
    });
    
    setDots(initialDots);
    setGhosts(initialGhosts);
    setScore(0);
    setPacmanPos({ x: 13, y: 23 });
    setPacmanDirection('right');
    setLevel(1);
    setGhostMode('scatter');
    setLives(3);
    setGameState(GAME_STATE.INTRO);
    
    // Start the intro
    startGame();
  }, [startGame]);

  // Handle ESC key to exit Pacman
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onClose]);

  // Ensure proper cleanup of all game resources on unmount
  useEffect(() => {
    return () => {
      // Clean up all intervals, timers, animation frames
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
      if (ghostModeTimerRef.current) {
        clearTimeout(ghostModeTimerRef.current);
        ghostModeTimerRef.current = null;
      }
      if (fruitTimerRef.current) {
        clearTimeout(fruitTimerRef.current);
        fruitTimerRef.current = null;
      }
      
      // Stop any audio
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className={`relative font-mono ${className} ${isFullscreen ? 'min-h-screen bg-gray-900/95' : ''}`}>
      {/* Quick Exit Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 z-10"
        aria-label="Exit Game"
      >
        Exit
      </button>
      
      {/* Score, level and lives */}
      <div className="text-alien-glow mb-4 text-xl font-bold flex items-center justify-between w-full mx-auto" 
        style={{ maxWidth: `${MAZE_WIDTH * CELL_SIZE * scale}px` }}>
        <span>Score: {score}</span>
        <span>Level: {level}</span>
        <span>Lives: {lives}</span>
        {isPowerMode && <span className="animate-pulse">(POWER!)</span>}
      </div>
      
      {/* Game board container with scaling */}
      <div className="flex justify-center items-center overflow-hidden">
        <div
          ref={gameBoardRef}
          className="border-4 border-neon-blue rounded-lg p-2 bg-black relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-neon-pink"
          style={{
            width: `${MAZE_WIDTH * CELL_SIZE}px`,
            height: `${MAZE_HEIGHT * CELL_SIZE}px`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          tabIndex={0} 
          onKeyDown={handleReactKeyPress}
          autoFocus={isActive}
        >
          {/* Walls */}
          {maze.map((row, y) => 
            row.map((cell, x) => 
              cell === 0 && (
                <div
                  key={`wall-${x}-${y}`}
                  className="absolute bg-blue-800"
                  style={{
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE
                  }}
                />
              )
            )
          )}
          
          {/* Ghost Pen */}
          {maze.map((row, y) => 
            row.map((cell, x) => 
              cell === 3 && (
                <div
                  key={`pen-${x}-${y}`}
                  className="absolute bg-gray-900"
                  style={{
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    border: x === 13 && y === 13 ? 'none' : '1px solid #4a5568'
                  }}
                />
              )
            )
          )}
          
          {/* Dots */}
          {dots.map((dot: Position, i: number) => (
            <div
              key={`dot-${i}`}
              className={`absolute rounded-full ${
                maze[dot.y][dot.x] === 2 ? 'bg-alien-bright w-3 h-3' : 'bg-alien-glow w-2 h-2'
              }`}
              style={{
                left: dot.x * CELL_SIZE + CELL_SIZE/2 - (maze[dot.y][dot.x] === 2 ? 6 : 4),
                top: dot.y * CELL_SIZE + CELL_SIZE/2 - (maze[dot.y][dot.x] === 2 ? 6 : 4)
              }}
            />
          ))}
          
          {/* Extra lives */}
          <div className="absolute bottom-1 left-1 flex space-x-1">
            {[...Array(Math.min(lives - 1, 5))].map((_, i) => (
              <div
                key={`life-${i}`}
                className="bg-yellow-400 rounded-full"
                style={{
                  width: CELL_SIZE - 4,
                  height: CELL_SIZE - 4,
                  clipPath: 'polygon(0 0, 75% 0, 75% 100%, 0 100%)'
                }}
              />
            ))}
          </div>
          
          {/* Fruit */}
          {fruitPosition && (
            <div
              className="absolute"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: fruitPosition.x * CELL_SIZE + 1,
                top: fruitPosition.y * CELL_SIZE + 1,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url(https://raw.githubusercontent.com/masonhorne/Pacman-Javascript/master/images/fruit${fruitType + 1}.png)`
              }}
            />
          )}
          
          {/* Pacman with improved mouth animation */}
          <motion.div
            className="absolute bg-yellow-400 rounded-full"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: pacmanPos.x * CELL_SIZE + 1,
              top: pacmanPos.y * CELL_SIZE + 1,
              rotate: {
                'right': 0,
                'down': 90,
                'left': 180,
                'up': 270
              }[pacmanDirection]
            }}
            animate={{
              clipPath: [
                'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                'polygon(0 0, 50% 50%, 0 100%)',
                'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
              ]
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Improved Ghosts with eyes and proper modes */}
          {ghosts.map((ghost: Ghost, i: number) => (
            <div
              key={`ghost-${i}`}
              className="absolute"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: ghost.position.x * CELL_SIZE + 1,
                top: ghost.position.y * CELL_SIZE + 1,
                position: 'relative',
                overflow: 'visible'
              }}
            >
              {/* Ghost body */}
              <motion.div
                className={`absolute inset-0 rounded-t-full`}
                style={{
                  backgroundColor: ghost.eaten 
                    ? 'transparent' 
                    : ghost.mode === 'frightened' 
                      ? (isPowerMode ? '#0000ff' : '#ffffff') 
                      : ghost.color,
                  backgroundSize: 'contain',
                  transition: 'background-color 0.3s ease'
              }}
              animate={{
                y: [0, -2, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
                {/* Ghost bottom wave */}
                {!ghost.eaten && (
                  <div className="absolute bottom-0 left-0 w-full">
                    <motion.div
                      className="flex justify-between"
                      animate={{
                        scaleY: [1, 0.5, 1]
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-1/4 h-2 rounded-b-full bg-current"></div>
                      <div className="w-1/4 h-2 rounded-b-full bg-current"></div>
                      <div className="w-1/4 h-2 rounded-b-full bg-current"></div>
                      <div className="w-1/4 h-2 rounded-b-full bg-current"></div>
                    </motion.div>
                  </div>
                )}
            </motion.div>

              {/* Ghost eyes */}
              <div className="absolute inset-0 flex justify-around items-center pt-1">
                {/* Only show eyes when eaten or normal mode */}
                {(ghost.eaten || ghost.mode !== 'frightened' || !isPowerMode) && (
                  <>
                    <div className="relative w-1/3 h-1/3 bg-white rounded-full">
                      <div 
                        className="absolute w-1/2 h-1/2 bg-blue-900 rounded-full"
                        style={{
                          top: ghost.direction === 'up' ? '10%' : ghost.direction === 'down' ? '50%' : '30%',
                          left: ghost.direction === 'left' ? '10%' : ghost.direction === 'right' ? '50%' : '30%'
                        }}
                      ></div>
                    </div>
                    <div className="relative w-1/3 h-1/3 bg-white rounded-full">
                      <div 
                        className="absolute w-1/2 h-1/2 bg-blue-900 rounded-full"
                        style={{
                          top: ghost.direction === 'up' ? '10%' : ghost.direction === 'down' ? '50%' : '30%',
                          left: ghost.direction === 'left' ? '10%' : ghost.direction === 'right' ? '50%' : '30%'
                        }}
                      ></div>
                    </div>
                  </>
                )}
                
                {/* Frightened face (only when in frightened mode and not eaten) */}
                {ghost.mode === 'frightened' && !ghost.eaten && isPowerMode && (
                  <div className="absolute inset-0 flex flex-col justify-center items-center">
                    <div className="flex w-3/4 justify-between mt-1">
                      <div className="w-1/3 h-1/3 bg-white rounded-full"></div>
                      <div className="w-1/3 h-1/3 bg-white rounded-full"></div>
                    </div>
                    <div className="w-1/2 h-1/6 bg-white mt-1 flex">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-1/4 h-full bg-blue-800 border-white"></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Intro screen */}
          {gameState === GAME_STATE.INTRO && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
              <div className="text-center">
                <h2 className="text-neon-pink text-4xl font-bold mb-4">READY!</h2>
                <p className="text-white text-xl mb-4">Use arrow keys to move</p>
                <button 
                  className="px-6 py-3 bg-neon-pink text-white rounded-lg hover:bg-opacity-80"
                  onClick={() => setGameState(GAME_STATE.PLAYING)}
                  autoFocus
                >
                  Start Game
                </button>
              </div>
            </div>
          )}
          
          {/* Paused screen */}
          {gameState === GAME_STATE.PAUSED && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
              <div className="text-center">
                <h2 className="text-neon-pink text-4xl font-bold mb-4">PAUSED</h2>
                <button 
                  className="px-6 py-3 bg-neon-pink text-white rounded-lg hover:bg-opacity-80 mr-4"
                  onClick={() => setGameState(GAME_STATE.PLAYING)}
                  autoFocus
                >
                  Resume
                </button>
                <button 
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-opacity-80"
                  onClick={onClose}
                >
                  Quit
                </button>
              </div>
            </div>
          )}
          
          {/* Game over screen */}
          {gameState === GAME_STATE.GAME_OVER && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
              <div className="text-center">
                <h2 className="text-red-500 text-4xl font-bold mb-4">GAME OVER</h2>
                <p className="text-white text-xl mb-4">Final Score: {score}</p>
                <button 
                  className="px-6 py-3 bg-neon-pink text-white rounded-lg hover:bg-opacity-80 mr-4"
                  onClick={() => setGameState(GAME_STATE.PLAYING)}
                  autoFocus
                >
                  Try Again
                </button>
                <button 
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-opacity-80"
                  onClick={onClose}
                >
                  Exit
                </button>
              </div>
            </div>
          )}
          
          {/* Win screen */}
          {gameState === GAME_STATE.WIN && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
              <div className="text-center">
                <h2 className="text-yellow-400 text-4xl font-bold mb-4">YOU WIN!</h2>
                <p className="text-white text-xl mb-4">Final Score: {score}</p>
                <button 
                  className="px-6 py-3 bg-neon-pink text-white rounded-lg hover:bg-opacity-80 mr-4"
                  onClick={() => setGameState(GAME_STATE.PLAYING)}
                  autoFocus
                >
                  Play Again
                </button>
                <button 
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-opacity-80"
                  onClick={onClose}
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-gray-400 text-center mx-auto" style={{ maxWidth: `${MAZE_WIDTH * CELL_SIZE * scale}px` }}>
        Use arrow keys to move. Eat all dots to win!
        <br />
        Power pellets (larger dots) let you eat ghosts! Press ESC to pause.
      </div>
    </div>
  );
};

export default PacmanEasterEgg;