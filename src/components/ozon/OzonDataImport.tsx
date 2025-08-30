import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader, BarChart3, Trash2 } from 'lucide-react';
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
    setProgressMessage('Preparing OZON import...');
    setImportResult(null);

    try {
      // Parse the OZON file
      setProgressMessage('Parsing OZON file format...');
      setProgress(20);

      const parsedData = await parseOzonFile(selectedFile);

      setProgressMessage('OZON file parsed successfully');
      setProgress(40);

      if (parsedData.errors.length > 0) {
        console.warn('OZON parse warnings:', parsedData.errors);
      }

      // Import to ozon_data table
      setProgressMessage('Importing to ozon_data table...');
      setProgress(60);

      const result = await OzonImportService.importToOzonData(parsedData, {
        onProgress: (progressPercent, message) => {
          setProgress(60 + (progressPercent * 0.4)); // Scale to 60-100%
          setProgressMessage(message);
        }
      });

      setImportResult(result);
      
      if (result.success) {
        setProgressMessage('OZON import completed successfully!');
        setProgress(100);
        await loadOzonStats(); // Refresh stats
      } else {
        setProgressMessage('OZON import failed');
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
      setProgressMessage('OZON import failed');
      setProgress(0);
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear ALL OZON data? This cannot be undone.')) {
      return;
    }

    try {
      const success = await OzonImportService.clearAllData();
      if (success) {
        alert('All OZON data cleared successfully');
        await loadOzonStats();
      } else {
        alert('Failed to clear OZON data');
      }
    } catch (error) {
      alert(`Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to OZON Dashboard</span>
            </button>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
              <Upload className="w-8 h-8 text-green-600" />
              <span>OZON Data Import</span>
            </h1>
          </div>
        </div>

        {/* Current OZON Data Stats */}
        {ozonStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Current OZON Data</span>
              </h2>
              <button
                onClick={handleClearData}
                className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Records</p>
                <p className="text-2xl font-bold text-blue-800">{ozonStats.total_records.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Unique Sellers</p>
                <p className="text-2xl font-bold text-green-800">{ozonStats.unique_sellers}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Categories</p>
                <p className="text-2xl font-bold text-purple-800">{ozonStats.unique_categories}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Latest Import</p>
                <p className="text-sm font-bold text-orange-800">{ozonStats.latest_import || 'Never'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Import Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">OZON File Format Requirements</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>• File must be in <strong>OZON export format</strong> (.xlsx or .xls)</p>
            <p>• First 4 rows are technical data (will be ignored)</p>
            <p>• Row 5 must contain Russian field headers exactly as exported from OZON</p>
            <p>• Data rows start from row 6</p>
            <p>• All 31 required OZON fields must be present</p>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Upload OZON Export File</span>
          </h2>

          {/* File Upload Area */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
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
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Choose OZON Export File
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .xlsx and .xls formats from OZON marketplace
                  </p>
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetImport}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Controls */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Import to OZON_data Table</h3>
              <p className="text-gray-600">Data will be imported to the Supabase ozon_data table</p>
            </div>
            <button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span>{importing ? 'Importing...' : 'Start Import'}</span>
            </button>
          </div>

          {/* Progress Bar */}
          {importing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Import Progress</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{progressMessage}</p>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className={`p-6 rounded-lg border-2 ${
              importResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                {importResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <h3 className={`text-lg font-semibold ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.success ? 'OZON Import Successful' : 'OZON Import Failed'}
                </h3>
              </div>
              
              <div className="space-y-3">
                <p className={`${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {importResult.message}
                </p>
                
                {importResult.recordsImported > 0 && (
                  <div className="bg-white p-4 rounded border">
                    <p className="font-medium text-green-800 mb-2">Import Summary:</p>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Records imported: {importResult.recordsImported.toLocaleString()}</li>
                      <li>• Target table: ozon_data</li>
                      <li>• Import date: {new Date().toLocaleDateString()}</li>
                    </ul>
                  </div>
                )}

                {/* Header Validation Results */}
                {importResult.headerValidation && (
                  <div className={`p-4 rounded border ${
                    importResult.headerValidation.isValid 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`font-medium mb-2 ${
                      importResult.headerValidation.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Header Validation: {importResult.headerValidation.isValid ? 'Valid' : 'Invalid'}
                    </p>
                    
                    {importResult.headerValidation.missingFields?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-red-700">Missing Fields:</p>
                        <ul className="text-sm text-red-600 ml-4">
                          {importResult.headerValidation.missingFields.map((field: string, index: number) => (
                            <li key={index}>• {field}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {importResult.headerValidation.extraFields?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-orange-700">Extra Fields Found:</p>
                        <ul className="text-sm text-orange-600 ml-4">
                          {importResult.headerValidation.extraFields.map((field: string, index: number) => (
                            <li key={index}>• {field}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-red-800 mb-2">Errors and Warnings:</p>
                    <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
                      {importResult.errors.map((error: string, index: number) => (
                        <li key={index} className="text-red-700 text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {importResult.success && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium mb-3">Next Steps:</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => loadOzonStats()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Refresh Stats</span>
                    </button>
                    <p className="text-sm text-blue-700">
                      Your OZON data is now ready for analysis. Use the Product Analysis tool to group and analyze the imported data.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OzonDataImport;