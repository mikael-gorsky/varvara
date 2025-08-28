/*
  # Rename category column to link

  1. Schema Changes
    - Rename `category` column to `link` in products table
    - Update indexes that reference the old column name
    
  2. Reasoning
    - The `category` column actually contains hyperlinks to product listings
    - `category_name` column contains the actual product categories
    - This rename makes the schema more accurate and clear
*/

-- Rename the category column to link
ALTER TABLE products RENAME COLUMN category TO link;

-- Update the index name to reflect the new column
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX idx_products_link ON products (link);