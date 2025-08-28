/*
  # Create AI Product Groups Table

  1. New Tables
    - `ai_product_groups`
      - `id` (uuid, primary key)
      - `category` (text, product category)
      - `group_name` (text, AI-generated group name)
      - `group_description` (text, AI description of the group)
      - `product_names` (jsonb, array of product names in this group)
      - `price_analysis` (jsonb, price statistics and analysis)
      - `confidence_score` (numeric, AI confidence in grouping)
      - `vendor_analysis` (jsonb, vendor comparison data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ai_product_groups` table
    - Add policies for authenticated users to read/write their data
*/

CREATE TABLE IF NOT EXISTS ai_product_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  group_name text NOT NULL,
  group_description text,
  product_names jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_analysis jsonb DEFAULT '{}'::jsonb,
  confidence_score numeric(3,2) DEFAULT 0.0,
  vendor_analysis jsonb DEFAULT '{}'::jsonb,
  ai_response jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_product_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read AI product groups"
  ON ai_product_groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create AI product groups"
  ON ai_product_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update AI product groups"
  ON ai_product_groups
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete AI product groups"
  ON ai_product_groups
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_product_groups_category 
  ON ai_product_groups(category);

CREATE INDEX IF NOT EXISTS idx_ai_product_groups_created_at 
  ON ai_product_groups(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_product_groups_updated_at 
  BEFORE UPDATE ON ai_product_groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();