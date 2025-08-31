import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, DollarSign, BarChart3, Activity, Eye, ChevronRight, ArrowLeft, Crown, Zap } from 'lucide-react';

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

export interface OzonStats {
  totalProducts: number;
  totalRevenue: number;
  averagePrice: number;
  topCategories: Array<{
    category: string;
    productCount: number;
    revenue: number;
  }>;
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
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%), 
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Imperial Command Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded text-cyan-300 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 font-mono text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO COMMAND</span>
              </button>
              <div className="h-6 border-l border-cyan-400/30"></div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300 relative">
                  <Crown className="w-6 h-6 text-black" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-black"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    IMPERIAL COMMAND CENTER
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    Real-time Strategic Overview
                  </p>
                  <p className="text-teal-300 text-sm font-mono">EMPIRE: ОФИС-КИТ</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-2">
                <p className="text-xl font-bold text-cyan-300 font-mono">
                  {currentTime.toLocaleTimeString()}
                </p>
                <p className="text-cyan-400/80 font-mono text-sm">
                  {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Resource Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                <DollarSign className="w-4 h-4 text-black" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Imperial Treasury</h3>
            <p className="text-lg font-bold text-emerald-300 font-mono">{formatCurrency(kpiData.totalRevenue)}</p>
            <p className="text-emerald-400/60 text-xs font-mono">Credits Generated</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                <Package className="w-4 h-4 text-black" />
              </div>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Top 7 Resources</h3>
            <p className="text-lg font-bold text-emerald-300 font-mono">{kpiData.topProductsShare}%</p>
            <p className="text-emerald-400/60 text-xs font-mono">Revenue Share</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg border border-purple-300">
                <Users className="w-4 h-4 text-black" />
              </div>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Major 14 Factions</h3>
            <p className="text-lg font-bold text-purple-300 font-mono">{kpiData.majorClientsShare}%</p>
            <p className="text-purple-400/60 text-xs font-mono">Trade Influence</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                <Activity className="w-4 h-4 text-black" />
              </div>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Avg Efficiency</h3>
            <p className="text-lg font-bold text-blue-300 font-mono">{kpiData.averageProductMargin}%</p>
            <p className="text-blue-400/60 text-xs font-mono">Resource Yield</p>
          </div>
        </div>

        {/* Strategic Intelligence Panels */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          
          {/* Major Trade Factions */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-blue-400/30 text-blue-400 text-xs px-2 py-1 rounded font-mono">
                TRADE-01
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                <Users className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">MAJOR TRADE FACTIONS</h2>
                <p className="text-cyan-400/80 text-sm font-mono">Strategic Partnership Analysis</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div
                  key={client.id}
                  className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-4 hover:border-cyan-400/40 hover:bg-gray-800/60 transition-all duration-200 relative"
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-500 rounded-l-lg"></div>
                  
                  <div className="flex items-start gap-3 ml-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-black font-bold text-xs shadow-lg flex-shrink-0 border border-indigo-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-semibold text-cyan-300 text-sm leading-tight font-mono">
                        {client.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-gray-700/50 border border-cyan-400/30 text-cyan-400 px-2 py-1 rounded font-mono">
                          {client.industry}
                        </span>
                        <span className="text-cyan-400/60 font-mono">•</span>
                        <span className="text-cyan-300 font-mono">{formatPercentage(client.sales, kpiData.totalRevenue)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-cyan-300 text-sm font-mono">
                          {formatCurrency(client.sales)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-1 rounded">
                            +{client.growth}%
                          </span>
                          <ChevronRight className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-emerald-400/30 text-emerald-400 text-xs px-2 py-1 rounded font-mono">
                RES-01
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                <Package className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">TOP PRODUCTS</h2>
                <p className="text-cyan-400/80 text-sm font-mono">Top Performing Products</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-4 hover:border-cyan-400/40 hover:bg-gray-800/60 transition-all duration-200 relative"
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-lg"></div>
                  
                  <div className="flex items-start gap-3 ml-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-black font-bold text-xs shadow-lg flex-shrink-0 border border-emerald-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-semibold text-cyan-300 text-sm leading-tight font-mono">
                        {product.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-gray-700/50 border border-cyan-400/30 text-cyan-400 px-2 py-1 rounded font-mono">
                          {product.category}
                        </span>
                        <span className="text-cyan-400/60 font-mono">•</span>
                        <span className="text-cyan-300 font-mono">{formatPercentage(product.sales, kpiData.totalRevenue)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-cyan-300 text-sm font-mono">
                          {formatCurrency(product.sales)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-1 rounded">
                            +{product.growth.toFixed(1)}%
                          </span>
                          <ChevronRight className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Command Status */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-300 font-mono font-bold text-sm">EXECUTIVE DASHBOARD ACTIVE</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400/80 font-mono text-sm">REAL-TIME ANALYTICS</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-400 font-mono text-sm">ORGANIZATION: ОФИС-КИТ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;