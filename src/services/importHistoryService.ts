import { supabase } from '../lib/supabase';

export interface ImportHistoryRecord {
  id?: string;
  filename: string;
  file_hash: string;
  file_size: number;
  records_count: number;
  date_range_start: string | null;
  date_range_end: string | null;
  validation_status: 'valid' | 'invalid' | 'warning';
  validation_errors: string[];
  import_status: 'pending' | 'success' | 'error' | 'partial';
  error_message?: string;
  import_duration_ms?: number;
  created_at?: string;
}

export interface ImportSummary {
  totalFiles: number;
  successfulImports: number;
  failedImports: number;
  duplicatesSkipped: number;
  totalRecordsImported: number;
  totalDuration: number;
}

export class ImportHistoryService {
  async checkDuplicateFile(fileHash: string): Promise<ImportHistoryRecord | null> {
    const { data, error } = await supabase
      .from('ozon_import_history')
      .select('*')
      .eq('file_hash', fileHash)
      .eq('import_status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking duplicate file:', error);
      return null;
    }

    return data;
  }

  async createImportRecord(record: Omit<ImportHistoryRecord, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('ozon_import_history')
      .insert(record)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating import record:', error);
      return null;
    }

    return data?.id || null;
  }

  async updateImportRecord(id: string, updates: Partial<ImportHistoryRecord>): Promise<boolean> {
    const { error } = await supabase
      .from('ozon_import_history')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating import record:', error);
      return false;
    }

    return true;
  }

  async getImportHistory(limit: number = 50): Promise<ImportHistoryRecord[]> {
    const { data, error } = await supabase
      .from('ozon_import_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching import history:', error);
      return [];
    }

    return data || [];
  }

  async getImportSummary(): Promise<ImportSummary> {
    const { data, error } = await supabase
      .from('ozon_import_history')
      .select('*');

    if (error) {
      console.error('Error fetching import summary:', error);
      return {
        totalFiles: 0,
        successfulImports: 0,
        failedImports: 0,
        duplicatesSkipped: 0,
        totalRecordsImported: 0,
        totalDuration: 0
      };
    }

    const records = data || [];

    return {
      totalFiles: records.length,
      successfulImports: records.filter(r => r.import_status === 'success').length,
      failedImports: records.filter(r => r.import_status === 'error').length,
      duplicatesSkipped: 0,
      totalRecordsImported: records.reduce((sum, r) => sum + (r.records_count || 0), 0),
      totalDuration: records.reduce((sum, r) => sum + (r.import_duration_ms || 0), 0)
    };
  }

  async getDateRangeCoverage(): Promise<{ start: string | null; end: string | null }> {
    const { data, error } = await supabase
      .from('ozon_import_history')
      .select('date_range_start, date_range_end')
      .eq('import_status', 'success')
      .not('date_range_start', 'is', null)
      .not('date_range_end', 'is', null);

    if (error || !data || data.length === 0) {
      return { start: null, end: null };
    }

    const allDates = data.flatMap(record => [
      record.date_range_start,
      record.date_range_end
    ]).filter(d => d).sort();

    return {
      start: allDates[0] || null,
      end: allDates[allDates.length - 1] || null
    };
  }

  async deleteImportRecord(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('ozon_import_history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting import record:', error);
      return false;
    }

    return true;
  }
}

export const importHistoryService = new ImportHistoryService();
