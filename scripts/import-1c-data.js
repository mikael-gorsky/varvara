#!/usr/bin/env node
/**
 * Import 1C Sales Analysis Data to Supabase
 *
 * Parses Excel files with hierarchical structure:
 * Period → Customer Group → Customer → Product
 *
 * Customer Groups (5 fixed):
 * - Конечные заказчики
 * - Крупный опт -торговые сети
 * - Маркетплейсы
 * - Мелкий опт
 * - Тендеры
 *
 * Product Groups: First 3 letters of product name (Cyrillic lowercase)
 *
 * Usage:
 *   node scripts/import-1c-data.js <excel-file-path>
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

// Define valid customer groups (case-insensitive matching)
const VALID_CUSTOMER_GROUPS = [
  'конечные заказчики',
  'крупный опт -торговые сети',
  'маркетплейсы',
  'мелкий опт',
  'тендеры',
];

/**
 * Check if a string matches one of the valid customer groups
 */
function isValidCustomerGroup(str) {
  const normalized = str.toLowerCase().trim();
  return VALID_CUSTOMER_GROUPS.find(group => normalized === group || normalized.startsWith(group));
}

/**
 * Get product category (first 3 letters, lowercase Cyrillic)
 */
function getProductCategory(productName) {
  if (!productName || typeof productName !== 'string') return 'zzz';

  // Remove leading/trailing whitespace
  const trimmed = productName.trim();

  // Extract first 3 Cyrillic letters
  const cyrillicLetters = trimmed.match(/[а-яё]/gi);
  if (!cyrillicLetters || cyrillicLetters.length === 0) return 'zzz';

  const prefix = cyrillicLetters.slice(0, 3).join('').toLowerCase();
  return prefix.padEnd(3, 'z'); // Ensure 3 characters
}

// Parse hierarchical data
let currentPeriod = null;
let currentCustomerGroup = null;
let currentCustomer = null;
let currentCustomerINN = null;

const customers = new Map(); // name -> { inn, customer_group }
const transactions = [];

console.log('🔍 Parsing hierarchical data...\n');

for (let i = 10; i < data.length; i++) { // Start from row 10 (skip headers)
  const row = data[i];
  const cellA = row[0]; // Hierarchy column

  if (!cellA || cellA === 'Итого') continue; // Skip totals and empty rows

  const cellAStr = String(cellA).trim();

  // Extract data columns
  const quantity = row[5] ? parseFloat(row[5]) : 0;
  const sales_rub = row[6] ? parseFloat(row[6]) : 0;
  const cogs_rub = row[7] ? parseFloat(row[7]) : 0;
  const additional_expenses_rub = row[8] ? parseFloat(row[8]) : 0;

  // Skip rows with no financial data at all
  if (quantity === 0 && sales_rub === 0 && cogs_rub === 0 && additional_expenses_rub === 0) {
    continue;
  }

  // 1. Check if this is a period row (date format)
  if (cellAStr.match(/^\d{2}\.\d{2}\.\d{4}/)) {
    const dateMatch = cellAStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (dateMatch) {
      const [_, day, month, year] = dateMatch;
      currentPeriod = `${year}-${month}-01`;
      console.log(`📅 Period: ${cellAStr} → ${currentPeriod}`);
    }
    continue;
  }

  // 2. Check if this is a customer group row (one of 5 valid groups)
  const matchedGroup = isValidCustomerGroup(cellAStr);
  if (matchedGroup) {
    currentCustomerGroup = matchedGroup;
    console.log(`  📁 Customer Group: ${currentCustomerGroup}`);
    continue;
  }

  // 3. Check if this is a customer row (has INN: ", [digits]" pattern)
  const innMatch = cellAStr.match(/,\s*(\d+)$/);
  if (innMatch) {
    const inn = innMatch[1];
    const customerName = cellAStr.replace(/,\s*\d+$/, '').trim();

    currentCustomer = customerName;
    currentCustomerINN = inn;

    // Store customer with their group
    if (!customers.has(customerName)) {
      customers.set(customerName, {
        name: customerName,
        inn: inn,
        category: currentCustomerGroup || 'Неизвестно',
      });
      console.log(`    👤 Customer: ${customerName} (${inn}) [${currentCustomerGroup}]`);
    }

    continue;
  }

  // 4. If we have a current customer, this must be a product row
  if (currentCustomer && currentPeriod) {
    const productName = cellAStr;
    const productCategory = getProductCategory(productName);

    // Create transaction record
    transactions.push({
      period_date: currentPeriod,
      customer_name: currentCustomer,
      customer_inn: currentCustomerINN,
      customer_category: currentCustomerGroup || 'Неизвестно',
      product_name: productName,
      product_category: productCategory,
      quantity,
      revenue_rub: sales_rub,
      cogs_rub,
      additional_expenses_rub: additional_expenses_rub || 0,
    });
  }
}

console.log(`\n✅ Parsed ${customers.size} customers and ${transactions.length} transactions\n`);

// Validate customer groups
const groupCounts = {};
transactions.forEach(t => {
  groupCounts[t.customer_category] = (groupCounts[t.customer_category] || 0) + 1;
});
console.log('📊 Customer groups distribution:');
Object.entries(groupCounts).forEach(([group, count]) => {
  console.log(`   ${group}: ${count} transactions`);
});

// Validate product categories (show top 10)
const productCategoryCounts = {};
transactions.forEach(t => {
  productCategoryCounts[t.product_category] = (productCategoryCounts[t.product_category] || 0) + 1;
});
console.log('\n📦 Top 10 product categories:');
Object.entries(productCategoryCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} transactions`);
  });

// Insert customers into Supabase
console.log('\n💾 Inserting customers into Supabase...');

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
  product_category: t.product_category,
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
    process.exit(1);
  }

  inserted += batch.length;
  console.log(`  ✅ Inserted ${inserted} / ${transactionRecords.length} transactions`);
}

console.log(`\n🎉 Import complete!`);
console.log(`   Customers: ${customerRecords.length}`);
console.log(`   Transactions: ${transactionRecords.length}`);
console.log(`\n📊 You can now view the data in Supabase Dashboard or refresh the Margins Dashboard`);
