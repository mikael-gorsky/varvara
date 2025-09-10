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
      title: 'Executive Dashboard',
      description: 'Real-time business overview with key performance indicators and strategic metrics',
      icon: <Eye className="w-8 h-8" />,
      color: 'from-blue-400 to-indigo-500',
      available: true
    },
    {
      id: 'ozon-dashboard',
      title: 'OZON Marketplace Analytics',
      description: 'Import and analyze marketplace data from OZON e-commerce platform',
      icon: <FileSpreadsheet className="w-8 h-8" />,
      color: 'from-emerald-400 to-teal-500',
      available: true
    },
    {
      id: 'sales-analytics',
      title: 'Sales Analytics',
      description: 'Advanced sales performance analysis and revenue optimization insights',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-purple-400 to-pink-500',
      available: false
    },
    {
      id: 'client-insights',
      title: 'Customer Intelligence',
      description: 'Customer behavior analysis and strategic account management insights',
      icon: <Users className="w-8 h-8" />,
      color: 'from-orange-400 to-red-500',
      available: false
    },
    {
      id: 'inventory-analytics',
      title: 'Inventory Management',
      description: 'Strategic inventory optimization, stock analysis, and demand forecasting',
      icon: <Database className="w-8 h-8" />,
      color: 'from-cyan-400 to-blue-500',
      available: false
    },
    {
      id: 'financial-reports',
      title: 'Financial Reports',
      description: 'Comprehensive financial analysis, cash flow optimization, and performance metrics',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'from-indigo-400 to-purple-500',
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%), 
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Imperial Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-mono">SYSTEMS ONLINE</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-cyan-300 relative">
              <BarChart3 className="w-10 h-10 text-black" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-black animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-bold text-cyan-300 mb-3 font-mono tracking-wider">
              ChatERP
            </h1>
            <p className="text-xl text-cyan-400/80 mb-4 font-mono">
              Business Intelligence Platform
            </p>
            <div className="flex items-center justify-center space-x-2 text-teal-300 font-mono text-sm">
              <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
              <span>ORGANIZATION:</span>
              <span className="text-teal-400 font-bold">ОФИС-КИТ</span>
              <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Analytics Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <div
              key={module.id}
              onClick={() => module.available && onSelectModule(module.id)}
              className={`
                bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6
                transition-all duration-300 cursor-pointer relative overflow-hidden
                ${module.available 
                  ? 'hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl active:scale-95' 
                  : 'opacity-60 cursor-not-allowed border-gray-600/30'
                }
              `}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${module.color}`}></div>
              
              {/* Module Status */}
              <div className="absolute top-4 right-4">
                {module.available ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-xs font-mono">READY</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 text-xs font-mono">DEVELOPING</span>
                  </div>
                )}
              </div>
              
              {/* Module ID Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-gray-800/60 border border-cyan-400/30 text-cyan-400 text-xs px-2 py-1 rounded font-mono">
                  M{String(index + 1).padStart(2, '0')}
                </span>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-6 mt-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center shadow-lg border border-white/20 relative`}>
                  {module.icon}
                  {module.available && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-cyan-300 mb-3 font-mono tracking-wide">
                    {module.title}
                  </h3>
                  <p className="text-cyan-400/80 text-sm leading-relaxed font-mono">
                    {module.description}
                  </p>
                </div>

                {module.available && (
                  <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-2">
                    <div className="flex items-center text-emerald-400 text-sm font-mono font-bold">
                      <span>LAUNCH MODULE</span>
                      <Upload className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                )}
              </div>

              {/* Corner Accents */}
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-400/30"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-400/30"></div>
            </div>
          ))}
        </div>

        {/* System Status Panel */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-300 font-mono font-bold text-sm">ANALYTICS PLATFORM OPERATIONAL</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-3">
              <span className="text-cyan-400/80 font-mono text-sm">MODULES READY:</span>
              <span className="text-cyan-300 font-mono font-bold">{modules.filter(m => m.available).length}/{modules.length}</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-400 font-mono text-sm">ORGANIZATION: ОФИС-КИТ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;