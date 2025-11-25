/*
  # Add anonymous read policy for ozon_reports

  1. Security Changes
    - Add policy to allow anonymous users to read ozon_reports table
    - This enables the frontend to fetch report metadata without authentication
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'ozon_reports' 
    AND policyname = 'Anonymous users can read ozon reports'
  ) THEN
    CREATE POLICY "Anonymous users can read ozon reports"
      ON ozon_reports
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;
