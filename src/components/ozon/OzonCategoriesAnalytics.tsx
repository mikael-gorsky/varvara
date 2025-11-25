import React, { useState, useEffect } from 'react';
import { categoriesAnalyticsService, CategoryStats } from '../../services/categoriesAnalyticsService';

interface OzonCategoriesAnalyticsProps {
  onBack?: () => void;
}

const OzonCategoriesAnalytics: React.FC<OzonCategoriesAnalyticsProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await categoriesAnalyticsService.getTopCategories(10);
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories data');
    } finally {
      setIsLoading(false);
    }
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
          {categories.map((category, index) => (
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
                  Sales Dynamics by Reporting Period:
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 'var(--spacing-1)',
                  marginTop: 'var(--spacing-1)'
                }}>
                  {category.salesByPeriod.map((period) => (
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
                        {formatCurrency(period.sales)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OzonCategoriesAnalytics;
