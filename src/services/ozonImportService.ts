import { supabase } from '../lib/supabase';

export interface OzonStats {
  totalProducts: number;
  totalRevenue: number;
  averagePrice: number;
  topCategories: Array<{
    category: string;
    productCount: number;
    revenue: number;
  }>;
}

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

class OzonImportService {
  async importData(csvData: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file appears to be empty or has no data rows');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const records: OzonRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        const record: any = {};

        headers.forEach((header, index) => {
          const value = values[index]?.trim().replace(/"/g, '');
          
          switch (header.toLowerCase()) {
            case 'товар':
            case 'product_name':
              record.product_name = value;
              break;
            case 'ссылка на товар':
            case 'product_link':
              record.product_link = value;
              break;
            case 'продавец':
            case 'seller':
              record.seller = value;
              break;
            case 'бренд':
            case 'brand':
              record.brand = value;
              break;
            case 'категория 1 уровня':
            case 'category_level1':
              record.category_level1 = value;
              break;
            case 'категория 3 уровня':
            case 'category_level3':
              record.category_level3 = value;
              break;
            case 'флаг товара':
            case 'product_flag':
              record.product_flag = value;
              break;
            case 'заказано на сумму':
            case 'ordered_sum':
              record.ordered_sum = this.parseNumber(value);
              break;
            case 'динамика оборота':
            case 'turnover_dynamic':
              record.turnover_dynamic = this.parseNumber(value);
              break;
            case 'заказано штук':
            case 'ordered_quantity':
              record.ordered_quantity = this.parseInteger(value);
              break;
            case 'средняя цена':
            case 'average_price':
              record.average_price = this.parseNumber(value);
              break;
            case 'минимальная цена':
            case 'minimum_price':
              record.minimum_price = this.parseNumber(value);
              break;
            case 'доля выкупа':
            case 'buyout_share':
              record.buyout_share = this.parseNumber(value);
              break;
            case 'потерянные продажи':
            case 'lost_sales':
              record.lost_sales = this.parseNumber(value);
              break;
            case 'дней без остатков':
            case 'days_no_stock':
              record.days_no_stock = this.parseInteger(value);
              break;
            case 'средн время доставки (час)':
            case 'average_delivery_hours':
              record.average_delivery_hours = this.parseNumber(value);
              break;
            case 'средн выручка в день':
            case 'average_daily_revenue':
              record.average_daily_revenue = this.parseNumber(value);
              break;
            case 'средн продаж в день (шт)':
            case 'average_daily_sales_pcs':
              record.average_daily_sales_pcs = this.parseNumber(value);
              break;
            case 'остаток на конец':
            case 'ending_stock':
              record.ending_stock = this.parseInteger(value);
              break;
            case 'схема работы':
            case 'work_scheme':
              record.work_scheme = value;
              break;
            case 'объем (л)':
            case 'volume_liters':
              record.volume_liters = this.parseNumber(value);
              break;
            case 'просмотры':
            case 'views':
              record.views = this.parseInteger(value);
              break;
            case 'просмотры в поиске':
            case 'views_search':
              record.views_search = this.parseInteger(value);
              break;
            case 'просмотры карточки':
            case 'views_card':
              record.views_card = this.parseInteger(value);
              break;
            case 'переходы в корзину из просмотров':
            case 'view_to_cart':
              record.view_to_cart = this.parseNumber(value);
              break;
            case 'переходы в корзину из поиска':
            case 'search_to_cart':
              record.search_to_cart = this.parseNumber(value);
              break;
            case 'переходы в корзину из карточки':
            case 'description_to_cart':
              record.description_to_cart = this.parseNumber(value);
              break;
            case 'скидка промо':
            case 'discount_promo':
              record.discount_promo = this.parseNumber(value);
              break;
            case 'выручка от промо':
            case 'revenue_promo':
              record.revenue_promo = this.parseNumber(value);
              break;
            case 'дней в промо':
            case 'days_promo':
              record.days_promo = this.parseInteger(value);
              break;
            case 'дней в буст':
            case 'days_boost':
              record.days_boost = this.parseInteger(value);
              break;
            case 'доля рекламы':
            case 'ads_share':
              record.ads_share = this.parseNumber(value);
              break;
            case 'дата карточки':
            case 'card_date':
              record.card_date = this.parseDate(value);
              break;
          }
        });

        if (record.product_name) {
          record.import_date = new Date().toISOString().split('T')[0];
          records.push(record);
        }
      }

      if (records.length === 0) {
        throw new Error('No valid records found in CSV');
      }

      const { error } = await supabase
        .from('ozon_data')
        .insert(records);

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Failed to save data: ${error.message}`);
      }

      return {
        success: true,
        message: `Successfully imported ${records.length} OZON records`,
        count: records.length
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        count: 0
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

      if (error) {
        console.error('Error fetching OZON data:', error);
        throw new Error(`Failed to fetch data: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get data error:', error);
      throw error;
    }
  }

  async getStats(): Promise<OzonStats> {
    try {
      const { data, error } = await supabase
        .from('ozon_data')
        .select('*')
        .limit(50000);

      if (error) {
        console.error('Error fetching OZON stats:', error);
        throw new Error(`Failed to fetch stats: ${error.message}`);
      }

      const records = data || [];
      
      const totalProducts = records.length;
      const totalRevenue = records.reduce((sum, record) => sum + (record.ordered_sum || 0), 0);
      const averagePrice = totalProducts > 0 ? totalRevenue / totalProducts : 0;

      // Group by category and calculate stats
      const categoryStats = new Map<string, { count: number; revenue: number }>();
      
      records.forEach(record => {
        const category = record.category_level1 || 'Unknown';
        const current = categoryStats.get(category) || { count: 0, revenue: 0 };
        categoryStats.set(category, {
          count: current.count + 1,
          revenue: current.revenue + (record.ordered_sum || 0)
        });
      });

      const topCategories = Array.from(categoryStats.entries())
        .map(([category, stats]) => ({
          category,
          productCount: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return {
        totalProducts,
        totalRevenue,
        averagePrice,
        topCategories
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  async clearData(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('ozon_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Error clearing OZON data:', error);
        throw new Error(`Failed to clear data: ${error.message}`);
      }

      return {
        success: true,
        message: 'All OZON data cleared successfully'
      };
    } catch (error) {
      console.error('Clear data error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  private parseNumber(value: string): number {
    if (!value || value.trim() === '') return 0;
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  private parseInteger(value: string): number {
    if (!value || value.trim() === '') return 0;
    const cleaned = value.replace(/[^\d-]/g, '');
    const num = parseInt(cleaned);
    return isNaN(num) ? 0 : num;
  }

  private parseDate(value: string): string | null {
    if (!value || value.trim() === '') return null;
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }
}

export const ozonImportService = new OzonImportService();