import React, { useState } from 'react';
import { Users, Layers } from 'lucide-react';
import OzonCompaniesAnalytics from './OzonCompaniesAnalytics';
import OzonCategoriesAnalytics from './OzonCategoriesAnalytics';

interface OzonMarketplaceAnalyticsProps {
  onBack?: () => void;
}

type AnalyticsView = 'companies' | 'categories';

const OzonMarketplaceAnalytics: React.FC<OzonMarketplaceAnalyticsProps> = ({ onBack }) => {
  const [activeView, setActiveView] = useState<AnalyticsView>('companies');

  return (
    <div style={{ padding: 'var(--spacing-3)' }}>
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-2)',
        marginBottom: 'var(--spacing-3)',
        borderBottom: '1px solid var(--divider-standard)',
        paddingBottom: 'var(--spacing-2)'
      }}>
        <button
          onClick={() => setActiveView('companies')}
          style={{
            padding: 'var(--spacing-2)',
            backgroundColor: activeView === 'companies' ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${activeView === 'companies' ? 'var(--accent)' : 'var(--divider-standard)'}`,
            color: activeView === 'companies' ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
            transition: 'all 0.2s'
          }}
        >
          <Users style={{ width: '20px', height: '20px' }} />
          <span className="text-body uppercase" style={{ fontWeight: 600 }}>Companies</span>
        </button>

        <button
          onClick={() => setActiveView('categories')}
          style={{
            padding: 'var(--spacing-2)',
            backgroundColor: activeView === 'categories' ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${activeView === 'categories' ? 'var(--accent)' : 'var(--divider-standard)'}`,
            color: activeView === 'categories' ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
            transition: 'all 0.2s'
          }}
        >
          <Layers style={{ width: '20px', height: '20px' }} />
          <span className="text-body uppercase" style={{ fontWeight: 600 }}>Categories</span>
        </button>
      </div>

      {activeView === 'companies' ? (
        <OzonCompaniesAnalytics />
      ) : (
        <OzonCategoriesAnalytics />
      )}
    </div>
  );
};

export default OzonMarketplaceAnalytics;
