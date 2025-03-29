/*
  # Add knowledge entries table

  1. New Tables
    - `knowledge_entries`
      - `id` (serial, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `difficulty` (text, check constraint: beginner/intermediate/advanced)
      - `imageUrl` (text)
      - `link` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for anonymous users to read entries
    - Add policies for authenticated users to manage entries
    
  3. Changes
    - Add trigger for auto-updating updated_at timestamp
    - Add sample knowledge entries
*/

-- Create knowledge_entries table
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  imageUrl TEXT NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow anonymous users to read knowledge entries" ON public.knowledge_entries;
    DROP POLICY IF EXISTS "Allow authenticated users to manage knowledge entries" ON public.knowledge_entries;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policies
CREATE POLICY "Allow anonymous users to read knowledge entries"
  ON public.knowledge_entries
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to manage knowledge entries"
  ON public.knowledge_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.set_updated_at_timestamp() CASCADE;

-- Create function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_knowledge_entries_updated_at ON public.knowledge_entries;

-- Add trigger for auto-updating updated_at timestamp
CREATE TRIGGER set_knowledge_entries_updated_at
  BEFORE UPDATE ON public.knowledge_entries
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at_timestamp();

-- Add sample knowledge entries
INSERT INTO public.knowledge_entries (title, description, category, difficulty, imageUrl, link) VALUES
  ('Introduction to Non-Euclidean AI Geometries', 'Understanding how AI models can be structured in spaces that defy traditional mathematical principles.', 'Theory', 'intermediate', 'https://images.unsplash.com/photo-1650989826579-33e962acfe57?q=80&w=1932', '/knowledge/non-euclidean-ai'),
  ('Alien Machine Learning 101', 'A beginner''s guide to how intergalactic civilizations approach artificial intelligence and machine learning.', 'Fundamentals', 'beginner', 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974', '/knowledge/alien-ml-101'),
  ('Quantum Consciousness and AI Sentience', 'Exploring the theoretical frameworks for true AI consciousness using quantum principles from distant galaxies.', 'Philosophy', 'advanced', 'https://images.unsplash.com/photo-1639628735078-ed2f038a193e?q=80&w=1974', '/knowledge/quantum-consciousness'),
  ('Telepathic Neural Interfaces', 'How to design AI systems that can interact directly with conscious thought patterns.', 'Practical', 'advanced', 'https://images.unsplash.com/photo-1631700611307-37dbcb89ef7e?q=80&w=1974', '/knowledge/telepathic-interfaces'),
  ('Multidimensional Data Structures', 'Implementing data storage and retrieval systems that operate beyond three-dimensional constraints.', 'Programming', 'intermediate', 'https://images.unsplash.com/photo-1580706483913-b6ea7db483a0?q=80&w=1974', '/knowledge/multidimensional-data'),
  ('Emotion Recognition Across Species', 'Adapting sentiment analysis models to work with non-human communication and emotional patterns.', 'Practical', 'beginner', 'https://images.unsplash.com/photo-1662044858657-0909231a1a4c?q=80&w=1974', '/knowledge/cross-species-emotion'),
  ('Hyperspace Computing Fundamentals', 'Core principles for developing AI algorithms that operate in fold-space and hyperspace environments.', 'Theory', 'advanced', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2022', '/knowledge/hyperspace-computing'),
  ('Universal Translation Matrices', 'Building comprehensive translation systems that work across any language, including non-verbal communication.', 'Programming', 'intermediate', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1471', '/knowledge/universal-translation'),
  ('Ethical AI Deployment in Developing Civilizations', 'Guidelines for introducing advanced AI into societies at various technological development stages.', 'Ethics', 'beginner', 'https://images.unsplash.com/photo-1689016538431-706dd0e61272?q=80&w=1974', '/knowledge/ethical-ai-deployment');