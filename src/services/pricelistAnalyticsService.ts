import { supabase } from '../lib/supabase';

export interface PricelistProduct {
  id: string;
  code: string;
  article?: string;
  name: string;
  barcode?: string;
  category?: string;
  prices: CustomerPrice[];
}

export interface CustomerPrice {
  customer: string;
  price?: number;
  currency?: string;
}

export interface PricelistOverview {
  totalProducts: number;
  totalCustomers: number;
  totalCategories: number;
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
}

export interface CustomerStats {
  customer: string;
  productCount: number;
  categoryCount: number;
  averagePrice: number;
  totalValue: number;
  pricePosition: 'low' | 'medium' | 'high';
}

export interface CategoryStats {
  category: string;
  productCount: number;
  customerCount: number;
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
  totalValue: number;
}

export interface ProductWithPrices {
  id: string;
  code: string;
  article?: string;
  name: string;
  barcode?: string;
  category?: string;
  customerPrices: { [customer: string]: number | null };
  lowestPrice?: number;
  highestPrice?: number;
}

class PricelistAnalyticsService {
  async getOverview(): Promise<PricelistOverview> {
    const [productsResult, pricesResult] = await Promise.all([
      supabase.from('pricelist_products').select('id, category'),
      supabase.from('pricelist_prices').select('supplier, price')
    ]);

    if (productsResult.error) {
      throw new Error(`Failed to fetch products: ${productsResult.error.message}`);
    }

    if (pricesResult.error) {
      throw new Error(`Failed to fetch prices: ${pricesResult.error.message}`);
    }

    const products = productsResult.data || [];
    const prices = pricesResult.data || [];

    const totalProducts = products.length;
    const customers = new Set(prices.map(p => p.supplier).filter(Boolean));
    const totalCustomers = customers.size;
    const categories = new Set(products.map(p => p.category).filter(Boolean));
    const totalCategories = categories.size;

    const validPrices = prices
      .filter(p => p.price !== null && p.price !== undefined)
      .map(p => p.price!);

    const priceRange = {
      min: validPrices.length > 0 ? Math.min(...validPrices) : 0,
      max: validPrices.length > 0 ? Math.max(...validPrices) : 0,
      avg: validPrices.length > 0
        ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length
        : 0,
    };

    return {
      totalProducts,
      totalCustomers,
      totalCategories,
      priceRange,
    };
  }

  async getCustomers(): Promise<CustomerStats[]> {
    const { data: prices, error: pricesError } = await supabase
      .from('pricelist_prices')
      .select(`
        supplier,
        price,
        product_id,
        pricelist_products!inner(category)
      `);

    if (pricesError) {
      throw new Error(`Failed to fetch prices: ${pricesError.error.message}`);
    }

    const customerMap = new Map<string, {
      productIds: Set<string>;
      categories: Set<string>;
      prices: number[];
    }>();

    (prices || []).forEach((priceRecord: any) => {
      const customer = priceRecord.supplier;
      if (!customer) return;

      if (!customerMap.has(customer)) {
        customerMap.set(customer, {
          productIds: new Set(),
          categories: new Set(),
          prices: [],
        });
      }

      const stats = customerMap.get(customer)!;
      stats.productIds.add(priceRecord.product_id);

      if (priceRecord.pricelist_products?.category) {
        stats.categories.add(priceRecord.pricelist_products.category);
      }

      if (priceRecord.price !== null && priceRecord.price !== undefined) {
        stats.prices.push(priceRecord.price);
      }
    });

    const allAveragePrices = Array.from(customerMap.values())
      .map(stats => {
        const sum = stats.prices.reduce((acc, p) => acc + p, 0);
        return stats.prices.length > 0 ? sum / stats.prices.length : 0;
      })
      .filter(avg => avg > 0)
      .sort((a, b) => a - b);

    const medianPrice = allAveragePrices.length > 0
      ? allAveragePrices[Math.floor(allAveragePrices.length / 2)]
      : 0;

    const customerStats: CustomerStats[] = Array.from(customerMap.entries()).map(
      ([customer, stats]) => {
        const sum = stats.prices.reduce((acc, p) => acc + p, 0);
        const averagePrice = stats.prices.length > 0 ? sum / stats.prices.length : 0;
        const totalValue = sum;

        let pricePosition: 'low' | 'medium' | 'high' = 'medium';
        if (averagePrice > 0 && medianPrice > 0) {
          if (averagePrice < medianPrice * 0.9) {
            pricePosition = 'low';
          } else if (averagePrice > medianPrice * 1.1) {
            pricePosition = 'high';
          }
        }

        return {
          customer,
          productCount: stats.productIds.size,
          categoryCount: stats.categories.size,
          averagePrice,
          totalValue,
          pricePosition,
        };
      }
    );

    return customerStats.sort((a, b) => b.totalValue - a.totalValue);
  }

  async getCategories(): Promise<CategoryStats[]> {
    const { data: products, error: productsError } = await supabase
      .from('pricelist_products')
      .select(`
        id,
        category,
        pricelist_prices(supplier, price)
      `);

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    const categoryMap = new Map<string, {
      productIds: Set<string>;
      customers: Set<string>;
      prices: number[];
    }>();

    (products || []).forEach((product: any) => {
      const category = product.category || 'Uncategorized';

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          productIds: new Set(),
          customers: new Set(),
          prices: [],
        });
      }

      const stats = categoryMap.get(category)!;
      stats.productIds.add(product.id);

      if (product.pricelist_prices && Array.isArray(product.pricelist_prices)) {
        product.pricelist_prices.forEach((priceRecord: any) => {
          if (priceRecord.supplier) {
            stats.customers.add(priceRecord.supplier);
          }
          if (priceRecord.price !== null && priceRecord.price !== undefined) {
            stats.prices.push(priceRecord.price);
          }
        });
      }
    });

    const categoryStats: CategoryStats[] = Array.from(categoryMap.entries()).map(
      ([category, stats]) => {
        const validPrices = stats.prices.filter(p => p > 0);
        const sum = validPrices.reduce((acc, p) => acc + p, 0);

        return {
          category,
          productCount: stats.productIds.size,
          customerCount: stats.customers.size,
          priceRange: {
            min: validPrices.length > 0 ? Math.min(...validPrices) : 0,
            max: validPrices.length > 0 ? Math.max(...validPrices) : 0,
            avg: validPrices.length > 0 ? sum / validPrices.length : 0,
          },
          totalValue: sum,
        };
      }
    );

    return categoryStats.sort((a, b) => b.totalValue - a.totalValue);
  }

  async getProductsWithPrices(searchTerm?: string): Promise<ProductWithPrices[]> {
    let query = supabase
      .from('pricelist_products')
      .select(`
        id,
        code,
        article,
        name,
        barcode,
        category,
        pricelist_prices(supplier, price)
      `)
      .order('name', { ascending: true });

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim();
      query = query.or(`name.ilike.%${term}%,code.ilike.%${term}%,article.ilike.%${term}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    const productsWithPrices: ProductWithPrices[] = (products || []).map((product: any) => {
      const customerPrices: { [customer: string]: number | null } = {};
      const prices: number[] = [];

      if (product.pricelist_prices && Array.isArray(product.pricelist_prices)) {
        product.pricelist_prices.forEach((priceRecord: any) => {
          if (priceRecord.supplier) {
            customerPrices[priceRecord.supplier] = priceRecord.price ?? null;
            if (priceRecord.price !== null && priceRecord.price !== undefined) {
              prices.push(priceRecord.price);
            }
          }
        });
      }

      return {
        id: product.id,
        code: product.code,
        article: product.article,
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        customerPrices,
        lowestPrice: prices.length > 0 ? Math.min(...prices) : undefined,
        highestPrice: prices.length > 0 ? Math.max(...prices) : undefined,
      };
    });

    return productsWithPrices;
  }

  async getAllCustomers(): Promise<string[]> {
    const { data, error } = await supabase
      .from('pricelist_prices')
      .select('supplier')
      .not('supplier', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    const customers = new Set(data.map(p => p.supplier).filter(Boolean));
    return Array.from(customers).sort();
  }
}

export const pricelistAnalyticsService = new PricelistAnalyticsService();
