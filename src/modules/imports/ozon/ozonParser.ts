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

  console.log('[OzonParser] Total rows in file:', rawData.length);
  console.log('[OzonParser] First 5 rows:', rawData.slice(0, 5));

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

  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    if (row && row[0] && String(row[0]).includes('Название товара')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    console.error('[OzonParser] Could not find header row');
    return {
      rows: [],
      headers: [],
      errors: ['Could not find header row with "Название товара"'],
      metadata,
      headerValidation: { isValid: false, missingFields: ['Название товара'], extraFields: [] },
      stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
    };
  }

  console.log('[OzonParser] Found header row at index:', headerRowIndex);
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

  for (let i = 0; i < Math.min(5, rawData.length); i++) {
    const row = rawData[i];
    if (!row || row.length < 2) continue;

    const label = String(row[0] || '').toLowerCase().trim();
    const value = row[1];

    if (label.includes('дата формирования') || label.includes('дата форм')) {
      const dateStr = String(value).trim();
      metadata.dateOfReport = parseDateFromRussianFormat(dateStr);
      console.log('[OzonParser] Found date of report:', metadata.dateOfReport, 'from', dateStr);
    }

    if (label.includes('период отчета') || label.includes('период')) {
      const periodStr = String(value).trim();
      const match = periodStr.match(/(\d+)\s*дн/i);
      if (match) {
        metadata.reportedDays = parseInt(match[1], 10);
        console.log('[OzonParser] Found reported days:', metadata.reportedDays);
      }
    }

    if (label.includes('категория 3') || label.includes('категория')) {
      metadata.categoryLevel3 = String(value).trim();
      console.log('[OzonParser] Found category level 3:', metadata.categoryLevel3);
    }
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

const SMALLINT_MAX = 32767;
const SMALLINT_MIN = -32768;
const INTEGER_MAX = 2147483647;
const INTEGER_MIN = -2147483648;

const SCHEMA_CONSTRAINTS: Record<string, { type: 'smallint' | 'integer'; max: number; min: number }> = {
  ordered_quantity: { type: 'smallint', max: SMALLINT_MAX, min: SMALLINT_MIN },
  days_no_stock: { type: 'smallint', max: SMALLINT_MAX, min: SMALLINT_MIN },
  average_delivery_hours: { type: 'smallint', max: SMALLINT_MAX, min: SMALLINT_MIN },
  average_daily_sales_pcs: { type: 'smallint', max: SMALLINT_MAX, min: SMALLINT_MIN },
  view_to_cart_percentage: { type: 'smallint', max: SMALLINT_MAX, min: SMALLINT_MIN },
  search_to_cart_percentage: { type: 'smallint', max: SMALLINT_MAX, min: SMALLINT_MIN },
  description_to_cart_percentage: { type: 'smallint', max: SMALLINT_MAX, min: SMALLINT_MIN },
  ads_share_percentage: { type: 'smallint', max: SMALLINT_MAX, min: SMALLINT_MIN },
  reported_days: { type: 'smallint', max: SMALLINT_MAX, min: SMALLINT_MIN },
  ordered_sum: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  turnover_dynamic_percentage: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  average_price: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  minimum_price: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  buyout_share_percentage: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  lost_sales: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  average_daily_revenue: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  ending_stock: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  volume_liters: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  views: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  views_search: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  views_card: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  discount_promo: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  revenue_promo_percentage: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  days_promo: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN },
  days_boost: { type: 'integer', max: INTEGER_MAX, min: INTEGER_MIN }
};

function validateFieldValue(fieldName: string, value: any): { valid: boolean; error?: string; warning?: string } {
  if (value === null || value === undefined) {
    return { valid: true };
  }

  const constraint = SCHEMA_CONSTRAINTS[fieldName];
  if (!constraint) {
    return { valid: true };
  }

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return { valid: true };
  }

  if (numValue > constraint.max) {
    const error = `Field "${fieldName}" value ${numValue} exceeds ${constraint.type} maximum (${constraint.max})`;
    console.error(`[Validation] ❌ ${error}`);
    return { valid: false, error };
  }

  if (numValue < constraint.min) {
    const error = `Field "${fieldName}" value ${numValue} below ${constraint.type} minimum (${constraint.min})`;
    console.error(`[Validation] ❌ ${error}`);
    return { valid: false, error };
  }

  if (constraint.type === 'smallint' && numValue > constraint.max * 0.9) {
    const warning = `Field "${fieldName}" value ${numValue} is approaching ${constraint.type} maximum (${constraint.max})`;
    console.warn(`[Validation] ⚠️  ${warning}`);
    return { valid: true, warning };
  }

  return { valid: true };
}

function mapOzonRowToData(headers: any[], values: any[], metadata: OzonFileMetadata): OzonDataRow | null {
  const row: any = {};
  let hasRequiredData = false;
  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  headers.forEach((header, index) => {
    if (!header) return;

    const headerStr = String(header).trim();
    const value = values[index];

    const mapping = COLUMN_MAPPING[headerStr];

    if (mapping) {
      const parsedValue = parseOzonValue(value, mapping.instruction, mapping.field);

      const validation = validateFieldValue(mapping.field, parsedValue);
      if (!validation.valid) {
        validationErrors.push(validation.error || 'Unknown validation error');
      }
      if (validation.warning) {
        validationWarnings.push(validation.warning);
      }

      row[mapping.field] = parsedValue;

      if (mapping.field === 'product_name' && parsedValue) {
        hasRequiredData = true;
      }
    }
  });

  if (metadata.categoryLevel3 && !row.category_level3) {
    row.category_level3 = metadata.categoryLevel3;
  }

  if (validationErrors.length > 0) {
    console.error(`[Validation] Row has ${validationErrors.length} validation errors:`, validationErrors);
    console.error(`[Validation] Problematic row data:`, JSON.stringify(row, null, 2));
  }

  if (validationWarnings.length > 0) {
    console.warn(`[Validation] Row has ${validationWarnings.length} warnings:`, validationWarnings);
  }

  return hasRequiredData ? row : null;
}

function parseOzonValue(value: any, instruction: string, fieldName?: string): any {
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
        const result = Math.round((x / y) * 100);
        console.log(`[Parser] ${fieldName || 'field'}: special_ratio "${strValue}" -> ${result}`);
        return result;
      }
    }
    return null;
  }

  if (instruction === 'special_hours') {
    const match = strValue.match(/(\d+)\s*ч/i);
    if (match) {
      const result = parseInt(match[1], 10);
      console.log(`[Parser] ${fieldName || 'field'}: special_hours "${strValue}" -> ${result}`);
      return result;
    }
    const numMatch = strValue.match(/(\d+)/);
    if (numMatch) {
      const result = parseInt(numMatch[1], 10);
      console.log(`[Parser] ${fieldName || 'field'}: special_hours "${strValue}" -> ${result}`);
      return result;
    }
    return null;
  }

  if (typeof value === 'number') {
    const result = applyTransformation(value, instruction);
    console.log(`[Parser] ${fieldName || 'field'}: ${instruction} ${value} -> ${result}`);
    return result;
  }

  let cleanValue = strValue
    .replace(/\s+/g, '')
    .replace(',', '.');

  cleanValue = cleanValue.replace(/[^\d.-]/g, '');

  const numericValue = parseFloat(cleanValue);
  if (isNaN(numericValue)) {
    return null;
  }

  const result = applyTransformation(numericValue, instruction);
  console.log(`[Parser] ${fieldName || 'field'}: ${instruction} "${strValue}" (${numericValue}) -> ${result}`);
  return result;
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
