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

export interface OzonParsedData {
  data: OzonDataRow[];
  headers: string[];
  errors: string[];
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

export function parseOzonFile(csvData: string): OzonParsedData {
  const lines = csvData.split('\n').map(line => line.trim()).filter(line => line);
  const errors: string[] = [];
  const data: OzonDataRow[] = [];

  if (lines.length < 7) {
    return {
      data: [],
      headers: [],
      errors: ['File must contain at least 7 rows with headers and data']
    };
  }

  // Headers are in row 5 (index 4)
  const headerLine = lines[4];
  const headers = headerLine.split('\t').map(h => h.trim());
  
  console.log('Detected headers:', headers);
  
  // Validate required headers
  const validation = validateHeaders(headers);
  if (!validation.isValid) {
    return {
      data: [],
      headers,
      errors: validation.errors
    };
  }

  // Process data rows starting from row 7 (index 6)
  for (let i = 6; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip summary rows
    if (line.includes('Среднее значение по товарам') || line.includes('Итого')) {
      continue;
    }

    const values = line.split('\t').map(v => v.trim());
    
    if (values.length < headers.length) {
      continue; // Skip incomplete rows
    }

    try {
      const rowData = parseRowData(headers, values);
      if (rowData.product_name) {
        data.push(rowData);
      }
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    data,
    headers,
    errors
  };
}

function validateHeaders(headers: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required product name field
  const hasProductName = headers.some(h => 
    h.includes('Название товара') || 
    h.includes('товара') ||
    h.toLowerCase().includes('product')
  );

  if (!hasProductName) {
    errors.push('Missing required field: Название товара');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function parseRowData(headers: string[], values: string[]): OzonDataRow {
  const row: any = {};

  headers.forEach((header, index) => {
    const value = values[index] || '';
    const fieldName = getFieldName(header);
    
    if (fieldName) {
      row[fieldName] = parseValue(value, fieldName);
    }
  });

  return row;
}

function getFieldName(header: string): string | null {
  const mappings = EXPECTED_HEADERS as Record<string, string>;
  
  // Direct match
  if (mappings[header]) {
    return mappings[header];
  }

  // Partial matches for flexibility
  if (header.includes('Название товара') || header.includes('товара')) {
    return 'product_name';
  }
  if (header.includes('Ссылка') || header.includes('ссылка')) {
    return 'product_link';
  }
  if (header.includes('Продавец') || header.includes('продавец')) {
    return 'seller';
  }
  if (header.includes('Бренд') || header.includes('бренд')) {
    return 'brand';
  }
  if (header.includes('Категория 1') || header.includes('категория 1')) {
    return 'category_level1';
  }
  if (header.includes('Категория 3') || header.includes('категория 3')) {
    return 'category_level3';
  }
  if (header.includes('Признак') || header.includes('признак')) {
    return 'product_flag';
  }

  return null;
}

function parseValue(value: string, fieldName: string): any {
  if (!value || value === '-') {
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
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  }

  return value;
}