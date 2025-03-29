import { Database } from './database';

export type MissionLog = Database['public']['Tables']['mission_logs']['Row'];
export type MissionLogInsert = Database['public']['Tables']['mission_logs']['Insert'];
export type MissionLogUpdate = Database['public']['Tables']['mission_logs']['Update'];

export interface MissionLogWithTags extends MissionLog {
  tags: string[];
}

export interface MissionLogCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  imageUrl: string;
  slug: string;
  tags: string[];
} 