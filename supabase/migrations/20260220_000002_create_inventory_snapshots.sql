-- Inventory Snapshots Schema
-- Created: 2026-02-20
-- Purpose: Time-series inventory data with aging metrics

-- ============================================================================
-- INVENTORY SNAPSHOTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  product_name TEXT NOT NULL,
  warehouse_id UUID REFERENCES inv_warehouses(id),

  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS
    (GREATEST(quantity_on_hand - quantity_reserved, 0)) STORED,

  unit_cost_rub NUMERIC(12,2),
  total_value_rub NUMERIC(15,2) GENERATED ALWAYS AS
    (quantity_on_hand * COALESCE(unit_cost_rub, 0)) STORED,

  age_months INTEGER, -- Age in months from first receipt
  quality_status TEXT, -- "годные", "негодные", "с дефектами", "возврат"

  import_batch_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(snapshot_date, product_name, warehouse_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inv_snapshots_date ON inv_inventory_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_inv_snapshots_product ON inv_inventory_snapshots(product_name);
CREATE INDEX IF NOT EXISTS idx_inv_snapshots_warehouse ON inv_inventory_snapshots(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inv_snapshots_aging ON inv_inventory_snapshots(age_months DESC)
  WHERE age_months > 0;
CREATE INDEX IF NOT EXISTS idx_inv_snapshots_batch ON inv_inventory_snapshots(import_batch_id)
  WHERE import_batch_id IS NOT NULL;

-- ============================================================================
-- CURRENT INVENTORY VIEW
-- ============================================================================
CREATE OR REPLACE VIEW inv_current_inventory AS
WITH latest_snapshots AS (
  SELECT DISTINCT ON (product_name, warehouse_id)
    s.*,
    w.name AS warehouse_name,
    w.code AS warehouse_code
  FROM inv_inventory_snapshots s
  LEFT JOIN inv_warehouses w ON s.warehouse_id = w.id
  ORDER BY product_name, warehouse_id, snapshot_date DESC
)
SELECT
  ls.id,
  ls.product_name,
  ls.warehouse_name,
  ls.warehouse_code,
  ls.warehouse_id,
  ls.quantity_on_hand,
  ls.quantity_reserved,
  ls.quantity_available,
  ls.age_months,
  ls.quality_status,
  ls.unit_cost_rub,
  ls.total_value_rub,
  ls.snapshot_date
FROM latest_snapshots ls;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE inv_inventory_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access to inventory snapshots"
  ON inv_inventory_snapshots FOR SELECT
  USING (true);

-- Allow anonymous write access for imports
CREATE POLICY "Allow anonymous insert to inventory snapshots"
  ON inv_inventory_snapshots FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to inventory snapshots"
  ON inv_inventory_snapshots FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from inventory snapshots"
  ON inv_inventory_snapshots FOR DELETE
  USING (true);
