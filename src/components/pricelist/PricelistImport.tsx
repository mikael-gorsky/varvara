import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader, Trash2, BarChart3 } from 'lucide-react';
import { pricelistImportService, ImportResult, PricelistStats } from '../../modules/imports/pricelist';

const PricelistImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [stats, setStats] = useState<PricelistStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await pricelistImportService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await pricelistImportService.importFile(selectedFile);
      setImportResult(result);

      if (result.success) {
        await loadStats();
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all pricelist data? This action cannot be undone.')) {
      return;
    }

    try {
      await pricelistImportService.clearAllData();
      await loadStats();
      setImportResult(null);
    } catch (error) {
      alert(`Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-cyan-300 font-mono">PRICELIST IMPORT</h2>
              <p className="text-cyan-400/80 text-sm font-mono">Import Excel product pricing data</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-mono">READY</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-cyan-400/30 rounded-lg p-8 hover:border-cyan-400/60 transition-all duration-200">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-3"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-xl flex items-center justify-center border border-cyan-400/30">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-center">
                <p className="text-cyan-300 font-mono font-bold">
                  {selectedFile ? selectedFile.name : 'Click to select Excel file'}
                </p>
                <p className="text-cyan-400/60 text-sm font-mono mt-1">
                  Supports .xls and .xlsx formats
                </p>
              </div>
            </label>
          </div>

          {selectedFile && !importing && (
            <button
              onClick={handleImport}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 px-6 rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 flex items-center justify-center space-x-2 font-mono"
            >
              <Upload className="w-5 h-5" />
              <span>START IMPORT</span>
            </button>
          )}

          {importing && (
            <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
                <div>
                  <p className="text-cyan-300 font-mono font-bold">Processing import...</p>
                  <p className="text-cyan-400/60 text-sm font-mono">Parsing file and importing data</p>
                </div>
              </div>
            </div>
          )}

          {importResult && (
            <div className={`border rounded-lg p-4 ${
              importResult.success
                ? 'bg-emerald-900/20 border-emerald-400/30'
                : 'bg-red-900/20 border-red-400/30'
            }`}>
              <div className="flex items-start space-x-3">
                {importResult.success ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className={`font-bold font-mono mb-2 ${
                    importResult.success ? 'text-emerald-300' : 'text-red-300'
                  }`}>
                    {importResult.success ? 'IMPORT SUCCESSFUL' : 'IMPORT FAILED'}
                  </h3>

                  {importResult.success && importResult.stats && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-cyan-400/60 text-xs font-mono">Products Processed</p>
                        <p className="text-cyan-300 font-mono font-bold">{importResult.stats.products_processed}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-cyan-400/60 text-xs font-mono">Products Inserted</p>
                        <p className="text-emerald-400 font-mono font-bold">{importResult.stats.products_inserted}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-cyan-400/60 text-xs font-mono">Products Updated</p>
                        <p className="text-yellow-400 font-mono font-bold">{importResult.stats.products_updated}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-cyan-400/60 text-xs font-mono">Prices Inserted</p>
                        <p className="text-emerald-400 font-mono font-bold">{importResult.stats.prices_inserted}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-cyan-400/60 text-xs font-mono">Prices Updated</p>
                        <p className="text-yellow-400 font-mono font-bold">{importResult.stats.prices_updated}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded p-2">
                        <p className="text-cyan-400/60 text-xs font-mono">Categories Found</p>
                        <p className="text-cyan-300 font-mono font-bold">{importResult.stats.categories_found}</p>
                      </div>
                    </div>
                  )}

                  {importResult.stats?.errors && importResult.stats.errors.length > 0 && (
                    <div className="mt-3 bg-red-900/20 border border-red-400/30 rounded p-3">
                      <p className="text-red-300 font-mono font-bold text-sm mb-2">
                        Errors ({importResult.stats.errors.length}):
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResult.stats.errors.slice(0, 10).map((error, idx) => (
                          <p key={idx} className="text-red-400/80 text-xs font-mono">
                            {error}
                          </p>
                        ))}
                        {importResult.stats.errors.length > 10 && (
                          <p className="text-red-400/60 text-xs font-mono italic">
                            ... and {importResult.stats.errors.length - 10} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {importResult.error && (
                    <p className="text-red-400 font-mono text-sm">{importResult.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-xl font-bold text-cyan-300 font-mono">DATABASE STATISTICS</h3>
            </div>

            <button
              onClick={handleClearData}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2 px-4 rounded-lg hover:from-red-400 hover:to-red-500 transition-all duration-200 flex items-center space-x-2 font-mono text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>CLEAR ALL</span>
            </button>
          </div>

          {loadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4">
                <p className="text-cyan-400/60 text-sm font-mono mb-1">Total Products</p>
                <p className="text-3xl font-bold text-cyan-300 font-mono">{stats.totalProducts}</p>
              </div>

              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4">
                <p className="text-cyan-400/60 text-sm font-mono mb-1">Total Prices</p>
                <p className="text-3xl font-bold text-emerald-400 font-mono">{stats.totalPrices}</p>
              </div>

              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4">
                <p className="text-cyan-400/60 text-sm font-mono mb-1">Suppliers</p>
                <p className="text-3xl font-bold text-cyan-300 font-mono">{stats.suppliers.length}</p>
              </div>

              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4">
                <p className="text-cyan-400/60 text-sm font-mono mb-1">Categories</p>
                <p className="text-3xl font-bold text-cyan-300 font-mono">{stats.categories.length}</p>
              </div>

              <div className="col-span-2 md:col-span-4 bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4">
                <p className="text-cyan-400/60 text-sm font-mono mb-2">Price Range</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-cyan-400/60 text-xs font-mono">Minimum</p>
                    <p className="text-xl font-bold text-cyan-300 font-mono">
                      {stats.priceRange.min.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-cyan-400/60 text-xs font-mono">Average</p>
                    <p className="text-xl font-bold text-emerald-400 font-mono">
                      {stats.priceRange.avg.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-cyan-400/60 text-xs font-mono">Maximum</p>
                    <p className="text-xl font-bold text-cyan-300 font-mono">
                      {stats.priceRange.max.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>

        <h3 className="text-lg font-bold text-cyan-300 font-mono mb-3">FILE FORMAT REQUIREMENTS</h3>
        <div className="space-y-2 text-cyan-400/80 text-sm font-mono">
          <p>• Excel file format (.xls or .xlsx)</p>
          <p>• Rows 1-2: Reserved for metadata</p>
          <p>• Rows 3-4: Column headers</p>
          <p>• Row 5 onwards: Product data</p>
          <p>• Column 0: Product Code (required)</p>
          <p>• Column 1: Article Number</p>
          <p>• Column 2: Product Name</p>
          <p>• Column 3: Barcode</p>
          <p>• Columns 4-28: Supplier prices and currencies (12 suppliers total)</p>
          <p>• Category rows: Empty code but populated name identifies product categories</p>
        </div>
      </div>
    </div>
  );
};

export default PricelistImport;
