/*
  # Fix get_imported_reports function types

  1. Changes
    - Change when_imported from timestamptz to timestamp to match table schema
*/

DROP FUNCTION IF EXISTS get_imported_reports();

CREATE OR REPLACE FUNCTION get_imported_reports()
RETURNS TABLE (
  report_id uuid,
  date_of_report date,
  reported_days smallint,
  when_imported timestamp,
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