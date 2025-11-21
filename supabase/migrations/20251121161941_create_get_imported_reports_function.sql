/*
  # Create RPC function to get imported reports with details

  1. Function
    - `get_imported_reports()` - Returns list of all imported reports with aggregated data
    - Includes: report metadata, record count, category
    - Orders by date descending
  
  2. Purpose
    - Provide a single query to fetch all report details with statistics
    - Avoid complex client-side queries
*/

CREATE OR REPLACE FUNCTION get_imported_reports()
RETURNS TABLE (
  report_id uuid,
  date_of_report date,
  reported_days integer,
  when_imported timestamptz,
  filename text,
  record_count bigint,
  category text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.report_id,
    r.date_of_report,
    r.reported_days,
    r.when_imported,
    r.filename,
    COUNT(d.id) as record_count,
    MIN(d.category_level3) as category
  FROM ozon_reports r
  LEFT JOIN ozon_data d ON d.report_id = r.report_id
  GROUP BY r.report_id, r.date_of_report, r.reported_days, r.when_imported, r.filename
  ORDER BY r.date_of_report DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;