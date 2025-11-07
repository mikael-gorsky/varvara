import React from 'react';

const DashboardModule: React.FC = () => {
  return (
    <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
      <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
        DASHBOARD
      </h2>
      <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
        Dashboard overview content coming soon...
      </p>
    </div>
  );
};

export default DashboardModule;
