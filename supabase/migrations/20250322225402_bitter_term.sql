/*
  # Add customer notification preferences and history

  1. New Tables
    - `notification_preferences`
      - `customer_id` (uuid, primary key, references customer_profiles)
      - `email_order_updates` (boolean)
      - `email_promotions` (boolean)
      - `email_newsletters` (boolean)
      - `updated_at` (timestamp)

    - `notification_history`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customer_profiles)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for notification management
*/

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  customer_id uuid PRIMARY KEY REFERENCES customer_profiles(id) ON DELETE CASCADE,
  email_order_updates boolean DEFAULT true,
  email_promotions boolean DEFAULT true,
  email_newsletters boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Notification history table
CREATE TABLE IF NOT EXISTS notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('order_update', 'promotion', 'newsletter', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Notification preferences policies
CREATE POLICY "Users can manage their notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Notification history policies
CREATE POLICY "Users can manage their notifications"
  ON notification_history
  FOR ALL
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Add trigger for notification preferences updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();