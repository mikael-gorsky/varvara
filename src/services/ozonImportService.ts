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
}

export interface OzonStats {
  totalProducts: number;
  totalRevenue: number;
  averagePrice: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export class OzonImportService {
  async importData(data: OzonRecord[]): Promise<{ success: boolean; message: string; imported: number }> {
    try {
      if (!data || data.length === 0) {
        return { success: false, message: 'No data to import', imported: 0 };
      }

      const transformedData = data.map(record => ({
        product_name: record.product_name,
        product_link: record.product_link || null,
        seller: record.seller || null,
        brand: record.brand || null,
        category_level1: record.category_level1 || null,
        category_level3: record.category_level3 || null,
        product_flag: record.product_flag || null,
        ordered_sum: record.ordered_sum || 0,
        turnover_dynamic: record.turnover_dynamic || 0,
        ordered_quantity: record.ordered_quantity || 0,
        average_price: record.average_price || 0,
        minimum_price: record.minimum_price || 0,
        buyout_share: record.buyout_share || 0,
        lost_sales: record.lost_sales || 0,
        days_no_stock: record.days_no_stock || 0,
        average_delivery_hours: record.average_delivery_hours || 0,
        average_daily_revenue: record.average_daily_revenue || 0,
        average_daily_sales_pcs: record.average_daily_sales_pcs || 0,
        ending_stock: record.ending_stock || 0,
        work_scheme: record.work_scheme || null,
        volume_liters: record.volume_liters || 0,
        views: record.views || 0,
        views_search: record.views_search || 0,
        views_card: record.views_card || 0,
        view_to_cart: record.view_to_cart || 0,
        search_to_cart: record.search_to_cart || 0,
        description_to_cart: record.description_to_cart || 0,
        discount_promo: record.discount_promo || 0,
        revenue_promo: record.revenue_promo || 0,
        days_promo: record.days_promo || 0,
        days_boost: record.days_boost || 0,
        ads_share: record.ads_share || 0,
        card_date: record.card_date ? new Date(record.card_date).toISOString().split('T')[0] : null,
        import_date: new Date().toISOString().split('T')[0]
      }));

      const { data: insertedData, error } = await supabase
        .from('ozon_data')
        .insert(transformedData)
        .select();

      if (error) {
        console.error('Import error:', error);
        return { success: false, message: error.message, imported: 0 };
      }

      return { 
        success: true, 
        message: `Successfully imported ${insertedData?.length || 0} OZON records`, 
        imported: insertedData?.length || 0 
      };
    } catch (error) {
      console.error('Import error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred', 
        imported: 0 
      };
    }
  }

  async getStats(): Promise<OzonStats> {
    try {
      const { data, error } = await supabase
        .from('ozon_data')
        .select('*')
        .limit(50000);

      if (error) throw error;

      const totalProducts = data?.length || 0;
      const totalRevenue = data?.reduce((sum, item) => sum + (item.ordered_sum || 0), 0) || 0;
      const averagePrice = totalProducts > 0 ? totalRevenue / totalProducts : 0;

      // Calculate top categories
      const categoryMap = new Map<string, { count: number; revenue: number }>();
      data?.forEach(item => {
        const category = item.category_level1 || 'Unknown';
        const existing = categoryMap.get(category) || { count: 0, revenue: 0 };
        categoryMap.set(category, {
          count: existing.count + 1,
          revenue: existing.revenue + (item.ordered_sum || 0)
        });
      });

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, stats]) => ({ category, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        totalProducts,
        totalRevenue,
        averagePrice,
        topCategories
      };
    } catch (error) {
      console.error('Error fetching OZON stats:', error);
      return {
        totalProducts: 0,
        totalRevenue: 0,
        averagePrice: 0,
        topCategories: []
      };
    }
  }

  async clearData(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('ozon_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'All OZON data cleared successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async getData(): Promise<OzonRecord[]> {
    try {
      const { data, error } = await supabase
        .from('ozon_data')
        .select('*')
        .limit(50000)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching OZON data:', error);
      return [];
    }
  }
}

export const ozonImportService = new OzonImportService();