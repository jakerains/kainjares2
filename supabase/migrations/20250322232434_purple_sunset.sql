/*
  # Add virtual product support and image storage

  1. Changes
    - Add `is_virtual` column to products table to indicate products that don't require inventory
    - Add `images` table for product image management
    - Add policies and functions for image handling
*/

-- Add is_virtual column to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_virtual boolean DEFAULT false;

-- Update inventory_status to handle virtual products
DROP TRIGGER IF EXISTS update_inventory_status ON products;

ALTER TABLE products 
DROP COLUMN IF EXISTS inventory_status;

ALTER TABLE products 
ADD COLUMN inventory_status text GENERATED ALWAYS AS (
  CASE
    WHEN is_virtual THEN 'in_stock'
    WHEN inventory <= 0 THEN 'out_of_stock'
    WHEN inventory < 10 THEN 'low_stock'
    ELSE 'in_stock'
  END
) STORED;

-- Create images table for product images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on images table
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create policies for product images
CREATE POLICY "Admins can manage product images"
ON product_images
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

CREATE POLICY "Anyone can view product images"
ON product_images
FOR SELECT
TO public
USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- Function to reorder images
CREATE OR REPLACE FUNCTION reorder_product_images(p_product_id text, p_image_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE product_images
  SET position = array_position(p_image_ids, id) - 1
  WHERE product_id = p_product_id
  AND id = ANY(p_image_ids);
END;
$$;