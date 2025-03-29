/*
  # Fix product RLS policies and admin role setup

  1. Changes
    - Ensure admin role exists in profiles table
    - Update RLS policies for products table
    - Fix admin role check in policies
*/

-- First ensure the admin role exists and is properly set
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the admin user's ID
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'jakerains@gmail.com';

    -- If admin user exists, ensure they have admin role
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (id) DO UPDATE
        SET role = 'admin';
    END IF;
END $$;

-- Drop existing product policies
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;

-- Create new policies with proper admin role checks
CREATE POLICY "Admins can manage products"
ON products
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Anyone can read products"
ON products
FOR SELECT
TO public
USING (true);

-- Ensure the profiles table has the correct role check
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role = ANY (ARRAY['user'::text, 'admin'::text]));