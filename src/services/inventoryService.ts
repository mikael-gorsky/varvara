// Inventory Analytics Service
// Created: 2026-02-20
// Purpose: Query inventory data from database

import { supabase } from '../lib/supabase';
import type { CurrentInventory, InventorySummary } from '../types/inventory';

export interface InventoryFilters {
  warehouse?: string;
  minAge?: number;
  maxAge?: number;
  qualityStatus?: string;
  searchQuery?: string;
}

/**
 * Get current inventory with optional filters
 */
export async function getCurrentInventory(
  filters?: InventoryFilters
): Promise<CurrentInventory[]> {
  let query = supabase
    .from('inv_current_inventory')
    .select('*')
    .order('product_name', { ascending: true });

  if (filters?.warehouse) {
    query = query.eq('warehouse_name', filters.warehouse);
  }

  if (filters?.minAge !== undefined) {
    query = query.gte('age_months', filters.minAge);
  }

  if (filters?.maxAge !== undefined) {
    query = query.lte('age_months', filters.maxAge);
  }

  if (filters?.qualityStatus) {
    query = query.eq('quality_status', filters.qualityStatus);
  }

  if (filters?.searchQuery) {
    query = query.ilike('product_name', `%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get inventory summary statistics
 */
export async function getInventorySummary(): Promise<InventorySummary> {
  const { data, error } = await supabase.rpc('get_inventory_summary');

  if (error) {
    // If RPC doesn't exist yet, calculate manually
    const inventory = await getCurrentInventory();

    const summary: InventorySummary = {
      total_value_rub: inventory.reduce((sum, item) => sum + (item.total_value_rub || 0), 0),
      total_quantity: inventory.reduce((sum, item) => sum + item.quantity_on_hand, 0),
      product_count: new Set(inventory.map(i => i.product_name)).size,
      warehouse_count: new Set(inventory.map(i => i.warehouse_name)).size,
      avg_age_months: inventory.length > 0
        ? inventory.reduce((sum, item) => sum + (item.age_months || 0), 0) / inventory.length
        : 0,
      aged_value_rub: inventory
        .filter(item => (item.age_months || 0) > 12)
        .reduce((sum, item) => sum + (item.total_value_rub || 0), 0)
    };

    return summary;
  }

  return data;
}

/**
 * Get unique warehouse names
 */
export async function getWarehouses(): Promise<string[]> {
  const { data, error } = await supabase
    .from('inv_warehouses')
    .select('name')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching warehouses:', error);
    return [];
  }

  return data.map(w => w.name);
}

/**
 * Get inventory grouped by warehouse
 */
export async function getInventoryByWarehouse() {
  const inventory = await getCurrentInventory();

  const byWarehouse = inventory.reduce((acc, item) => {
    const warehouse = item.warehouse_name || 'Unknown';
    if (!acc[warehouse]) {
      acc[warehouse] = {
        warehouse: warehouse,
        products: 0,
        quantity: 0,
        value: 0
      };
    }

    acc[warehouse].products++;
    acc[warehouse].quantity += item.quantity_on_hand;
    acc[warehouse].value += item.total_value_rub || 0;

    return acc;
  }, {} as Record<string, { warehouse: string; products: number; quantity: number; value: number }>);

  return Object.values(byWarehouse);
}
