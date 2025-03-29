import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Edit, Trash2, Calendar } from 'lucide-react';
import type { Episode } from '../../types/episode';

interface EpisodeListProps {
  episodes: Episode[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const EpisodeList = ({ episodes, onDelete, onEdit }: EpisodeListProps) => {
  return (
    <div className="grid gap-6">
      {episodes.map((episode) => (
        <div
          key={episode.id}
          className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-start gap-4 p-6">
            <div className="relative w-48 aspect-video rounded-lg overflow-hidden">
              <img
                src={episode.image_url || 'https://via.placeholder.com/480x270'}
                alt={episode.title}
                className="object-cover w-full h-full"
              />
              <a 
                href={episode.audio_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
              >
                <Play className="w-12 h-12 text-white" />
              </a>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white truncate">
                    {episode.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(episode.published_at).toLocaleDateString()}
                    </span>
                    <span className="text-sm">• {episode.duration}</span>
                  </div>
                  <div className="mt-1">
                    {new Date(episode.published_at) > new Date() ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full">
                        Scheduled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-300 rounded-full">
                        Published
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(episode.id)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(episode.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-gray-400 line-clamp-2">{episode.description}</p>
              {episode.tags && episode.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {episode.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium text-teal-400 bg-teal-400/10 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EpisodeList;