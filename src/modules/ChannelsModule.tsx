import React from 'react';
import OzonMarketplaceAnalytics from '../components/ozon/OzonMarketplaceAnalytics';
import OzonProductAnalysis from '../components/ozon/OzonProductAnalysis';

interface ChannelsModuleProps {
  activeL2: string | null;
  activeL3: string | null;
}

const ChannelsModule: React.FC<ChannelsModuleProps> = ({ activeL2, activeL3 }) => {

  const renderOzonContent = () => {
    if (activeL3 === 'COMPANIES') {
      return <OzonMarketplaceAnalytics onBack={() => {}} />;
    }

    if (activeL3 === 'PRODUCTS') {
      return <OzonProductAnalysis onBack={() => {}} />;
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

    return null;
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
