import { supabase, supabaseAdmin } from '../../../lib/supabase';
import { importHistoryService } from './importHistoryService';

export interface ReconciliationReport {
  totalHistoryRecords: number;
  totalActualRecords: number;
  discrepancy: number;
  updatedRecords: number;
  errors: string[];
}

export class ReconciliationService {
  async reconcileImportHistory(): Promise<ReconciliationReport> {
    const report: ReconciliationReport = {
      totalHistoryRecords: 0,
      totalActualRecords: 0,
      discrepancy: 0,
      updatedRecords: 0,
      errors: []
    };

    try {
      const { count: actualCount, error: countError } = await supabase
        .from('ozon_data')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        report.errors.push(`Failed to count ozon_data: ${countError.message}`);
        return report;
      }

      report.totalActualRecords = actualCount || 0;

      const { data: historyRecords, error: historyError } = await supabase
        .from('ozon_import_history')
        .select('*')
        .in('import_status', ['success', 'partial']);

      if (historyError) {
        report.errors.push(`Failed to fetch import history: ${historyError.message}`);
        return report;
      }

      if (!historyRecords || historyRecords.length === 0) {
        console.log('[Reconciliation] No import history records found');
        return report;
      }

      const totalFromHistory = historyRecords.reduce(
        (sum, record) => sum + (record.actual_records_imported || record.records_count || 0),
        0
      );

      report.totalHistoryRecords = totalFromHistory;
      report.discrepancy = Math.abs(totalFromHistory - report.totalActualRecords);

      if (report.discrepancy === 0) {
        console.log('[Reconciliation] No discrepancies found. Data is in sync.');
        return report;
      }

      console.log(`[Reconciliation] Discrepancy detected: ${report.discrepancy} records`);
      console.log(`[Reconciliation] History claims: ${totalFromHistory}, Actual: ${report.totalActualRecords}`);

      for (const record of historyRecords) {
        if (record.data_purged_at) {
          continue;
        }

        const expectedCount = record.actual_records_imported || record.records_count || 0;

        let actualCountForImport = 0;
        if (record.date_range_start && record.date_range_end) {
          const { count, error } = await supabase
            .from('ozon_data')
            .select('*', { count: 'exact', head: true })
            .gte('card_date', record.date_range_start)
            .lte('card_date', record.date_range_end);

          if (!error) {
            actualCountForImport = count || 0;
          }
        }

        if (expectedCount !== actualCountForImport) {
          console.log(`[Reconciliation] Updating record ${record.id}: ${expectedCount} -> ${actualCountForImport}`);

          const { error: updateError } = await supabaseAdmin
            .from('ozon_import_history')
            .update({ actual_records_imported: actualCountForImport })
            .eq('id', record.id);

          if (updateError) {
            report.errors.push(`Failed to update record ${record.id}: ${updateError.message}`);
          } else {
            report.updatedRecords++;
          }
        }
      }

      console.log(`[Reconciliation] Updated ${report.updatedRecords} records`);

      return report;
    } catch (error) {
      report.errors.push(
        error instanceof Error ? error.message : 'Unknown error during reconciliation'
      );
      return report;
    }
  }

  async validateImportIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const { count: ozonDataCount } = await supabase
        .from('ozon_data')
        .select('*', { count: 'exact', head: true });

      const { data: historyRecords } = await supabase
        .from('ozon_import_history')
        .select('*')
        .in('import_status', ['success', 'partial'])
        .is('data_purged_at', null);

      if (!historyRecords) {
        issues.push('Could not fetch import history records');
        return { isValid: false, issues };
      }

      const totalFromHistory = historyRecords.reduce(
        (sum, record) => sum + (record.actual_records_imported || 0),
        0
      );

      const actualCount = ozonDataCount || 0;

      if (totalFromHistory !== actualCount) {
        issues.push(
          `Data mismatch: Import history claims ${totalFromHistory} records, but ozon_data contains ${actualCount} records (difference: ${Math.abs(totalFromHistory - actualCount)})`
        );
      }

      for (const record of historyRecords) {
        const totalParsed = record.records_count || 0;
        const imported = record.actual_records_imported || 0;
        const duplicates = record.records_skipped_duplicates || 0;
        const failed = record.records_failed || 0;

        const accountedFor = imported + duplicates + failed;

        if (accountedFor > totalParsed) {
          issues.push(
            `Record ${record.id} (${record.filename}): Accounting error - ${accountedFor} accounted for but only ${totalParsed} parsed`
          );
        }
      }

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push(
        error instanceof Error ? error.message : 'Unknown error during validation'
      );
      return { isValid: false, issues };
    }
  }
}

export const reconciliationService = new ReconciliationService();
