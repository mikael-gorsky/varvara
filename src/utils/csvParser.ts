import * as XLSX from 'xlsx';
import { Database } from '../lib/supabase';

export type ProductRow = Database['public']['Tables']['products']['Insert'];

export interface ParsedData {
  headers: string[];
  rows: ProductRow[];
  errors: string[];
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };
}

export const parseCSVFile = async (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('No data found');
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        const result = processRawData(jsonData);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsBinaryString(file);
  });
};

export const parseExcelFile = async (file: File): Promise<ParsedData> => {
  return parseCSVFile(file); // Same logic works for both
};

const processRawData = (rawData: any[][]): ParsedData => {
  if (rawData.length === 0) {
    return {
      headers: [],
      rows: [],
      errors: ['File is empty'],
      stats: { totalRows: 0, validRows: 0, errorRows: 0 }
    };
  }

  const headers = rawData[0].map(h => String(h || '').trim());
  const dataRows = rawData.slice(1);
  
  const expectedHeaders = ['id', 'name', 'category', 'price', 'quantity', 'supplier', 'date'];
  const headerMap = mapHeaders(headers, expectedHeaders);
  
  const errors: string[] = [];
  const validRows: ProductRow[] = [];
  
  dataRows.forEach((row, index) => {
    try {
      const mappedRow = mapRowToProduct(row, headerMap, headers);
      if (mappedRow) {
        validRows.push(mappedRow);
      } else {
        errors.push(`Row ${index + 2}: Empty or invalid row`);
      }
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    headers,
    rows: validRows,
    errors,
    stats: {
      totalRows: dataRows.length,
      validRows: validRows.length,
      errorRows: errors.length
    }
  };
};

const mapHeaders = (actualHeaders: string[], expectedHeaders: string[]): Record<string, number> => {
  const map: Record<string, number> = {};
  
  // Log headers for debugging
  console.log('Detected headers:', actualHeaders);
  
  expectedHeaders.forEach(expected => {
    const index = actualHeaders.findIndex(actual => {
      const actualLower = String(actual || '').toLowerCase().trim();
      const expectedLower = expected.toLowerCase();
      
      // Direct match
      if (actualLower === expectedLower) return true;
      
      // Partial matches for common variations
      if (expectedLower === 'name' && (actualLower.includes('name') || actualLower.includes('наименование') || actualLower.includes('название'))) return true;
      if (expectedLower === 'category' && (actualLower.includes('category') || actualLower.includes('категория') || actualLower.includes('тип'))) return true;
      if (expectedLower === 'price' && (actualLower.includes('price') || actualLower.includes('цена') || actualLower.includes('стоимость'))) return true;
      if (expectedLower === 'quantity' && (actualLower.includes('quantity') || actualLower.includes('количество') || actualLower.includes('qty'))) return true;
      if (expectedLower === 'supplier' && (actualLower.includes('supplier') || actualLower.includes('поставщик') || actualLower.includes('vendor'))) return true;
      if (expectedLower === 'date' && (actualLower.includes('date') || actualLower.includes('дата'))) return true;
      if (expectedLower === 'id' && (actualLower.includes('id') || actualLower === 'номер' || actualLower === '№')) return true;
      
      return false;
    }
    );
    if (index !== -1) {
      map[expected] = index;
    }
  });
  
  console.log('Header mapping:', map);
  return map;
};

const mapRowToProduct = (row: any[], headerMap: Record<string, number>, headers: string[]): ProductRow | null => {
  // Skip empty rows
  if (!row || row.length === 0 || row.every(cell => !cell || String(cell).trim() === '')) {
    return null;
  }

  console.log('Processing row:', row);
  console.log('Using header map:', headerMap);

  const getValue = (key: string): any => {
    const index = headerMap[key];
    const value = index !== undefined && index < row.length ? row[index] : null;
    console.log(`${key} (index ${index}):`, value);
    return value;
  };

  // Try to get name from any available column if mapping failed
  let name = String(getValue('name') || '').trim();
  let category = String(getValue('category') || '').trim();
  
  // If no mapped name column, try first non-empty column
  if (!name && row.length > 0) {
    for (let i = 0; i < row.length; i++) {
      const cellValue = String(row[i] || '').trim();
      if (cellValue && cellValue !== 'undefined' && cellValue !== 'null') {
        name = cellValue;
        break;
      }
    }
  }
  
  // If no mapped category, try second column or use a default
  if (!category && row.length > 1) {
    const secondCol = String(row[1] || '').trim();
    if (secondCol && secondCol !== 'undefined' && secondCol !== 'null') {
      category = secondCol;
    } else {
      category = 'General'; // Default category
    }
  } else if (!category) {
    category = 'General';
  }
  
  if (!name || !category) {
    throw new Error(`Name and category are required. Got name: "${name}", category: "${category}"`);
  }

  const price = parseFloat(String(getValue('price') || '0').replace(',', '.'));
  const quantity = parseInt(String(getValue('quantity') || '0'));
  
  let importDate: string | null = null;
  const dateValue = getValue('date');
  if (dateValue) {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        importDate = date.toISOString().split('T')[0];
      }
    } catch {
      // Invalid date, keep as null
    }
  }

  return {
    external_id: String(getValue('id') || ''),
    name,
    category,
    price: isNaN(price) ? null : price,
    quantity: isNaN(quantity) ? null : quantity,
    supplier: String(getValue('supplier') || '').trim() || null,
    import_date: importDate
  };
};

export const validateProductRow = (row: ProductRow): string[] => {
  const errors: string[] = [];
  
  if (!row.name || row.name.trim() === '') {
    errors.push('Product name is required');
  }
  
  if (!row.category || row.category.trim() === '') {
    errors.push('Category is required');
  }
  
  if (row.price !== null && row.price < 0) {
    errors.push('Price cannot be negative');
  }
  
  if (row.quantity !== null && row.quantity < 0) {
    errors.push('Quantity cannot be negative');
  }
  
  return errors;
};