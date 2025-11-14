import { ozonImportService, ImportResult } from './ozonImportService';
import { importHistoryService, ImportHistoryRecord } from './importHistoryService';
import { fileHashService } from './fileHashService';
import { parseOzonFile, OzonParsedData } from './ozonParser';

export interface BatchImportProgress {
  currentFile: string;
  currentFileIndex: number;
  totalFiles: number;
  currentFileProgress: number;
  totalRecordsImported: number;
  filesCompleted: number;
  filesSkipped: number;
  filesFailed: number;
}

export interface BatchImportResult {
  success: boolean;
  filesProcessed: number;
  filesSkipped: number;
  filesFailed: number;
  totalRecordsImported: number;
  totalDuration: number;
  errors: Array<{
    fileName: string;
    error: string;
  }>;
}

export type ProgressCallback = (progress: BatchImportProgress) => void;

export class BatchImportService {
  async importFiles(
    files: File[],
    options: {
      skipDuplicates?: boolean;
      onProgress?: ProgressCallback;
    } = {}
  ): Promise<BatchImportResult> {
    const startTime = Date.now();
    const result: BatchImportResult = {
      success: true,
      filesProcessed: 0,
      filesSkipped: 0,
      filesFailed: 0,
      totalRecordsImported: 0,
      totalDuration: 0,
      errors: []
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (options.onProgress) {
        options.onProgress({
          currentFile: file.name,
          currentFileIndex: i,
          totalFiles: files.length,
          currentFileProgress: 0,
          totalRecordsImported: result.totalRecordsImported,
          filesCompleted: result.filesProcessed,
          filesSkipped: result.filesSkipped,
          filesFailed: result.filesFailed
        });
      }

      try {
        const fileStartTime = Date.now();
        console.log(`[BatchImport] Starting import for file: ${file.name}`);

        const hashInfo = await fileHashService.getFileInfo(file);
        console.log(`[BatchImport] File hash: ${hashInfo.hash}`);

        if (options.skipDuplicates) {
          const duplicate = await importHistoryService.checkDuplicateFile(hashInfo.hash);
          if (duplicate) {
            console.log(`[BatchImport] Skipping duplicate file by hash: ${file.name}`);
            result.filesSkipped++;
            continue;
          }
        }

        if (options.onProgress) {
          options.onProgress({
            currentFile: file.name,
            currentFileIndex: i,
            totalFiles: files.length,
            currentFileProgress: 30,
            totalRecordsImported: result.totalRecordsImported,
            filesCompleted: result.filesProcessed,
            filesSkipped: result.filesSkipped,
            filesFailed: result.filesFailed
          });
        }

        const parsedData = await parseOzonFile(file);
        console.log(`[BatchImport] Parsed ${parsedData.rows.length} rows from ${file.name}`);
        console.log(`[BatchImport] Validation status:`, parsedData.headerValidation);
        console.log(`[BatchImport] Errors:`, parsedData.errors);

        if (options.onProgress) {
          options.onProgress({
            currentFile: file.name,
            currentFileIndex: i,
            totalFiles: files.length,
            currentFileProgress: 60,
            totalRecordsImported: result.totalRecordsImported,
            filesCompleted: result.filesProcessed,
            filesSkipped: result.filesSkipped,
            filesFailed: result.filesFailed
          });
        }

        const validationStatus = this.getValidationStatus(parsedData);
        console.log(`[BatchImport] Validation status for ${file.name}: ${validationStatus}`);

        if (validationStatus === 'invalid') {
          console.error(`[BatchImport] File ${file.name} failed validation`);
          await this.createFailedImportRecord(file, hashInfo.hash, parsedData, 'Validation failed');
          result.filesFailed++;
          result.errors.push({
            fileName: file.name,
            error: 'File validation failed: ' + parsedData.errors.join(', ')
          });
          continue;
        }

        let importResult: ImportResult;
        if (parsedData.rows.length > 0) {
          console.log(`[BatchImport] Importing ${parsedData.rows.length} rows to database...`);

          importResult = await ozonImportService.importDataWithReport(
            parsedData.rows,
            parsedData.metadata.dateOfReport,
            parsedData.metadata.reportedDays
          );
          console.log(`[BatchImport] Import result:`, importResult);
        } else {
          console.warn(`[BatchImport] No rows to import from ${file.name}`);
          importResult = {
            successCount: 0,
            failureCount: 0,
            duplicateCount: 0
          };
        }

        const fileDuration = Date.now() - fileStartTime;

        await this.createSuccessImportRecord(file, hashInfo.hash, parsedData, fileDuration, importResult);

        result.filesProcessed++;
        result.totalRecordsImported += importResult.successCount;

        if (options.onProgress) {
          options.onProgress({
            currentFile: file.name,
            currentFileIndex: i,
            totalFiles: files.length,
            currentFileProgress: 100,
            totalRecordsImported: result.totalRecordsImported,
            filesCompleted: result.filesProcessed,
            filesSkipped: result.filesSkipped,
            filesFailed: result.filesFailed
          });
        }
      } catch (error) {
        console.error(`[BatchImport] Error processing ${file.name}:`, error);
        result.filesFailed++;
        result.errors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    result.totalDuration = Date.now() - startTime;
    result.success = result.filesFailed === 0;

    return result;
  }

  private getValidationStatus(parsedData: OzonParsedData): 'valid' | 'invalid' | 'warning' {
    if (!parsedData.headerValidation.isValid || parsedData.stats.validRows === 0) {
      return 'invalid';
    }

    if (parsedData.errors.length > 0 || parsedData.stats.invalidRows > 0) {
      return 'warning';
    }

    return 'valid';
  }

  private async createSuccessImportRecord(
    file: File,
    fileHash: string,
    parsedData: OzonParsedData,
    duration: number,
    importResult: ImportResult
  ): Promise<void> {
    const importStatus = importResult.failureCount > 0 ? 'partial' : 'success';

    const record: Omit<ImportHistoryRecord, 'id' | 'created_at'> = {
      filename: file.name,
      file_hash: fileHash,
      file_size: file.size,
      records_count: parsedData.stats.validRows,
      actual_records_imported: importResult.successCount,
      records_skipped_duplicates: importResult.duplicateCount,
      records_failed: importResult.failureCount,
      date_range_start: parsedData.metadata.dateRangeStart,
      date_range_end: parsedData.metadata.dateRangeEnd,
      validation_status: this.getValidationStatus(parsedData),
      validation_errors: parsedData.errors,
      import_status: importStatus,
      import_duration_ms: duration
    };

    await importHistoryService.createImportRecord(record);
  }

  private async createFailedImportRecord(
    file: File,
    fileHash: string,
    parsedData: OzonParsedData,
    errorMessage: string
  ): Promise<void> {
    const record: Omit<ImportHistoryRecord, 'id' | 'created_at'> = {
      filename: file.name,
      file_hash: fileHash,
      file_size: file.size,
      records_count: 0,
      actual_records_imported: 0,
      records_skipped_duplicates: 0,
      records_failed: 0,
      date_range_start: parsedData.metadata.dateRangeStart,
      date_range_end: parsedData.metadata.dateRangeEnd,
      validation_status: 'invalid',
      validation_errors: parsedData.errors,
      import_status: 'error',
      error_message: errorMessage
    };

    await importHistoryService.createImportRecord(record);
  }
}

export const batchImportService = new BatchImportService();
