-- ABC Classification and Sales History Schema
-- Created: 2026-02-20
-- Purpose: Store ABC classification and monthly sales history for inventory analysis

-- ============================================================================
-- ABC CLASSIFICATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_abc_classification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  period_year INTEGER NOT NULL,

  abc_class TEXT NOT NULL CHECK (abc_class IN ('A', 'B', 'C')),

  revenue_rub_2025 NUMERIC(15,2),
  profit_rub_2025 NUMERIC(15,2),
  revenue_rank INTEGER,
  revenue_cumulative_percent NUMERIC(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  import_batch_id UUID,

  UNIQUE(product_name, period_year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_abc_class ON inv_abc_classification(abc_class, period_year);
CREATE INDEX IF NOT EXISTS idx_abc_product ON inv_abc_classification(product_name);
CREATE INDEX IF NOT EXISTS idx_abc_revenue_rank ON inv_abc_classification(revenue_rank);

-- ============================================================================
-- SALES HISTORY MONTHLY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_sales_history_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  month_date DATE NOT NULL, -- First day of month

  quantity_sold INTEGER DEFAULT 0,
  revenue_rub NUMERIC(15,2) DEFAULT 0,

  avg_daily_sales NUMERIC(10,2) GENERATED ALWAYS AS
    (quantity_sold / 30.0) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  import_batch_id UUID,

  UNIQUE(product_name, month_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_history_product ON inv_sales_history_monthly(product_name);
CREATE INDEX IF NOT EXISTS idx_sales_history_date ON inv_sales_history_monthly(month_date DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE inv_abc_classification ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_sales_history_monthly ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access to abc classification"
  ON inv_abc_classification FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read access to sales history"
  ON inv_sales_history_monthly FOR SELECT
  USING (true);

-- Allow anonymous write access for imports
CREATE POLICY "Allow anonymous insert to abc classification"
  ON inv_abc_classification FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to abc classification"
  ON inv_abc_classification FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from abc classification"
  ON inv_abc_classification FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous insert to sales history"
  ON inv_sales_history_monthly FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to sales history"
  ON inv_sales_history_monthly FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from sales history"
  ON inv_sales_history_monthly FOR DELETE
  USING (true);
