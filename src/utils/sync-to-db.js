// Force sync all commands from init-db.js to Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize dotenv to get environment variables
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Manually define all commands to ensure they're in sync
const commands = [
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
    id: 'eastereggtoggle',
    name: 'eastereggtoggle',
    description: 'Toggle visibility of easter egg commands in help menu',
    enabled: true,
    category: 'utility'
  }
];

// Function to sync commands to Supabase
async function syncCommands() {
  console.log('Starting command sync to Supabase...');
  
  try {
    // Clear all existing commands first (optional, comment out if you want to keep existing commands)
    console.log('Clearing existing commands...');
    const { error: deleteError } = await supabase
      .from('terminal_commands')
      .delete()
      .neq('id', 'dummy_id'); // Delete all rows
    
    if (deleteError) {
      console.error('Error clearing commands:', deleteError);
    } else {
      console.log('Existing commands cleared successfully.');
    }
    
    // Insert all commands
    console.log(`Inserting ${commands.length} commands...`);
    const { data, error } = await supabase
      .from('terminal_commands')
      .upsert(commands, { onConflict: 'id' });
    
    if (error) {
      console.error('Error inserting commands:', error);
    } else {
      console.log('Commands inserted successfully!');
    }
    
    // Verify the commands were inserted correctly
    const { data: verifyData, error: verifyError } = await supabase
      .from('terminal_commands')
      .select('*');
    
    if (verifyError) {
      console.error('Error verifying commands:', verifyError);
    } else {
      console.log(`Verified ${verifyData.length} commands in database.`);
      
      // Check if 'cd' command exists
      const cdCommand = verifyData.find(cmd => cmd.name === 'cd');
      if (cdCommand) {
        console.log('CD command exists in database:', cdCommand);
      } else {
        console.error('CD command NOT FOUND in database!');
      }
    }
    
  } catch (err) {
    console.error('Unexpected error during sync:', err);
  }
}

// Run the sync function
syncCommands()
  .then(() => console.log('Sync process completed.'))
  .catch(err => console.error('Error in sync process:', err)); 