-- Inventory System Settings Schema
-- Created: 2026-02-20
-- Purpose: Global configuration for inventory management defaults

-- ============================================================================
-- INVENTORY SYSTEM SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('number', 'boolean', 'text')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO inv_system_settings (setting_key, setting_value, setting_type, description) VALUES
  ('default_lead_time_days', '45', 'number', 'Default supplier lead time in days (typical for Chinese suppliers)'),
  ('default_moq', '1', 'number', 'Default minimum order quantity'),
  ('default_safety_stock_days', '30', 'number', 'Default safety stock buffer in days'),
  ('default_turnover_threshold_days', '90', 'number', 'Default target turnover threshold in days'),
  ('container_20ft_weight_kg', '28000', 'number', 'Maximum weight capacity for 20ft container (kg)'),
  ('container_40hq_weight_kg', '27000', 'number', 'Maximum weight capacity for 40hq container (kg)'),
  ('allow_quality_mixing', 'true', 'boolean', 'Allow mixing different quality statuses in same container'),
  ('reorder_alert_threshold', '10', 'number', 'Default reorder alert threshold (units)'),
  ('critical_stock_days', '7', 'number', 'Days of stock below which to flag as critical'),
  ('aged_inventory_months', '12', 'number', 'Age threshold in months for aged inventory alerts')
ON CONFLICT (setting_key) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inv_settings_key ON inv_system_settings(setting_key);

-- ============================================================================
-- HELPER FUNCTION: Get setting value
-- ============================================================================
CREATE OR REPLACE FUNCTION get_inventory_setting(key TEXT, default_value TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT setting_value INTO result
  FROM inv_system_settings
  WHERE setting_key = key;

  RETURN COALESCE(result, default_value);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Get setting as number
-- ============================================================================
CREATE OR REPLACE FUNCTION get_inventory_setting_number(key TEXT, default_value NUMERIC DEFAULT NULL)
RETURNS NUMERIC AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT setting_value INTO result
  FROM inv_system_settings
  WHERE setting_key = key;

  IF result IS NULL THEN
    RETURN default_value;
  END IF;

  RETURN result::NUMERIC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Get setting as boolean
-- ============================================================================
CREATE OR REPLACE FUNCTION get_inventory_setting_boolean(key TEXT, default_value BOOLEAN DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT setting_value INTO result
  FROM inv_system_settings
  WHERE setting_key = key;

  IF result IS NULL THEN
    RETURN default_value;
  END IF;

  RETURN result::BOOLEAN;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE inv_system_settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access to inventory settings"
  ON inv_system_settings FOR SELECT
  USING (true);

-- Allow anonymous write access
CREATE POLICY "Allow anonymous insert to inventory settings"
  ON inv_system_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to inventory settings"
  ON inv_system_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from inventory settings"
  ON inv_system_settings FOR DELETE
  USING (true);
