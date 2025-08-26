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

  // Use row 5 (index 4) as headers, all subsequent rows as data
  const headers = rawData.length > 4 ? rawData[4].map((h, i) => String(h || `column_${i + 1}`)) : [];
  const dataRows = rawData.slice(5); // Start from row 6 (index 5) for actual data
  
  const expectedHeaders = ['id', 'name', 'category', 'price', 'quantity', 'supplier', 'date'];
  const headerMap = mapHeaders(headers, expectedHeaders);
  
  const errors: string[] = [];
  const validRows: ProductRow[] = [];
  
  dataRows.forEach((row, index) => {
    try {
      const mappedRow = mapRowToProduct(row, headerMap, headers);
      validRows.push(mappedRow);
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
  
  // Map ALL headers directly by index - no filtering or judgment
  actualHeaders.forEach((header, index) => {
    const cleanHeader = String(header || `column_${index + 1}`).trim();
    map[`col_${index}`] = index;
  });
  
  console.log('Header mapping:', map);
  return map;
};

const mapRowToProduct = (row: any[], headerMap: Record<string, number>, headers: string[]): ProductRow | null => {
  // Process ALL rows from ERP system - map using ACTUAL column headers from row 5

  const getValue = (colIndex: number): any => {
    const index = colIndex;
    const value = index !== undefined && index < row.length ? row[index] : null;
    return value;
  };

  // Map ALL 33 columns using the actual headers from your ERP system
  const productData: ProductRow = {
    // Map using actual column positions (0-32 for 33 columns)
    name: String(getValue(0) || '').trim() || `Item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category: String(getValue(1) || 'General').trim(),
    
    // Map all other columns to available database fields
    external_id: String(getValue(2) || ''),
    price: parseFloat(String(getValue(3) || '0').replace(',', '.')),
    quantity: parseInt(String(getValue(4) || '0')),
    supplier: String(getValue(5) || '').trim() || null,
    
    // Extended ERP fields - map remaining columns
    sku: String(getValue(6) || '').trim() || null,
    barcode: String(getValue(7) || '').trim() || null,
    subcategory: String(getValue(8) || '').trim() || null,
    brand: String(getValue(9) || '').trim() || null,
    model: String(getValue(10) || '').trim() || null,
    
    cost_price: parseFloat(String(getValue(11) || '0').replace(',', '.')) || null,
    wholesale_price: parseFloat(String(getValue(12) || '0').replace(',', '.')) || null,
    retail_price: parseFloat(String(getValue(13) || '0').replace(',', '.')) || null,
    margin_percent: parseFloat(String(getValue(14) || '0').replace(',', '.')) || null,
    tax_rate: parseFloat(String(getValue(15) || '0').replace(',', '.')) || null,
    
    min_stock: parseInt(String(getValue(16) || '0')) || null,
    max_stock: parseInt(String(getValue(17) || '0')) || null,
    reorder_point: parseInt(String(getValue(18) || '0')) || null,
    warehouse_location: String(getValue(19) || '').trim() || null,
    weight: parseFloat(String(getValue(20) || '0').replace(',', '.')) || null,
    dimensions: String(getValue(21) || '').trim() || null,
    
    supplier_sku: String(getValue(22) || '').trim() || null,
    supplier_price: parseFloat(String(getValue(23) || '0').replace(',', '.')) || null,
    lead_time_days: parseInt(String(getValue(24) || '0')) || null,
    supplier_contact: String(getValue(25) || '').trim() || null,
    
    description: String(getValue(26) || '').trim() || null,
    short_description: String(getValue(27) || '').trim() || null,
    sales_rank: parseInt(String(getValue(28) || '0')) || null,
    sales_velocity: parseFloat(String(getValue(29) || '0').replace(',', '.')) || null,
    
    status: String(getValue(30) || 'active').trim(),
    is_active: Boolean(getValue(31)) || true,
    
    // Custom fields for remaining columns
    custom_field_1: String(getValue(32) || '').trim() || null,
    custom_field_2: String(getValue(33) || '').trim() || null,
    custom_field_3: String(getValue(34) || '').trim() || null,
    custom_field_4: String(getValue(35) || '').trim() || null,
    custom_field_5: String(getValue(36) || '').trim() || null,
  };
  
  // Handle date field if present
  const dateValue = getValue(37); // Assuming date might be in column 38
  if (dateValue) {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        productData.import_date = date.toISOString().split('T')[0];
      }
    } catch {
      productData.import_date = null;
    }
  }
  
  return productData;
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