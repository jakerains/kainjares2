-- Create free sticker requests table
CREATE TABLE IF NOT EXISTS free_sticker_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  zip_code VARCHAR(50) NOT NULL,
  country VARCHAR(255) NOT NULL,
  fulfilled BOOLEAN DEFAULT FALSE,
  requested_at TIMESTAMPTZ DEFAULT now(),
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  
  -- Add a constraint to ensure one sticker per email
  CONSTRAINT unique_email UNIQUE (email)
);

-- Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS free_sticker_requests_email_idx ON free_sticker_requests (email);

-- Create an index on the fulfilled column for filtering
CREATE INDEX IF NOT EXISTS free_sticker_requests_fulfilled_idx ON free_sticker_requests (fulfilled);

-- Create an RLS policy to allow anyone to insert but only authenticated users to read
ALTER TABLE free_sticker_requests ENABLE ROW LEVEL SECURITY;

-- Policy for inserting new records (allow anyone)
CREATE POLICY insert_free_sticker_requests ON free_sticker_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for selecting records (only authenticated users)
CREATE POLICY select_free_sticker_requests ON free_sticker_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for updating records (only authenticated users)
CREATE POLICY update_free_sticker_requests ON free_sticker_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add table to the public schema
COMMENT ON TABLE free_sticker_requests IS 'Stores requests for free stickers from users who discovered the secret command'; 