// Container Optimizer Service
// Created: 2026-02-20
// Purpose: Optimize container packing using First Fit Decreasing algorithm

import { supabase } from '../lib/supabase';

export interface ContainerSpecs {
  type: '20ft' | '40hq';
  volume_cbm: number;
  weight_kg: number;
}

export const CONTAINER_SPECS: Record<string, ContainerSpecs> = {
  '20ft': {
    type: '20ft',
    volume_cbm: 33,
    weight_kg: 28000
  },
  '40hq': {
    type: '40hq',
    volume_cbm: 68,
    weight_kg: 27000
  }
};

export interface ProductForPacking {
  product_name: string;
  quantity: number;
  volume_cbm: number;
  weight_kg?: number;
  price_usd?: number;
}

export interface PackedContainer {
  container_type: '20ft' | '40hq';
  products: ProductForPacking[];
  total_volume_cbm: number;
  total_weight_kg: number;
  fill_percent: number;
  total_cost_usd: number;
}

export interface PackingResult {
  containers: PackedContainer[];
  total_containers: number;
  total_volume_cbm: number;
  total_cost_usd: number;
  unpacked_products: ProductForPacking[];
}

/**
 * Get product dimensions from database
 */
export async function getProductDimensions(productNames: string[]) {
  const { data, error } = await supabase
    .from('inv_product_dimensions')
    .select('*')
    .in('product_name', productNames);

  if (error) {
    console.error('Error fetching product dimensions:', error);
    throw error;
  }

  return data || [];
}

/**
 * First Fit Decreasing bin packing algorithm
 * Sorts items by volume (largest first) and packs into containers
 */
export function optimizeContainerPacking(
  products: ProductForPacking[],
  containerType: '20ft' | '40hq' = '40hq',
  allowMixedContainers: boolean = false
): PackingResult {
  const containerSpec = CONTAINER_SPECS[containerType];

  // Sort products by volume (largest first) - First Fit Decreasing
  const sortedProducts = [...products].sort((a, b) => b.volume_cbm - a.volume_cbm);

  const containers: PackedContainer[] = [];
  const unpacked: ProductForPacking[] = [];

  for (const product of sortedProducts) {
    let packed = false;

    // Try to fit in existing containers
    for (const container of containers) {
      const newVolume = container.total_volume_cbm + (product.volume_cbm * product.quantity);
      const newWeight = container.total_weight_kg + ((product.weight_kg || 0) * product.quantity);

      // Check if fits within volume and weight constraints
      if (newVolume <= containerSpec.volume_cbm && newWeight <= containerSpec.weight_kg) {
        container.products.push(product);
        container.total_volume_cbm = newVolume;
        container.total_weight_kg = newWeight;
        container.fill_percent = (newVolume / containerSpec.volume_cbm) * 100;
        container.total_cost_usd += (product.price_usd || 0) * product.quantity;
        packed = true;
        break;
      }
    }

    // If doesn't fit, create new container
    if (!packed) {
      const totalVolume = product.volume_cbm * product.quantity;
      const totalWeight = (product.weight_kg || 0) * product.quantity;

      // Check if product fits in a single container
      if (totalVolume <= containerSpec.volume_cbm && totalWeight <= containerSpec.weight_kg) {
        containers.push({
          container_type: containerType,
          products: [product],
          total_volume_cbm: totalVolume,
          total_weight_kg: totalWeight,
          fill_percent: (totalVolume / containerSpec.volume_cbm) * 100,
          total_cost_usd: (product.price_usd || 0) * product.quantity
        });
      } else {
        // Product too large for single container - split quantity
        const maxQtyByVolume = Math.floor(containerSpec.volume_cbm / product.volume_cbm);
        const maxQtyByWeight = product.weight_kg
          ? Math.floor(containerSpec.weight_kg / product.weight_kg)
          : maxQtyByVolume;
        const maxQty = Math.min(maxQtyByVolume, maxQtyByWeight);

        if (maxQty > 0) {
          let remainingQty = product.quantity;

          while (remainingQty > 0) {
            const qtyThisContainer = Math.min(remainingQty, maxQty);
            const volumeThisContainer = product.volume_cbm * qtyThisContainer;
            const weightThisContainer = (product.weight_kg || 0) * qtyThisContainer;

            containers.push({
              container_type: containerType,
              products: [{
                ...product,
                quantity: qtyThisContainer
              }],
              total_volume_cbm: volumeThisContainer,
              total_weight_kg: weightThisContainer,
              fill_percent: (volumeThisContainer / containerSpec.volume_cbm) * 100,
              total_cost_usd: (product.price_usd || 0) * qtyThisContainer
            });

            remainingQty -= qtyThisContainer;
          }
        } else {
          unpacked.push(product);
        }
      }
    }
  }

  // If mixed containers allowed, optimize by trying both 20ft and 40hq
  if (allowMixedContainers && containerType === '40hq') {
    // Try optimizing partially filled 40hq containers with 20ft
    const optimizedContainers: PackedContainer[] = [];

    for (const container of containers) {
      if (container.fill_percent < 50) {
        // Try packing in 20ft instead
        const spec20ft = CONTAINER_SPECS['20ft'];
        if (container.total_volume_cbm <= spec20ft.volume_cbm &&
            container.total_weight_kg <= spec20ft.weight_kg) {
          optimizedContainers.push({
            ...container,
            container_type: '20ft',
            fill_percent: (container.total_volume_cbm / spec20ft.volume_cbm) * 100
          });
        } else {
          optimizedContainers.push(container);
        }
      } else {
        optimizedContainers.push(container);
      }
    }

    return {
      containers: optimizedContainers,
      total_containers: optimizedContainers.length,
      total_volume_cbm: optimizedContainers.reduce((sum, c) => sum + c.total_volume_cbm, 0),
      total_cost_usd: optimizedContainers.reduce((sum, c) => sum + c.total_cost_usd, 0),
      unpacked_products: unpacked
    };
  }

  return {
    containers,
    total_containers: containers.length,
    total_volume_cbm: containers.reduce((sum, c) => sum + c.total_volume_cbm, 0),
    total_cost_usd: containers.reduce((sum, c) => sum + c.total_cost_usd, 0),
    unpacked_products: unpacked
  };
}

/**
 * Compare packing efficiency between 20ft and 40hq containers
 */
export function compareContainerOptions(
  products: ProductForPacking[]
): {
  option20ft: PackingResult;
  option40hq: PackingResult;
  recommendation: '20ft' | '40hq' | 'mixed';
  savings: number;
} {
  const result20ft = optimizeContainerPacking(products, '20ft');
  const result40hq = optimizeContainerPacking(products, '40hq');
  const resultMixed = optimizeContainerPacking(products, '40hq', true);

  // Simple cost model: assume 20ft costs $2000, 40hq costs $3500
  const COST_20FT = 2000;
  const COST_40HQ = 3500;

  const totalCost20ft = result20ft.total_containers * COST_20FT;
  const totalCost40hq = result40hq.total_containers * COST_40HQ;
  const totalCostMixed = resultMixed.containers.reduce((sum, c) =>
    sum + (c.container_type === '20ft' ? COST_20FT : COST_40HQ), 0
  );

  const minCost = Math.min(totalCost20ft, totalCost40hq, totalCostMixed);
  let recommendation: '20ft' | '40hq' | 'mixed';

  if (minCost === totalCost20ft) {
    recommendation = '20ft';
  } else if (minCost === totalCost40hq) {
    recommendation = '40hq';
  } else {
    recommendation = 'mixed';
  }

  return {
    option20ft: result20ft,
    option40hq: result40hq,
    recommendation,
    savings: Math.max(totalCost20ft, totalCost40hq, totalCostMixed) - minCost
  };
}

/**
 * Calculate container utilization metrics
 */
export function calculateUtilizationMetrics(containers: PackedContainer[]) {
  const totalContainers = containers.length;
  const avgFillPercent = containers.reduce((sum, c) => sum + c.fill_percent, 0) / totalContainers;
  const underutilized = containers.filter(c => c.fill_percent < 70).length;
  const wellUtilized = containers.filter(c => c.fill_percent >= 70).length;

  return {
    total_containers: totalContainers,
    avg_fill_percent: avgFillPercent,
    underutilized_count: underutilized,
    well_utilized_count: wellUtilized,
    utilization_rating: avgFillPercent >= 80 ? 'excellent' : avgFillPercent >= 70 ? 'good' : 'poor'
  };
}
