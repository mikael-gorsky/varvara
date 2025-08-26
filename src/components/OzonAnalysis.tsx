import React, { useState, useCallback } from 'react';
import { ArrowLeft, FileSpreadsheet, Upload, AlertTriangle, CheckCircle, Database, Download, Trash2 } from 'lucide-react';
import { parseCSVFile, parseExcelFile, ParsedData, ProductRow } from '../utils/csvParser';
import { supabase } from '../lib/supabase';

interface OzonAnalysisProps {
  onBack: () => void;
}

const OzonAnalysis: React.FC<OzonAnalysisProps> = ({ onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, ParsedData>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  }, []);

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    
    for (const file of files) {
      try {
        let parsedData: ParsedData;
        
        if (file.name.endsWith('.csv')) {
          parsedData = await parseCSVFile(file);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          parsedData = await parseExcelFile(file);
        } else {
          console.warn(`Unsupported file type: ${file.name}`);
          continue;
        }

        setUploadedFiles(prev => new Map(prev.set(file.name, parsedData)));
        
        if (!selectedFile) {
          setSelectedFile(file.name);
        }
        
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error);
      }
    }
    
    setIsUploading(false);
  };

  const importToDatabase = async (fileName: string) => {
    const data = uploadedFiles.get(fileName);
    if (!data) return;

    setIsImporting(true);
    
    try {
      const { data: insertedData, error } = await supabase
        .from('products')
        .insert(data.rows)
        .select();

      if (error) {
        console.error('Import error:', error);
        alert(`Import failed: ${error.message}`);
      } else {
        alert(`Successfully imported ${insertedData?.length || 0} products to database!`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please try again.');
    }
    
    setIsImporting(false);
  };

  const exportCSV = (fileName: string) => {
    const data = uploadedFiles.get(fileName);
    if (!data) return;

    const headers = ['Name', 'Category', 'Price', 'Quantity', 'Supplier', 'Import Date'];
    const csvContent = [
      headers.join(','),
      ...data.rows.map(row => [
        `"${row.name}"`,
        `"${row.category}"`,
        row.price || '',
        row.quantity || '',
        `"${row.supplier || ''}"`,
        row.import_date || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_cleaned.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeFile = (fileName: string) => {
    const newFiles = new Map(uploadedFiles);
    newFiles.delete(fileName);
    setUploadedFiles(newFiles);
    
    if (selectedFile === fileName) {
      const remainingFiles = Array.from(newFiles.keys());
      setSelectedFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
    }
  };

  const selectedData = selectedFile ? uploadedFiles.get(selectedFile) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">OZON Data Analysis</h1>
                <p className="text-blue-200">Import and analyze OZON marketplace reports</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Upload Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload OZON Reports
            </h2>
            
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-emerald-400 bg-emerald-400/10' 
                  : 'border-white/30 hover:border-white/50'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">
                {isDragging ? 'Drop OZON reports here' : 'Drop OZON reports here or click to browse'}
              </p>
              <p className="text-blue-300 text-sm mb-4">Supports Excel (.xlsx, .xls) and CSV files</p>
              
              <input
                type="file"
                multiple
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Processing...' : 'Select Files'}
              </label>
            </div>

            <div className="mt-6 text-xs text-blue-300">
              <p className="font-medium mb-2">Expected columns:</p>
              <p>Any structure with at least 2 columns</p>
              <p className="mt-2">Auto-detects: наименование, категория, цена, количество, поставщик, дата</p>
              <p className="mt-2">Supports Russian: наименование, категория, цена, количество, поставщик, дата</p>
            </div>
          </div>

          {/* Import Sessions */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Import Sessions</h2>
            
            {uploadedFiles.size === 0 ? (
              <div className="text-center py-8">
                <FileSpreadsheet className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(uploadedFiles.entries()).map(([fileName, data]) => (
                  <div
                    key={fileName}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedFile === fileName
                        ? 'bg-white/15 border-emerald-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedFile(fileName)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-white text-sm truncate">{fileName}</h3>
                          <div className="flex items-center gap-4 text-xs text-blue-300 mt-1">
                            <span>{new Date().toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{data.stats.validRows} valid rows</span>
                            <span>•</span>
                            <span className={data.stats.errorRows > 0 ? 'text-yellow-400' : 'text-emerald-400'}>
                              {data.stats.errorRows} errors
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(fileName);
                        }}
                        className="w-6 h-6 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Data Preview */}
        {selectedData && (
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Data Preview</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectedFile && importToDatabase(selectedFile)}
                  disabled={isImporting || selectedData.stats.validRows === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 text-white rounded-lg transition-colors text-sm"
                >
                  <Database className="w-4 h-4" />
                  {isImporting ? 'Importing...' : 'Import to DB'}
                </button>
                <button
                  onClick={() => selectedFile && exportCSV(selectedFile)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm">Filename</p>
                <p className="text-white font-semibold text-sm truncate">{selectedFile}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm">Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-emerald-400 font-semibold text-sm">Parsed & Ready</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm">Valid Rows</p>
                <p className="text-white font-semibold">{selectedData.stats.validRows}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-blue-200 text-sm">Columns</p>
                <p className="text-white font-semibold">{selectedData.headers.length}</p>
              </div>
            </div>

            {selectedData.errors.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-yellow-400 font-semibold">Parsing Warnings ({selectedData.errors.length})</h3>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {selectedData.errors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-yellow-300 text-sm">{error}</p>
                  ))}
                  {selectedData.errors.length > 5 && (
                    <p className="text-yellow-400 text-sm mt-2">...and {selectedData.errors.length - 5} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Field Mapping Preview */}
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                ERP Data Columns ({selectedData.headers.length} columns)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {selectedData.headers.map((header, index) => {
                  const sampleValue = selectedData.rows.find(row => {
                    const rowArray = Object.values(row);
                    return rowArray[index] && String(rowArray[index]).trim();
                  });
                  const sampleData = sampleValue ? Object.values(sampleValue)[index] : 'N/A';
                  
                  return (
                    <div key={index} className="bg-white/5 rounded p-3">
                      <p className="text-blue-200 text-xs font-medium mb-1 truncate" title={header}>
                        {header || `Column ${index + 1}`}
                      </p>
                      <p className="text-blue-300 text-xs truncate" title={String(sampleData)}>
                        {String(sampleData)}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-emerald-500/10 rounded border border-emerald-500/30">
                <h4 className="text-emerald-300 text-sm font-medium mb-2">✅ ERP Column Headers (Row 5):</h4>
                <p className="text-emerald-200 text-xs leading-relaxed">
                  {selectedData.headers.join(' | ')}
                </p>
                <p className="text-emerald-300 text-xs mt-2">
                  Successfully imported all {selectedData.headers.length} columns from your ERP system
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-4">
          <div className="flex items-center justify-center space-x-3">
                    {selectedData.headers.slice(0, 8).map((header, index) => (
                      <th key={index} className="text-left text-blue-200 p-3 font-medium text-xs truncate max-w-32" title={header}>
                        {header || `Col ${index + 1}`}
                      </th>
                    ))}
                    {selectedData.headers.length > 8 && (
                      <th className="text-left text-blue-200 p-3 font-medium text-xs">
                        ...+{selectedData.headers.length - 8} more
                      </th>
                  {selectedData.rows.slice(0, 5).map((row, rowIndex) => {
                    const rowArray = Object.values(row);
                    return (
                      <tr key={rowIndex} className="border-b border-white/10 hover:bg-white/5">
                        {selectedData.headers.slice(0, 8).map((_, colIndex) => (
                          <td key={colIndex} className="text-white p-3 text-xs truncate max-w-32" title={String(rowArray[colIndex] || '')}>
                            {String(rowArray[colIndex] || '-')}
                          </td>
                        ))}
                        {selectedData.headers.length > 8 && (
                          <td className="text-blue-300 p-3 text-xs">...</td>
                        )}
                      </tr>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Import Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-200">Total Rows</p>
                  <p className="text-white font-bold">{selectedData.rows.length}</p>
                </div>
                <div>
                  <p className="text-blue-200">Total Columns</p>
                  <p className="text-white font-bold">{selectedData.headers.length}</p>
                </div>
                <div>
                  <p className="text-blue-200">Data Source</p>
                  <p className="text-white font-bold">ERP Row 5+</p>
                </div>
                <div>
                  <p className="text-blue-200">Status</p>
                  <p className="text-emerald-400 font-bold">Ready to Import</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <p className="text-white font-medium text-sm">OZON Analysis Module Active • Ready for Data Import</p>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OzonAnalysis;
export default OzonAnalysis;