import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface StickerRequest {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  fulfilled: boolean;
  requested_at: string;
  fulfilled_at: string | null;
  notes: string | null;
}

const StickerRequests: React.FC = () => {
  const [requests, setRequests] = useState<StickerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);
  
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('free_sticker_requests')
        .select('*')
        .order('requested_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching sticker requests:', error);
      setError('Failed to load sticker requests');
    } finally {
      setLoading(false);
    }
  };
  
  const markAsFulfilled = async (id: string) => {
    try {
      const { error } = await supabase
        .from('free_sticker_requests')
        .update({ 
          fulfilled: true,
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, fulfilled: true, fulfilled_at: new Date().toISOString() } : req
      ));
    } catch (error) {
      console.error('Error marking request as fulfilled:', error);
      setError('Failed to update request');
    }
  };
  
  const addNote = async (id: string, note: string) => {
    try {
      const { error } = await supabase
        .from('free_sticker_requests')
        .update({ notes: note })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, notes: note } : req
      ));
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note');
    }
  };
  
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6">
            <div className="h-6 bg-purple-700/20 rounded"></div>
            <div className="h-60 bg-purple-700/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
          <button 
            onClick={() => fetchRequests()}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-300">Free Sticker Requests</h1>
        <button 
          onClick={() => fetchRequests()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Refresh
        </button>
      </div>
      
      {requests.length === 0 ? (
        <div className="bg-purple-700/10 p-6 rounded-lg text-center">
          <p className="text-purple-300">No sticker requests found yet.</p>
          <p className="text-purple-200 text-sm mt-2">
            Users can discover the secret 'sticker' command in the terminal to request a free sticker.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <div 
              key={request.id}
              className={`p-4 rounded-lg ${request.fulfilled ? 'bg-green-700/20' : 'bg-purple-700/20'} shadow-md`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-purple-200">{request.name}</h3>
                <span className={`px-2 py-1 text-xs rounded ${request.fulfilled ? 'bg-green-600' : 'bg-purple-600'}`}>
                  {request.fulfilled ? 'Fulfilled' : 'Pending'}
                </span>
              </div>
              <p className="text-purple-300 text-sm mt-1">{request.email}</p>
              <div className="mt-4 text-purple-300 text-sm space-y-1">
                <p>{request.address}</p>
                <p>{request.city}, {request.state} {request.zip_code}</p>
                <p>{request.country}</p>
              </div>
              <div className="mt-3 text-xs text-purple-400">
                <p>Requested: {new Date(request.requested_at).toLocaleString()}</p>
                {request.fulfilled_at && (
                  <p>Fulfilled: {new Date(request.fulfilled_at).toLocaleString()}</p>
                )}
              </div>
              
              {/* Notes */}
              <div className="mt-4">
                <textarea
                  className="w-full p-2 bg-purple-800/30 rounded border border-purple-700 text-purple-200 text-sm"
                  rows={2}
                  placeholder="Add notes"
                  defaultValue={request.notes || ''}
                  onBlur={(e) => addNote(request.id, e.target.value)}
                ></textarea>
              </div>
              
              {/* Actions */}
              {!request.fulfilled && (
                <div className="mt-3">
                  <button
                    onClick={() => markAsFulfilled(request.id)}
                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm transition-colors"
                  >
                    Mark as Fulfilled
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StickerRequests; 