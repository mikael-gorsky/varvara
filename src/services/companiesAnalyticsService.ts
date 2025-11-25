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
    const { data: rawData, error } = await supabase
      .from('ozon_data')
      .select(`
        seller,
        ordered_sum,
        report_id,
        ozon_reports!inner (
          date_of_report,
          reported_days
        )
      `)
      .not('seller', 'is', null);

    if (error) {
      console.error('Error fetching companies data:', error);
      throw error;
    }

    if (!rawData || rawData.length === 0) {
      return [];
    }

    const companiesMap = new Map<string, {
      totalSales: number;
      productCount: number;
      periodData: Map<string, { sales: number; days: number }>;
    }>();

    rawData.forEach((row: any) => {
      const seller = row.seller;
      const sales = row.ordered_sum || 0;
      const reportDate = row.ozon_reports.date_of_report;
      const reportedDays = row.ozon_reports.reported_days;

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
    const { data: rawData, error } = await supabase
      .from('ozon_data')
      .select(`
        seller,
        ordered_sum,
        ozon_reports!inner (
          date_of_report,
          reported_days
        )
      `)
      .eq('seller', sellerName);

    if (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }

    if (!rawData || rawData.length === 0) {
      return null;
    }

    let totalSales = 0;
    const periodData = new Map<string, { sales: number; days: number }>();

    rawData.forEach((row: any) => {
      const sales = row.ordered_sum || 0;
      const reportDate = row.ozon_reports.date_of_report;
      const reportedDays = row.ozon_reports.reported_days;

      totalSales += sales;

      if (!periodData.has(reportDate)) {
        periodData.set(reportDate, { sales: 0, days: reportedDays });
      }
      periodData.get(reportDate)!.sales += sales;
    });

    return {
      seller: sellerName,
      totalSales,
      productCount: rawData.length,
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
