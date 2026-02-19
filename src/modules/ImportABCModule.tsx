import React, { useState } from 'react';
import { parseABCFile, importABCClassification } from '../services/abcImportService';

interface ImportProgress {
  status: 'idle' | 'parsing' | 'uploading' | 'complete' | 'error';
  message: string;
  products?: number;
  classA?: number;
  classB?: number;
  classC?: number;
  totalRevenue?: number;
  batchId?: string;
}

const ImportABCModule: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [year, setYear] = useState<number>(2025);
  const [progress, setProgress] = useState<ImportProgress>({
    status: 'idle',
    message: ''
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProgress({
        status: 'idle',
        message: `Selected: ${file.name}`
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setProgress({
        status: 'error',
        message: 'Please select a file first'
      });
      return;
    }

    try {
      // Step 1: Parse file
      setProgress({
        status: 'parsing',
        message: 'Reading Excel file...'
      });

      const rows = await parseABCFile(selectedFile);

      setProgress({
        status: 'parsing',
        message: `Parsed ${rows.length} ABC classifications...`
      });

      // Step 2: Import to database
      setProgress({
        status: 'uploading',
        message: 'Importing to database...'
      });

      const result = await importABCClassification(rows, year);

      if (result.success) {
        setProgress({
          status: 'complete',
          message: result.message,
          products: result.stats?.products,
          classA: result.stats?.classA,
          classB: result.stats?.classB,
          classC: result.stats?.classC,
          totalRevenue: result.stats?.totalRevenue,
          batchId: result.stats?.batchId
        });
      } else {
        setProgress({
          status: 'error',
          message: result.error || 'Import failed'
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      setProgress({
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-100">
          Import ABC Classification
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Upload ABC classification Excel file (File 2: АВС 2025 ОП.xlsx)
        </p>
      </div>

      {/* File Upload Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="space-y-4">
          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Period Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min="2020"
              max="2030"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!selectedFile || progress.status === 'parsing' || progress.status === 'uploading'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {progress.status === 'parsing' && 'Parsing...'}
            {progress.status === 'uploading' && 'Importing...'}
            {progress.status !== 'parsing' && progress.status !== 'uploading' && 'Import ABC Classification'}
          </button>
        </div>
      </div>

      {/* Progress/Status Section */}
      {progress.message && (
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

              {/* Summary Stats */}
              {progress.status === 'complete' && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-800/50 rounded px-3 py-2">
                    <div className="text-xs text-gray-400">Total Products</div>
                    <div className="text-lg font-semibold text-gray-100">
                      {progress.products?.toLocaleString() || '—'}
                    </div>
                  </div>
                  <div className="bg-red-900/30 rounded px-3 py-2 border border-red-700/50">
                    <div className="text-xs text-red-400">Class A</div>
                    <div className="text-lg font-semibold text-red-300">
                      {progress.classA?.toLocaleString() || '—'}
                    </div>
                  </div>
                  <div className="bg-yellow-900/30 rounded px-3 py-2 border border-yellow-700/50">
                    <div className="text-xs text-yellow-400">Class B</div>
                    <div className="text-lg font-semibold text-yellow-300">
                      {progress.classB?.toLocaleString() || '—'}
                    </div>
                  </div>
                  <div className="bg-green-900/30 rounded px-3 py-2 border border-green-700/50">
                    <div className="text-xs text-green-400">Class C</div>
                    <div className="text-lg font-semibold text-green-300">
                      {progress.classC?.toLocaleString() || '—'}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded px-3 py-2 col-span-2 md:col-span-4">
                    <div className="text-xs text-gray-400">Total Revenue</div>
                    <div className="text-lg font-semibold text-gray-100">
                      {formatCurrency(progress.totalRevenue)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-2">Expected File Format</h3>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li>Excel file (.xlsx or .xls) with ABC classification data</li>
          <li>Required columns: Номенклатура (Product Name), ABC (Class: A/B/C)</li>
          <li>Optional columns: Выручка (Revenue), Прибыль (Profit), Ранг (Rank), Накопленный % (Cumulative %)</li>
          <li>Header row should contain column names (auto-detected)</li>
          <li>Supports up to 10,000 products per file</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportABCModule;
