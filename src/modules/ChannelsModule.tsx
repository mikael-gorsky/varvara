import React from 'react';
import OzonMarketplaceAnalytics from '../components/ozon/OzonMarketplaceAnalytics';
import PricelistAnalytics from '../components/pricelist/PricelistAnalytics';
import PriceComparison from '../components/comparison/PriceComparison';

interface ChannelsModuleProps {
  activeL2: string | null;
}

const ChannelsModule: React.FC<ChannelsModuleProps> = ({ activeL2 }) => {
  const renderContent = () => {
    switch (activeL2) {
      case 'Ozon':
        return <OzonMarketplaceAnalytics onBack={() => {}} />;
      case 'Cumulative':
      case 'Wildberries':
      case 'Yandex':
      case 'Resellers':
      case 'Tenders':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              {activeL2}
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              {activeL2} channel analytics coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
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
