/*
  # Expand products table for full ERP data support

  1. New Columns Added
    - Additional product identification fields
    - Financial and pricing columns
    - Inventory and logistics fields
    - Supplier and vendor information
    - Sales and marketing data
    - Metadata and classification fields
    - Custom fields for flexibility

  2. Security
    - Maintain existing RLS policies
    - All new columns allow NULL for flexibility

  3. Performance
    - Add indexes for commonly queried fields
*/

-- Add comprehensive ERP columns to support 33+ column data
DO $$
BEGIN
  -- Product identification and classification
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
    ALTER TABLE products ADD COLUMN sku text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'barcode') THEN
    ALTER TABLE products ADD COLUMN barcode text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'subcategory') THEN
    ALTER TABLE products ADD COLUMN subcategory text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN
    ALTER TABLE products ADD COLUMN brand text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'model') THEN
    ALTER TABLE products ADD COLUMN model text;
  END IF;
  
  -- Financial and pricing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN
    ALTER TABLE products ADD COLUMN cost_price numeric(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'wholesale_price') THEN
    ALTER TABLE products ADD COLUMN wholesale_price numeric(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'retail_price') THEN
    ALTER TABLE products ADD COLUMN retail_price numeric(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'margin_percent') THEN
    ALTER TABLE products ADD COLUMN margin_percent numeric(5,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tax_rate') THEN
    ALTER TABLE products ADD COLUMN tax_rate numeric(5,2);
  END IF;
  
  -- Inventory and logistics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_stock') THEN
    ALTER TABLE products ADD COLUMN min_stock integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'max_stock') THEN
    ALTER TABLE products ADD COLUMN max_stock integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'reorder_point') THEN
    ALTER TABLE products ADD COLUMN reorder_point integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'warehouse_location') THEN
    ALTER TABLE products ADD COLUMN warehouse_location text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN
    ALTER TABLE products ADD COLUMN weight numeric(8,3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN
    ALTER TABLE products ADD COLUMN dimensions text;
  END IF;
  
  -- Supplier and vendor information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'supplier_sku') THEN
    ALTER TABLE products ADD COLUMN supplier_sku text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'supplier_price') THEN
    ALTER TABLE products ADD COLUMN supplier_price numeric(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'lead_time_days') THEN
    ALTER TABLE products ADD COLUMN lead_time_days integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'supplier_contact') THEN
    ALTER TABLE products ADD COLUMN supplier_contact text;
  END IF;
  
  -- Sales and marketing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
    ALTER TABLE products ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'short_description') THEN
    ALTER TABLE products ADD COLUMN short_description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_rank') THEN
    ALTER TABLE products ADD COLUMN sales_rank integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_velocity') THEN
    ALTER TABLE products ADD COLUMN sales_velocity numeric(8,2);
  END IF;
  
  -- Status and metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
    ALTER TABLE products ADD COLUMN status text DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
    ALTER TABLE products ADD COLUMN is_active boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'last_sold_date') THEN
    ALTER TABLE products ADD COLUMN last_sold_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'discontinue_date') THEN
    ALTER TABLE products ADD COLUMN discontinue_date date;
  END IF;
  
  -- Custom flexible fields for remaining ERP data
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custom_field_1') THEN
    ALTER TABLE products ADD COLUMN custom_field_1 text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custom_field_2') THEN
    ALTER TABLE products ADD COLUMN custom_field_2 text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custom_field_3') THEN
    ALTER TABLE products ADD COLUMN custom_field_3 text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custom_field_4') THEN
    ALTER TABLE products ADD COLUMN custom_field_4 text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custom_field_5') THEN
    ALTER TABLE products ADD COLUMN custom_field_5 text;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_supplier_sku ON products(supplier_sku);