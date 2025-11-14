/*
  # Create User Style Preferences Table

  1. New Tables
    - `user_style_preferences`
      - `id` (uuid, primary key)
      - `user_id` (text, unique) - identifies the user/session
      - `color_scheme` (jsonb) - stores accent colors, primary colors, etc.
      - `density` (text) - interface density: 'compact', 'normal', 'spacious'
      - `font_family` (text) - selected font family
      - `font_size_scale` (real) - font size multiplier (0.8-1.5)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_style_preferences` table
    - Add policy for anonymous users to read/insert/update preferences
    - Add policy for authenticated users to read/insert/update their own preferences

  3. Indexes
    - Index on user_id for fast lookups

  4. Important Notes
    - This table stores customizable UI preferences per user
    - Color scheme is stored as JSONB for flexibility
    - Density affects spacing throughout the interface
    - Font size scale is a multiplier applied to all text sizes
*/

CREATE TABLE IF NOT EXISTS user_style_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  color_scheme jsonb DEFAULT '{
    "accent": "#90CAF9",
    "accentHover": "#BBDEFB",
    "accentPressed": "#64B5F6"
  }'::jsonb,
  density text DEFAULT 'normal',
  font_family text DEFAULT 'Segoe UI',
  font_size_scale real DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_density CHECK (density IN ('compact', 'normal', 'spacious')),
  CONSTRAINT valid_font_scale CHECK (font_size_scale >= 0.8 AND font_size_scale <= 1.5)
);

CREATE INDEX IF NOT EXISTS idx_user_style_preferences_user_id
  ON user_style_preferences(user_id);

ALTER TABLE user_style_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to style preferences"
  ON user_style_preferences
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert of style preferences"
  ON user_style_preferences
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update of style preferences"
  ON user_style_preferences
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read own preferences"
  ON user_style_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Allow authenticated users to insert own preferences"
  ON user_style_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow authenticated users to update own preferences"
  ON user_style_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
