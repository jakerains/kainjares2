// Utility script to sync commands to Supabase
import { createClient } from '@supabase/supabase-js';
// Import from a direct source instead since initialCommands is not exported from commandStore.ts

// Directly define the commands to match src/lib/commandStore.ts
const initialCommands = [
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
    description: 'Display a talking cow',
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
    id: '42',
    name: '42',
    description: 'The answer to life, the universe, and everything',
    enabled: true,
    category: 'easter-egg'
  },
  {
    id: 'eastereggtoggle',
    name: 'eastereggtoggle',
    description: 'Toggle visibility of easter egg commands in help menu',
    enabled: true,
    category: 'utility'
  }
];

async function syncCommands() {
  console.log('Starting command sync process...');

  // Get Supabase credentials from environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return;
  }
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    console.log('Checking existing commands...');
    
    // Get existing commands
    const { data: existingCommands, error } = await supabase
      .from('terminal_commands')
      .select('id');
      
    if (error) {
      console.error('Error checking for existing commands:', error);
      return;
    }
    
    // Get IDs of existing commands
    const existingCommandIds = existingCommands.map(cmd => cmd.id);
    console.log('Existing commands:', existingCommandIds);
    
    // Find commands to insert (ones in initialCommands but not in existingCommands)
    const commandsToInsert = initialCommands.filter(cmd => !existingCommandIds.includes(cmd.id));
    console.log('Commands to insert:', commandsToInsert.map(cmd => cmd.id));
    
    if (commandsToInsert.length > 0) {
      console.log(`Inserting ${commandsToInsert.length} new commands...`);
      
      // Insert new commands
      const { error: insertError } = await supabase
        .from('terminal_commands')
        .insert(commandsToInsert);
        
      if (insertError) {
        console.error('Error inserting new commands:', insertError);
      } else {
        console.log('New commands inserted successfully!');
      }
    } else {
      console.log('No new commands to insert');
    }
    
    // Update existing commands
    console.log('Updating existing commands...');
    
    for (const command of initialCommands) {
      if (existingCommandIds.includes(command.id)) {
        const { error: updateError } = await supabase
          .from('terminal_commands')
          .update({
            name: command.name,
            description: command.description,
            category: command.category,
            enabled: command.enabled
          })
          .eq('id', command.id);
          
        if (updateError) {
          console.error(`Error updating command ${command.id}:`, updateError);
        }
      }
    }
    
    console.log('Command sync completed!');
  } catch (error) {
    console.error('Error syncing commands:', error);
  }
}

// Run the sync function
syncCommands();

export default syncCommands; 