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

  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
    if (rowStr.includes('номенклатура') || rowStr.includes('product') || rowStr.includes('abc')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not find header row in Excel file');
  }

  const headers = data[headerRowIndex].map(h => String(h || '').toLowerCase().trim());

  // Find column indices (flexible mapping)
  const productCol = headers.findIndex(h =>
    h.includes('номенклатура') || h === 'product' || h.includes('товар') || h.includes('наименование')
  );
  const abcCol = headers.findIndex(h =>
    h.includes('abc') || h.includes('класс') || h === 'class'
  );
  const revenueCol = headers.findIndex(h =>
    h.includes('выручка') || h.includes('revenue') || h.includes('продаж')
  );
  const profitCol = headers.findIndex(h =>
    h.includes('прибыль') || h.includes('profit') || h.includes('маржа')
  );
  const rankCol = headers.findIndex(h =>
    h.includes('ранг') || h.includes('rank') || h.includes('место')
  );
  const cumulativeCol = headers.findIndex(h =>
    h.includes('накопл') || h.includes('cumulative') || h.includes('%')
  );

  if (productCol === -1 || abcCol === -1) {
    throw new Error(`Missing required columns. Found: product=${productCol}, abc=${abcCol}`);
  }

  // Parse data rows
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];

    const product_name = row[productCol] ? String(row[productCol]).trim() : '';
    const abc_class_raw = row[abcCol] ? String(row[abcCol]).trim().toUpperCase() : '';
    const revenue = revenueCol !== -1 && row[revenueCol] ? parseFloat(row[revenueCol]) : 0;
    const profit = profitCol !== -1 && row[profitCol] ? parseFloat(row[profitCol]) : 0;
    const rank = rankCol !== -1 && row[rankCol] ? parseInt(row[rankCol]) : 0;
    const cumulative = cumulativeCol !== -1 && row[cumulativeCol] ? parseFloat(row[cumulativeCol]) : 0;

    // Skip empty rows
    if (!product_name || !abc_class_raw) continue;

    // Validate ABC class
    const abc_class = abc_class_raw === 'A' || abc_class_raw === 'B' || abc_class_raw === 'C'
      ? abc_class_raw as 'A' | 'B' | 'C'
      : 'C'; // Default to C if invalid

    rows.push({
      product_name,
      abc_class,
      revenue_rub_2025: revenue,
      profit_rub_2025: profit,
      revenue_rank: rank || 0,
      revenue_cumulative_percent: cumulative
    });
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
    const records = rows.map(row => ({
      product_name: row.product_name,
      period_year: year,
      abc_class: row.abc_class,
      revenue_rub_2025: row.revenue_rub_2025,
      profit_rub_2025: row.profit_rub_2025,
      revenue_rank: row.revenue_rank,
      revenue_cumulative_percent: row.revenue_cumulative_percent,
      import_batch_id: batchId
    }));

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
