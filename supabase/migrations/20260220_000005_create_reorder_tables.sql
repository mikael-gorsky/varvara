-- Reorder Planning and Purchase Orders Schema
-- Created: 2026-02-20
-- Purpose: Automated reorder alerts and purchase order management

-- ============================================================================
-- REORDER SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_reorder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT UNIQUE, -- If NULL, applies to category
  product_category TEXT,

  reorder_point INTEGER,
  reorder_quantity INTEGER,
  safety_stock INTEGER DEFAULT 0,
  lead_time_days INTEGER,

  target_turnover_days INTEGER, -- Category-specific threshold
  max_age_months INTEGER, -- Alert if older than this

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (
    (product_name IS NOT NULL AND product_category IS NULL) OR
    (product_name IS NULL AND product_category IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reorder_settings_product ON inv_reorder_settings(product_name) WHERE product_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reorder_settings_category ON inv_reorder_settings(product_category) WHERE product_category IS NOT NULL;

-- ============================================================================
-- PURCHASE ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES inv_suppliers(id),

  status TEXT DEFAULT 'draft' CHECK (status IN
    ('draft', 'submitted', 'confirmed', 'in_transit', 'received', 'cancelled')),

  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,

  container_type TEXT, -- '20ft' or '40hq'
  container_fill_cbm NUMERIC(10,2),
  container_fill_percent NUMERIC(5,2),

  total_cost_usd NUMERIC(15,2),
  total_cost_rub NUMERIC(15,2),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON inv_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON inv_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON inv_purchase_orders(order_date DESC);

-- ============================================================================
-- PURCHASE ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID REFERENCES inv_purchase_orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,

  quantity_ordered INTEGER NOT NULL,
  unit_price_usd NUMERIC(12,2),
  line_total_usd NUMERIC(15,2) GENERATED ALWAYS AS
    (quantity_ordered * COALESCE(unit_price_usd, 0)) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_po_items_po ON inv_purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_items_product ON inv_purchase_order_items(product_name);

-- ============================================================================
-- REORDER ALERTS VIEW
-- ============================================================================
CREATE OR REPLACE VIEW inv_reorder_alerts AS
WITH current_inventory AS (
  SELECT DISTINCT ON (product_name)
    product_name,
    SUM(quantity_available) as total_available
  FROM inv_current_inventory
  GROUP BY product_name
),
recent_sales AS (
  SELECT
    product_name,
    AVG(avg_daily_sales) AS avg_daily_sales
  FROM inv_sales_history_monthly
  WHERE month_date >= CURRENT_DATE - INTERVAL '3 months'
  GROUP BY product_name
)
SELECT
  ci.product_name,
  ci.total_available,
  rs.reorder_point,
  rs.safety_stock,
  rs.lead_time_days,
  COALESCE(sales.avg_daily_sales, 0) AS avg_daily_sales,
  CASE
    WHEN sales.avg_daily_sales > 0 THEN
      ROUND((ci.total_available / sales.avg_daily_sales)::numeric, 1)
    ELSE NULL
  END AS days_of_stock,
  ps.supplier_id,
  s.name AS supplier_name,
  ps.supplier_price_usd,
  ps.moq,
  -- Calculate suggested order quantity
  CASE
    WHEN rs.reorder_quantity IS NOT NULL THEN rs.reorder_quantity
    WHEN sales.avg_daily_sales > 0 AND rs.lead_time_days IS NOT NULL THEN
      CEIL((sales.avg_daily_sales * rs.lead_time_days) + COALESCE(rs.safety_stock, 0))::INTEGER
    ELSE ps.moq
  END AS suggested_order_qty
FROM current_inventory ci
LEFT JOIN inv_reorder_settings rs ON ci.product_name = rs.product_name
LEFT JOIN recent_sales sales ON ci.product_name = sales.product_name
LEFT JOIN inv_product_suppliers ps ON ci.product_name = ps.product_name AND ps.is_primary = true
LEFT JOIN inv_suppliers s ON ps.supplier_id = s.id
WHERE ci.total_available <= COALESCE(rs.reorder_point, 0)
   OR (rs.reorder_point IS NULL AND ci.total_available <= 10); -- Default threshold

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE inv_reorder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access to reorder settings"
  ON inv_reorder_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read access to purchase orders"
  ON inv_purchase_orders FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read access to purchase order items"
  ON inv_purchase_order_items FOR SELECT
  USING (true);

-- Allow anonymous write access
CREATE POLICY "Allow anonymous insert to reorder settings"
  ON inv_reorder_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to reorder settings"
  ON inv_reorder_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from reorder settings"
  ON inv_reorder_settings FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous insert to purchase orders"
  ON inv_purchase_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to purchase orders"
  ON inv_purchase_orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from purchase orders"
  ON inv_purchase_orders FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous insert to purchase order items"
  ON inv_purchase_order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to purchase order items"
  ON inv_purchase_order_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from purchase order items"
  ON inv_purchase_order_items FOR DELETE
  USING (true);
