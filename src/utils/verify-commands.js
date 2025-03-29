// Verify all commands are properly implemented
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the command store file
const commandStorePath = path.resolve(__dirname, '../lib/commandStore.ts');
const commandStore = fs.readFileSync(commandStorePath, 'utf8');

// Read the terminal implementation
const terminalPath = path.resolve(__dirname, '../components/TechTerminal.tsx');
const terminal = fs.readFileSync(terminalPath, 'utf8');

// Extract commands from commandStore
const commandRegex = /id:\s+'([^']+)',\s+name:\s+'([^']+)',/g;
const commands = [];
let match;

while ((match = commandRegex.exec(commandStore)) !== null) {
  commands.push({
    id: match[1],
    name: match[2]
  });
}

console.log(`Found ${commands.length} commands in commandStore.ts`);

// Check for command handling in TechTerminal
const switchCaseRegex = /case\s+'([^']+)':/g;
const handledCommands = [];

while ((match = switchCaseRegex.exec(terminal)) !== null) {
  handledCommands.push(match[1]);
}

console.log(`Found ${handledCommands.length} command handlers in TechTerminal.tsx`);

// Find commands without handlers
const missingHandlers = commands.filter(cmd => !handledCommands.includes(cmd.name));

if (missingHandlers.length > 0) {
  console.log('\nWARNING: The following commands are defined but have no handler:');
  missingHandlers.forEach(cmd => {
    console.log(` - ${cmd.name} (id: ${cmd.id})`);
  });
} else {
  console.log('\nAll commands have handlers! 👍');
}

// Find handlers without commands
const extraHandlers = handledCommands.filter(handler => !commands.some(cmd => cmd.name === handler));

if (extraHandlers.length > 0) {
  console.log('\nNOTE: The following case handlers exist but have no matching command:');
  extraHandlers.forEach(handler => {
    console.log(` - ${handler}`);
  });
}

console.log('\nCommand verification complete.'); 