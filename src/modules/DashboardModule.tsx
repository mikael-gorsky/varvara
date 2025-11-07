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
  units: number;
  growth: number;
}

interface KPIData {
  totalRevenue: number;
  topProductsShare: number;
  majorClientsShare: number;
  averageProductMargin: number;
}

const DashboardModule: React.FC = () => {
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
    { id: '1', name: 'Уничтожители Office Kit', category: 'Office Equipment', sales: 1840810, units: 0, growth: 44.28 },
    { id: '2', name: 'Пленка в пакетах', category: 'Packaging', sales: 839463, units: 0, growth: 35.26 },
    { id: '3', name: 'Ламинаторы пакетные', category: 'Office Equipment', sales: 270118, units: 0, growth: 39.83 },
    { id: '4', name: 'Переплет (Renz?)', category: 'Binding', sales: 268723, units: 0, growth: 42.78 },
    { id: '5', name: 'Переплетчики Office Kit', category: 'Office Equipment', sales: 246391, units: 0, growth: 41.81 },
    { id: '6', name: 'Уничтожители HSM офисное', category: 'Office Equipment', sales: 118939, units: 0, growth: 39.21 },
    { id: '7', name: 'Пружины', category: 'Binding', sales: 89487, units: 0, growth: 31.01 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    const percentage = (value / total) * 100;
    return percentage.toFixed(1).replace('.', ',');
  };

  return (
    <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '24px', paddingBottom: '32px' }}>
      <div style={{ marginBottom: '48px' }}>
        <h2
          className="text-page-title-mobile md:text-page-title-desktop uppercase"
          style={{
            color: 'var(--accent)',
            fontWeight: 400,
            letterSpacing: '0.03em',
            marginBottom: '0'
          }}
        >
          DASHBOARD
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '48px'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '24px',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <p
            className="text-label uppercase"
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.05em',
              marginBottom: '16px'
            }}
          >
            TOTAL REVENUE
          </p>
          <p
            className="text-kpi-value-mobile md:text-kpi-value-desktop"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              marginBottom: '8px'
            }}
          >
            {formatCurrency(kpiData.totalRevenue)}
          </p>
          <p style={{ fontSize: '20px', color: '#76FF03', marginBottom: '4px' }}>+44%</p>
          <p className="text-label-lg" style={{ color: 'var(--text-tertiary)' }}>vs last period</p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '24px',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <p
            className="text-label uppercase"
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.05em',
              marginBottom: '16px'
            }}
          >
            TOP PRODUCTS SHARE
          </p>
          <p
            className="text-kpi-value-mobile md:text-kpi-value-desktop"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              marginBottom: '8px'
            }}
          >
            {kpiData.topProductsShare.toFixed(1).replace('.', ',')}%
          </p>
          <p style={{ fontSize: '20px', color: '#76FF03', marginBottom: '4px' }}>+2.1%</p>
          <p className="text-label-lg" style={{ color: 'var(--text-tertiary)' }}>vs last period</p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '24px',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <p
            className="text-label uppercase"
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.05em',
              marginBottom: '16px'
            }}
          >
            MAJOR CLIENTS SHARE
          </p>
          <p
            className="text-kpi-value-mobile md:text-kpi-value-desktop"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              marginBottom: '8px'
            }}
          >
            {kpiData.majorClientsShare.toFixed(1).replace('.', ',')}%
          </p>
          <p style={{ fontSize: '20px', color: '#76FF03', marginBottom: '4px' }}>+5.3%</p>
          <p className="text-label-lg" style={{ color: 'var(--text-tertiary)' }}>vs last period</p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '24px',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <p
            className="text-label uppercase"
            style={{
              color: 'var(--text-tertiary)',
              letterSpacing: '0.05em',
              marginBottom: '16px'
            }}
          >
            AVG PRODUCT MARGIN
          </p>
          <p
            className="text-kpi-value-mobile md:text-kpi-value-desktop"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              marginBottom: '8px'
            }}
          >
            {kpiData.averageProductMargin.toFixed(1).replace('.', ',')}%
          </p>
          <p style={{ fontSize: '20px', color: '#76FF03', marginBottom: '4px' }}>+1.2%</p>
          <p className="text-label-lg" style={{ color: 'var(--text-tertiary)' }}>vs last period</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', maxWidth: '1800px' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px' }}>
          <h3
            className="text-subsection uppercase"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 400,
              letterSpacing: '0.03em',
              marginBottom: '24px'
            }}
          >
            TOP CLIENTS
          </h3>

          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--divider-standard)'
              }}
            >
              <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>CLIENT</p>
              <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)', textAlign: 'right' }}>REVENUE</p>
              <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)', textAlign: 'right' }}>GROWTH</p>
            </div>

            {topClients.map((client) => (
              <div
                key={client.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '20px',
                  padding: '20px 0',
                  borderBottom: '1px solid var(--divider-standard)',
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div>
                  <p className="text-body" style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {client.name}
                  </p>
                  <p className="text-micro" style={{ color: 'var(--text-tertiary)' }}>
                    {client.industry}
                  </p>
                </div>
                <p className="text-body" style={{ color: 'var(--text-primary)', textAlign: 'right' }}>
                  {formatCurrency(client.sales)}
                </p>
                <p style={{ fontSize: '16px', color: '#76FF03', textAlign: 'right' }}>
                  +{client.growth}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px' }}>
          <h3
            className="text-subsection uppercase"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 400,
              letterSpacing: '0.03em',
              marginBottom: '24px'
            }}
          >
            TOP PRODUCTS
          </h3>

          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--divider-standard)'
              }}
            >
              <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>PRODUCT</p>
              <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)', textAlign: 'right' }}>REVENUE</p>
              <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)', textAlign: 'right' }}>GROWTH</p>
            </div>

            {topProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '20px',
                  padding: '20px 0',
                  borderBottom: '1px solid var(--divider-standard)',
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div>
                  <p className="text-body" style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {product.name}
                  </p>
                  <p className="text-micro" style={{ color: 'var(--text-tertiary)' }}>
                    {product.category}
                  </p>
                </div>
                <p className="text-body" style={{ color: 'var(--text-primary)', textAlign: 'right' }}>
                  {formatCurrency(product.sales)}
                </p>
                <p style={{ fontSize: '16px', color: '#76FF03', textAlign: 'right' }}>
                  +{product.growth.toFixed(1).replace('.', ',')}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;
