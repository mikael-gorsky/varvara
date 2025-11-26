import React, { useState, useEffect } from 'react';
import { companiesAnalyticsService, CompanyStats } from '../../services/companiesAnalyticsService';

interface PeriodStats {
  date: string;
  days: number;
  sales: number;
  salesPerDay: number;
  percentageVsFirst: number | null;
}

interface MarketTotals {
  date: string;
  days: number;
  totalSalesPerDay: number;
  percentageVsFirst: number | null;
}

const OzonCompaniesAnalytics: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [marketTotals, setMarketTotals] = useState<MarketTotals[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await companiesAnalyticsService.getTopCompanies(10);
      setCompanies(data);
      calculateMarketTotals(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Failed to load companies data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMarketTotals = (companiesData: CompanyStats[]) => {
    if (companiesData.length === 0) return;

    const periodsMap = new Map<string, { totalSales: number; days: number }>();

    companiesData.forEach(company => {
      company.salesByPeriod.forEach(period => {
        if (!periodsMap.has(period.date)) {
          periodsMap.set(period.date, { totalSales: 0, days: period.days });
        }
        const periodData = periodsMap.get(period.date)!;
        periodData.totalSales += period.sales;
      });
    });

    const sortedPeriods = Array.from(periodsMap.entries())
      .map(([date, data]) => ({
        date,
        days: data.days,
        totalSales: data.totalSales,
        totalSalesPerDay: data.totalSales / data.days
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const firstPeriodSalesPerDay = sortedPeriods[0]?.totalSalesPerDay || 0;

    const totalsWithPercentages = sortedPeriods.map((period, index) => ({
      date: period.date,
      days: period.days,
      totalSalesPerDay: period.totalSalesPerDay,
      percentageVsFirst: index === 0
        ? null
        : ((period.totalSalesPerDay / firstPeriodSalesPerDay) * 100)
    }));

    setMarketTotals(totalsWithPercentages);
  };

  const calculatePeriodStats = (periods: { date: string; sales: number; days: number }[]): PeriodStats[] => {
    const sortedPeriods = [...periods].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedPeriods.length === 0) return [];

    const firstPeriodSalesPerDay = sortedPeriods[0].sales / sortedPeriods[0].days;

    return sortedPeriods.map((period, index) => {
      const salesPerDay = period.sales / period.days;
      return {
        date: period.date,
        days: period.days,
        sales: period.sales,
        salesPerDay,
        percentageVsFirst: index === 0
          ? null
          : ((salesPerDay / firstPeriodSalesPerDay) * 100)
      };
    });
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000) {
      return `₽${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `₽${(value / 1_000).toFixed(0)}K`;
    }
    return `₽${value.toFixed(0)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 'var(--spacing-3)'
      }}>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'var(--spacing-3)' }}>
        <p className="text-body" style={{ color: 'var(--status-error)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase" style={{ color: 'var(--accent)' }}>
          TOP 10 COMPANIES BY SALES VOLUME
        </h2>
      </div>

      {companies.length === 0 ? (
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          No data available
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>

          {marketTotals.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--accent)',
                border: '2px solid var(--accent)',
                padding: 'var(--spacing-2)',
              }}
            >
              <h3 className="text-subsection uppercase" style={{ color: 'var(--bg-primary)', marginBottom: 'var(--spacing-2)' }}>
                MARKET TOTAL - SALES PER DAY DYNAMICS
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 'var(--spacing-1)',
              }}>
                {marketTotals.map((period) => (
                  <div
                    key={period.date}
                    style={{
                      padding: 'var(--spacing-1)',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--accent)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--spacing-0-5)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-label" style={{ color: 'var(--text-tertiary)' }}>
                        {formatDate(period.date)}
                      </span>
                      <span className="text-label" style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>
                        {period.days}d
                      </span>
                    </div>
                    <span className="text-body" style={{
                      color: 'var(--accent)',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}>
                      {formatCurrency(period.totalSalesPerDay)}/day
                    </span>
                    {period.percentageVsFirst !== null && (
                      <span className="text-label" style={{
                        color: period.percentageVsFirst >= 100 ? 'var(--status-success)' : 'var(--status-error)',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        {period.percentageVsFirst.toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {companies.map((company, index) => {
            const periodStats = calculatePeriodStats(company.salesByPeriod);

            return (
              <div
                key={company.seller}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--divider-standard)',
                  padding: 'var(--spacing-2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-2)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
                      <span className="text-label" style={{
                        color: 'var(--text-tertiary)',
                        minWidth: '30px'
                      }}>
                        #{index + 1}
                      </span>
                      <h3 className="text-subsection uppercase" style={{ color: 'var(--text-primary)' }}>
                        {company.seller}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-1)' }}>
                      <div>
                        <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Total Sales:</span>
                        <span className="text-body" style={{ color: 'var(--accent)', marginLeft: 'var(--spacing-1)', fontWeight: 600 }}>
                          {formatCurrency(company.totalSales)}
                        </span>
                      </div>
                      <div>
                        <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Products:</span>
                        <span className="text-body" style={{ color: 'var(--text-secondary)', marginLeft: 'var(--spacing-1)' }}>
                          {company.productCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--spacing-2)' }}>
                  <h4 className="text-label uppercase" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-1)' }}>
                    Sales Per Day by Reporting Period:
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 'var(--spacing-1)',
                    marginTop: 'var(--spacing-1)'
                  }}>
                    {periodStats.map((period) => (
                      <div
                        key={period.date}
                        style={{
                          padding: 'var(--spacing-1)',
                          backgroundColor: 'var(--surface-1)',
                          border: '1px solid var(--divider-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--spacing-0-5)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="text-label" style={{ color: 'var(--text-tertiary)' }}>
                            {formatDate(period.date)}
                          </span>
                          <span className="text-label" style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>
                            {period.days}d
                          </span>
                        </div>
                        <span className="text-body" style={{
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '13px'
                        }}>
                          {formatCurrency(period.salesPerDay)}/day
                        </span>
                        {period.percentageVsFirst !== null && (
                          <span className="text-label" style={{
                            color: period.percentageVsFirst >= 100 ? 'var(--status-success)' : 'var(--status-error)',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            {period.percentageVsFirst.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OzonCompaniesAnalytics;
