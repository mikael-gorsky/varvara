/*
  # Create get_distinct_categories function

  1. New Functions
    - `get_distinct_categories()` - Returns unique category names from products table
      - Returns TABLE with category_name TEXT column
      - Filters out NULL and empty category names
      - Uses DISTINCT to avoid duplicates
  
  2. Purpose
    - Efficiently fetch all unique product categories for analysis
    - Avoid loading thousands of duplicate category rows in the application
*/

CREATE OR REPLACE FUNCTION get_distinct_categories()
RETURNS TABLE (category_name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.category_name
  FROM public.products p
  WHERE p.category_name IS NOT NULL AND p.category_name != ''
  ORDER BY p.category_name;
END;
$$;