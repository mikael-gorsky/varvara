// ABC Analysis Service
// Created: 2026-02-20
// Purpose: Query and analyze ABC classification data

import { supabase } from '../lib/supabase';
import type { ABCClassification } from '../types/inventory';

export interface ABCSummary {
  classA: {
    count: number;
    revenue: number;
    revenuePercent: number;
  };
  classB: {
    count: number;
    revenue: number;
    revenuePercent: number;
  };
  classC: {
    count: number;
    revenue: number;
    revenuePercent: number;
  };
  total: {
    count: number;
    revenue: number;
  };
}

export interface ParetoDataPoint {
  rank: number;
  product_name: string;
  revenue: number;
  cumulativeRevenue: number;
  cumulativePercent: number;
}

/**
 * Get ABC classification for a specific year
 */
export async function getABCClassification(year: number = 2025): Promise<ABCClassification[]> {
  const { data, error } = await supabase
    .from('inv_abc_classification')
    .select('*')
    .eq('period_year', year)
    .order('revenue_rank', { ascending: true });

  if (error) {
    console.error('Error fetching ABC classification:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get ABC summary statistics
 */
export async function getABCSummary(year: number = 2025): Promise<ABCSummary> {
  const data = await getABCClassification(year);

  const classA = data.filter(d => d.abc_class === 'A');
  const classB = data.filter(d => d.abc_class === 'B');
  const classC = data.filter(d => d.abc_class === 'C');

  const revenueA = classA.reduce((sum, d) => sum + (d.revenue_rub_2025 || 0), 0);
  const revenueB = classB.reduce((sum, d) => sum + (d.revenue_rub_2025 || 0), 0);
  const revenueC = classC.reduce((sum, d) => sum + (d.revenue_rub_2025 || 0), 0);
  const totalRevenue = revenueA + revenueB + revenueC;

  return {
    classA: {
      count: classA.length,
      revenue: revenueA,
      revenuePercent: totalRevenue > 0 ? (revenueA / totalRevenue) * 100 : 0
    },
    classB: {
      count: classB.length,
      revenue: revenueB,
      revenuePercent: totalRevenue > 0 ? (revenueB / totalRevenue) * 100 : 0
    },
    classC: {
      count: classC.length,
      revenue: revenueC,
      revenuePercent: totalRevenue > 0 ? (revenueC / totalRevenue) * 100 : 0
    },
    total: {
      count: data.length,
      revenue: totalRevenue
    }
  };
}

/**
 * Get Pareto chart data (cumulative revenue curve)
 */
export async function getParetoChartData(year: number = 2025): Promise<ParetoDataPoint[]> {
  const data = await getABCClassification(year);

  // Sort by revenue rank
  const sorted = [...data].sort((a, b) => (a.revenue_rank || 0) - (b.revenue_rank || 0));

  let cumulativeRevenue = 0;
  const totalRevenue = sorted.reduce((sum, d) => sum + (d.revenue_rub_2025 || 0), 0);

  return sorted.map((item, index) => {
    const revenue = item.revenue_rub_2025 || 0;
    cumulativeRevenue += revenue;
    const cumulativePercent = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) * 100 : 0;

    return {
      rank: index + 1,
      product_name: item.product_name,
      revenue,
      cumulativeRevenue,
      cumulativePercent
    };
  });
}

/**
 * Get top N products by revenue
 */
export async function getTopProducts(year: number = 2025, limit: number = 10): Promise<ABCClassification[]> {
  const { data, error } = await supabase
    .from('inv_abc_classification')
    .select('*')
    .eq('period_year', year)
    .order('revenue_rank', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get products by ABC class
 */
export async function getProductsByClass(
  abcClass: 'A' | 'B' | 'C',
  year: number = 2025
): Promise<ABCClassification[]> {
  const { data, error } = await supabase
    .from('inv_abc_classification')
    .select('*')
    .eq('period_year', year)
    .eq('abc_class', abcClass)
    .order('revenue_rank', { ascending: true });

  if (error) {
    console.error('Error fetching products by class:', error);
    throw error;
  }

  return data || [];
}
