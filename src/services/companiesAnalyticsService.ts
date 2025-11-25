import { supabase } from '../lib/supabase';

export interface CompanySalesData {
  seller: string;
  reportingPeriod: string;
  reportDate: Date;
  totalSales: number;
  productCount: number;
  reportedDays: number;
}

export interface CompanyStats {
  seller: string;
  totalSales: number;
  productCount: number;
  salesByPeriod: {
    date: string;
    sales: number;
    days: number;
  }[];
}

class CompaniesAnalyticsService {
  async getTopCompanies(limit: number = 10): Promise<CompanyStats[]> {
    const { data: ozonData, error: ozonError } = await supabase
      .from('ozon_data')
      .select('seller, ordered_sum, report_id')
      .not('seller', 'is', null);

    if (ozonError) {
      console.error('Error fetching ozon data:', ozonError);
      throw ozonError;
    }

    const { data: reportsData, error: reportsError } = await supabase
      .from('ozon_reports')
      .select('report_id, date_of_report, reported_days');

    if (reportsError) {
      console.error('Error fetching reports data:', reportsError);
      throw reportsError;
    }

    if (!ozonData || ozonData.length === 0 || !reportsData || reportsData.length === 0) {
      return [];
    }

    const reportsMap = new Map(
      reportsData.map(report => [report.report_id, report])
    );

    const companiesMap = new Map<string, {
      totalSales: number;
      productCount: number;
      periodData: Map<string, { sales: number; days: number }>;
    }>();

    ozonData.forEach((row: any) => {
      const seller = row.seller;
      const sales = row.ordered_sum || 0;
      const report = reportsMap.get(row.report_id);

      if (!report) return;

      const reportDate = report.date_of_report;
      const reportedDays = report.reported_days;

      if (!companiesMap.has(seller)) {
        companiesMap.set(seller, {
          totalSales: 0,
          productCount: 0,
          periodData: new Map()
        });
      }

      const company = companiesMap.get(seller)!;
      company.totalSales += sales;
      company.productCount += 1;

      if (!company.periodData.has(reportDate)) {
        company.periodData.set(reportDate, { sales: 0, days: reportedDays });
      }
      company.periodData.get(reportDate)!.sales += sales;
    });

    const companiesArray = Array.from(companiesMap.entries()).map(([seller, data]) => ({
      seller,
      totalSales: data.totalSales,
      productCount: data.productCount,
      salesByPeriod: Array.from(data.periodData.entries())
        .map(([date, periodData]) => ({
          date,
          sales: periodData.sales,
          days: periodData.days
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));

    companiesArray.sort((a, b) => b.totalSales - a.totalSales);

    return companiesArray.slice(0, limit);
  }

  async getCompanyDetails(sellerName: string): Promise<CompanyStats | null> {
    const { data: ozonData, error: ozonError } = await supabase
      .from('ozon_data')
      .select('seller, ordered_sum, report_id')
      .eq('seller', sellerName);

    if (ozonError) {
      console.error('Error fetching company data:', ozonError);
      throw ozonError;
    }

    const { data: reportsData, error: reportsError } = await supabase
      .from('ozon_reports')
      .select('report_id, date_of_report, reported_days');

    if (reportsError) {
      console.error('Error fetching reports data:', reportsError);
      throw reportsError;
    }

    if (!ozonData || ozonData.length === 0 || !reportsData || reportsData.length === 0) {
      return null;
    }

    const reportsMap = new Map(
      reportsData.map(report => [report.report_id, report])
    );

    let totalSales = 0;
    const periodData = new Map<string, { sales: number; days: number }>();

    ozonData.forEach((row: any) => {
      const sales = row.ordered_sum || 0;
      const report = reportsMap.get(row.report_id);

      if (!report) return;

      const reportDate = report.date_of_report;
      const reportedDays = report.reported_days;

      totalSales += sales;

      if (!periodData.has(reportDate)) {
        periodData.set(reportDate, { sales: 0, days: reportedDays });
      }
      periodData.get(reportDate)!.sales += sales;
    });

    return {
      seller: sellerName,
      totalSales,
      productCount: ozonData.length,
      salesByPeriod: Array.from(periodData.entries())
        .map(([date, data]) => ({
          date,
          sales: data.sales,
          days: data.days
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };
  }
}

export const companiesAnalyticsService = new CompaniesAnalyticsService();
