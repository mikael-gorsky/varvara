import { supabase } from '../../../lib/supabase';

export interface PricelistProduct {
  id?: string;
  code: string;
  article?: string;
  name: string;
  barcode?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PricelistPrice {
  id?: string;
  product_id: string;
  supplier: string;
  price?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PricelistStats {
  totalProducts: number;
  totalPrices: number;
  suppliers: string[];
  categories: string[];
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
}

export interface ImportResult {
  success: boolean;
  stats?: {
    products_processed: number;
    products_inserted: number;
    products_updated: number;
    prices_inserted: number;
    prices_updated: number;
    categories_found: number;
    errors: string[];
  };
  error?: string;
}

export class PricelistImportService {
  async importFile(file: File): Promise<ImportResult> {
    try {
      console.log('[PricelistImportService] Starting import for file:', file.name);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('[PricelistImportService] Supabase URL:', supabaseUrl);
      console.log('[PricelistImportService] Anon key present:', !!supabaseAnonKey);

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = `${supabaseUrl}/functions/v1/import-pricelist`;
      console.log('[PricelistImportService] API URL:', apiUrl);

      console.log('[PricelistImportService] Sending request...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: formData,
      });

      console.log('[PricelistImportService] Response status:', response.status);
      console.log('[PricelistImportService] Response ok:', response.ok);

      let result;
      const contentType = response.headers.get('content-type');
      console.log('[PricelistImportService] Content type:', contentType);

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log('[PricelistImportService] Response data:', result);
      } else {
        const text = await response.text();
        console.error('[PricelistImportService] Non-JSON response:', text);
        throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(result.error || `Import failed with status ${response.status}`);
      }

      console.log('[PricelistImportService] Import successful');
      return result;
    } catch (error) {
      console.error('[PricelistImportService] Import error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getProducts(): Promise<PricelistProduct[]> {
    const { data, error } = await supabase
      .from('pricelist_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data || [];
  }

  async getPrices(productId?: string): Promise<PricelistPrice[]> {
    let query = supabase
      .from('pricelist_prices')
      .select('*')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch prices: ${error.message}`);
    }

    return data || [];
  }

  async getStats(): Promise<PricelistStats> {
    const { data: products, error: productsError } = await supabase
      .from('pricelist_products')
      .select('*');

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    const { data: prices, error: pricesError } = await supabase
      .from('pricelist_prices')
      .select('*');

    if (pricesError) {
      throw new Error(`Failed to fetch prices: ${pricesError.message}`);
    }

    const totalProducts = products?.length || 0;
    const totalPrices = prices?.length || 0;

    const suppliers = [...new Set(prices?.map(p => p.supplier).filter(Boolean))] as string[];
    const categories = [...new Set(products?.map(p => p.category).filter(Boolean))] as string[];

    const validPrices = prices?.filter(p => p.price !== null && p.price !== undefined).map(p => p.price!) || [];
    const priceRange = {
      min: validPrices.length > 0 ? Math.min(...validPrices) : 0,
      max: validPrices.length > 0 ? Math.max(...validPrices) : 0,
      avg: validPrices.length > 0 ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length : 0,
    };

    return {
      totalProducts,
      totalPrices,
      suppliers,
      categories,
      priceRange,
    };
  }

  async clearAllData(): Promise<void> {
    const { error: pricesError } = await supabase
      .from('pricelist_prices')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (pricesError) {
      throw new Error(`Failed to clear prices: ${pricesError.message}`);
    }

    const { error: productsError } = await supabase
      .from('pricelist_products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (productsError) {
      throw new Error(`Failed to clear products: ${productsError.message}`);
    }
  }
}

export const pricelistImportService = new PricelistImportService();
