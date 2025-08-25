import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, Check, AlertCircle, ArrowLeft, Download, Database, Trash2, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { parseCSVFile, parseExcelFile, ParsedData, ProductRow } from '../utils/csvParser';

interface ExcelImportProps {
  onBack: () => void;
}

interface ImportSession {
  id: string;
  filename: string;
  uploadDate: Date;
  status: 'processing' | 'parsed' | 'imported' | 'error';
  parsedData?: ParsedData;
  errorMessage?: string;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [importSessions, setImportSessions] = useState<ImportSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ImportSession | null>(null);
  const [isImporting, setIsImporting] = useState(false);
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
    // Reset input value to allow same file to be selected again
    e.target.value = '';
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.type.includes('sheet') || 
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls') || 
          file.name.endsWith('.csv')) {
        
        const session: ImportSession = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          filename: file.name,
          uploadDate: new Date(),
          status: 'processing'
        };

        setImportSessions(prev => [session, ...prev]);

        try {
          let parsedData: ParsedData;
          
          if (file.name.endsWith('.csv')) {
            parsedData = await parseCSVFile(file);
          } else {
            parsedData = await parseExcelFile(file);
          }

          setImportSessions(prev => 
            prev.map(s => 
              s.id === session.id 
                ? { ...s, status: 'parsed', parsedData }
                : s
            )
          );

        } catch (error) {
          setImportSessions(prev => 
            prev.map(s => 
              s.id === session.id 
                ? { 
                    ...s, 
                    status: 'error', 
                    errorMessage: error instanceof Error ? error.message : 'Unknown error'
                  }
                : s
            )
          );
        }
      }
    }
  };

  const handleImportToDatabase = async (session: ImportSession) => {
    if (!session.parsedData || session.parsedData.rows.length === 0) return;

    setIsImporting(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(session.parsedData.rows);

      if (error) throw error;

      setImportSessions(prev => 
        prev.map(s => 
          s.id === session.id 
            ? { ...s, status: 'imported' }
            : s
        )
      );

    } catch (error) {
      console.error('Import error:', error);
      setImportSessions(prev => 
        prev.map(s => 
          s.id === session.id 
            ? { 
                ...s, 
                status: 'error', 
                errorMessage: error instanceof Error ? error.message : 'Database import failed'
              }
            : s
        )
      );
    } finally {
      setIsImporting(false);
    }
  };

  const removeSession = (sessionId: string) => {
    setImportSessions(prev => prev.filter(s => s.id !== sessionId));
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
  };

  const downloadAsCSV = (data: ProductRow[]) => {
    const headers = ['external_id', 'name', 'category', 'price', 'quantity', 'supplier', 'import_date'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header as keyof ProductRow];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `processed-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
                  <p className="text-blue-200">Upload Excel/CSV files and import to database</p>
                  <p className="text-blue-300 text-sm">Supports: .xlsx, .xls, .csv</p>
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
                  Drop files here or click to browse
                </p>
                <p className="text-blue-200 text-sm mb-4">
                  Supports Excel (.xlsx, .xls) and CSV files
                </p>
                <div className="text-xs text-blue-300 bg-white/5 rounded-lg p-3">
                  <p className="font-medium mb-2">Expected columns:</p>
                  <p>id, name, category, price, quantity, supplier, date</p>
                </div>
                
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

            {/* Import Sessions */}
            <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Import Sessions</h2>
              
              {importSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-200">No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {importSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all duration-200
                        ${selectedSession?.id === session.id
                          ? 'bg-white/15 border-emerald-400/50' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${session.status === 'imported' ? 'bg-emerald-500/20' : 
                              session.status === 'parsed' ? 'bg-blue-500/20' :
                              session.status === 'error' ? 'bg-red-500/20' : 
                              'bg-yellow-500/20'
                            }
                          `}>
                            {session.status === 'imported' ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : session.status === 'parsed' ? (
                              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                            ) : session.status === 'error' ? (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                            )}
                          </div>
                          
                          <div>
                            <p className="font-medium text-white text-sm">{session.filename}</p>
                            <div className="flex items-center gap-2 text-xs text-blue-200">
                              <span>{session.uploadDate.toLocaleDateString()}</span>
                              {session.parsedData && (
                                <>
                                  <span>•</span>
                                  <span>{session.parsedData.stats.validRows} valid rows</span>
                                  {session.parsedData.stats.errorRows > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-yellow-400">{session.parsedData.stats.errorRows} errors</span>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSession(session.id);
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
              {selectedSession?.status === 'parsed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImportToDatabase(selectedSession)}
                    disabled={isImporting}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    {isImporting ? 'Importing...' : 'Import to DB'}
                  </button>
                  <button
                    onClick={() => selectedSession.parsedData && downloadAsCSV(selectedSession.parsedData.rows)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Export CSV
                  </button>
                </div>
              )}
            </div>
            
            {!selectedSession ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-200 mb-2">Select a session to preview data</p>
                <p className="text-blue-300 text-sm">Upload a file or click on any import session</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Session Info */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-200">Filename</p>
                      <p className="text-white font-medium">{selectedSession.filename}</p>
                    </div>
                    <div>
                      <p className="text-blue-200">Status</p>
                      <div className="flex items-center gap-2">
                        {selectedSession.status === 'imported' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Imported to Database</span>
                          </>
                        ) : selectedSession.status === 'parsed' ? (
                          <>
                            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400">Parsed & Ready</span>
                          </>
                        ) : selectedSession.status === 'error' ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Error</span>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                            <span className="text-yellow-400">Processing</span>
                          </>
                        )}
                      </div>
                    </div>
                    {selectedSession.parsedData && (
                      <>
                        <div>
                          <p className="text-blue-200">Valid Rows</p>
                          <p className="text-white font-medium">{selectedSession.parsedData.stats.validRows.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-blue-200">Columns</p>
                          <p className="text-white font-medium">{selectedSession.parsedData.headers.length}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {selectedSession.status === 'error' && selectedSession.errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-medium">Import Error</span>
                    </div>
                    <p className="text-red-300 text-sm">{selectedSession.errorMessage}</p>
                  </div>
                )}

                {/* Errors List */}
                {selectedSession.parsedData && selectedSession.parsedData.errors.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Parsing Warnings ({selectedSession.parsedData.errors.length})</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedSession.parsedData.errors.slice(0, 10).map((error, index) => (
                        <p key={index} className="text-yellow-300 text-xs">{error}</p>
                      ))}
                      {selectedSession.parsedData.errors.length > 10 && (
                        <p className="text-yellow-400 text-xs">... and {selectedSession.parsedData.errors.length - 10} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Data Table */}
                {selectedSession.parsedData && selectedSession.parsedData.rows.length > 0 && (
                  <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/10">
                            <th className="px-3 py-2 text-left text-blue-200 font-medium">Name</th>
                            <th className="px-3 py-2 text-left text-blue-200 font-medium">Category</th>
                            <th className="px-3 py-2 text-left text-blue-200 font-medium">Price</th>
                            <th className="px-3 py-2 text-left text-blue-200 font-medium">Quantity</th>
                            <th className="px-3 py-2 text-left text-blue-200 font-medium">Supplier</th>
                            <th className="px-3 py-2 text-left text-blue-200 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSession.parsedData.rows.slice(0, 10).map((row, index) => (
                            <tr key={index} className="border-t border-white/10">
                              <td className="px-3 py-2 text-white">{row.name}</td>
                              <td className="px-3 py-2 text-white">{row.category}</td>
                              <td className="px-3 py-2 text-white">{row.price ? `$${row.price}` : '-'}</td>
                              <td className="px-3 py-2 text-white">{row.quantity || '-'}</td>
                              <td className="px-3 py-2 text-white">{row.supplier || '-'}</td>
                              <td className="px-3 py-2 text-white">{row.import_date || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {selectedSession.parsedData.rows.length > 10 && (
                      <div className="p-3 bg-white/5 text-center text-blue-200 text-sm">
                        Showing first 10 rows of {selectedSession.parsedData.rows.length} valid records
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
            <p className="text-white font-medium text-sm">
              Excel Import Module Active • {importSessions.filter(s => s.status === 'imported').length} Files Imported • 
              {importSessions.reduce((sum, s) => sum + (s.parsedData?.stats.validRows || 0), 0)} Total Records
            </p>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;