import React, { useState, useEffect } from 'react';
import {
  getAvailablePeriods,
  getAvailableCategories,
  getMarginKPIs,
  getCustomerMargins,
  formatCurrency,
  formatPeriod,
  type MarginKPIs,
  type CustomerMarginData,
} from '../services/marginAnalytics';

interface FilterState {
  period: string;
  category: string;
}

const MarginAnalyticsModule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    period: '',
    category: 'all',
  });

  // Data state
  const [kpiData, setKpiData] = useState<MarginKPIs | null>(null);
  const [customers, setCustomers] = useState<CustomerMarginData[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(95.0);

  // Load available filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [periods, categories] = await Promise.all([
          getAvailablePeriods(),
          getAvailableCategories(),
        ]);

        setAvailablePeriods(periods);
        setAvailableCategories(categories);

        // Set default period to most recent
        if (periods.length > 0) {
          setFilterState((prev) => ({ ...prev, period: periods[0] }));
        }
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('Failed to load filter options');
      }
    };

    loadFilterOptions();
  }, []);

  // Load data when filters change
  useEffect(() => {
    if (!filterState.period) return; // Wait for period to be set

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          period_date: filterState.period,
          customer_category: filterState.category !== 'all' ? filterState.category : undefined,
        };

        const [kpis, customerData] = await Promise.all([
          getMarginKPIs(filters),
          getCustomerMargins(filters, 50),
        ]);

        setKpiData(kpis);
        setCustomers(customerData);

        // Calculate exchange rate from KPIs
        if (kpis.total_revenue_rub > 0 && kpis.total_revenue_usd > 0) {
          setExchangeRate(kpis.total_revenue_rub / kpis.total_revenue_usd);
        }
      } catch (err) {
        console.error('Error loading margin data:', err);
        setError('Failed to load margin data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filterState]);

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via useEffect
    // This button is here for explicit user action if needed
    console.log('Filters applied:', filterState);
  };

  if (error) {
    return (
      <div className="p-4 lg:p-8">
        <div
          className="p-6"
          style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: '2px solid var(--status-error)' }}
        >
          <p className="text-body" style={{ color: 'var(--status-error)' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Page Title */}
      <div className="mb-8">
        <h2
          className="text-page-title-mobile md:text-page-title-desktop uppercase mb-2"
          style={{ color: 'var(--accent)' }}
        >
          MARGIN ANALYTICS
        </h2>
        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
          Exchange rate: {exchangeRate.toFixed(2)} RUB/USD (
          {filterState.period ? formatPeriod(filterState.period) : '...'} avg)
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div
          className="p-6 min-h-[140px] flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            TOTAL REVENUE
          </p>
          {loading || !kpiData ? (
            <p className="text-kpi-value my-2" style={{ color: 'var(--text-tertiary)' }}>
              ...
            </p>
          ) : (
            <>
              <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
                ${formatCurrency(kpiData.total_revenue_usd, 'USD')}
              </p>
              <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
                RUB {formatCurrency(kpiData.total_revenue_rub, 'RUB')}
              </p>
            </>
          )}
        </div>

        {/* Total Margin */}
        <div
          className="p-6 min-h-[140px] flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            TOTAL MARGIN
          </p>
          {loading || !kpiData ? (
            <p className="text-kpi-value my-2" style={{ color: 'var(--text-tertiary)' }}>
              ...
            </p>
          ) : (
            <>
              <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
                ${formatCurrency(kpiData.total_margin_usd, 'USD')}
              </p>
              <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
                RUB {formatCurrency(kpiData.total_margin_rub, 'RUB')}
              </p>
            </>
          )}
        </div>

        {/* Margin % */}
        <div
          className="p-6 min-h-[140px] flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            MARGIN %
          </p>
          {loading || !kpiData ? (
            <p className="text-kpi-value my-2" style={{ color: 'var(--text-tertiary)' }}>
              ...
            </p>
          ) : (
            <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
              {formatPercent(kpiData.avg_margin_percent)}
            </p>
          )}
        </div>

        {/* Active Customers */}
        <div
          className="p-6 min-h-[140px] flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            ACTIVE CUSTOMERS
          </p>
          {loading ? (
            <p className="text-kpi-value my-2" style={{ color: 'var(--text-tertiary)' }}>
              ...
            </p>
          ) : (
            <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
              {customers.length}
            </p>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="p-6 mb-6 space-y-4 lg:space-y-0 lg:flex lg:gap-4 lg:items-end"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Period Filter */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            PERIOD
          </p>
          <select
            className="w-full p-3 text-body bg-transparent border"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            value={filterState.period}
            onChange={(e) => setFilterState({ ...filterState, period: e.target.value })}
            disabled={loading}
          >
            {availablePeriods.length === 0 ? (
              <option value="">Loading...</option>
            ) : (
              availablePeriods.map((period) => (
                <option key={period} value={period}>
                  {formatPeriod(period)}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            CATEGORY
          </p>
          <select
            className="w-full p-3 text-body bg-transparent border"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            value={filterState.category}
            onChange={(e) => setFilterState({ ...filterState, category: e.target.value })}
            disabled={loading}
          >
            <option value="all">All Categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Apply Button */}
        <button
          className="w-full lg:w-auto px-6 py-3 text-body uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: '#E91E63', color: 'white' }}
          onClick={handleApplyFilters}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>

      {/* Customer List */}
      <div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h3 className="text-section-title uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>
          TOP CUSTOMERS BY REVENUE
        </h3>

        {loading ? (
          <p className="text-body" style={{ color: 'var(--text-tertiary)' }}>
            Loading customers...
          </p>
        ) : customers.length === 0 ? (
          <p className="text-body" style={{ color: 'var(--text-tertiary)' }}>
            No customers found for selected filters
          </p>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <div
                key={customer.customer_id}
                className="p-4 border-l-2 transition-colors duration-fast hover:bg-[var(--bg-primary)]"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: '#E91E63',
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    {String(customer.rank).padStart(2, '0')}
                  </span>

                  <div className="flex-1 min-w-0">
                    {/* Customer Name */}
                    <p className="text-body mb-1" style={{ color: 'var(--text-primary)' }}>
                      {customer.customer_name}
                    </p>

                    {/* INN & Category */}
                    <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
                      INN: {customer.customer_inn} • {customer.customer_category}
                    </p>

                    {/* Metrics Row */}
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
                          REVENUE
                        </p>
                        <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                          ${formatCurrency(customer.revenue_usd, 'USD')}{' '}
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            RUB {formatCurrency(customer.revenue_rub, 'RUB')}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
                          MARGIN
                        </p>
                        <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                          ${formatCurrency(customer.margin_usd, 'USD')}{' '}
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            RUB {formatCurrency(customer.margin_rub, 'RUB')}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
                          MARGIN %
                        </p>
                        <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                          {formatPercent(customer.margin_percent)}
                        </p>
                      </div>

                      <div>
                        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
                          TRANSACTIONS
                        </p>
                        <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                          {customer.transaction_count}
                        </p>
                      </div>
                    </div>
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

export default MarginAnalyticsModule;
