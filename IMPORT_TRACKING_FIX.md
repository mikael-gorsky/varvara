# Ozon Import History and Total Records Fix

## Problem Summary

The system had discrepancies between the `ozon_import_history` table and the actual `ozon_data` table:

1. **Import history stored parsed counts, not actual imported counts** - The `records_count` field tracked how many rows were parsed from files, not how many were successfully inserted into the database
2. **Total records calculated from history, not actual data** - The import status display summed up history records instead of querying the actual ozon_data table
3. **No tracking of failures or duplicates** - When rows failed to import or were skipped as duplicates, this wasn't tracked
4. **Data purges weren't synchronized** - When clearing ozon_data, the import history wasn't updated to reflect zero actual records

## Solution Implemented

### 1. Database Schema Enhancement (Migration: 20251015000000)

Added four new columns to `ozon_import_history`:

- `actual_records_imported` (integer) - Tracks rows successfully inserted into ozon_data
- `records_skipped_duplicates` (integer) - Tracks rows skipped due to duplicate detection
- `records_failed` (integer) - Tracks rows that failed to insert
- `data_purged_at` (timestamptz) - Tracks when data was cleared from ozon_data

Added check constraint to ensure: `records_count >= actual_records_imported + records_skipped_duplicates + records_failed`

Clarified that `records_count` means "total rows parsed from file"

### 2. Import Service Updates

**ozonImportService.ts:**
- Changed `importData()` to return `ImportResult` with success/failure/duplicate counts
- Modified `importDataRowByRow()` to detect and count duplicate rows (PostgreSQL error code 23505)
- Updated `clearData()` to sync import history by setting `actual_records_imported` to 0 and recording `data_purged_at`

**batchImportService.ts:**
- Captures actual import results from ozonImportService
- Stores all tracking metrics (imported, duplicates, failed) in import history
- Sets import_status to 'partial' when some rows fail
- Uses actual imported count for totalRecordsImported calculation

**importHistoryService.ts:**
- Updated interface to include new tracking fields

### 3. Import Status Service Overhaul

**importStatusService.ts:**
- Now queries `ozon_data` table directly with count query for accurate total
- Uses Supabase `select('*', { count: 'exact', head: true })` for efficient counting
- Displays `actual_records_imported` instead of `records_count` in import list
- Returns real-time count as source of truth, not summed history values
- Includes both 'success' and 'partial' imports in status

### 4. Reconciliation Utility

Created `reconciliationService.ts` with two key functions:

**reconcileImportHistory():**
- Compares total from ozon_data with total from import history
- Identifies and reports discrepancies
- Attempts to match import records to actual data by date ranges
- Updates history records with accurate counts
- Returns detailed reconciliation report

**validateImportIntegrity():**
- Validates that accounting math is correct for each import
- Checks that parsed = imported + duplicates + failed
- Reports any data mismatches or accounting errors
- Can be run periodically to ensure data integrity

## How It Works Now

### During Import:

1. File is parsed → `records_count` = total parsed rows
2. Data is inserted → Returns `ImportResult` with actual counts
3. Import history is created with:
   - `records_count` = total parsed
   - `actual_records_imported` = successfully inserted
   - `records_skipped_duplicates` = duplicate rows
   - `records_failed` = failed rows
4. Math always adds up: parsed ≥ imported + duplicates + failed

### During Display:

1. Import status queries ozon_data table for actual count
2. Displays real count, not summed history
3. History records show individual import details
4. Discrepancies are immediately visible

### During Data Purge:

1. All rows deleted from ozon_data
2. All import history records updated:
   - `actual_records_imported` = 0
   - `data_purged_at` = current timestamp
3. History maintains original `records_count` for reference
4. Total records displayed = 0 (from ozon_data query)

## Benefits

1. **Accurate Reporting** - Total records always matches actual database count
2. **Transparency** - Full visibility into import success/failure rates
3. **Data Integrity** - Math constraints ensure all rows are accounted for
4. **Audit Trail** - Complete history of what happened to each file
5. **Reconciliation** - Utility to fix any historical discrepancies
6. **Synchronization** - Purge operations maintain data consistency

## Migration Notes

- Existing import history records are backfilled optimistically
- Success imports: `actual_records_imported` = `records_count`
- Failed imports: `actual_records_imported` = 0
- Run reconciliation utility to correct historical data based on actual ozon_data contents

## Usage

### Check Data Integrity:
```typescript
import { reconciliationService } from './modules/imports/ozon';

const validation = await reconciliationService.validateImportIntegrity();
if (!validation.isValid) {
  console.log('Issues found:', validation.issues);
}
```

### Reconcile Historical Data:
```typescript
const report = await reconciliationService.reconcileImportHistory();
console.log(`Updated ${report.updatedRecords} records`);
console.log(`Discrepancy: ${report.discrepancy} records`);
```

### Get Accurate Import Status:
```typescript
import { importStatusService } from './modules/imports';

const status = await importStatusService.getOzonImportsStatus();
console.log(`Total records in database: ${status.totalRecords}`);
// This count comes directly from ozon_data, not summed history
```

## Summary

The fix ensures the ozon_import_history table accurately reflects the state of ozon_data by storing actual insertion counts, tracking duplicates and failures separately, querying ozon_data directly for status displays, and synchronizing history when data is purged. This provides complete transparency and maintains data integrity between the two tables.
