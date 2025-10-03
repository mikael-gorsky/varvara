/*
  # Create Import History Table

  1. New Tables
    - `ozon_import_history`
      - `id` (uuid, primary key)
      - `filename` (text, original filename)
      - `file_hash` (text, SHA-256 hash for duplicate detection)
      - `file_size` (bigint, file size in bytes)
      - `records_count` (integer, number of records imported)
      - `date_range_start` (date, earliest date in the file)
      - `date_range_end` (date, latest date in the file)
      - `validation_status` (text, validation result)
      - `validation_errors` (jsonb, array of validation errors)
      - `import_status` (text, success/error/partial)
      - `error_message` (text, error details if failed)
      - `import_duration_ms` (integer, time taken to import)
      - `created_at` (timestamptz, import timestamp)
      - `created_by` (uuid, user who imported - nullable for now)

  2. Security
    - Enable RLS on `ozon_import_history` table
    - Add policies for authenticated users to read/write

  3. Indexes
    - Add index on file_hash for duplicate detection
    - Add index on created_at for chronological queries
    - Add index on filename for searching
*/

CREATE TABLE IF NOT EXISTS ozon_import_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_hash text NOT NULL,
  file_size bigint NOT NULL,
  records_count integer DEFAULT 0,
  date_range_start date,
  date_range_end date,
  validation_status text DEFAULT 'pending',
  validation_errors jsonb DEFAULT '[]'::jsonb,
  import_status text DEFAULT 'pending',
  error_message text,
  import_duration_ms integer,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

ALTER TABLE ozon_import_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read import history"
  ON ozon_import_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create import history"
  ON ozon_import_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update import history"
  ON ozon_import_history
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ozon_import_history_file_hash 
  ON ozon_import_history(file_hash);

CREATE INDEX IF NOT EXISTS idx_ozon_import_history_created_at 
  ON ozon_import_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ozon_import_history_filename 
  ON ozon_import_history(filename);

CREATE INDEX IF NOT EXISTS idx_ozon_import_history_import_status 
  ON ozon_import_history(import_status);
