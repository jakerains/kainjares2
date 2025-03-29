import { supabase } from '../lib/supabase';
import { uploadToS3 } from '../lib/s3';
import type { Episode, EpisodeFormData } from '../types/episode';

// Get all episodes
const getEpisodes = async (isPublishedOnly = false): Promise<Episode[]> => {
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
  
  if (error) {
    throw new Error(`Error fetching episodes: ${error.message}`);
  }
  
  // Transform the data to match the Episode type
  return data.map(episode => {
    const tags = episode.episode_tags?.map((et: any) => et.tags?.name) || [];
    
    return {
      ...episode,
      tags
    };
  });
};

// Get a single episode by ID
export const getEpisodeById = async (id: string): Promise<Episode> => {
  const { data, error } = await supabase
    .from('episodes')
    .select(`
      *,
      episode_tags (
        tag_id,
        tags (name)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Error fetching episode: ${error.message}`);
  }
  
  const tags = data.episode_tags?.map((et: any) => et.tags?.name) || [];
  
  return {
    ...data,
    tags
  };
};

// Create a new episode
export const createEpisode = async (formData: EpisodeFormData): Promise<Episode> => {
  try {
    // Handle file uploads to S3 instead of Supabase Storage
    let audioUrl = '';
    let imageUrl = '';
    
    if (formData.audio_file?.[0]) {
      try {
        console.log('Starting audio file upload to S3');
        const file = formData.audio_file[0];
        
        // Validate file type
        const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
        if (!validAudioTypes.includes(file.type)) {
          throw new Error('Invalid file type. Please upload an audio file.');
        }
        
        // Validate file size (100MB limit)
        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
        if (file.size > MAX_FILE_SIZE) {
          throw new Error('File size too large. Maximum size is 100MB.');
        }
        
        audioUrl = await uploadToS3(formData.audio_file[0], 'audio');
        console.log('Audio file uploaded successfully:', audioUrl);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload audio file. Please check your internet connection and try again.';
        console.error('S3 audio upload failed:', message);
        throw new Error(message);
      }
    } else {
      throw new Error('Audio file is required');
    }
    
    if (formData.image_file?.[0]) {
      try {
        console.log('Starting image file upload to S3');
        imageUrl = await uploadToS3(formData.image_file[0], 'images');
        console.log('Image file uploaded successfully:', imageUrl);
      } catch (error) {
        console.error('S3 image upload failed:', error);
        // Continue even if image upload fails, but log it
      }
    }
    
    // Use a default image if upload failed or no image was provided
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1589903308904-1010c2294adc';
    }
    
    console.log('Creating episode in Supabase with:', {
      title: formData.title,
      audioUrl,
      imageUrl
    });
    
    // Insert the episode into Supabase
    const { data, error } = await supabase
      .from('episodes')
      .insert([
        {
          title: formData.title,
          description: formData.description,
          show_notes: formData.show_notes,
          audio_url: audioUrl,
          image_url: imageUrl,
          duration: formData.duration,
          published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase episode creation error:', error);
      throw new Error(`Error creating episode: ${error.message}`);
    }
    
    // Handle tags if available
    if (formData.tags && formData.tags.length > 0) {
      await handleEpisodeTags(data.id, formData.tags);
    }
    
    return {
      ...data,
      tags: formData.tags || []
    };
  } catch (error) {
    console.error('Error in createEpisode:', error);
    throw error;
  }
};

// Update an existing episode
export const updateEpisode = async (id: string, formData: EpisodeFormData): Promise<Episode> => {
  try {
    // Get the current episode data
    const { data: currentEpisode } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();
    
    // Handle file uploads if needed using S3
    let audioUrl = currentEpisode.audio_url;
    let imageUrl = currentEpisode.image_url;
    
    if (formData.audio_file?.[0]) {
      try {
        console.log('Updating audio file in S3');
        audioUrl = await uploadToS3(formData.audio_file[0], 'audio');
        console.log('Audio file updated successfully:', audioUrl);
      } catch (error) {
        console.error('S3 audio update failed:', error);
        throw new Error('Failed to update audio file. Please try again.');
      }
    }
    
    if (formData.image_file?.[0]) {
      try {
        console.log('Updating image file in S3');
        imageUrl = await uploadToS3(formData.image_file[0], 'images');
        console.log('Image file updated successfully:', imageUrl);
      } catch (error) {
        console.error('S3 image update failed:', error);
        // Continue even if image upload fails, but log it
      }
    }
    
    console.log('Updating episode in Supabase:', {
      id,
      title: formData.title,
      audioUrl,
      imageUrl
    });
    
    // Update the episode
    const { data, error } = await supabase
      .from('episodes')
      .update({
        title: formData.title,
        description: formData.description,
        show_notes: formData.show_notes,
        audio_url: audioUrl,
        image_url: imageUrl,
        duration: formData.duration,
        published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase episode update error:', error);
      throw new Error(`Error updating episode: ${error.message}`);
    }
    
    // Handle tags if available
    if (formData.tags) {
      await handleEpisodeTags(id, formData.tags);
    }
    
    return {
      ...data,
      tags: formData.tags || []
    };
  } catch (error) {
    console.error('Error in updateEpisode:', error);
    throw error;
  }
};

// Helper function to handle episode tags
const handleEpisodeTags = async (episodeId: string, tagNames: string[]) => {
  try {
    // First, remove all existing episode_tag relations
    await supabase
      .from('episode_tags')
      .delete()
      .eq('episode_id', episodeId);
    
    // Then, add new relations
    for (const tagName of tagNames) {
      // Check if tag exists
      const { data: existingTags } = await supabase
        .from('tags')
        .select('*')
        .eq('name', tagName);
      
      let tagId;
      if (existingTags && existingTags.length > 0) {
        tagId = existingTags[0].id;
      } else {
        // Create tag if it doesn't exist
        const { data: newTag } = await supabase
          .from('tags')
          .insert([{ name: tagName }])
          .select()
          .single();
        
        tagId = newTag.id;
      }
      
      // Create episode_tag relation
      await supabase
        .from('episode_tags')
        .insert([
          { episode_id: episodeId, tag_id: tagId }
        ]);
    }
  } catch (error) {
    console.error('Error handling episode tags:', error);
    throw error;
  }
};

// Delete an episode
export const deleteEpisode = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('episodes')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(`Error deleting episode: ${error.message}`);
  }
};