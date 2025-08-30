import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { parseCSVFile, parseExcelFile } from '../../utils/csvParser';
import { ImportService } from '../../services/importService';

interface OzonDataImportProps {
  onBack: () => void;
}

const OzonDataImport: React.FC<OzonDataImportProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setProgressMessage('Preparing import...');
    setImportResult(null);

    try {
      // Parse the file
      setProgressMessage('Parsing file...');
      setProgress(20);

      const isExcel = selectedFile.name.toLowerCase().endsWith('.xlsx') || selectedFile.name.toLowerCase().endsWith('.xls');
      const parsedData = isExcel 
        ? await parseExcelFile(selectedFile)
        : await parseCSVFile(selectedFile);

      setProgressMessage('File parsed successfully');
      setProgress(40);

      if (parsedData.errors.length > 0) {
        console.warn('Parse warnings:', parsedData.errors);
      }

      // Import to database
      setProgressMessage('Importing to database...');
      setProgress(60);

      const result = await ImportService.importToProducts(parsedData, {
        onProgress: (progressPercent, message) => {
          setProgress(60 + (progressPercent * 0.4)); // Scale to 60-100%
          setProgressMessage(message);
        }
      });

      setImportResult(result);
      
      if (result.success) {
        setProgressMessage('Import completed successfully!');
        setProgress(100);
      } else {
        setProgressMessage('Import failed');
        setProgress(0);
      }

    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        recordsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Import failed due to unexpected error'
      });
      setProgressMessage('Import failed');
      setProgress(0);
    } finally {
      setImporting(false);
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

        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Upload Data File</span>
          </h2>

          {/* File Upload Area */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Choose Excel or CSV file
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .xlsx, .xls, and .csv formats
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
              <h3 className="text-lg font-semibold text-gray-800">Import to Products Table</h3>
              <p className="text-gray-600">Data will be imported to the Supabase products table</p>
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
                  {importResult.success ? 'Import Successful' : 'Import Failed'}
                </h3>
              </div>
              
              <div className="space-y-2">
                <p className={`${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {importResult.message}
                </p>
                
                {importResult.recordsImported > 0 && (
                  <p className="text-green-700">
                    Successfully imported {importResult.recordsImported} records
                  </p>
                )}
                
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-red-800 mb-2">Errors:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="text-red-700 text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OzonDataImport;