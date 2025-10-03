import React, { useState } from 'react';
import { Upload, X, AlertTriangle, CheckCircle, Clock, FileSpreadsheet, Database } from 'lucide-react';
import { fileHashService, FileHashInfo } from '../../services/fileHashService';
import { importHistoryService } from '../../services/importHistoryService';
import { parseOzonFile, OzonParsedData } from '../../utils/ozonParser';

export interface QueuedFile {
  file: File;
  id: string;
  status: 'pending' | 'validating' | 'valid' | 'invalid' | 'duplicate' | 'processing' | 'success' | 'error';
  hashInfo?: FileHashInfo;
  parsedData?: OzonParsedData;
  validationErrors: string[];
  isDuplicate: boolean;
  duplicateInfo?: {
    previousImportDate: string;
    previousRecordCount: number;
  };
  progress?: number;
}

interface MultiFileUploadQueueProps {
  onFilesValidated: (files: QueuedFile[]) => void;
  onImportComplete?: (summary: any) => void;
}

const MultiFileUploadQueue: React.FC<MultiFileUploadQueueProps> = ({ onFilesValidated }) => {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: QueuedFile[] = Array.from(files).map(file => ({
      file,
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      status: 'pending',
      validationErrors: [],
      isDuplicate: false
    }));

    setQueuedFiles(prev => [...prev, ...newFiles]);

    for (const queuedFile of newFiles) {
      await validateFile(queuedFile);
    }
  };

  const validateFile = async (queuedFile: QueuedFile) => {
    setQueuedFiles(prev =>
      prev.map(f => f.id === queuedFile.id ? { ...f, status: 'validating' } : f)
    );

    try {
      const hashInfo = await fileHashService.getFileInfo(queuedFile.file);

      const duplicateRecord = await importHistoryService.checkDuplicateFile(hashInfo.hash);

      const parsedData = await parseOzonFile(queuedFile.file);

      const validationErrors: string[] = [...parsedData.errors];

      if (!parsedData.headerValidation.isValid) {
        validationErrors.push('Invalid file structure: missing required headers');
        parsedData.headerValidation.missingFields.forEach(field => {
          validationErrors.push(`Missing field: ${field}`);
        });
      }

      if (parsedData.stats.validRows === 0) {
        validationErrors.push('No valid data rows found in file');
      }

      const isDuplicate = !!duplicateRecord;
      const status = isDuplicate ? 'duplicate' : validationErrors.length > 0 ? 'invalid' : 'valid';

      setQueuedFiles(prev =>
        prev.map(f =>
          f.id === queuedFile.id
            ? {
                ...f,
                status,
                hashInfo,
                parsedData,
                validationErrors,
                isDuplicate,
                duplicateInfo: duplicateRecord ? {
                  previousImportDate: duplicateRecord.created_at || '',
                  previousRecordCount: duplicateRecord.records_count
                } : undefined
              }
            : f
        )
      );

      onFilesValidated(queuedFiles);
    } catch (error) {
      setQueuedFiles(prev =>
        prev.map(f =>
          f.id === queuedFile.id
            ? {
                ...f,
                status: 'error',
                validationErrors: [`Failed to validate: ${error instanceof Error ? error.message : 'Unknown error'}`]
              }
            : f
        )
      );
    }
  };

  const removeFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: QueuedFile['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'invalid':
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'duplicate':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'validating':
        return <Clock className="w-5 h-5 text-cyan-400 animate-spin" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusColor = (status: QueuedFile['status']) => {
    switch (status) {
      case 'valid':
        return 'border-emerald-400/50 bg-emerald-900/10';
      case 'invalid':
      case 'error':
        return 'border-red-400/50 bg-red-900/10';
      case 'duplicate':
        return 'border-orange-400/50 bg-orange-900/10';
      case 'validating':
        return 'border-cyan-400/50 bg-cyan-900/10';
      default:
        return 'border-cyan-400/30 bg-gray-800/40';
    }
  };

  const validFilesCount = queuedFiles.filter(f => f.status === 'valid').length;
  const totalRecords = queuedFiles
    .filter(f => f.parsedData && f.status === 'valid')
    .reduce((sum, f) => sum + (f.parsedData?.stats.validRows || 0), 0);

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-900/20'
            : 'border-cyan-400/30 hover:border-cyan-400/50'
        }`}
      >
        <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-lg font-mono text-cyan-300 mb-2">
          DRAG & DROP MULTIPLE FILES
        </h3>
        <p className="text-cyan-400/80 text-sm mb-4 font-mono">
          or click to select Excel files (.xlsx, .xls, .csv)
        </p>

        <label className="inline-block">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 text-black px-6 py-3 rounded cursor-pointer hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 font-mono font-bold">
            SELECT FILES
          </div>
        </label>
      </div>

      {queuedFiles.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold text-cyan-300 font-mono">
                FILE QUEUE ({queuedFiles.length})
              </h3>
            </div>

            {validFilesCount > 0 && (
              <div className="bg-emerald-900/30 border border-emerald-400/30 rounded-lg px-4 py-2">
                <p className="text-emerald-300 font-mono text-sm">
                  {validFilesCount} valid files • {totalRecords.toLocaleString()} records
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {queuedFiles.map(queuedFile => (
              <div
                key={queuedFile.id}
                className={`border rounded-lg p-4 relative ${getStatusColor(queuedFile.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(queuedFile.status)}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-mono text-cyan-300 font-semibold text-sm truncate">
                        {queuedFile.file.name}
                      </h4>

                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-cyan-400/60 text-xs font-mono">
                          {formatFileSize(queuedFile.file.size)}
                        </p>

                        {queuedFile.parsedData && (
                          <>
                            <span className="text-cyan-400/40">•</span>
                            <p className="text-cyan-400/60 text-xs font-mono">
                              {queuedFile.parsedData.stats.validRows} records
                            </p>
                          </>
                        )}

                        {queuedFile.parsedData?.metadata.reportPeriod && (
                          <>
                            <span className="text-cyan-400/40">•</span>
                            <p className="text-cyan-400/60 text-xs font-mono">
                              {queuedFile.parsedData.metadata.reportPeriod}
                            </p>
                          </>
                        )}

                        {queuedFile.parsedData?.metadata.categoryLevel3 && (
                          <>
                            <span className="text-cyan-400/40">•</span>
                            <p className="text-cyan-400/60 text-xs font-mono">
                              {queuedFile.parsedData.metadata.categoryLevel3}
                            </p>
                          </>
                        )}
                      </div>

                      {queuedFile.isDuplicate && queuedFile.duplicateInfo && (
                        <div className="mt-2 bg-orange-900/20 border border-orange-400/30 rounded px-3 py-1">
                          <p className="text-orange-300 text-xs font-mono">
                            Duplicate: Previously imported on{' '}
                            {new Date(queuedFile.duplicateInfo.previousImportDate).toLocaleDateString()}
                            {' '}({queuedFile.duplicateInfo.previousRecordCount} records)
                          </p>
                        </div>
                      )}

                      {queuedFile.validationErrors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {queuedFile.validationErrors.map((error, idx) => (
                            <p key={idx} className="text-red-300 text-xs font-mono">
                              • {error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(queuedFile.id)}
                    className="ml-3 p-1 hover:bg-red-900/30 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiFileUploadQueue;
