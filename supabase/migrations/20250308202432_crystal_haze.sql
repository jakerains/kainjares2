/*
  # Add admin user

  1. Changes
    - Adds admin user (Jake) directly to the database
    - Uses a safer approach that works with Supabase's constraints
*/

-- Add admin user using supabase_admin role
BEGIN;

-- First check if the user already exists in auth.users
DO $$
DECLARE
  user_exists BOOLEAN;
  admin_id UUID;
BEGIN
  -- Check if user exists in auth schema
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'jakerains@gmail.com'
  ) INTO user_exists;

  -- If user doesn't exist, create the user in auth schema using auth.users() function
  IF NOT user_exists THEN
    admin_id := gen_random_uuid();
    
    -- Insert into auth.users directly
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      aud,
      role
    )
    VALUES (
      admin_id,
      (SELECT instance_id FROM auth.instances LIMIT 1),
      'jakerains@gmail.com',
      crypt('Duncan16710!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Jake"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  ELSE
    -- Get the existing user's ID
    SELECT id INTO admin_id FROM auth.users WHERE email = 'jakerains@gmail.com';
  END IF;

  -- Now insert into public.users table if not already there
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'jakerains@gmail.com') THEN
    INSERT INTO public.users (
      id,
      email,
      password,
      name,
      created_at,
      updated_at
    )
    VALUES (
      admin_id,
      'jakerains@gmail.com',
      'stored-in-auth',
      'Jake',
      now(),
      now()
    );
  END IF;
END $$;

COMMIT;