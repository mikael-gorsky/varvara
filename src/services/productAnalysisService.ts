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
                    EXECUTIVE DASHBOARD
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    Real-time Business Overview
                  </p>
                  <p className="text-teal-300 text-sm font-mono">ORGANIZATION: ОФИС-КИТ</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              </div>
            <p className="text-lg font-bold text-emerald-300 font-mono">{formatCurrency(kpiData.totalRevenue)}</p>
  )
}