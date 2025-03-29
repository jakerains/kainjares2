import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import EpisodeList from '../../components/admin/EpisodeList';
import { useEpisodes } from '../../hooks/useEpisodes';
import { deleteEpisode } from '../../services/episodeService';
import toast from 'react-hot-toast';

const Episodes = () => {
  const navigate = useNavigate();
  const { episodes, loading, error } = useEpisodes(false); // Get all episodes, including unpublished
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this episode? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteEpisode(id);
      toast.success('Episode deleted successfully!');
      // Refresh the page to update the episode list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting episode:', error);
      toast.error('Failed to delete episode. Please try again.');
    }
  };

  const filteredEpisodes = episodes.filter((episode) =>
    episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    episode.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (episode.tags && episode.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Episodes</h1>
          <p className="mt-2 text-gray-400">
            Manage your podcast episodes
          </p>
        </div>
        <Link
          to="/admin/episodes/create"
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Episode
        </Link>
      </div>

      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search episodes by title, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-xl text-red-400">Failed to load episodes</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredEpisodes.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          {searchTerm ? (
            <p className="text-xl text-gray-400">No episodes matching "{searchTerm}"</p>
          ) : (
            <>
              <p className="text-xl text-gray-400">No episodes yet</p>
              <Link
                to="/admin/episodes/create"
                className="inline-block mt-4 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
              >
                Create Your First Episode
              </Link>
            </>
          )}
        </div>
      ) : (
        <EpisodeList 
          episodes={filteredEpisodes} 
          onDelete={handleDelete}
          onEdit={(id) => navigate(`/admin/episodes/${id}/edit`)}
        />
      )}
    </div>
  );
};

export default Episodes;