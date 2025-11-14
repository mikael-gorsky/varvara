import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, BarChart3, DollarSign, GitCompare, Database } from 'lucide-react';
import OzonMarketplaceAnalytics from './ozon/OzonMarketplaceAnalytics';
import PricelistAnalytics from './pricelist/PricelistAnalytics';
import PriceComparison from './comparison/PriceComparison';
import { OzonReportManager } from './ozon/OzonReportManager';

type AnalyticsComponent = 'menu' | 'ozon-analytics' | 'pricelist-analytics' | 'price-comparison' | 'report-manager';

interface OzonDashboardProps {
  onBack: () => void;
}

const OzonDashboard: React.FC<OzonDashboardProps> = ({ onBack }) => {
  const [activeComponent, setActiveComponent] = useState<AnalyticsComponent>('menu');

  const handleBackToMenu = () => {
    setActiveComponent('menu');
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'ozon-analytics':
        return <OzonMarketplaceAnalytics onBack={handleBackToMenu} />;
      case 'pricelist-analytics':
        return <PricelistAnalytics onBack={handleBackToMenu} />;
      case 'price-comparison':
        return <PriceComparison onBack={handleBackToMenu} />;
      case 'report-manager':
        return (
          <div className="min-h-screen bg-black p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <button
                onClick={handleBackToMenu}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded text-cyan-300 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 font-mono text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO ANALYTICS</span>
              </button>
              <OzonReportManager />
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-black p-6" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                             radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
          }}>
            <div className="max-w-6xl mx-auto space-y-8">

              {/* Command Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>
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
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg border border-orange-300 relative">
                        <BarChart3 className="w-6 h-6 text-black" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border border-black"></div>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                          ANALYTICS
                        </h1>
                        <p className="text-cyan-400/80 text-sm font-mono">
                          Business Intelligence & Insights
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-300 text-sm font-mono">ANALYTICS ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Tools Grid */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">

                {/* Ozon Analytics */}
                <div
                  onClick={() => setActiveComponent('ozon-analytics')}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 cursor-pointer hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>

                  {/* Module ID */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-800/60 border border-orange-400/30 text-orange-400 text-xs px-2 py-1 rounded font-mono">
                      A01
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-xs font-mono">READY</span>
                    </div>
                  </div>

                  {/* Corner Accents */}
                  <div className="absolute bottom-6 left-6 w-4 h-4 border-l-2 border-b-2 border-orange-400/40"></div>
                  <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-orange-400/40"></div>

                  <div className="flex flex-col items-center text-center space-y-6 mt-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg border border-orange-300 relative">
                      <TrendingUp className="w-10 h-10 text-black" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-black" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-orange-300 mb-3 font-mono tracking-wide">
                        Ozon analytics
                      </h3>
                      <p className="text-orange-400/80 text-sm leading-relaxed font-mono max-w-sm">
                        Analyze categories, suppliers, and market trends across OZON marketplace data.
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-orange-400/30 rounded-lg px-6 py-3 w-full">
                      <div className="flex items-center justify-center text-orange-400 text-sm font-mono font-bold space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>ACCESS ANALYTICS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricelist Analytics */}
                <div
                  onClick={() => setActiveComponent('pricelist-analytics')}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 cursor-pointer hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>

                  {/* Module ID */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-800/60 border border-cyan-400/30 text-cyan-400 text-xs px-2 py-1 rounded font-mono">
                      A02
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-xs font-mono">READY</span>
                    </div>
                  </div>

                  {/* Corner Accents */}
                  <div className="absolute bottom-6 left-6 w-4 h-4 border-l-2 border-b-2 border-cyan-400/40"></div>
                  <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-cyan-400/40"></div>

                  <div className="flex flex-col items-center text-center space-y-6 mt-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg border border-cyan-300 relative">
                      <DollarSign className="w-10 h-10 text-black" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-black" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-cyan-300 mb-3 font-mono tracking-wide">
                        Full Pricelist
                      </h3>
                      <p className="text-cyan-400/80 text-sm leading-relaxed font-mono max-w-sm">
                        View complete product catalog with customer pricing comparison side-by-side.
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg px-6 py-3 w-full">
                      <div className="flex items-center justify-center text-cyan-400 text-sm font-mono font-bold space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>VIEW PRICELIST</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PL vs Ozon Comparison */}
                <div
                  onClick={() => setActiveComponent('price-comparison')}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 cursor-pointer hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>

                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-800/60 border border-violet-400/30 text-violet-400 text-xs px-2 py-1 rounded font-mono">
                      A03
                    </span>
                  </div>

                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-xs font-mono">READY</span>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 w-4 h-4 border-l-2 border-b-2 border-violet-400/40"></div>
                  <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-violet-400/40"></div>

                  <div className="flex flex-col items-center text-center space-y-6 mt-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg border border-violet-300 relative">
                      <GitCompare className="w-10 h-10 text-black" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-black" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-violet-300 mb-3 font-mono tracking-wide">
                        PL vs Ozon
                      </h3>
                      <p className="text-violet-400/80 text-sm leading-relaxed font-mono max-w-sm">
                        Compare pricelist prices with Ozon marketplace for supplier ООО Офис Кит.
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-violet-400/30 rounded-lg px-6 py-3 w-full">
                      <div className="flex items-center justify-center text-violet-400 text-sm font-mono font-bold space-x-2">
                        <GitCompare className="w-4 h-4" />
                        <span>COMPARE PRICES</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Manager */}
                <div
                  onClick={() => setActiveComponent('report-manager')}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 cursor-pointer hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-800/60 border border-emerald-400/30 text-emerald-400 text-xs px-2 py-1 rounded font-mono">
                      A04
                    </span>
                  </div>

                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-xs font-mono">READY</span>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 w-4 h-4 border-l-2 border-b-2 border-emerald-400/40"></div>
                  <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-emerald-400/40"></div>

                  <div className="flex flex-col items-center text-center space-y-6 mt-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg border border-emerald-300 relative">
                      <Database className="w-10 h-10 text-black" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-black" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-emerald-300 mb-3 font-mono tracking-wide">
                        Report Manager
                      </h3>
                      <p className="text-emerald-400/80 text-sm leading-relaxed font-mono max-w-sm">
                        View and manage imported OZON reports with detailed statistics and controls.
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg px-6 py-3 w-full">
                      <div className="flex items-center justify-center text-emerald-400 text-sm font-mono font-bold space-x-2">
                        <Database className="w-4 h-4" />
                        <span>MANAGE REPORTS</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Status Footer */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-orange-400"></div>
                <div className="flex items-center justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
                    <span className="text-cyan-300 font-mono font-bold text-sm">ANALYTICS</span>
                  </div>
                  <div className="text-cyan-400/60 font-mono text-sm">|</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-400/80 font-mono text-sm">AVAILABLE TOOLS:</span>
                    <span className="text-emerald-400 font-mono font-bold">4</span>
                  </div>
                  <div className="text-cyan-400/60 font-mono text-sm">|</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                    <span className="text-emerald-400 font-mono text-sm">STATUS: OPERATIONAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderComponent();
};

export default OzonDashboard;
