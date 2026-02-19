-- Product Suppliers Schema
-- Created: 2026-02-20
-- Purpose: Store supplier relationships and pricing for reorder planning

-- ============================================================================
-- PRODUCT SUPPLIERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_product_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  supplier_id UUID REFERENCES inv_suppliers(id),

  supplier_sku TEXT,
  supplier_price_usd NUMERIC(12,2),
  supplier_price_rub NUMERIC(12,2),
  moq INTEGER DEFAULT 1, -- Minimum order quantity
  lead_time_days INTEGER,
  is_primary BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_name, supplier_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_suppliers_product ON inv_product_suppliers(product_name);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_supplier ON inv_product_suppliers(supplier_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_primary ON inv_product_suppliers(is_primary) WHERE is_primary = true;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE inv_product_suppliers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access to product suppliers"
  ON inv_product_suppliers FOR SELECT
  USING (true);

-- Allow anonymous write access for imports
CREATE POLICY "Allow anonymous insert to product suppliers"
  ON inv_product_suppliers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to product suppliers"
  ON inv_product_suppliers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from product suppliers"
  ON inv_product_suppliers FOR DELETE
  USING (true);
