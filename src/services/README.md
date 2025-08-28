# Import Service Documentation

## 🛡️ PROTECTED FUNCTIONALITY
**This service contains critical business logic. Modify with extreme caution.**

## ImportService

The `ImportService` class handles all database import operations for ERP data.

### Key Features
- **RLS Bypass**: Uses service role for database access
- **Batch Processing**: Handles large datasets efficiently  
- **Error Handling**: Comprehensive error reporting
- **Progress Tracking**: Optional progress callbacks
- **Validation**: Pre-import data validation

### Methods

#### `ImportService.importToProducts(data, options)`
Main import method for products table.

**Parameters:**
- `data: ParsedData` - Parsed CSV/Excel data
- `options: ImportOptions` - Configuration options

**Returns:** `Promise<ImportResult>`

#### `ImportService.importInBatches(data, batchSize, onProgress)`
Batch import for large datasets (>1000 rows).

#### `ImportService.validateConnection()`
Test database connection and permissions.

### Usage Example
```typescript
const result = await ImportService.importToProducts(parsedData, {
  validateBeforeImport: true,
  onProgress: (progress, message) => {
    console.log(`${progress}%: ${message}`);
  }
});

if (result.success) {
  console.log(`Imported ${result.recordsImported} records`);
} else {
  console.error('Import failed:', result.errors);
}
```

## 🚨 Critical Notes
1. **Service Role Required**: Must have `VITE_SUPABASE_SERVICE_ROLE_KEY` in .env
2. **RLS Bypass**: Service role bypasses all row-level security
3. **Error Logging**: All errors are logged to console
4. **UI Independent**: Works regardless of UI changes

## 🔒 Security
- Only uses service role for imports
- Validates data before import
- Logs all operations
- No user credentials required