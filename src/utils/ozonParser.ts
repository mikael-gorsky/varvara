import * as XLSX from 'xlsx';

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

export interface OzonFileMetadata {
  fileName: string;
  fileSize: number;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
  reportPeriod: string | null;
  categoryLevel3: string | null;
}

export interface OzonParsedData {
  rows: OzonDataRow[];
  headers: string[];
  errors: string[];
  metadata: OzonFileMetadata;
  headerValidation: {
    isValid: boolean;
    missingFields: string[];
    extraFields: string[];
  };
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const EXPECTED_HEADERS = {
  'Название товара': 'product_name',
  'Ссылка на товар': 'product_link', 
  'Продавец': 'seller',
  'Бренд': 'brand',
  'Категория 1 уровня': 'category_level1',
  'Категория 3 уровня': 'category_level3',
  'Признак товара': 'product_flag'
};

export async function parseOzonFile(file: File): Promise<OzonParsedData> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({
            rows: [],
            headers: [],
            errors: ['Failed to read file'],
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              dateRangeStart: null,
              dateRangeEnd: null,
              reportPeriod: null,
              categoryLevel3: null
            },
            headerValidation: { isValid: false, missingFields: [], extraFields: [] },
            stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
          });
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: '' });

        const result = processOzonRawData(rawData as any[][], file);
        resolve(result);
      } catch (error) {
        resolve({
          rows: [],
          headers: [],
          errors: [`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`],
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            dateRangeStart: null,
            dateRangeEnd: null,
            reportPeriod: null,
            categoryLevel3: null
          },
          headerValidation: { isValid: false, missingFields: [], extraFields: [] },
          stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
        });
      }
    };

    reader.onerror = () => {
      resolve({
        rows: [],
        headers: [],
        errors: ['Failed to read file'],
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          dateRangeStart: null,
          dateRangeEnd: null,
          reportPeriod: null,
          categoryLevel3: null
        },
        headerValidation: { isValid: false, missingFields: [], extraFields: [] },
        stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
      });
    };

    reader.readAsBinaryString(file);
  });
}

function processOzonRawData(rawData: any[][], file: File): OzonParsedData {
  const errors: string[] = [];
  const rows: OzonDataRow[] = [];

  if (rawData.length < 7) {
    return {
      rows: [],
      headers: [],
      errors: ['File must contain at least 7 rows with headers and data'],
      metadata: extractFileMetadata(rawData, file),
      headerValidation: { isValid: false, missingFields: [], extraFields: [] },
      stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
    };
  }

  // Headers are in row 5 (index 4)
  const headers = rawData[4] || [];
  console.log('Detected headers:', headers);
  
  // Validate headers
  const headerValidation = validateOzonHeaders(headers);
  
  let validRows = 0;
  let invalidRows = 0;

  // Process data rows starting from row 7 (index 6)
  for (let i = 6; i < rawData.length; i++) {
    const rowData = rawData[i];
    
    // Skip summary rows
    if (!rowData || rowData.length === 0 || 
        (rowData[0] && (rowData[0].includes('Среднее значение') || rowData[0].includes('Итого')))) {
      continue;
    }

    try {
      const mappedRow = mapOzonRowToData(headers, rowData);
      if (mappedRow && mappedRow.product_name) {
        rows.push(mappedRow);
        validRows++;
      } else {
        invalidRows++;
      }
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      invalidRows++;
    }
  }

  const metadata = extractFileMetadata(rawData, file);

  // Extract date range from actual data
  if (rows.length > 0) {
    const dates = rows
      .map(r => r.card_date)
      .filter(d => d)
      .sort();

    if (dates.length > 0) {
      metadata.dateRangeStart = dates[0] || null;
      metadata.dateRangeEnd = dates[dates.length - 1] || null;
    }
  }

  return {
    rows,
    headers,
    errors,
    metadata,
    headerValidation,
    stats: {
      totalRows: rawData.length - 6,
      validRows,
      invalidRows
    }
  };
}

function extractFileMetadata(rawData: string[][], file: File): OzonFileMetadata {
  const metadata: OzonFileMetadata = {
    fileName: file.name,
    fileSize: file.size,
    dateRangeStart: null,
    dateRangeEnd: null,
    reportPeriod: null,
    categoryLevel3: null
  };

  if (rawData.length < 4) return metadata;

  // Extract metadata from first 4 rows
  // Row 1: Дата формирования
  // Row 2: Период отчета
  // Row 3: Категория 3 уровня

  if (rawData[1] && rawData[1][1]) {
    metadata.reportPeriod = String(rawData[1][1]);
  }

  if (rawData[2] && rawData[2][1]) {
    metadata.categoryLevel3 = String(rawData[2][1]);
  }

  return metadata;
}

function validateOzonHeaders(headers: string[]): {
  isValid: boolean;
  missingFields: string[];
  extraFields: string[];
} {
  const missingFields: string[] = [];
  const extraFields: string[] = [];

  // Check for required product name field
  const hasProductName = headers.some(h => 
    h && (h.includes('Название товара') || 
          h.includes('товара') ||
          h.toLowerCase().includes('product'))
  );

  if (!hasProductName) {
    missingFields.push('Название товара');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    extraFields
  };
}

function mapOzonRowToData(headers: any[], values: any[]): OzonDataRow | null {
  const row: any = {};
  let hasRequiredData = false;

  headers.forEach((header, index) => {
    if (!header) return;

    const value = values[index];
    const fieldName = getFieldName(String(header));

    if (fieldName) {
      const parsedValue = parseOzonValue(value, fieldName);
      row[fieldName] = parsedValue;

      if (fieldName === 'product_name' && parsedValue) {
        hasRequiredData = true;
      }
    }
  });

  return hasRequiredData ? row : null;
}

function getFieldName(header: string): string | null {
  const h = header.toLowerCase();

  // Basic product info
  if (h.includes('название товара') || h.includes('товара')) return 'product_name';
  if (h.includes('ссылка')) return 'product_link';
  if (h.includes('продавец')) return 'seller';
  if (h.includes('бренд')) return 'brand';
  if (h.includes('категория 1')) return 'category_level1';
  if (h.includes('категория 3')) return 'category_level3';
  if (h.includes('признак')) return 'product_flag';

  // Financial metrics
  if (h.includes('заказано на сумму') || h.includes('заказано') && h.includes('сумму')) return 'ordered_sum';
  if (h.includes('динамика оборота')) return 'turnover_dynamic';
  if (h.includes('заказано, шт') || (h.includes('заказано') && h.includes('шт'))) return 'ordered_quantity';
  if (h.includes('средняя цена')) return 'average_price';
  if (h.includes('минимальная цена')) return 'minimum_price';
  if (h.includes('доля выкупа')) return 'buyout_share';
  if (h.includes('упущенные продажи')) return 'lost_sales';

  // Inventory and delivery
  if (h.includes('дней без наличия')) return 'days_no_stock';
  if (h.includes('среднее время доставки')) return 'average_delivery_hours';
  if (h.includes('средний дневной оборот')) return 'average_daily_revenue';
  if (h.includes('средние продажи в день')) return 'average_daily_sales_pcs';
  if (h.includes('остаток')) return 'ending_stock';
  if (h.includes('схема работы')) return 'work_scheme';
  if (h.includes('объем')) return 'volume_liters';

  // Views and conversion
  if (h.includes('просмотры, всего')) return 'views';
  if (h.includes('просмотры, поиск')) return 'views_search';
  if (h.includes('просмотры, карточка')) return 'views_card';
  if (h.includes('в корзину, просмотры')) return 'view_to_cart';
  if (h.includes('в корзину, поиск')) return 'search_to_cart';
  if (h.includes('в корзину, карточка')) return 'description_to_cart';

  // Promotions
  if (h.includes('скидка/акция')) return 'discount_promo';
  if (h.includes('оборот акции')) return 'revenue_promo';
  if (h.includes('дней в акции')) return 'days_promo';
  if (h.includes('дней в бусте')) return 'days_boost';
  if (h.includes('доля рекламы')) return 'ads_share';

  // Dates
  if (h.includes('дата размещения карточки')) return 'card_date';
  if (h.includes('дата загрузки')) return 'import_date';

  return null;
}

function parseOzonValue(value: any, fieldName: string): any {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }

  // Numeric fields
  const numericFields = [
    'ordered_sum', 'turnover_dynamic', 'ordered_quantity', 'average_price',
    'minimum_price', 'buyout_share', 'lost_sales', 'days_no_stock',
    'average_delivery_hours', 'average_daily_revenue', 'average_daily_sales_pcs',
    'ending_stock', 'volume_liters', 'views', 'views_search', 'views_card',
    'view_to_cart', 'search_to_cart', 'description_to_cart', 'discount_promo',
    'revenue_promo', 'days_promo', 'days_boost', 'ads_share'
  ];

  if (numericFields.includes(fieldName)) {
    // If already a number, return it
    if (typeof value === 'number') {
      return value;
    }

    // Convert to string and check for empty/dash
    const strValue = String(value).trim();
    if (!strValue || strValue === '-') {
      return null;
    }

    // Handle Russian number format: spaces as thousands separator, comma as decimal
    let cleanValue = strValue
      .replace(/\s+/g, '') // Remove spaces (thousands separator)
      .replace(',', '.'); // Replace comma with dot (decimal separator)

    // Remove any remaining non-numeric characters except dot and minus
    cleanValue = cleanValue.replace(/[^\d.-]/g, '');

    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? null : numericValue;
  }

  // For string fields, convert to string and trim
  const strValue = String(value).trim();
  return strValue === '-' || !strValue ? null : strValue;
}