import React, { useState } from 'react';
import { ArrowLeft, FileSpreadsheet, BarChart3, Database, Upload, Activity, Zap } from 'lucide-react';
import OzonDataImport from './ozon/OzonDataImport';
import OzonProductAnalysis from './ozon/OzonProductAnalysis';

type OzonComponent = 'menu' | 'data-import' | 'product-analysis';

interface OzonDashboardProps {
  onBack: () => void;
}

const OzonDashboard: React.FC<OzonDashboardProps> = ({ onBack }) => {
  const [activeComponent, setActiveComponent] = useState<OzonComponent>('menu');

  const handleSelectComponent = (componentId: string) => {
    setActiveComponent(componentId as OzonComponent);
  };

  const handleBackToMenu = () => {
    setActiveComponent('menu');
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'data-import':
        return <OzonDataImport onBack={handleBackToMenu} />;
      case 'product-analysis':
        return <OzonProductAnalysis onBack={handleBackToMenu} />;
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
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300 relative">
                        <FileSpreadsheet className="w-6 h-6 text-black" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border border-black"></div>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                          OZON TRADE NETWORKS
                        </h1>
                        <p className="text-cyan-400/80 text-sm font-mono">
                          Marketplace Intelligence Division
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-300 text-sm font-mono">TRADE SYSTEMS ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Modules Grid */}
              <div className="grid gap-8 md:grid-cols-2">
                
                {/* Data Import Module */}
                <div
                  onClick={() => handleSelectComponent('data-import')}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 cursor-pointer hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                  
                  {/* Module ID */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-800/60 border border-emerald-400/30 text-emerald-400 text-xs px-2 py-1 rounded font-mono">
                      TN01
                    </span>
                  </div>
                  
                  {/* Corner Accents */}
                  <div className="absolute top-6 left-6 w-4 h-4 border-l-2 border-t-2 border-emerald-400/40"></div>
                  <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-emerald-400/40"></div>
                  
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg border border-emerald-300 relative">
                      <Upload className="w-10 h-10 text-black" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <Database className="w-3 h-3 text-black" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-300 mb-3 font-mono tracking-wide">
                        DATA STREAM INTEGRATION
                      </h3>
                      <p className="text-emerald-400/80 text-sm leading-relaxed font-mono max-w-sm">
                        Upload and process marketplace intelligence data from OZON trading networks directly into galactic database core systems.
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg px-6 py-3 w-full">
                      <div className="flex items-center justify-center text-emerald-400 text-sm font-mono font-bold space-x-2">
                        <Activity className="w-4 h-4" />
                        <span>INITIATE PROTOCOL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Analysis Module */}
                <div
                  onClick={() => handleSelectComponent('product-analysis')}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 cursor-pointer hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                  
                  {/* Module ID */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-800/60 border border-purple-400/30 text-purple-400 text-xs px-2 py-1 rounded font-mono">
                      TN02
                    </span>
                  </div>
                  
                  {/* Corner Accents */}
                  <div className="absolute top-6 left-6 w-4 h-4 border-l-2 border-t-2 border-purple-400/40"></div>
                  <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-purple-400/40"></div>
                  
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg border border-purple-300 relative">
                      <BarChart3 className="w-10 h-10 text-black" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-black" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-purple-300 mb-3 font-mono tracking-wide">
                        AI PATTERN RECOGNITION
                      </h3>
                      <p className="text-purple-400/80 text-sm leading-relaxed font-mono max-w-sm">
                        Deploy advanced artificial intelligence algorithms to analyze and group similar products from database core intelligence systems.
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-purple-400/30 rounded-lg px-6 py-3 w-full">
                      <div className="flex items-center justify-center text-purple-400 text-sm font-mono font-bold space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>DEPLOY AI SYSTEMS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-emerald-400"></div>
                <div className="flex items-center justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
                    <span className="text-cyan-300 font-mono font-bold text-sm">OZON MARKETPLACE ANALYTICS</span>
                  </div>
                  <div className="text-cyan-400/60 font-mono text-sm">|</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-400/80 font-mono text-sm">OPERATIONAL MODULES:</span>
                    <span className="text-emerald-400 font-mono font-bold">2/2</span>
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