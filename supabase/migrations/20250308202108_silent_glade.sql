/*
  # Create initial schema for podcast platform

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `episodes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `show_notes` (text, nullable)
      - `audio_url` (text)
      - `image_url` (text, nullable)
      - `duration` (text, nullable)
      - `published_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `episode_tags`
      - `episode_id` (uuid, foreign key to episodes.id)
      - `tag_id` (uuid, foreign key to tags.id)
      - Composite primary key (episode_id, tag_id)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Add policies for public access to published episodes
*/

-- Users table (uses Supabase Auth under the hood)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  show_notes text,
  audio_url text NOT NULL,
  image_url text,
  duration text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on published_at for efficient querying
CREATE INDEX IF NOT EXISTS episodes_published_idx ON episodes (published_at);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Episode Tags junction table
CREATE TABLE IF NOT EXISTS episode_tags (
  episode_id uuid REFERENCES episodes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (episode_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_tags ENABLE ROW LEVEL SECURITY;

-- User Policies - Create only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own data'
    ) THEN
        CREATE POLICY "Users can read own data" 
        ON users 
        FOR SELECT 
        TO authenticated 
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own data'
    ) THEN
        CREATE POLICY "Users can update own data" 
        ON users 
        FOR UPDATE 
        TO authenticated 
        USING (auth.uid() = id);
    END IF;
END
$$;

-- Episode Policies - Create only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'episodes' AND policyname = 'Authenticated users can read all episodes'
    ) THEN
        CREATE POLICY "Authenticated users can read all episodes" 
        ON episodes 
        FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'episodes' AND policyname = 'Authenticated users can insert episodes'
    ) THEN
        CREATE POLICY "Authenticated users can insert episodes" 
        ON episodes 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'episodes' AND policyname = 'Authenticated users can update episodes'
    ) THEN
        CREATE POLICY "Authenticated users can update episodes" 
        ON episodes 
        FOR UPDATE 
        TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'episodes' AND policyname = 'Authenticated users can delete episodes'
    ) THEN
        CREATE POLICY "Authenticated users can delete episodes" 
        ON episodes 
        FOR DELETE 
        TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'episodes' AND policyname = 'Public can read published episodes'
    ) THEN
        CREATE POLICY "Public can read published episodes" 
        ON episodes 
        FOR SELECT 
        TO anon 
        USING (published_at <= now());
    END IF;
END
$$;

-- Tag Policies - Create only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'tags' AND policyname = 'Authenticated users can manage tags'
    ) THEN
        CREATE POLICY "Authenticated users can manage tags" 
        ON tags 
        FOR ALL 
        TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'tags' AND policyname = 'Public can read tags'
    ) THEN
        CREATE POLICY "Public can read tags" 
        ON tags 
        FOR SELECT 
        TO anon 
        USING (true);
    END IF;
END
$$;

-- Episode Tags Policies - Create only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'episode_tags' AND policyname = 'Authenticated users can manage episode_tags'
    ) THEN
        CREATE POLICY "Authenticated users can manage episode_tags" 
        ON episode_tags 
        FOR ALL 
        TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'episode_tags' AND policyname = 'Public can read episode_tags'
    ) THEN
        CREATE POLICY "Public can read episode_tags" 
        ON episode_tags 
        FOR SELECT 
        TO anon 
        USING (true);
    END IF;
END
$$;