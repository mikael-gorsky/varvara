import React, { useState } from 'react';
import OzonDashboard from '../components/OzonDashboard';
import PricelistDashboard from '../components/PricelistDashboard';
import ImportStatusDisplay from '../components/ImportStatusDisplay';
import OzonDataImport from '../components/ozon/OzonDataImport';

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
    switch (activeL2) {
      case 'MARKETPLACE REPORTS':
        return (
          <div className="space-y-6">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              MARKETPLACE IMPORT
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div
                onClick={() => setShowOzonImport(true)}
                className="p-6 border cursor-pointer transition-all duration-fast hover:bg-[var(--surface-1)] hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)'
                }}
              >
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Import OZON Data
                </h3>
                <p className="text-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Upload and process OZON marketplace reports with multi-file batch import
                </p>
              </div>

              <div
                onClick={() => setSelectedImportSource('ozon')}
                className="p-6 border cursor-pointer transition-all duration-fast hover:bg-[var(--surface-1)] hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)'
                }}
              >
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  View Analytics
                </h3>
                <p className="text-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Access analytics dashboard, reports, and price comparisons
                </p>
              </div>
            </div>

            <ImportStatusDisplay
              onNavigateToOzon={() => setSelectedImportSource('ozon')}
              onNavigateToPricelist={() => setSelectedImportSource('pricelist')}
            />
          </div>
        );
      case 'PRICE LISTS':
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
      case 'ACCOUNTING':
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
