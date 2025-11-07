import React from 'react';

interface ProductsModuleProps {
  activeL2: string | null;
}

const ProductsModule: React.FC<ProductsModuleProps> = ({ activeL2 }) => {
  const renderContent = () => {
    switch (activeL2) {
      case 'Catalog':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              PRODUCT CATALOG
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Product catalog coming soon...
            </p>
          </div>
        );
      case 'Performance':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              PRODUCT PERFORMANCE
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Product performance analytics coming soon...
            </p>
          </div>
        );
      case 'Inventory':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              INVENTORY
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Inventory management coming soon...
            </p>
          </div>
        );
      case 'Categories':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              CATEGORIES
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Category management coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
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
