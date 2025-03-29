import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import EpisodeForm from '../../components/admin/EpisodeForm';
import { createEpisode } from '../../services/episodeService';
import type { EpisodeFormData } from '../../types/episode';
import toast from 'react-hot-toast';

const EpisodeCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: EpisodeFormData) => {
    setIsSubmitting(true);
    try {
      await createEpisode(data);
      toast.success('Episode created successfully!');
      navigate('/admin/episodes');
    } catch (error) {
      console.error('Error creating episode:', error);
      toast.error('Failed to create episode. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Episode</h1>
          <p className="mt-2 text-gray-400">
            Create a new podcast episode and upload audio files
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/episodes')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <EpisodeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default EpisodeCreate;