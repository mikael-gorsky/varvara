import React, { useState, useEffect } from 'react';
import { categoriesAnalyticsService, CategoryStats } from '../../services/categoriesAnalyticsService';

interface CategoryPeriodStats {
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

interface OzonCategoriesAnalyticsProps {
  onBack?: () => void;
}

const OzonCategoriesAnalytics: React.FC<OzonCategoriesAnalyticsProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [marketTotals, setMarketTotals] = useState<MarketTotals[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await categoriesAnalyticsService.getTopCategories(10);
      setCategories(data);
      calculateMarketTotals(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMarketTotals = (categoriesData: CategoryStats[]) => {
    if (categoriesData.length === 0) return;

    const periodsMap = new Map<string, { totalSales: number; days: number }>();

    categoriesData.forEach(category => {
      category.salesByPeriod.forEach(period => {
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

  const calculateCategoryMarketShare = (categoryPeriods: { date: string; sales: number; days: number }[]): CategoryPeriodStats[] => {
    const sortedPeriods = [...categoryPeriods].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sortedPeriods.map(period => {
      const marketTotal = marketTotals.find(mt => mt.date === period.date);
      const categorySalesPerDay = period.sales / period.days;
      const marketShare = marketTotal ? (categorySalesPerDay / marketTotal.totalSalesPerDay) * 100 : 0;

      return {
        date: period.date,
        days: period.days,
        salesPerDay: categorySalesPerDay,
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
    <div style={{ padding: 'var(--spacing-3)' }}>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase" style={{ color: 'var(--accent)' }}>
          TOP 10 CATEGORIES BY SALES VOLUME
        </h2>
      </div>

      {categories.length === 0 ? (
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

          {categories.map((category, index) => {
            const periodStats = calculateCategoryMarketShare(category.salesByPeriod);

            return (
              <div
                key={category.category}
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
                        {category.category}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-1)' }}>
                      <div>
                        <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Total Sales:</span>
                        <span className="text-body" style={{ color: 'var(--accent)', marginLeft: 'var(--spacing-1)', fontWeight: 600 }}>
                          {formatCurrency(category.totalSales)}
                        </span>
                      </div>
                      <div>
                        <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Products:</span>
                        <span className="text-body" style={{ color: 'var(--text-secondary)', marginLeft: 'var(--spacing-1)' }}>
                          {category.productCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--spacing-2)' }}>
                  <h4 className="text-label uppercase" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-1)' }}>
                    Market Share by Reporting Period:
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
                        <span className="text-label" style={{
                          color: 'var(--accent)',
                          fontSize: '12px',
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

export default OzonCategoriesAnalytics;
