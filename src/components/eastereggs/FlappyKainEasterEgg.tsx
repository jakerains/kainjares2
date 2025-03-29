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
const PIPE_GAP = 200;
const PIPE_SPEED = 3;
const PIPE_INTERVAL = 120; // frames between new pipe pairs
const PLAYER_SIZE = 80;

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
  
  const gameLoopRef = useRef<number>();
  const frameCountRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
  
  // Game reset function
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
    const maxTopHeight = GAME_HEIGHT - PIPE_GAP - 50;
    const topHeight = Math.floor(Math.random() * (maxTopHeight - minTopHeight + 1)) + minTopHeight;
    
    return {
      x: GAME_WIDTH,
      topHeight,
      id: Date.now(),
      passed: false
    };
  }, []);
  
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
      if (playerBottom > pipeState.topHeight + PIPE_GAP + 5) {
        return true;
      }
    }
    
    // Check if player hit the ground or ceiling - add buffer to make ceiling collisions less sensitive
    if (playerBottom > GAME_HEIGHT || playerTop < 10) {
      return true;
    }
    
    return false;
  }, []);
  
  // Game loop using requestAnimationFrame
  useEffect(() => {
    if (!isActive || !gameStarted || gameOver || isPaused) return;
    
    const gameLoop = () => {
      frameCountRef.current++;
      
      // Update player position
      setPlayer(prev => {
        const newVelocity = prev.velocity + GRAVITY;
        const newY = prev.y + newVelocity;
        
        return {
          ...prev,
          y: newY,
          velocity: newVelocity
        };
      });
      
      // Update pipes and check collisions
      setPipes(prev => {
        // Move existing pipes
        const movedPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED
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
      // This helps prevent accidental game over at the start
      if (frameCountRef.current > 30) {
        let collision = false;
        pipes.forEach(pipe => {
          if (checkCollision(player, pipe)) {
            collision = true;
          }
        });
        
        if (collision) {
          setGameOver(true);
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
  }, [isActive, gameStarted, gameOver, isPaused, player, pipes, generatePipe, checkCollision, highScore]);
  
  // Render game with Canvas
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
    
    // If game has started, use the normal rendering code
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
        
        // Draw bottom pipe
        ctx.drawImage(
          pipeImageRef.current, 
          pipe.x, 
          pipe.topHeight + PIPE_GAP, 
          pipeVisualWidth, 
          GAME_HEIGHT - (pipe.topHeight + PIPE_GAP)
        );
      } else {
        // Fallback if image not loaded
        ctx.fillStyle = 'rgb(0, 200, 0)';
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(
          pipe.x, 
          pipe.topHeight + PIPE_GAP, 
          PIPE_WIDTH, 
          GAME_HEIGHT - (pipe.topHeight + PIPE_GAP)
        );
      }
    });
    ctx.restore();
    
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
    
    // Draw game over screen
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
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
        const logoY = GAME_HEIGHT / 4 - logoHeight / 2;
        
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
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 3 + 60);
      
      ctx.font = '24px sans-serif';
      ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
      ctx.fillText(`High Score: ${highScore}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
      
      // Draw UFO icon beside the restart text
      if (playerImageRef.current && playerImageRef.current.complete) {
        ctx.drawImage(
          playerImageRef.current,
          GAME_WIDTH / 2 - 160,
          GAME_HEIGHT / 2 + 78,
          30,
          30
        );
      }
      
      ctx.fillText('Click or Press Space to Restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
      ctx.fillText('ESC to Exit', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120);
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
  }, [isActive, player, pipes, gameStarted, gameOver, isPaused, score, highScore]);
  
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