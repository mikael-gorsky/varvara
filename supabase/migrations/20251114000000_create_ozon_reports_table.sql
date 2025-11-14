/*
  # Create OZON Reports Metadata Table and Link to OZON Data

  ## Overview
  This migration creates a normalized structure for OZON report metadata and links it to the existing ozon_data table.

  ## 1. New Tables

  ### `ozon_reports` table
  Stores unique report metadata with synthetic report_id as primary key.

  **Columns:**
  - `report_id` (uuid, primary key) - Unique identifier for each report
  - `date_of_report` (date, not null) - The date this report covers
  - `reported_days` (integer, not null) - Number of days covered by the report
  - `imported_at` (timestamptz, not null) - When this report was imported

  **Constraints:**
  - Primary key on `report_id`
  - Unique constraint on (`date_of_report`, `reported_days`) - Prevents importing same report twice

  **Indexes:**
  - Index on `date_of_report` for date-based queries
  - Index on `reported_days` for period-based filtering
  - Index on `imported_at` for time-based queries and sorting

  ## 2. Modified Tables

  ### `ozon_data` table modifications

  **New Columns:**
  - `report_id` (uuid, nullable initially) - Foreign key to ozon_reports

  **Constraints:**
  - Foreign key to `ozon_reports.report_id` with CASCADE delete
  - Unique constraint on (`product_name`, `report_id`) - Prevents duplicate products within same report

  **Indexes:**
  - Index on `report_id` for efficient filtering and joins
  - Composite index on (`product_name`, `report_id`) for product lookups within reports

  ## 3. Security

  ### Row Level Security (RLS)
  - Enable RLS on `ozon_reports` table
  - Add policies for authenticated users to perform all CRUD operations

  **Policies created:**
  - SELECT: Allow authenticated users to read reports
  - INSERT: Allow authenticated users to create reports
  - UPDATE: Allow authenticated users to update reports
  - DELETE: Allow authenticated users to delete reports (cascades to ozon_data)

  ## 4. Important Notes

  - Existing `ozon_data` rows will have NULL `report_id` until backfilled
  - Deleting a report from `ozon_reports` will automatically delete all associated `ozon_data` rows
  - The unique constraint ensures no duplicate products exist within a single report
  - The date + period combination ensures no duplicate reports are imported
*/

-- ============================================================================
-- PART 1: Create ozon_reports table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ozon_reports (
  report_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_of_report date NOT NULL,
  reported_days integer NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint on date + period combination
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_date_and_period'
  ) THEN
    ALTER TABLE ozon_reports
    ADD CONSTRAINT unique_date_and_period
    UNIQUE (date_of_report, reported_days);
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ozon_reports_date_of_report
ON ozon_reports(date_of_report);

CREATE INDEX IF NOT EXISTS idx_ozon_reports_reported_days
ON ozon_reports(reported_days);

CREATE INDEX IF NOT EXISTS idx_ozon_reports_imported_at
ON ozon_reports(imported_at);

-- Enable Row Level Security
ALTER TABLE ozon_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can read OZON reports"
ON ozon_reports
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert OZON reports"
ON ozon_reports
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update OZON reports"
ON ozon_reports
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete OZON reports"
ON ozon_reports
FOR DELETE
TO authenticated
USING (true);

-- ============================================================================
-- PART 2: Modify ozon_data table
-- ============================================================================

-- Add report_id column to ozon_data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ozon_data' AND column_name = 'report_id'
  ) THEN
    ALTER TABLE ozon_data ADD COLUMN report_id uuid;
  END IF;
END $$;

-- Add foreign key with cascading delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_ozon_data_report'
  ) THEN
    ALTER TABLE ozon_data
    ADD CONSTRAINT fk_ozon_data_report
    FOREIGN KEY (report_id)
    REFERENCES ozon_reports(report_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;

-- Add unique constraint to prevent duplicate products within same report
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_product_per_report'
  ) THEN
    ALTER TABLE ozon_data
    ADD CONSTRAINT unique_product_per_report
    UNIQUE (product_name, report_id);
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ozon_data_report_id
ON ozon_data(report_id);

CREATE INDEX IF NOT EXISTS idx_ozon_data_product_report
ON ozon_data(product_name, report_id);
