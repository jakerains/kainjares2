/*
  # Add category system to store

  1. New Tables
    - `product_categories`
      - `id` (text, primary key)
      - `name` (text)
      - `description` (text)
      - `slug` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add category_id to products table
    - Add foreign key constraint
    - Add RLS policies for categories

  3. Security
    - Enable RLS on new table
    - Add policies for admin management
    - Add policies for public read access
*/

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add category_id to products
ALTER TABLE products 
ADD COLUMN category_id text REFERENCES product_categories(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for product categories
CREATE POLICY "Admins can manage product categories"
ON product_categories
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

CREATE POLICY "Anyone can read product categories"
ON product_categories
FOR SELECT
TO public
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial categories
INSERT INTO product_categories (id, name, description, slug, image_url) VALUES
  ('apparel', 'Apparel', 'Alien-approved clothing and accessories', 'apparel', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070'),
  ('tech', 'Tech Gadgets', 'Advanced technology from across the galaxy', 'tech', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070'),
  ('books', 'Books & Media', 'Knowledge from the cosmos', 'books', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070'),
  ('collectibles', 'Collectibles', 'Rare items from other worlds', 'collectibles', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=2070');