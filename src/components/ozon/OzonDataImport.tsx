import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader, BarChart3, Trash2, Database, Activity, Zap } from 'lucide-react';
import { parseOzonFile } from '../../utils/ozonParser';
import { OzonImportService } from '../../services/ozonImportService';

interface OzonDataImportProps {
  onBack: () => void;
}

const OzonDataImport: React.FC<OzonDataImportProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const [ozonStats, setOzonStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadOzonStats = async () => {
    try {
      const stats = await OzonImportService.getOzonStats();
      setOzonStats(stats);
    } catch (error) {
      console.error('Failed to load OZON stats:', error);
    }
  };

  useEffect(() => {
    loadOzonStats();
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
    setProgress(0);
    setProgressMessage('Initializing OZON data protocols...');
    setImportResult(null);

    try {
      // Parse the OZON file
      setProgressMessage('Parsing OZON marketplace data streams...');
      setProgress(20);

      const parsedData = await parseOzonFile(selectedFile);

      setProgressMessage('OZON data stream validated');
      setProgress(40);

      if (parsedData.errors.length > 0) {
        console.warn('OZON parse warnings:', parsedData.errors);
      }

      // Import to ozon_data table
      setProgressMessage('Uploading to galactic database core...');
      setProgress(60);

      const result = await OzonImportService.importToOzonData(parsedData, {
        onProgress: (progressPercent, message) => {
          setProgress(60 + (progressPercent * 0.4)); // Scale to 60-100%
          setProgressMessage(message);
        }
      });

      setImportResult(result);
      
      if (result.success) {
        setProgressMessage('Data integration protocol completed');
        setProgress(100);
        await loadOzonStats(); // Refresh stats
      } else {
        setProgressMessage('Data integration protocol failed');
        setProgress(0);
      }

    } catch (error) {
      console.error('OZON import error:', error);
      setImportResult({
        success: false,
        recordsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'OZON import failed due to unexpected error'
      });
      setProgressMessage('Critical system failure detected');
      setProgress(0);
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('WARNING: Purge all OZON data from galactic database? This action cannot be reversed.')) {
      return;
    }

    try {
      const success = await OzonImportService.clearAllData();
      if (success) {
        alert('OZON data purge completed successfully');
        await loadOzonStats();
      } else {
        alert('Database purge operation failed');
      }
    } catch (error) {
      alert(`Purge error: ${error instanceof Error ? error.message : 'Unknown system failure'}`);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setProgress(0);
    setProgressMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%), 
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Panel */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 mb-6 border border-cyan-400/30 shadow-lg shadow-cyan-400/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded text-cyan-300 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-mono text-sm">Return to OZON Command</span>
              </button>
              <div className="h-6 border-l border-cyan-400/30"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-400/25 border border-cyan-300">
                  <Upload className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono">OZON Data Integration</h1>
                  <p className="text-cyan-400/80 text-sm font-mono">Marketplace Analytics Module</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-300 text-sm font-mono">SYSTEM ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Status Panel */}
        {ozonStats && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 mb-6 border border-cyan-400/30 shadow-lg shadow-cyan-400/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Database className="w-6 h-6 text-cyan-400" />
                <div>
                  <h2 className="text-xl font-bold text-cyan-300 font-mono">Database Core Status</h2>
                  <p className="text-cyan-400/80 text-sm font-mono">OZON_DATA TABLE</p>
                </div>
              </div>
              <button
                onClick={handleClearData}
                className="flex items-center space-x-2 px-4 py-2 bg-red-900/50 border border-red-500/50 text-red-300 rounded hover:bg-red-900/70 hover:border-red-400 transition-all duration-200 font-mono text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>PURGE ALL DATA</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Records</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-cyan-300 font-mono">{ozonStats.total_records.toLocaleString()}</p>
                <p className="text-cyan-400/60 text-xs font-mono">Data Entries</p>
              </div>
              
              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-teal-400 text-xs font-mono uppercase tracking-wider">Sellers</span>
                  <BarChart3 className="w-4 h-4 text-teal-400" />
                </div>
                <p className="text-2xl font-bold text-teal-300 font-mono">{ozonStats.unique_sellers}</p>
                <p className="text-teal-400/60 text-xs font-mono">Unique Entities</p>
              </div>
              
              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 text-xs font-mono uppercase tracking-wider">Categories</span>
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-purple-300 font-mono">{ozonStats.unique_categories}</p>
                <p className="text-purple-400/60 text-xs font-mono">Classifications</p>
              </div>
              
              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 text-xs font-mono uppercase tracking-wider">Last Sync</span>
                  <Upload className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-lg font-bold text-yellow-300 font-mono">{ozonStats.latest_import || 'NEVER'}</p>
                <p className="text-yellow-400/60 text-xs font-mono">Data Stream</p>
              </div>
            </div>
          </div>
        )}

        {/* Protocol Requirements Panel */}
        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/40 rounded-lg p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-bold text-yellow-300 font-mono">OZON Protocol Requirements</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm text-yellow-300/90 font-mono">
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>File format: <strong>OZON export (.xlsx/.xls)</strong></span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Technical rows: <strong>First 4 rows ignored</strong></span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Header protocol: <strong>Row 5 contains Russian headers</strong></span>
              </p>
            </div>
            <div className="space-y-2 text-sm text-yellow-300/90 font-mono">
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Data rows: <strong>Row 6+ contains records</strong></span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Field validation: <strong>31 required OZON fields</strong></span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Encoding: <strong>UTF-8 with Cyrillic support</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Import Panel */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 overflow-hidden">
          
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-cyan-900/50 to-teal-900/50 p-6 border-b border-cyan-400/30">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center border border-cyan-300">
                <FileSpreadsheet className="w-4 h-4 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-cyan-300 font-mono">Data Upload Interface</h2>
                <p className="text-cyan-400/80 text-sm font-mono">OZON Marketplace Data Import</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* File Upload Section */}
            <div className="mb-8">
              <div className="relative">
                <div className="border-2 border-dashed border-cyan-400/40 rounded-lg p-12 text-center bg-gray-800/30 hover:border-cyan-400/60 hover:bg-gray-800/50 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Animated corner accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-400"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-400"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-400"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-400"></div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="ozon-file-upload"
                  />
                  <label
                    htmlFor="ozon-file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-6"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/25 border border-cyan-300">
                      <Upload className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-cyan-300 font-mono mb-2">
                        Upload OZON Data File
                      </p>
                      <p className="text-cyan-400/80 font-mono text-sm">
                        Compatible formats: .xlsx | .xls | OZON Standard Export
                      </p>
                    </div>
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-6 bg-gray-800/60 border border-cyan-400/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center border border-emerald-300">
                          <FileSpreadsheet className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <p className="font-bold text-cyan-300 font-mono">{selectedFile.name}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-cyan-400/80 font-mono">
                              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span className="text-emerald-400 font-mono">READY</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={resetImport}
                        className="text-cyan-400/60 hover:text-cyan-300 transition-colors font-mono text-sm border border-cyan-400/30 px-3 py-1 rounded hover:border-cyan-400/50"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Import Control Panel */}
            <div className="bg-gray-800/30 border border-cyan-400/30 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-cyan-300 font-mono">Database Import Process</h3>
                  <p className="text-cyan-400/80 font-mono text-sm">Target: OZON_DATA table • Database Server</p>
                </div>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || importing}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-lg border transition-all duration-200 font-mono font-bold ${
                    !selectedFile || importing
                      ? 'bg-gray-700/50 border-gray-600/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 to-teal-600 border-cyan-400 text-black hover:from-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-400/25'
                  }`}
                >
                  {importing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>PROCESSING...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>START IMPORT</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Panel */}
            {importing && (
              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Loader className="w-5 h-5 text-cyan-400 animate-spin" />
                    <span className="text-cyan-300 font-mono font-bold">Import In Progress</span>
                  </div>
                  <span className="text-cyan-400 font-mono font-bold">{Math.round(progress)}%</span>
                </div>
                
                <div className="relative mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-3 border border-gray-600">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-teal-400 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                <p className="text-cyan-400/90 font-mono text-sm">{progressMessage}</p>
              </div>
            )}

            {/* Results Panel */}
            {importResult && (
              <div className={`border rounded-lg p-6 relative overflow-hidden ${
                importResult.success 
                  ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-emerald-400/40' 
                  : 'bg-gradient-to-r from-red-900/30 to-pink-900/30 border-red-400/40'
              }`}>
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  importResult.success 
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400' 
                    : 'bg-gradient-to-r from-red-400 to-pink-400'
                }`}></div>
                
                <div className="flex items-center space-x-3 mb-6">
                  {importResult.success ? (
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center border border-emerald-300">
                      <CheckCircle className="w-5 h-5 text-black" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center border border-red-300">
                      <AlertCircle className="w-5 h-5 text-black" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-xl font-bold font-mono ${
                      importResult.success ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                      {importResult.success ? 'IMPORT SUCCESSFUL' : 'IMPORT FAILED'}
                    </h3>
                    <p className={`font-mono text-sm ${
                      importResult.success ? 'text-emerald-400/80' : 'text-red-400/80'
                    }`}>
                      {importResult.message}
                    </p>
                  </div>
                </div>
                
                {importResult.recordsImported > 0 && (
                  <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-emerald-300 font-mono mb-3">IMPORT SUMMARY</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        <span className="text-emerald-400">Records: {importResult.recordsImported.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                        <span className="text-cyan-400">Target: ozon_data</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                        <span className="text-teal-400">Date: {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header Validation Results */}
                {importResult.headerValidation && (
                  <div className={`border rounded-lg p-4 mb-4 ${
                    importResult.headerValidation.isValid 
                      ? 'bg-emerald-900/20 border-emerald-400/30' 
                      : 'bg-red-900/20 border-red-400/30'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                        importResult.headerValidation.isValid 
                          ? 'bg-emerald-500 border-emerald-300' 
                          : 'bg-red-500 border-red-300'
                      }`}>
                        {importResult.headerValidation.isValid ? (
                          <CheckCircle className="w-4 h-4 text-black" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-black" />
                        )}
                      </div>
                      <h4 className={`font-bold font-mono ${
                        importResult.headerValidation.isValid ? 'text-emerald-300' : 'text-red-300'
                      }`}>
                        Header Validation: {importResult.headerValidation.isValid ? 'VALID' : 'INVALID'}
                      </h4>
                    </div>
                    
                    {importResult.headerValidation.missingFields?.length > 0 && (
                      <div className="mb-3 bg-red-900/20 border border-red-500/30 rounded p-3">
                        <p className="text-red-300 font-mono font-bold text-sm mb-2">MISSING REQUIRED FIELDS:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {importResult.headerValidation.missingFields.map((field: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                              <span className="text-red-400 font-mono text-xs">{field}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {importResult.headerValidation.extraFields?.length > 0 && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                        <p className="text-yellow-300 font-mono font-bold text-sm mb-2">ADDITIONAL FIELDS DETECTED:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {importResult.headerValidation.extraFields.map((field: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                              <span className="text-yellow-400 font-mono text-xs">{field}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                    <h4 className="font-bold text-red-300 font-mono mb-3">ERROR DETAILS:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.errors.map((error: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-red-400 font-mono text-xs leading-relaxed">{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.success && (
                  <div className="bg-gradient-to-r from-cyan-900/20 to-teal-900/20 border border-cyan-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      <h4 className="font-bold text-cyan-300 font-mono">NEXT STEPS:</h4>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => loadOzonStats()}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 border border-cyan-400 text-black rounded hover:from-cyan-500 hover:to-teal-500 transition-all duration-200 font-mono font-bold"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>REFRESH DATABASE STATUS</span>
                      </button>
                      <p className="text-cyan-400/90 text-sm font-mono leading-relaxed">
                        Data import completed. OZON marketplace data is now available for AI analysis.
                        Navigate to Product Analysis module to begin automated product grouping.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
            <span className="text-cyan-300 font-mono font-bold text-sm">OZON DATA IMPORT MODULE</span>
            <div className="text-cyan-400/60 font-mono text-xs">|</div>
            <span className="text-cyan-400/80 font-mono text-sm">STATUS: ONLINE</span>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OzonDataImport;