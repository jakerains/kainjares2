type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password?: string
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password?: string
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password?: string
          name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      episodes: {
        Row: {
          id: string
          title: string
          description: string
          show_notes: string | null
          audio_url: string
          image_url: string | null
          duration: string | null
          published_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          show_notes?: string | null
          audio_url: string
          image_url?: string | null
          duration?: string | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          show_notes?: string | null
          audio_url?: string
          image_url?: string | null
          duration?: string | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_entries: {
        Row: {
          id: number
          title: string
          description: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          imageUrl: string
          link: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          imageUrl: string
          link: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          category?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          imageUrl?: string
          link?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
        }
        Relationships: []
      }
      episode_tags: {
        Row: {
          episode_id: string
          tag_id: string
        }
        Insert: {
          episode_id: string
          tag_id: string
        }
        Update: {
          episode_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_tags_episode_id_fkey"
            columns: ["episode_id"]
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      mission_logs: {
        Row: {
          id: string
          title: string
          excerpt: string
          content: string
          read_time: string
          author_name: string
          author_avatar_url: string | null
          image_url: string | null
          slug: string
          published_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          excerpt: string
          content: string
          read_time: string
          author_name: string
          author_avatar_url?: string | null
          image_url?: string | null
          slug: string
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string
          content?: string
          read_time?: string
          author_name?: string
          author_avatar_url?: string | null
          image_url?: string | null
          slug?: string
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mission_log_tags: {
        Row: {
          mission_log_id: string
          tag_id: string
        }
        Insert: {
          mission_log_id: string
          tag_id: string
        }
        Update: {
          mission_log_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_log_tags_mission_log_id_fkey"
            columns: ["mission_log_id"]
            referencedRelation: "mission_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_log_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      free_sticker_requests: {
        Row: {
          id: string
          name: string
          email: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          fulfilled: boolean
          requested_at: string
          fulfilled_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          fulfilled?: boolean
          requested_at?: string
          fulfilled_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          fulfilled?: boolean
          requested_at?: string
          fulfilled_at?: string | null
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}