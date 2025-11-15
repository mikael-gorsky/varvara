import { supabase } from '../lib/supabase';
import { OzonFileMetadata } from '../modules/imports/ozon/ozonParser';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchType: 'none' | 'database' | 'cross_file';
  message: string;
  existingRecordCount?: number;
  existingImportDate?: string;
}

export class DuplicateDetectionService {
  async checkDatabaseDuplicate(metadata: OzonFileMetadata): Promise<DuplicateCheckResult> {
    if (!metadata.dateOfReport || !metadata.reportedDays) {
      return {
        isDuplicate: false,
        matchType: 'none',
        message: ''
      };
    }

    try {
      const { data, error } = await supabase
        .from('ozon_reports')
        .select('report_id, when_imported')
        .eq('date_of_report', metadata.dateOfReport)
        .eq('reported_days', metadata.reportedDays)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking database duplicates:', error);
        return {
          isDuplicate: false,
          matchType: 'none',
          message: ''
        };
      }

      if (data) {
        const { count } = await supabase
          .from('ozon_data')
          .select('*', { count: 'exact', head: true })
          .eq('report_id', data.report_id);

        return {
          isDuplicate: true,
          matchType: 'database',
          message: 'This report is already imported',
          existingRecordCount: count || 0,
          existingImportDate: data.when_imported
        };
      }

      return {
        isDuplicate: false,
        matchType: 'none',
        message: ''
      };
    } catch (error) {
      console.error('Error checking database duplicates:', error);
      return {
        isDuplicate: false,
        matchType: 'none',
        message: ''
      };
    }
  }

  detectCrossFileDuplicates(metadataList: OzonFileMetadata[]): Map<string, number[]> {
    const duplicateGroups = new Map<string, number[]>();

    metadataList.forEach((metadata, index) => {
      if (!metadata.dateOfReport || !metadata.reportedDays) {
        return;
      }

      const key = `${metadata.dateOfReport}|${metadata.reportedDays}`;

      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }

      duplicateGroups.get(key)!.push(index);
    });

    const duplicates = new Map<string, number[]>();
    duplicateGroups.forEach((indices, key) => {
      if (indices.length > 1) {
        duplicates.set(key, indices);
      }
    });

    return duplicates;
  }

  getMetadataKey(metadata: OzonFileMetadata): string | null {
    if (!metadata.dateOfReport || !metadata.reportedDays) {
      return null;
    }
    return `${metadata.dateOfReport}|${metadata.reportedDays}`;
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();
