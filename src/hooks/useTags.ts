import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTags() {
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setTags(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error('Error fetching tags:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTags();
  }, []);

  const createTag = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTags(prev => [...prev, data[0]]);
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Error creating tag:', err);
      throw err;
    }
  };

  return { tags, loading, error, createTag };
}