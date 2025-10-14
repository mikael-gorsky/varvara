import { supabase } from '../../lib/supabase';

export interface OzonImportStatus {
  id: string;
  filename: string;
  recordsCount: number;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  durationDays: number | null;
  importTimestamp: string;
}

export interface OzonImportsStatusResult {
  imports: OzonImportStatus[];
  totalImports: number;
  totalRecords: number;
  earliestDate: string | null;
  latestDate: string | null;
}

export interface PricelistImportStatus {
  hasData: boolean;
  totalProducts: number;
  totalPrices: number;
  uniqueCategories: number;
  uniqueSuppliers: number;
  lastImportDate: string | null;
}

export interface ImportFilesStatus {
  ozon: OzonImportsStatusResult;
  pricelist: PricelistImportStatus;
}

export class ImportStatusService {
  async getOzonImportsStatus(): Promise<OzonImportsStatusResult> {
    const { data, error } = await supabase
      .from('ozon_import_history')
      .select('*')
      .eq('import_status', 'success')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Ozon import status:', error);
      return {
        imports: [],
        totalImports: 0,
        totalRecords: 0,
        earliestDate: null,
        latestDate: null,
      };
    }

    if (!data || data.length === 0) {
      return {
        imports: [],
        totalImports: 0,
        totalRecords: 0,
        earliestDate: null,
        latestDate: null,
      };
    }

    const imports: OzonImportStatus[] = data.map(record => {
      let durationDays: number | null = null;

      if (record.date_range_start && record.date_range_end) {
        const startDate = new Date(record.date_range_start);
        const endDate = new Date(record.date_range_end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        id: record.id,
        filename: record.filename,
        recordsCount: record.records_count || 0,
        dateRangeStart: record.date_range_start,
        dateRangeEnd: record.date_range_end,
        durationDays,
        importTimestamp: record.created_at,
      };
    });

    const totalRecords = imports.reduce((sum, imp) => sum + imp.recordsCount, 0);

    const allDates = data
      .flatMap(record => [record.date_range_start, record.date_range_end])
      .filter(date => date !== null && date !== undefined)
      .sort();

    return {
      imports,
      totalImports: imports.length,
      totalRecords,
      earliestDate: allDates.length > 0 ? allDates[0] : null,
      latestDate: allDates.length > 0 ? allDates[allDates.length - 1] : null,
    };
  }

  async getPricelistImportStatus(): Promise<PricelistImportStatus> {
    const { data: products, error: productsError } = await supabase
      .from('pricelist_products')
      .select('category, created_at');

    if (productsError) {
      console.error('Error fetching pricelist products:', productsError);
      return {
        hasData: false,
        totalProducts: 0,
        totalPrices: 0,
        uniqueCategories: 0,
        uniqueSuppliers: 0,
        lastImportDate: null,
      };
    }

    const { data: prices, error: pricesError } = await supabase
      .from('pricelist_prices')
      .select('supplier, created_at');

    if (pricesError) {
      console.error('Error fetching pricelist prices:', pricesError);
      return {
        hasData: false,
        totalProducts: 0,
        totalPrices: 0,
        uniqueCategories: 0,
        uniqueSuppliers: 0,
        lastImportDate: null,
      };
    }

    const totalProducts = products?.length || 0;
    const totalPrices = prices?.length || 0;
    const hasData = totalProducts > 0;

    const uniqueCategories = new Set(
      products?.map(p => p.category).filter(Boolean)
    ).size;

    const uniqueSuppliers = new Set(
      prices?.map(p => p.supplier).filter(Boolean)
    ).size;

    const allTimestamps = [
      ...(products?.map(p => p.created_at) || []),
      ...(prices?.map(p => p.created_at) || []),
    ].filter(Boolean).sort();

    const lastImportDate = allTimestamps.length > 0
      ? allTimestamps[allTimestamps.length - 1]
      : null;

    return {
      hasData,
      totalProducts,
      totalPrices,
      uniqueCategories,
      uniqueSuppliers,
      lastImportDate,
    };
  }

  async getImportFilesStatus(): Promise<ImportFilesStatus> {
    const [ozon, pricelist] = await Promise.all([
      this.getOzonImportsStatus(),
      this.getPricelistImportStatus(),
    ]);

    return {
      ozon,
      pricelist,
    };
  }
}

export const importStatusService = new ImportStatusService();
