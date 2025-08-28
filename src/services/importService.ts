import { supabaseAdmin } from '../lib/supabase';
import { ParsedData } from '../utils/csvParser';

export interface ImportResult {
  success: boolean;
  recordsImported: number;
  errors: string[];
  message: string;
}

export interface ImportOptions {
  batchSize?: number;
  validateBeforeImport?: boolean;
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Core import functionality - PROTECTED FROM UI CHANGES
 * This service handles all database import operations
 * DO NOT MODIFY WITHOUT CAREFUL CONSIDERATION
 */
export class ImportService {
  
  /**
   * Import parsed CSV/Excel data to products table
   * Uses service role to bypass RLS policies
   * 
   * @param data - Parsed data from CSV/Excel file
   * @param options - Import configuration options
   * @returns Promise<ImportResult>
   */
  static async importToProducts(
    data: ParsedData, 
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    
    const {
      batchSize = 100,
      validateBeforeImport = true,
      onProgress
    } = options;

    try {
      // Validation phase
      if (validateBeforeImport) {
        onProgress?.(10, 'Validating data...');
        
        if (!data.rows || data.rows.length === 0) {
          return {
            success: false,
            recordsImported: 0,
            errors: ['No valid rows to import'],
            message: 'Import failed: No data to process'
          };
        }

        // Check for required fields
        const missingData = data.rows.filter(row => !row.name || !row.category);
        if (missingData.length > 0) {
          console.warn(`${missingData.length} rows missing required fields`);
        }
      }

      onProgress?.(25, 'Preparing database connection...');

      // Import phase - use service role for RLS bypass
      const { data: insertedData, error } = await supabaseAdmin
        .from('products')
        .insert(data.rows)
        .select('id');

      onProgress?.(90, 'Finalizing import...');

      if (error) {
        console.error('Database import error:', error);
        return {
          success: false,
          recordsImported: 0,
          errors: [error.message],
          message: `Import failed: ${error.message}`
        };
      }

      onProgress?.(100, 'Import completed successfully');

      const recordsImported = insertedData?.length || 0;
      
      return {
        success: true,
        recordsImported,
        errors: [],
        message: `Successfully imported ${recordsImported} products to database`
      };

    } catch (error) {
      console.error('Import service error:', error);
      
      return {
        success: false,
        recordsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Import failed due to unexpected error'
      };
    }
  }

  /**
   * Batch import for large datasets
   * Splits data into smaller chunks to avoid timeout
   */
  static async importInBatches(
    data: ParsedData,
    batchSize: number = 100,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ImportResult> {
    
    const batches = [];
    for (let i = 0; i < data.rows.length; i += batchSize) {
      batches.push(data.rows.slice(i, i + batchSize));
    }

    let totalImported = 0;
    const allErrors: string[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const progress = Math.round(((i + 1) / batches.length) * 100);
      
      onProgress?.(progress, `Importing batch ${i + 1} of ${batches.length}...`);

      try {
        const { data: insertedData, error } = await supabaseAdmin
          .from('products')
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
        ? `Successfully imported ${totalImported} products in ${batches.length} batches`
        : `Imported ${totalImported} products with ${allErrors.length} batch errors`
    };
  }

  /**
   * Validate database connection and permissions
   * Call this before attempting imports
   */
  static async validateConnection(): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('products')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }
}