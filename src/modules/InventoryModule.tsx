import React from 'react';
import StockLevelsPanel from '../components/inventory/StockLevelsPanel';

interface InventoryModuleProps {
  activeL2: string | null;
}

const InventoryModule: React.FC<InventoryModuleProps> = ({ activeL2 }) => {
  const renderContent = () => {
    if (!activeL2) {
      return (
        <div>
          <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
            INVENTORY
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Select an inventory view from the menu
          </p>
        </div>
      );
    }

    switch (activeL2) {
      case 'STOCK LEVELS':
        return <StockLevelsPanel />;

      case 'ABC ANALYSIS':
      case 'AGING ALERTS':
      case 'REORDER PLANNING':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              {activeL2}
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              This feature is coming soon...
            </p>
          </div>
        );

      default:
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              INVENTORY
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Select an inventory view from the menu
            </p>
          </div>
        );
    }
  };

  return <div style={{ padding: 'var(--spacing-3)' }}>{renderContent()}</div>;
};

export default InventoryModule;
