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
  turnover_dynamic_percentage?: number;
  ordered_quantity?: number;
  average_price?: number;
  minimum_price?: number;
  buyout_share_percentage?: number;
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
  view_to_cart_percentage?: number;
  search_to_cart_percentage?: number;
  description_to_cart_percentage?: number;
  discount_promo?: number;
  revenue_promo_percentage?: number;
  days_promo?: number;
  days_boost?: number;
  ads_share_percentage?: number;
  card_date?: string;
  date_of_report?: string;
  reported_days?: number;
}

export interface OzonFileMetadata {
  fileName: string;
  fileSize: number;
  dateOfReport: string | null;
  reportedDays: number | null;
  categoryLevel3: string | null;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
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

const COLUMN_MAPPING: Record<string, { field: string; instruction: string }> = {
  'Название товара': { field: 'product_name', instruction: 'string' },
  'Ссылка на товар': { field: 'product_link', instruction: 'string' },
  'Продавец': { field: 'seller', instruction: 'string' },
  'Бренд': { field: 'brand', instruction: 'string' },
  'Категория 1 уровня': { field: 'category_level1', instruction: 'string' },
  'Категория 3 уровня': { field: 'category_level3', instruction: 'string' },
  'Признак товара': { field: 'product_flag', instruction: 'string' },
  'Заказано на сумму, ₽': { field: 'ordered_sum', instruction: 'forced_int' },
  'Динамика оборота, %': { field: 'turnover_dynamic_percentage', instruction: 'forced_int' },
  'Заказано, штуки': { field: 'ordered_quantity', instruction: 'int' },
  'Средняя цена, ₽': { field: 'average_price', instruction: 'forced_int' },
  'Минимальная цена, ₽': { field: 'minimum_price', instruction: 'forced_int' },
  'Доля выкупа, %': { field: 'buyout_share_percentage', instruction: 'intx10' },
  'Упущенные продажи, ₽': { field: 'lost_sales', instruction: 'forced_int' },
  'Дней без остатка': { field: 'days_no_stock', instruction: 'special_ratio' },
  'Ср. время доставки до покупателя, часы': { field: 'average_delivery_hours', instruction: 'special_hours' },
  'Среднесуточные продажи, ₽': { field: 'average_daily_revenue', instruction: 'forced_int' },
  'Среднесуточные продажи, штуки': { field: 'average_daily_sales_pcs', instruction: 'int' },
  'Остаток на конец периода, штуки': { field: 'ending_stock', instruction: 'int' },
  'Схема работы': { field: 'work_scheme', instruction: 'string' },
  'Объем товара, л': { field: 'volume_liters', instruction: 'intx10' },
  'Показы всего': { field: 'views', instruction: 'int' },
  'Просмотры в поиске и каталоге': { field: 'views_search', instruction: 'int' },
  'Просмотры карточки': { field: 'views_card', instruction: 'int' },
  'Конверсия из показа в заказ, %': { field: 'view_to_cart_percentage', instruction: 'intx100' },
  'В корзину из поиска и каталога, %': { field: 'search_to_cart_percentage', instruction: 'intx100' },
  'В корзину из карточки, %': { field: 'description_to_cart_percentage', instruction: 'intx100' },
  'Скидка за счет акций': { field: 'discount_promo', instruction: 'intx10' },
  'Доля оборота в акциях, %': { field: 'revenue_promo_percentage', instruction: 'intx10' },
  'Дней в акциях': { field: 'days_promo', instruction: 'int' },
  'Дней с продвижением': { field: 'days_boost', instruction: 'int' },
  'Доля рекламных расходов, %': { field: 'ads_share_percentage', instruction: 'intx10' },
  'Дата создания карточки товара': { field: 'card_date', instruction: 'date' }
};

export async function parseOzonFile(file: File): Promise<OzonParsedData> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve(createEmptyResult(file, ['Failed to read file']));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: '' });

        const result = processOzonRawData(rawData as any[][], file);
        resolve(result);
      } catch (error) {
        resolve(createEmptyResult(file, [`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`]));
      }
    };

    reader.onerror = () => {
      resolve(createEmptyResult(file, ['Failed to read file']));
    };

    reader.readAsBinaryString(file);
  });
}

function createEmptyResult(file: File, errors: string[]): OzonParsedData {
  return {
    rows: [],
    headers: [],
    errors,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      dateOfReport: null,
      reportedDays: null,
      categoryLevel3: null,
      dateRangeStart: null,
      dateRangeEnd: null
    },
    headerValidation: { isValid: false, missingFields: [], extraFields: [] },
    stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
  };
}

function processOzonRawData(rawData: any[][], file: File): OzonParsedData {
  const errors: string[] = [];
  const rows: OzonDataRow[] = [];

  if (rawData.length < 5) {
    return {
      rows: [],
      headers: [],
      errors: ['File must contain at least 5 rows (3 metadata rows + header + data)'],
      metadata: extractFileMetadata(rawData, file),
      headerValidation: { isValid: false, missingFields: [], extraFields: [] },
      stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
    };
  }

  const metadata = extractFileMetadata(rawData, file);

  const headerRowIndex = 4;
  const headers = rawData[headerRowIndex] || [];
  console.log('Detected headers:', headers);

  const headerValidation = validateOzonHeaders(headers);

  let validRows = 0;
  let invalidRows = 0;

  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const rowData = rawData[i];

    if (!rowData || rowData.length === 0 ||
        (rowData[0] && (String(rowData[0]).includes('Среднее значение') ||
                        String(rowData[0]).includes('Итого')))) {
      continue;
    }

    try {
      const mappedRow = mapOzonRowToData(headers, rowData, metadata);
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
      totalRows: rawData.length - headerRowIndex - 1,
      validRows,
      invalidRows
    }
  };
}

function extractFileMetadata(rawData: any[][], file: File): OzonFileMetadata {
  const metadata: OzonFileMetadata = {
    fileName: file.name,
    fileSize: file.size,
    dateOfReport: null,
    reportedDays: null,
    categoryLevel3: null,
    dateRangeStart: null,
    dateRangeEnd: null
  };

  if (rawData.length < 3) return metadata;

  if (rawData[0] && rawData[0][1]) {
    const dateStr = String(rawData[0][1]).trim();
    metadata.dateOfReport = parseDateFromRussianFormat(dateStr);
  }

  if (rawData[1] && rawData[1][1]) {
    const periodStr = String(rawData[1][1]).trim();
    const match = periodStr.match(/(\d+)\s*дн/i);
    if (match) {
      metadata.reportedDays = parseInt(match[1], 10);
    }
  }

  if (rawData[2] && rawData[2][1]) {
    metadata.categoryLevel3 = String(rawData[2][1]).trim();
  }

  return metadata;
}

function parseDateFromRussianFormat(dateStr: string): string | null {
  const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (!match) return null;

  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  let year = match[3];

  if (year.length === 2) {
    const yearNum = parseInt(year, 10);
    year = yearNum >= 50 ? `19${year}` : `20${year}`;
  }

  return `${year}-${month}-${day}`;
}

function validateOzonHeaders(headers: string[]): {
  isValid: boolean;
  missingFields: string[];
  extraFields: string[];
} {
  const missingFields: string[] = [];

  const hasProductName = headers.some(h =>
    h && (h.includes('Название товара') ||
          h.includes('Название') ||
          h.toLowerCase().includes('product'))
  );

  if (!hasProductName) {
    missingFields.push('Название товара');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    extraFields: []
  };
}

function mapOzonRowToData(headers: any[], values: any[], metadata: OzonFileMetadata): OzonDataRow | null {
  const row: any = {
    date_of_report: metadata.dateOfReport,
    reported_days: metadata.reportedDays
  };
  let hasRequiredData = false;

  headers.forEach((header, index) => {
    if (!header) return;

    const headerStr = String(header).trim();
    const value = values[index];

    const mapping = COLUMN_MAPPING[headerStr];

    if (mapping) {
      const parsedValue = parseOzonValue(value, mapping.instruction);
      row[mapping.field] = parsedValue;

      if (mapping.field === 'product_name' && parsedValue) {
        hasRequiredData = true;
      }
    }
  });

  if (metadata.categoryLevel3 && !row.category_level3) {
    row.category_level3 = metadata.categoryLevel3;
  }

  return hasRequiredData ? row : null;
}

function parseOzonValue(value: any, instruction: string): any {
  if (value === null || value === undefined) {
    return null;
  }

  const strValue = String(value).trim();

  if (!strValue || strValue === '-' || strValue === 'Нет данных' || strValue.toLowerCase() === 'нет данных') {
    return null;
  }

  if (instruction === 'string') {
    return strValue;
  }

  if (instruction === 'date') {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return parseDateFromRussianFormat(strValue);
  }

  if (instruction === 'special_ratio') {
    const match = strValue.match(/(\d+)\s*из\s*(\d+)/i);
    if (match) {
      const x = parseInt(match[1], 10);
      const y = parseInt(match[2], 10);
      if (y > 0) {
        return Math.round((x / y) * 100);
      }
    }
    return null;
  }

  if (instruction === 'special_hours') {
    const match = strValue.match(/(\d+)\s*ч/i);
    if (match) {
      return parseInt(match[1], 10);
    }
    const numMatch = strValue.match(/(\d+)/);
    if (numMatch) {
      return parseInt(numMatch[1], 10);
    }
    return null;
  }

  if (typeof value === 'number') {
    return applyTransformation(value, instruction);
  }

  let cleanValue = strValue
    .replace(/\s+/g, '')
    .replace(',', '.');

  cleanValue = cleanValue.replace(/[^\d.-]/g, '');

  const numericValue = parseFloat(cleanValue);
  if (isNaN(numericValue)) {
    return null;
  }

  return applyTransformation(numericValue, instruction);
}

function applyTransformation(value: number, instruction: string): number {
  switch (instruction) {
    case 'forced_int':
    case 'int':
      return Math.round(value);
    case 'intx10':
      return Math.round(value * 10);
    case 'intx100':
      return Math.round(value * 100);
    default:
      return value;
  }
}
