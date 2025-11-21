/*
  # Add Category Column to Ozon Reports

  1. Schema Changes
    - Add `category_level3` column to ozon_reports table
    - This allows tracking different categories for the same date range
    - Each category represents a separate report

  2. Index Creation
    - Add composite index on (date_of_report, reported_days, category_level3)
    - Improves duplicate detection query performance

  3. Notes
    - Category is required for proper duplicate detection
    - Multiple reports with same date/duration but different categories are valid
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ozon_reports' AND column_name = 'category_level3'
  ) THEN
    ALTER TABLE ozon_reports ADD COLUMN category_level3 TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ozon_reports_duplicate_check 
  ON ozon_reports (date_of_report, reported_days, category_level3);
