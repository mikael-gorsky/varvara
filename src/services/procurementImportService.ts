// Procurement Data Import Service
// Created: 2026-02-20
// Purpose: Parse and import procurement planning Excel files (File 3)

import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import type { ProcurementDataRow } from '../types/inventory';

export interface ProcurementImportResult {
  success: boolean;
  message: string;
  stats?: {
    products: number;
    salesRecords: number;
    suppliers: number;
    months: number;
    batchId: string;
  };
  error?: string;
}

/**
 * Parse procurement planning Excel file (File 3)
 * Expected format: Product | Supplier | Price | Volume | Jan-2025 | Feb-2025 | ... monthly columns
 */
export async function parseProcurementFile(file: File): Promise<ProcurementDataRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', codepage: 65001 });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as any[][];

  const rows: ProcurementDataRow[] = [];

  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
    if (rowStr.includes('номенклатура') || rowStr.includes('product') || rowStr.includes('поставщик')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not find header row in Excel file');
  }

  const headers = data[headerRowIndex].map(h => String(h || '').toLowerCase().trim());

  // Find column indices
  const productCol = headers.findIndex(h =>
    h.includes('номенклатура') || h === 'product' || h.includes('товар')
  );
  const supplierCol = headers.findIndex(h =>
    h.includes('поставщик') || h.includes('supplier')
  );
  const priceCol = headers.findIndex(h =>
    h.includes('цена') || h.includes('price') || h.includes('usd')
  );
  const volumeCol = headers.findIndex(h =>
    h.includes('объем') || h.includes('volume') || h.includes('cbm') || h.includes('м3')
  );

  // Find month columns (look for date patterns or month names)
  const monthColumns: { col: number; month: string }[] = [];
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    // Match patterns like "янв.25", "01.2025", "jan-2025", etc.
    const monthMatch = header.match(/(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\.\-\s]?(\d{2,4})?/i);
    const dateMatch = header.match(/(\d{2})\.(\d{4})/); // DD.YYYY format

    if (monthMatch || dateMatch) {
      monthColumns.push({ col: i, month: header });
    }
  }

  if (productCol === -1) {
    throw new Error(`Missing required product column. Found: product=${productCol}`);
  }

  // Parse data rows
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];

    const product_name = row[productCol] ? String(row[productCol]).trim() : '';
    const supplier_name = supplierCol !== -1 && row[supplierCol] ? String(row[supplierCol]).trim() : 'Unknown';
    const price = priceCol !== -1 && row[priceCol] ? parseFloat(row[priceCol]) : 0;
    const volume = volumeCol !== -1 && row[volumeCol] ? parseFloat(row[volumeCol]) : 0;

    // Skip empty rows
    if (!product_name) continue;

    // Extract monthly sales data
    const monthly_sales: { [month: string]: number } = {};
    for (const { col, month } of monthColumns) {
      const value = row[col] ? parseFloat(row[col]) : 0;
      if (value > 0) {
        monthly_sales[month] = value;
      }
    }

    rows.push({
      product_name,
      supplier_name,
      supplier_price_usd: price,
      volume_cbm: volume,
      monthly_sales
    });
  }

  return rows;
}

/**
 * Import procurement data to database (sales history, suppliers, dimensions)
 */
export async function importProcurementData(
  rows: ProcurementDataRow[]
): Promise<ProcurementImportResult> {
  try {
    // Generate batch ID for tracking
    const batchId = crypto.randomUUID();

    // 1. Import/update suppliers
    const uniqueSuppliers = [...new Set(rows.map(r => r.supplier_name))];
    const supplierMap = new Map<string, string>();

    for (const supplierName of uniqueSuppliers) {
      // Try to find existing supplier
      const { data: existing } = await supabase
        .from('inv_suppliers')
        .select('id')
        .eq('name', supplierName)
        .single();

      if (existing) {
        supplierMap.set(supplierName, existing.id);
      } else {
        // Create new supplier
        const { data: newSupplier, error } = await supabase
          .from('inv_suppliers')
          .insert({ name: supplierName })
          .select('id')
          .single();

        if (error) {
          console.warn(`Failed to create supplier ${supplierName}:`, error);
        } else {
          supplierMap.set(supplierName, newSupplier.id);
        }
      }
    }

    // 2. Import/update product dimensions
    const dimensionRecords = rows
      .filter(r => r.volume_cbm > 0)
      .map(r => ({
        product_name: r.product_name,
        volume_cbm: r.volume_cbm
      }));

    if (dimensionRecords.length > 0) {
      await supabase
        .from('inv_product_dimensions')
        .upsert(dimensionRecords, {
          onConflict: 'product_name',
          ignoreDuplicates: false
        });
    }

    // 3. Import sales history
    const salesRecords: any[] = [];
    const monthSet = new Set<string>();

    for (const row of rows) {
      for (const [monthStr, quantity] of Object.entries(row.monthly_sales)) {
        // Parse month string to date (first day of month)
        const monthDate = parseMonthString(monthStr);
        if (!monthDate) continue;

        monthSet.add(monthDate);
        salesRecords.push({
          product_name: row.product_name,
          month_date: monthDate,
          quantity_sold: quantity,
          revenue_rub: 0, // Will be calculated later if needed
          import_batch_id: batchId
        });
      }
    }

    // Insert sales records in batches
    const BATCH_SIZE = 1000;
    let insertedSalesCount = 0;

    for (let i = 0; i < salesRecords.length; i += BATCH_SIZE) {
      const batch = salesRecords.slice(i, i + BATCH_SIZE);

      const { error } = await supabase
        .from('inv_sales_history_monthly')
        .upsert(batch, {
          onConflict: 'product_name,month_date',
          ignoreDuplicates: false
        });

      if (error) {
        throw new Error(`Sales batch insert failed at row ${i}: ${error.message}`);
      }

      insertedSalesCount += batch.length;
    }

    return {
      success: true,
      message: `Successfully imported ${insertedSalesCount} sales records`,
      stats: {
        products: rows.length,
        salesRecords: insertedSalesCount,
        suppliers: uniqueSuppliers.length,
        months: monthSet.size,
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

/**
 * Parse month string to YYYY-MM-DD format (first day of month)
 * Handles formats: "янв.25", "01.2025", "Jan-2025", etc.
 */
function parseMonthString(monthStr: string): string | null {
  const normalized = monthStr.toLowerCase().trim();

  // Map of month names to numbers
  const monthMap: Record<string, number> = {
    'янв': 1, 'jan': 1, 'january': 1,
    'фев': 2, 'feb': 2, 'february': 2,
    'мар': 3, 'mar': 3, 'march': 3,
    'апр': 4, 'apr': 4, 'april': 4,
    'май': 5, 'may': 5,
    'июн': 6, 'jun': 6, 'june': 6,
    'июл': 7, 'jul': 7, 'july': 7,
    'авг': 8, 'aug': 8, 'august': 8,
    'сен': 9, 'sep': 9, 'september': 9,
    'окт': 10, 'oct': 10, 'october': 10,
    'ноя': 11, 'nov': 11, 'november': 11,
    'дек': 12, 'dec': 12, 'december': 12
  };

  // Try to extract month and year
  const match = normalized.match(/(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^\d]*(\d{2,4})/i);

  if (match) {
    const monthName = match[1];
    const yearStr = match[2];
    const month = monthMap[monthName];
    const year = yearStr.length === 2 ? 2000 + parseInt(yearStr) : parseInt(yearStr);

    if (month && year) {
      const monthPadded = month.toString().padStart(2, '0');
      return `${year}-${monthPadded}-01`;
    }
  }

  // Try DD.YYYY format
  const dateMatch = normalized.match(/(\d{2})\.(\d{4})/);
  if (dateMatch) {
    const month = dateMatch[1];
    const year = dateMatch[2];
    return `${year}-${month}-01`;
  }

  return null;
}
