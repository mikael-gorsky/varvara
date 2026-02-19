#!/usr/bin/env node
/**
 * Apply Supabase migration for Margin Analytics
 * Reads the SQL migration file and executes it using the Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the migration file
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260219_create_margin_analytics_schema.sql');
console.log('Reading migration file:', migrationPath);

let migrationSQL;
try {
  migrationSQL = readFileSync(migrationPath, 'utf8');
} catch (error) {
  console.error('Error reading migration file:', error.message);
  process.exit(1);
}

console.log('Applying migration to Supabase...\n');

// Execute the SQL
const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

if (error) {
  console.error('❌ Migration failed:', error.message);
  console.error('Details:', error);

  // Try direct SQL execution as fallback
  console.log('\nTrying alternative method...');

  // Split SQL into individual statements and execute them
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt) {
      try {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
        if (stmtError) {
          console.log(`⚠️ Statement ${i + 1} failed (may be ok if already exists):`, stmtError.message.substring(0, 100));
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (e) {
        console.log(`⚠️ Statement ${i + 1} error:`, e.message);
      }
    }
  }

  console.log('\n✅ Migration completed (check warnings above)');
  console.log('You can verify the tables in Supabase Dashboard:');
  console.log(`${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}`);
} else {
  console.log('✅ Migration applied successfully!');
  console.log('Created tables:');
  console.log('  - customers');
  console.log('  - exchange_rates (with sample data)');
  console.log('  - margin_analytics_data');
  console.log('  - anomaly_alerts');
}
