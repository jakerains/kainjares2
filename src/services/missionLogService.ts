import { supabase } from '../lib/supabase';
import { MissionLog, MissionLogInsert, MissionLogUpdate, MissionLogWithTags } from '../types/missionLog';

export const getMissionLogs = async (): Promise<MissionLogWithTags[]> => {
  const { data: missionLogs, error } = await supabase
    .from('mission_logs')
    .select('*')
    .order('published_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching mission logs:', error);
    throw error;
  }
  
  // Fetch tags for all mission logs
  const missionLogsWithTags: MissionLogWithTags[] = [];
  
  for (const log of missionLogs || []) {
    const { data: tagData } = await supabase
      .from('mission_log_tags')
      .select('tags(name)')
      .eq('mission_log_id', log.id);
      
    const tags = tagData?.map(tag => tag.tags.name) || [];
    
    missionLogsWithTags.push({
      ...log,
      tags
    });
  }
  
  return missionLogsWithTags;
};

export const getMissionLogBySlug = async (slug: string): Promise<MissionLogWithTags | null> => {
  const { data, error } = await supabase
    .from('mission_logs')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching mission log:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Fetch tags for the mission log
  const { data: tagData } = await supabase
    .from('mission_log_tags')
    .select('tags(name)')
    .eq('mission_log_id', data.id);
    
  const tags = tagData?.map(tag => tag.tags.name) || [];
  
  return {
    ...data,
    tags
  };
};

export const createMissionLog = async (missionLog: MissionLogInsert, tagIds: string[]): Promise<MissionLog> => {
  // Insert mission log
  const { data, error } = await supabase
    .from('mission_logs')
    .insert(missionLog)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating mission log:', error);
    throw error;
  }
  
  // Insert mission log tags
  if (tagIds.length > 0) {
    const missionLogTags = tagIds.map(tagId => ({
      mission_log_id: data.id,
      tag_id: tagId
    }));
    
    const { error: tagError } = await supabase
      .from('mission_log_tags')
      .insert(missionLogTags);
    
    if (tagError) {
      console.error('Error creating mission log tags:', tagError);
      throw tagError;
    }
  }
  
  return data;
};

export const updateMissionLog = async (id: string, missionLog: MissionLogUpdate, tagIds: string[]): Promise<MissionLog> => {
  // Update mission log
  const { data, error } = await supabase
    .from('mission_logs')
    .update(missionLog)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating mission log:', error);
    throw error;
  }
  
  // Delete existing mission log tags
  const { error: deleteError } = await supabase
    .from('mission_log_tags')
    .delete()
    .eq('mission_log_id', id);
  
  if (deleteError) {
    console.error('Error deleting mission log tags:', deleteError);
    throw deleteError;
  }
  
  // Insert new mission log tags
  if (tagIds.length > 0) {
    const missionLogTags = tagIds.map(tagId => ({
      mission_log_id: id,
      tag_id: tagId
    }));
    
    const { error: tagError } = await supabase
      .from('mission_log_tags')
      .insert(missionLogTags);
    
    if (tagError) {
      console.error('Error creating mission log tags:', tagError);
      throw tagError;
    }
  }
  
  return data;
};

export const deleteMissionLog = async (id: string): Promise<void> => {
  // Delete mission log (mission_log_tags will be deleted via cascade)
  const { error } = await supabase
    .from('mission_logs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting mission log:', error);
    throw error;
  }
}; 