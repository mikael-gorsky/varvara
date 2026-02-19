// ABC Classification Import Service
// Created: 2026-02-20
// Purpose: Parse and import ABC classification Excel files (File 2)

import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import type { ABCClassificationRow } from '../types/inventory';

export interface ABCImportResult {
  success: boolean;
  message: string;
  stats?: {
    products: number;
    classA: number;
    classB: number;
    classC: number;
    totalRevenue: number;
    batchId: string;
  };
  error?: string;
}

/**
 * Parse ABC classification Excel file (File 2)
 * Expected format: Product Name | ABC Class | Revenue | Profit | Rank | Cumulative %
 */
export async function parseABCFile(file: File): Promise<ABCClassificationRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', codepage: 65001 });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as any[][];

  const rows: ABCClassificationRow[] = [];

  // Find header row (look for "Группировка")
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
    if (rowStr.includes('группировка') || (rowStr.includes('номенклатура') && rowStr.includes('выручка'))) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not find header row in Excel file');
  }

  const headers = data[headerRowIndex].map(h => String(h || '').toLowerCase().trim());

  // Find column indices - column 1 is product/grouping
  const productCol = 1; // Second column is always the grouping/product column

  // Find revenue column (prefer "без ндс" version)
  const revenueCol = headers.findIndex(h =>
    h.includes('выручк') && h.includes('валют')
  );

  // Find profit column
  const profitCol = headers.findIndex(h =>
    h.includes('прибыл') && h.includes('валют')
  );

  console.log('ABC Parse - Found columns:', { productCol, revenueCol, profitCol });
  console.log('ABC Parse - Headers:', headers);

  // Parse data rows - track current ABC class from section headers
  let currentClass: 'A' | 'B' | 'C' | null = null;
  let rank = 0;

  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];

    const cellValue = row[productCol] ? String(row[productCol]).trim() : '';

    if (!cellValue) continue;

    // Check if this is an ABC class header (e.g., "A - класс")
    const classMatch = cellValue.match(/^([ABC])\s*[-–]\s*класс/i);
    if (classMatch) {
      currentClass = classMatch[1].toUpperCase() as 'A' | 'B' | 'C';
      console.log(`ABC Parse - Found class header: ${currentClass} at row ${i}`);
      continue; // Skip header rows
    }

    // Check for summary rows (Итого)
    if (cellValue.toLowerCase().includes('итого')) {
      continue;
    }

    // This is a product row
    if (currentClass && cellValue) {
      const revenue = revenueCol !== -1 && row[revenueCol] ? parseFloat(row[revenueCol]) : 0;
      const profit = profitCol !== -1 && row[profitCol] ? parseFloat(row[profitCol]) : 0;

      // Include all products under a class, even with 0 revenue
      rank++;
      rows.push({
        product_name: cellValue,
        abc_class: currentClass,
        revenue_rub_2025: revenue,
        profit_rub_2025: profit,
        revenue_rank: rank,
        revenue_cumulative_percent: 0 // Will calculate later if needed
      });
    }
  }

  return rows;
}

/**
 * Import ABC classification data to database
 */
export async function importABCClassification(
  rows: ABCClassificationRow[],
  year: number = 2025
): Promise<ABCImportResult> {
  try {
    // Generate batch ID for tracking
    const batchId = crypto.randomUUID();

    // Prepare records for bulk insert
    const recordsRaw = rows.map(row => ({
      product_name: row.product_name,
      period_year: year,
      abc_class: row.abc_class,
      revenue_rub_2025: row.revenue_rub_2025,
      profit_rub_2025: row.profit_rub_2025,
      revenue_rank: row.revenue_rank,
      revenue_cumulative_percent: row.revenue_cumulative_percent,
      import_batch_id: batchId
    }));

    // Deduplicate by unique key (product_name, period_year)
    const recordsMap = new Map<string, typeof recordsRaw[0]>();
    for (const record of recordsRaw) {
      const key = `${record.product_name}|${record.period_year}`;
      // Keep last occurrence if duplicates exist
      recordsMap.set(key, record);
    }
    const records = Array.from(recordsMap.values());

    console.log(`ABC Import - Deduped: ${recordsRaw.length} → ${records.length} records`);

    // Insert in batches of 1000
    const BATCH_SIZE = 1000;
    let insertedCount = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);

      const { error } = await supabase
        .from('inv_abc_classification')
        .upsert(batch, {
          onConflict: 'product_name,period_year',
          ignoreDuplicates: false
        });

      if (error) {
        throw new Error(`Batch insert failed at row ${i}: ${error.message}`);
      }

      insertedCount += batch.length;
    }

    // Calculate stats
    const classA = rows.filter(r => r.abc_class === 'A').length;
    const classB = rows.filter(r => r.abc_class === 'B').length;
    const classC = rows.filter(r => r.abc_class === 'C').length;
    const totalRevenue = rows.reduce((sum, r) => sum + r.revenue_rub_2025, 0);

    return {
      success: true,
      message: `Successfully imported ${insertedCount} ABC classifications`,
      stats: {
        products: rows.length,
        classA,
        classB,
        classC,
        totalRevenue: Math.round(totalRevenue),
        batchId
      }
    };

  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      message: 'Import failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
