import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import CommandsManager from '../../components/admin/CommandsManager';

const CommandsPage: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Terminal Commands</h1>
      <p className="text-gray-400 mb-6">
        Manage which commands are available in the terminal. 
        Disable commands while you're developing them and enable them when they're ready for users.
      </p>
      
      <CommandsManager />
    </div>
  );
};

export default CommandsPage; 