-- Products table
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  images text[] DEFAULT '{}'::text[],
  inventory integer DEFAULT 0,
  sizes text[] DEFAULT '{}'::text[],
  inventory_status text GENERATED ALWAYS AS (
    CASE
      WHEN inventory <= 0 THEN 'out_of_stock'
      WHEN inventory < 10 THEN 'low_stock'
      ELSE 'in_stock'
    END
  ) STORED
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  stripe_session_id text NOT NULL,
  customer_email text,
  amount_total numeric(10,2) NOT NULL,
  payment_status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id serial PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Products policies
    DROP POLICY IF EXISTS "Admins can manage products" ON products;
    DROP POLICY IF EXISTS "Anyone can read products" ON products;
    
    -- Orders policies
    DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
    
    -- Order items policies
    DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create policies for products
CREATE POLICY "Admins can manage products"
ON products
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Anyone can read products"
ON products
FOR SELECT
TO public
USING (true);

-- Create policies for orders
CREATE POLICY "Admins can manage orders"
ON orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Create policies for order items
CREATE POLICY "Admins can manage order items"
ON order_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS trigger_set_timestamp() CASCADE;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_timestamp ON orders;

-- Create trigger for orders
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();