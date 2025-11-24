import React, { useState } from 'react';
import OzonMarketplaceAnalytics from '../components/ozon/OzonMarketplaceAnalytics';
import OzonProductAnalysis from '../components/ozon/OzonProductAnalysis';
import { menuStructure } from '../config/menuStructure';

interface ChannelsModuleProps {
  activeL2: string | null;
}

const ChannelsModule: React.FC<ChannelsModuleProps> = ({ activeL2 }) => {
  const [activeL3, setActiveL3] = useState<string | null>(null);

  const renderOzonContent = () => {
    if (activeL3 === 'COMPANIES') {
      return <OzonMarketplaceAnalytics onBack={() => setActiveL3(null)} />;
    }

    if (activeL3 === 'PRODUCTS') {
      return <OzonProductAnalysis onBack={() => setActiveL3(null)} />;
    }

    if (activeL3 === 'MARKETING') {
      return (
        <div style={{ padding: 'var(--spacing-3)' }}>
          <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
            MARKETING
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Marketing analytics coming soon...
          </p>
        </div>
      );
    }

    const l3Items = menuStructure.l3Items?.['OZON'] || [];

    return (
      <div style={{ padding: 'var(--spacing-3)' }}>
        <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
          OZON
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {l3Items.map((item) => (
            <button
              key={item}
              onClick={() => setActiveL3(item)}
              style={{
                padding: 'var(--spacing-2)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--divider-standard)',
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.borderColor = 'var(--divider-standard)';
              }}
            >
              <span className="text-menu-l2">{item}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeL2) {
      case 'OZON':
        return renderOzonContent();
      case 'CUMULATIVE':
      case 'WILDBERRIES':
      case 'YANDEX':
      case 'RESELLERS':
      case 'TENDERS':
        return (
          <div style={{ padding: 'var(--spacing-3)' }}>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              {activeL2}
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              {activeL2} channel analytics coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div style={{ padding: 'var(--spacing-3)' }}>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              CHANNELS
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Select a channel to view analytics
            </p>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default ChannelsModule;
