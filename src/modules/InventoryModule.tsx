import React from 'react';

const InventoryModule: React.FC = () => {
  return (
    <div style={{ padding: 'var(--spacing-3)' }}>
      <h2
        className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8"
        style={{ color: 'var(--accent)' }}
      >
        INVENTORY
      </h2>
      <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
        Inventory management coming soon...
      </p>
    </div>
  );
};

export default InventoryModule;
