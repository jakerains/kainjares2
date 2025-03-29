/*
  # Add broadcast status table and settings

  1. New Tables
    - `broadcast_status`
      - `id` (uuid, primary key)
      - `is_live` (boolean)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references users)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage status
    - Add policies for public to read status
*/

-- Broadcast status table
CREATE TABLE IF NOT EXISTS broadcast_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_live boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE broadcast_status ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can manage broadcast status"
ON broadcast_status
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can read broadcast status"
ON broadcast_status
FOR SELECT
TO anon
USING (true);

-- Insert initial status
INSERT INTO broadcast_status (is_live, updated_at)
VALUES (false, now())
ON CONFLICT DO NOTHING;