import { supabase } from '../lib/supabase';

export interface CategoryStats {
  category: string;
  totalSales: number;
  productCount: number;
  salesByPeriod: {
    date: string;
    sales: number;
    days: number;
  }[];
}

class CategoriesAnalyticsService {
  async getTopCategories(limit: number = 10): Promise<CategoryStats[]> {
    const { data: ozonData, error: ozonError } = await supabase
      .from('ozon_data')
      .select('category_level3, ordered_sum, report_id')
      .not('category_level3', 'is', null);

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

    const categoriesMap = new Map<string, {
      totalSales: number;
      productCount: number;
      periodData: Map<string, { sales: number; days: number }>;
    }>();

    ozonData.forEach((row: any) => {
      const category = row.category_level3;
      const sales = row.ordered_sum || 0;
      const report = reportsMap.get(row.report_id);

      if (!report) return;

      const reportDate = report.date_of_report;
      const reportedDays = report.reported_days;

      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, {
          totalSales: 0,
          productCount: 0,
          periodData: new Map()
        });
      }

      const categoryData = categoriesMap.get(category)!;
      categoryData.totalSales += sales;
      categoryData.productCount += 1;

      if (!categoryData.periodData.has(reportDate)) {
        categoryData.periodData.set(reportDate, { sales: 0, days: reportedDays });
      }
      categoryData.periodData.get(reportDate)!.sales += sales;
    });

    const categoriesArray = Array.from(categoriesMap.entries()).map(([category, data]) => ({
      category,
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

    categoriesArray.sort((a, b) => b.totalSales - a.totalSales);

    return categoriesArray.slice(0, limit);
  }

  async getCategoryDetails(categoryName: string): Promise<CategoryStats | null> {
    const { data: ozonData, error: ozonError } = await supabase
      .from('ozon_data')
      .select('category_level3, ordered_sum, report_id')
      .eq('category_level3', categoryName);

    if (ozonError) {
      console.error('Error fetching category data:', ozonError);
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
      category: categoryName,
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

export const categoriesAnalyticsService = new CategoriesAnalyticsService();
