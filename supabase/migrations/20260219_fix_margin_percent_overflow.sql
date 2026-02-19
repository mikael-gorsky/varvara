-- Fix margin_percent overflow issue
-- Change from NUMERIC(5,2) to NUMERIC(7,2) to accommodate extreme margin values

-- Drop the generated column first
ALTER TABLE margin_analytics_data
DROP COLUMN margin_percent;

-- Recreate with increased precision
ALTER TABLE margin_analytics_data
ADD COLUMN margin_percent NUMERIC(7, 2) GENERATED ALWAYS AS (
  CASE
    WHEN revenue_rub > 0 THEN
      ((revenue_rub - (cogs_rub + additional_expenses_rub)) / revenue_rub * 100)
    ELSE 0
  END
) STORED;

-- Now margin_percent can hold values from -99,999.99 to 99,999.99
-- This accommodates extreme edge cases while still being reasonable
