/*
  # Add inventory management function
  
  1. New Functions
    - `decrement_inventory`: Safely decrements product inventory
      - Checks if enough inventory is available
      - Updates inventory atomically
      - Returns success/failure status
*/

-- Function to safely decrement inventory
CREATE OR REPLACE FUNCTION decrement_inventory(p_id text, amount int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_inventory int;
BEGIN
  -- Get current inventory with row lock
  SELECT inventory INTO current_inventory
  FROM products
  WHERE id = p_id
  FOR UPDATE;
  
  -- Check if we have enough inventory
  IF current_inventory >= amount THEN
    -- Update inventory
    UPDATE products
    SET inventory = inventory - amount
    WHERE id = p_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;