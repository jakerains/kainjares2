import React, { useState, useEffect } from 'react';
import { Mic, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBroadcastStatus();
  }, []);

  const fetchBroadcastStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcast_status')
        .select('*')
        .single();

      if (error) throw error;
      setIsLive(data.is_live);
    } catch (error) {
      console.error('Error fetching broadcast status:', error);
      toast.error('Failed to fetch broadcast status');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBroadcastStatus = async () => {
    try {
      setIsLoading(true);
      const newStatus = !isLive;

      // First get the record to find its ID
      const { data: statusData, error: fetchError } = await supabase
        .from('broadcast_status')
        .select('id')
        .single();

      if (fetchError) throw fetchError;

      if (!statusData) {
        throw new Error('No broadcast status record found');
      }

      // Update using the found ID
      const { error } = await supabase
        .from('broadcast_status')
        .update({ 
          is_live: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', statusData.id);

      if (error) throw error;

      setIsLive(newStatus);
      toast.success(`Broadcast status ${newStatus ? 'ON AIR' : 'OFF AIR'}`);
    } catch (error) {
      console.error('Error updating broadcast status:', error);
      toast.error('Failed to update broadcast status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-gray-400">
          Manage your site settings and preferences
        </p>
      </div>

      {/* Broadcast Control */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Broadcast Status</h2>
        <p className="text-gray-400 mb-6">
          Control the ON AIR / OFF AIR sign displayed on the homepage. 
          When set to ON AIR, visitors will see that you're currently broadcasting.
        </p>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-gray-300">
              Status: <span className={isLive ? 'text-red-400' : 'text-gray-400'}>
                {isLive ? 'ON AIR' : 'OFF AIR'}
              </span>
            </span>
          </div>
          
          <button
            onClick={toggleBroadcastStatus}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isLive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } disabled:opacity-50`}
          >
            <Mic className={`w-5 h-5 ${isLive ? 'animate-pulse' : ''}`} />
            {isLive ? 'END BROADCAST' : 'GO LIVE'}
          </button>
        </div>
        
        <div className="mt-6 bg-gray-700/50 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-300">
            The broadcast status is displayed on the homepage as an "ON AIR" sign when active. 
            This is a visual indicator only and does not affect any actual streaming functionality.
          </p>
        </div>
      </div>
      
      {/* Other settings sections can be added here */}
    </div>
  );
};

export default Settings; 