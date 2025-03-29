export interface Episode {
  id: string;
  title: string;
  description: string;
  show_notes?: string;
  audio_url: string;
  image_url?: string;
  duration: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  audio_url?: string;
  image_url?: string;
}

export interface EpisodeFormData {
  title: string;
  description: string;
  show_notes?: string;
  audio_file?: FileList;
  image_file?: FileList;
  audio_url?: string;
  image_url?: string;
  duration: string;
  published_at: string;
  tags: string[];
}