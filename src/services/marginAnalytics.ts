/**
 * Margin Analytics Service
 * Fetches and processes margin data from Supabase
 */

import { supabase } from '../lib/supabase';

export interface MarginKPIs {
  total_revenue_usd: number;
  total_revenue_rub: number;
  total_margin_usd: number;
  total_margin_rub: number;
  avg_margin_percent: number;
  transaction_count: number;
}

export interface CustomerMarginData {
  customer_id: string;
  customer_name: string;
  customer_inn: string;
  customer_category: string;
  revenue_rub: number;
  revenue_usd: number;
  margin_rub: number;
  margin_usd: number;
  margin_percent: number;
  transaction_count: number;
  rank: number;
}

export interface MarginFilters {
  period_date?: string; // YYYY-MM format
  customer_category?: string;
}

/**
 * Get available periods (months with data)
 */
export async function getAvailablePeriods(): Promise<string[]> {
  const { data, error } = await supabase
    .from('margin_analytics_data')
    .select('period_date')
    .order('period_date', { ascending: false });

  if (error) throw error;

  // Get unique periods (dates are stored as YYYY-MM-DD)
  const periods = [...new Set(data.map(row => row.period_date))];
  return periods;
}

/**
 * Get available customer categories
 */
export async function getAvailableCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('margin_analytics_data')
    .select('customer_category')
    .not('customer_category', 'is', null);

  if (error) throw error;

  // Get unique categories, filter out empty/unknown
  const categories = [...new Set(data.map(row => row.customer_category))]
    .filter(cat => cat && cat !== 'Unknown')
    .sort();

  return categories;
}

/**
 * Get exchange rate for a given period
 */
async function getExchangeRate(periodDate: string): Promise<number> {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('rate')
    .eq('period_date', periodDate)
    .single();

  if (error || !data) {
    console.warn(`No exchange rate found for ${periodDate}, using 95.0`);
    return 95.0; // Fallback rate
  }

  return data.rate;
}

/**
 * Get aggregate KPIs for filtered data
 */
export async function getMarginKPIs(filters: MarginFilters = {}): Promise<MarginKPIs> {
  let query = supabase
    .from('margin_analytics_data')
    .select('period_date, revenue_rub, margin_rub, margin_percent');

  // Apply filters
  if (filters.period_date) {
    query = query.eq('period_date', filters.period_date);
  }
  if (filters.customer_category) {
    query = query.eq('customer_category', filters.customer_category);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Get exchange rate for the filtered period (or use average if multiple periods)
  let usdRate = 95.0;
  if (filters.period_date) {
    usdRate = await getExchangeRate(filters.period_date);
  } else {
    // Use average rate from all periods in result
    const uniquePeriods = [...new Set(data.map(row => row.period_date))];
    if (uniquePeriods.length === 1) {
      usdRate = await getExchangeRate(uniquePeriods[0]);
    }
  }

  // Calculate aggregates
  const total_revenue_rub = data.reduce((sum, row) => sum + (row.revenue_rub || 0), 0);
  const total_margin_rub = data.reduce((sum, row) => sum + (row.margin_rub || 0), 0);
  const avg_margin_percent = data.length > 0
    ? data.reduce((sum, row) => sum + (row.margin_percent || 0), 0) / data.length
    : 0;

  return {
    total_revenue_usd: total_revenue_rub / usdRate,
    total_revenue_rub,
    total_margin_usd: total_margin_rub / usdRate,
    total_margin_rub,
    avg_margin_percent,
    transaction_count: data.length,
  };
}

/**
 * Get customer margin data ranked by revenue
 */
export async function getCustomerMargins(
  filters: MarginFilters = {},
  limit: number = 50
): Promise<CustomerMarginData[]> {
  // Build query to get aggregated data per customer
  let query = supabase
    .from('margin_analytics_data')
    .select(`
      period_date,
      customer_id,
      customer_category,
      revenue_rub,
      margin_rub,
      margin_percent,
      customers!inner(name, inn)
    `);

  // Apply filters
  if (filters.period_date) {
    query = query.eq('period_date', filters.period_date);
  }
  if (filters.customer_category) {
    query = query.eq('customer_category', filters.customer_category);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Get exchange rate
  let usdRate = 95.0;
  if (filters.period_date) {
    usdRate = await getExchangeRate(filters.period_date);
  }

  // Group by customer and aggregate
  const customerMap = new Map<string, {
    customer_id: string;
    customer_name: string;
    customer_inn: string;
    customer_category: string;
    revenue_rub: number;
    margin_rub: number;
    margin_percent_sum: number;
    transaction_count: number;
  }>();

  for (const row of data) {
    const customerId = row.customer_id;
    const customerName = (row.customers as any).name;
    const customerInn = (row.customers as any).inn;

    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        customer_id: customerId,
        customer_name: customerName,
        customer_inn: customerInn,
        customer_category: row.customer_category || 'Unknown',
        revenue_rub: 0,
        margin_rub: 0,
        margin_percent_sum: 0,
        transaction_count: 0,
      });
    }

    const customer = customerMap.get(customerId)!;
    customer.revenue_rub += row.revenue_rub || 0;
    customer.margin_rub += row.margin_rub || 0;
    customer.margin_percent_sum += row.margin_percent || 0;
    customer.transaction_count += 1;
  }

  // Convert to array and calculate averages
  const customers: CustomerMarginData[] = Array.from(customerMap.values())
    .map(c => ({
      customer_id: c.customer_id,
      customer_name: c.customer_name,
      customer_inn: c.customer_inn,
      customer_category: c.customer_category,
      revenue_rub: c.revenue_rub,
      revenue_usd: c.revenue_rub / usdRate,
      margin_rub: c.margin_rub,
      margin_usd: c.margin_rub / usdRate,
      margin_percent: c.transaction_count > 0 ? c.margin_percent_sum / c.transaction_count : 0,
      transaction_count: c.transaction_count,
      rank: 0, // Will be set below
    }))
    .sort((a, b) => b.revenue_rub - a.revenue_rub) // Sort by revenue descending
    .slice(0, limit); // Limit results

  // Assign ranks
  customers.forEach((customer, index) => {
    customer.rank = index + 1;
  });

  return customers;
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, currency: 'USD' | 'RUB' = 'USD'): string {
  if (currency === 'USD') {
    return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  } else {
    return value.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
}

/**
 * Format period date for display
 */
export function formatPeriod(periodDate: string): string {
  // Period dates are stored as YYYY-MM-DD (e.g., "2024-01-01")
  const date = new Date(periodDate);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
