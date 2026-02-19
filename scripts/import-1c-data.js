#!/usr/bin/env node
/**
 * Import 1C Sales Analysis Data to Supabase
 *
 * Parses Excel files with hierarchical structure:
 * Period → Category → Customer → Product
 *
 * Usage:
 *   node scripts/import-1c-data.js <excel-file-path>
 *   node scripts/import-1c-data.js "/path/to/АП 2024 ПродажаСебестоимостьДопРасходы.xls"
 */

import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get file path from command line
const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Error: Please provide Excel file path');
  console.error('Usage: node scripts/import-1c-data.js <file-path>');
  process.exit(1);
}

console.log(`📂 Reading file: ${filePath}\n`);

// Read Excel file
let workbook;
try {
  const buffer = readFileSync(filePath);
  workbook = XLSX.read(buffer, { type: 'buffer', codepage: 65001 }); // UTF-8 for Russian text
} catch (error) {
  console.error('❌ Error reading Excel file:', error.message);
  process.exit(1);
}

// Get first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON (array of arrays)
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

console.log(`📊 Total rows: ${data.length}\n`);

// Parse hierarchical data
let currentPeriod = null;
let currentCategory = null;
let currentCustomer = null;
let currentCustomerINN = null;

const customers = new Map(); // name -> { inn, category }
const transactions = [];

console.log('🔍 Parsing hierarchical data...\n');

for (let i = 10; i < data.length; i++) { // Start from row 10 (skip headers)
  const row = data[i];
  const cellA = row[0]; // Hierarchy column

  if (!cellA || cellA === 'Итого') continue; // Skip totals and empty rows

  const cellAStr = String(cellA).trim();

  // Extract data columns (convert to null if 0 or missing)
  const quantity = row[5] ? parseFloat(row[5]) : 0;
  const sales_rub = row[6] ? parseFloat(row[6]) : 0;
  const cogs_rub = row[7] ? parseFloat(row[7]) : 0;
  const additional_expenses_rub = row[8] ? parseFloat(row[8]) : null; // null instead of 0

  // Skip rows with no financial data at all
  if (quantity === 0 && sales_rub === 0 && cogs_rub === 0 && additional_expenses_rub === 0) {
    continue;
  }

  // Determine row type:
  // 1. Period: Date format "01.01.2026" or "01.01.2026 0:00:00"
  // 2. Category: Text without INN, appears after period
  // 3. Customer: Text with ", [numbers]" pattern (INN)
  // 4. Product: Everything else with data

  // Check if this is a period row (date format)
  if (cellAStr.match(/^\d{2}\.\d{2}\.\d{4}/) || cellAStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    // Period row - parse date
    const dateMatch = cellAStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (dateMatch) {
      const [_, day, month, year] = dateMatch;
      currentPeriod = `${year}-${month}-01`;
      console.log(`📅 Period: ${cellAStr} → ${currentPeriod}`);
    }
    continue;
  }

  // Check if this is a customer row (has INN: ", [digits]" pattern)
  const innMatch = cellAStr.match(/,\s*(\d+)$/);

  if (innMatch) {
    // Customer row
    const inn = innMatch[1];
    const customerName = cellAStr.replace(/,\s*\d+$/, '').trim();

    currentCustomer = customerName;
    currentCustomerINN = inn;

    // Store customer
    if (!customers.has(customerName)) {
      customers.set(customerName, {
        name: customerName,
        inn: inn,
        category: currentCategory || 'Unknown',
      });
      console.log(`  👤 Customer: ${customerName} (${inn})`);
    }

    continue;
  }

  // Check if this might be a category (no INN, no product-like name, appears before customers)
  // Category rows typically have totals but no specific product characteristics
  // Simple heuristic: if it's not a customer and has round totals, it's likely a category
  if (!currentCustomer && !cellAStr.includes('шт') && !cellAStr.includes('Office Kit') && !cellAStr.includes('мм')) {
    currentCategory = cellAStr;
    console.log(`  📁 Category: ${currentCategory}`);
    continue;
  }

  // If we have a current customer, this must be a product row
  if (currentCustomer && currentPeriod) {
    const productName = cellAStr;

    // Create transaction record
    transactions.push({
      period_date: currentPeriod,
      customer_name: currentCustomer,
      customer_inn: currentCustomerINN,
      customer_category: currentCategory || 'Unknown',
      product_name: productName,
      quantity,
      revenue_rub: sales_rub,
      cogs_rub,
      additional_expenses_rub,
    });
  }
}

console.log(`\n✅ Parsed ${customers.size} customers and ${transactions.length} transactions\n`);

// Insert customers into Supabase
console.log('💾 Inserting customers into Supabase...');

const customerRecords = Array.from(customers.values());
const { data: insertedCustomers, error: customerError } = await supabase
  .from('customers')
  .upsert(customerRecords, { onConflict: 'name', ignoreDuplicates: false })
  .select();

if (customerError) {
  console.error('❌ Error inserting customers:', customerError.message);
  process.exit(1);
}

console.log(`✅ Inserted/updated ${insertedCustomers.length} customers\n`);

// Create customer name -> ID map
const customerIdMap = new Map();
insertedCustomers.forEach(c => {
  customerIdMap.set(c.name, c.id);
});

// Prepare transaction records with customer IDs
console.log('💾 Preparing transaction records...');

const transactionRecords = transactions.map(t => ({
  period_date: t.period_date,
  customer_id: customerIdMap.get(t.customer_name),
  customer_category: t.customer_category,
  product_name: t.product_name,
  product_category: null, // Could be extracted from hierarchy if needed
  quantity: t.quantity || 0,
  revenue_rub: t.revenue_rub || 0,
  cogs_rub: t.cogs_rub || 0,
  additional_expenses_rub: t.additional_expenses_rub || 0,
}));

// Insert in batches (Supabase has a limit on bulk inserts)
const BATCH_SIZE = 1000;
let inserted = 0;

console.log(`💾 Inserting ${transactionRecords.length} transactions in batches of ${BATCH_SIZE}...\n`);

for (let i = 0; i < transactionRecords.length; i += BATCH_SIZE) {
  const batch = transactionRecords.slice(i, i + BATCH_SIZE);

  const { error: txError } = await supabase
    .from('margin_analytics_data')
    .insert(batch);

  if (txError) {
    console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, txError.message);
    console.error('Full error:', JSON.stringify(txError, null, 2));
    console.error('Sample record:', JSON.stringify(batch[0], null, 2));
    console.error('Total records in batch:', batch.length);

    // Try inserting records one by one to find the problematic one
    console.log('\n🔍 Finding problematic record...');
    for (let j = 0; j < Math.min(5, batch.length); j++) {
      const { error: singleError } = await supabase
        .from('margin_analytics_data')
        .insert([batch[j]]);

      if (singleError) {
        console.error(`❌ Record ${j} failed:`, JSON.stringify(batch[j], null, 2));
        console.error('Error:', singleError.message);
      } else {
        console.log(`✅ Record ${j} succeeded`);
      }
    }

    process.exit(1);
  }

  inserted += batch.length;
  console.log(`  ✅ Inserted ${inserted} / ${transactionRecords.length} transactions`);
}

console.log(`\n🎉 Import complete!`);
console.log(`   Customers: ${customerRecords.length}`);
console.log(`   Transactions: ${transactionRecords.length}`);
console.log(`\n📊 You can now view the data in Supabase Dashboard or refresh the Margins Dashboard`);
