/*
  # Add Anonymous Read Access to Import Status Tables

  ## Overview
  Adds RLS policies to allow anonymous (unauthenticated) users to read import status and data.
  This enables the ImportStatusDisplay component to show data without requiring authentication.

  ## Changes
  1. Add SELECT policies for `anon` role on:
     - `ozon_import_history` - allows viewing import history
     - `ozon_data` - allows viewing Ozon marketplace data for statistics
     - `pricelist_products` - allows viewing product information
     - `pricelist_prices` - allows viewing pricing information

  ## Security
  - Only SELECT (read) operations are granted to anonymous users
  - All write operations (INSERT, UPDATE, DELETE) remain restricted to authenticated users
  - This allows public viewing of import status while protecting data integrity

  ## Rationale
  The application uses Supabase anonymous key for read operations.
  Without these policies, RLS blocks all access even though data exists in tables.
*/

-- Anonymous read access for ozon_import_history
CREATE POLICY "Anonymous users can read import history"
  ON ozon_import_history
  FOR SELECT
  TO anon
  USING (true);

-- Anonymous read access for ozon_data
CREATE POLICY "Anonymous users can read ozon data"
  ON ozon_data
  FOR SELECT
  TO anon
  USING (true);

-- Anonymous read access for pricelist_products
CREATE POLICY "Anonymous users can read pricelist products"
  ON pricelist_products
  FOR SELECT
  TO anon
  USING (true);

-- Anonymous read access for pricelist_prices
CREATE POLICY "Anonymous users can read pricelist prices"
  ON pricelist_prices
  FOR SELECT
  TO anon
  USING (true);