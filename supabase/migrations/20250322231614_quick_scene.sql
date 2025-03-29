/*
  # Add order status and support ticket tables

  1. New Tables
    - `order_status_history`
      - `id` (uuid, primary key)
      - `order_id` (integer, references orders)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
    
    - `support_tickets`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customer_profiles)
      - `order_id` (integer, references orders)
      - `subject` (text)
      - `status` (text)
      - `priority` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ticket_messages`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references support_tickets)
      - `sender_id` (uuid, references auth.users)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admins and customers
*/

-- Order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id integer REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  order_id integer REFERENCES orders(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ticket messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can manage order status history" ON order_status_history;
    DROP POLICY IF EXISTS "Customers can view their order status history" ON order_status_history;
    DROP POLICY IF EXISTS "Users can manage their own tickets" ON support_tickets;
    DROP POLICY IF EXISTS "Users can manage their own ticket messages" ON ticket_messages;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Order status history policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_status_history' 
        AND policyname = 'Admins can manage order status history'
    ) THEN
        CREATE POLICY "Admins can manage order status history"
        ON order_status_history
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'admin'
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_status_history' 
        AND policyname = 'Customers can view their order status history'
    ) THEN
        CREATE POLICY "Customers can view their order status history"
        ON order_status_history
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM orders o
                JOIN customer_profiles cp ON cp.id = auth.uid()
                WHERE o.id = order_status_history.order_id
                AND o.customer_email = (
                    SELECT email FROM auth.users WHERE id = auth.uid()
                )
            )
        );
    END IF;
END $$;

-- Support tickets policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'support_tickets' 
        AND policyname = 'Users can manage their own tickets'
    ) THEN
        CREATE POLICY "Users can manage their own tickets"
        ON support_tickets
        FOR ALL
        TO authenticated
        USING (
            customer_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'admin'
            )
        )
        WITH CHECK (
            customer_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'admin'
            )
        );
    END IF;
END $$;

-- Ticket messages policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ticket_messages' 
        AND policyname = 'Users can manage their own ticket messages'
    ) THEN
        CREATE POLICY "Users can manage their own ticket messages"
        ON ticket_messages
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM support_tickets st
                WHERE st.id = ticket_id
                AND (
                    st.customer_id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM profiles p
                        WHERE p.id = auth.uid()
                        AND p.role = 'admin'
                    )
                )
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM support_tickets st
                WHERE st.id = ticket_id
                AND (
                    st.customer_id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM profiles p
                        WHERE p.id = auth.uid()
                        AND p.role = 'admin'
                    )
                )
            )
        );
    END IF;
END $$;

-- Add trigger for support tickets updated_at
DO $$ 
BEGIN
    -- Drop the trigger if it exists
    DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
    
    -- Create the trigger
    CREATE TRIGGER update_support_tickets_updated_at
        BEFORE UPDATE ON support_tickets
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;