// Initialize database tables on Netlify deploy
import { createClient } from '@supabase/supabase-js';

// Initial set of commands with their enabled status
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
  }
];

export default async (req, context) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Netlify.env.get('VITE_SUPABASE_URL');
    const supabaseAnonKey = Netlify.env.get('VITE_SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase environment variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Check if terminal_commands table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('terminal_commands')
      .select('id')
      .limit(1);
      
    if (tableCheckError) {
      console.log('Table check error or table might not exist yet:', tableCheckError);
    }
    
    // If we can't query or the table doesn't have data, initialize it
    if (tableCheckError || (tableExists && tableExists.length === 0)) {
      console.log('Initializing terminal_commands table...');
      
      // Insert initial commands
      const { data, error } = await supabase
        .from('terminal_commands')
        .upsert(initialCommands, { onConflict: 'id' });
        
      if (error) {
        console.error('Error initializing commands:', error);
        return new Response(JSON.stringify({ error: 'Failed to initialize commands' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Initialized ${initialCommands.length} commands` 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Database already initialized' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return new Response(JSON.stringify({ error: 'Initialization failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 