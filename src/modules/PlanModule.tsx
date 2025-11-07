import React from 'react';

interface PlanModuleProps {
  activeL2: string | null;
}

const PlanModule: React.FC<PlanModuleProps> = ({ activeL2 }) => {
  const renderContent = () => {
    switch (activeL2) {
      case 'SALES PLANS':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              SALES PLANS
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Sales planning coming soon...
            </p>
          </div>
        );
      case 'BUDGET':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              BUDGET
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Budget planning coming soon...
            </p>
          </div>
        );
      case 'TARGETS':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              TARGETS
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Target management coming soon...
            </p>
          </div>
        );
      case 'TIMELINE':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              TIMELINE
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Timeline planning coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              PLAN
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Select a planning category
            </p>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default PlanModule;
