/*
  # Fix product RLS policies and admin role checks

  1. Changes
    - Drop existing product policies
    - Create new policies with proper admin role checks
    - Add is_virtual column if not exists
    - Update inventory status calculation
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can manage products" ON products;
    DROP POLICY IF EXISTS "Anyone can read products" ON products;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create new policies with proper admin role checks
CREATE POLICY "Admins can manage products"
ON products
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

CREATE POLICY "Anyone can read products"
ON products
FOR SELECT
TO public
USING (true);

-- Add is_virtual column if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_virtual boolean DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN 
        NULL;
END $$;

-- Update inventory status to handle virtual products
DO $$ 
BEGIN
    -- Drop the existing column if it exists
    ALTER TABLE products DROP COLUMN IF EXISTS inventory_status;
    
    -- Add the new generated column
    ALTER TABLE products ADD COLUMN inventory_status text GENERATED ALWAYS AS (
      CASE
        WHEN is_virtual THEN 'in_stock'
        WHEN inventory <= 0 THEN 'out_of_stock'
        WHEN inventory < 10 THEN 'low_stock'
        ELSE 'in_stock'
      END
    ) STORED;
EXCEPTION
    WHEN duplicate_column THEN 
        NULL;
END $$;