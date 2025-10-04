/*
  # Add composite index for duplicate detection

  1. Indexes
    - Add composite index on (date_of_report, reported_days, category_level3) for efficient duplicate detection
    - This enables fast lookups when checking if data with same metadata already exists
    
  2. Column Comments
    - Document the data storage format and scaling factors for integer columns
*/

-- Create composite index for efficient duplicate detection
CREATE INDEX IF NOT EXISTS idx_ozon_data_duplicate_check 
  ON ozon_data (date_of_report, reported_days, category_level3);

-- Add comments explaining the data format
COMMENT ON COLUMN ozon_data.date_of_report IS 'Date from "Дата формирования" field in Excel header (format: dd.mm.yy)';
COMMENT ON COLUMN ozon_data.reported_days IS 'Number of days from "Период отчета" field in Excel header (e.g., 28 from "28 дней")';
COMMENT ON COLUMN ozon_data.category_level3 IS 'Category from "Категория 3 уровня" field in Excel header';