import React, { useState, useEffect } from 'react';
import {
  getAvailablePeriods,
  getMarginKPIs,
  getCustomerGroupKPIs,
  formatCurrency,
  formatPeriod,
  type MarginKPIs,
  type CustomerGroupKPIs,
} from '../services/marginAnalytics';

interface PeriodData {
  period: string;
  kpis: MarginKPIs | null;
  groupKPIs: CustomerGroupKPIs[];
  exchangeRate: number | null;
}

const MarginAnalyticsModule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);

  // Three periods to compare
  const [periods, setPeriods] = useState<[string, string, string]>(['', '', '']);
  const [periodData, setPeriodData] = useState<[PeriodData, PeriodData, PeriodData]>([
    { period: '', kpis: null, groupKPIs: [], exchangeRate: null },
    { period: '', kpis: null, groupKPIs: [], exchangeRate: null },
    { period: '', kpis: null, groupKPIs: [], exchangeRate: null },
  ]);

  // All unique customer groups across all periods
  const [customerGroups, setCustomerGroups] = useState<string[]>([]);

  // Load available filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const fetchedPeriods = await getAvailablePeriods();

        setAvailablePeriods(fetchedPeriods);

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

  // Load data when periods change
  useEffect(() => {
    if (!periods[0]) return; // Wait for periods to be set

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const dataPromises = periods.map(async (period) => {
          const [kpis, groupKPIs] = await Promise.all([
            getMarginKPIs({ period_date: period }),
            getCustomerGroupKPIs(period),
          ]);

          // Calculate exchange rate from KPIs
          const exchangeRate =
            kpis.total_revenue_rub > 0 && kpis.total_revenue_usd > 0
              ? kpis.total_revenue_rub / kpis.total_revenue_usd
              : null;

          return { period, kpis, groupKPIs, exchangeRate };
        });

        const data = await Promise.all(dataPromises);
        setPeriodData(data as [PeriodData, PeriodData, PeriodData]);

        // Collect all unique customer groups across all periods
        const allGroups = new Set<string>();
        data.forEach(pd => {
          pd.groupKPIs.forEach(g => allGroups.add(g.customer_category));
        });
        setCustomerGroups(Array.from(allGroups).sort());
      } catch (err) {
        console.error('Error loading margin data:', err);
        setError('Failed to load margin data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [periods]);

  const handlePeriodChange = (index: number, newPeriod: string) => {
    const newPeriods: [string, string, string] = [...periods] as [string, string, string];
    newPeriods[index] = newPeriod;
    setPeriods(newPeriods);
  };

  const formatValue = (
    valueRub: number,
    valueUsd: number,
    hasExchangeRate: boolean,
    color: string
  ) => {
    if (!hasExchangeRate) {
      return (
        <div>
          <p className="text-body-lg font-medium" style={{ color }}>
            ***
          </p>
          <p className="text-body-sm ml-8" style={{ color: 'var(--text-tertiary)' }}>
            RUB {formatCurrency(valueRub, 'RUB')}
          </p>
        </div>
      );
    }

    return (
      <div>
        <p className="text-body-lg font-medium" style={{ color }}>
          RUB {formatCurrency(valueRub, 'RUB')}
        </p>
        <p className="text-body-sm ml-8" style={{ color: 'var(--text-tertiary)' }}>
          ${formatCurrency(valueUsd, 'USD')}
        </p>
      </div>
    );
  };

  const formatPercent = (value: number, color: string): JSX.Element => {
    return (
      <p className="text-body-lg font-medium" style={{ color }}>
        {value.toFixed(1)}%
      </p>
    );
  };

  const formatCount = (value: number, color: string): JSX.Element => {
    return (
      <p className="text-body-lg font-medium" style={{ color }}>
        {value}
      </p>
    );
  };

  // Period colors
  const periodColors = ['var(--text-primary)', '#E91E63', '#2196F3']; // white, magenta, blue

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
    <div className="p-4 lg:p-8 pt-5 lg:pt-8">
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
              <p className="text-label-xs uppercase mb-2" style={{ color: periodColors[index] }}>
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
      </div>

      {/* TOTAL METRICS */}
      <div className="mb-8 p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h3 className="text-section-title uppercase mb-6" style={{ color: 'var(--accent)' }}>
          TOTAL
        </h3>

        {/* Total Revenue Row */}
        <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--divider-standard)' }}>
          <p className="text-label uppercase mb-4" style={{ color: 'var(--text-tertiary)' }}>
            TOTAL REVENUE
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {periodData.map((data, index) => (
              <div key={index}>
                {loading || !data.kpis ? (
                  <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
                    ...
                  </p>
                ) : (
                  formatValue(
                    data.kpis.total_revenue_rub,
                    data.kpis.total_revenue_usd,
                    !!data.exchangeRate,
                    periodColors[index]
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total Margin Row */}
        <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--divider-standard)' }}>
          <p className="text-label uppercase mb-4" style={{ color: 'var(--text-tertiary)' }}>
            TOTAL MARGIN
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {periodData.map((data, index) => (
              <div key={index}>
                {loading || !data.kpis ? (
                  <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
                    ...
                  </p>
                ) : (
                  formatValue(
                    data.kpis.total_margin_rub,
                    data.kpis.total_margin_usd,
                    !!data.exchangeRate,
                    periodColors[index]
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Margin % Row */}
        <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--divider-standard)' }}>
          <p className="text-label uppercase mb-4" style={{ color: 'var(--text-tertiary)' }}>
            MARGIN %
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {periodData.map((data, index) => (
              <div key={index}>
                {loading || !data.kpis ? (
                  <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
                    ...
                  </p>
                ) : (
                  formatPercent(data.kpis.avg_margin_percent, periodColors[index])
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Row */}
        <div>
          <p className="text-label uppercase mb-4" style={{ color: 'var(--text-tertiary)' }}>
            TRANSACTIONS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {periodData.map((data, index) => (
              <div key={index}>
                {loading || !data.kpis ? (
                  <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
                    ...
                  </p>
                ) : (
                  formatCount(data.kpis.transaction_count, periodColors[index])
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CUSTOMER GROUP BREAKDOWN */}
      {customerGroups.map((groupName) => (
        <div key={groupName} className="mb-8 p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-section-title uppercase mb-6" style={{ color: 'var(--accent)' }}>
            {groupName}
          </h3>

          {/* Revenue Row */}
          <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--divider-standard)' }}>
            <p className="text-label uppercase mb-4" style={{ color: 'var(--text-tertiary)' }}>
              REVENUE
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {periodData.map((data, index) => {
                const groupData = data.groupKPIs.find(g => g.customer_category === groupName);
                return (
                  <div key={index}>
                    {loading || !groupData ? (
                      <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
                        —
                      </p>
                    ) : (
                      formatValue(
                        groupData.revenue_rub,
                        groupData.revenue_usd,
                        !!data.exchangeRate,
                        periodColors[index]
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Margin Row */}
          <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--divider-standard)' }}>
            <p className="text-label uppercase mb-4" style={{ color: 'var(--text-tertiary)' }}>
              MARGIN
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {periodData.map((data, index) => {
                const groupData = data.groupKPIs.find(g => g.customer_category === groupName);
                return (
                  <div key={index}>
                    {loading || !groupData ? (
                      <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
                        —
                      </p>
                    ) : (
                      formatValue(
                        groupData.margin_rub,
                        groupData.margin_usd,
                        !!data.exchangeRate,
                        periodColors[index]
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Margin % Row */}
          <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--divider-standard)' }}>
            <p className="text-label uppercase mb-4" style={{ color: 'var(--text-tertiary)' }}>
              MARGIN %
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {periodData.map((data, index) => {
                const groupData = data.groupKPIs.find(g => g.customer_category === groupName);
                return (
                  <div key={index}>
                    {loading || !groupData ? (
                      <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
                        —
                      </p>
                    ) : (
                      formatPercent(groupData.avg_margin_percent, periodColors[index])
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions Row */}
          <div>
            <p className="text-label uppercase mb-4" style={{ color: 'var(--text-tertiary)' }}>
              TRANSACTIONS
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {periodData.map((data, index) => {
                const groupData = data.groupKPIs.find(g => g.customer_category === groupName);
                return (
                  <div key={index}>
                    {loading || !groupData ? (
                      <p className="text-body-lg" style={{ color: 'var(--text-tertiary)' }}>
                        —
                      </p>
                    ) : (
                      formatCount(groupData.transaction_count, periodColors[index])
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarginAnalyticsModule;
