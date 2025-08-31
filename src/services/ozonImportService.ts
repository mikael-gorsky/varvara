import { supabase } from '../lib/supabase';

export interface OzonImportResult {
  success: boolean;
  recordsImported: number;
  errors: string[];
  message: string;
  headerValidation?: {
    isValid: boolean;
    missingFields?: string[];
    extraFields?: string[];
  };
}

export interface OzonProgressCallback {
  onProgress?: (progress: number, message: string) => void;
}

export interface OzonStats {
  total_records: number;
  unique_sellers: number;
  unique_categories: number;
  latest_import: string | null;
}

export class OzonImportService {
  static async importToOzonData(
    parsedData: any, 
    options: OzonProgressCallback = {}
  ): Promise<OzonImportResult> {
    const { onProgress } = options;
    
    try {
      if (!parsedData.rows || parsedData.rows.length === 0) {
        return {
          success: false,
          recordsImported: 0,
          errors: ['No data rows found in file'],
          message: 'Import failed: No valid data found'
        };
      }

      // Report progress
      onProgress?.(10, 'Preparing OZON data for import...');

      // Transform data for ozon_data table
      const transformedData = parsedData.rows.map((row: any) => ({
        product_name: row['Название товара'] || '',
        product_link: row['Ссылка на товар'] || null,
        seller: row['Продавец'] || null,
        brand: row['Бренд'] || null,
        category_level1: row['Категория. Уровень 1'] || null,
        category_level3: row['Категория. Уровень 3'] || null,
        product_flag: row['Флаг товара'] || null,
        ordered_sum: parseFloat(row['Заказано, ₽'] || '0') || 0,
        turnover_dynamic: parseFloat(row['Динамика оборота, %'] || '0') || 0,
        ordered_quantity: parseInt(row['Заказано, шт'] || '0') || 0,
        average_price: parseFloat(row['Средняя цена, ₽'] || '0') || 0,
        minimum_price: parseFloat(row['Минимальная цена, ₽'] || '0') || 0,
        buyout_share: parseFloat(row['Доля выкупа, %'] || '0') || 0,
        lost_sales: parseFloat(row['Потери продаж, ₽'] || '0') || 0,
        days_no_stock: parseInt(row['Дней без остатков'] || '0') || 0,
        average_delivery_hours: parseFloat(row['Среднее время доставки, ч'] || '0') || 0,
        average_daily_revenue: parseFloat(row['Средний дневной оборот, ₽'] || '0') || 0,
        average_daily_sales_pcs: parseFloat(row['Средние продажи в день, шт'] || '0') || 0,
        ending_stock: parseInt(row['Остаток на конец периода'] || '0') || 0,
        work_scheme: row['Схема работы'] || null,
        volume_liters: parseFloat(row['Объем, л'] || '0') || 0,
        views: parseInt(row['Просмотры'] || '0') || 0,
        views_search: parseInt(row['Просмотры с поиска'] || '0') || 0,
        views_card: parseInt(row['Просмотры карточки'] || '0') || 0,
        view_to_cart: parseFloat(row['Просмотр в корзину, %'] || '0') || 0,
        search_to_cart: parseFloat(row['Поиск в корзину, %'] || '0') || 0,
        description_to_cart: parseFloat(row['Описание в корзину, %'] || '0') || 0,
        discount_promo: parseFloat(row['Скидка по акции, ₽'] || '0') || 0,
        revenue_promo: parseFloat(row['Выручка по акции, %'] || '0') || 0,
        days_promo: parseInt(row['Дней по акции'] || '0') || 0,
        days_boost: parseInt(row['Дней в буст'] || '0') || 0,
        ads_share: parseFloat(row['Доля рекламы, %'] || '0') || 0,
        card_date: row['Дата карточки'] ? new Date(row['Дата карточки']).toISOString().split('T')[0] : null,
        import_date: new Date().toISOString().split('T')[0]
      }));

      onProgress?.(30, 'Validating data integrity...');

      // Import data in batches
      const batchSize = 100;
      let totalImported = 0;
      const errors: string[] = [];

      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batch = transformedData.slice(i, i + batchSize);
        const progressPercent = 30 + ((i / transformedData.length) * 60);
        
        onProgress?.(progressPercent, `Importing batch ${Math.floor(i / batchSize) + 1}...`);

        try {
          const { error } = await supabase
            .from('ozon_data')
            .insert(batch);

          if (error) {
            errors.push(`Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`);
          } else {
            totalImported += batch.length;
          }
        } catch (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      onProgress?.(100, 'Import completed');

      return {
        success: errors.length === 0,
        recordsImported: totalImported,
        errors,
        message: errors.length === 0 
          ? `Successfully imported ${totalImported} OZON records`
          : `Import completed with ${errors.length} errors. ${totalImported} records imported.`,
        headerValidation: parsedData.headerValidation
      };

    } catch (error) {
      return {
        success: false,
        recordsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Import failed due to unexpected error'
      };
    }
  }

  static async getOzonStats(): Promise<OzonStats> {
    try {
      // Get total record count
      const { count: totalRecords, error: countError } = await supabase
        .from('ozon_data')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get unique sellers count
      const { data: sellersData, error: sellersError } = await supabase
        .from('ozon_data')
        .select('seller')
        .not('seller', 'is', null)
        .neq('seller', '');

      if (sellersError) throw sellersError;

      const uniqueSellers = new Set(sellersData?.map(item => item.seller) || []).size;

      // Get unique categories count
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('ozon_data')
        .select('category_level1')
        .not('category_level1', 'is', null)
        .neq('category_level1', '');

      if (categoriesError) throw categoriesError;

      const uniqueCategories = new Set(categoriesData?.map(item => item.category_level1) || []).size;

      // Get latest import date
      const { data: latestData, error: latestError } = await supabase
        .from('ozon_data')
        .select('import_date')
        .order('import_date', { ascending: false })
        .limit(1);

      if (latestError) throw latestError;

      return {
        total_records: totalRecords || 0,
        unique_sellers: uniqueSellers,
        unique_categories: uniqueCategories,
        latest_import: latestData?.[0]?.import_date || null
      };

    } catch (error) {
      console.error('Failed to get OZON stats:', error);
      return {
        total_records: 0,
        unique_sellers: 0,
        unique_categories: 0,
        latest_import: null
      };
    }
  }

  static async clearAllData(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ozon_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Failed to clear OZON data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to clear OZON data:', error);
      return false;
    }
  }
}