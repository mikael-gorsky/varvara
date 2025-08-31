import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Trash2, Database, Activity, Zap } from 'lucide-react';
import { parseOzonFile, OzonParsedData } from '../../utils/ozonParser';
import { ozonImportService, OzonStats } from '../../services/ozonImportService';

interface OzonDataImportProps {
  onBack: () => void;
}

const OzonDataImport: React.FC<OzonDataImportProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<OzonParsedData | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [stats, setStats] = useState<OzonStats | null>(null);
  const [clearing, setClearing] = useState(false);

  const loadOzonStats = async () => {
    try {
      const statsData = await ozonImportService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load OZON stats:', error);
    }
  };

  useEffect(() => {
    loadOzonStats();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedData(null);
      setImportResult(null);
    }
  };

  const handleParseFile = async () => {
    if (!file) return;

    try {
      const result = await parseOzonFile(file);
      setParsedData(result);
    } catch (error) {
      setImportResult(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.rows.length === 0) return;

    setImporting(true);
    try {
      const result = await ozonImportService.importData(parsedData);
      
      if (result.success) {
        setImportResult(`Successfully imported ${result.importedCount} OZON records`);
        await loadOzonStats();
        setFile(null);
        setParsedData(null);
      } else {
        setImportResult(`Import failed: ${result.error}`);
      }
    } catch (error) {
      setImportResult(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL OZON data from the database. Continue?')) {
      return;
    }

    setClearing(true);
    try {
      const result = await ozonImportService.clearData();
      
      if (result.success) {
        setImportResult('All OZON data has been cleared from the database');
        await loadOzonStats();
      } else {
        setImportResult(`Clear failed: ${result.error}`);
      }
    } catch (error) {
      setImportResult(`Clear error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setClearing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%), 
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Command Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded text-cyan-300 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 font-mono text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO OZON COMMAND</span>
              </button>
              <div className="h-6 border-l border-cyan-400/30"></div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300 relative">
                  <Database className="w-6 h-6 text-black" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border border-black"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    DATA STREAM INTEGRATION
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    OZON Marketplace Data Import
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-mono">IMPORT SYSTEMS READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Statistics */}
        {stats && stats.totalRecords > 0 && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-blue-400/30 text-blue-400 text-xs px-2 py-1 rounded font-mono">
                DB-OZON
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center space-x-3 font-mono tracking-wide">
              <Activity className="w-6 h-6 text-blue-400" />
              <span>CURRENT DATABASE STATUS</span>
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Total Records</span>
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-300 font-mono">{stats.totalRecords.toLocaleString()}</p>
                <p className="text-emerald-400/60 text-xs font-mono">OZON Products</p>
              </div>
              
              <div className="bg-gray-800/50 border border-blue-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Total Revenue</span>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-300 font-mono">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-blue-400/60 text-xs font-mono">Revenue Sum</p>
              </div>
              
              <div className="bg-gray-800/50 border border-purple-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Categories</span>
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-purple-300 font-mono">{stats.topCategories.length}</p>
                <p className="text-purple-400/60 text-xs font-mono">Product Types</p>
              </div>
              
              <div className="bg-gray-800/50 border border-orange-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Brands</span>
                  <Zap className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-orange-300 font-mono">{stats.topBrands.length}</p>
                <p className="text-orange-400/60 text-xs font-mono">Brand Partners</p>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
          <div className="absolute top-4 right-4">
            <span className="bg-gray-800/60 border border-emerald-400/30 text-emerald-400 text-xs px-2 py-1 rounded font-mono">
              UP-01
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center space-x-3 font-mono tracking-wide">
            <Upload className="w-6 h-6 text-emerald-400" />
            <span>OZON DATA UPLOAD PROTOCOL</span>
          </h2>

          <div className="space-y-6">
            {/* File Selection */}
            <div className="border-2 border-dashed border-cyan-400/30 rounded-lg p-8 text-center hover:border-cyan-400/50 transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400/40"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400/40"></div>
              
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-emerald-300">
                  <FileSpreadsheet className="w-8 h-8 text-black" />
                </div>
                <p className="text-lg font-mono text-cyan-300 mb-2 tracking-wide">SELECT OZON DATA FILE</p>
                <p className="text-sm text-cyan-400/80 font-mono">Excel (.xlsx, .xls) or CSV files accepted</p>
              </label>
            </div>

            {/* File Info */}
            {file && (
              <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-emerald-300 font-bold text-sm tracking-wide">SELECTED FILE:</h3>
                  <button
                    onClick={handleParseFile}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 text-black rounded hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 font-mono font-bold text-sm"
                  >
                    <Database className="w-4 h-4" />
                    <span>ANALYZE FILE</span>
                  </button>
                </div>
                <div className="space-y-2 text-sm font-mono">
                  <p className="text-cyan-400">Name: <span className="text-cyan-300">{file.name}</span></p>
                  <p className="text-cyan-400">Size: <span className="text-cyan-300">{(file.size / 1024 / 1024).toFixed(2)} MB</span></p>
                  <p className="text-cyan-400">Type: <span className="text-cyan-300">{file.type || 'Unknown'}</span></p>
                </div>
              </div>
            )}

            {/* Parse Results */}
            {parsedData && (
              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-6">
                <h3 className="font-mono text-cyan-300 font-bold mb-4 text-sm tracking-wide">FILE ANALYSIS RESULTS:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-900/50 border border-emerald-400/30 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-mono uppercase">Valid Records</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-300 font-mono">{parsedData.stats.validRows}</p>
                  </div>
                  
                  <div className="bg-gray-900/50 border border-blue-400/30 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-xs font-mono uppercase">Total Rows</span>
                    </div>
                    <p className="text-xl font-bold text-blue-300 font-mono">{parsedData.stats.totalRows}</p>
                  </div>
                  
                  <div className="bg-gray-900/50 border border-red-400/30 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-xs font-mono uppercase">Errors</span>
                    </div>
                    <p className="text-xl font-bold text-red-300 font-mono">{parsedData.errors.length}</p>
                  </div>
                </div>

                {/* Header Validation */}
                {!parsedData.headerValidation.isValid && (
                  <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4 mb-6">
                    <h4 className="font-mono text-red-400 font-bold mb-2 text-sm">HEADER VALIDATION WARNINGS:</h4>
                    {parsedData.headerValidation.missingFields.length > 0 && (
                      <div className="mb-2">
                        <p className="text-red-300 text-sm font-mono">Missing Fields:</p>
                        <ul className="list-disc list-inside text-red-400/80 text-xs space-y-1 font-mono">
                          {parsedData.headerValidation.missingFields.map((field, index) => (
                            <li key={index}>{field}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Errors */}
                {parsedData.errors.length > 0 && (
                  <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4 mb-6">
                    <h4 className="font-mono text-red-400 font-bold mb-2 text-sm">PARSE ERRORS:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {parsedData.errors.slice(0, 10).map((error, index) => (
                        <p key={index} className="text-red-400/80 text-xs font-mono">{error}</p>
                      ))}
                      {parsedData.errors.length > 10 && (
                        <p className="text-red-400/60 text-xs font-mono">... and {parsedData.errors.length - 10} more errors</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Import Button */}
                {parsedData.stats.validRows > 0 && (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 text-black rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 disabled:opacity-50 font-mono font-bold text-lg shadow-xl"
                    >
                      <Upload className="w-6 h-6" />
                      <span>{importing ? 'IMPORTING DATA...' : `IMPORT ${parsedData.stats.validRows} RECORDS`}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div className={`border rounded-lg p-4 ${
                importResult.includes('Successfully') 
                  ? 'bg-emerald-900/20 border-emerald-400/30' 
                  : 'bg-red-900/20 border-red-400/30'
              }`}>
                <div className="flex items-center space-x-2">
                  {importResult.includes('Successfully') ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p className={`font-mono text-sm font-bold ${
                    importResult.includes('Successfully') ? 'text-emerald-300' : 'text-red-300'
                  }`}>
                    {importResult}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Database Management */}
        {stats && stats.totalRecords > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-pink-400"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-red-400/30 text-red-400 text-xs px-2 py-1 rounded font-mono">
                DB-MGMT
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center space-x-3 font-mono tracking-wide">
              <Trash2 className="w-6 h-6 text-red-400" />
              <span>DATABASE MANAGEMENT</span>
            </h2>

            <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-red-300 font-bold mb-2 text-sm tracking-wide">DANGER ZONE</h3>
                  <p className="text-red-400/80 text-sm font-mono">
                    Clear all OZON data from the database. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleClearData}
                  disabled={clearing}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 border border-red-400 text-black rounded-lg hover:from-red-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-50 font-mono font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{clearing ? 'CLEARING...' : 'CLEAR ALL DATA'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Status Footer */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-300 font-mono font-bold text-sm">OZON DATA IMPORT ACTIVE</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400/80 font-mono text-sm">DATABASE: CONNECTED</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-400 font-mono text-sm">ORGANIZATION: ОФИС-КИТ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OzonDataImport;