/*
  # Add terminal commands table

  1. New Tables
    - `terminal_commands`
      - `id` (text, primary key) - Command identifier
      - `name` (text) - Command name
      - `description` (text) - Command description
      - `enabled` (boolean) - Whether command is enabled
      - `category` (text) - Command category
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage commands
    - Add policies for public to read commands
    
  3. Changes
    - Add trigger for auto-updating updated_at timestamp
*/

-- Terminal commands table
CREATE TABLE IF NOT EXISTS terminal_commands (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE terminal_commands ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can manage terminal commands" ON terminal_commands;
    DROP POLICY IF EXISTS "Public can read terminal commands" ON terminal_commands;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policies
CREATE POLICY "Authenticated users can manage terminal commands"
ON terminal_commands
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can read terminal commands"
ON terminal_commands
FOR SELECT
TO anon
USING (true);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_modified_column() CASCADE;

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_terminal_commands_updated_at ON terminal_commands;

-- Create the trigger
CREATE TRIGGER update_terminal_commands_updated_at
BEFORE UPDATE ON terminal_commands
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();