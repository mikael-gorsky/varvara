import * as XLSX from 'xlsx';
import { Database } from '../lib/supabase';

export type OzonDataRow = Database['public']['Tables']['ozon_data']['Insert'];

export interface OzonParsedData {
  headers: string[];
  rows: OzonDataRow[];
  errors: string[];
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };
  headerValidation: {
    isValid: boolean;
    missingFields: string[];
    extraFields: string[];
    mapping: Record<string, number>;
  };
}

// Official OZON field mapping - Russian to English
const OZON_FIELD_MAPPING: Record<string, string> = {
  'Название товара': 'product_name',
  'Ссылка на товар': 'product_link',
  'Продавец': 'seller',
  'Бренд': 'brand',
  'Категория 1 уровня': 'category_level1',
  'Категория 3 уровня': 'category_level3',
  'Признак товара': 'product_flag',
  'Заказано на сумму, ₽': 'ordered_sum',
  'Динамика оборота, %': 'turnover_dynamic',
  'Заказано, штуки': 'ordered_quantity',
  'Средняя цена, ₽': 'average_price',
  'Минимальная цена, ₽': 'minimum_price',
  'Доля выкупа, %': 'buyout_share',
  'Упущенные продажи, ₽': 'lost_sales',
  'Дней без остатка': 'days_no_stock',
  'Ср. время доставки до покупателя, часы': 'average_delivery_hours',
  'Среднесуточные продажи, ₽': 'average_daily_revenue',
  'Среднесуточные продажи, штуки': 'average_daily_sales_pcs',
  'Остаток на конец периода, штуки': 'ending_stock',
  'Схема работы': 'work_scheme',
  'Объем товара, л': 'volume_liters',
  'Показы всего': 'views',
  'Просмотры в поиске и каталоге': 'views_search',
  'Просмотры карточки': 'views_card',
  'Конверсия из показа в заказ, %': 'view_to_cart',
  'В корзину из поиска и каталога, %': 'search_to_cart',
  'В корзину из карточки, %': 'description_to_cart',
  'Скидка за счет акций': 'discount_promo',
  'Доля оборота в акциях, %': 'revenue_promo',
  'Дней в акциях': 'days_promo',
  'Дней с продвижением': 'days_boost',
  'Доля рекламных расходов, %': 'ads_share',
  'Дата создания карточки товара': 'card_date'
};

// Expected field order based on OZON export structure
const EXPECTED_FIELDS = Object.keys(OZON_FIELD_MAPPING);

export const parseOzonFile = async (file: File): Promise<OzonParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('No data found in file');
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        const result = processOzonData(jsonData);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsBinaryString(file);
  });
};

const processOzonData = (rawData: any[][]): OzonParsedData => {
  if (rawData.length < 6) {
    return {
      headers: [],
      rows: [],
      errors: ['File has insufficient rows. Expected at least 6 rows (4 technical + 1 header + 1 data)'],
      stats: { totalRows: 0, validRows: 0, errorRows: 0 },
      headerValidation: {
        isValid: false,
        missingFields: EXPECTED_FIELDS,
        extraFields: [],
        mapping: {}
      }
    };
  }

  // Row 5 (index 4) contains headers, rows 6+ contain data
  const headers = rawData[4].map((h: any) => String(h || '').trim());
  const dataRows = rawData.slice(5);
  
  console.log('OZON Parser - Detected headers:', headers);
  console.log('OZON Parser - Expected fields:', EXPECTED_FIELDS);
  
  // Validate headers against expected OZON structure
  const headerValidation = validateOzonHeaders(headers);
  
  if (!headerValidation.isValid) {
    console.warn('Header validation failed:', headerValidation);
  }
  
  const errors: string[] = [];
  const validRows: OzonDataRow[] = [];
  
  // Process each data row
  dataRows.forEach((row, index) => {
    try {
      // Skip completely empty rows
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        return;
      }
      
      const mappedRow = mapRowToOzonData(row, headerValidation.mapping, headers);
      if (mappedRow) {
        validRows.push(mappedRow);
      }
    } catch (error) {
      errors.push(`Row ${index + 6}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    headers,
    rows: validRows,
    errors,
    stats: {
      totalRows: dataRows.filter(row => row && !row.every(cell => !cell || String(cell).trim() === '')).length,
      validRows: validRows.length,
      errorRows: errors.length
    },
    headerValidation
  };
};

const validateOzonHeaders = (actualHeaders: string[]) => {
  const mapping: Record<string, number> = {};
  const missingFields: string[] = [];
  const extraFields: string[] = [];
  
  // Create mapping for detected headers
  actualHeaders.forEach((header, index) => {
    const cleanHeader = header.trim();
    if (OZON_FIELD_MAPPING[cleanHeader]) {
      mapping[OZON_FIELD_MAPPING[cleanHeader]] = index;
    } else if (cleanHeader) {
      extraFields.push(cleanHeader);
    }
  });
  
  // Check for missing required fields
  EXPECTED_FIELDS.forEach(russianField => {
    const englishField = OZON_FIELD_MAPPING[russianField];
    if (!mapping[englishField]) {
      missingFields.push(russianField);
    }
  });
  
  const isValid = missingFields.length === 0;
  
  return {
    isValid,
    missingFields,
    extraFields,
    mapping
  };
};

const mapRowToOzonData = (row: any[], fieldMapping: Record<string, number>, headers: string[]): OzonDataRow | null => {
  const getValue = (fieldName: string): any => {
    const index = fieldMapping[fieldName];
    return index !== undefined && index < row.length ? row[index] : null;
  };

  const parseNumber = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const numStr = String(value).trim().replace(/,/g, '.').replace(/[^\d.-]/g, '');
    const parsed = parseFloat(numStr);
    return isNaN(parsed) ? null : parsed;
  };

  const parseInt32 = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const numStr = String(value).trim().replace(/[^\d-]/g, '');
    const parsed = parseInt(numStr);
    return isNaN(parsed) ? null : parsed;
  };

  const parseDate = (value: any): string | null => {
    if (!value) return null;
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  // Validate required field
  const productName = String(getValue('product_name') || '').trim();
  if (!productName) {
    throw new Error('Product name is required');
  }

  return {
    product_name: productName,
    product_link: String(getValue('product_link') || '').trim() || null,
    seller: String(getValue('seller') || '').trim() || null,
    brand: String(getValue('brand') || '').trim() || null,
    category_level1: String(getValue('category_level1') || '').trim() || null,
    category_level3: String(getValue('category_level3') || '').trim() || null,
    product_flag: String(getValue('product_flag') || '').trim() || null,
    
    // Financial metrics
    ordered_sum: parseNumber(getValue('ordered_sum')),
    turnover_dynamic: parseNumber(getValue('turnover_dynamic')),
    ordered_quantity: parseInt32(getValue('ordered_quantity')),
    average_price: parseNumber(getValue('average_price')),
    minimum_price: parseNumber(getValue('minimum_price')),
    buyout_share: parseNumber(getValue('buyout_share')),
    lost_sales: parseNumber(getValue('lost_sales')),
    
    // Inventory and logistics
    days_no_stock: parseInt32(getValue('days_no_stock')),
    average_delivery_hours: parseNumber(getValue('average_delivery_hours')),
    average_daily_revenue: parseNumber(getValue('average_daily_revenue')),
    average_daily_sales_pcs: parseNumber(getValue('average_daily_sales_pcs')),
    ending_stock: parseInt32(getValue('ending_stock')),
    work_scheme: String(getValue('work_scheme') || '').trim() || null,
    volume_liters: parseNumber(getValue('volume_liters')),
    
    // Marketing metrics
    views: parseInt32(getValue('views')),
    views_search: parseInt32(getValue('views_search')),
    views_card: parseInt32(getValue('views_card')),
    view_to_cart: parseNumber(getValue('view_to_cart')),
    search_to_cart: parseNumber(getValue('search_to_cart')),
    description_to_cart: parseNumber(getValue('description_to_cart')),
    
    // Promotion metrics
    discount_promo: parseNumber(getValue('discount_promo')),
    revenue_promo: parseNumber(getValue('revenue_promo')),
    days_promo: parseInt32(getValue('days_promo')),
    days_boost: parseInt32(getValue('days_boost')),
    ads_share: parseNumber(getValue('ads_share')),
    
    // Dates
    card_date: parseDate(getValue('card_date')),
    import_date: new Date().toISOString().split('T')[0]
  };
};

export const validateOzonRow = (row: OzonDataRow): string[] => {
  const errors: string[] = [];
  
  if (!row.product_name || row.product_name.trim() === '') {
    errors.push('Product name is required');
  }
  
  if (row.ordered_sum !== null && row.ordered_sum < 0) {
    errors.push('Ordered sum cannot be negative');
  }
  
  if (row.ordered_quantity !== null && row.ordered_quantity < 0) {
    errors.push('Ordered quantity cannot be negative');
  }
  
  return errors;
};