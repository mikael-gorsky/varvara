import { supabase, supabaseAdmin } from '../../../lib/supabase';

export interface OzonReport {
  report_id: string;
  date_of_report: string;
  reported_days: number;
  imported_at: string;
  product_count?: number;
}

export interface ReportWithStats extends OzonReport {
  product_count: number;
  total_revenue: number;
  avg_price: number;
}

export class ReportManagementService {
  async getReports(): Promise<ReportWithStats[]> {
    const { data: reports, error: reportsError } = await supabase
      .from('ozon_reports')
      .select('*')
      .order('date_of_report', { ascending: false });

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      throw new Error(`Failed to fetch reports: ${reportsError.message}`);
    }

    if (!reports || reports.length === 0) {
      return [];
    }

    const reportsWithStats = await Promise.all(
      reports.map(async (report) => {
        const stats = await this.getReportStats(report.report_id);
        return {
          ...report,
          product_count: stats.product_count,
          total_revenue: stats.total_revenue,
          avg_price: stats.avg_price
        };
      })
    );

    return reportsWithStats;
  }

  async getReport(reportId: string): Promise<OzonReport | null> {
    const { data, error } = await supabase
      .from('ozon_reports')
      .select('*')
      .eq('report_id', reportId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching report:', error);
      return null;
    }

    return data;
  }

  async getReportStats(reportId: string): Promise<{
    product_count: number;
    total_revenue: number;
    avg_price: number;
  }> {
    const { data, error } = await supabase
      .from('ozon_data')
      .select('ordered_sum, average_price')
      .eq('report_id', reportId);

    if (error) {
      console.error('Error fetching report stats:', error);
      return { product_count: 0, total_revenue: 0, avg_price: 0 };
    }

    const product_count = data?.length || 0;
    const total_revenue = data?.reduce((sum, row) => sum + (row.ordered_sum || 0), 0) || 0;
    const avg_price = product_count > 0
      ? data.reduce((sum, row) => sum + (row.average_price || 0), 0) / product_count
      : 0;

    return {
      product_count,
      total_revenue,
      avg_price
    };
  }

  async deleteReport(reportId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('ozon_reports')
      .delete()
      .eq('report_id', reportId);

    if (error) {
      console.error('Error deleting report:', error);
      return false;
    }

    console.log(`[ReportManagement] Successfully deleted report ${reportId} and all associated products`);
    return true;
  }

  async checkReportExists(dateOfReport: string, reportedDays: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('ozon_reports')
      .select('report_id')
      .eq('date_of_report', dateOfReport)
      .eq('reported_days', reportedDays)
      .maybeSingle();

    if (error) {
      console.error('Error checking report existence:', error);
      return false;
    }

    return !!data;
  }

  async getReportsByDateRange(startDate: string, endDate: string): Promise<OzonReport[]> {
    const { data, error } = await supabase
      .from('ozon_reports')
      .select('*')
      .gte('date_of_report', startDate)
      .lte('date_of_report', endDate)
      .order('date_of_report', { ascending: false });

    if (error) {
      console.error('Error fetching reports by date range:', error);
      return [];
    }

    return data || [];
  }

  async getReportsByPeriod(reportedDays: number): Promise<OzonReport[]> {
    const { data, error } = await supabase
      .from('ozon_reports')
      .select('*')
      .eq('reported_days', reportedDays)
      .order('date_of_report', { ascending: false });

    if (error) {
      console.error('Error fetching reports by period:', error);
      return [];
    }

    return data || [];
  }
}

export const reportManagementService = new ReportManagementService();
