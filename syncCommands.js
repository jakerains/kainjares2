// Script to sync commands to Supabase database using browser environment
import { createClient } from '@supabase/supabase-js';

// List of commands to sync
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

// Your Supabase URL and key
const supabaseUrl = 'https://dbkkuqkzqybznhtbumxq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRia2t1cWt6cXliem5odGJ1bXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA5OTMzMDcsImV4cCI6MjAyNjU2OTMwN30.0wpdW3gp-DNiDtVgJMYpvNaJXsM8HHSrv0uV5jJDc7E';

async function syncCommands() {
  console.log('Starting command sync process...');
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
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
        } else {
          console.log(`Command ${command.id} updated successfully`);
        }
      }
    }
    
    console.log('Command sync completed!');
  } catch (error) {
    console.error('Error syncing commands:', error);
  }
}

// Export the function to make it callable from the browser console
window.syncCommands = syncCommands;

// Log a message to help users
console.log('syncCommands function is available. Run syncCommands() to sync commands to the database.');

export default syncCommands; 