import { supabaseAdmin } from '../lib/supabase';
import { OzonParsedData, OzonDataRow } from '../utils/ozonParser';

export interface OzonImportResult {
  success: boolean;
  recordsImported: number;
  errors: string[];
  message: string;
  headerValidation?: {
    isValid: boolean;
    missingFields: string[];
    extraFields: string[];
  };
}

export interface OzonImportOptions {
  batchSize?: number;
  validateBeforeImport?: boolean;
  onProgress?: (progress: number, message: string) => void;
}

/**
 * OZON-specific import service for ozon_data table
 * Handles OZON marketplace data imports with proper field mapping
 */
export class OzonImportService {
  
  /**
   * Import parsed OZON data to ozon_data table
   * Uses service role to bypass RLS policies
   */
  static async importToOzonData(
    data: OzonParsedData, 
    options: OzonImportOptions = {}
  ): Promise<OzonImportResult> {
    
    const {
      batchSize = 100,
      validateBeforeImport = true,
      onProgress
    } = options;

    try {
      // Header validation
      onProgress?.(5, 'Validating OZON file format...');
      
      if (!data.headerValidation.isValid) {
        return {
          success: false,
          recordsImported: 0,
          errors: [
            'Invalid OZON file format',
            `Missing required fields: ${data.headerValidation.missingFields.join(', ')}`,
            `Extra fields found: ${data.headerValidation.extraFields.join(', ')}`
          ],
          message: 'Import failed: File does not match expected OZON export format',
          headerValidation: data.headerValidation
        };
      }

      // Data validation
      if (validateBeforeImport) {
        onProgress?.(10, 'Validating data rows...');
        
        if (!data.rows || data.rows.length === 0) {
          return {
            success: false,
            recordsImported: 0,
            errors: ['No valid data rows found in file'],
            message: 'Import failed: No data to process',
            headerValidation: data.headerValidation
          };
        }

        // Check for rows with missing required fields
        const invalidRows = data.rows.filter(row => !row.product_name || row.product_name.trim() === '');
        if (invalidRows.length > 0) {
          console.warn(`${invalidRows.length} rows missing required product names`);
        }
      }

      onProgress?.(25, 'Connecting to database...');

      // Test connection to ozon_data table
      const { error: testError } = await supabaseAdmin
        .from('ozon_data')
        .select('id')
        .limit(1);

      if (testError) {
        return {
          success: false,
          recordsImported: 0,
          errors: [`Database connection failed: ${testError.message}`],
          message: 'Import failed: Cannot connect to ozon_data table',
          headerValidation: data.headerValidation
        };
      }

      onProgress?.(40, `Importing ${data.rows.length} records...`);

      // Import in batches if dataset is large
      if (data.rows.length > batchSize) {
        return await this.importInBatches(data.rows, batchSize, onProgress);
      }

      // Direct import for smaller datasets
      const { data: insertedData, error } = await supabaseAdmin
        .from('ozon_data')
        .insert(data.rows)
        .select('id');

      onProgress?.(90, 'Finalizing import...');

      if (error) {
        console.error('OZON import error:', error);
        return {
          success: false,
          recordsImported: 0,
          errors: [error.message],
          message: `Import failed: ${error.message}`,
          headerValidation: data.headerValidation
        };
      }

      onProgress?.(100, 'Import completed successfully');

      const recordsImported = insertedData?.length || 0;
      
      return {
        success: true,
        recordsImported,
        errors: data.errors, // Include any parsing warnings
        message: `Successfully imported ${recordsImported} OZON records`,
        headerValidation: data.headerValidation
      };

    } catch (error) {
      console.error('OZON import service error:', error);
      
      return {
        success: false,
        recordsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Import failed due to unexpected error',
        headerValidation: data.headerValidation
      };
    }
  }

  /**
   * Batch import for large OZON datasets
   */
  private static async importInBatches(
    rows: OzonDataRow[],
    batchSize: number = 100,
    onProgress?: (progress: number, message: string) => void
  ): Promise<OzonImportResult> {
    
    const batches = [];
    for (let i = 0; i < rows.length; i += batchSize) {
      batches.push(rows.slice(i, i + batchSize));
    }

    let totalImported = 0;
    const allErrors: string[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const progress = 40 + Math.round(((i + 1) / batches.length) * 50); // 40-90%
      
      onProgress?.(progress, `Importing batch ${i + 1} of ${batches.length}...`);

      try {
        const { data: insertedData, error } = await supabaseAdmin
          .from('ozon_data')
          .insert(batch)
          .select('id');

        if (error) {
          allErrors.push(`Batch ${i + 1}: ${error.message}`);
        } else {
          totalImported += insertedData?.length || 0;
        }
      } catch (error) {
        allErrors.push(`Batch ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: allErrors.length === 0,
      recordsImported: totalImported,
      errors: allErrors,
      message: allErrors.length === 0 
        ? `Successfully imported ${totalImported} OZON records in ${batches.length} batches`
        : `Imported ${totalImported} records with ${allErrors.length} batch errors`,
      headerValidation: {
        isValid: true,
        missingFields: [],
        extraFields: [],
        mapping: {}
      }
    };
  }

  /**
   * Get statistics about imported OZON data
   */
  static async getOzonStats() {
    try {
      const { count, error } = await supabaseAdmin
        .from('ozon_data')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Failed to get OZON stats:', error);
        return null;
      }

      const { data: recentImports, error: recentError } = await supabaseAdmin
        .from('ozon_data')
        .select('import_date, seller, category_level1')
        .order('created_at', { ascending: false })
        .limit(100);

      if (recentError) {
        console.error('Failed to get recent imports:', recentError);
      }

      const uniqueSellers = new Set(recentImports?.map(r => r.seller).filter(Boolean)).size;
      const uniqueCategories = new Set(recentImports?.map(r => r.category_level1).filter(Boolean)).size;
      const latestImport = recentImports?.[0]?.import_date;

      return {
        total_records: count || 0,
        unique_sellers: uniqueSellers,
        unique_categories: uniqueCategories,
        latest_import: latestImport
      };
    } catch (error) {
      console.error('Get OZON stats error:', error);
      return null;
    }
  }

  /**
   * Clear all OZON data (for testing/reset)
   */
  static async clearAllData(): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('ozon_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Failed to clear OZON data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Clear OZON data error:', error);
      return false;
    }
  }
}