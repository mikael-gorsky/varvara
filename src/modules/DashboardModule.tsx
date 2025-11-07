import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, DollarSign, BarChart3, Activity, ChevronRight } from 'lucide-react';

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
    { id: '8', name: 'ОнЛайн Трейд', sales: 164407, growth: 38, industry: 'E-commerce' },
    { id: '9', name: 'Компсервис', sales: 134523, growth: 40, industry: 'IT Services' },
    { id: '10', name: 'АЛЬФАПРИНТ МЕНЕДЖМЕНТ', sales: 130450, growth: 44, industry: 'Printing' },
    { id: '11', name: 'Мишин Александр Николаевич ИП', sales: 76356, growth: 44, industry: 'Individual' },
    { id: '12', name: 'Сибирский успех', sales: 66374, growth: 44, industry: 'Regional' },
    { id: '13', name: 'Павлов Николай Александрович ИП', sales: 59917, growth: 43, industry: 'Individual' },
    { id: '14', name: 'Триовист', sales: 53876, growth: 33, industry: 'Consulting' }
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
    <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase" style={{ color: '#E91E63' }}>
          DASHBOARD
        </h2>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
            {currentTime.toLocaleTimeString()}
          </p>
          <p style={{ color: '#666666' }} className="text-sm">
            {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E91E63' }}>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-4 h-4" style={{ color: '#4ADE80' }} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>{formatCurrency(kpiData.totalRevenue)}</p>
          <p style={{ color: '#666666' }} className="text-sm">Total Revenue</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E91E63' }}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <BarChart3 className="w-4 h-4" style={{ color: '#4ADE80' }} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>{kpiData.topProductsShare}%</p>
          <p style={{ color: '#666666' }} className="text-sm">Top Products</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E91E63' }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-4 h-4" style={{ color: '#4ADE80' }} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>{kpiData.majorClientsShare}%</p>
          <p style={{ color: '#666666' }} className="text-sm">Major Clients</p>
        </div>

        <div className="p-6 rounded-lg" style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E91E63' }}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <TrendingUp className="w-4 h-4" style={{ color: '#4ADE80' }} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>{kpiData.averageProductMargin}%</p>
          <p style={{ color: '#666666' }} className="text-sm">Profit Margin</p>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E91E63' }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase" style={{ color: '#FFFFFF' }}>Top Clients</h3>
              <p style={{ color: '#666666' }} className="text-sm">Revenue by Customer</p>
            </div>
          </div>

          <div className="space-y-3">
            {topClients.slice(0, 7).map((client, index) => (
              <div
                key={client.id}
                className="p-4 rounded-lg"
                style={{ backgroundColor: '#000000', border: '1px solid #1A1A1A' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-white font-bold text-xs" style={{ backgroundColor: '#E91E63' }}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-2" style={{ color: '#FFFFFF' }}>
                      {client.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="px-2 py-1 rounded" style={{ backgroundColor: '#1A1A1A', color: '#888888' }}>
                        {client.industry}
                      </span>
                      <span style={{ color: '#666666' }}>•</span>
                      <span style={{ color: '#AAAAAA' }}>{formatPercentage(client.sales, kpiData.totalRevenue)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm" style={{ color: '#FFFFFF' }}>
                        {formatCurrency(client.sales)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#0F3A2E', color: '#4ADE80' }}>
                          +{client.growth}%
                        </span>
                        <ChevronRight className="w-3 h-3" style={{ color: '#666666' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#0A0A0A', border: '1px solid #222222' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E91E63' }}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase" style={{ color: '#FFFFFF' }}>Top Products</h3>
              <p style={{ color: '#666666' }} className="text-sm">Best Sellers</p>
            </div>
          </div>

          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="p-4 rounded-lg"
                style={{ backgroundColor: '#000000', border: '1px solid #1A1A1A' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-white font-bold text-xs" style={{ backgroundColor: '#E91E63' }}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-2" style={{ color: '#FFFFFF' }}>
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className="px-2 py-1 rounded" style={{ backgroundColor: '#1A1A1A', color: '#888888' }}>
                        {product.category}
                      </span>
                      <span style={{ color: '#666666' }}>•</span>
                      <span style={{ color: '#AAAAAA' }}>{formatPercentage(product.sales, kpiData.totalRevenue)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm" style={{ color: '#FFFFFF' }}>
                        {formatCurrency(product.sales)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#0F3A2E', color: '#4ADE80' }}>
                          +{product.growth.toFixed(1)}%
                        </span>
                        <ChevronRight className="w-3 h-3" style={{ color: '#666666' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;
