// Reorder Planning Service
// Created: 2026-02-20
// Purpose: Calculate reorder points and generate reorder alerts

import { supabase } from '../lib/supabase';

export interface ReorderAlert {
  product_name: string;
  total_available: number;
  reorder_point: number | null;
  safety_stock: number | null;
  lead_time_days: number | null;
  avg_daily_sales: number;
  days_of_stock: number | null;
  supplier_id: string | null;
  supplier_name: string | null;
  supplier_price_usd: number | null;
  moq: number | null;
  suggested_order_qty: number | null;
}

export interface ReorderCalculation {
  reorder_point: number;
  reorder_quantity: number;
  days_of_stock: number;
  stockout_risk: 'high' | 'medium' | 'low';
}

/**
 * Get products that need reordering based on reorder alerts view
 */
export async function getReorderAlerts(): Promise<ReorderAlert[]> {
  const { data, error } = await supabase
    .from('inv_reorder_alerts')
    .select('*')
    .order('days_of_stock', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching reorder alerts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Calculate reorder point for a product
 * Formula: (Average Daily Sales × Lead Time Days) + Safety Stock
 */
export function calculateReorderPoint(
  avgDailySales: number,
  leadTimeDays: number,
  safetyStockDays: number = 30
): number {
  const leadTimeStock = avgDailySales * leadTimeDays;
  const safetyStock = avgDailySales * safetyStockDays;
  return Math.ceil(leadTimeStock + safetyStock);
}

/**
 * Calculate reorder quantity (Economic Order Quantity simplified)
 * Formula: (Average Daily Sales × Lead Time Days × 2) or MOQ, whichever is higher
 */
export function calculateReorderQuantity(
  avgDailySales: number,
  leadTimeDays: number,
  moq: number = 1
): number {
  const calculatedQty = Math.ceil(avgDailySales * leadTimeDays * 2);
  return Math.max(calculatedQty, moq);
}

/**
 * Calculate days of stock remaining
 */
export function calculateDaysOfStock(
  quantityAvailable: number,
  avgDailySales: number
): number | null {
  if (avgDailySales <= 0) return null;
  return Math.round(quantityAvailable / avgDailySales);
}

/**
 * Determine stockout risk based on days of stock and lead time
 */
export function calculateStockoutRisk(
  daysOfStock: number | null,
  leadTimeDays: number
): 'high' | 'medium' | 'low' {
  if (daysOfStock === null) return 'low';

  if (daysOfStock < leadTimeDays) return 'high';
  if (daysOfStock < leadTimeDays * 2) return 'medium';
  return 'low';
}

/**
 * Perform full reorder calculation for a product
 */
export function performReorderCalculation(
  quantityAvailable: number,
  avgDailySales: number,
  leadTimeDays: number,
  safetyStockDays: number = 30
): ReorderCalculation {
  const reorder_point = calculateReorderPoint(avgDailySales, leadTimeDays, safetyStockDays);
  const reorder_quantity = calculateReorderQuantity(avgDailySales, leadTimeDays);
  const days_of_stock = calculateDaysOfStock(quantityAvailable, avgDailySales) || 0;
  const stockout_risk = calculateStockoutRisk(days_of_stock, leadTimeDays);

  return {
    reorder_point,
    reorder_quantity,
    days_of_stock,
    stockout_risk
  };
}

/**
 * Save or update reorder settings for a product
 */
export async function saveReorderSettings(
  productName: string,
  settings: {
    reorder_point: number;
    reorder_quantity: number;
    safety_stock: number;
    lead_time_days: number;
    target_turnover_days?: number;
    max_age_months?: number;
  }
) {
  const { data, error } = await supabase
    .from('inv_reorder_settings')
    .upsert({
      product_name: productName,
      ...settings,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'product_name'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving reorder settings:', error);
    throw error;
  }

  return data;
}

/**
 * Get reorder settings for a product
 */
export async function getReorderSettings(productName: string) {
  const { data, error } = await supabase
    .from('inv_reorder_settings')
    .select('*')
    .eq('product_name', productName)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching reorder settings:', error);
    throw error;
  }

  return data;
}

/**
 * Bulk calculate reorder points for all products with sales history
 */
export async function bulkCalculateReorderPoints(
  leadTimeDays: number = 45,
  safetyStockDays: number = 30
) {
  // Get all products with recent sales
  const { data: salesData, error: salesError } = await supabase
    .from('inv_sales_history_monthly')
    .select('product_name, avg_daily_sales')
    .gte('month_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  if (salesError) {
    throw salesError;
  }

  // Calculate average daily sales per product
  const productSales = salesData.reduce((acc, row) => {
    if (!acc[row.product_name]) {
      acc[row.product_name] = { total: 0, count: 0 };
    }
    acc[row.product_name].total += row.avg_daily_sales;
    acc[row.product_name].count++;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  // Prepare reorder settings
  const reorderSettings = Object.entries(productSales).map(([product_name, stats]) => {
    const avg_daily_sales = stats.total / stats.count;
    const reorder_point = calculateReorderPoint(avg_daily_sales, leadTimeDays, safetyStockDays);
    const reorder_quantity = calculateReorderQuantity(avg_daily_sales, leadTimeDays);

    return {
      product_name,
      reorder_point,
      reorder_quantity,
      safety_stock: Math.ceil(avg_daily_sales * safetyStockDays),
      lead_time_days: leadTimeDays
    };
  });

  // Bulk insert/update
  const { error: upsertError } = await supabase
    .from('inv_reorder_settings')
    .upsert(reorderSettings, {
      onConflict: 'product_name'
    });

  if (upsertError) {
    throw upsertError;
  }

  return {
    processed: reorderSettings.length,
    settings: reorderSettings
  };
}
