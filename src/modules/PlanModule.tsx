import React from 'react';

interface PlanModuleProps {
  activeL2: string | null;
}

const PlanModule: React.FC<PlanModuleProps> = ({ activeL2 }) => {
  const renderContent = () => {
    switch (activeL2) {
      case 'Sales Plans':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              SALES PLANS
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Sales planning coming soon...
            </p>
          </div>
        );
      case 'Budget':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              BUDGET
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Budget planning coming soon...
            </p>
          </div>
        );
      case 'Targets':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              TARGETS
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Target management coming soon...
            </p>
          </div>
        );
      case 'Timeline':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              TIMELINE
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Timeline planning coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
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
