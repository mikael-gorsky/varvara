import React from 'react';
import { BarChart3, FileSpreadsheet, TrendingUp, Users, Eye, Upload, Database } from 'lucide-react';

interface AnalyticsModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

interface MainMenuProps {
  onSelectModule: (moduleId: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectModule }) => {
  const modules: AnalyticsModule[] = [
    {
      id: 'ceo-dashboard',
      title: 'CEO Dashboard',
      description: 'Real-time executive overview with KPIs, top clients, and products',
      icon: <Eye className="w-8 h-8" />,
      color: 'from-blue-400 to-indigo-500',
      available: true
    },
    {
      id: 'ozon-dashboard',
      title: 'OZON Data Analysis',
      description: 'Import and analyze OZON marketplace reports and data',
      icon: <FileSpreadsheet className="w-8 h-8" />,
      color: 'from-emerald-400 to-teal-500',
      available: true
    },
    {
      id: 'sales-analytics',
      title: 'Sales Analytics',
      description: 'Detailed sales performance and trend analysis',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-purple-400 to-pink-500',
      available: false
    },
    {
      id: 'client-insights',
      title: 'Client Insights',
      description: 'Customer behavior and segmentation analysis',
      icon: <Users className="w-8 h-8" />,
      color: 'from-orange-400 to-red-500',
      available: false
    },
    {
      id: 'inventory-analytics',
      title: 'Inventory Analytics',
      description: 'Stock levels, turnover rates, and demand forecasting',
      icon: <Database className="w-8 h-8" />,
      color: 'from-cyan-400 to-blue-500',
      available: false
    },
    {
      id: 'financial-reports',
      title: 'Financial Reports',
      description: 'P&L, cash flow, and financial performance metrics',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'from-indigo-400 to-purple-500',
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">OFK Analytics Suite</h1>
            <p className="text-xl text-blue-200 mb-4">Select your analytics module</p>
            <p className="text-blue-300">Company: Офис-Кит</p>
          </div>
        </div>

        {/* Analytics Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => module.available && onSelectModule(module.id)}
              className={`
                backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-6
                transition-all duration-300 cursor-pointer relative overflow-hidden
                ${module.available 
                  ? 'hover:bg-white/15 hover:scale-105 hover:shadow-2xl active:scale-95' 
                  : 'opacity-60 cursor-not-allowed'
                }
              `}
            >
              {!module.available && (
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
                    Coming Soon
                  </span>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  {module.icon}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">
                    {module.description}
                  </p>
                </div>

                {module.available && (
                  <div className="flex items-center text-emerald-400 text-sm font-medium">
                    <span>Launch Module</span>
                    <Upload className="w-4 h-4 ml-2" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-xl p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <p className="text-white font-medium text-sm">Analytics Suite Ready • {modules.filter(m => m.available).length} Modules Available</p>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;