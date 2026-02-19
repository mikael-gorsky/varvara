import React, { useEffect, useState } from 'react';
import {
  getCurrentInventory,
  getInventorySummary,
  getWarehouses
} from '../../services/inventoryService';
import type { CurrentInventory, InventorySummary } from '../../types/inventory';

const StockLevelsPanel: React.FC = () => {
  const [inventory, setInventory] = useState<CurrentInventory[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minAge, setMinAge] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [selectedWarehouse, searchQuery, minAge]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, summaryData, warehousesData] = await Promise.all([
        getCurrentInventory(),
        getInventorySummary(),
        getWarehouses()
      ]);

      setInventory(inventoryData);
      setSummary(summaryData);
      setWarehouses(warehousesData);
      setError(null);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const filterInventory = async () => {
    try {
      const filters = {
        warehouse: selectedWarehouse || undefined,
        searchQuery: searchQuery || undefined,
        minAge: minAge
      };

      const data = await getCurrentInventory(filters);
      setInventory(data);
    } catch (err) {
      console.error('Error filtering inventory:', err);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-100">Stock Levels</h2>
        <p className="text-sm text-gray-400 mt-1">
          Current inventory across all warehouses
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 uppercase mb-1">Total Value</div>
            <div className="text-2xl font-bold text-gray-100">
              {formatCurrency(summary.total_value_rub)}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 uppercase mb-1">Products</div>
            <div className="text-2xl font-bold text-gray-100">
              {formatNumber(summary.product_count)}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 uppercase mb-1">Warehouses</div>
            <div className="text-2xl font-bold text-gray-100">
              {summary.warehouse_count}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 uppercase mb-1">Avg Age</div>
            <div className="text-2xl font-bold text-gray-100">
              {summary.avg_age_months.toFixed(1)} mo
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Warehouse
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Age (months)
            </label>
            <input
              type="number"
              value={minAge || ''}
              onChange={(e) => setMinAge(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="All ages"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Product name..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Warehouse
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Available
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Quality
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No inventory data found. Import inventory snapshot to get started.
                  </td>
                </tr>
              ) : (
                inventory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-200">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {item.warehouse_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 text-right">
                      {formatNumber(item.quantity_on_hand)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 text-right">
                      {formatNumber(item.quantity_available)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {item.age_months !== null && item.age_months > 0 ? (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            item.age_months > 24
                              ? 'bg-red-900/30 text-red-300'
                              : item.age_months > 12
                              ? 'bg-yellow-900/30 text-yellow-300'
                              : 'bg-green-900/30 text-green-300'
                          }`}
                        >
                          {item.age_months} mo
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {item.quality_status || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-200 text-right font-medium">
                      {formatCurrency(item.total_value_rub)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      {inventory.length > 0 && (
        <div className="text-sm text-gray-400 text-center">
          Showing {inventory.length} items
        </div>
      )}
    </div>
  );
};

export default StockLevelsPanel;
