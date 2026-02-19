// Inventory Management Types
// Created: 2026-02-20

export interface Warehouse {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string | null;
  default_lead_time_days: number;
  payment_terms: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductDimension {
  id: string;
  product_name: string;
  sku: string | null;
  volume_cbm: number | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface InventorySnapshot {
  id: string;
  snapshot_date: string;
  product_name: string;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  unit_cost_rub: number | null;
  total_value_rub: number | null;
  age_months: number | null;
  quality_status: string | null;
  import_batch_id: string | null;
  created_at: string;
}

export interface CurrentInventory {
  id: string;
  product_name: string;
  warehouse_name: string;
  warehouse_code: string | null;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  age_months: number | null;
  quality_status: string | null;
  unit_cost_rub: number | null;
  total_value_rub: number | null;
  snapshot_date: string;
}

export interface ABCClassification {
  id: string;
  product_name: string;
  period_year: number;
  abc_class: 'A' | 'B' | 'C';
  revenue_rub_2025: number | null;
  profit_rub_2025: number | null;
  revenue_rank: number | null;
  revenue_cumulative_percent: number | null;
  created_at: string;
  import_batch_id: string | null;
}

export interface SalesHistoryMonthly {
  id: string;
  product_name: string;
  month_date: string;
  quantity_sold: number;
  revenue_rub: number;
  avg_daily_sales: number;
  created_at: string;
  import_batch_id: string | null;
}

export interface ProductSupplier {
  id: string;
  product_name: string;
  supplier_id: string;
  supplier_sku: string | null;
  supplier_price_usd: number | null;
  supplier_price_rub: number | null;
  moq: number;
  lead_time_days: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReorderSetting {
  id: string;
  product_name: string | null;
  product_category: string | null;
  reorder_point: number | null;
  reorder_quantity: number | null;
  safety_stock: number;
  lead_time_days: number | null;
  target_turnover_days: number | null;
  max_age_months: number | null;
  created_at: string;
  updated_at: string;
}

// Import data structures
export interface AgedInventoryRow {
  warehouse: string;
  product_name: string;
  quantity: number;
  unit_cost_rub: number;
  age_months: number;
  quality_status: string;
}

export interface ABCClassificationRow {
  product_name: string;
  abc_class: 'A' | 'B' | 'C';
  revenue_rub_2025: number;
  profit_rub_2025: number;
  revenue_rank: number;
  revenue_cumulative_percent: number;
}

export interface ProcurementDataRow {
  product_name: string;
  supplier_name: string;
  supplier_price_usd: number;
  volume_cbm: number;
  monthly_sales: { [month: string]: number };
}

// Summary statistics
export interface InventorySummary {
  total_value_rub: number;
  total_quantity: number;
  product_count: number;
  warehouse_count: number;
  avg_age_months: number;
  aged_value_rub: number; // Value of items > 12 months
}
