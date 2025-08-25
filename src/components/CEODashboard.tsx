import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, DollarSign, BarChart3, Activity, Eye, ChevronRight, ArrowLeft } from 'lucide-react';

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

interface CEODashboardProps {
  onBack: () => void;
}

const CEODashboard: React.FC<CEODashboardProps> = ({ onBack }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Demo data - will be replaced with real data later
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-6">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-1">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">CEO Dashboard</h1>
                  <p className="text-blue-200">Real-time Analytics</p>
                  <p className="text-blue-300 text-sm">Company: Офис-Кит</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl font-bold text-white">
                  {currentTime.toLocaleTimeString()}
                </p>
                <p className="text-blue-200">
                  {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-medium text-blue-200 mb-1">Total Revenue</h3>
            <p className="text-lg font-bold text-white">{formatCurrency(kpiData.totalRevenue)}</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                <Package className="w-4 h-4 text-white" />
              </div>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-medium text-blue-200 mb-1">Top 7 Products</h3>
            <p className="text-lg font-bold text-white">{kpiData.topProductsShare}%</p>
            <p className="text-xs text-blue-300">of Revenue</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-xs font-medium text-blue-200 mb-1">Major 14 Clients</h3>
            <p className="text-lg font-bold text-white">{kpiData.majorClientsShare}%</p>
            <p className="text-xs text-blue-300">of Revenue</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-xs font-medium text-blue-200 mb-1">Avg Margin</h3>
            <p className="text-lg font-bold text-white">{kpiData.averageProductMargin}%</p>
            <p className="text-xs text-blue-300">Products</p>
          </div>
        </div>

        {/* Top Clients & Products */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          
          {/* Top Clients */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Major Clients</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div
                  key={client.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-semibold text-white text-sm leading-tight">
                        {client.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-blue-200">{client.industry}</span>
                        <span className="text-blue-400">•</span>
                        <span className="text-blue-300">{formatPercentage(client.sales, kpiData.totalRevenue)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-sm">
                          {formatCurrency(client.sales)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-emerald-400">
                            +{client.growth}%
                          </span>
                          <ChevronRight className="w-3 h-3 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Top Products</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-semibold text-white text-sm leading-tight">
                        {product.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-blue-200">{product.category}</span>
                        <span className="text-blue-400">•</span>
                        <span className="text-blue-300">{formatPercentage(product.sales, kpiData.totalRevenue)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-sm">
                          {formatCurrency(product.sales)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-emerald-400">
                            +{product.growth.toFixed(1)}%
                          </span>
                          <ChevronRight className="w-3 h-3 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Status */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <p className="text-white font-medium text-sm text-center">CEO Dashboard Active • Real-time Data</p>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;