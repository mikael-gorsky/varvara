import React from 'react';

const VarvaraHeader: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '16px',
        paddingBottom: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
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
        <span
          style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '14px',
            fontStyle: 'italic',
            fontWeight: 300
          }}
        >
          ver 071125
        </span>
      </div>
    </div>
  );
};

export default VarvaraHeader;
