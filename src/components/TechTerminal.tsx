import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MatrixEasterEgg, PacmanEasterEgg, CoffeeEasterEgg, SnakeEasterEgg, AsciiAquarium, SimpleAquarium, RickRollEasterEgg, FlappyKainEasterEgg } from './eastereggs';
import { useNavigate } from 'react-router-dom';
import { useCommands } from '../context/CommandContext';
import { supabase } from '../lib/supabase';

interface WindowControl {
  color: string;
  hoverColor: string;
  icon?: string;
  action: () => void;
}

interface TechTerminalProps {
  messages: string[];
  typingSpeed?: number;
  className?: string;
  isFullPage?: boolean;
}

interface TerminalEntry {
  isCommand: boolean;
  text: string;
  isMatrix?: boolean;
  isHitchhiker?: boolean;
  isSnake?: boolean;
  isCoffee?: boolean;
  isPacman?: boolean;
  isRickRoll?: boolean;
  isTypewriter?: boolean;
  isFlappyKain?: boolean;
}

// Matrix character for falling animation
interface MatrixChar {
  char: string;
  x: number;
  y: number;
  speed: number;
  opacity: number;
  color: string;
}

const TechTerminal = ({ 
  messages, 
  typingSpeed = 40,
  className = '',
  isFullPage = false
}: TechTerminalProps) => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isInitialAnimationComplete, setIsInitialAnimationComplete] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const terminalContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Matrix animation states
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [isPacmanActive, setIsPacmanActive] = useState(false);
  const [isCoffeeActive, setIsCoffeeActive] = useState(false);
  const [isSnakeActive, setIsSnakeActive] = useState(false);
  const [isRickRollActive, setIsRickRollActive] = useState(false);
  const [isFlappyKainActive, setIsFlappyKainActive] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherData, setWeatherData] = useState<string>('');
  const [terminalTheme, setTerminalTheme] = useState<string>('default');
  const [isAsciiAquarium, setIsAsciiAquarium] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [isCommandProcessing, setIsCommandProcessing] = useState(false);
  const [showEasterEggs, setShowEasterEggs] = useState(false);
  
  // Add state for sticker form
  const [isStickerFormActive, setIsStickerFormActive] = useState(false);
  const [stickerFormStep, setStickerFormStep] = useState(0);
  const [stickerFormData, setStickerFormData] = useState<{
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [stickerFormComplete, setStickerFormComplete] = useState(false);
  
  // Add state for hacking mode
  const [isHacking, setIsHacking] = useState(false);
  const [hackProgress, setHackProgress] = useState(0);
  const [hackTarget, setHackTarget] = useState('');
  const [hackMessages, setHackMessages] = useState<string[]>([]);
  
  const [isJokeLoading, setIsJokeLoading] = useState(false);
  const [joke, setJoke] = useState<string>('');
  
  // Additional state for file system
  const [currentDirectory, setCurrentDirectory] = useState('/home/alien');
  const [aliases, setAliases] = useState<{[key: string]: string}>({
    'documents': 'Documents',
    'pics': 'Pictures',
    'pictures': 'Pictures',
    'img': 'Pictures',
    'images': 'Pictures',
    'photo': 'Pictures',
    'photos': 'Pictures',
    'downloads': 'Downloads', // Will add this directory
    'music': 'Music',  // Will add this directory
    'videos': 'Videos' // Will add this directory
  });
  const [virtualFileSystem, setVirtualFileSystem] = useState<{[path: string]: string[]}>({
    '/home/alien': [
      'Documents/',
      'Pictures/',
      'Downloads/',
      'Music/',
      'Videos/',
      'secret-plans.txt',
      'earth-invasion.md',
      'human-analysis.pdf',
      'cat-pictures.jpg'
    ],
    '/home/alien/Documents': [
      'project-x.txt',
      'quantum-physics.pdf',
      'teleportation-formulas.xlsx',
      'TODO.md'
    ],
    '/home/alien/Pictures': [
      'earth.jpg',
      'mars-vacation.png',
      'me-with-humans.jpg',
      'ufo-selfie.png'
    ],
    '/home/alien/Downloads': [
      'human-music.mp3',
      'earth-map.png',
      'secret-signals.wav'
    ],
    '/home/alien/Music': [
      'space-beats.mp3',
      'galactic-symphony.wav',
      'alien-pop-hits/'
    ],
    '/home/alien/Videos': [
      'earth-vacation.mp4',
      'abduction-techniques.mov',
      'funny-humans.mp4'
    ],
    '/home/alien/Music/alien-pop-hits': [
      'flying-saucer-groove.mp3',
      'cosmic-bop.wav',
      'mars-attack-remix.mp3'
    ]
  });
  
  // Add virtual file contents
  const [virtualFileContents, setVirtualFileContents] = useState<{[path: string]: string}>({
    '/home/alien/secret-plans.txt': 
`TOP SECRET - ALIEN EYES ONLY
===============================
Phase 1: Collect data on human behaviors ✓
Phase 2: Infiltrate social media platforms ✓
Phase 3: Introduce advanced technology slowly
Phase 4: Begin diplomatic relations
Phase 5: ???
Phase 6: Universal peace and prosperity

Note: Humans are surprisingly fond of cats and pizza.
We should utilize this in our approach.`,

    '/home/alien/earth-invasion.md':
`# Earth Visitation Protocol

**NOT AN INVASION PLAN**

1. Land only in remote areas or at night
2. Avoid military installations
3. If spotted, pose as weather balloons
4. Crop circles are NO LONGER authorized (too obvious)
5. Preferred contact method: dreams and/or TikTok

Remember: We come in peace! 👽✌️`,

    '/home/alien/human-analysis.pdf':
`HUMAN ANALYSIS REPORT
=====================

Humans appear to be bipedal carbon-based lifeforms with interesting contradictions:

- They love nature yet destroy it
- They create amazing art and terrible weapons
- They spend 1/3 of their lives unconscious ("sleeping")
- They enjoy watching others pretend to be different humans ("acting")
- Many worship small furry creatures called "cats"

Recommendation: Continue observation. Humans are confusing but fascinating.`,

    '/home/alien/Documents/project-x.txt':
`PROJECT X - ANTI-GRAVITY IMPLEMENTATION

Materials needed:
- Quantum flux capacitor
- Dark matter stabilizer
- Really strong magnets

Testing shows humans are not ready for this technology.
They still think dropping things is inevitable.`,

    '/home/alien/Documents/TODO.md':
`# To-Do List

- [x] Repair cloaking device
- [ ] Recharge quantum batteries
- [ ] Call home (intergalactic roaming charges apply)
- [ ] Study more human jokes
- [ ] Try this "coffee" substance
- [ ] Update Earth observation report
- [ ] Find out why humans say "Cool beans" when no refrigerated legumes are present`,

    '/home/alien/Pictures/earth.jpg': '[IMAGE: Beautiful blue planet with interesting bipedal inhabitants]',
    '/home/alien/Pictures/me-with-humans.jpg': '[IMAGE: Alien poorly disguised as human with unsuspecting actual humans]'
  });
  
  const windowControls: WindowControl[] = [
    {
      color: 'bg-red-500',
      hoverColor: 'bg-red-600',
      icon: '×',
      action: () => {
        if (isFullPage) {
          // If in full page mode, navigate back to home page
          navigate('/');
        } else {
          // Otherwise, minimize
          setIsMinimized(true);
        }
      }
    },
    {
      color: 'bg-yellow-500',
      hoverColor: 'bg-yellow-600',
      icon: '−',
      action: () => setIsMinimized(prev => !prev)
    },
    {
      color: 'bg-green-500',
      hoverColor: 'bg-green-600',
      icon: '＋',
      action: () => {
        // Navigate to full terminal page instead of toggling fullscreen
        if (!isFullPage) {
          navigate('/terminal');
        }
        // Do nothing if already on terminal page
      }
    }
  ];
  
  // Add a state for matrix transition animation
  const [isMatrixTransitioning, setIsMatrixTransitioning] = useState(false);
  
  const { isCommandEnabled, getEnabledCommands, isLoading } = useCommands();
  const [localEnabledCommands, setLocalEnabledCommands] = useState<any[]>([]);
  
  // Load enabled commands when they're available
  useEffect(() => {
    if (!isLoading) {
      const commands = getEnabledCommands();
      setLocalEnabledCommands(commands);
    }
  }, [isLoading, getEnabledCommands]);
  
  useEffect(() => {
    // Reset displayed text when messages change
    setDisplayedText('');
    setCurrentMessageIndex(0);
    setIsInitialAnimationComplete(false);
    setTerminalEntries([]);
  }, [messages]);
  
  useEffect(() => {
    // Exit immediately if animation is already complete
    if (isInitialAnimationComplete) {
      return;
    }
    
    if (currentMessageIndex >= messages.length) {
        setIsInitialAnimationComplete(true);
      return;
    }
    
    // Skip animation if user starts typing
    if (isUserTyping && !isInitialAnimationComplete) {
      // Display all remaining messages at once
      const remainingMessages = messages.slice(currentMessageIndex);
      setTerminalEntries(prev => [
        ...prev,
        ...remainingMessages.map(msg => ({ isCommand: false, text: msg }))
      ]);
      setIsInitialAnimationComplete(true);
      return;
    }
    
    // Continue text animation
    const currentMessage = messages[currentMessageIndex];
    if (displayedText.length < currentMessage.length) {
      const timer = setTimeout(() => {
        // Check if animation is complete again before updating
        if (!isInitialAnimationComplete) {
        setDisplayedText(currentMessage.substring(0, displayedText.length + 1));
        }
      }, typingSpeed);
      
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        // Check if animation is complete again before updating
        if (!isInitialAnimationComplete) {
        setCurrentMessageIndex(prevIndex => prevIndex + 1);
        setDisplayedText('');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, displayedText, messages, typingSpeed, isInitialAnimationComplete, isUserTyping]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Ensure scrolling to bottom when content changes
  useEffect(() => {
    if (terminalContentRef.current) {
      // Use a small delay to ensure DOM is updated
      setTimeout(() => {
        if (terminalContentRef.current) {
          terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
        }
      }, 10);
    }
  }, [displayedText, terminalEntries, currentMessageIndex]);

  // Focus the input when initial animation completes
  useEffect(() => {
    if (isInitialAnimationComplete && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInitialAnimationComplete]);

  const handleTerminalClick = useCallback((e: React.MouseEvent) => {
    // If the animation is already complete, just focus the input
    if (isInitialAnimationComplete || isMatrixActive) {
    if (inputRef.current && !isMatrixActive) {
        inputRef.current.focus();
      }
      return;
    }
    
    // Otherwise, skip the animation
    console.log("Skipping animation...");
    
    // Force immediate completion of the animation
    setCurrentMessageIndex(messages.length);
    setDisplayedText('');
    
    // Show all initial messages at once
    setTerminalEntries([
      ...messages.map(msg => ({ isCommand: false, text: msg }))
    ]);
    
    // Mark animation as complete
    setIsInitialAnimationComplete(true);
    
    // Focus the input
    setTimeout(() => {
      if (inputRef.current) {
      inputRef.current.focus();
    }
    }, 10);
  }, [isInitialAnimationComplete, isMatrixActive, messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInitialAnimationComplete) {
      setIsUserTyping(true);
    }
    setInputValue(e.target.value);
  };

  // Function to fetch real weather data
  const fetchWeatherData = async (city: string) => {
    try {
      setIsWeatherLoading(true);
      
      // Generate realistic weather data based on location and current date
      const generateWeather = (location: string) => {
        // Use the city name as a seed for the random weather generation
        // This way the same city will get similar weather on multiple requests
        const cityHash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const pseudoRandom = (seed: number) => (Math.sin(seed) * 10000) % 1;
        
        // Get the current date components for more realistic weather patterns
        const now = new Date();
        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
        const seasonModifier = Math.sin((dayOfYear / 365) * Math.PI * 2); // -1 to 1 depending on season
        
        // Generate weather parameters based on city "seed" and date
        let baseTemp = 15 + seasonModifier * 15; // Base temperature varies by season
        baseTemp += pseudoRandom(cityHash) * 10 - 5; // City-based adjustment
        const temp = Math.round(baseTemp);
        const feelsLike = Math.round(temp + (pseudoRandom(cityHash * 2) * 4 - 2));
        
        // Humidity based on temperature and random factor
        const humidity = Math.round(60 + pseudoRandom(cityHash * 3) * 30);
        
        // Wind speed with some randomness
        const windSpeed = (2 + pseudoRandom(cityHash * 4) * 8).toFixed(1);
        
        // Conditions based on the temperature and random factor
        const conditions = [
          "Clear sky", "Sunny", "Partly cloudy", 
          "Cloudy", "Overcast", "Light rain", 
          "Moderate rain", "Heavy rain", "Thunderstorm", 
          "Snow", "Mist", "Fog"
        ];
        
        // Weight conditions based on temperature and random factor
        let conditionIndex;
        if (temp > 25) {
          // Hot weather - more likely to be clear/sunny/partly cloudy
          conditionIndex = Math.floor(pseudoRandom(cityHash * 5) * 4);
        } else if (temp < 5) {
          // Cold weather - more likely to be cloudy/snow/mist
          conditionIndex = Math.floor(7 + pseudoRandom(cityHash * 5) * 5);
        } else {
          // Moderate temperatures - could be anything
          conditionIndex = Math.floor(pseudoRandom(cityHash * 5) * conditions.length);
        }
        
        const condition = conditions[conditionIndex];
        
        // Sunrise and sunset based on season
        const sunrise = new Date(now);
        const sunset = new Date(now);
        
        // Winter has later sunrise, earlier sunset
        // Summer has earlier sunrise, later sunset
        const dayLengthModifier = (seasonModifier + 1) / 2; // 0 to 1, 0 = winter, 1 = summer
        
        sunrise.setHours(7 - Math.floor(dayLengthModifier * 2));
        sunrise.setMinutes(Math.floor(pseudoRandom(cityHash * 6) * 60));
        
        sunset.setHours(17 + Math.floor(dayLengthModifier * 2));
        sunset.setMinutes(Math.floor(pseudoRandom(cityHash * 7) * 60));
        
        // Determine country based on city name - very simplistic approach
        const countries = ["USA", "Canada", "UK", "Australia", "Germany", "Japan", "Brazil", "France", "India", "Russia"];
        const countryIndex = Math.floor(pseudoRandom(cityHash * 8) * countries.length);
        const country = countries[countryIndex];
        
        // Get local time with offset based on country
        const timeOffsets = [-8, -5, 0, 10, 1, 9, -3, 1, 5.5, 3]; // Approximate time zone offsets
        const localTime = new Date(now);
        localTime.setHours(localTime.getHours() + Math.floor(timeOffsets[countryIndex]) - now.getTimezoneOffset() / 60);
        
        // Format the weather data
        return `Weather for ${location}, ${country}:
🌡️ Temperature: ${temp}°C / ${Math.round(temp * 9/5 + 32)}°F
🔥 Feels like: ${feelsLike}°C
☁️ Conditions: ${condition}
💧 Humidity: ${humidity}%
🌬️ Wind: ${windSpeed} m/s
🌅 Sunrise: ${sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
🌇 Sunset: ${sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
⏰ Local time: ${localTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', weekday: 'short', month: 'short', day: 'numeric'})}`;
      };

      try {
        // Use WeatherAPI
        const weatherApiKey = '53f6a47cd9684862a0c55002211005'; // WeatherAPI key
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&aqi=no`
        );
        
        if (response.ok) {
          const data = await response.json();
          const location = data.location;
          const current = data.current;
          
          // Create location string with state/region if available
          const locationString = location.region 
            ? `${location.name}, ${location.region}, ${location.country}`
            : `${location.name}, ${location.country}`;
          
          const formattedWeather = `Weather for ${locationString}:
🌡️ Temperature: ${Math.round(current.temp_c)}°C / ${Math.round(current.temp_f)}°F
🔥 Feels like: ${Math.round(current.feelslike_c)}°C
☁️ Conditions: ${current.condition.text}
💧 Humidity: ${current.humidity}%
🌬️ Wind: ${current.wind_kph} km/h (${current.wind_mph} mph)
💨 Wind direction: ${current.wind_dir}
☔️ Precipitation: ${current.precip_mm} mm
🌡️ Pressure: ${current.pressure_mb} mb
👁️ Visibility: ${current.vis_km} km
⏰ Local time: ${location.localtime}`;
          
          // Add the weather data directly to terminal entries instead of setting it separately
          setTerminalEntries(prev => [
            ...prev, 
            { 
              isCommand: false, 
              text: `🌍 Weather Report\n${formattedWeather}`
            }
          ]);
          setShowWeather(false);
          setIsWeatherLoading(false);
          return;
        }
        
        // Fallback to generated data
        throw new Error('API unavailable');
      } catch (apiError) {
        console.warn('Weather API error, using generated data:', apiError);
        // Use the enhanced generated weather data
        const generatedWeather = generateWeather(city);
        setTerminalEntries(prev => [
          ...prev, 
          { 
            isCommand: false, 
            text: `🌍 Weather Report\n${generatedWeather}`
          }
        ]);
        setShowWeather(false);
      }
    } catch (error) {
      console.error('Error in weather function:', error);
      setTerminalEntries(prev => [
        ...prev, 
        { 
          isCommand: false, 
          text: `Could not fetch weather for "${city}". Please check spelling or try another city.`
        }
      ]);
      setShowWeather(false);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // Function to fetch a joke
  const fetchJoke = async () => {
    try {
      setIsJokeLoading(true);
      // Simulated joke fetch with delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get a random joke
      const jokes = [
        "Why don't aliens visit Earth? Terrible reviews. One star.",
        "Why did the alien go to the party? To get a little space.",
        "How do aliens organize a party? They planet.",
        "What kind of music do planets listen to? Nep-tunes.",
        "Why don't aliens eat clowns? Because they taste funny.",
        "How does an alien make tea? With a unidenti-fried object."
      ];
      
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      setJoke(randomJoke);
    } catch (error) {
      console.error('Error fetching joke:', error);
      setJoke("Error: Humor module malfunction. Please laugh anyway.");
    } finally {
      setIsJokeLoading(false);
    }
  };

  const getCommandResponse = async (command: string): Promise<string> => {
    // Extract command and args
    const parts = command.toLowerCase().trim().split(' ');
    const mainCommand = parts[0];
    const args = parts.slice(1);
    
    // Check if command is enabled
    if (!isCommandEnabled(mainCommand) && mainCommand !== 'help' && mainCommand !== 'flappykain') {
      return `Command not found: ${mainCommand}. Type 'help' to see available commands.`;
    }
    
    // Easter egg commands
    switch (mainCommand) {
      case 'matrix':
        closeAllEasterEggs();
        setTerminalEntries(prev => [
          ...prev,
          { isCommand: false, text: "Follow the White Rabbit 🐰", isMatrix: true }
        ]);
        setIsMatrixTransitioning(true);
        setTimeout(() => {
          setIsMatrixActive(true);
          setIsMatrixTransitioning(false);
        }, 1500);
        return "";
      case 'pacman':
        closeAllEasterEggs();
        setTerminalEntries(prev => [
          ...prev,
          { isCommand: false, text: "Loading Pac-Man...", isPacman: true }
        ]);
        setIsPacmanActive(true);
        return "";
      case 'coffee':
        closeAllEasterEggs();
        setTerminalEntries(prev => [
          ...prev,
          { isCommand: false, text: "Brewing coffee ☕", isCoffee: true }
        ]);
        return "";
      case 'sticker':
        closeAllEasterEggs();
        if (stickerFormComplete) {
          return "You've already claimed your free sticker! One per customer. Thank you!";
        }
        
        // If not in full-screen mode, redirect to terminal page
        if (!isFullPage) {
          navigate('/terminal');
          return "Redirecting to secure terminal environment...";
        }
        
        // Create a flashy transition effect
        const terminalElement = terminalContentRef.current;
        if (terminalElement) {
          // Add a quick flash animation
          terminalElement.classList.add('terminal-flash');
          
          // Remove the class after animation completes
          setTimeout(() => {
            terminalElement.classList.remove('terminal-flash');
            // Activate sticker form with typing effect
            setIsStickerFormActive(true);
            setStickerFormStep(0);
          }, 500);
        } else {
          // Fallback if ref not available
          setIsStickerFormActive(true);
          setStickerFormStep(0);
        }
        
        // Start with a dramatic "secret code found" animation
        return `
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░██╗░░░██╗███████╗██████╗░██╗███████╗██╗░░░░░░
░░██║░░░██║██╔════╝██╔══██╗██║██╔════╝██║░░░░░░
░░╚██╗░██╔╝█████╗░░██████╔╝██║█████╗░░██║░░░░░░
░░░╚████╔╝░██╔══╝░░██╔══██╗██║██╔══╝░░██║░░░░░░
░░░░╚██╔╝░░███████╗██║░░██║██║██║░░░░░███████╗░
░░░░░╚═╝░░░╚══════╝╚═╝░░╚═╝╚═╝╚═╝░░░░░╚══════╝░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
          
🎉 SECRET CODE FOUND 🎉

>> INITIALIZING SECURE PROTOCOL <<
>> ESTABLISHING ENCRYPTED CONNECTION <<
>> VERIFICATION COMPLETE <<

You've discovered a hidden terminal command!
As a reward, you've been selected to receive a FREE sticker.

> Initiating collection sequence...
> Please stand by...

What is your name?`;
      case 'snake':
        closeAllEasterEggs();
        // We'll handle this in the main handler
        return "";
      case 'rickroll':
        closeAllEasterEggs();
        setTerminalEntries(prev => [
          ...prev,
          { isCommand: false, text: "Loading something special...", isRickRoll: true }
        ]);
        setIsRickRollActive(true);
        return "";
      case 'eastereggtoggle':
        const newValue = !showEasterEggs;
        setShowEasterEggs(newValue);
        setTerminalEntries(prev => [
          ...prev,
          { 
            isCommand: false, 
            text: `Easter egg commands are now ${newValue ? 'visible' : 'hidden'} in help menu.`
          }
        ]);
        return `Easter egg commands are now ${newValue ? 'visible' : 'hidden'} in help menu.`;
      case 'help':
        // Generate the help menu dynamically based on enabled commands
        return buildHelpMenu();
      case 'clear':
        // Execute clear terminal immediately
        clearTerminal();
        return "";
      case 'echo':
        return args.join(' ') || "Echo...echo...echo...";
      case 'whoami':
        return "alien-visitor@quantum-nexus";
      case 'date':
        return new Date().toString();
      case 'ls':
        const directory = args.length > 0 ? args[0] : '';
        let path = currentDirectory;
        
        // Handle path arguments
        if (directory) {
          // Try to resolve directory alias first
          let targetDir = directory;
          const resolvedDir = resolveAlias(targetDir);
          if (resolvedDir !== targetDir) {
            console.log('LS: Resolved alias', targetDir, 'to', resolvedDir);
            targetDir = resolvedDir;
          }
          
          if (targetDir.startsWith('/')) {
            // Absolute path
            path = targetDir;
          } else if (targetDir === '..') {
            // Go up one directory
            const pathParts = currentDirectory.split('/');
            if (pathParts.length > 2) { // Don't go above /home/alien
              pathParts.pop();
              path = pathParts.join('/');
            }
          } else if (targetDir === '~') {
            // Home shorthand
            path = '/home/alien';
          } else if (targetDir.startsWith('~/')) {
            // Path relative to home
            path = `/home/alien/${targetDir.substring(2)}`;
          } else {
            // Check if the directory exists with case-insensitive search
            const availableDirs = virtualFileSystem[currentDirectory] || [];
            
            // Try to find the directory with case-insensitive matching
            let foundDir = availableDirs.find(
              item => item.endsWith('/') && 
                      item.slice(0, -1).toLowerCase() === targetDir.toLowerCase()
            );
            
            // If not found, try partial matching
            if (!foundDir) {
              foundDir = availableDirs.find(
                item => item.endsWith('/') && 
                        item.toLowerCase().startsWith(targetDir.toLowerCase())
              );
            }
            
            if (foundDir) {
              // Use exact directory name with correct case
              const actualDirName = foundDir.slice(0, -1);
              path = `${currentDirectory}/${actualDirName}`;
            } else {
              // Fall back to original behavior
              path = `${currentDirectory}/${targetDir}`;
            }
          }
        }
        
        // Clean up path - replace any double slashes
        path = path.replace(/\/\//g, '/');
        
        // Try case-insensitive path lookup for the final path
        let lsExactPath = path;
        if (virtualFileSystem[path] === undefined) {
          // Try to find a case-insensitive match
          const lowerCasePath = path.toLowerCase();
          const possibleMatch = Object.keys(virtualFileSystem).find(
            key => key.toLowerCase() === lowerCasePath
          );
          
          if (possibleMatch) {
            console.log('LS: Found case-insensitive path match:', possibleMatch);
            lsExactPath = possibleMatch;
          } else {
            return `ls: cannot access '${directory}': No such file or directory`;
          }
        }
        
        // Format the file listing with dates and permissions
        const now = new Date();
        const files = virtualFileSystem[lsExactPath].map(file => {
          const isDirectory = file.endsWith('/');
          const date = new Date(now);
          date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date within last month
          
          const permissions = isDirectory ? 'drwxr-xr-x' : '-rw-r--r--';
          const size = isDirectory ? 4096 : Math.floor(Math.random() * 10000);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          
          return `${permissions} alien alien ${size.toString().padStart(6, ' ')} ${dateStr} ${file}`;
        });
        
        return `total ${files.length}\n${files.join('\n')}`;
      case 'cd':
        console.log('CD command executed with args:', args);
        
        if (args.length === 0) {
          // cd without args goes to home
          console.log('CD: Going to home directory');
          setCurrentDirectory('/home/alien');
          return 'Changed directory to: /home/alien';
        }
        
        let targetDir = args[0];
        let newPath = currentDirectory;
        console.log('CD: Current directory:', currentDirectory);
        console.log('CD: Target directory:', targetDir);
        
        // Try to resolve directory alias first
        const resolvedDir = resolveAlias(targetDir);
        if (resolvedDir !== targetDir) {
          console.log('CD: Resolved alias', targetDir, 'to', resolvedDir);
          targetDir = resolvedDir;
        }
        
        if (targetDir === '..') {
          // Go up one directory
          console.log('CD: Going up one directory');
          const pathParts = currentDirectory.split('/');
          if (pathParts.length > 2) { // Don't go above /home/alien
            pathParts.pop();
            newPath = pathParts.join('/');
            console.log('CD: New path after going up:', newPath);
          } else {
            console.log('CD: Already at root, cannot go up');
          }
        } else if (targetDir.startsWith('/')) {
          // Absolute path
          console.log('CD: Using absolute path');
          newPath = targetDir;
        } else if (targetDir === '~') {
          // Home directory shorthand
          console.log('CD: Going to home directory via ~');
          newPath = '/home/alien';
        } else if (targetDir.startsWith('~/')) {
          // Path relative to home
          console.log('CD: Using path relative to home');
          newPath = `/home/alien/${targetDir.substring(2)}`;
        } else {
          // Relative path - check if it exists in current directory
          const possiblePath = `${currentDirectory}/${targetDir.replace(/\/$/, '')}`;
          console.log('CD: Possible path:', possiblePath);
          
          // Debug the virtual file system
          console.log('CD: Virtual file system entries for current dir:', 
            virtualFileSystem[currentDirectory] || 'No entries found');
          
          // Check if any directory in the current directory matches the target
          const availableDirs = virtualFileSystem[currentDirectory] || [];
          console.log('CD: Available directories:', availableDirs);
          
          // Look for the directory with trailing slash - CASE INSENSITIVE
          let foundDir = null;
          
          // First try exact match
          foundDir = availableDirs.find(
            item => item.toLowerCase() === `${targetDir.toLowerCase()}/` || 
                   item.toLowerCase() === `${targetDir.toLowerCase()}`
          );
          
          // If no exact match, try to find a case-insensitive match
          if (!foundDir) {
            foundDir = availableDirs.find(
              item => item.endsWith('/') && // Only match directories
                     item.toLowerCase().replace('/', '') === targetDir.toLowerCase()
            );
          }
          
          // If still no match, try partial match (e.g. "doc" matches "Documents/")
          if (!foundDir) {
            foundDir = availableDirs.find(
              item => item.endsWith('/') && // Only match directories
                     item.toLowerCase().startsWith(targetDir.toLowerCase())
            );
          }
          
          console.log('CD: Directory found?', foundDir);
          
          if (foundDir) {
            // Use the actual name from the filesystem with correct capitalization
            const actualDirName = foundDir.endsWith('/') ? foundDir.slice(0, -1) : foundDir;
            newPath = `${currentDirectory}/${actualDirName}`;
            console.log('CD: Directory found, new path:', newPath);
          } else {
            console.log('CD: Directory not found');
            return `cd: ${args[0]}: No such file or directory`;
          }
        }
        
        // Clean up path - replace any double slashes
        newPath = newPath.replace(/\/\//g, '/');
        
        // Check if the path exists in our filesystem
        console.log('CD: Checking if new path exists in filesystem:', newPath);
        console.log('CD: Available path keys:', Object.keys(virtualFileSystem));
        
        // Try case-insensitive path lookup for flexibility
        let exactPath = newPath;
        if (virtualFileSystem[newPath] === undefined) {
          // Try to find a case-insensitive match in the filesystem keys
          const lowerCasePath = newPath.toLowerCase();
          const possibleMatch = Object.keys(virtualFileSystem).find(
            key => key.toLowerCase() === lowerCasePath
          );
          
          if (possibleMatch) {
            console.log('CD: Found case-insensitive path match:', possibleMatch);
            exactPath = possibleMatch;
          } else {
            console.log('CD: Path not found in virtual filesystem');
            return `cd: ${args[0]}: No such file or directory`;
          }
        }
        
        console.log('CD: Successfully changing to directory:', exactPath);
        setCurrentDirectory(exactPath);
        return `Changed directory to: ${exactPath}`;
        
      case 'pwd':
        return currentDirectory;
      
      case 'mkdir':
        if (args.length === 0) {
          return 'mkdir: missing operand\nTry mkdir DIRECTORY';
        }
        
        const newDir = args[0];
        // Don't allow special characters in directory names
        if (/[^a-zA-Z0-9_-]/.test(newDir)) {
          return `mkdir: invalid directory name: ${newDir}`;
        }
        
        // Check if directory already exists
        if (virtualFileSystem[currentDirectory]?.includes(`${newDir}/`)) {
          return `mkdir: cannot create directory '${newDir}': File exists`;
        }
        
        // Add new directory to virtual filesystem
        setVirtualFileSystem(prev => {
          const newFileSystem = { ...prev };
          
          // Add directory to current directory listing
          newFileSystem[currentDirectory] = [...(newFileSystem[currentDirectory] || []), `${newDir}/`];
          
          // Create the new directory path
          newFileSystem[`${currentDirectory}/${newDir}`] = [];
          
          return newFileSystem;
        });
        
        return '';
      case 'weather':
        if (args.length === 0) {
          return "Please specify a city name: weather <city>";
        }
        const city = args.join(' ');
        setShowWeather(true);
        setWeatherData(`Fetching weather for ${city}...`);
        
        // Actually fetch the weather data - this is async
        fetchWeatherData(city);
        
        return "Accessing weather satellites...";
      case 'theme':
        if (args.length === 0) {
          return "Please specify a theme: dark, light, hacker, alien";
        }
        const newTheme = args[0];
        setTerminalTheme(newTheme);
        return `Terminal theme changed to ${newTheme}`;
      case 'reload':
        // Force a reload of commands from the database
        const { getCommands } = await import('../lib/commandStore');
        try {
          const refreshedCommands = await getCommands();
          setTerminalEntries(prev => [
            ...prev,
            { 
              isCommand: false, 
              text: `Reloaded ${refreshedCommands.length} commands from the database.`
            }
          ]);
          return "Commands reloaded successfully.";
        } catch (error) {
          console.error('Error reloading commands:', error);
          return "Error reloading commands. Check console for details.";
        }
      case 'fortune':
        const fortunes = [
          "The fortune you seek is in another command.",
          "A program will do what you tell it to do, not what you want it to do.",
          "You will find success in your code if you actually test it.",
          "Today is a good day to back up your files.",
          "You will meet a friendly compiler error that will save your job.",
          "Error 404: Fortune not found."
        ];
        return "🥠 " + fortunes[Math.floor(Math.random() * fortunes.length)];
      case 'cowsay':
        const message = args.join(' ') || "Moo!";
        return `
  ___________
< ${message} >
  ===========
       \\   ^__^
        \\  (oo)\\_______
           (__)\\       )\\/\\
               ||----w |
               ||     ||`;
      case 'aquarium':
        activateAquarium();
        return "Starting ASCII aquarium... Type 'clear' to exit.";
      case '42':
        // Create a special sequence for the hitchhiker's guide reference
        const deepThoughtAscii = `
        .-------------------.
       /  Deep Thought 2.0  \\
      /                       \\
     /                         \\
    |     .-"""""-.     .-"""-. |
    |    /         \\   /       \\|
    |   |           | |         |
    |    \\         /   \\       /|
    |     '-.._..-'     '-.._-' |
    |                          .|
    |                          .|
    |            42            .|
    |                          .|
    |                          .|
     \\                         /
      \\                       /
       \\      .------.       /
        \\    /        \\     /
         '--'          '---'`;
        
        // Don't return immediately, instead create a sequence
        setTerminalEntries(prev => [
          ...prev, 
          { 
            isCommand: false, 
            isHitchhiker: true,
            text: "Accessing Deep Thought supercomputer..."
          }
        ]);
        
        setTimeout(() => {
          setTerminalEntries(prev => [
            ...prev, 
            { 
              isCommand: false, 
              isHitchhiker: true,
              text: "You have requested The Answer to the Ultimate Question of Life, the Universe, and Everything..."
            }
          ]);
        }, 1000);
        
        setTimeout(() => {
          setTerminalEntries(prev => [
            ...prev, 
            { 
              isCommand: false, 
              isHitchhiker: true,
              text: "PLEASE WAIT... This calculation has been running for 7.5 million years..."
            }
          ]);
        }, 2000);
        
        setTimeout(() => {
          setTerminalEntries(prev => [
            ...prev, 
            { 
              isCommand: false, 
              isHitchhiker: true,
              text: "CALCULATION COMPLETE!"
            }
          ]);
        }, 3000);
        
        setTimeout(() => {
          setTerminalEntries(prev => [
            ...prev, 
            { 
              isCommand: false, 
              isHitchhiker: true,
              text: deepThoughtAscii
            }
          ]);
        }, 3500);
        
        setTimeout(() => {
          const quotes = [
            "I think the problem, to be quite honest with you, is that you've never actually known what the question is.",
            "Yes, but what exactly IS the question?",
            "Don't Panic!",
            "So long, and thanks for all the fish!",
            "Time is an illusion. Lunchtime doubly so."
          ];
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
          
          setTerminalEntries(prev => [
            ...prev, 
            { 
              isCommand: false, 
              isHitchhiker: true,
              text: `"${randomQuote}" - The Hitchhiker's Guide to the Galaxy`
            }
          ]);
        }, 4500);
        
        // We need to return something initially, even though the sequence will show more
        return "Processing request...";
      case 'hack':
        if (args.length === 0) {
          return "Usage: hack <target> - Initiate cyber attack sequence";
        }
        const target = args.join(' ');
        closeAllEasterEggs();
        setIsHacking(true);
        setHackProgress(0);
        setHackTarget(target);
        setHackMessages([]);
        startHackingSequence(target);
        return `Initiating cyber attack on ${target}...`;
      case 'joke':
        // Fetch joke asynchronously
        fetchJoke();
        return "Searching humor database...";
      case 'cat':
        if (args.length === 0) {
          return 'Usage: cat <filename>';
        }
        
        let filePath = args[0];
        
        // Handle relative vs absolute paths
        if (!filePath.startsWith('/')) {
          filePath = `${currentDirectory}/${filePath}`;
        }
        
        // Clean up path - replace any double slashes
        filePath = filePath.replace(/\/\//g, '/');
        
        // Check if the file exists in our virtual filesystem
        const dirPath = filePath.split('/').slice(0, -1).join('/');
        const fileName = filePath.split('/').pop() || '';
        
        // Check if directory exists
        if (!virtualFileSystem[dirPath]) {
          return `cat: ${args[0]}: No such file or directory`;
        }
        
        // Check if file exists in the directory
        const fileExists = virtualFileSystem[dirPath].some(f => f === fileName);
        if (!fileExists) {
          return `cat: ${args[0]}: No such file or directory`;
        }
        
        // Check if we have content for this file
        if (!virtualFileContents[filePath]) {
          return `[File exists but appears to be empty or binary]`;
        }
        
        return virtualFileContents[filePath];
      case 'flappykain':
        closeAllEasterEggs();
        
        // If not in full-screen mode, redirect to terminal page
        if (!isFullPage) {
          // Add a message to indicate redirection
          setTerminalEntries(prev => [
            ...prev,
            { isCommand: false, text: "Launching Flappy Kain in full-screen terminal..." }
          ]);
          
          // Use timeout to ensure the message is displayed before navigation
          setTimeout(() => {
            navigate('/terminal');
          }, 500);
          
          return "Redirecting to full-screen terminal...";
        }
        
        // If already in full-screen, just launch the game
        setTerminalEntries(prev => [
          ...prev,
          { isCommand: false, text: "Launching Flappy Kain...", isFlappyKain: true }
        ]);
        setIsFlappyKainActive(true);
        return "";
      default:
        // Random generic responses
        const responses = [
          "Command not recognized. Have you tried turning it off and on again?",
          "Interesting input. Processing... [Error 404: Creativity not found]",
          "I understand these words individually, but not in that order.",
          "That's what she said! (Sorry, couldn't resist)",
          "Loading... Loading... Still loading... Maybe try something else?",
          "I'm sorry Dave, I'm afraid I can't do that.",
          "Hmm, you seem to be speaking human, but my alien translator is struggling.",
          "Beep boop - command not in my programming."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const processStepperSubmission = async (input: string): Promise<string> => {
    if (!isStickerFormActive) {
      return 'Error: Sticker form not active';
    }
    
    // Store the current input for the current step
    const updatedFormData = { ...stickerFormData };
    
    // Helper function for fake processing animation
    const fakeProcessingMessage = async (message: string, delayMs: number = 1500): Promise<string> => {
      // We can't actually delay the return here, but we can show processing message
      // in the terminal entries before the response shows up
      setTerminalEntries(prev => [
        ...prev,
        { isCommand: false, text: `${message}` }
      ]);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      return "";
    };
    
    // Helper function for typewriter effect
    const typewriterEffect = async (message: string): Promise<string> => {
      // Add the message to terminal entries, but mark it with a special class
      setTerminalEntries(prev => [
        ...prev,
        { 
          isCommand: false, 
          text: message,
          isTypewriter: true 
        }
      ]);
      
      return "";
    };
    
    switch (stickerFormStep) {
      case 0: // Name
        if (input.trim().length < 2) {
          return "Names should be at least 2 characters. Please enter your name:";
        }
        
        updatedFormData.name = input;
        setStickerFormData(updatedFormData);
        setStickerFormStep(1);
        
        // Show typing animation effect
        await fakeProcessingMessage(`> Name verification: OK\n> Hello, ${input}!`);
        
        return await typewriterEffect(`What's your email address?\n> This will be used to confirm your submission and for shipping updates.`);
      
      case 1: // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          return "That doesn't appear to be a valid email address. Please enter a valid email:";
        }
        
        updatedFormData.email = input;
        setStickerFormData(updatedFormData);
        setStickerFormStep(2);
        
        await fakeProcessingMessage(`> Email verification: OK\n> ${input} has been registered.`);
        
        return await typewriterEffect("What's your street address?\n> This is where we'll ship your free sticker.");
      
      case 2: // Address
        if (input.trim().length < 5) {
          return "Address seems too short. Please enter your complete street address:";
        }
        
        updatedFormData.address = input;
        setStickerFormData(updatedFormData);
        setStickerFormStep(3);
        
        await fakeProcessingMessage(`> Address recorded: ${input}`);
        
        return await typewriterEffect("What city do you live in?");
      
      case 3: // City
        if (input.trim().length < 2) {
          return "City name seems too short. Please enter a valid city:";
        }
        
        updatedFormData.city = input;
        setStickerFormData(updatedFormData);
        setStickerFormStep(4);
        
        await fakeProcessingMessage(`> City verified: ${input}`);
        
        return await typewriterEffect("What state/province do you live in?\n> You can use abbreviations (e.g., CA, NY)");
      
      case 4: // State
        if (input.trim().length < 2) {
          return "State/province seems invalid. Please enter a valid state or province:";
        }
        
        updatedFormData.state = input;
        setStickerFormData(updatedFormData);
        setStickerFormStep(5);
        
        await fakeProcessingMessage(`> State/province recorded: ${input}`);
        
        return await typewriterEffect("What's your ZIP/postal code?");
      
      case 5: // Zip
        // Simplified ZIP validation - at least 5 characters
        if (input.trim().length < 5) {
          return "ZIP/postal code seems too short. Please enter a valid ZIP/postal code:";
        }
        
        updatedFormData.zipCode = input;
        setStickerFormData(updatedFormData);
        setStickerFormStep(6);
        
        await fakeProcessingMessage(`> ZIP/postal code verified: ${input}`);
        
        return await typewriterEffect("What country do you live in?");
      
      case 6: // Country
        if (input.trim().length < 2) {
          return "Country name seems too short. Please enter a valid country:";
        }
        
        updatedFormData.country = input;
        setStickerFormData(updatedFormData);
        setStickerFormStep(7);
        
        // Show address verification animation
        setTerminalEntries(prev => [
          ...prev,
          { isCommand: false, text: `
> Initiating geocoding verification...
> Checking address format...
> Validating postal standards...
> Cross-referencing location databases...
> Address verification: COMPLETE
          
Summary of shipping information:
===============================
Name: ${updatedFormData.name}
Email: ${updatedFormData.email}
Address: ${updatedFormData.address}
City: ${updatedFormData.city}, ${updatedFormData.state} ${updatedFormData.zipCode}
Country: ${updatedFormData.country}

> Encrypting personal data...
> Initiating database connection...` }
        ]);
        
        // Wait to simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Submit to database
        try {
          // Show database submission animation before the actual submission
          setTerminalEntries(prev => [
            ...prev,
            { isCommand: false, text: '> Submitting secure form data...' }
          ]);

          const { error } = await supabase
            .from('free_sticker_requests')
            .insert([{
              name: updatedFormData.name,
              email: updatedFormData.email,
              address: updatedFormData.address,
              city: updatedFormData.city,
              state: updatedFormData.state,
              zip_code: updatedFormData.zipCode,
              country: updatedFormData.country,
              fulfilled: false,
              requested_at: new Date().toISOString()
            }]);
            
          if (error) {
            console.error('Error submitting sticker request:', error);
            
            // Check if it's a duplicate email error
            if (error.code === '23505' || error.message.includes('unique constraint')) {
              setStickerFormComplete(true);
              setIsStickerFormActive(false);
              return `
⚠️ SUBMISSION ERROR ⚠️

Our records indicate this email has already been used to claim a free sticker.
We limit free stickers to one per person.

If you believe this is an error, please contact support@spacestickerstore.com
`;
            }
            
            return `
⚠️ DATABASE ERROR ⚠️

There was an error processing your request.
Error code: ${error.code || 'UNKNOWN'}

Please try again later or contact support@spacestickerstore.com
`;
          }
          
          // Successful submission animation
          setTerminalEntries(prev => [
            ...prev,
            { isCommand: false, text: '> Database transaction: SUCCESSFUL' }
          ]);
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setStickerFormComplete(true);
          setIsStickerFormActive(false);
          
          return `
✅ SUBMISSION COMPLETE ✅

Thank you, ${updatedFormData.name}!
Your free sticker has been queued for delivery.

Shipment tracking information will be sent to ${updatedFormData.email}
once your package is on its way.

Please allow 2-4 weeks for delivery.

> Transmission complete
> Connection terminating
> Have a cosmic day! 🚀
`;
        } catch (error) {
          console.error('Error submitting sticker request:', error);
          return `
⚠️ SYSTEM ERROR ⚠️

A system error occurred while processing your request.
Please try again later or contact support@spacestickerstore.com

> Error details have been logged
`;
        }
      
      default:
        setIsStickerFormActive(false);
        return "Form completed. Thank you!";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isCommandProcessing) {
      return;
    }
    
    setIsCommandProcessing(true);
    
    // Add the command to terminal history
    const mainCommand = inputValue.trim().split(' ')[0].toLowerCase();
    setTerminalEntries(prev => [
      ...prev,
      { isCommand: true, text: inputValue }
    ]);
    
    try {
      // If sticker form is active, process as form input rather than command
      if (isStickerFormActive) {
        processStepperSubmission(inputValue).then(response => {
          if (response) {
            setTerminalEntries(prev => [
              ...prev,
              { isCommand: false, text: response }
            ]);
          }
        }).catch(error => {
          console.error('Error processing sticker form:', error);
          setTerminalEntries(prev => [
            ...prev,
            { isCommand: false, text: "Error processing your input. Please try again." }
          ]);
        });
      } else {
        // Process as normal command
        getCommandResponse(inputValue).then(response => {
          // Add response to terminal if it exists
          if (response) {
            setTerminalEntries(prev => [
              ...prev,
              { isCommand: false, text: response }
            ]);
          }
        }).catch(error => {
          console.error('Error processing command:', error);
          setTerminalEntries(prev => [
            ...prev,
            { isCommand: false, text: "Error processing command. Please try again." }
          ]);
        });
      }
    } catch (error) {
      console.error('Error processing command:', error);
      setTerminalEntries(prev => [
        ...prev,
        { isCommand: false, text: "Error processing command. Please try again." }
      ]);
    } finally {
      // Clean up
      setInputValue('');
      setIsCommandProcessing(false);
      
      // Scroll to bottom
      if (terminalContentRef.current) {
        setTimeout(() => {
          if (terminalContentRef.current) {
            terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
          }
        }, 10);
      }
      
      // Focus the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  // Handle terminal theme
  useEffect(() => {
    const terminalElement = terminalContentRef.current;
    if (!terminalElement) return;
    
    // Reset classes
    terminalElement.classList.remove(
      'bg-gray-900', 'bg-white', 'bg-black', 'bg-purple-900',
      'text-gray-300', 'text-gray-800', 'text-green-500', 'text-alien-glow'
    );
    
    // Apply theme
    switch (terminalTheme) {
      case 'dark':
        terminalElement.classList.add('bg-gray-900', 'text-gray-300');
        break;
      case 'light':
        terminalElement.classList.add('bg-white', 'text-gray-800');
        break;
      case 'hacker':
        terminalElement.classList.add('bg-black', 'text-green-500');
        break;
      case 'alien':
        terminalElement.classList.add('bg-purple-900', 'text-alien-glow');
        break;
      default:
        terminalElement.classList.add('bg-gray-900', 'text-gray-300');
    }
  }, [terminalTheme]);

  // Simulated hacking sequence function
  const startHackingSequence = (target: string) => {
    const hackSteps = [
      `Scanning target: ${target}...`,
      "Identifying vulnerabilities...",
      "Bypassing firewall...",
      "Accessing mainframe...",
      "Injecting quantum payload...",
      "Decrypting security protocols...",
      "Establishing secure connection...",
      "Extracting data...",
      "Covering tracks...",
      "Hack complete!"
    ];
    
    let step = 0;
    const totalSteps = hackSteps.length;
    
    // Start the hacking sequence
    const interval = setInterval(() => {
      if (step < totalSteps) {
        // Add fake technical details to make it look more realistic
        const technicalDetails = [
          `[${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:${Math.floor(Math.random() * 9000) + 1000}]`,
          `[0x${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}]`,
          `[${Math.random().toString(36).substring(2, 8)}]`
        ];
        
        const randomDetail = technicalDetails[Math.floor(Math.random() * technicalDetails.length)];
        
        // Update messages and progress
        setHackMessages(prev => [...prev, `${randomDetail} ${hackSteps[step]}`]);
        setHackProgress(((step + 1) / totalSteps) * 100);
        
        // If we're at the last step, set a timer to reset the hacking mode
        if (step === totalSteps - 1) {
          setTimeout(() => {
            setIsHacking(false);
          }, 3000);
        }
        
        step++;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  // Helper to close all easter eggs
  const closeAllEasterEggs = () => {
    setIsMatrixActive(false);
    setIsPacmanActive(false);
    setIsCoffeeActive(false);
    setIsSnakeActive(false);
    setIsRickRollActive(false);
    setIsFlappyKainActive(false);
    setIsAsciiAquarium(false);
    setHackProgress(0);
    setIsHacking(false);
    // Return focus to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Function to clear terminal completely
  const clearTerminal = useCallback(() => {
    setTerminalEntries([]);
    // Reset all easter eggs including aquarium
    setIsAsciiAquarium(false);
    setIsMatrixActive(false);
    setIsPacmanActive(false);
    setIsSnakeActive(false);
    setIsCoffeeActive(false);
    setIsHacking(false);
    setShowWeather(false);
    setJoke('');
  }, []);
  
  // Handle the ESC key globally to exit easter eggs
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllEasterEggs();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [closeAllEasterEggs]);
  
  // Update the Matrix easter egg handler to include better cleanup
  const handleMatrixExit = useCallback(() => {
    setIsMatrixActive(false);
    // Clear any Matrix-related messages upon exit
    setTerminalEntries(prev => prev.filter(entry => !entry.isMatrix));
  }, []);

  // Log when aquarium is activated to help with debugging
  useEffect(() => {
    if (isAsciiAquarium) {
      console.log("Aquarium activated:", isAsciiAquarium);
    }
  }, [isAsciiAquarium]);

  // Make the aquarium command more reliable by ensuring proper state updates
  const activateAquarium = () => {
    // First clean up other easter eggs
    setIsMatrixActive(false);
    setIsPacmanActive(false);
    setIsSnakeActive(false);
    setIsCoffeeActive(false);
    setIsHacking(false);
    
    // Add the aquarium loading sequence for better user experience
    setTerminalEntries(prev => [
      ...prev,
      {
        isCommand: false,
        text: "Starting ASCII aquarium..."
      }
    ]);
    
    // Loading sequence with dots
    setTimeout(() => {
      setTerminalEntries(prev => [
        ...prev,
        {
          isCommand: false,
          text: "Filling tank with water..."
        }
      ]);
    }, 400);
    
    setTimeout(() => {
      setTerminalEntries(prev => [
        ...prev,
        {
          isCommand: false,
          text: "Adding colorful fish..."
        }
      ]);
    }, 800);
    
    setTimeout(() => {
      setTerminalEntries(prev => [
        ...prev,
        {
          isCommand: false,
          text: "Creating underwater scenery..."
        }
      ]);
    }, 1200);
    
    // Finally activate the aquarium
    setTimeout(() => {
      setIsAsciiAquarium(true);
    }, 1600);
  };

  // Component to render the aquarium inline with terminal content
  const InlineAquarium = () => (
    <div className="my-2 overflow-hidden" style={{ height: '250px' }}>
      <SimpleAquarium />
    </div>
  );
  
  // Function to build help menu based on enabled commands
  const buildHelpMenu = () => {
    const enabledCommands = isLoading ? [] : getEnabledCommands();
    
    let helpText = 'Available commands:\n';
    enabledCommands.forEach(cmd => {
      // Only show non-easter egg commands in help menu by default
      if (cmd.category !== 'easter-egg') {
        helpText += `  ${cmd.name.padEnd(12)} - ${cmd.description}\n`;
      }
    });
    
    // Add easter egg commands section only if showEasterEggs is true
    if (showEasterEggs) {
      helpText += '\nEaster Egg commands:\n';
      enabledCommands.forEach(cmd => {
        if (cmd.category === 'easter-egg') {
          helpText += `  ${cmd.name.padEnd(12)} - ${cmd.description}\n`;
        }
      });
      
      // Add the flappykain command since it may not be in the commands list yet
      helpText += `  ${"flappykain".padEnd(12)} - Play Flappy Kain space game\n`;
    } else {
      // Add a hint about hidden easter eggs
      helpText += '\nThere are hidden easter egg commands. Use \'eastereggtoggle\' to reveal them.\n';
    }
    
    return helpText;
  };
  
  // Improved window control buttons with stop propagation
  const renderWindowControls = () => (
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
      {windowControls.map((control, index) => {
        // Determine if this is the green button and if we're on the full terminal page
        const isGreenButtonOnFullPage = isFullPage && index === 2;
        
        return (
        <motion.button
          key={index}
            className={`w-3 h-3 rounded-full ${control.color} hover:${control.hoverColor} flex items-center justify-center ${
              isGreenButtonOnFullPage ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          onClick={(e) => {
            // Prevent click from reaching the terminal div
            e.stopPropagation();
            control.action();
          }}
            whileHover={{ scale: isGreenButtonOnFullPage ? 1 : 1.1 }}
            whileTap={{ scale: isGreenButtonOnFullPage ? 1 : 0.9 }}
        >
          <span className="text-[8px] text-gray-800 opacity-0 hover:opacity-100 transition-opacity">
            {control.icon}
          </span>
        </motion.button>
        );
      })}
      <span className="ml-auto text-xs text-gray-400">alien-tech:~</span>
    </div>
  );
  
  // Add convenience function to resolve aliases
  const resolveAlias = (dirName: string): string => {
    const lowerDirName = dirName.toLowerCase();
    return aliases[lowerDirName] || dirName;
  };
  
  return (
    <motion.div 
      className={`bg-gray-900/90 rounded-lg font-mono text-sm backdrop-blur-sm overflow-hidden transition-all duration-300 flex flex-col ${className} ${
        isFullscreen && !isFullPage ? 'fixed top-20 left-4 right-4 bottom-4 z-[100]' : ''
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        transform: isMinimized ? 'translateY(100%)' : 'none',
        opacity: isMinimized ? 0 : 1
      }}
    >
      {/* Add matrix transition overlay */}
      {isMatrixTransitioning && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Random Matrix code background */}
            <div className="absolute inset-0 opacity-20 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute font-mono text-green-500 text-sm animate-fall"
                  style={{ 
                    left: `${i * 10}%`, 
                    top: `-${Math.random() * 100}%`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                >
                  {Array.from({ length: 20 }).map((_, j) => (
                    <div key={j}>
                      {String.fromCharCode(33 + Math.floor(Math.random() * 93))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Center message */}
            <div className="text-green-500 text-2xl font-bold animate-pulse z-10 text-center px-4">
              Follow the white rabbit...
            </div>
          </div>
        </div>
      )}
      
      {/* macOS-style window controls */}
      {renderWindowControls()}
      
      {/* Terminal content */}
      <div 
        ref={terminalContentRef}
        className={`p-4 overflow-y-auto terminal-text transition-all duration-300 flex-1 ${
          isFullPage ? 'h-[calc(100%-2.5rem)]' : isFullscreen ? 'h-[calc(100%-2.5rem)]' : 'h-[200px]'
        } ${isStickerFormActive ? 'terminal-crt' : ''}`}
        onClick={handleTerminalClick}
      >
        {isHacking && (
          <div className="my-4 p-4 bg-black border border-green-500 text-green-500 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <div className="text-green-400 font-bold">TARGET: {hackTarget}</div>
              <div className="text-green-400">PROGRESS: {hackProgress.toFixed(0)}%</div>
            </div>
            
            <div className="w-full bg-gray-800 h-2 mb-4">
              <div 
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${hackProgress}%` }}
              ></div>
            </div>
            
            <div className="h-40 overflow-y-auto">
              {hackMessages.map((msg, index) => (
                <div key={index} className="mb-1">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className={`relative h-full flex flex-col ${isMatrixActive ? 'invisible' : 'visible'}`}>
          {/* Initial animation messages - only show if animation is running */}
          {!isUserTyping && !isInitialAnimationComplete && (
            <>
              {messages.slice(0, currentMessageIndex).map((message, index) => (
            <div key={`init-${index}`} className="mb-2">
              <span className="text-alien-glow">$ </span>
              <span className="text-gray-300">{message}</span>
            </div>
          ))}
          
              {currentMessageIndex < messages.length && (
            <div>
              <span className="text-alien-glow">$ </span>
              <span className="text-gray-300">{displayedText}</span>
              <span className={`text-white ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>_</span>
            </div>
              )}
            </>
          )}

          {/* User interaction entries */}
          {terminalEntries.map((entry, index) => (
            <div key={`entry-${index}`} className="mb-2">
              {entry.isCommand ? (
                <>
                  <span className="text-alien-glow">$ </span>
                  <span className="text-gray-300">{entry.text}</span>
                </>
              ) : (
                <div 
                  className={`pl-2 whitespace-pre-wrap ${
                    entry.isMatrix 
                      ? 'text-green-500 font-bold animate-pulse my-1 py-1' 
                      : entry.isHitchhiker
                        ? entry.text.includes('THE ANSWER IS') 
                          ? 'font-mono text-yellow-400 bg-blue-900/40 p-3 rounded border border-yellow-500 my-2 animate-pulse'
                          : entry.text.includes('CALCULATION COMPLETE') 
                            ? 'text-green-400 font-bold text-xl animate-bounce my-2'
                            : entry.text.includes('"') 
                              ? 'text-yellow-300 italic bg-blue-900/20 p-2 rounded my-2 border-l-4 border-yellow-500'
                              : 'text-blue-300 font-semibold'
                        : entry.isSnake
                          ? 'my-2 snake-game-container'
                          : entry.isTypewriter
                            ? 'typing-animation text-emerald-300 font-bold'
                          : entry.text.includes('White Rabbit') 
                            ? 'text-alien-glow text-2xl font-bold animate-pulse' 
                            : entry.text.includes('🌍 Weather Report') 
                              ? 'text-blue-300 bg-blue-900/30 p-3 rounded border border-blue-700 my-2'
                              : entry.text.includes('😆 Random Joke')
                                ? 'text-purple-300 bg-purple-900/30 p-3 rounded border border-purple-700 my-2'
                                : entry.text.includes('Starting ASCII aquarium')
                                  ? 'text-cyan-300 animate-pulse'
                                : entry.text.includes('Filling tank with water')
                                  ? 'text-cyan-300 animate-pulse'
                                : entry.text.includes('Adding colorful fish')
                                  ? 'text-yellow-300 animate-pulse'
                                : entry.text.includes('Creating underwater scenery')
                                  ? 'text-green-300 animate-pulse'
                                : entry.text.includes('ERROR') || entry.text.includes('⚠️')
                                  ? 'glitch-text'
                                : 'text-gray-300'
                  }`}
                  data-text={entry.text}
                >
                  {entry.isSnake && isSnakeActive && (
                    <SnakeEasterEgg
                      isActive={isSnakeActive}
                      onClose={() => {
                        setIsSnakeActive(false);
                        setTerminalEntries(prev => 
                          prev.map(item => 
                            item.isSnake ? { ...item, text: "Snake game closed." } : item
                          )
                        );
                      }}
                    />
                  )}
                  {(entry.text.includes('Starting ASCII aquarium') && isAsciiAquarium && index === terminalEntries.findIndex(e => e.text.includes('Starting ASCII aquarium'))) && (
                    <div className="mt-2 mb-4 aquarium-container border border-cyan-800 rounded-md overflow-hidden bg-blue-900/30">
                      <AsciiAquarium width={Math.min(60, window.innerWidth / 12)} height={18} />
                    </div>
                  )}
                  {entry.isCoffee && (
                    <div className="my-2">
                      <CoffeeEasterEgg />
                      <p className="text-gray-400 mt-2">Coffee brewing complete! Enjoy your virtual coffee.</p>
                    </div>
                  )}
                  {entry.isPacman && isPacmanActive && (
                    <div className="my-2">
                      <PacmanEasterEgg 
                        isActive={isPacmanActive} 
                        onClose={() => setIsPacmanActive(false)} 
                        isFullscreen={isFullscreen || isFullPage}
                      />
                    </div>
                  )}
                  {entry.isRickRoll && isRickRollActive && (
                    <RickRollEasterEgg
                      isActive={isRickRollActive}
                      onClose={() => setIsRickRollActive(false)}
                    />
                  )}
                  {entry.isFlappyKain && isFlappyKainActive && (
                    <FlappyKainEasterEgg
                      isActive={isFlappyKainActive}
                      onClose={() => setIsFlappyKainActive(false)}
                    />
                  )}
                  {entry.isMatrix && isMatrixActive && (
                    <MatrixEasterEgg 
                      isActive={isMatrixActive} 
                      onComplete={handleMatrixExit} 
                    />
                  )}
                  {!entry.isSnake && 
                   !(entry.text.includes('Starting ASCII aquarium') && isAsciiAquarium && index === terminalEntries.findIndex(e => e.text.includes('Starting ASCII aquarium'))) && 
                   !entry.isCoffee && 
                   !entry.isPacman &&
                   !entry.isRickRoll &&
                   !entry.isMatrix &&
                   entry.text}
                </div>
              )}
            </div>
          ))}

          {/* Input form with cursor after the $ prompt */}
          {isInitialAnimationComplete && !isMatrixActive && !isPacmanActive && (
            <form onSubmit={handleSubmit} className="flex items-center">
              <span className="text-alien-glow">{currentDirectory.replace('/home/alien', '~')}$ </span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="flex-1 bg-transparent border-none outline-none text-gray-300"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TechTerminal;