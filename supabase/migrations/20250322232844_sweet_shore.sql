/*
  # Add shipping and checkout configuration tables

  1. New Tables
    - `shipping_zones` - Define shipping regions and rates
    - `shipping_methods` - Available shipping methods per zone
    - `checkout_settings` - Store-wide checkout configuration
*/

-- Shipping zones table
CREATE TABLE IF NOT EXISTS shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  countries text[] NOT NULL,
  regions text[],
  postcodes text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipping methods table
CREATE TABLE IF NOT EXISTS shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  free_shipping_threshold numeric(10,2),
  min_order_amount numeric(10,2) DEFAULT 0,
  max_order_amount numeric(10,2),
  is_enabled boolean DEFAULT true,
  estimated_days_min integer,
  estimated_days_max integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Checkout settings table
CREATE TABLE IF NOT EXISTS checkout_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  minimum_order_amount numeric(10,2) DEFAULT 0,
  maximum_order_amount numeric(10,2),
  allow_guest_checkout boolean DEFAULT true,
  require_phone boolean DEFAULT false,
  require_shipping_phone boolean DEFAULT false,
  terms_url text,
  privacy_url text,
  success_url text,
  cancel_url text,
  stripe_public_key text,
  stripe_webhook_secret text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000000')
);

-- Enable RLS
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage shipping zones"
ON shipping_zones
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

CREATE POLICY "Anyone can read shipping zones"
ON shipping_zones
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage shipping methods"
ON shipping_methods
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

CREATE POLICY "Anyone can read shipping methods"
ON shipping_methods
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage checkout settings"
ON checkout_settings
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

CREATE POLICY "Anyone can read checkout settings"
ON checkout_settings
FOR SELECT
TO public
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_shipping_zones_updated_at
  BEFORE UPDATE ON shipping_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_methods_updated_at
  BEFORE UPDATE ON shipping_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkout_settings_updated_at
  BEFORE UPDATE ON checkout_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default checkout settings
INSERT INTO checkout_settings (
  id,
  minimum_order_amount,
  allow_guest_checkout,
  require_phone,
  require_shipping_phone,
  terms_url,
  privacy_url,
  success_url,
  cancel_url,
  stripe_public_key,
  stripe_webhook_secret
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  0,
  true,
  false,
  true,
  '/terms',
  '/privacy',
  '/store/success',
  '/store/cancel',
  current_setting('stripe.public_key', true),
  current_setting('stripe.webhook_secret', true)
) ON CONFLICT (id) DO NOTHING;

-- Insert default shipping zone for US
INSERT INTO shipping_zones (
  name,
  countries
) VALUES (
  'United States',
  ARRAY['US']
) ON CONFLICT DO NOTHING;

-- Get the US zone ID
DO $$
DECLARE
  us_zone_id uuid;
BEGIN
  SELECT id INTO us_zone_id FROM shipping_zones WHERE name = 'United States' LIMIT 1;
  
  -- Insert default shipping methods for US
  INSERT INTO shipping_methods (
    zone_id,
    name,
    description,
    price,
    free_shipping_threshold,
    estimated_days_min,
    estimated_days_max
  ) VALUES
    (us_zone_id, 'Standard Shipping', 'Standard domestic shipping', 5.99, 50.00, 3, 5),
    (us_zone_id, 'Express Shipping', 'Fast domestic shipping', 14.99, NULL, 1, 2)
  ON CONFLICT DO NOTHING;
END $$;