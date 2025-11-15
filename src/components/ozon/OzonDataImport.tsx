import React, { useState } from 'react';
import { ArrowLeft, Upload, Activity, CheckCircle, XCircle, FileUp } from 'lucide-react';
import { ozonImportService } from '../../modules/imports/ozon/ozonImportService';
import { batchImportService, BatchImportProgress, BatchImportResult } from '../../modules/imports/ozon/batchImportService';
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
  const skipDuplicates = true;
  const [showHistory, setShowHistory] = useState(false);

  const handleFilesValidated = (files: QueuedFile[]) => {
    setValidatedFiles(files);
  };

  const handleBatchImport = async () => {
    const filesToImport = validatedFiles
      .filter(f => f.status === 'valid')
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
    } catch (error) {
      console.error('Batch import failed:', error);
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  };

  const validFilesCount = validatedFiles.filter(f => f.status === 'valid').length;
  const duplicateFilesCount = validatedFiles.filter(f => f.isDuplicate).length;

  return (
    <div className="min-h-screen p-6" style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="rounded-lg border p-4 relative overflow-hidden" style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--divider-standard)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 rounded transition-all duration-200"
                style={{
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  borderWidth: '1px',
                  borderColor: 'var(--divider-standard)'
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-semibold text-sm">Back to Reports</span>
              </button>
              <div className="h-6 border-l" style={{ borderColor: 'var(--divider-standard)' }}></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-primary)'
                }}>
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{
                    color: 'var(--text-primary)',
                    fontFamily: "'Montserrat', sans-serif"
                  }}>
                    Import Ozon Reports
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Upload one or multiple Excel files
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MultiFileUploadQueue onFilesValidated={handleFilesValidated} />

        {validatedFiles.length > 0 && (
          <div className="rounded-xl border p-6 relative overflow-hidden" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--divider-standard)'
          }}>
            <h2 className="text-lg font-bold mb-6 flex items-center space-x-3" style={{
              color: 'var(--text-primary)',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              <Upload className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <span>Ready to Import</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border" style={{
                backgroundColor: 'var(--surface-1)',
                borderColor: 'var(--divider-standard)'
              }}>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {validFilesCount} {validFilesCount === 1 ? 'file' : 'files'} ready to import
                  </p>
                  {duplicateFilesCount > 0 && (
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {duplicateFilesCount} duplicate {duplicateFilesCount === 1 ? 'file' : 'files'} will be skipped
                    </p>
                  )}
                </div>
              </div>

              {importProgress && (
                <div className="p-4 rounded-lg border" style={{
                  backgroundColor: 'var(--surface-1)',
                  borderColor: 'var(--divider-standard)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Processing: {importProgress.currentFile}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {importProgress.currentFileIndex + 1} / {importProgress.totalFiles}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--accent)',
                        width: `${(importProgress.filesCompleted / importProgress.totalFiles) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>Completed: {importProgress.filesCompleted}</span>
                    <span>Records: {importProgress.totalRecordsImported}</span>
                    <span>Skipped: {importProgress.filesSkipped}</span>
                  </div>
                </div>
              )}

              {importResult && (
                <div className="p-4 rounded-lg border" style={{
                  backgroundColor: importResult.success ? 'var(--surface-1)' : 'var(--surface-1)',
                  borderColor: importResult.success ? 'var(--accent)' : '#ef4444'
                }}>
                  <div className="flex items-center space-x-3 mb-3">
                    {importResult.success ? (
                      <CheckCircle className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <XCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
                    )}
                    <h3 className="font-bold" style={{
                      color: 'var(--text-primary)',
                      fontFamily: "'Montserrat', sans-serif"
                    }}>
                      Import {importResult.success ? 'Completed' : 'Completed with Errors'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Processed:</span>{' '}
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{importResult.filesProcessed}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Skipped:</span>{' '}
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{importResult.filesSkipped}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Failed:</span>{' '}
                      <span className="font-bold" style={{ color: '#ef4444' }}>{importResult.filesFailed}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Records:</span>{' '}
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>{importResult.totalRecordsImported}</span>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--divider-standard)' }}>
                      <p className="text-xs font-bold mb-2" style={{ color: '#ef4444' }}>Errors:</p>
                      {importResult.errors.map((err, idx) => (
                        <p key={idx} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
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
                  className="flex items-center space-x-2 px-6 py-3 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-primary)'
                  }}
                >
                  {importing ? (
                    <>
                      <Activity className="w-5 h-5 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Start Import</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="rounded-xl border p-6 relative overflow-hidden" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--divider-standard)'
          }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{
                color: 'var(--text-primary)',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Import History
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Hide
              </button>
            </div>
            <ImportHistoryViewer onRefresh={() => {}} />
          </div>
        )}

        {!showHistory && validatedFiles.length === 0 && (
          <button
            onClick={() => setShowHistory(true)}
            className="w-full py-3 rounded-lg transition-all text-sm font-semibold"
            style={{
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-secondary)',
              borderWidth: '1px',
              borderColor: 'var(--divider-standard)'
            }}
          >
            View Import History
          </button>
        )}
      </div>
    </div>
  );
};

export default OzonDataImport;
