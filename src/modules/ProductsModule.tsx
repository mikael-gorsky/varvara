import React from 'react';

interface ProductsModuleProps {
  activeL2: string | null;
}

const ProductsModule: React.FC<ProductsModuleProps> = ({ activeL2 }) => {
  const renderContent = () => {
    switch (activeL2) {
      case 'Catalog':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              PRODUCT CATALOG
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Product catalog coming soon...
            </p>
          </div>
        );
      case 'Performance':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              PRODUCT PERFORMANCE
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Product performance analytics coming soon...
            </p>
          </div>
        );
      case 'Inventory':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              INVENTORY
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Inventory management coming soon...
            </p>
          </div>
        );
      case 'Categories':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              CATEGORIES
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Category management coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              PRODUCTS
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Select a products category
            </p>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default ProductsModule;
