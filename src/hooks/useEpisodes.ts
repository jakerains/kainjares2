import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Episode } from '../types/episode';

export function useEpisodes(isPublishedOnly = false) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('episodes')
          .select(`
            *,
            episode_tags (
              tag_id,
              tags (name)
            )
          `)
          .order('published_at', { ascending: false });
        
        if (isPublishedOnly) {
          const now = new Date().toISOString();
          query = query.lte('published_at', now);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform the data to match the Episode type
        const transformedEpisodes = data.map(episode => {
          const tags = episode.episode_tags?.map((et: any) => et.tags?.name) || [];
          
          return {
            ...episode,
            tags
          };
        });
        
        setEpisodes(transformedEpisodes);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error('Error fetching episodes:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEpisodes();
  }, [isPublishedOnly]);

  return { episodes, loading, error };
}