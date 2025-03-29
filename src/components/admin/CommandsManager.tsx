import React, { useState } from 'react';
import { useCommands } from '../../context/CommandContext';
import { TerminalCommand } from '../../lib/commandStore';
import { Check, X, ChevronDown, ChevronUp, Plus, Loader2 } from 'lucide-react';

const CommandsManager: React.FC = () => {
  const { commands, toggleCommandEnabled, setCommandsState, isLoading } = useCommands();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'basic': true,
    'utility': false,
    'fun': false,
    'easter-egg': false,
    'admin': false,
    'dev': false
  });
  const [newCommand, setNewCommand] = useState<Partial<TerminalCommand>>({
    name: '',
    description: '',
    category: 'dev',
    enabled: false
  });
  const [isSaving, setIsSaving] = useState(false);

  // Group commands by category
  const commandsByCategory = commands.reduce((acc, command) => {
    const category = command.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, TerminalCommand[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddCommand = async () => {
    if (!newCommand.name || !newCommand.description || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const commandId = newCommand.name.toLowerCase().replace(/\s+/g, '-');
      
      const commandToAdd: TerminalCommand = {
        id: commandId,
        name: newCommand.name,
        description: newCommand.description || '',
        enabled: newCommand.enabled || false,
        category: (newCommand.category as any) || 'dev'
      };
      
      await setCommandsState([...commands, commandToAdd]);
      
      // Reset form
      setNewCommand({
        name: '',
        description: '',
        category: 'dev',
        enabled: false
      });
    } catch (error) {
      console.error('Error adding command:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-gray-200 rounded-lg p-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-teal-500 mb-4" />
          <p className="text-lg">Loading commands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-200 rounded-lg p-6 h-full">
      <h1 className="text-2xl font-bold mb-6 text-gradient">Terminal Commands Manager</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Command</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 p-4 rounded-lg">
          <div>
            <label className="block text-gray-400 mb-1">Command Name</label>
            <input 
              type="text" 
              value={newCommand.name}
              onChange={e => setNewCommand({...newCommand, name: e.target.value})}
              className="w-full bg-gray-700 text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="my-command"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <input 
              type="text" 
              value={newCommand.description}
              onChange={e => setNewCommand({...newCommand, description: e.target.value})}
              className="w-full bg-gray-700 text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="What the command does"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-1">Category</label>
            <select 
              value={newCommand.category}
              onChange={e => setNewCommand({...newCommand, category: e.target.value})}
              className="w-full bg-gray-700 text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="basic">Basic</option>
              <option value="utility">Utility</option>
              <option value="fun">Fun</option>
              <option value="easter-egg">Easter Egg</option>
              <option value="admin">Admin</option>
              <option value="dev">Development</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={newCommand.enabled}
                onChange={e => setNewCommand({...newCommand, enabled: e.target.checked})}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              <span className="ml-3 text-gray-300">Enabled</span>
            </label>
          </div>
          
          <div className="md:col-span-2 flex justify-end">
            <button 
              onClick={handleAddCommand}
              disabled={!newCommand.name || !newCommand.description || isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSaving ? 'Adding...' : 'Add Command'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto pb-8">
        <h2 className="text-xl font-semibold mb-4">Manage Existing Commands</h2>
        
        {Object.entries(commandsByCategory).map(([category, categoryCommands]) => (
          <div key={category} className="mb-4 border border-gray-700 rounded-lg overflow-hidden">
            <div 
              className="bg-gray-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-750"
              onClick={() => toggleCategory(category)}
            >
              <h3 className="text-lg font-medium capitalize">{category} Commands ({categoryCommands.length})</h3>
              <button className="text-gray-400">
                {expandedCategories[category] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {expandedCategories[category] && (
              <div className="p-4 bg-gray-850">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2 px-4">Name</th>
                        <th className="text-left py-2 px-4">Description</th>
                        <th className="text-center py-2 px-4 w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryCommands.map(command => (
                        <tr key={command.id} className="border-b border-gray-700 last:border-b-0">
                          <td className="py-3 px-4 font-mono">{command.name}</td>
                          <td className="py-3 px-4">{command.description}</td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => toggleCommandEnabled(command.id)}
                              className={`w-full flex items-center justify-center py-1 px-3 rounded ${
                                command.enabled 
                                  ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                                  : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                              }`}
                            >
                              {command.enabled ? (
                                <Check size={16} className="mr-1" />
                              ) : (
                                <X size={16} className="mr-1" />
                              )}
                              {command.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommandsManager; 