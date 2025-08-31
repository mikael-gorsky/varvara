import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, AlertTriangle, CheckCircle, BarChart3, Database, Activity, Zap } from 'lucide-react';
import { parseOzonFile, OzonParsedData } from '../../utils/ozonParser';
import { ozonImportService, OzonStats } from '../../services/ozonImportService';

interface OzonDataImportProps {
  onBack: () => void;
}

const OzonDataImport: React.FC<OzonDataImportProps> = ({ onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<OzonParsedData | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [ozonStats, setOzonStats] = useState<OzonStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadOzonStats = async () => {
    setLoadingStats(true);
    try {
      const stats = await ozonImportService.getStats();
      setOzonStats(stats);
    } catch (error) {
      console.error('Failed to load OZON stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadOzonStats();
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsedData(null);
    setImportStatus('idle');
    setStatusMessage('');

    try {
      const parsed = await parseOzonFile(selectedFile);
      setParsedData(parsed);
    } catch (error) {
      setStatusMessage(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setImportStatus('error');
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.rows.length === 0) return;

    setImporting(true);
    setImportStatus('idle');
    
    try {
      await ozonImportService.importData(parsedData.rows);
      setImportStatus('success');
      setStatusMessage(`Successfully imported ${parsedData.rows.length} records`);
      await loadOzonStats();
    } catch (error) {
      setImportStatus('error');
      setStatusMessage(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all OZON data? This action cannot be undone.')) {
      return;
    }

    try {
      await ozonImportService.clearData();
      await loadOzonStats();
      setStatusMessage('All OZON data cleared successfully');
      setImportStatus('success');
    } catch (error) {
      setStatusMessage(`Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setImportStatus('error');
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
                    OZON Marketplace Intelligence Upload
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-mono">UPLOAD SYSTEMS READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Database Status */}
        {ozonStats && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-blue-400/30 text-blue-400 text-xs px-2 py-1 rounded font-mono">
                STAT-01
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center space-x-3 font-mono tracking-wide">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <span>CURRENT DATABASE STATUS</span>
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-blue-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Total Products</span>
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-300 font-mono">{ozonStats.totalProducts.toLocaleString()}</p>
                <p className="text-blue-400/60 text-xs font-mono">Marketplace Items</p>
              </div>
              
              <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Total Revenue</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-300 font-mono">{formatCurrency(ozonStats.totalRevenue)}</p>
                <p className="text-emerald-400/60 text-xs font-mono">Trade Volume</p>
              </div>
              
              <div className="bg-gray-800/50 border border-purple-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Avg Price</span>
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-purple-300 font-mono">{formatCurrency(ozonStats.averagePrice)}</p>
                <p className="text-purple-400/60 text-xs font-mono">Per Unit</p>
              </div>
              
              <div className="bg-gray-800/50 border border-orange-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Categories</span>
                  <Database className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-orange-300 font-mono">{ozonStats.topCategories.length}</p>
                <p className="text-orange-400/60 text-xs font-mono">Product Types</p>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Interface */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
          <div className="absolute top-4 right-4">
            <span className="bg-gray-800/60 border border-emerald-400/30 text-emerald-400 text-xs px-2 py-1 rounded font-mono">
              UP-01
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center space-x-3 font-mono tracking-wide">
            <Upload className="w-6 h-6 text-emerald-400" />
            <span>OZON DATA STREAM UPLOAD</span>
          </h2>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-cyan-400/30 rounded-lg p-8 text-center hover:border-cyan-400/50 transition-all duration-200">
              <FileSpreadsheet className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-mono text-cyan-300 mb-2">SELECT OZON INTELLIGENCE FILE</h3>
              <p className="text-cyan-400/80 text-sm mb-4 font-mono">Upload Excel (.xlsx) or CSV files from OZON marketplace</p>
              
              <label className="inline-block">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 text-black px-6 py-3 rounded cursor-pointer hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 font-mono font-bold">
                  BROWSE FILES
                </div>
              </label>
              
              {file && (
                <div className="mt-4 p-4 bg-gray-800/50 border border-cyan-400/30 rounded-lg">
                  <p className="text-cyan-300 font-mono text-sm">Selected: {file.name}</p>
                  <p className="text-cyan-400/60 font-mono text-xs">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            {/* Parse Results */}
            {parsedData && (
              <div className="space-y-4">
                <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-6">
                  <h3 className="text-lg font-mono text-cyan-300 font-bold mb-4">DATA STREAM ANALYSIS</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cyan-300 font-mono">{parsedData.stats.totalRows}</p>
                      <p className="text-cyan-400/80 text-xs font-mono uppercase">Total Rows</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-300 font-mono">{parsedData.stats.validRows}</p>
                      <p className="text-emerald-400/80 text-xs font-mono uppercase">Valid Rows</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-300 font-mono">{parsedData.stats.invalidRows}</p>
                      <p className="text-red-400/80 text-xs font-mono uppercase">Error Rows</p>
                    </div>
                  </div>

                  {parsedData.errors.length > 0 && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mt-4">
                      <h4 className="text-red-300 font-mono font-bold text-sm mb-2">DATA STREAM ERRORS:</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {parsedData.errors.map((error, index) => (
                          <p key={index} className="text-red-400/80 text-xs font-mono">{error}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedData.rows.length > 0 && (
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300 font-mono text-sm">Data ready for upload</span>
                      </div>
                      
                      <button
                        onClick={handleImport}
                        disabled={importing}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 text-black rounded hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 disabled:opacity-50 font-mono font-bold"
                      >
                        {importing ? (
                          <>
                            <Activity className="w-5 h-5 animate-spin" />
                            <span>UPLOADING...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            <span>UPLOAD TO DATABASE</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Messages */}
            {statusMessage && (
              <div className={`p-4 rounded-lg border ${
                importStatus === 'success' 
                  ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300' 
                  : 'bg-red-900/20 border-red-500/30 text-red-300'
              }`}>
                <div className="flex items-center space-x-2">
                  {importStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="font-mono text-sm">{statusMessage}</span>
                </div>
              </div>
            )}

            {/* Database Controls */}
            {ozonStats && ozonStats.totalProducts > 0 && (
              <div className="bg-gray-800/50 border border-red-400/30 rounded-lg p-6">
                <h3 className="text-lg font-mono text-red-300 font-bold mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>DATABASE MAINTENANCE</span>
                </h3>
                <p className="text-red-400/80 text-sm font-mono mb-4">
                  Clear all OZON data from the database. This action cannot be undone.
                </p>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-900/50 border border-red-500/50 text-red-300 rounded hover:bg-red-900/70 hover:border-red-400 transition-all duration-200 font-mono font-bold text-sm"
                >
                  PURGE ALL DATA
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top Categories Preview */}
        {ozonStats && ozonStats.topCategories.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-purple-400/30 text-purple-400 text-xs px-2 py-1 rounded font-mono">
                CAT-01
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center space-x-3 font-mono tracking-wide">
              <Database className="w-6 h-6 text-purple-400" />
              <span>TOP MARKETPLACE CATEGORIES</span>
            </h2>
            
            <div className="space-y-3">
              {ozonStats.topCategories.slice(0, 8).map((category, index) => (
                <div key={category.category} className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-4 hover:border-cyan-400/40 hover:bg-gray-800/60 transition-all duration-200 relative">
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-500 rounded-l-lg"></div>
                  
                  <div className="flex items-center justify-between ml-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-black font-bold text-xs shadow-lg border border-purple-300">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-mono text-cyan-300 font-semibold text-sm">{category.category}</h3>
                        <p className="text-cyan-400/60 text-xs font-mono">{category.count} products</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-cyan-300 text-sm font-mono">{formatCurrency(category.revenue)}</p>
                      <p className="text-cyan-400/60 text-xs font-mono">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Status Footer */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-300 font-mono font-bold text-sm">DATA STREAM INTEGRATION ACTIVE</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400/80 font-mono text-sm">UPLOAD SYSTEMS: OPERATIONAL</span>
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