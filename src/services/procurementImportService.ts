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

  // Find header row (Row 10 has main headers like "Номенклатура")
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
    if (rowStr.includes('номенклатура') && rowStr.includes('объем')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not find header row in Excel file');
  }

  const mainHeaders = data[headerRowIndex].map(h => String(h || '').toLowerCase().trim());
  // Row 11 (next row) has sub-headers like "Поставщик"
  const subHeaders = headerRowIndex + 1 < data.length
    ? data[headerRowIndex + 1].map(h => String(h || '').toLowerCase().trim())
    : [];

  // Find column indices from main headers
  const productCol = mainHeaders.findIndex(h =>
    h === 'номенклатура' || h === 'product'
  );
  const volumeCol = mainHeaders.findIndex(h =>
    h === 'объем' || h.includes('volume')
  );

  // Find supplier from sub-headers (Row 11)
  const supplierCol = subHeaders.findIndex(h =>
    h === 'поставщик' || h === 'supplier'
  );

  // Find price USD from sub-headers
  const priceCol = subHeaders.findIndex(h =>
    h.includes('себест') && h.includes('usd')
  );

  // Find month columns from main headers (format: "Январь.2025", "Февраль.2025")
  const monthColumns: { col: number; month: string }[] = [];
  const monthNamesRu = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
                        'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

  for (let i = 0; i < mainHeaders.length; i++) {
    const header = mainHeaders[i];
    // Match "Январь.2025" pattern
    const monthMatch = header.match(/(январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь)\.(\d{4})/i);

    if (monthMatch) {
      monthColumns.push({ col: i, month: header });
    }
  }

  if (productCol === -1) {
    throw new Error(`Missing required product column. Found: product=${productCol}`);
  }

  // Data starts at headerRowIndex + 2 (skip both header rows)
  const dataStartRow = headerRowIndex + 2;

  // Parse data rows
  for (let i = dataStartRow; i < data.length; i++) {
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
 * Handles formats: "Январь.2025", "янв.25", "01.2025", "Jan-2025", etc.
 */
function parseMonthString(monthStr: string): string | null {
  const normalized = monthStr.toLowerCase().trim();

  // Map of month names to numbers (including full Russian month names)
  const monthMap: Record<string, number> = {
    'январь': 1, 'янв': 1, 'jan': 1, 'january': 1,
    'февраль': 2, 'фев': 2, 'feb': 2, 'february': 2,
    'март': 3, 'мар': 3, 'mar': 3, 'march': 3,
    'апрель': 4, 'апр': 4, 'apr': 4, 'april': 4,
    'май': 5, 'may': 5,
    'июнь': 6, 'июн': 6, 'jun': 6, 'june': 6,
    'июль': 7, 'июл': 7, 'jul': 7, 'july': 7,
    'август': 8, 'авг': 8, 'aug': 8, 'august': 8,
    'сентябрь': 9, 'сен': 9, 'sep': 9, 'september': 9,
    'октябрь': 10, 'окт': 10, 'oct': 10, 'october': 10,
    'ноябрь': 11, 'ноя': 11, 'nov': 11, 'november': 11,
    'декабрь': 12, 'дек': 12, 'dec': 12, 'december': 12
  };

  // Try to extract month and year - pattern: "Январь.2025"
  const fullMonthMatch = normalized.match(/(январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь)\.(\d{4})/i);
  if (fullMonthMatch) {
    const monthName = fullMonthMatch[1];
    const year = parseInt(fullMonthMatch[2]);
    const month = monthMap[monthName];

    if (month && year) {
      const monthPadded = month.toString().padStart(2, '0');
      return `${year}-${monthPadded}-01`;
    }
  }

  // Try short month format: "янв.25"
  const shortMonthMatch = normalized.match(/(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^\d]*(\d{2,4})/i);
  if (shortMonthMatch) {
    const monthName = shortMonthMatch[1];
    const yearStr = shortMonthMatch[2];
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
