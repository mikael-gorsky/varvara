import React, { useEffect, useState } from 'react';
import { getCurrentInventory } from '../../services/inventoryService';
import type { CurrentInventory } from '../../types/inventory';

interface AgingStats {
  high: { count: number; value: number }; // >24 months
  medium: { count: number; value: number }; // 12-24 months
  low: { count: number; value: number }; // 6-12 months
  fresh: { count: number; value: number }; // <6 months
}

const AgingAlertsPanel: React.FC = () => {
  const [inventory, setInventory] = useState<CurrentInventory[]>([]);
  const [stats, setStats] = useState<AgingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ageThreshold, setAgeThreshold] = useState(12); // Default 12 months

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      calculateStats();
    }
  }, [inventory, ageThreshold]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getCurrentInventory();
      setInventory(data);
      setError(null);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const high = inventory.filter(item => (item.age_months || 0) > 24);
    const medium = inventory.filter(item => (item.age_months || 0) > 12 && (item.age_months || 0) <= 24);
    const low = inventory.filter(item => (item.age_months || 0) > 6 && (item.age_months || 0) <= 12);
    const fresh = inventory.filter(item => (item.age_months || 0) <= 6);

    setStats({
      high: {
        count: high.length,
        value: high.reduce((sum, item) => sum + (item.total_value_rub || 0), 0)
      },
      medium: {
        count: medium.length,
        value: medium.reduce((sum, item) => sum + (item.total_value_rub || 0), 0)
      },
      low: {
        count: low.length,
        value: low.reduce((sum, item) => sum + (item.total_value_rub || 0), 0)
      },
      fresh: {
        count: fresh.length,
        value: fresh.reduce((sum, item) => sum + (item.total_value_rub || 0), 0)
      }
    });
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

  const agedInventory = inventory
    .filter(item => (item.age_months || 0) >= ageThreshold)
    .sort((a, b) => (b.age_months || 0) - (a.age_months || 0));

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

  if (inventory.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
        <p className="text-gray-400">
          No inventory data found. Import inventory snapshot to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-100">Aging Alerts</h2>
        <p className="text-sm text-gray-400 mt-1">
          Slow-moving inventory flagging and aging analysis
        </p>
      </div>

      {/* Alert Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* High Priority (>24 months) */}
          <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg p-4 border-2 border-red-700/70">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-red-400 uppercase font-semibold">High Alert</div>
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-red-300 mb-1">
              {formatCurrency(stats.high.value)}
            </div>
            <div className="text-xs text-red-400">
              {stats.high.count} items &gt;24 months
            </div>
          </div>

          {/* Medium Priority (12-24 months) */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-lg p-4 border border-yellow-700/50">
            <div className="text-xs text-yellow-400 uppercase font-semibold mb-2">Medium Alert</div>
            <div className="text-2xl font-bold text-yellow-300 mb-1">
              {formatCurrency(stats.medium.value)}
            </div>
            <div className="text-xs text-yellow-400">
              {stats.medium.count} items 12-24 mo
            </div>
          </div>

          {/* Low Priority (6-12 months) */}
          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-lg p-4 border border-orange-700/50">
            <div className="text-xs text-orange-400 uppercase font-semibold mb-2">Watch List</div>
            <div className="text-2xl font-bold text-orange-300 mb-1">
              {formatCurrency(stats.low.value)}
            </div>
            <div className="text-xs text-orange-400">
              {stats.low.count} items 6-12 mo
            </div>
          </div>

          {/* Fresh (<6 months) */}
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-4 border border-green-700/50">
            <div className="text-xs text-green-400 uppercase font-semibold mb-2">Fresh Stock</div>
            <div className="text-2xl font-bold text-green-300 mb-1">
              {formatCurrency(stats.fresh.value)}
            </div>
            <div className="text-xs text-green-400">
              {stats.fresh.count} items &lt;6 mo
            </div>
          </div>
        </div>
      )}

      {/* Age Threshold Control */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Age Threshold: {ageThreshold} months
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="3"
            max="36"
            step="3"
            value={ageThreshold}
            onChange={(e) => setAgeThreshold(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex gap-2">
            {[6, 12, 18, 24].map(months => (
              <button
                key={months}
                onClick={() => setAgeThreshold(months)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  ageThreshold === months
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {months}mo
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aged Inventory Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-200">
            Aged Inventory ({agedInventory.length} items ≥ {ageThreshold} months)
          </h3>
        </div>
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
                  Age
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Qty
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
              {agedInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No aged inventory found with threshold ≥ {ageThreshold} months
                  </td>
                </tr>
              ) : (
                agedInventory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-200">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {item.warehouse_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                          (item.age_months || 0) > 24
                            ? 'bg-red-900/30 text-red-300 border border-red-700'
                            : (item.age_months || 0) > 12
                            ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                            : 'bg-orange-900/30 text-orange-300 border border-orange-700'
                        }`}
                      >
                        {item.age_months} mo
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 text-right">
                      {formatNumber(item.quantity_on_hand)}
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

      {/* Action Recommendations */}
      {agedInventory.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-300 mb-1">Recommended Actions</h4>
              <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                <li>Review slow-moving items for potential discounts or promotions</li>
                <li>Consider returning aged inventory to suppliers if possible</li>
                <li>Adjust reorder points to prevent future aging</li>
                <li>Check quality status of items older than 24 months</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgingAlertsPanel;
