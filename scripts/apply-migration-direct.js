#!/usr/bin/env node
/**
 * Apply migration directly using Supabase REST API
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

// Read migration file
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260219_create_margin_analytics_schema.sql');
const migrationSQL = readFileSync(migrationPath, 'utf8');

console.log('📂 Applying migration via Supabase REST API...\n');

// Use Supabase REST API to execute SQL
const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
  },
  body: JSON.stringify({ query: migrationSQL }),
});

if (!response.ok) {
  const error = await response.text();
  console.error('❌ Migration failed:', error);

  // Alternative: Use pgmeta API
  console.log('\n🔄 Trying alternative method via pg_query...\n');

  const pgResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ query: migrationSQL }),
  });

  if (!pgResponse.ok) {
    console.error('❌ Alternative method also failed');
    console.error('Please apply the migration manually via Supabase Dashboard SQL Editor');
    console.error('File location:', migrationPath);
    process.exit(1);
  }

  console.log('✅ Migration applied successfully via alternative method!');
} else {
  console.log('✅ Migration applied successfully!');
}

console.log('\n📊 Tables created:');
console.log('  - customers');
console.log('  - exchange_rates');
console.log('  - margin_analytics_data');
console.log('  - anomaly_alerts');
console.log('\nYou can now run the import script.');
