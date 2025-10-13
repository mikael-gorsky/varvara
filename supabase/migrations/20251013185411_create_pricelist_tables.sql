/*
  # Product Pricelist Import System

  ## Overview
  Creates a normalized database structure for managing product information and multi-supplier pricing data.
  This migration supports importing Excel-based pricelists with product details and prices from multiple suppliers.

  ## 1. New Tables

  ### `pricelist_products` Table
  Stores core product information with unique product codes.

  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each product
  - `code` (text, unique, not null) - Product code from supplier system (e.g., "Д0002611")
  - `article` (text) - Article number/SKU
  - `name` (text, not null) - Product name/description
  - `barcode` (text) - Product barcode (numeric identifier)
  - `category` (text) - Product category from Excel file grouping
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `pricelist_prices` Table
  Stores pricing information from multiple suppliers for each product.

  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each price record
  - `product_id` (uuid, foreign key) - References pricelist_products.id
  - `supplier` (text, not null) - Supplier name (e.g., "Реалист", "ВсеИнструменты")
  - `price` (numeric(10,2)) - Product price from supplier (nullable for suppliers without prices)
  - `currency` (text) - Currency code (e.g., "RUB", "USD")
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Constraints
  - Unique constraint on `pricelist_products.code` to prevent duplicate products
  - Unique constraint on `(product_id, supplier)` in pricelist_prices to prevent duplicate price entries
  - Foreign key cascade delete: removing a product removes all associated prices

  ## 3. Indexes
  - Index on `pricelist_products.code` for fast product lookups during import
  - Index on `pricelist_products.category` for filtering by category
  - Index on `pricelist_prices.product_id` for efficient price queries
  - Index on `pricelist_prices.supplier` for supplier-based filtering

  ## 4. Security (Row Level Security)
  - RLS enabled on both tables
  - Authenticated users can read all product and price data
  - Authenticated users can insert new products and prices
  - Authenticated users can update existing products and prices
  - Authenticated users can delete products and prices

  ## 5. Triggers
  - Auto-update `updated_at` timestamp on record modifications for both tables

  ## 6. Import Strategy
  - Products are upserted using `code` as unique identifier
  - On conflict: update article, name, barcode, category, and updated_at
  - Prices are upserted using (product_id, supplier) as unique constraint
  - On conflict: update price, currency, and updated_at
  - This allows re-importing updated pricelists without creating duplicates
*/

-- Create pricelist_products table
CREATE TABLE IF NOT EXISTS pricelist_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  article text,
  name text NOT NULL,
  barcode text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pricelist_prices table
CREATE TABLE IF NOT EXISTS pricelist_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES pricelist_products(id) ON DELETE CASCADE,
  supplier text NOT NULL,
  price numeric(10,2),
  currency text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_product_supplier UNIQUE (product_id, supplier)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pricelist_products_code ON pricelist_products(code);
CREATE INDEX IF NOT EXISTS idx_pricelist_products_category ON pricelist_products(category);
CREATE INDEX IF NOT EXISTS idx_pricelist_prices_product_id ON pricelist_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_pricelist_prices_supplier ON pricelist_prices(supplier);

-- Enable Row Level Security
ALTER TABLE pricelist_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricelist_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricelist_products
CREATE POLICY "Authenticated users can read products"
  ON pricelist_products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON pricelist_products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON pricelist_products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON pricelist_products
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for pricelist_prices
CREATE POLICY "Authenticated users can read prices"
  ON pricelist_prices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert prices"
  ON pricelist_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update prices"
  ON pricelist_prices
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete prices"
  ON pricelist_prices
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger function for updated_at (reuse existing function if available)
CREATE OR REPLACE FUNCTION update_pricelist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
CREATE TRIGGER update_pricelist_products_updated_at
  BEFORE UPDATE ON pricelist_products
  FOR EACH ROW
  EXECUTE FUNCTION update_pricelist_updated_at();

CREATE TRIGGER update_pricelist_prices_updated_at
  BEFORE UPDATE ON pricelist_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_pricelist_updated_at();
