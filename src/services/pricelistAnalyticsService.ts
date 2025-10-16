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
