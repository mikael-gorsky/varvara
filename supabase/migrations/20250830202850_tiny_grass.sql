/*
  # Create OZON data table

  1. New Tables
    - `ozon_data`
      - `id` (uuid, primary key)
      - Maps all 31 OZON export fields from Russian to English names
      - Includes financial metrics, inventory data, and performance indicators
      - Optimized for OZON marketplace data analysis

  2. Security
    - Enable RLS on `ozon_data` table
    - Add policies for authenticated users to perform CRUD operations

  3. Indexes
    - Add indexes on frequently queried fields for performance
*/

CREATE TABLE IF NOT EXISTS ozon_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic product information
  product_name text NOT NULL,
  product_link text,
  seller text,
  brand text,
  category_level1 text,
  category_level3 text,
  product_flag text,
  
  -- Financial and sales data
  ordered_sum numeric(12,2) DEFAULT 0,
  turnover_dynamic numeric(8,2) DEFAULT 0,
  ordered_quantity integer DEFAULT 0,
  average_price numeric(10,2) DEFAULT 0,
  minimum_price numeric(10,2) DEFAULT 0,
  buyout_share numeric(5,2) DEFAULT 0,
  lost_sales numeric(12,2) DEFAULT 0,
  
  -- Inventory and logistics
  days_no_stock integer DEFAULT 0,
  average_delivery_hours numeric(8,2) DEFAULT 0,
  average_daily_revenue numeric(10,2) DEFAULT 0,
  average_daily_sales_pcs numeric(8,2) DEFAULT 0,
  ending_stock integer DEFAULT 0,
  work_scheme text,
  volume_liters numeric(8,3) DEFAULT 0,
  
  -- Marketing and performance metrics
  views integer DEFAULT 0,
  views_search integer DEFAULT 0,
  views_card integer DEFAULT 0,
  view_to_cart numeric(5,2) DEFAULT 0,
  search_to_cart numeric(5,2) DEFAULT 0,
  description_to_cart numeric(5,2) DEFAULT 0,
  
  -- Promotions and advertising
  discount_promo numeric(10,2) DEFAULT 0,
  revenue_promo numeric(5,2) DEFAULT 0,
  days_promo integer DEFAULT 0,
  days_boost integer DEFAULT 0,
  ads_share numeric(5,2) DEFAULT 0,
  
  -- Metadata
  card_date date,
  import_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ozon_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read OZON data"
  ON ozon_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert OZON data"
  ON ozon_data
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update OZON data"
  ON ozon_data
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete OZON data"
  ON ozon_data
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ozon_data_product_name ON ozon_data (product_name);
CREATE INDEX IF NOT EXISTS idx_ozon_data_seller ON ozon_data (seller);
CREATE INDEX IF NOT EXISTS idx_ozon_data_brand ON ozon_data (brand);
CREATE INDEX IF NOT EXISTS idx_ozon_data_category_level1 ON ozon_data (category_level1);
CREATE INDEX IF NOT EXISTS idx_ozon_data_category_level3 ON ozon_data (category_level3);
CREATE INDEX IF NOT EXISTS idx_ozon_data_import_date ON ozon_data (import_date);
CREATE INDEX IF NOT EXISTS idx_ozon_data_created_at ON ozon_data (created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_ozon_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ozon_data_updated_at
  BEFORE UPDATE ON ozon_data
  FOR EACH ROW
  EXECUTE FUNCTION update_ozon_data_updated_at();