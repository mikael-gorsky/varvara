import React from 'react';

const VarvaraHeader: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-5 md:px-8 lg:px-12 pt-4 md:pt-5 lg:pt-6 pb-6 md:pb-7 lg:pb-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h1 className="text-app-name-mobile-sm sm:text-app-name-mobile md:text-app-name-tablet lg:text-app-name-desktop xl:text-app-name-desktop-lg 2xl:text-app-name-desktop-xl uppercase tracking-[0.04em]" style={{ color: 'var(--text-primary)' }}>
        VARVARA
      </h1>
    </div>
  );
};

export default VarvaraHeader;
