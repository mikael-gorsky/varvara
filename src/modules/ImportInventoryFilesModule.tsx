import React, { useState } from 'react';
import { parseAgedInventoryFile, importInventorySnapshot } from '../services/inventoryImportService';
import { parseABCFile, importABCClassification } from '../services/abcImportService';
import { parseProcurementFile, importProcurementData } from '../services/procurementImportService';

type ImportType = 'inventory' | 'abc' | 'procurement';

interface ImportProgress {
  status: 'idle' | 'parsing' | 'uploading' | 'complete' | 'error';
  message: string;
  stats?: any;
}

const ImportInventoryFilesModule: React.FC = () => {
  // Inventory Snapshot state
  const [inventoryFile, setInventoryFile] = useState<File | null>(null);
  const [snapshotDate, setSnapshotDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inventoryProgress, setInventoryProgress] = useState<ImportProgress>({ status: 'idle', message: '' });

  // ABC Classification state
  const [abcFile, setAbcFile] = useState<File | null>(null);
  const [abcYear, setAbcYear] = useState<number>(2025);
  const [abcProgress, setAbcProgress] = useState<ImportProgress>({ status: 'idle', message: '' });

  // Procurement Data state
  const [procurementFile, setProcurementFile] = useState<File | null>(null);
  const [procurementProgress, setProcurementProgress] = useState<ImportProgress>({ status: 'idle', message: '' });

  // Import handlers
  const handleInventoryImport = async () => {
    if (!inventoryFile) {
      setInventoryProgress({ status: 'error', message: 'Please select a file first' });
      return;
    }

    try {
      setInventoryProgress({ status: 'parsing', message: 'Reading Excel file...' });
      const rows = await parseAgedInventoryFile(inventoryFile);

      setInventoryProgress({ status: 'parsing', message: `Parsed ${rows.length} inventory records...` });

      setInventoryProgress({ status: 'uploading', message: 'Importing to database...' });
      const result = await importInventorySnapshot(rows, new Date(snapshotDate));

      if (result.success) {
        setInventoryProgress({
          status: 'complete',
          message: result.message,
          stats: result.stats
        });
      } else {
        setInventoryProgress({ status: 'error', message: result.error || 'Import failed' });
      }
    } catch (error) {
      console.error('Import error:', error);
      setInventoryProgress({
        status: 'error',
        message: error instanceof Error ? error.message : 'Import failed'
      });
    }
  };

  const handleAbcImport = async () => {
    if (!abcFile) {
      setAbcProgress({ status: 'error', message: 'Please select a file first' });
      return;
    }

    try {
      setAbcProgress({ status: 'parsing', message: 'Reading Excel file...' });
      const rows = await parseABCFile(abcFile);

      setAbcProgress({ status: 'parsing', message: `Parsed ${rows.length} ABC classifications...` });

      setAbcProgress({ status: 'uploading', message: 'Importing to database...' });
      const result = await importABCClassification(rows, abcYear);

      if (result.success) {
        setAbcProgress({
          status: 'complete',
          message: result.message,
          stats: result.stats
        });
      } else {
        setAbcProgress({ status: 'error', message: result.error || 'Import failed' });
      }
    } catch (error) {
      console.error('Import error:', error);
      setAbcProgress({
        status: 'error',
        message: error instanceof Error ? error.message : 'Import failed'
      });
    }
  };

  const handleProcurementImport = async () => {
    if (!procurementFile) {
      setProcurementProgress({ status: 'error', message: 'Please select a file first' });
      return;
    }

    try {
      setProcurementProgress({ status: 'parsing', message: 'Reading Excel file...' });
      const rows = await parseProcurementFile(procurementFile);

      setProcurementProgress({ status: 'parsing', message: `Parsed ${rows.length} products with sales history...` });

      setProcurementProgress({ status: 'uploading', message: 'Importing to database...' });
      const result = await importProcurementData(rows);

      if (result.success) {
        setProcurementProgress({
          status: 'complete',
          message: result.message,
          stats: result.stats
        });
      } else {
        setProcurementProgress({ status: 'error', message: result.error || 'Import failed' });
      }
    } catch (error) {
      console.error('Import error:', error);
      setProcurementProgress({
        status: 'error',
        message: error instanceof Error ? error.message : 'Import failed'
      });
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '—';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderProgressStatus = (progress: ImportProgress) => {
    if (!progress.message) return null;

    return (
      <div
        className={`rounded-lg p-4 border ${
          progress.status === 'complete'
            ? 'bg-green-900/20 border-green-700'
            : progress.status === 'error'
            ? 'bg-red-900/20 border-red-700'
            : 'bg-blue-900/20 border-blue-700'
        }`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {progress.status === 'complete' && (
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {progress.status === 'error' && (
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {(progress.status === 'parsing' || progress.status === 'uploading') && (
              <svg className="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>
          <div className="ml-3 flex-1">
            <p
              className={`text-sm font-medium ${
                progress.status === 'complete'
                  ? 'text-green-300'
                  : progress.status === 'error'
                  ? 'text-red-300'
                  : 'text-blue-300'
              }`}
            >
              {progress.message}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-100">Import Inventory Files</h2>
        <p className="text-sm text-gray-400 mt-1">
          Import inventory data from Excel files (3 file types supported)
        </p>
      </div>

      {/* File 1: Inventory Snapshot */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          File 1: Inventory Snapshot (Aged Inventory)
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Snapshot Date
              </label>
              <input
                type="date"
                value={snapshotDate}
                onChange={(e) => setSnapshotDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excel File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInventoryFile(file);
                    setInventoryProgress({ status: 'idle', message: `Selected: ${file.name}` });
                  }
                }}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleInventoryImport}
            disabled={!inventoryFile || inventoryProgress.status === 'parsing' || inventoryProgress.status === 'uploading'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {inventoryProgress.status === 'parsing' && 'Parsing...'}
            {inventoryProgress.status === 'uploading' && 'Importing...'}
            {inventoryProgress.status !== 'parsing' && inventoryProgress.status !== 'uploading' && 'Import Inventory Snapshot'}
          </button>

          {renderProgressStatus(inventoryProgress)}

          {inventoryProgress.status === 'complete' && inventoryProgress.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-900/50 rounded px-3 py-2">
                <div className="text-xs text-gray-400">Products</div>
                <div className="text-lg font-semibold text-gray-100">
                  {inventoryProgress.stats.products?.toLocaleString() || '—'}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded px-3 py-2">
                <div className="text-xs text-gray-400">Warehouses</div>
                <div className="text-lg font-semibold text-gray-100">
                  {inventoryProgress.stats.warehouses || '—'}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded px-3 py-2 col-span-2">
                <div className="text-xs text-gray-400">Total Value</div>
                <div className="text-lg font-semibold text-gray-100">
                  {formatCurrency(inventoryProgress.stats.totalValue)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File 2: ABC Classification */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          File 2: ABC Classification
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Period Year
              </label>
              <input
                type="number"
                value={abcYear}
                onChange={(e) => setAbcYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excel File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAbcFile(file);
                    setAbcProgress({ status: 'idle', message: `Selected: ${file.name}` });
                  }
                }}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleAbcImport}
            disabled={!abcFile || abcProgress.status === 'parsing' || abcProgress.status === 'uploading'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {abcProgress.status === 'parsing' && 'Parsing...'}
            {abcProgress.status === 'uploading' && 'Importing...'}
            {abcProgress.status !== 'parsing' && abcProgress.status !== 'uploading' && 'Import ABC Classification'}
          </button>

          {renderProgressStatus(abcProgress)}

          {abcProgress.status === 'complete' && abcProgress.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-900/50 rounded px-3 py-2">
                <div className="text-xs text-gray-400">Total Products</div>
                <div className="text-lg font-semibold text-gray-100">
                  {abcProgress.stats.products?.toLocaleString() || '—'}
                </div>
              </div>
              <div className="bg-red-900/30 rounded px-3 py-2 border border-red-700/50">
                <div className="text-xs text-red-400">Class A</div>
                <div className="text-lg font-semibold text-red-300">
                  {abcProgress.stats.classA?.toLocaleString() || '—'}
                </div>
              </div>
              <div className="bg-yellow-900/30 rounded px-3 py-2 border border-yellow-700/50">
                <div className="text-xs text-yellow-400">Class B</div>
                <div className="text-lg font-semibold text-yellow-300">
                  {abcProgress.stats.classB?.toLocaleString() || '—'}
                </div>
              </div>
              <div className="bg-green-900/30 rounded px-3 py-2 border border-green-700/50">
                <div className="text-xs text-green-400">Class C</div>
                <div className="text-lg font-semibold text-green-300">
                  {abcProgress.stats.classC?.toLocaleString() || '—'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File 3: Procurement Data */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          File 3: Procurement Planning Data
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setProcurementFile(file);
                  setProcurementProgress({ status: 'idle', message: `Selected: ${file.name}` });
                }
              }}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>

          <button
            onClick={handleProcurementImport}
            disabled={!procurementFile || procurementProgress.status === 'parsing' || procurementProgress.status === 'uploading'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {procurementProgress.status === 'parsing' && 'Parsing...'}
            {procurementProgress.status === 'uploading' && 'Importing...'}
            {procurementProgress.status !== 'parsing' && procurementProgress.status !== 'uploading' && 'Import Procurement Data'}
          </button>

          {renderProgressStatus(procurementProgress)}

          {procurementProgress.status === 'complete' && procurementProgress.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-900/50 rounded px-3 py-2">
                <div className="text-xs text-gray-400">Products</div>
                <div className="text-lg font-semibold text-gray-100">
                  {procurementProgress.stats.products?.toLocaleString() || '—'}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded px-3 py-2">
                <div className="text-xs text-gray-400">Sales Records</div>
                <div className="text-lg font-semibold text-gray-100">
                  {procurementProgress.stats.salesRecords?.toLocaleString() || '—'}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded px-3 py-2">
                <div className="text-xs text-gray-400">Suppliers</div>
                <div className="text-lg font-semibold text-gray-100">
                  {procurementProgress.stats.suppliers?.toLocaleString() || '—'}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded px-3 py-2">
                <div className="text-xs text-gray-400">Months</div>
                <div className="text-lg font-semibold text-gray-100">
                  {procurementProgress.stats.months?.toLocaleString() || '—'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportInventoryFilesModule;
