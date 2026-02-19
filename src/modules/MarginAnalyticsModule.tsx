import React, { useState, useEffect } from 'react';
import {
  getAvailablePeriods,
  getAvailableCategories,
  getMarginKPIs,
  formatCurrency,
  formatPeriod,
  type MarginKPIs,
} from '../services/marginAnalytics';

interface PeriodData {
  period: string;
  kpis: MarginKPIs | null;
  exchangeRate: number | null;
}

const MarginAnalyticsModule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Three periods to compare
  const [periods, setPeriods] = useState<[string, string, string]>(['', '', '']);
  const [periodData, setPeriodData] = useState<[PeriodData, PeriodData, PeriodData]>([
    { period: '', kpis: null, exchangeRate: null },
    { period: '', kpis: null, exchangeRate: null },
    { period: '', kpis: null, exchangeRate: null },
  ]);

  // Load available filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [fetchedPeriods, categories] = await Promise.all([
          getAvailablePeriods(),
          getAvailableCategories(),
        ]);

        setAvailablePeriods(fetchedPeriods);
        setAvailableCategories(categories);

        // Set default periods: latest month, same month last year, same month 2 years ago
        if (fetchedPeriods.length > 0) {
          const latestPeriod = fetchedPeriods[0]; // Most recent (e.g., "2025-12-01")
          const [year, month, day] = latestPeriod.split('-');

          const period1 = latestPeriod;
          const period2 = `${parseInt(year) - 1}-${month}-${day}`; // Same month last year
          const period3 = `${parseInt(year) - 2}-${month}-${day}`; // Same month 2 years ago

          setPeriods([period1, period2, period3]);
        }
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('Failed to load filter options');
      }
    };

    loadFilterOptions();
  }, []);

  // Load data when periods or category change
  useEffect(() => {
    if (!periods[0]) return; // Wait for periods to be set

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          customer_category: selectedCategory !== 'all' ? selectedCategory : undefined,
        };

        const dataPromises = periods.map(async (period) => {
          const kpis = await getMarginKPIs({
            ...filters,
            period_date: period,
          });

          // Calculate exchange rate from KPIs
          const exchangeRate =
            kpis.total_revenue_rub > 0 && kpis.total_revenue_usd > 0
              ? kpis.total_revenue_rub / kpis.total_revenue_usd
              : null;

          return { period, kpis, exchangeRate };
        });

        const data = await Promise.all(dataPromises);
        setPeriodData(data as [PeriodData, PeriodData, PeriodData]);
      } catch (err) {
        console.error('Error loading margin data:', err);
        setError('Failed to load margin data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [periods, selectedCategory]);

  const formatValue = (valueRub: number, valueUsd: number, hasExchangeRate: boolean) => {
    if (!hasExchangeRate) {
      return (
        <>
          <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
            ***
          </p>
          <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
            RUB {formatCurrency(valueRub, 'RUB')}
          </p>
        </>
      );
    }

    return (
      <>
        <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
          RUB {formatCurrency(valueRub, 'RUB')}
        </p>
        <p className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>
          ${formatCurrency(valueUsd, 'USD')}
        </p>
      </>
    );
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const handlePeriodChange = (index: number, newPeriod: string) => {
    const newPeriods: [string, string, string] = [...periods] as [string, string, string];
    newPeriods[index] = newPeriod;
    setPeriods(newPeriods);
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
          Comparative analysis across three time periods
        </p>
      </div>

      {/* Period Selection */}
      <div className="mb-6 p-6 space-y-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-label uppercase mb-4" style={{ color: 'var(--text-secondary)' }}>
          SELECT PERIODS
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {periods.map((period, index) => (
            <div key={index}>
              <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
                PERIOD {index + 1}
              </p>
              <select
                className="w-full p-3 text-body bg-transparent border"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                }}
                value={period}
                onChange={(e) => handlePeriodChange(index, e.target.value)}
                disabled={loading}
              >
                {availablePeriods.length === 0 ? (
                  <option value="">Loading...</option>
                ) : (
                  availablePeriods.map((p) => (
                    <option key={p} value={p}>
                      {formatPeriod(p)}
                    </option>
                  ))
                )}
              </select>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div>
          <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            CUSTOMER CATEGORY
          </p>
          <select
            className="w-full p-3 text-body bg-transparent border"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
      </div>

      {/* KPI Grid - 3 Columns for 3 Periods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {periodData.map((data, periodIndex) => (
          <div key={periodIndex} className="space-y-4">
            {/* Period Header */}
            <div className="p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-section-title uppercase" style={{ color: '#E91E63' }}>
                {data.period ? formatPeriod(data.period) : '...'}
              </p>
              {data.exchangeRate && (
                <p className="text-label-xs uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {data.exchangeRate.toFixed(2)} RUB/USD
                </p>
              )}
            </div>

            {/* Total Revenue */}
            <div
              className="p-6 min-h-[140px] flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                TOTAL REVENUE
              </p>
              {loading || !data.kpis ? (
                <p className="text-kpi-value my-2" style={{ color: 'var(--text-tertiary)' }}>
                  ...
                </p>
              ) : (
                formatValue(
                  data.kpis.total_revenue_rub,
                  data.kpis.total_revenue_usd,
                  !!data.exchangeRate
                )
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
              {loading || !data.kpis ? (
                <p className="text-kpi-value my-2" style={{ color: 'var(--text-tertiary)' }}>
                  ...
                </p>
              ) : (
                formatValue(
                  data.kpis.total_margin_rub,
                  data.kpis.total_margin_usd,
                  !!data.exchangeRate
                )
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
              {loading || !data.kpis ? (
                <p className="text-kpi-value my-2" style={{ color: 'var(--text-tertiary)' }}>
                  ...
                </p>
              ) : (
                <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
                  {formatPercent(data.kpis.avg_margin_percent)}
                </p>
              )}
            </div>

            {/* Transaction Count */}
            <div
              className="p-6 min-h-[140px] flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                TRANSACTIONS
              </p>
              {loading || !data.kpis ? (
                <p className="text-kpi-value my-2" style={{ color: 'var(--text-tertiary)' }}>
                  ...
                </p>
              ) : (
                <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
                  {data.kpis.transaction_count}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarginAnalyticsModule;
