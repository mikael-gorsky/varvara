import { supabase, supabaseAdmin } from '../lib/supabase';

export interface OzonDataRow {
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

class OzonImportService {
  async getStats(): Promise<OzonStats> {
    try {
      const { data, error } = await supabase
        .from('ozon_data')
        .select('*');

      if (error) throw error;

      const totalProducts = data?.length || 0;
      const totalRevenue = data?.reduce((sum, item) => sum + (item.ordered_sum || 0), 0) || 0;
      const averagePrice = data?.reduce((sum, item) => sum + (item.average_price || 0), 0) / totalProducts || 0;

      // Group by category_level1 for top categories
      const categoryGroups: Record<string, { count: number; revenue: number }> = {};
      
      data?.forEach(item => {
        const category = item.category_level1 || 'Unknown';
        if (!categoryGroups[category]) {
          categoryGroups[category] = { count: 0, revenue: 0 };
        }
        categoryGroups[category].count++;
        categoryGroups[category].revenue += item.ordered_sum || 0;
      });

      const topCategories = Object.entries(categoryGroups)
        .map(([category, stats]) => ({ category, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return {
        totalProducts,
        totalRevenue,
        averagePrice,
        topCategories
      };
    } catch (error) {
      console.error('Error getting OZON stats:', error);
      throw error;
    }
  }

  async importData(data: OzonDataRow[]): Promise<void> {
    try {
      // Use admin client to bypass RLS
      const { error } = await supabaseAdmin
        .from('ozon_data')
        .insert(data);

      if (error) {
        console.error('Batch insert error:', error);
        throw new Error(`Failed to insert batch: ${error.message}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }

  async clearData(): Promise<void> {
    try {
      // Use admin client to bypass RLS
      const { error } = await supabaseAdmin
        .from('ozon_data')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Clear data error:', error);
        throw new Error(`Failed to clear data: ${error.message}`);
      }
    } catch (error) {
      console.error('Clear data error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const ozonImportService = new OzonImportService();
export default ozonImportService;