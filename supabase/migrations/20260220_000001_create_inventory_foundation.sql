-- Inventory Management Foundation Schema
-- Created: 2026-02-20
-- Purpose: Core tables for inventory management (warehouses, suppliers, product dimensions)

-- ============================================================================
-- 1. WAREHOUSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data for 6 warehouses from Ivan's data
INSERT INTO inv_warehouses (name, code) VALUES
  ('Химки', 'ХИМКИ'),
  ('Войковская ОП', 'ВОЙ'),
  ('Демзал', 'ДЕМ'),
  ('Сервис ОП', 'СЕРВИС'),
  ('Склад', 'СКЛАД'),
  ('Неизвестно', 'UNKNOWN')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. SUPPLIERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  default_lead_time_days INTEGER DEFAULT 45, -- Typical for Chinese suppliers
  payment_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_inv_suppliers_country ON inv_suppliers(country);

-- ============================================================================
-- 3. PRODUCT DIMENSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inv_product_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL UNIQUE,
  sku TEXT,
  volume_cbm NUMERIC(10,4), -- Volume in cubic meters for container calculations
  weight_kg NUMERIC(8,2),   -- Weight in kilograms
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast product lookups
CREATE INDEX IF NOT EXISTS idx_inv_product_dimensions_name ON inv_product_dimensions(product_name);
CREATE INDEX IF NOT EXISTS idx_inv_product_dimensions_sku ON inv_product_dimensions(sku) WHERE sku IS NOT NULL;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE inv_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_product_dimensions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (following varvara pattern)
CREATE POLICY "Allow anonymous read access to warehouses"
  ON inv_warehouses FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read access to suppliers"
  ON inv_suppliers FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read access to product dimensions"
  ON inv_product_dimensions FOR SELECT
  USING (true);

-- Allow anonymous write access (following varvara pattern for imports)
CREATE POLICY "Allow anonymous insert to warehouses"
  ON inv_warehouses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert to suppliers"
  ON inv_suppliers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert to product dimensions"
  ON inv_product_dimensions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update to product dimensions"
  ON inv_product_dimensions FOR UPDATE
  USING (true)
  WITH CHECK (true);
