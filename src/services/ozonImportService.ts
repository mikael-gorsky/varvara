import { supabase } from '../lib/supabase';

export interface OzonDataRecord {
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

export class OzonImportService {
  async importOzonData(data: OzonDataRecord[]): Promise<{ success: boolean; message: string; count: number }> {
    try {
      if (!data || data.length === 0) {
        return { success: false, message: 'No data to import', count: 0 };
      }

      // Process data in batches of 1000 for better performance
      const batchSize = 1000;
      let totalInserted = 0;

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('ozon_data')
          .insert(batch);

        if (error) {
          throw error;
        }

        totalInserted += batch.length;
      }

      return { 
        success: true, 
        message: `Successfully imported ${totalInserted} OZON records`, 
        count: totalInserted 
      };
    } catch (error) {
      console.error('Error importing OZON data:', error);
      return { 
        success: false, 
        message: `Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        count: 0 
      };
    }
  }

  async getOzonData(limit?: number): Promise<OzonDataRecord[]> {
    try {
      let query = supabase
        .from('ozon_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      } else {
        query = query.limit(50000);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching OZON data:', error);
      return [];
    }
  }

  async clearOzonData(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('ozon_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        throw error;
      }

      return { success: true, message: 'OZON data cleared successfully' };
    } catch (error) {
      console.error('Error clearing OZON data:', error);
      return { 
        success: false, 
        message: `Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Export singleton instance
export const ozonImportService = new OzonImportService();