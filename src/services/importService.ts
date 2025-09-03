import { supabaseAdmin } from '../lib/supabase';

export interface ImportResult {
  success: boolean;
  message: string;
  recordsProcessed?: number;
  errors?: string[];
}

export interface ImportStats {
  totalRecords: number;
  successfulImports: number;
  errors: string[];
}

export class ImportService {
  static async importProductsFromCSV(csvContent: string): Promise<ImportResult> {
    try {
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        return {
          success: false,
          message: 'No data found in CSV file'
        };
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dataLines = lines.slice(1);
      
      const products = [];
      const errors = [];

      for (let i = 0; i < dataLines.length; i++) {
        try {
          const values = dataLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length !== headers.length) {
            errors.push(`Line ${i + 2}: Column count mismatch`);
            continue;
          }

          const product: any = {};
          
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j].toLowerCase().replace(/\s+/g, '_');
            let value = values[j];
            
            // Convert numeric fields
            if (['price', 'cost_price', 'wholesale_price', 'retail_price'].includes(header)) {
              value = value ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 : 0;
            } else if (['quantity', 'min_stock', 'max_stock', 'reorder_point'].includes(header)) {
              value = value ? parseInt(value.replace(/[^0-9-]/g, ''), 10) || 0 : 0;
            }
            
            product[header] = value;
          }

          // Ensure required fields
          if (!product.name || !product.link) {
            errors.push(`Line ${i + 2}: Missing required fields (name, link)`);
            continue;
          }

          products.push(product);
        } catch (error) {
          errors.push(`Line ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (products.length === 0) {
        return {
          success: false,
          message: 'No valid products found in CSV',
          errors
        };
      }

      // Import to database
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert(products)
        .select();

      if (error) {
        return {
          success: false,
          message: `Database error: ${error.message}`,
          errors
        };
      }

      return {
        success: true,
        message: `Successfully imported ${products.length} products`,
        recordsProcessed: products.length,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getImportHistory(): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching import history:', error);
      return [];
    }
  }

  static async getImportStats(): Promise<ImportStats> {
    try {
      const { count, error } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return {
        totalRecords: count || 0,
        successfulImports: count || 0,
        errors: []
      };
    } catch (error) {
      return {
        totalRecords: 0,
        successfulImports: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  static async clearAllProducts(): Promise<ImportResult> {
    try {
      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        return {
          success: false,
          message: `Error clearing products: ${error.message}`
        };
      }

      return {
        success: true,
        message: 'All products cleared successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}