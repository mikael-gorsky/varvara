import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, Check, AlertCircle, ArrowLeft, Download, Database, Trash2 } from 'lucide-react';

interface ExcelImportProps {
  onBack: () => void;
}

interface ImportedData {
  id: string;
  filename: string;
  uploadDate: Date;
  rows: number;
  columns: string[];
  data: Record<string, any>[];
  status: 'processing' | 'success' | 'error';
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [importedFiles, setImportedFiles] = useState<ImportedData[]>([]);
  const [selectedFile, setSelectedFile] = useState<ImportedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        // Simulate processing
        const newImport: ImportedData = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          filename: file.name,
          uploadDate: new Date(),
          rows: Math.floor(Math.random() * 1000) + 100,
          columns: ['ID', 'Name', 'Category', 'Price', 'Quantity', 'Supplier', 'Date'],
          data: generateSampleData(),
          status: 'processing'
        };

        setImportedFiles(prev => [newImport, ...prev]);

        // Simulate processing time
        setTimeout(() => {
          setImportedFiles(prev => 
            prev.map(item => 
              item.id === newImport.id 
                ? { ...item, status: Math.random() > 0.1 ? 'success' : 'error' }
                : item
            )
          );
        }, 2000 + Math.random() * 3000);
      }
    }
  };

  const generateSampleData = (): Record<string, any>[] => {
    const sampleData = [];
    const categories = ['Office Equipment', 'Packaging', 'Binding', 'Electronics', 'Furniture'];
    const suppliers = ['SupplierA', 'SupplierB', 'SupplierC', 'SupplierD'];
    
    for (let i = 1; i <= 10; i++) {
      sampleData.push({
        ID: `PROD-${1000 + i}`,
        Name: `Product ${i}`,
        Category: categories[Math.floor(Math.random() * categories.length)],
        Price: (Math.random() * 1000 + 50).toFixed(2),
        Quantity: Math.floor(Math.random() * 100) + 1,
        Supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
        Date: new Date().toISOString().split('T')[0]
      });
    }
    return sampleData;
  };

  const removeFile = (fileId: string) => {
    setImportedFiles(prev => prev.filter(file => file.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-6">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Excel Data Import</h1>
                  <p className="text-blue-200">Upload and process Excel files</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Upload Area */}
          <div className="space-y-6">
            
            {/* File Upload Zone */}
            <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Upload Files</h2>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                  ${isDragging 
                    ? 'border-emerald-400 bg-emerald-400/10' 
                    : 'border-blue-300/50 hover:border-emerald-400/70 hover:bg-white/5'
                  }
                `}
              >
                <Upload className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">
                  Drop Excel files here or click to browse
                </p>
                <p className="text-blue-200 text-sm">
                  Supports .xlsx, .xls, and .csv files
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Import History */}
            <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Import History</h2>
              
              {importedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-200">No files imported yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {importedFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all duration-200
                        ${selectedFile?.id === file.id
                          ? 'bg-white/15 border-emerald-400/50' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${file.status === 'success' ? 'bg-emerald-500/20' : 
                              file.status === 'error' ? 'bg-red-500/20' : 
                              'bg-blue-500/20'
                            }
                          `}>
                            {file.status === 'success' ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : file.status === 'error' ? (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                            )}
                          </div>
                          
                          <div>
                            <p className="font-medium text-white text-sm">{file.filename}</p>
                            <p className="text-xs text-blue-200">
                              {file.uploadDate.toLocaleDateString()} • {file.rows} rows
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="w-6 h-6 bg-red-500/20 hover:bg-red-500/30 rounded flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Data Preview */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Data Preview</h2>
              {selectedFile && (
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm hover:bg-emerald-500/30 transition-colors">
                    Save to DB
                  </button>
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-colors">
                    <Download className="w-3 h-3 inline mr-1" />
                    Export
                  </button>
                </div>
              )}
            </div>
            
            {!selectedFile ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-200 mb-2">Select a file to preview data</p>
                <p className="text-blue-300 text-sm">Click on any imported file from the history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Info */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-200">Filename</p>
                      <p className="text-white font-medium">{selectedFile.filename}</p>
                    </div>
                    <div>
                      <p className="text-blue-200">Status</p>
                      <div className="flex items-center gap-2">
                        {selectedFile.status === 'success' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Imported</span>
                          </>
                        ) : selectedFile.status === 'error' ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Error</span>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-blue-400">Processing</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-blue-200">Rows</p>
                      <p className="text-white font-medium">{selectedFile.rows.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-200">Columns</p>
                      <p className="text-white font-medium">{selectedFile.columns.length}</p>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                {selectedFile.status === 'success' && (
                  <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/10">
                            {selectedFile.columns.map((column) => (
                              <th key={column} className="px-3 py-2 text-left text-blue-200 font-medium">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFile.data.slice(0, 10).map((row, index) => (
                            <tr key={index} className="border-t border-white/10">
                              {selectedFile.columns.map((column) => (
                                <td key={column} className="px-3 py-2 text-white">
                                  {row[column]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {selectedFile.data.length > 10 && (
                      <div className="p-3 bg-white/5 text-center text-blue-200 text-sm">
                        Showing first 10 rows of {selectedFile.data.length}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <p className="text-white font-medium text-sm">Excel Import Module Active • {importedFiles.filter(f => f.status === 'success').length} Files Processed</p>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;