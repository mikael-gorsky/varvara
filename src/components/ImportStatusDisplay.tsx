import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, RefreshCw, Calendar, Package, TrendingUp, Loader, DollarSign } from 'lucide-react';
import { importStatusService, ImportFilesStatus } from '../modules/imports/importStatusService';

interface ImportStatusDisplayProps {
  onNavigateToOzon?: () => void;
  onNavigateToPricelist?: () => void;
}

const ImportStatusDisplay: React.FC<ImportStatusDisplayProps> = ({
  onNavigateToOzon,
  onNavigateToPricelist
}) => {
  const [status, setStatus] = useState<ImportFilesStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await importStatusService.getImportFilesStatus();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load import status');
      console.error('Failed to load import status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRefresh = () => {
    loadStatus(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>
        <div className="flex items-center justify-center space-x-3">
          <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="text-cyan-300 font-mono">LOADING IMPORT STATUS...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-red-400/30 shadow-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-400"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-red-300 font-mono">ERROR: {error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-gray-800 border border-red-400/50 text-red-300 rounded hover:border-red-400 transition-all duration-200 font-mono text-sm flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RETRY</span>
          </button>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const hasOzonData = status.ozon.totalImports > 0;
  const hasPricelistData = status.pricelist.hasData;
  const hasAnyData = hasOzonData || hasPricelistData;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">IMPORT STATUS</h3>
              <p className="text-cyan-400/60 text-xs font-mono">Real-time data coverage overview</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-gray-800 border border-cyan-400/50 text-cyan-300 rounded hover:border-cyan-400 hover:bg-gray-700 transition-all duration-200 font-mono text-sm flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'REFRESHING' : 'REFRESH'}</span>
          </button>
        </div>

        {!hasAnyData ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-cyan-400/40" />
            </div>
            <p className="text-cyan-400/60 font-mono text-sm">No import data available</p>
            <p className="text-cyan-400/40 font-mono text-xs mt-1">Import files to see statistics here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              onClick={onNavigateToOzon}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border p-5 relative overflow-hidden transition-all duration-300 ${
                hasOzonData
                  ? 'border-emerald-400/30 hover:border-emerald-400/60 cursor-pointer hover:shadow-emerald-400/20 hover:shadow-lg'
                  : 'border-gray-600/30 opacity-60'
              }`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                hasOzonData ? 'from-emerald-400 to-teal-400' : 'from-gray-600 to-gray-500'
              }`}></div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hasOzonData
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                      : 'bg-gray-700'
                  }`}>
                    <FileSpreadsheet className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-cyan-300 font-mono">OZON MARKETPLACE</h4>
                    <p className="text-cyan-400/60 text-xs font-mono">Sales data imports</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    hasOzonData ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
                  }`}></div>
                  <span className={`text-xs font-mono ${
                    hasOzonData ? 'text-emerald-400' : 'text-gray-500'
                  }`}>
                    {hasOzonData ? 'ACTIVE' : 'NO DATA'}
                  </span>
                </div>
              </div>

              {hasOzonData ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 rounded p-3 border border-cyan-400/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cyan-400/60 text-xs font-mono">TOTAL IMPORTS</span>
                        <Database className="w-3 h-3 text-cyan-400/40" />
                      </div>
                      <p className="text-xl font-bold text-cyan-300 font-mono">
                        {status.ozon.totalImports}
                      </p>
                    </div>

                    <div className="bg-gray-900/50 rounded p-3 border border-emerald-400/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cyan-400/60 text-xs font-mono">TOTAL RECORDS</span>
                        <Package className="w-3 h-3 text-emerald-400/40" />
                      </div>
                      <p className="text-xl font-bold text-emerald-300 font-mono">
                        {status.ozon.totalRecords.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {status.ozon.earliestDate && status.ozon.latestDate && (
                    <div className="bg-gray-900/50 rounded p-3 border border-teal-400/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-3 h-3 text-teal-400" />
                        <span className="text-cyan-400/60 text-xs font-mono">DATA COVERAGE</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-teal-300">{formatDate(status.ozon.earliestDate)}</span>
                        <span className="text-cyan-400/60">→</span>
                        <span className="text-teal-300">{formatDate(status.ozon.latestDate)}</span>
                      </div>
                    </div>
                  )}

                  {status.ozon.imports.length > 0 && status.ozon.imports[0].importTimestamp && (
                    <div className="pt-2 border-t border-cyan-400/10">
                      <p className="text-cyan-400/40 text-xs font-mono">
                        Last import: {formatDateTime(status.ozon.imports[0].importTimestamp)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 font-mono text-sm">No OZON data imported</p>
                </div>
              )}

              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400/20"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400/20"></div>
            </div>

            <div
              onClick={onNavigateToPricelist}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border p-5 relative overflow-hidden transition-all duration-300 ${
                hasPricelistData
                  ? 'border-cyan-400/30 hover:border-cyan-400/60 cursor-pointer hover:shadow-cyan-400/20 hover:shadow-lg'
                  : 'border-gray-600/30 opacity-60'
              }`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                hasPricelistData ? 'from-cyan-400 to-blue-400' : 'from-gray-600 to-gray-500'
              }`}></div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hasPricelistData
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-500'
                      : 'bg-gray-700'
                  }`}>
                    <DollarSign className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-cyan-300 font-mono">PRICELIST</h4>
                    <p className="text-cyan-400/60 text-xs font-mono">Product pricing data</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    hasPricelistData ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'
                  }`}></div>
                  <span className={`text-xs font-mono ${
                    hasPricelistData ? 'text-cyan-400' : 'text-gray-500'
                  }`}>
                    {hasPricelistData ? 'ACTIVE' : 'NO DATA'}
                  </span>
                </div>
              </div>

              {hasPricelistData ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 rounded p-3 border border-cyan-400/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cyan-400/60 text-xs font-mono">PRODUCTS</span>
                        <Package className="w-3 h-3 text-cyan-400/40" />
                      </div>
                      <p className="text-xl font-bold text-cyan-300 font-mono">
                        {status.pricelist.totalProducts.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-gray-900/50 rounded p-3 border border-blue-400/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cyan-400/60 text-xs font-mono">PRICES</span>
                        <DollarSign className="w-3 h-3 text-blue-400/40" />
                      </div>
                      <p className="text-xl font-bold text-blue-300 font-mono">
                        {status.pricelist.totalPrices.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 rounded p-3 border border-teal-400/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cyan-400/60 text-xs font-mono">CATEGORIES</span>
                      </div>
                      <p className="text-lg font-bold text-teal-300 font-mono">
                        {status.pricelist.uniqueCategories}
                      </p>
                    </div>

                    <div className="bg-gray-900/50 rounded p-3 border border-emerald-400/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cyan-400/60 text-xs font-mono">SUPPLIERS</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-300 font-mono">
                        {status.pricelist.uniqueSuppliers}
                      </p>
                    </div>
                  </div>

                  {status.pricelist.lastImportDate && (
                    <div className="pt-2 border-t border-cyan-400/10">
                      <p className="text-cyan-400/40 text-xs font-mono">
                        Last import: {formatDateTime(status.pricelist.lastImportDate)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 font-mono text-sm">No pricelist data imported</p>
                </div>
              )}

              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400/20"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400/20"></div>
            </div>
          </div>
        )}
      </div>

      {hasAnyData && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-300 font-mono font-bold text-sm">IMPORT SYSTEMS OPERATIONAL</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400/80 font-mono text-sm">ACTIVE SOURCES:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {(hasOzonData ? 1 : 0) + (hasPricelistData ? 1 : 0)} / 2
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportStatusDisplay;
