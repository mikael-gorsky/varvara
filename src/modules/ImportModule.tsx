import React, { useState } from 'react';
import OzonDashboard from '../components/OzonDashboard';
import PricelistDashboard from '../components/PricelistDashboard';
import ImportStatusDisplay from '../components/ImportStatusDisplay';

interface ImportModuleProps {
  activeL2: string | null;
}

const ImportModule: React.FC<ImportModuleProps> = ({ activeL2 }) => {
  const [selectedImportSource, setSelectedImportSource] = useState<string | null>(null);

  if (selectedImportSource === 'ozon') {
    return <OzonDashboard onBack={() => setSelectedImportSource(null)} />;
  }

  if (selectedImportSource === 'pricelist') {
    return <PricelistDashboard onBack={() => setSelectedImportSource(null)} />;
  }

  const renderContent = () => {
    switch (activeL2) {
      case 'Marketplaces':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              MARKETPLACE IMPORT
            </h2>
            <ImportStatusDisplay
              onNavigateToOzon={() => setSelectedImportSource('ozon')}
              onNavigateToPricelist={() => setSelectedImportSource('pricelist')}
            />
          </div>
        );
      case 'Price Lists':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              PRICE LIST IMPORT
            </h2>
            <div
              className="p-6 border cursor-pointer transition-colors duration-fast hover:bg-[var(--surface-1)]"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--divider-standard)'
              }}
              onClick={() => setSelectedImportSource('pricelist')}
            >
              <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                Launch Price List Import Tool
              </p>
            </div>
          </div>
        );
      case 'Accounting':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              ACCOUNTING IMPORT
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Accounting import coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              IMPORT
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Select an import source
            </p>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default ImportModule;
