import { supabase, supabaseAdmin } from '../../../lib/supabase';

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
  ads_share_percentage?: number;
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

export interface ImportResult {
  successCount: number;
  failureCount: number;
  duplicateCount: number;
  reportId?: string;
}

export class OzonImportService {
  async importDataWithReport(
    data: OzonRecord[],
    dateOfReport: string | null,
    reportedDays: number | null
  ): Promise<ImportResult> {
    if (!data || data.length === 0) {
      throw new Error('No data provided for import');
    }

    if (!dateOfReport || !reportedDays) {
      throw new Error('Report metadata (date and period) is required');
    }

    console.log(`[OzonImportService] Creating report: ${dateOfReport}, ${reportedDays} days`);

    const { data: existingReport, error: checkError } = await supabaseAdmin
      .from('ozon_reports')
      .select('report_id')
      .eq('date_of_report', dateOfReport)
      .eq('reported_days', reportedDays)
      .maybeSingle();

    if (checkError) {
      console.error(`[OzonImportService] Error checking for existing report:`, checkError);
      throw new Error(`Failed to check for existing report: ${checkError.message}`);
    }

    if (existingReport) {
      throw new Error(
        `Report for ${dateOfReport} (${reportedDays} days) already exists. Delete the existing report first.`
      );
    }

    const { data: reportData, error: reportError } = await supabaseAdmin
      .from('ozon_reports')
      .insert({
        date_of_report: dateOfReport,
        reported_days: reportedDays
      })
      .select('report_id')
      .single();

    if (reportError || !reportData) {
      console.error(`[OzonImportService] Failed to create report:`, reportError);
      throw new Error(`Failed to create report: ${reportError?.message}`);
    }

    const reportId = reportData.report_id;
    console.log(`[OzonImportService] Created report: ${reportId}`);

    const dataWithReportId = data.map(record => ({
      ...record,
      report_id: reportId
    }));

    console.log(`[OzonImportService] Attempting to insert ${dataWithReportId.length} records`);
    console.log(`[OzonImportService] Sample record:`, JSON.stringify(dataWithReportId[0], null, 2));

    try {
      const { error } = await supabaseAdmin
        .from('ozon_data')
        .insert(dataWithReportId);

      if (error) {
        console.error(`[OzonImportService] ❌ Import error:`, error);
        console.error(`[OzonImportService] Error details:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        console.log(`[OzonImportService] Attempting row-by-row import to identify problematic record...`);
        return await this.importDataRowByRow(dataWithReportId, reportId);
      }

      console.log(`[OzonImportService] ✅ Successfully inserted ${dataWithReportId.length} records`);
      return {
        successCount: dataWithReportId.length,
        failureCount: 0,
        duplicateCount: 0,
        reportId
      };
    } catch (error) {
      console.error(`[OzonImportService] ❌ Unexpected error during import:`, error);
      throw error;
    }
  }

  async importData(data: OzonRecord[]): Promise<ImportResult> {
    if (!data || data.length === 0) {
      throw new Error('No data provided for import');
    }

    console.log(`[OzonImportService] Attempting to insert ${data.length} records`);
    console.log(`[OzonImportService] Sample record:`, JSON.stringify(data[0], null, 2));

    console.log(`[OzonImportService] Full data payload (first 3 records):`);
    data.slice(0, 3).forEach((record, index) => {
      console.log(`[OzonImportService] Record ${index}:`, JSON.stringify(record, null, 2));
    });

    try {
      const { error } = await supabaseAdmin
        .from('ozon_data')
        .insert(data);

      if (error) {
        console.error(`[OzonImportService] ❌ Import error:`, error);
        console.error(`[OzonImportService] Error details:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        console.log(`[OzonImportService] Attempting row-by-row import to identify problematic record...`);
        return await this.importDataRowByRow(data);
      }

      console.log(`[OzonImportService] ✅ Successfully inserted ${data.length} records`);
      return {
        successCount: data.length,
        failureCount: 0,
        duplicateCount: 0
      };
    } catch (error) {
      console.error(`[OzonImportService] ❌ Unexpected error during import:`, error);
      throw error;
    }
  }

  private async importDataRowByRow(data: OzonRecord[], reportId?: string): Promise<ImportResult> {
    console.log(`[OzonImportService] Starting row-by-row import for ${data.length} records...`);
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors: Array<{ rowIndex: number; error: any; record: any }> = [];

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      try {
        const { error } = await supabaseAdmin
          .from('ozon_data')
          .insert([record]);

        if (error) {
          if (error.code === '23505') {
            duplicateCount++;
            console.log(`[OzonImportService] ⚠️ Row ${i + 1} skipped (duplicate)`);
          } else {
            errorCount++;
            console.error(`[OzonImportService] ❌ Row ${i + 1} failed:`, {
              error: error.message,
              code: error.code,
              details: error.details,
              record: JSON.stringify(record, null, 2)
            });
            errors.push({ rowIndex: i, error, record });
          }
        } else {
          successCount++;
          if (successCount % 100 === 0) {
            console.log(`[OzonImportService] Progress: ${successCount}/${data.length} rows imported`);
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`[OzonImportService] ❌ Unexpected error at row ${i + 1}:`, error);
        console.error(`[OzonImportService] Problematic record:`, JSON.stringify(record, null, 2));
        errors.push({ rowIndex: i, error, record });
      }
    }

    console.log(`[OzonImportService] Row-by-row import complete:`);
    console.log(`[OzonImportService] ✅ Success: ${successCount} rows`);
    console.log(`[OzonImportService] ⚠️ Duplicates: ${duplicateCount} rows`);
    console.log(`[OzonImportService] ❌ Failed: ${errorCount} rows`);

    if (errors.length > 0) {
      console.error(`[OzonImportService] First 5 errors:`);
      errors.slice(0, 5).forEach(({ rowIndex, error, record }) => {
        console.error(`[OzonImportService] Row ${rowIndex + 1}:`, {
          error: error.message || error,
          record
        });
      });
    }

    return {
      successCount,
      failureCount: errorCount,
      duplicateCount,
      reportId
    };
  }

  async getStats(): Promise<OzonStats> {
    const { data, error } = await supabase
      .from('ozon_data')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    const totalProducts = data?.length || 0;
    const totalRevenue = data?.reduce((sum, record) => sum + (record.ordered_sum || 0), 0) || 0;
    const averagePrice = data?.reduce((sum, record) => sum + (record.average_price || 0), 0) / totalProducts || 0;

    // Group by category
    const categoryStats = data?.reduce((acc, record) => {
      const category = record.category_level1 || 'Unknown';
      if (!acc[category]) {
        acc[category] = { count: 0, revenue: 0 };
      }
      acc[category].count += 1;
      acc[category].revenue += record.ordered_sum || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>) || {};

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalProducts,
      totalRevenue,
      averagePrice,
      topCategories
    };
  }

  async clearData(): Promise<void> {
    const { error: deleteError } = await supabaseAdmin
      .from('ozon_data')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      throw new Error(`Failed to clear data: ${deleteError.message}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from('ozon_import_history')
      .update({
        actual_records_imported: 0,
        data_purged_at: new Date().toISOString()
      })
      .is('data_purged_at', null);

    if (updateError) {
      console.error('Failed to update import history after purge:', updateError);
    } else {
      console.log('[OzonImportService] Import history updated to reflect data purge');
    }
  }

  async getData(): Promise<OzonRecord[]> {
    const { data, error } = await supabase
      .from('ozon_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    return data || [];
  }
}

export const ozonImportService = new OzonImportService();