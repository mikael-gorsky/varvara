-- Increase margin_percent precision to handle extreme edge cases
-- Change from NUMERIC(7,2) to NUMERIC(10,2) to accommodate extreme margins
-- This allows values from -99,999,999.99% to 99,999,999.99%

-- Drop the generated column
ALTER TABLE margin_analytics_data
DROP COLUMN margin_percent;

-- Recreate with increased precision
ALTER TABLE margin_analytics_data
ADD COLUMN margin_percent NUMERIC(10, 2) GENERATED ALWAYS AS (
  CASE
    WHEN revenue_rub > 0 THEN
      ((revenue_rub - (cogs_rub + additional_expenses_rub)) / revenue_rub * 100)
    ELSE 0
  END
) STORED;
