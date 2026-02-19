import React, { useEffect, useState } from 'react';
import {
  getABCClassification,
  getABCSummary,
  getParetoChartData
} from '../../services/abcAnalysisService';
import type { ABCClassification, ABCSummary } from '../../types/inventory';
import type { ParetoDataPoint } from '../../services/abcAnalysisService';

const ABCAnalysisPanel: React.FC = () => {
  const [data, setData] = useState<ABCClassification[]>([]);
  const [summary, setSummary] = useState<ABCSummary | null>(null);
  const [paretoData, setParetoData] = useState<ParetoDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(2025);
  const [selectedClass, setSelectedClass] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classificationData, summaryData, paretoChartData] = await Promise.all([
        getABCClassification(year),
        getABCSummary(year),
        getParetoChartData(year)
      ]);

      setData(classificationData);
      setSummary(summaryData);
      setParetoData(paretoChartData);
      setError(null);
    } catch (err) {
      console.error('Error loading ABC analysis:', err);
      setError('Failed to load ABC analysis data');
    } finally {
      setLoading(false);
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

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(1)}%`;
  };

  const filteredData = selectedClass === 'ALL'
    ? data
    : data.filter(item => item.abc_class === selectedClass);

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

  if (!summary || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
        <p className="text-gray-400">
          No ABC classification data found. Import ABC classification to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-100">ABC Analysis</h2>
        <p className="text-sm text-gray-400 mt-1">
          Revenue classification and Pareto analysis (80/20 rule)
        </p>
      </div>

      {/* Year Selector */}
      <div className="flex justify-end">
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Class A */}
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg p-4 border border-red-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-red-400 uppercase font-semibold">Class A</div>
            <div className="text-xs text-red-300 font-medium">
              {formatPercent(summary.classA.revenuePercent)}
            </div>
          </div>
          <div className="text-2xl font-bold text-red-300 mb-1">
            {formatCurrency(summary.classA.revenue)}
          </div>
          <div className="text-xs text-red-400">
            {summary.classA.count} products ({((summary.classA.count / summary.total.count) * 100).toFixed(1)}%)
          </div>
          <div className="mt-2 text-xs text-red-300/70">
            High-value products (top revenue generators)
          </div>
        </div>

        {/* Class B */}
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-lg p-4 border border-yellow-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-yellow-400 uppercase font-semibold">Class B</div>
            <div className="text-xs text-yellow-300 font-medium">
              {formatPercent(summary.classB.revenuePercent)}
            </div>
          </div>
          <div className="text-2xl font-bold text-yellow-300 mb-1">
            {formatCurrency(summary.classB.revenue)}
          </div>
          <div className="text-xs text-yellow-400">
            {summary.classB.count} products ({((summary.classB.count / summary.total.count) * 100).toFixed(1)}%)
          </div>
          <div className="mt-2 text-xs text-yellow-300/70">
            Medium-value products (moderate revenue)
          </div>
        </div>

        {/* Class C */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-4 border border-green-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-green-400 uppercase font-semibold">Class C</div>
            <div className="text-xs text-green-300 font-medium">
              {formatPercent(summary.classC.revenuePercent)}
            </div>
          </div>
          <div className="text-2xl font-bold text-green-300 mb-1">
            {formatCurrency(summary.classC.revenue)}
          </div>
          <div className="text-xs text-green-400">
            {summary.classC.count} products ({((summary.classC.count / summary.total.count) * 100).toFixed(1)}%)
          </div>
          <div className="mt-2 text-xs text-green-300/70">
            Low-value products (minimal revenue impact)
          </div>
        </div>
      </div>

      {/* Pareto Chart Placeholder */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Pareto Chart (80/20 Visualization)</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded">
          <p className="text-gray-500 text-sm">
            Chart visualization coming soon (80% revenue from top 20% products)
          </p>
        </div>
      </div>

      {/* Class Filter */}
      <div className="flex gap-2">
        {(['ALL', 'A', 'B', 'C'] as const).map(cls => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedClass === cls
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">
                  Class
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Profit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Cumulative %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm text-gray-400">
                    #{item.revenue_rank}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-200">
                    {item.product_name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                        item.abc_class === 'A'
                          ? 'bg-red-900/30 text-red-300 border border-red-700'
                          : item.abc_class === 'B'
                          ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                          : 'bg-green-900/30 text-green-300 border border-green-700'
                      }`}
                    >
                      {item.abc_class}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-200 text-right font-medium">
                    {formatCurrency(item.revenue_rub_2025)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span
                      className={
                        (item.profit_rub_2025 || 0) < 0
                          ? 'text-red-400'
                          : 'text-green-400'
                      }
                    >
                      {formatCurrency(item.profit_rub_2025)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 text-right">
                    {formatPercent(item.revenue_cumulative_percent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      {filteredData.length > 0 && (
        <div className="text-sm text-gray-400 text-center">
          Showing {filteredData.length} of {data.length} products
        </div>
      )}
    </div>
  );
};

export default ABCAnalysisPanel;
