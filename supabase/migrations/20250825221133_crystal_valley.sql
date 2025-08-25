/*
  # Product Import System

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `external_id` (text) - ID from CSV
      - `name` (text, required) - Product name
      - `category` (text, required) - Product category  
      - `price` (decimal) - Product price
      - `quantity` (integer) - Stock quantity
      - `supplier` (text) - Supplier name
      - `import_date` (date) - Date from CSV
      - `created_at` (timestamp) - Record creation
      - `updated_at` (timestamp) - Last update

  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to manage product data

  3. Indexes
    - Index on external_id for fast lookups
    - Index on category for filtering
    - Index on supplier for grouping
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
  name text NOT NULL,
  category text NOT NULL,
  price decimal(10,2) DEFAULT 0,
  quantity integer DEFAULT 0,
  supplier text,
  import_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_external_id ON products(external_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);
CREATE INDEX IF NOT EXISTS idx_products_import_date ON products(import_date);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();