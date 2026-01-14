import React, { useState, useEffect } from 'react';
import { companiesAnalyticsService, CompanyStats } from '../../services/companiesAnalyticsService';

interface CompanyPeriodStats {
  date: string;
  days: number;
  salesPerDay: number;
  marketShare: number;
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

  const calculateCompanyMarketShare = (companyPeriods: { date: string; sales: number; days: number }[]): CompanyPeriodStats[] => {
    const sortedPeriods = [...companyPeriods].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sortedPeriods.map(period => {
      const marketTotal = marketTotals.find(mt => mt.date === period.date);
      const companySalesPerDay = period.sales / period.days;
      const marketShare = marketTotal ? (companySalesPerDay / marketTotal.totalSalesPerDay) * 100 : 0;

      return {
        date: period.date,
        days: period.days,
        salesPerDay: companySalesPerDay,
        marketShare
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
    <div className="p-8">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 500,
          textTransform: 'uppercase',
          color: '#E91E63'
        }}>
          TOP 10 COMPANIES BY SALES VOLUME
        </h2>
      </div>

      {companies.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
          No data available
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {marketTotals.length > 0 && (
            <div
              style={{
                backgroundColor: '#E91E63',
                padding: '24px',
              }}
            >
              <h3 style={{
                color: 'white',
                marginBottom: '16px',
                fontSize: '18px',
                fontWeight: 500,
                textTransform: 'uppercase'
              }}>
                MARKET TOTAL - SALES PER DAY DYNAMICS
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                {marketTotals.map((period) => (
                  <div
                    key={period.date}
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid #E91E63',
                      minWidth: '180px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                        {formatDate(period.date)}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                        {period.days}d
                      </span>
                    </div>
                    <span style={{
                      color: '#E91E63',
                      fontWeight: 600,
                      fontSize: '24px'
                    }}>
                      {formatCurrency(period.totalSalesPerDay)}/day
                    </span>
                    {period.percentageVsFirst !== null && (
                      <span style={{
                        color: period.percentageVsFirst >= 100 ? 'var(--status-success)' : 'var(--status-error)',
                        fontSize: '18px',
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
            const periodStats = calculateCompanyMarketShare(company.salesByPeriod);

            return (
              <div
                key={company.seller}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--divider-standard)',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{
                        color: '#E91E63',
                        minWidth: '40px',
                        fontSize: '20px',
                        fontWeight: 600
                      }}>
                        #{index + 1}
                      </span>
                      <h3 style={{
                        color: 'var(--text-primary)',
                        fontSize: '20px',
                        fontWeight: 500,
                        textTransform: 'uppercase'
                      }}>
                        {company.seller}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '32px', marginTop: '12px' }}>
                      <div>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '14px', textTransform: 'uppercase' }}>Total Sales:</span>
                        <span style={{ color: '#E91E63', marginLeft: '8px', fontWeight: 600, fontSize: '20px' }}>
                          {formatCurrency(company.totalSales)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '14px', textTransform: 'uppercase' }}>Products:</span>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '20px' }}>
                          {company.productCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <h4 style={{
                    marginBottom: '16px',
                    fontSize: '16px',
                    textTransform: 'uppercase'
                  }}>
                    <span style={{ color: 'var(--text-primary)' }}>daily sales volume</span>
                    <span style={{ color: 'var(--text-tertiary)' }}> / </span>
                    <span style={{ color: '#E91E63' }}>market share</span>
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}>
                    {periodStats.map((period) => (
                      <div
                        key={period.date}
                        style={{
                          padding: '16px',
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--divider-standard)',
                          minWidth: '180px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                            {formatDate(period.date)}
                          </span>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                            {period.days}d
                          </span>
                        </div>
                        <span style={{
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '24px'
                        }}>
                          {formatCurrency(period.salesPerDay)}/day
                        </span>
                        <span style={{
                          color: '#E91E63',
                          fontSize: '22px',
                          fontWeight: 600
                        }}>
                          {period.marketShare.toFixed(1)}%
                        </span>
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
