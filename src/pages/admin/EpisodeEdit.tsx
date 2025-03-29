import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import EpisodeForm from '../../components/admin/EpisodeForm';
import { getEpisodeById, updateEpisode, deleteEpisode } from '../../services/episodeService';
import type { Episode, EpisodeFormData } from '../../types/episode';
import toast from 'react-hot-toast';

const EpisodeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchEpisode() {
      try {
        const data = await getEpisodeById(id);
        setEpisode(data);
      } catch (error) {
        console.error('Error fetching episode:', error);
        toast.error('Failed to load episode data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEpisode();
  }, [id]);

  const handleSubmit = async (data: EpisodeFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateEpisode(id, data);
      toast.success('Episode updated successfully!');
      navigate('/admin/episodes');
    } catch (error) {
      console.error('Error updating episode:', error);
      toast.error('Failed to update episode. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!window.confirm('Are you sure you want to delete this episode? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteEpisode(id);
      toast.success('Episode deleted successfully!');
      navigate('/admin/episodes');
    } catch (error) {
      console.error('Error deleting episode:', error);
      toast.error('Failed to delete episode. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-400">Episode not found</p>
        <button
          onClick={() => navigate('/admin/episodes')}
          className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Back to Episodes
        </button>
      </div>
    );
  }

  // Transform episode data for form
  const initialData: Partial<EpisodeFormData> = {
    title: episode.title,
    description: episode.description,
    show_notes: episode.show_notes,
    duration: episode.duration,
    published_at: episode.published_at ? new Date(episode.published_at).toISOString().slice(0, 16) : '',
    tags: episode.tags || [],
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Episode</h1>
          <p className="mt-2 text-gray-400">
            Update episode details and media files
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/episodes')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-70"
          >
            <Trash2 className="w-5 h-5" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <EpisodeForm 
          initialData={{
            ...initialData,
            // Add existing URLs for reference
            audio_url: episode.audio_url,
            image_url: episode.image_url
          }} 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default EpisodeEdit;