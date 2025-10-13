import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, Calendar, Database } from 'lucide-react';
import { importHistoryService, ImportHistoryRecord } from '../../modules/imports/ozon/importHistoryService';

interface ImportHistoryViewerProps {
  onRefresh?: () => void;
}

const ImportHistoryViewer: React.FC<ImportHistoryViewerProps> = ({ onRefresh }) => {
  const [history, setHistory] = useState<ImportHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [historyData, coverage] = await Promise.all([
        importHistoryService.getImportHistory(20),
        importHistoryService.getDateRangeCoverage()
      ]);
      setHistory(historyData);
      setDateRange(coverage);
    } catch (error) {
      console.error('Failed to load import history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <Clock className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-emerald-400/30 bg-emerald-900/10';
      case 'error':
        return 'border-red-400/30 bg-red-900/10';
      case 'partial':
        return 'border-orange-400/30 bg-orange-900/10';
      default:
        return 'border-cyan-400/30 bg-gray-800/40';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-12 text-center">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-cyan-300 font-mono">Loading import history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dateRange.start && dateRange.end && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-teal-400"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-cyan-300 font-mono">DATA COVERAGE</h3>
                <p className="text-cyan-400/80 text-sm font-mono">Available date range in database</p>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-400/30 rounded-lg px-6 py-3">
              <p className="text-blue-300 font-mono font-bold">
                {new Date(dateRange.start).toLocaleDateString()} → {new Date(dateRange.end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-cyan-300 font-mono">IMPORT HISTORY</h3>
          </div>

          <button
            onClick={() => {
              loadHistory();
              onRefresh?.();
            }}
            className="px-4 py-2 bg-cyan-900/30 border border-cyan-400/30 text-cyan-300 rounded hover:bg-cyan-900/50 transition-all duration-200 font-mono text-sm"
          >
            REFRESH
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
            <p className="text-cyan-400/80 font-mono">No import history available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(record => (
              <div
                key={record.id}
                className={`border rounded-lg p-4 ${getStatusColor(record.import_status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(record.import_status)}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-mono text-cyan-300 font-semibold text-sm">
                        {record.filename}
                      </h4>

                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="w-4 h-4 text-cyan-400/60" />
                          <span className="text-cyan-400/60 text-xs font-mono">
                            {formatFileSize(record.file_size)}
                          </span>
                        </div>

                        <span className="text-cyan-400/40">•</span>

                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4 text-cyan-400/60" />
                          <span className="text-cyan-400/60 text-xs font-mono">
                            {record.records_count} records
                          </span>
                        </div>

                        {record.import_duration_ms && (
                          <>
                            <span className="text-cyan-400/40">•</span>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-cyan-400/60" />
                              <span className="text-cyan-400/60 text-xs font-mono">
                                {formatDuration(record.import_duration_ms)}
                              </span>
                            </div>
                          </>
                        )}

                        <span className="text-cyan-400/40">•</span>

                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-cyan-400/60" />
                          <span className="text-cyan-400/60 text-xs font-mono">
                            {new Date(record.created_at || '').toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {record.date_range_start && record.date_range_end && (
                        <div className="mt-2 bg-cyan-900/20 border border-cyan-400/30 rounded px-3 py-1">
                          <p className="text-cyan-300 text-xs font-mono">
                            Data period: {record.date_range_start} → {record.date_range_end}
                          </p>
                        </div>
                      )}

                      {record.error_message && (
                        <div className="mt-2 bg-red-900/20 border border-red-400/30 rounded px-3 py-1">
                          <p className="text-red-300 text-xs font-mono">
                            Error: {record.error_message}
                          </p>
                        </div>
                      )}

                      {record.validation_errors && record.validation_errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {record.validation_errors.slice(0, 3).map((error: string, idx: number) => (
                            <p key={idx} className="text-orange-300 text-xs font-mono">
                              ⚠ {error}
                            </p>
                          ))}
                          {record.validation_errors.length > 3 && (
                            <p className="text-orange-300/60 text-xs font-mono">
                              ... and {record.validation_errors.length - 3} more warnings
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-3">
                    <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                      record.import_status === 'success'
                        ? 'bg-emerald-900/30 border border-emerald-400/30 text-emerald-300'
                        : record.import_status === 'error'
                        ? 'bg-red-900/30 border border-red-400/30 text-red-300'
                        : 'bg-orange-900/30 border border-orange-400/30 text-orange-300'
                    }`}>
                      {record.import_status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportHistoryViewer;
