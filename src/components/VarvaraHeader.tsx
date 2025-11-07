import React from 'react';

const VarvaraHeader: React.FC = () => {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'var(--bg-primary)',
        paddingTop: '16px',
        paddingBottom: '24px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}
    >
      <h1
        className="text-app-name-mobile-sm sm:text-app-name-mobile md:text-app-name-tablet lg:text-app-name-desktop xl:text-app-name-desktop-lg 2xl:text-app-name-desktop-xl uppercase"
        style={{
          color: 'var(--text-primary)',
          fontWeight: 300,
          letterSpacing: '0.04em',
          lineHeight: 1.1
        }}
      >
        VARVARA
      </h1>
    </div>
  );
};

export default VarvaraHeader;
