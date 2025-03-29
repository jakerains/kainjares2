import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface FlappyKainEasterEggProps {
  isActive: boolean;
  onClose: () => void;
}

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 700;
const PIPE_WIDTH = 80;
const INITIAL_PIPE_GAP = 200;
const INITIAL_PIPE_SPEED = 3;
const PIPE_INTERVAL = 120; // frames between new pipe pairs
const PLAYER_SIZE = 80;

// Difficulty progression constants
const SPEED_INCREMENT = 0.4; // How much to increase speed per difficulty level
const GAP_DECREMENT = 10; // How much to decrease gap per difficulty level
const SCORE_PER_LEVEL = 3; // How many points to increase difficulty
const GRAVITY_INCREMENT = 0.03; // How much to increase gravity per difficulty level

// Game interfaces
interface PlayerState {
  x: number;
  y: number;
  velocity: number;
}

interface PipeState {
  x: number;
  topHeight: number;
  id: number;
  passed: boolean;
}

const FlappyKainEasterEgg = ({ isActive, onClose }: FlappyKainEasterEggProps) => {
  const [player, setPlayer] = useState<PlayerState>({
    x: GAME_WIDTH * 0.2,
    y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
    velocity: 0
  });
  const [pipes, setPipes] = useState<PipeState[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [pipeSpeed, setPipeSpeed] = useState(INITIAL_PIPE_SPEED);
  const [pipeGap, setPipeGap] = useState(INITIAL_PIPE_GAP);
  
  const gameLoopRef = useRef<number>();
  const frameCountRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  
  // Load images refs
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const pipeImageRef = useRef<HTMLImageElement | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  
  // Load game assets
  useEffect(() => {
    if (!isActive) return;
    
    // Load player image (UFO)
    playerImageRef.current = new Image();
    playerImageRef.current.src = '/images/flappykain/ufo.png';
    
    // Load pipe image
    pipeImageRef.current = new Image();
    pipeImageRef.current.src = '/images/flappykain/pipe.png';
    
    // Load background image
    backgroundImageRef.current = new Image();
    backgroundImageRef.current.src = '/images/flappykain/space-bg.png';
    
    // Load logo image
    logoImageRef.current = new Image();
    logoImageRef.current.src = '/images/flappykain/flappykain.png';

    // Load background music - use .mp3 instead of .mid (browsers don't support MIDI well)
    try {
      backgroundMusicRef.current = new Audio('/sounds/aliens_exist.mp3');
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.7;
      
      // Preload the audio file
      backgroundMusicRef.current.load();
      
      // Log when audio is ready
      backgroundMusicRef.current.addEventListener('canplaythrough', () => {
        console.log('Audio file loaded and ready to play');
      });
      
      // Log any errors with audio loading
      backgroundMusicRef.current.addEventListener('error', (e) => {
        console.error('Error loading audio file:', e);
        console.error('Audio error code:', backgroundMusicRef.current?.error?.code);
        console.error('Audio error message:', backgroundMusicRef.current?.error?.message);
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }

    // Handle resize to make the canvas responsive
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Make sure we maintain aspect ratio while fitting the container
        const container = canvas.parentElement;
        if (container) {
          // Get the container dimensions
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          
          // Calculate the scaling factor to maintain aspect ratio
          const scaleX = containerWidth / GAME_WIDTH;
          const scaleY = containerHeight / GAME_HEIGHT;
          const scale = Math.min(scaleX, scaleY);
          
          // Set the canvas display size (CSS)
          canvas.style.width = `${GAME_WIDTH * scale}px`;
          canvas.style.height = `${GAME_HEIGHT * scale}px`;
        }
      }
    };

    // Call handleResize initially and add event listener
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive]);
  
  // Reset function now resets difficulty settings too
  const resetGame = useCallback(() => {
    setPlayer({
      x: GAME_WIDTH * 0.2,
      y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
      velocity: 0
    });
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    frameCountRef.current = 0;
    setDifficultyLevel(1);
    setPipeSpeed(INITIAL_PIPE_SPEED);
    setPipeGap(INITIAL_PIPE_GAP);
    
    // Stop music when resetting the game
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
  }, []);
  
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
  
  // Generate a new pipe
  const generatePipe = useCallback(() => {
    const minTopHeight = 50;
    const maxTopHeight = GAME_HEIGHT - pipeGap - 50; // Use current pipeGap
    const topHeight = Math.floor(Math.random() * (maxTopHeight - minTopHeight + 1)) + minTopHeight;
    
    return {
      x: GAME_WIDTH,
      topHeight,
      id: Date.now(),
      passed: false
    };
  }, [pipeGap]);
  
  // Update difficulty based on score
  useEffect(() => {
    // Calculate what the difficulty level should be based on score
    const newLevel = Math.floor(score / SCORE_PER_LEVEL) + 1;
    
    // Only update if difficulty has increased
    if (newLevel > difficultyLevel) {
      setDifficultyLevel(newLevel);
      
      // Increase pipe speed
      setPipeSpeed(INITIAL_PIPE_SPEED + (newLevel - 1) * SPEED_INCREMENT);
      
      // Decrease pipe gap, but don't make it too small
      const newGap = Math.max(
        INITIAL_PIPE_GAP - (newLevel - 1) * GAP_DECREMENT, 
        100 // Minimum pipe gap
      );
      setPipeGap(newGap);
    }
  }, [score, difficultyLevel]);
  
  // Control background music based on game state
  useEffect(() => {
    const music = backgroundMusicRef.current;
    if (!music) return;
    
    // Only play during active gameplay
    if (isActive && gameStarted && !gameOver && !isPaused) {
      // Try to play the music - this may fail if the user hasn't interacted with the page yet
      try {
        const playPromise = music.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Auto-play was prevented - we'll rely on user interaction to start
            console.error("Audio autoplay prevented:", error);
          });
        }
        
        console.log("Attempting to play music, current time:", music.currentTime);
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    } else {
      // Stop music if game is not active
      try {
        music.pause();
      } catch (error) {
        console.error("Error pausing audio:", error);
      }
    }
    
    return () => {
      // Clean up on unmount or when deps change
      try {
        music.pause();
      } catch (error) {
        console.error("Error cleaning up audio:", error);
      }
    };
  }, [isActive, gameStarted, gameOver, isPaused]);
  
  // Handle keyboard and touch controls
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else {
          if (!gameStarted) {
            setGameStarted(true);
            // Try to start music when game starts via user interaction
            if (backgroundMusicRef.current) {
              backgroundMusicRef.current.play().catch(e => console.log("Couldn't play audio:", e));
            }
          }
          // Jump
          setPlayer(prev => ({
            ...prev,
            velocity: JUMP_FORCE
          }));
        }
      }
      
      if (e.key === 'p' || e.key === 'P') {
        if (gameStarted && !gameOver) {
          setIsPaused(prev => !prev);
        }
      }
      
      if (e.key === 'Escape') {
        // Stop music before closing
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.pause();
          backgroundMusicRef.current.currentTime = 0;
        }
        onClose();
      }
    };
    
    // Handle click/tap jump
    const handleClick = () => {
      if (gameOver) {
        resetGame();
      } else {
        if (!gameStarted) {
          setGameStarted(true);
          // Try to start music when game starts via user interaction
          if (backgroundMusicRef.current) {
            backgroundMusicRef.current.play().catch(e => console.log("Couldn't play audio:", e));
          }
        }
        // Jump
        setPlayer(prev => ({
          ...prev,
          velocity: JUMP_FORCE
        }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
      }
    };
  }, [isActive, gameOver, gameStarted, resetGame, onClose]);
  
  // Check collision between player and pipes
  const checkCollision = useCallback((playerState: PlayerState, pipeState: PipeState) => {
    // Make the hitbox even smaller (more forgiving)
    const playerHitboxSize = PLAYER_SIZE * 0.6;  // Reduce collision area to 60% of visual size
    const playerHitboxOffset = (PLAYER_SIZE - playerHitboxSize) / 2;
    
    // Fix the collision calculation to be more accurate
    const playerLeft = playerState.x + playerHitboxOffset;
    const playerRight = playerState.x + PLAYER_SIZE - playerHitboxOffset;
    const playerTop = playerState.y + playerHitboxOffset;
    const playerBottom = playerState.y + PLAYER_SIZE - playerHitboxOffset;
    
    // Add buffer to pipe collision boxes to match visual appearance
    const pipeCollisionBuffer = 10; // pixels inward from visual edge
    const pipeLeft = pipeState.x + pipeCollisionBuffer;
    const pipeRight = pipeState.x + PIPE_WIDTH - pipeCollisionBuffer;
    
    // Check if player is horizontally within pipe
    if (playerRight > pipeLeft && playerLeft < pipeRight) {
      // Check if player is hitting top pipe - add a small buffer
      if (playerTop < pipeState.topHeight - 5) {
        return true;
      }
      
      // Check if player is hitting bottom pipe - add a small buffer
      // Use the current gap value from state
      if (playerBottom > pipeState.topHeight + pipeGap + 5) {
        return true;
      }
    }
    
    // Check if player hit the ground or ceiling - add buffer to make ceiling collisions less sensitive
    if (playerBottom > GAME_HEIGHT || playerTop < 10) {
      return true;
    }
    
    return false;
  }, [pipeGap]);
  
  // Game loop - updated to use current pipeSpeed and difficulty-based gravity
  useEffect(() => {
    if (!isActive || !gameStarted || gameOver || isPaused) return;
    
    const gameLoop = () => {
      frameCountRef.current++;
      
      // Update player position with difficulty-adjusted gravity
      setPlayer(prev => {
        // Increase gravity based on difficulty level
        const difficultyGravity = GRAVITY + (difficultyLevel - 1) * GRAVITY_INCREMENT;
        const newVelocity = prev.velocity + difficultyGravity;
        const newY = prev.y + newVelocity;
        
        return {
          ...prev,
          y: newY,
          velocity: newVelocity
        };
      });
      
      // Update pipes and check collisions
      setPipes(prev => {
        // Move existing pipes - use current pipeSpeed
        const movedPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - pipeSpeed
        }));
        
        // Add new pipe at interval
        let newPipes = [...movedPipes];
        if (frameCountRef.current % PIPE_INTERVAL === 0) {
          newPipes.push(generatePipe());
        }
        
        // Remove pipes that have gone off screen
        newPipes = newPipes.filter(pipe => pipe.x > -PIPE_WIDTH);
        
        // Check if player passed a pipe
        newPipes = newPipes.map(pipe => {
          if (!pipe.passed && pipe.x + PIPE_WIDTH < player.x) {
            setScore(prev => {
              const newScore = prev + 1;
              // Update high score if necessary
              if (newScore > highScore) {
                setHighScore(newScore);
              }
              return newScore;
            });
            return { ...pipe, passed: true };
          }
          return pipe;
        });
        
        return newPipes;
      });
      
      // Improved collision check - only check if we're past the first few frames of gameplay
      if (frameCountRef.current > 30) {
        let collision = false;
        pipes.forEach(pipe => {
          if (checkCollision(player, pipe)) {
            collision = true;
          }
        });
        
        if (collision) {
          setGameOver(true);
          // Stop music on game over
          if (backgroundMusicRef.current) {
            backgroundMusicRef.current.pause();
          }
        }
      }
      
      // Continue game loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isActive, gameStarted, gameOver, isPaused, player, pipes, generatePipe, checkCollision, highScore, pipeSpeed, difficultyLevel]);
  
  // Draw pipes - updated to use current pipeGap
  const drawPipes = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    pipes.forEach(pipe => {
      // Draw top pipe
      if (pipeImageRef.current && pipeImageRef.current.complete) {
        // Get natural dimensions of the pipe image
        const pipeNaturalWidth = pipeImageRef.current.naturalWidth;
        const pipeNaturalHeight = pipeImageRef.current.naturalHeight;
        
        // Calculate aspect ratio of the pipe image
        const pipeAspectRatio = pipeNaturalHeight / pipeNaturalWidth;
        
        // Maintain aspect ratio when drawing the pipe
        const pipeVisualHeight = pipe.topHeight;
        const pipeVisualWidth = PIPE_WIDTH;
        
        // Draw top pipe (flipped)
        ctx.save();
        ctx.translate(pipe.x + pipeVisualWidth / 2, pipe.topHeight / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(
          pipeImageRef.current, 
          -pipeVisualWidth / 2, 
          -pipeVisualHeight / 2, 
          pipeVisualWidth, 
          pipeVisualHeight
        );
        ctx.restore();
        
        // Draw bottom pipe - use current pipeGap
        ctx.drawImage(
          pipeImageRef.current, 
          pipe.x, 
          pipe.topHeight + pipeGap, 
          pipeVisualWidth, 
          GAME_HEIGHT - (pipe.topHeight + pipeGap)
        );
      } else {
        // Fallback if image not loaded
        ctx.fillStyle = 'rgb(0, 200, 0)';
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        // Bottom pipe - use current pipeGap
        ctx.fillRect(
          pipe.x, 
          pipe.topHeight + pipeGap, 
          PIPE_WIDTH, 
          GAME_HEIGHT - (pipe.topHeight + pipeGap)
        );
      }
    });
    ctx.restore();
  }, [pipes, pipeGap]);
  
  // Updated difficulty indicator to show more information
  const drawDifficultyIndicator = useCallback((ctx: CanvasRenderingContext2D) => {
    if (gameStarted && !gameOver && !isPaused) {
      ctx.save();
      
      // Position in top right corner
      const x = GAME_WIDTH - 10;
      const y = 40;
      
      // Create color based on difficulty level (green to yellow to red)
      const r = Math.min(255, 100 + (difficultyLevel * 15));
      const g = Math.max(100, 255 - (difficultyLevel * 15));
      const b = 50;
      const color = `rgb(${r}, ${g}, ${b})`;
      
      // Draw level indicator with glow effect that matches the difficulty color
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = color;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Level: ${difficultyLevel}`, x, y);
      
      // Show actual gap size and speed for debug/feedback (smaller text below)
      ctx.shadowBlur = 0;
      ctx.font = '14px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`Speed: ${pipeSpeed.toFixed(1)}`, x, y + 20);
      ctx.fillText(`Gap: ${pipeGap}`, x, y + 40);
      
      ctx.restore();
    }
  }, [gameStarted, gameOver, isPaused, difficultyLevel, pipeSpeed, pipeGap]);
  
  // Updated game over screen with more prominent score display
  const drawGameOverScreen = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!gameOver) return;
    
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw logo above Game Over text with proper aspect ratio
    if (logoImageRef.current && logoImageRef.current.complete) {
      // Get the natural dimensions of the logo image
      const logoNaturalWidth = logoImageRef.current.naturalWidth;
      const logoNaturalHeight = logoImageRef.current.naturalHeight;
      
      // Calculate appropriate display dimensions while maintaining aspect ratio
      const maxLogoWidth = 300;
      const logoScale = Math.min(maxLogoWidth / logoNaturalWidth, 1);
      const logoWidth = logoNaturalWidth * logoScale;
      const logoHeight = logoNaturalHeight * logoScale;
      
      // Position logo
      const logoX = GAME_WIDTH / 2 - logoWidth / 2;
      const logoY = GAME_HEIGHT * 0.15 - logoHeight / 2;
      
      // Add a dark semi-transparent panel behind the logo for better contrast
      ctx.fillStyle = 'rgba(10, 15, 40, 0.6)';
      ctx.fillRect(
        logoX - 10, 
        logoY - 10, 
        logoWidth + 20, 
        logoHeight + 20
      );
      
      // Draw logo with glow effect
      ctx.save();
      ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.drawImage(
        logoImageRef.current, 
        logoX, 
        logoY, 
        logoWidth, 
        logoHeight
      );
      ctx.restore();
    }
    
    // GAME OVER text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT * 0.28);
    
    // Create glowing container for final score
    const scoreY = GAME_HEIGHT * 0.42;
    const scoreBoxWidth = 300;
    const scoreBoxHeight = 100;
    const scoreBoxX = GAME_WIDTH / 2 - scoreBoxWidth / 2;
    
    // Animated glow for the score box
    const time = Date.now() / 1000;
    const glowSize = 10 + Math.sin(time * 2) * 5;
    
    // Score box with gradient background
    ctx.save();
    const scoreGradient = ctx.createLinearGradient(
      scoreBoxX, scoreY, 
      scoreBoxX + scoreBoxWidth, scoreY
    );
    scoreGradient.addColorStop(0, 'rgba(30, 60, 120, 0.7)');
    scoreGradient.addColorStop(0.5, 'rgba(50, 100, 180, 0.8)');
    scoreGradient.addColorStop(1, 'rgba(30, 60, 120, 0.7)');
    
    // Draw rounded rectangle for score box
    ctx.fillStyle = scoreGradient;
    ctx.shadowColor = 'rgba(100, 180, 255, 0.8)';
    ctx.shadowBlur = glowSize;
    
    // Draw rounded rectangle manually
    const radius = 10;
    ctx.beginPath();
    ctx.moveTo(scoreBoxX + radius, scoreY);
    ctx.lineTo(scoreBoxX + scoreBoxWidth - radius, scoreY);
    ctx.arcTo(scoreBoxX + scoreBoxWidth, scoreY, scoreBoxX + scoreBoxWidth, scoreY + radius, radius);
    ctx.lineTo(scoreBoxX + scoreBoxWidth, scoreY + scoreBoxHeight - radius);
    ctx.arcTo(scoreBoxX + scoreBoxWidth, scoreY + scoreBoxHeight, scoreBoxX + scoreBoxWidth - radius, scoreY + scoreBoxHeight, radius);
    ctx.lineTo(scoreBoxX + radius, scoreY + scoreBoxHeight);
    ctx.arcTo(scoreBoxX, scoreY + scoreBoxHeight, scoreBoxX, scoreY + scoreBoxHeight - radius, radius);
    ctx.lineTo(scoreBoxX, scoreY + radius);
    ctx.arcTo(scoreBoxX, scoreY, scoreBoxX + radius, scoreY, radius);
    ctx.fill();
    ctx.restore();
    
    // Display Final Score label
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FINAL SCORE', GAME_WIDTH / 2, scoreY + 30);
    
    // Display the actual score with a larger, glowing font
    ctx.shadowColor = 'rgba(100, 200, 255, 0.9)';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(`${score}`, GAME_WIDTH / 2, scoreY + 75);
    ctx.restore();
    
    // Display high score
    ctx.font = '22px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`High Score: ${highScore}`, GAME_WIDTH / 2, scoreY + scoreBoxHeight + 30);
    
    // Display the difficulty level reached
    ctx.fillStyle = 'rgba(255, 255, 160, 0.9)';
    ctx.fillText(`Highest Level: ${difficultyLevel}`, GAME_WIDTH / 2, scoreY + scoreBoxHeight + 60);
    
    // Draw restart button
    const buttonY = GAME_HEIGHT * 0.7;
    const buttonWidth = 280;
    const buttonHeight = 50;
    const buttonX = GAME_WIDTH / 2 - buttonWidth / 2;
    
    // Button background with gradient
    ctx.save();
    const buttonGradient = ctx.createLinearGradient(
      buttonX, buttonY, 
      buttonX + buttonWidth, buttonY
    );
    buttonGradient.addColorStop(0, 'rgba(40, 80, 160, 0.7)');
    buttonGradient.addColorStop(0.5, 'rgba(80, 140, 220, 0.8)');
    buttonGradient.addColorStop(1, 'rgba(40, 80, 160, 0.7)');
    
    ctx.fillStyle = buttonGradient;
    ctx.beginPath();
    ctx.moveTo(buttonX + radius, buttonY);
    ctx.lineTo(buttonX + buttonWidth - radius, buttonY);
    ctx.arcTo(buttonX + buttonWidth, buttonY, buttonX + buttonWidth, buttonY + radius, radius);
    ctx.lineTo(buttonX + buttonWidth, buttonY + buttonHeight - radius);
    ctx.arcTo(buttonX + buttonWidth, buttonY + buttonHeight, buttonX + buttonWidth - radius, buttonY + buttonHeight, radius);
    ctx.lineTo(buttonX + radius, buttonY + buttonHeight);
    ctx.arcTo(buttonX, buttonY + buttonHeight, buttonX, buttonY + buttonHeight - radius, radius);
    ctx.lineTo(buttonX, buttonY + radius);
    ctx.arcTo(buttonX, buttonY, buttonX + radius, buttonY, radius);
    ctx.fill();
    
    // Button border
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    // Draw UFO icon beside the restart text if needed
    if (playerImageRef.current && playerImageRef.current.complete) {
      ctx.drawImage(
        playerImageRef.current,
        buttonX + 20,
        buttonY + buttonHeight/2 - 15,
        30, 30
      );
    }
    
    // Button text
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click or Press Space to Restart', GAME_WIDTH / 2, buttonY + 32);
    ctx.restore();
    
    // ESC to exit text
    ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
    ctx.font = '18px sans-serif';
    ctx.fillText('ESC to Exit', GAME_WIDTH / 2, buttonY + buttonHeight + 30);
  }, [gameOver, score, highScore, difficultyLevel]);
  
  // Render game with Canvas (updated to use the new drawing functions)
  useEffect(() => {
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // If game hasn't started, focus on making a beautiful start screen
    if (!gameStarted && !gameOver) {
      // Clear canvas
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Draw starfield background
      if (backgroundImageRef.current) {
        ctx.drawImage(backgroundImageRef.current, 0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Add some twinkling stars
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * GAME_WIDTH;
          const y = Math.random() * GAME_HEIGHT;
          const size = Math.random() * 2 + 1;
          const opacity = 0.5 + Math.random() * 0.5;
          
          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else {
        // Fallback gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        bgGradient.addColorStop(0, '#000428');
        bgGradient.addColorStop(1, '#004e92');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Draw stars
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * GAME_WIDTH;
          const y = Math.random() * GAME_HEIGHT;
          const size = Math.random() * 2 + 1;
          const opacity = 0.5 + Math.random() * 0.5;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Add a semi-transparent dark overlay for better contrast
      ctx.fillStyle = 'rgba(5, 10, 35, 0.6)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Enhanced glow effect for the space atmosphere
      const centerX = GAME_WIDTH / 2;
      const centerY = GAME_HEIGHT * 0.35;
      
      // Outer glow
      const outerGlow = ctx.createRadialGradient(
        centerX, centerY, 50,
        centerX, centerY, 400
      );
      outerGlow.addColorStop(0, 'rgba(80, 120, 255, 0.25)');
      outerGlow.addColorStop(0.5, 'rgba(50, 100, 200, 0.1)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 50, 0)');
      
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Make sure the logo is the centerpiece of our start screen
      if (logoImageRef.current && logoImageRef.current.complete) {
        // Get the natural dimensions of the logo image to maintain aspect ratio
        const logoNaturalWidth = logoImageRef.current.naturalWidth;
        const logoNaturalHeight = logoImageRef.current.naturalHeight;
        
        // Calculate appropriate display dimensions while maintaining aspect ratio
        const maxLogoWidth = 400;
        const logoScale = Math.min(maxLogoWidth / logoNaturalWidth, 1);
        const logoWidth = logoNaturalWidth * logoScale;
        const logoHeight = logoNaturalHeight * logoScale;
        
        // Position logo higher up for better composition
        const logoX = GAME_WIDTH / 2 - logoWidth / 2;
        const logoY = GAME_HEIGHT * 0.22 - logoHeight / 2;
        
        // Add a dark semi-transparent panel behind the logo for better contrast
        ctx.fillStyle = 'rgba(10, 15, 40, 0.6)';
        ctx.fillRect(
          logoX - 20, 
          logoY - 20, 
          logoWidth + 40, 
          logoHeight + 40
        );
        
        // Add a subtle border to the panel
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          logoX - 20, 
          logoY - 20, 
          logoWidth + 40, 
          logoHeight + 40
        );
        
        // Add dramatic glow effect
        const time = Date.now() / 1000;
        const pulseSize = 12 + Math.sin(time * 1.5) * 6;
        
        // Draw logo with glow effect
        ctx.save();
        ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
        ctx.shadowBlur = pulseSize;
        ctx.drawImage(
          logoImageRef.current, 
          logoX, 
          logoY, 
          logoWidth, 
          logoHeight
        );
        ctx.restore();
        
        // Calculate the bottom of the logo panel for beam and button positioning
        const logoPanelBottom = logoY + logoHeight + 20;
        
        // Add a cosmic beam effect starting from just below the logo panel
        ctx.save();
        const beamGradient = ctx.createLinearGradient(
          centerX, logoPanelBottom + 50, 
          centerX, GAME_HEIGHT
        );
        beamGradient.addColorStop(0, 'rgba(100, 200, 255, 0.2)');
        beamGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.1)');
        beamGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
        
        // Adjust beam starting position to begin right after the logo panel
        const beamStartY = logoPanelBottom + 30;
        ctx.fillStyle = beamGradient;
        ctx.beginPath();
        ctx.moveTo(centerX - 120, beamStartY);
        ctx.lineTo(centerX + 120, beamStartY);
        ctx.lineTo(centerX + 220, GAME_HEIGHT);
        ctx.lineTo(centerX - 220, GAME_HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        // Create a modern, glowing button for the start text
        // Position the button right below the logo panel
        const buttonY = logoPanelBottom + 60;
        const buttonHeight = 60;
        const buttonWidth = 380;
        
        // Button background with translucent panel
        ctx.save();
        ctx.fillStyle = 'rgba(10, 20, 50, 0.7)';
        ctx.beginPath();
        const radius = 15;
        ctx.moveTo(centerX - buttonWidth/2 + radius, buttonY - buttonHeight/2);
        ctx.lineTo(centerX + buttonWidth/2 - radius, buttonY - buttonHeight/2);
        ctx.arcTo(centerX + buttonWidth/2, buttonY - buttonHeight/2, centerX + buttonWidth/2, buttonY - buttonHeight/2 + radius, radius);
        ctx.lineTo(centerX + buttonWidth/2, buttonY + buttonHeight/2 - radius);
        ctx.arcTo(centerX + buttonWidth/2, buttonY + buttonHeight/2, centerX + buttonWidth/2 - radius, buttonY + buttonHeight/2, radius);
        ctx.lineTo(centerX - buttonWidth/2 + radius, buttonY + buttonHeight/2);
        ctx.arcTo(centerX - buttonWidth/2, buttonY + buttonHeight/2, centerX - buttonWidth/2, buttonY + buttonHeight/2 - radius, radius);
        ctx.lineTo(centerX - buttonWidth/2, buttonY - buttonHeight/2 + radius);
        ctx.arcTo(centerX - buttonWidth/2, buttonY - buttonHeight/2, centerX - buttonWidth/2 + radius, buttonY - buttonHeight/2, radius);
        ctx.fill();
        
        // Button gradient overlay
        const buttonGradient = ctx.createLinearGradient(
          centerX - buttonWidth/2, buttonY - buttonHeight/2,
          centerX + buttonWidth/2, buttonY + buttonHeight/2
        );
        buttonGradient.addColorStop(0, 'rgba(30, 60, 180, 0.5)');
        buttonGradient.addColorStop(0.5, 'rgba(70, 130, 230, 0.7)');
        buttonGradient.addColorStop(1, 'rgba(30, 60, 180, 0.5)');
        
        ctx.fillStyle = buttonGradient;
        ctx.fill();
        
        // Button border glow
        ctx.strokeStyle = 'rgba(150, 220, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        
        // Draw the start text with nice text effects
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        // Keep text perfectly centered in the button
        ctx.fillText('Click or Press Space to Start', centerX, buttonY + 10);
        ctx.restore();
        
        // Draw the exit text
        ctx.save();
        ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        // Keep exit text centered horizontally and position it below the button
        ctx.fillText('ESC to Exit', centerX, buttonY + 70);
        ctx.restore();
      } else {
        // Fallback if logo isn't loaded
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FLAPPY KAIN', GAME_WIDTH / 2, GAME_HEIGHT / 3);
        
        // Add a cosmic beam effect
        ctx.save();
        const beamGradient = ctx.createLinearGradient(
          centerX, centerY + 100, 
          centerX, GAME_HEIGHT
        );
        beamGradient.addColorStop(0, 'rgba(100, 200, 255, 0.2)');
        beamGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.1)');
        beamGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
        
        // Adjust beam starting position
        const beamStartY = GAME_HEIGHT * 0.4;
        ctx.fillStyle = beamGradient;
        ctx.beginPath();
        ctx.moveTo(centerX - 120, beamStartY);
        ctx.lineTo(centerX + 120, beamStartY);
        ctx.lineTo(centerX + 220, GAME_HEIGHT);
        ctx.lineTo(centerX - 220, GAME_HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        // Create a modern, glowing button for the start text
        const buttonY = beamStartY + 60;
        const buttonHeight = 60;
        const buttonWidth = 380;
        
        // Button background with translucent panel
        ctx.save();
        ctx.fillStyle = 'rgba(10, 20, 50, 0.7)';
        ctx.beginPath();
        const radius = 15;
        ctx.moveTo(centerX - buttonWidth/2 + radius, buttonY - buttonHeight/2);
        ctx.lineTo(centerX + buttonWidth/2 - radius, buttonY - buttonHeight/2);
        ctx.arcTo(centerX + buttonWidth/2, buttonY - buttonHeight/2, centerX + buttonWidth/2, buttonY - buttonHeight/2 + radius, radius);
        ctx.lineTo(centerX + buttonWidth/2, buttonY + buttonHeight/2 - radius);
        ctx.arcTo(centerX + buttonWidth/2, buttonY + buttonHeight/2, centerX + buttonWidth/2 - radius, buttonY + buttonHeight/2, radius);
        ctx.lineTo(centerX - buttonWidth/2 + radius, buttonY + buttonHeight/2);
        ctx.arcTo(centerX - buttonWidth/2, buttonY + buttonHeight/2, centerX - buttonWidth/2, buttonY + buttonHeight/2 - radius, radius);
        ctx.lineTo(centerX - buttonWidth/2, buttonY - buttonHeight/2 + radius);
        ctx.arcTo(centerX - buttonWidth/2, buttonY - buttonHeight/2, centerX - buttonWidth/2 + radius, buttonY - buttonHeight/2, radius);
        ctx.fill();
        
        // Button gradient overlay
        const buttonGradient = ctx.createLinearGradient(
          centerX - buttonWidth/2, buttonY - buttonHeight/2,
          centerX + buttonWidth/2, buttonY + buttonHeight/2
        );
        buttonGradient.addColorStop(0, 'rgba(30, 60, 180, 0.5)');
        buttonGradient.addColorStop(0.5, 'rgba(70, 130, 230, 0.7)');
        buttonGradient.addColorStop(1, 'rgba(30, 60, 180, 0.5)');
        
        ctx.fillStyle = buttonGradient;
        ctx.fill();
        
        // Button border glow
        ctx.strokeStyle = 'rgba(150, 220, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        
        // Draw the start text with nice text effects
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click or Press Space to Start', centerX, buttonY + 10);
        ctx.restore();
        
        // Draw the exit text
        ctx.save();
        ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ESC to Exit', centerX, buttonY + 70);
        ctx.restore();
      }
      
      // No need to continue with the regular rendering
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw background
    if (backgroundImageRef.current) {
      // Create a scrolling effect for the background
      const bgOffset = (frameCountRef.current / 4) % GAME_WIDTH;
      ctx.drawImage(backgroundImageRef.current, -bgOffset, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.drawImage(backgroundImageRef.current, GAME_WIDTH - bgOffset, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
      // Fallback if image not loaded
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Draw some stars
      ctx.fillStyle = 'white';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * GAME_WIDTH;
        const y = Math.random() * GAME_HEIGHT;
        const size = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw pipes
    drawPipes(ctx);
    
    // Draw player (UFO)
    if (playerImageRef.current) {
      // Add a slight rotation based on velocity for visual effect
      const rotation = player.velocity * 0.05;
      
      ctx.save();
      ctx.translate(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2);
      ctx.rotate(rotation);
      ctx.drawImage(
        playerImageRef.current, 
        -PLAYER_SIZE / 2, 
        -PLAYER_SIZE / 2, 
        PLAYER_SIZE, 
        PLAYER_SIZE
      );
      ctx.restore();
    } else {
      // Fallback if image not loaded
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.ellipse(
        player.x + PLAYER_SIZE / 2, 
        player.y + PLAYER_SIZE / 2, 
        PLAYER_SIZE / 2, 
        PLAYER_SIZE / 3, 
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(score.toString(), GAME_WIDTH / 2, 80);
    
    // Draw difficulty indicator
    drawDifficultyIndicator(ctx);
    
    // Draw game over screen
    if (gameOver) {
      drawGameOverScreen(ctx);
    }
    
    // Draw pause screen
    if (isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2);
      
      ctx.font = '24px sans-serif';
      ctx.fillText('Press P to Resume', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    }
    
    // Request next frame render
    requestAnimationFrame(() => {
      if (isActive) {
        // Don't request new frame if component is not active
        requestAnimationFrame(() => {});
      }
    });
  }, [isActive, player, pipes, gameStarted, gameOver, isPaused, score, highScore, difficultyLevel, drawPipes, drawDifficultyIndicator, drawGameOverScreen]);
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center w-full h-full py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative overflow-hidden border-2 border-purple-700 rounded-md shadow-lg w-full max-w-[90vw] h-[85vh] flex items-center justify-center">
        {/* The game canvas */}
        <canvas 
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="bg-black h-auto max-h-full w-auto max-w-full object-contain"
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-400 flex flex-wrap justify-center gap-4">
        <span>Space/ArrowUp/Click to jump</span>
        <span>P: Pause</span>
        <span>ESC: Close</span>
      </div>
    </motion.div>
  );
};

export default FlappyKainEasterEgg; 