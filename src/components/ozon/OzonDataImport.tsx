import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, BarChart3, Database, Activity, Zap, CheckCircle, XCircle } from 'lucide-react';
import { ozonImportService, OzonStats } from '../../services/ozonImportService';
import { batchImportService, BatchImportProgress, BatchImportResult } from '../../services/batchImportService';
import MultiFileUploadQueue, { QueuedFile } from './MultiFileUploadQueue';
import ImportHistoryViewer from './ImportHistoryViewer';

interface OzonDataImportProps {
  onBack: () => void;
}

const OzonDataImport: React.FC<OzonDataImportProps> = ({ onBack }) => {
  const [validatedFiles, setValidatedFiles] = useState<QueuedFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<BatchImportProgress | null>(null);
  const [importResult, setImportResult] = useState<BatchImportResult | null>(null);
  const [ozonStats, setOzonStats] = useState<OzonStats | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const loadOzonStats = async () => {
    try {
      const stats = await ozonImportService.getStats();
      setOzonStats(stats);
    } catch (error) {
      console.error('Failed to load OZON stats:', error);
    }
  };

  useEffect(() => {
    loadOzonStats();
  }, []);

  const handleFilesValidated = (files: QueuedFile[]) => {
    setValidatedFiles(files);
  };

  const handleBatchImport = async () => {
    const filesToImport = validatedFiles
      .filter(f =>
        f.status === 'valid' ||
        (f.status === 'duplicate' && !skipDuplicates) ||
        (f.status === 'database_duplicate' && !skipDuplicates) ||
        (f.status === 'cross_file_duplicate' && !skipDuplicates)
      )
      .map(f => f.file);

    if (filesToImport.length === 0) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await batchImportService.importFiles(filesToImport, {
        skipDuplicates,
        onProgress: (progress) => {
          setImportProgress(progress);
        }
      });

      setImportResult(result);
      await loadOzonStats();
    } catch (error) {
      console.error('Batch import failed:', error);
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all OZON data? This action cannot be undone.')) {
      return;
    }

    try {
      await ozonImportService.clearData();
      await loadOzonStats();
    } catch (error) {
      console.error('Failed to clear data:', error);
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

  const validFilesCount = validatedFiles.filter(f => f.status === 'valid').length;
  const duplicateFilesCount = validatedFiles.filter(f => f.isDuplicate).length;

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-6xl mx-auto space-y-8">

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
                    Multi-File OZON Marketplace Import
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

        {ozonStats && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-teal-400"></div>

            <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center space-x-3 font-mono tracking-wide">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <span>CURRENT DATABASE STATUS</span>
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-blue-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-teal-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Total Products</span>
                  <Database className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-300 font-mono">{ozonStats.totalProducts.toLocaleString()}</p>
              </div>

              <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Total Revenue</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-300 font-mono">{formatCurrency(ozonStats.totalRevenue)}</p>
              </div>

              <div className="bg-gray-800/50 border border-teal-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Avg Price</span>
                  <BarChart3 className="w-4 h-4 text-teal-400" />
                </div>
                <p className="text-2xl font-bold text-teal-300 font-mono">{formatCurrency(ozonStats.averagePrice)}</p>
              </div>

              <div className="bg-gray-800/50 border border-orange-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Categories</span>
                  <Database className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-orange-300 font-mono">{ozonStats.topCategories.length}</p>
              </div>
            </div>
          </div>
        )}

        <MultiFileUploadQueue onFilesValidated={handleFilesValidated} />

        {validatedFiles.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

            <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center space-x-3 font-mono tracking-wide">
              <Upload className="w-6 h-6 text-emerald-400" />
              <span>BATCH IMPORT CONTROL</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-cyan-400/30 rounded-lg">
                <div>
                  <p className="text-cyan-300 font-mono font-bold">{validFilesCount} files ready to import</p>
                  {duplicateFilesCount > 0 && (
                    <p className="text-orange-300 text-sm font-mono mt-1">
                      {duplicateFilesCount} duplicate files detected
                    </p>
                  )}
                </div>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded border-cyan-400"
                  />
                  <span className="text-cyan-300 font-mono text-sm">Skip duplicate files</span>
                </label>
              </div>

              {importProgress && (
                <div className="p-4 bg-cyan-900/20 border border-cyan-400/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-300 font-mono text-sm">
                      Processing: {importProgress.currentFile}
                    </span>
                    <span className="text-cyan-400 font-mono text-sm">
                      {importProgress.currentFileIndex + 1} / {importProgress.totalFiles}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300"
                      style={{ width: `${(importProgress.filesCompleted / importProgress.totalFiles) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs font-mono text-cyan-400">
                    <span>Completed: {importProgress.filesCompleted}</span>
                    <span>Records: {importProgress.totalRecordsImported}</span>
                    <span>Skipped: {importProgress.filesSkipped}</span>
                  </div>
                </div>
              )}

              {importResult && (
                <div className={`p-4 rounded-lg border ${
                  importResult.success
                    ? 'bg-emerald-900/20 border-emerald-400/30'
                    : 'bg-red-900/20 border-red-400/30'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    {importResult.success ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <h3 className={`font-mono font-bold ${
                      importResult.success ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                      IMPORT {importResult.success ? 'COMPLETED' : 'COMPLETED WITH ERRORS'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm font-mono">
                    <div>
                      <span className="text-cyan-400">Processed:</span>{' '}
                      <span className="text-emerald-300 font-bold">{importResult.filesProcessed}</span>
                    </div>
                    <div>
                      <span className="text-cyan-400">Skipped:</span>{' '}
                      <span className="text-orange-300 font-bold">{importResult.filesSkipped}</span>
                    </div>
                    <div>
                      <span className="text-cyan-400">Failed:</span>{' '}
                      <span className="text-red-300 font-bold">{importResult.filesFailed}</span>
                    </div>
                    <div>
                      <span className="text-cyan-400">Records:</span>{' '}
                      <span className="text-emerald-300 font-bold">{importResult.totalRecordsImported}</span>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-red-400/30">
                      <p className="text-red-300 font-mono text-xs font-bold mb-2">ERRORS:</p>
                      {importResult.errors.map((err, idx) => (
                        <p key={idx} className="text-red-300 text-xs font-mono">
                          • {err.fileName}: {err.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBatchImport}
                  disabled={importing || validFilesCount === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 text-black rounded hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold"
                >
                  {importing ? (
                    <>
                      <Activity className="w-5 h-5 animate-spin" />
                      <span>IMPORTING...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>START IMPORT</span>
                    </>
                  )}
                </button>

                {ozonStats && ozonStats.totalProducts > 0 && (
                  <button
                    onClick={handleClearData}
                    className="px-4 py-2 bg-red-900/50 border border-red-500/50 text-red-300 rounded hover:bg-red-900/70 hover:border-red-400 transition-all duration-200 font-mono font-bold text-sm"
                  >
                    PURGE ALL DATA
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between mb-6"
          >
            <h2 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">
              IMPORT HISTORY & DATA COVERAGE
            </h2>
            <span className="text-cyan-400 font-mono text-sm">
              {showHistory ? '[ HIDE ]' : '[ SHOW ]'}
            </span>
          </button>

          {showHistory && <ImportHistoryViewer onRefresh={loadOzonStats} />}
        </div>

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-300 font-mono font-bold text-sm">MULTI-FILE IMPORT ACTIVE</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400/80 font-mono text-sm">DUPLICATE DETECTION: ENABLED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OzonDataImport;
