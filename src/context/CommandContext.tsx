import React, { createContext, useContext, useState, useEffect } from 'react';
import CommandStore, { TerminalCommand, toggleCommand, saveCommands } from '../lib/commandStore';

interface CommandContextType {
  commands: TerminalCommand[];
  toggleCommandEnabled: (commandId: string) => Promise<void>;
  isCommandEnabled: (commandName: string) => boolean;
  getEnabledCommands: () => TerminalCommand[];
  setCommandsState: (commands: TerminalCommand[]) => Promise<void>;
  getCommandsByCategory: (category: string) => TerminalCommand[];
  isLoading: boolean;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export const CommandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [commands, setCommands] = useState<TerminalCommand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load commands on initial render
    const loadCommands = async () => {
      setIsLoading(true);
      try {
        const loadedCommands = await CommandStore.getCommands();
        setCommands(loadedCommands);
      } catch (error) {
        console.error('Error loading commands:', error);
        // If loading from Supabase fails, we'll have fallback data from localStorage
      } finally {
        setIsLoading(false);
      }
    };

    loadCommands();
  }, []);

  const toggleCommandEnabled = async (commandId: string) => {
    try {
      const updatedCommands = await toggleCommand(commands, commandId);
      setCommands(updatedCommands);
    } catch (error) {
      console.error('Error toggling command:', error);
    }
  };

  const isCommandEnabled = (commandName: string) => {
    const command = commands.find(cmd => cmd.name === commandName);
    return command ? command.enabled : false;
  };

  const getEnabledCommands = () => {
    return commands.filter(cmd => cmd.enabled);
  };

  const setCommandsState = async (newCommands: TerminalCommand[]) => {
    setCommands(newCommands);
    await saveCommands(newCommands);
  };

  const getCommandsByCategory = (category: string) => {
    return commands.filter(cmd => cmd.category === category);
  };

  const value = {
    commands,
    toggleCommandEnabled,
    isCommandEnabled,
    getEnabledCommands,
    setCommandsState,
    getCommandsByCategory,
    isLoading
  };

  return (
    <CommandContext.Provider value={value}>
      {children}
    </CommandContext.Provider>
  );
};

export const useCommands = () => {
  const context = useContext(CommandContext);
  if (context === undefined) {
    throw new Error('useCommands must be used within a CommandProvider');
  }
  return context;
};

export default CommandContext; 