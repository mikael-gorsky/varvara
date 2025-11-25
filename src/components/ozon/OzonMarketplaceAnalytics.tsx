import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Users, BarChart3 } from 'lucide-react';
import { marketplaceAnalyticsService, MarketplaceOverview } from '../../services/marketplaceAnalyticsService';

interface OzonMarketplaceAnalyticsProps {
  onBack?: () => void;
}

const OzonMarketplaceAnalytics: React.FC<OzonMarketplaceAnalyticsProps> = ({ onBack }) => {
  const [overview, setOverview] = useState<MarketplaceOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await marketplaceAnalyticsService.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load overview:', err);
      setError('Failed to load marketplace overview');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !overview) {
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

  return (
    <div style={{ padding: 'var(--spacing-3)' }}>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase" style={{ color: 'var(--accent)' }}>
          COMPANIES
        </h2>
      </div>

      {overview && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-3)'
        }}>
          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <Package size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Categories</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {overview.totalCategories}
            </p>
          </div>

          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <Users size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Suppliers (100+)</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {overview.suppliersOver100}
            </p>
          </div>

          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Products</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {overview.totalProducts.toLocaleString()}
            </p>
          </div>

          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Total Revenue</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              ₽{(overview.totalRevenue / 1_000_000).toFixed(1)}M
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OzonMarketplaceAnalytics;
