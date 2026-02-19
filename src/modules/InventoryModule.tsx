import React from 'react';
import StockLevelsPanel from '../components/inventory/StockLevelsPanel';
import ABCAnalysisPanel from '../components/inventory/ABCAnalysisPanel';
import AgingAlertsPanel from '../components/inventory/AgingAlertsPanel';
import ReorderPlanningPanel from '../components/inventory/ReorderPlanningPanel';

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
        return <ABCAnalysisPanel />;

      case 'AGING ALERTS':
        return <AgingAlertsPanel />;

      case 'REORDER PLANNING':
        return <ReorderPlanningPanel />;

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
