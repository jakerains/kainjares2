/*
  # Add product categories table and initial data

  1. New Tables
    - `product_categories`
      - `id` (text, primary key)
      - `name` (text)
      - `description` (text)
      - `slug` (text, unique)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for admin management
    - Add policies for public reading
*/

-- Create product categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can manage product categories" ON product_categories;
    DROP POLICY IF EXISTS "Anyone can read product categories" ON product_categories;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policies for product categories
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_categories' 
        AND policyname = 'Admins can manage product categories'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_categories' 
        AND policyname = 'Anyone can read product categories'
    ) THEN
        CREATE POLICY "Anyone can read product categories"
        ON product_categories
        FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;

-- Add trigger for updated_at
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories including Stickers
DO $$
BEGIN
    -- Apparel category
    INSERT INTO product_categories (id, name, description, slug, image_url)
    VALUES (
        'apparel',
        'Apparel',
        'Alien-approved clothing and accessories',
        'apparel',
        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        slug = EXCLUDED.slug,
        image_url = EXCLUDED.image_url,
        updated_at = now();

    -- Tech category
    INSERT INTO product_categories (id, name, description, slug, image_url)
    VALUES (
        'tech',
        'Tech Gadgets',
        'Advanced technology from across the galaxy',
        'tech',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        slug = EXCLUDED.slug,
        image_url = EXCLUDED.image_url,
        updated_at = now();

    -- Books category
    INSERT INTO product_categories (id, name, description, slug, image_url)
    VALUES (
        'books',
        'Books & Media',
        'Knowledge from the cosmos',
        'books',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        slug = EXCLUDED.slug,
        image_url = EXCLUDED.image_url,
        updated_at = now();

    -- Stickers category
    INSERT INTO product_categories (id, name, description, slug, image_url)
    VALUES (
        'stickers',
        'Stickers',
        'Cosmic stickers to decorate your world',
        'stickers',
        'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=2066'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        slug = EXCLUDED.slug,
        image_url = EXCLUDED.image_url,
        updated_at = now();

    -- Collectibles category
    INSERT INTO product_categories (id, name, description, slug, image_url)
    VALUES (
        'collectibles',
        'Collectibles',
        'Rare items from other worlds',
        'collectibles',
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=2070'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        slug = EXCLUDED.slug,
        image_url = EXCLUDED.image_url,
        updated_at = now();
END $$;