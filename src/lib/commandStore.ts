import { supabase } from './supabase';

export interface TerminalCommand {
  id: string;          // Unique identifier for the command
  name: string;        // Command name (what users type)
  description: string; // Short description for help menu
  enabled: boolean;    // Whether the command is available to users
  category: 'basic' | 'utility' | 'fun' | 'easter-egg' | 'admin' | 'dev';  // Command category
  handler?: (args: string[]) => string | Promise<string>; // Optional handler function
}

// Initial set of commands with their enabled status
const initialCommands: TerminalCommand[] = [
  {
    id: 'help',
    name: 'help',
    description: 'Display this help menu',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'matrix',
    name: 'matrix',
    description: 'Enter the Matrix',
    enabled: true,
    category: 'easter-egg'
  },
  {
    id: 'pacman',
    name: 'pacman',
    description: 'Play Pac-Man',
    enabled: true,
    category: 'easter-egg'
  },
  {
    id: 'coffee',
    name: 'coffee',
    description: 'Brew a virtual coffee',
    enabled: true,
    category: 'fun'
  },
  {
    id: 'snake',
    name: 'snake',
    description: 'Play Snake game',
    enabled: true,
    category: 'easter-egg'
  },
  {
    id: 'rickroll',
    name: 'rickroll',
    description: 'A musical surprise',
    enabled: true,
    category: 'easter-egg'
  },
  {
    id: 'weather',
    name: 'weather',
    description: 'Show weather for a location',
    enabled: true,
    category: 'utility'
  },
  {
    id: 'hack',
    name: 'hack',
    description: 'Hack into a system',
    enabled: true,
    category: 'fun'
  },
  {
    id: 'joke',
    name: 'joke',
    description: 'Get a random joke',
    enabled: true,
    category: 'fun'
  },
  {
    id: 'clear',
    name: 'clear',
    description: 'Clear the terminal',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'echo',
    name: 'echo',
    description: 'Display text',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'whoami',
    name: 'whoami',
    description: 'Display current user',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'date',
    name: 'date',
    description: 'Display current date and time',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'ls',
    name: 'ls',
    description: 'List files in directory',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'cd',
    name: 'cd',
    description: 'Change directory',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'pwd',
    name: 'pwd',
    description: 'Print working directory',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'mkdir',
    name: 'mkdir',
    description: 'Create directory',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'cat',
    name: 'cat',
    description: 'Display file contents',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'theme',
    name: 'theme',
    description: 'Change terminal theme',
    enabled: true,
    category: 'utility'
  },
  {
    id: 'fortune',
    name: 'fortune',
    description: 'Random fortune cookie message',
    enabled: true,
    category: 'fun'
  },
  {
    id: 'cowsay',
    name: 'cowsay',
    description: 'Display a talking cow - usage: cowsay [message]',
    enabled: true,
    category: 'fun'
  },
  {
    id: 'aquarium',
    name: 'aquarium',
    description: 'Show ASCII aquarium',
    enabled: true,
    category: 'fun'
  },
  {
    id: 'reload',
    name: 'reload',
    description: 'Reload commands from the database',
    enabled: true,
    category: 'admin'
  },
  {
    id: '42',
    name: '42',
    description: 'The answer to life, the universe, and everything',
    enabled: true,
    category: 'easter-egg'
  },
  {
    id: 'rick',
    name: 'rick',
    description: 'Never gonna give you up',
    enabled: true,
    category: 'easter-egg'
  },
  {
    id: 'rickroll',
    name: 'rickroll',
    description: 'Never gonna let you down',
    enabled: true,
    category: 'easter-egg'
  },
  {
    id: 'eastereggtoggle',
    name: 'eastereggtoggle',
    description: 'Toggle visibility of easter egg commands in help menu',
    enabled: true,
    category: 'utility'
  },
  {
    id: 'store',
    name: 'store',
    description: 'Visit the alien merch store',
    enabled: true,
    category: 'basic'
  },
  {
    id: 'flappykain',
    name: 'flappykain',
    description: 'Play Flappy Kain space game',
    enabled: true,
    category: 'easter-egg'
  },
  {
    id: 'sticker',
    name: 'sticker',
    description: 'Secret command for free sticker',
    enabled: true,
    category: 'easter-egg'
  }
];

// Backup key for localStorage as fallback
const COMMANDS_STORAGE_KEY = 'terminal-commands-config';

// Sync initial commands to Supabase if they don't exist
const syncInitialCommandsToSupabase = async (): Promise<void> => {
  try {
    const { data: existingCommands, error } = await supabase
      .from('terminal_commands')
      .select('id');
      
    if (error) {
      console.error('Error checking for existing commands:', error);
      return;
    }
    
    const existingCommandIds = existingCommands.map(cmd => cmd.id);
    const commandsToInsert = initialCommands.filter(cmd => !existingCommandIds.includes(cmd.id));
    
    if (commandsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('terminal_commands')
        .insert(commandsToInsert);
        
      if (insertError) {
        console.error('Error inserting initial commands to Supabase:', insertError);
      } else {
        console.log(`Synced ${commandsToInsert.length} initial commands to Supabase`);
      }
    }
  } catch (error) {
    console.error('Error syncing initial commands to Supabase:', error);
  }
};

// Load commands from Supabase or use localStorage as fallback
const loadCommands = async (): Promise<TerminalCommand[]> => {
  try {
    // Try to load from Supabase
    const { data: supabaseCommands, error } = await supabase
      .from('terminal_commands')
      .select('*');
      
    if (error) {
      console.error('Error loading commands from Supabase:', error);
      // Fall back to localStorage if Supabase fails
      return loadFromLocalStorage();
    }
    
    if (supabaseCommands && supabaseCommands.length > 0) {
      return supabaseCommands as TerminalCommand[];
    } else {
      // If no commands in Supabase, initialize with default commands
      await syncInitialCommandsToSupabase();
      return initialCommands;
    }
  } catch (error) {
    console.error('Error in loadCommands:', error);
    // Fall back to localStorage if any errors occur
    return loadFromLocalStorage();
  }
};

// Load from localStorage as fallback
const loadFromLocalStorage = (): TerminalCommand[] => {
  try {
    const storedCommands = localStorage.getItem(COMMANDS_STORAGE_KEY);
    if (storedCommands) {
      const parsedCommands = JSON.parse(storedCommands) as TerminalCommand[];
      
      // Merge with initial commands to ensure we always have all commands
      return initialCommands.map(initialCmd => {
        const storedCmd = parsedCommands.find(c => c.id === initialCmd.id);
        return storedCmd ? { ...initialCmd, enabled: storedCmd.enabled } : initialCmd;
      });
    }
  } catch (error) {
    console.error('Error loading commands from localStorage:', error);
  }
  
  return initialCommands;
};

// Save commands to Supabase and localStorage as backup
export const saveCommands = async (commands: TerminalCommand[]): Promise<void> => {
  try {
    // Save to localStorage as backup
    localStorage.setItem(COMMANDS_STORAGE_KEY, JSON.stringify(commands));
    
    // For each command, upsert to Supabase
    for (const command of commands) {
      const { error } = await supabase
        .from('terminal_commands')
        .upsert(command, { onConflict: 'id' });
        
      if (error) {
        console.error(`Error saving command ${command.id} to Supabase:`, error);
      }
    }
  } catch (error) {
    console.error('Error saving commands:', error);
  }
};

// Toggle a command's enabled state
export const toggleCommand = async (commands: TerminalCommand[], commandId: string): Promise<TerminalCommand[]> => {
  const updatedCommands = commands.map(cmd => 
    cmd.id === commandId ? { ...cmd, enabled: !cmd.enabled } : cmd
  );
  
  const targetCommand = updatedCommands.find(cmd => cmd.id === commandId);
  if (targetCommand) {
    try {
      const { error } = await supabase
        .from('terminal_commands')
        .update({ enabled: targetCommand.enabled })
        .eq('id', commandId);
        
      if (error) {
        console.error(`Error toggling command ${commandId} in Supabase:`, error);
      }
    } catch (error) {
      console.error(`Error in toggleCommand for ${commandId}:`, error);
    }
  }
  
  // Save to localStorage as backup
  localStorage.setItem(COMMANDS_STORAGE_KEY, JSON.stringify(updatedCommands));
  
  return updatedCommands;
};

// Check if a command is enabled
export const isCommandEnabled = (commands: TerminalCommand[], commandName: string): boolean => {
  const command = commands.find(cmd => cmd.name === commandName);
  return command ? command.enabled : false;
};

// Get all commands
export const getCommands = async (): Promise<TerminalCommand[]> => {
  return await loadCommands();
};

// Get only enabled commands
export const getEnabledCommands = async (): Promise<TerminalCommand[]> => {
  const commands = await loadCommands();
  return commands.filter(cmd => cmd.enabled);
};

// Get commands by category
export const getCommandsByCategory = async (category: string): Promise<TerminalCommand[]> => {
  const commands = await loadCommands();
  return commands.filter(cmd => cmd.category === category);
};

// Add a new command
export const addCommand = async (command: TerminalCommand): Promise<TerminalCommand[]> => {
  const commands = await loadCommands();
  const updatedCommands = [...commands, command];
  
  try {
    const { error } = await supabase
      .from('terminal_commands')
      .insert(command);
      
    if (error) {
      console.error(`Error adding command ${command.id} to Supabase:`, error);
    }
  } catch (error) {
    console.error(`Error in addCommand for ${command.id}:`, error);
  }
  
  // Save to localStorage as backup
  localStorage.setItem(COMMANDS_STORAGE_KEY, JSON.stringify(updatedCommands));
  
  return updatedCommands;
};

// Initialize by syncing initial commands to Supabase
syncInitialCommandsToSupabase().catch(console.error);

export default {
  getCommands,
  getEnabledCommands,
  toggleCommand,
  isCommandEnabled,
  getCommandsByCategory,
  addCommand
};