import React, { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  sales: number;
  growth: number;
  industry: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number;
  growth: number;
}

interface KPIData {
  totalRevenue: number;
  topProductsShare: number;
  majorClientsShare: number;
  averageProductMargin: number;
}

const FinanceModule: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const kpiData: KPIData = {
    totalRevenue: 3906946,
    topProductsShare: 94.04,
    majorClientsShare: 80.3,
    averageProductMargin: 39.2
  };

  const topClients: Client[] = [
    { id: '1', name: 'Интернет Решения', sales: 850323, growth: 44, industry: 'E-commerce' },
    { id: '2', name: 'Бердандер', sales: 384399, growth: 42, industry: 'Manufacturing' },
    { id: '3', name: 'Руссблaнкоиздат', sales: 381484, growth: 43, industry: 'Publishing' },
    { id: '4', name: 'Хаскел/Мерлион', sales: 240359, growth: 44, industry: 'Technology' },
    { id: '5', name: 'ВсеИнструменты.ру', sales: 239115, growth: 39, industry: 'E-commerce' },
    { id: '6', name: 'АРВАДА', sales: 192300, growth: 24, industry: 'Retail' },
    { id: '7', name: 'ДНС Ритейл', sales: 164424, growth: 44, industry: 'Electronics' },
  ];

  const topProducts: Product[] = [
    { id: '1', name: 'Уничтожители Office Kit', category: 'Office Equipment', sales: 1840810, growth: 44.28 },
    { id: '2', name: 'Пленка в пакетах', category: 'Packaging', sales: 839463, growth: 35.26 },
    { id: '3', name: 'Ламинаторы пакетные', category: 'Office Equipment', sales: 270118, growth: 39.83 },
    { id: '4', name: 'Переплет (Renz?)', category: 'Binding', sales: 268723, growth: 42.78 },
    { id: '5', name: 'Переплетчики Office Kit', category: 'Office Equipment', sales: 246391, growth: 41.81 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    const percentage = (value / total) * 100;
    return percentage.toFixed(1);
  };

  return (
    <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10 max-w-[1800px] mx-auto">
      <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
        FINANCE
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-6 min-h-[140px] flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            CURRENT PERIOD
          </p>
          <p className="text-kpi-value-mobile md:text-kpi-value-desktop my-2" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(kpiData.totalRevenue)}
          </p>
        </div>

        <div className="p-6 min-h-[140px] flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            REVENUE SHARE
          </p>
          <p className="text-kpi-value-mobile md:text-kpi-value-desktop my-2" style={{ color: 'var(--text-primary)' }}>
            {kpiData.topProductsShare}%
          </p>
        </div>

        <div className="p-6 min-h-[140px] flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            MAJOR CLIENTS
          </p>
          <p className="text-kpi-value-mobile md:text-kpi-value-desktop my-2" style={{ color: 'var(--text-primary)' }}>
            {kpiData.majorClientsShare}%
          </p>
        </div>

        <div className="p-6 min-h-[140px] flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            PROFIT MARGIN
          </p>
          <p className="text-kpi-value-mobile md:text-kpi-value-desktop my-2" style={{ color: 'var(--text-primary)' }}>
            {kpiData.averageProductMargin}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-subsection uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>
            TOP CLIENTS
          </h3>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div
                key={client.id}
                className="p-4 border-l-2 transition-colors duration-fast hover:bg-[var(--surface-1)]"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: '#E91E63'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-label uppercase flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body mb-1" style={{ color: 'var(--text-primary)' }}>
                        {client.name}
                      </p>
                      <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                        {client.industry}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-body" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(client.sales)}
                  </span>
                  <span className="text-label uppercase" style={{ color: '#76FF03' }}>
                    +{client.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-subsection uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>
            TOP PRODUCTS
          </h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="p-4 border-l-2 transition-colors duration-fast hover:bg-[var(--surface-1)]"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: '#E91E63'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-label uppercase flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body mb-1" style={{ color: 'var(--text-primary)' }}>
                        {product.name}
                      </p>
                      <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                        {product.category}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-body" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(product.sales)}
                  </span>
                  <span className="text-label uppercase" style={{ color: '#76FF03' }}>
                    +{product.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceModule;
