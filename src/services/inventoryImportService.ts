// Inventory Import Service
// Created: 2026-02-20
// Purpose: Parse and import aged inventory Excel files (File 1)

import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import type { AgedInventoryRow, Warehouse } from '../types/inventory';

export interface InventoryImportResult {
  success: boolean;
  message: string;
  stats?: {
    products: number;
    warehouses: number;
    totalValue: number;
    batchId: string;
  };
  error?: string;
}

/**
 * Parse aged inventory Excel file (File 1)
 * Expected format: Warehouse | Product Name | Quantity | Unit Cost | Age (months) | Quality Status
 */
export async function parseAgedInventoryFile(file: File): Promise<AgedInventoryRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', codepage: 65001 });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as any[][];

  const rows: AgedInventoryRow[] = [];

  // Find header row (look for key columns)
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
    if (rowStr.includes('склад') && rowStr.includes('номенклатура')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not find header row in Excel file');
  }

  const headers = data[headerRowIndex].map(h => String(h || '').toLowerCase().trim());

  // Find column indices (flexible mapping)
  const warehouseCol = headers.findIndex(h =>
    h === 'склад' || h === 'warehouse'
  );
  const productCol = headers.findIndex(h =>
    h === 'номенклатура' || h === 'product'
  );
  const quantityCol = headers.findIndex(h =>
    h === 'всего' || h.includes('количество') || h === 'quantity' || h.includes('кол-во')
  );
  const costCol = headers.findIndex(h =>
    h.includes('себест') || h.includes('цена') || h.includes('cost')
  );
  const ageCol = headers.findIndex(h =>
    h.includes('месяц') && h.includes('склад') || h.includes('age')
  );
  const qualityCol = headers.findIndex(h =>
    h === 'качество' || h.includes('состояние') || h === 'quality'
  );

  if (warehouseCol === -1 || productCol === -1 || quantityCol === -1) {
    throw new Error(`Missing required columns. Found: warehouse=${warehouseCol}, product=${productCol}, quantity=${quantityCol}`);
  }

  // Parse data rows
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];

    const warehouse = row[warehouseCol] ? String(row[warehouseCol]).trim() : '';
    const product_name = row[productCol] ? String(row[productCol]).trim() : '';
    const quantity = row[quantityCol] ? parseFloat(row[quantityCol]) : 0;
    const unit_cost = costCol !== -1 && row[costCol] ? parseFloat(row[costCol]) : 0;
    const age_months = ageCol !== -1 && row[ageCol] ? parseInt(row[ageCol]) : 0;
    const quality_status = qualityCol !== -1 && row[qualityCol] ? String(row[qualityCol]).trim() : 'годные';

    // Skip empty rows
    if (!warehouse || !product_name || quantity === 0) continue;

    rows.push({
      warehouse,
      product_name,
      quantity,
      unit_cost_rub: unit_cost,
      age_months,
      quality_status
    });
  }

  return rows;
}

/**
 * Get or create warehouse by name
 */
async function getOrCreateWarehouse(warehouseName: string): Promise<string> {
  // Try to find existing warehouse
  const { data: existing } = await supabase
    .from('inv_warehouses')
    .select('id')
    .eq('name', warehouseName)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new warehouse if not found
  const { data: newWarehouse, error } = await supabase
    .from('inv_warehouses')
    .insert({
      name: warehouseName,
      code: warehouseName.substring(0, 10).toUpperCase()
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create warehouse ${warehouseName}: ${error.message}`);
  }

  return newWarehouse.id;
}

/**
 * Import aged inventory data to database
 */
export async function importInventorySnapshot(
  rows: AgedInventoryRow[],
  snapshotDate: Date = new Date()
): Promise<InventoryImportResult> {
  try {
    // Generate batch ID for tracking
    const batchId = crypto.randomUUID();
    const dateStr = snapshotDate.toISOString().split('T')[0];

    // Get warehouse mappings
    const warehouseMap = new Map<string, string>();
    const uniqueWarehouses = [...new Set(rows.map(r => r.warehouse))];

    for (const warehouseName of uniqueWarehouses) {
      const warehouseId = await getOrCreateWarehouse(warehouseName);
      warehouseMap.set(warehouseName, warehouseId);
    }

    // Prepare snapshots for bulk insert
    const snapshots = rows.map(row => ({
      snapshot_date: dateStr,
      product_name: row.product_name,
      warehouse_id: warehouseMap.get(row.warehouse)!,
      quantity_on_hand: row.quantity,
      quantity_reserved: 0,
      unit_cost_rub: row.unit_cost_rub,
      age_months: row.age_months,
      quality_status: row.quality_status,
      import_batch_id: batchId
    }));

    // Insert in batches of 1000 to avoid payload limits
    const BATCH_SIZE = 1000;
    let insertedCount = 0;

    for (let i = 0; i < snapshots.length; i += BATCH_SIZE) {
      const batch = snapshots.slice(i, i + BATCH_SIZE);

      const { error } = await supabase
        .from('inv_inventory_snapshots')
        .upsert(batch, {
          onConflict: 'snapshot_date,product_name,warehouse_id',
          ignoreDuplicates: false
        });

      if (error) {
        throw new Error(`Batch insert failed at row ${i}: ${error.message}`);
      }

      insertedCount += batch.length;
    }

    // Calculate total value
    const totalValue = rows.reduce((sum, row) =>
      sum + (row.quantity * row.unit_cost_rub), 0
    );

    return {
      success: true,
      message: `Successfully imported ${insertedCount} inventory records`,
      stats: {
        products: new Set(rows.map(r => r.product_name)).size,
        warehouses: uniqueWarehouses.length,
        totalValue: Math.round(totalValue),
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
