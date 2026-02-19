-- Margin Analytics Database Schema
-- Created: 2026-02-19
-- Purpose: Store sales transactions, margins, customers, and exchange rates for margin analytics

-- ============================================================================
-- 1. CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  inn TEXT, -- Tax ID (ИНН)
  category TEXT, -- Customer category from 1C (e.g., "Конечные заказчики")
  payment_terms_days INTEGER DEFAULT 0, -- Payment terms in days (future use)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique customer names (or use INN if available)
  CONSTRAINT customers_name_unique UNIQUE (name)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_category ON customers(category);
CREATE INDEX IF NOT EXISTS idx_customers_inn ON customers(inn) WHERE inn IS NOT NULL;

-- ============================================================================
-- 2. EXCHANGE RATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_date DATE NOT NULL, -- First day of month (YYYY-MM-01)
  usd_rub NUMERIC(10, 4) NOT NULL, -- Exchange rate (e.g., 92.3456)
  source TEXT DEFAULT 'MANUAL', -- Source: MANUAL, CBR_API, ECB, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one rate per period
  CONSTRAINT exchange_rates_period_unique UNIQUE (period_date)
);

-- Index for fast period lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_period ON exchange_rates(period_date DESC);

-- ============================================================================
-- 3. MARGIN ANALYTICS DATA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS margin_analytics_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Time dimension
  period_date DATE NOT NULL, -- First day of month (YYYY-MM-01)

  -- Customer dimension
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_category TEXT, -- Denormalized for faster queries

  -- Product dimension
  product_name TEXT NOT NULL,
  product_category TEXT, -- Product category from 1C hierarchy

  -- Metrics (all in RUB)
  quantity NUMERIC(12, 2) DEFAULT 0,
  revenue_rub NUMERIC(15, 2) NOT NULL, -- Sales amount (Продажи руб)
  cogs_rub NUMERIC(15, 2) NOT NULL, -- Cost of goods sold (Себестоимость руб)
  additional_expenses_rub NUMERIC(15, 2) DEFAULT 0, -- Additional expenses (Доп расходы руб)

  -- Calculated fields (populated on insert/update)
  total_cost_rub NUMERIC(15, 2) GENERATED ALWAYS AS (cogs_rub + additional_expenses_rub) STORED,
  margin_rub NUMERIC(15, 2) GENERATED ALWAYS AS (revenue_rub - (cogs_rub + additional_expenses_rub)) STORED,
  margin_percent NUMERIC(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN revenue_rub > 0 THEN ((revenue_rub - (cogs_rub + additional_expenses_rub)) / revenue_rub * 100)
      ELSE 0
    END
  ) STORED,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  import_batch_id UUID -- Reference to import history (optional)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_margin_data_period ON margin_analytics_data(period_date DESC);
CREATE INDEX IF NOT EXISTS idx_margin_data_customer ON margin_analytics_data(customer_id);
CREATE INDEX IF NOT EXISTS idx_margin_data_period_customer ON margin_analytics_data(period_date, customer_id);
CREATE INDEX IF NOT EXISTS idx_margin_data_customer_category ON margin_analytics_data(customer_category);

-- ============================================================================
-- 4. ANOMALY ALERTS TABLE (Optional, for future use)
-- ============================================================================
CREATE TABLE IF NOT EXISTS anomaly_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Alert metadata
  alert_type TEXT NOT NULL, -- 'margin_drop_mom', 'margin_drop_yoy', 'margin_compression', etc.
  entity_type TEXT NOT NULL, -- 'customer', 'category', 'product', 'overall'
  entity_id UUID, -- FK to customer, product, etc. (nullable for overall)
  entity_name TEXT, -- Denormalized name for display

  -- Period
  period_date DATE NOT NULL,

  -- Metrics
  metric_name TEXT NOT NULL, -- 'margin_rub', 'margin_percent', 'revenue_rub'
  actual_value NUMERIC(15, 2),
  expected_value NUMERIC(15, 2), -- Baseline for comparison
  deviation_percent NUMERIC(5, 2), -- Percentage deviation

  -- Severity
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'

  -- Status
  status TEXT DEFAULT 'new', -- 'new', 'acknowledged', 'resolved', 'false_positive'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID -- Reference to user (future)
);

-- Indexes for anomaly queries
CREATE INDEX IF NOT EXISTS idx_anomaly_period ON anomaly_alerts(period_date DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_status ON anomaly_alerts(status) WHERE status = 'new';
CREATE INDEX IF NOT EXISTS idx_anomaly_entity ON anomaly_alerts(entity_type, entity_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE margin_analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_alerts ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (adjust based on your auth setup)
CREATE POLICY "Allow read access to customers" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to exchange_rates" ON exchange_rates
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to margin_analytics_data" ON margin_analytics_data
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to anomaly_alerts" ON anomaly_alerts
  FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated users (or service role)
-- Adjust these policies based on your security requirements
CREATE POLICY "Allow insert to margin_analytics_data" ON margin_analytics_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to margin_analytics_data" ON margin_analytics_data
  FOR UPDATE USING (true);

CREATE POLICY "Allow insert to customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to customers" ON customers
  FOR UPDATE USING (true);

CREATE POLICY "Allow insert to exchange_rates" ON exchange_rates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to exchange_rates" ON exchange_rates
  FOR UPDATE USING (true);

-- ============================================================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_margin_data_updated_at
  BEFORE UPDATE ON margin_analytics_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample exchange rates
INSERT INTO exchange_rates (period_date, usd_rub, source) VALUES
  ('2024-01-01', 88.50, 'MANUAL'),
  ('2024-02-01', 89.20, 'MANUAL'),
  ('2024-03-01', 90.10, 'MANUAL'),
  ('2024-04-01', 91.30, 'MANUAL'),
  ('2024-05-01', 92.00, 'MANUAL'),
  ('2024-06-01', 88.75, 'MANUAL'),
  ('2024-07-01', 87.90, 'MANUAL'),
  ('2024-08-01', 89.50, 'MANUAL'),
  ('2024-09-01', 90.80, 'MANUAL'),
  ('2024-10-01', 92.10, 'MANUAL'),
  ('2024-11-01', 93.40, 'MANUAL'),
  ('2024-12-01', 95.20, 'MANUAL'),
  ('2025-01-01', 94.50, 'MANUAL'),
  ('2026-01-01', 92.30, 'MANUAL')
ON CONFLICT (period_date) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE customers IS 'Customer master data from 1C accounting system';
COMMENT ON TABLE exchange_rates IS 'Period-average USD/RUB exchange rates for dual currency display';
COMMENT ON TABLE margin_analytics_data IS 'Sales transactions with calculated margins from 1C exports';
COMMENT ON TABLE anomaly_alerts IS 'Automated alerts for margin drops, compression, and unusual activity';

COMMENT ON COLUMN margin_analytics_data.margin_rub IS 'Calculated: revenue_rub - (cogs_rub + additional_expenses_rub)';
COMMENT ON COLUMN margin_analytics_data.margin_percent IS 'Calculated: (margin_rub / revenue_rub) * 100';
