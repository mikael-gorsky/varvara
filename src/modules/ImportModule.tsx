import React, { useState } from 'react';
import OzonDashboard from '../components/OzonDashboard';
import PricelistDashboard from '../components/PricelistDashboard';
import OzonDataImport from '../components/ozon/OzonDataImport';
import OzonReportsList from '../components/ozon/OzonReportsList';

interface ImportModuleProps {
  activeL2: string | null;
}

const ImportModule: React.FC<ImportModuleProps> = ({ activeL2 }) => {
  const [selectedImportSource, setSelectedImportSource] = useState<string | null>(null);
  const [showOzonImport, setShowOzonImport] = useState(false);

  if (selectedImportSource === 'ozon') {
    return <OzonDashboard onBack={() => setSelectedImportSource(null)} />;
  }

  if (selectedImportSource === 'pricelist') {
    return <PricelistDashboard onBack={() => setSelectedImportSource(null)} />;
  }

  if (showOzonImport) {
    return <OzonDataImport onBack={() => setShowOzonImport(false)} />;
  }

  const renderContent = () => {
    if (!activeL2) {
      return (
        <div>
          <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
            IMPORT
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Select an import type from the menu
          </p>
        </div>
      );
    }

    switch (activeL2) {
      case 'IMPORT OZON REPORTS':
        return (
          <div className="space-y-6">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              OZON REPORTS
            </h2>
            <OzonReportsList onNewImport={() => setShowOzonImport(true)} />
          </div>
        );
      case 'IMPORT WB REPORTS':
      case 'IMPORT YANDEX.MARKET REPORTS':
      case 'IMPORT OUR PRICE-LIST':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              {activeL2}
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              This import type is coming soon...
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
