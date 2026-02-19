import React, { useEffect, useState } from 'react';
import { getReorderAlerts, type ReorderAlert } from '../../services/reorderPlanningService';
import {
  optimizeContainerPacking,
  compareContainerOptions,
  CONTAINER_SPECS,
  type ProductForPacking,
  type PackingResult
} from '../../services/containerOptimizerService';

const ReorderPlanningPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<ReorderAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Container optimizer state
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [packingResult, setPackingResult] = useState<PackingResult | null>(null);
  const [containerType, setContainerType] = useState<'20ft' | '40hq'>('40hq');
  const [showOptimizer, setShowOptimizer] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getReorderAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading reorder alerts:', err);
      setError('Failed to load reorder alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleProductToggle = (productName: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productName)) {
      newSelected.delete(productName);
    } else {
      newSelected.add(productName);
    }
    setSelectedProducts(newSelected);
  };

  const handleOptimizeContainer = () => {
    const productsToPack: ProductForPacking[] = alerts
      .filter(alert => selectedProducts.has(alert.product_name))
      .map(alert => ({
        product_name: alert.product_name,
        quantity: alert.suggested_order_qty || alert.moq || 1,
        volume_cbm: 0.1, // Default if not in database
        weight_kg: 10, // Default if not in database
        price_usd: alert.supplier_price_usd || 0
      }));

    if (productsToPack.length === 0) {
      alert('Please select at least one product to optimize');
      return;
    }

    const result = optimizeContainerPacking(productsToPack, containerType);
    setPackingResult(result);
    setShowOptimizer(true);
  };

  const formatCurrency = (value: number | null | undefined, currency: 'RUB' | 'USD' = 'RUB') => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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
        <h2 className="text-xl font-semibold text-gray-100">Reorder Planning</h2>
        <p className="text-sm text-gray-400 mt-1">
          Automated reorder alerts and container optimization
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-900/30 rounded-lg p-4 border border-red-700/50">
          <div className="text-xs text-red-400 uppercase font-semibold mb-2">
            Reorder Needed
          </div>
          <div className="text-2xl font-bold text-red-300">
            {alerts.length}
          </div>
          <div className="text-xs text-red-400 mt-1">
            Products below reorder point
          </div>
        </div>

        <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-700/50">
          <div className="text-xs text-yellow-400 uppercase font-semibold mb-2">
            Critical Stock
          </div>
          <div className="text-2xl font-bold text-yellow-300">
            {alerts.filter(a => (a.days_of_stock || 0) < 7).length}
          </div>
          <div className="text-xs text-yellow-400 mt-1">
            Products with &lt;7 days stock
          </div>
        </div>

        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
          <div className="text-xs text-blue-400 uppercase font-semibold mb-2">
            Selected for Order
          </div>
          <div className="text-2xl font-bold text-blue-300">
            {selectedProducts.size}
          </div>
          <div className="text-xs text-blue-400 mt-1">
            Products in container optimizer
          </div>
        </div>
      </div>

      {/* Container Optimizer Toggle */}
      {selectedProducts.size > 0 && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-300 mb-1">
                Container Optimizer
              </h3>
              <p className="text-xs text-blue-200">
                {selectedProducts.size} products selected for optimization
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={containerType}
                onChange={(e) => setContainerType(e.target.value as '20ft' | '40hq')}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="20ft">20ft ({CONTAINER_SPECS['20ft'].volume_cbm} CBM)</option>
                <option value="40hq">40hq ({CONTAINER_SPECS['40hq'].volume_cbm} CBM)</option>
              </select>
              <button
                onClick={handleOptimizeContainer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Optimize Packing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packing Result */}
      {showOptimizer && packingResult && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">
              Container Packing Plan
            </h3>
            <button
              onClick={() => setShowOptimizer(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-900 rounded px-3 py-2">
              <div className="text-xs text-gray-400">Containers</div>
              <div className="text-lg font-semibold text-gray-100">
                {packingResult.total_containers}
              </div>
            </div>
            <div className="bg-gray-900 rounded px-3 py-2">
              <div className="text-xs text-gray-400">Total Volume</div>
              <div className="text-lg font-semibold text-gray-100">
                {packingResult.total_volume_cbm.toFixed(2)} CBM
              </div>
            </div>
            <div className="bg-gray-900 rounded px-3 py-2">
              <div className="text-xs text-gray-400">Total Cost</div>
              <div className="text-lg font-semibold text-gray-100">
                {formatCurrency(packingResult.total_cost_usd, 'USD')}
              </div>
            </div>
            <div className="bg-gray-900 rounded px-3 py-2">
              <div className="text-xs text-gray-400">Avg Fill</div>
              <div className="text-lg font-semibold text-gray-100">
                {(packingResult.containers.reduce((sum, c) => sum + c.fill_percent, 0) / packingResult.containers.length).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Container Details */}
          <div className="space-y-3">
            {packingResult.containers.map((container, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-200">
                    Container #{idx + 1} ({container.container_type})
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400">
                      {container.total_volume_cbm.toFixed(2)} / {CONTAINER_SPECS[container.container_type].volume_cbm} CBM
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        container.fill_percent >= 80
                          ? 'bg-green-900/30 text-green-300'
                          : container.fill_percent >= 70
                          ? 'bg-yellow-900/30 text-yellow-300'
                          : 'bg-red-900/30 text-red-300'
                      }`}
                    >
                      {container.fill_percent.toFixed(1)}% full
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {container.products.length} products, {formatCurrency(container.total_cost_usd, 'USD')}
                </div>
              </div>
            ))}
          </div>

          {packingResult.unpacked_products.length > 0 && (
            <div className="mt-4 bg-red-900/20 border border-red-700 rounded-lg p-3">
              <div className="text-sm text-red-300 font-medium">
                Warning: {packingResult.unpacked_products.length} products could not be packed
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reorder Alerts Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-200">
            Reorder Alerts ({alerts.length} products)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(new Set(alerts.map(a => a.product_name)));
                      } else {
                        setSelectedProducts(new Set());
                      }
                    }}
                    className="rounded border-gray-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Product
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Available
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Days Stock
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Reorder Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Supplier
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No reorder alerts. All products are above reorder point.
                  </td>
                </tr>
              ) : (
                alerts.map((alert, idx) => (
                  <tr key={idx} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(alert.product_name)}
                        onChange={() => handleProductToggle(alert.product_name)}
                        className="rounded border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-200">
                      {alert.product_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 text-right">
                      {formatNumber(alert.total_available)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {alert.days_of_stock !== null ? (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                            alert.days_of_stock < 7
                              ? 'bg-red-900/30 text-red-300 border border-red-700'
                              : alert.days_of_stock < 14
                              ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                              : 'bg-green-900/30 text-green-300 border border-green-700'
                          }`}
                        >
                          {alert.days_of_stock} days
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-200 text-right font-medium">
                      {formatNumber(alert.suggested_order_qty)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {alert.supplier_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-200 text-right">
                      {formatCurrency(alert.supplier_price_usd, 'USD')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Panel */}
      {alerts.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-300 mb-1">How to Use</h4>
              <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                <li>Select products to include in purchase order using checkboxes</li>
                <li>Choose container type (20ft or 40hq) based on order volume</li>
                <li>Click "Optimize Packing" to calculate optimal container utilization</li>
                <li>Review packing plan and adjust quantities if needed</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReorderPlanningPanel;
