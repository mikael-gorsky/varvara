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
  
  expectedHeaders.forEach(expected => {
    const index = actualHeaders.findIndex(actual => 
      actual.toLowerCase().includes(expected.toLowerCase()) ||
      expected.toLowerCase().includes(actual.toLowerCase())
    );
    if (index !== -1) {
      map[expected] = index;
    }
  });
  
  return map;
};

const mapRowToProduct = (row: any[], headerMap: Record<string, number>, headers: string[]): ProductRow | null => {
  // Skip empty rows
  if (row.every(cell => !cell || String(cell).trim() === '')) {
    return null;
  }

  const getValue = (key: string): any => {
    const index = headerMap[key];
    return index !== undefined ? row[index] : null;
  };

  const name = String(getValue('name') || '').trim();
  const category = String(getValue('category') || '').trim();
  
  if (!name || !category) {
    throw new Error('Name and category are required');
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