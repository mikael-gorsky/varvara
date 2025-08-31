import { supabase } from '../lib/supabase';

export interface OzonRecord {
  product_name: string;
  product_link?: string;
  seller?: string;
  brand?: string;
  category_level1?: string;
  category_level3?: string;
  product_flag?: string;
  ordered_sum?: number;
  turnover_dynamic?: number;
  ordered_quantity?: number;
  average_price?: number;
  minimum_price?: number;
  buyout_share?: number;
  lost_sales?: number;
  days_no_stock?: number;
  average_delivery_hours?: number;
  average_daily_revenue?: number;
  average_daily_sales_pcs?: number;
  ending_stock?: number;
  work_scheme?: string;
  volume_liters?: number;
  views?: number;
  views_search?: number;
  views_card?: number;
  view_to_cart?: number;
  search_to_cart?: number;
  description_to_cart?: number;
  discount_promo?: number;
  revenue_promo?: number;
  days_promo?: number;
  days_boost?: number;
  ads_share?: number;
  card_date?: string;
  import_date?: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  error?: string;
}

export interface OzonStats {
  totalRecords: number;
  totalRevenue: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  topBrands: Array<{
    brand: string;
    count: number;
    revenue: number;
  }>;
}

export class OzonImportService {
  
  async importData(data: { rows: OzonRecord[] }): Promise<ImportResult> {
    try {
      // Transform data to match database schema
      const transformedData = data.rows.map(row => ({
        product_name: row.product_name,
        product_link: row.product_link || null,
        seller: row.seller || null,
        brand: row.brand || null,
        category_level1: row.category_level1 || null,
        category_level3: row.category_level3 || null,
        product_flag: row.product_flag || null,
        ordered_sum: row.ordered_sum || 0,
        turnover_dynamic: row.turnover_dynamic || 0,
        ordered_quantity: row.ordered_quantity || 0,
        average_price: row.average_price || 0,
        minimum_price: row.minimum_price || 0,
        buyout_share: row.buyout_share || 0,
        lost_sales: row.lost_sales || 0,
        days_no_stock: row.days_no_stock || 0,
        average_delivery_hours: row.average_delivery_hours || 0,
        average_daily_revenue: row.average_daily_revenue || 0,
        average_daily_sales_pcs: row.average_daily_sales_pcs || 0,
        ending_stock: row.ending_stock || 0,
        work_scheme: row.work_scheme || null,
        volume_liters: row.volume_liters || 0,
        views: row.views || 0,
        views_search: row.views_search || 0,
        views_card: row.views_card || 0,
        view_to_cart: row.view_to_cart || 0,
        search_to_cart: row.search_to_cart || 0,
        description_to_cart: row.description_to_cart || 0,
        discount_promo: row.discount_promo || 0,
        revenue_promo: row.revenue_promo || 0,
        days_promo: row.days_promo || 0,
        days_boost: row.days_boost || 0,
        ads_share: row.ads_share || 0,
        card_date: row.card_date || null,
        import_date: row.import_date || new Date().toISOString().split('T')[0]
      }));

      // Import data in batches
      const batchSize = 1000;
      let importedCount = 0;

      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batch = transformedData.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('ozon_data')
          .insert(batch);

        if (error) {
          console.error('Batch insert error:', error);
          throw new Error(`Failed to insert batch: ${error.message}`);
        }

        importedCount += batch.length;
      }

      return {
        success: true,
        importedCount
      };

    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        importedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getStats(): Promise<OzonStats> {
    try {
      // Get total count and revenue
      const { data: totalData, error: totalError } = await supabase
        .from('ozon_data')
        .select('ordered_sum');

      if (totalError) throw totalError;

      const totalRecords = totalData?.length || 0;
      const totalRevenue = totalData?.reduce((sum, record) => sum + (record.ordered_sum || 0), 0) || 0;

      // Get top categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('ozon_data')
        .select('category_level1, ordered_sum')
        .not('category_level1', 'is', null);

      if (categoryError) throw categoryError;

      const categoryStats = categoryData?.reduce((acc: any, record) => {
        const category = record.category_level1 || 'Unknown';
        if (!acc[category]) {
          acc[category] = { count: 0, revenue: 0 };
        }
        acc[category].count += 1;
        acc[category].revenue += record.ordered_sum || 0;
        return acc;
      }, {});

      const topCategories = Object.entries(categoryStats || {})
        .map(([category, stats]: [string, any]) => ({
          category,
          count: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Get top brands
      const { data: brandData, error: brandError } = await supabase
        .from('ozon_data')
        .select('brand, ordered_sum')
        .not('brand', 'is', null);

      if (brandError) throw brandError;

      const brandStats = brandData?.reduce((acc: any, record) => {
        const brand = record.brand || 'Unknown';
        if (!acc[brand]) {
          acc[brand] = { count: 0, revenue: 0 };
        }
        acc[brand].count += 1;
        acc[brand].revenue += record.ordered_sum || 0;
        return acc;
      }, {});

      const topBrands = Object.entries(brandStats || {})
        .map(([brand, stats]: [string, any]) => ({
          brand,
          count: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return {
        totalRecords,
        totalRevenue,
        topCategories,
        topBrands
      };

    } catch (error) {
      console.error('Stats error:', error);
      return {
        totalRecords: 0,
        totalRevenue: 0,
        topCategories: [],
        topBrands: []
      };
    }
  }

  async clearData(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ozon_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Clear data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const ozonImportService = new OzonImportService();