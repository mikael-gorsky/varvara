import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileSpreadsheet, Calendar, Clock, AlertCircle, Plus } from 'lucide-react';

interface OzonReport {
  report_id: string;
  date_of_report: string;
  reported_days: number;
  imported_at?: string;
  product_count?: number;
}

interface OzonReportsListProps {
  onNewImport: () => void;
}

const OzonReportsList: React.FC<OzonReportsListProps> = ({ onNewImport }) => {
  const [reports, setReports] = useState<OzonReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: reportsData, error: reportsError } = await supabase
        .from('ozon_reports')
        .select('*')
        .order('date_of_report', { ascending: false });

      if (reportsError) throw reportsError;

      if (reportsData) {
        const reportsWithCounts = await Promise.all(
          reportsData.map(async (report) => {
            const { count, error: countError } = await supabase
              .from('ozon_data')
              .select('*', { count: 'exact', head: true })
              .eq('report_id', report.report_id);

            if (countError) {
              console.error('Error fetching product count:', countError);
            }

            return {
              ...report,
              product_count: count || 0,
            };
          })
        );

        setReports(reportsWithCounts);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h3
            className="text-2xl font-semibold uppercase tracking-wide"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 700,
            }}
          >
            IMPORT NEW FILES
          </h3>
          <button
            onClick={onNewImport}
            className="px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 hover:opacity-90"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
              fontWeight: 700,
            }}
          >
            <Plus className="w-5 h-5" />
            Import Files
          </button>
        </div>
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
          Loading reports...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h3
            className="text-2xl font-semibold uppercase tracking-wide"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 700,
            }}
          >
            IMPORT NEW FILES
          </h3>
          <button
            onClick={onNewImport}
            className="px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 hover:opacity-90"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
              fontWeight: 700,
            }}
          >
            <Plus className="w-5 h-5" />
            Import Files
          </button>
        </div>
        <div
          className="p-6 rounded-lg border flex items-center gap-3"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--divider-standard)',
            color: 'var(--text-secondary)',
          }}
        >
          <AlertCircle className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3
          className="text-2xl font-semibold uppercase tracking-wide"
          style={{
            color: 'var(--text-primary)',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
          }}
        >
          IMPORT NEW FILES
        </h3>
        <button
          onClick={onNewImport}
          className="px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 hover:opacity-90"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-primary)',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
          }}
        >
          <Plus className="w-5 h-5" />
          Import Files
        </button>
      </div>

      {reports.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--divider-standard)',
            color: 'var(--text-secondary)',
          }}
        >
          <FileSpreadsheet
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <p className="text-lg font-semibold mb-2">No reports imported yet</p>
          <p className="text-sm">Click "New Import" to upload your first OZON report</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h3
            className="text-xl font-semibold uppercase tracking-wide"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 700,
            }}
          >
            Previously Imported Reports ({reports.length})
          </h3>
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.report_id}
                className="p-6 rounded-lg border transition-all duration-fast hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--surface-1)' }}
                    >
                      <FileSpreadsheet
                        className="w-6 h-6"
                        style={{ color: 'var(--accent)' }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar
                          className="w-4 h-4"
                          style={{ color: 'var(--text-tertiary)' }}
                        />
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Report Date: {formatDate(report.date_of_report)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            Period:
                          </span>
                          <span
                            className="ml-2 font-medium"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {report.reported_days}{' '}
                            {report.reported_days === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            Products:
                          </span>
                          <span
                            className="ml-2 font-medium"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {report.product_count}
                          </span>
                        </div>
                        {report.imported_at && (
                          <div className="flex items-center gap-2">
                            <Clock
                              className="w-4 h-4"
                              style={{ color: 'var(--text-tertiary)' }}
                            />
                            <span style={{ color: 'var(--text-tertiary)' }}>
                              Imported:
                            </span>
                            <span
                              className="ml-1 font-medium"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {formatDateTime(report.imported_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OzonReportsList;
