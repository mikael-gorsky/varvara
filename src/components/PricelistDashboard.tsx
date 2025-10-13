import React, { useState } from 'react';
import { ArrowLeft, FileSpreadsheet, Database } from 'lucide-react';
import PricelistImport from './pricelist/PricelistImport';

interface PricelistDashboardProps {
  onBack: () => void;
}

const PricelistDashboard: React.FC<PricelistDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'import' | 'view'>('import');

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-gray-800 to-gray-700 border border-cyan-400/30 text-cyan-300 p-3 rounded-lg hover:border-cyan-400/60 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-cyan-300 font-mono tracking-wider">
                  PRICELIST MANAGEMENT
                </h1>
                <p className="text-cyan-400/80 font-mono text-sm mt-1">
                  Import and manage product pricing data
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-mono">SYSTEM ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-mono font-bold transition-all duration-200 ${
                activeTab === 'import'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black'
                  : 'bg-gray-800/50 text-cyan-400 hover:bg-gray-800'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>IMPORT DATA</span>
            </button>

            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-mono font-bold transition-all duration-200 ${
                activeTab === 'view'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black'
                  : 'bg-gray-800/50 text-cyan-400 hover:bg-gray-800'
              }`}
            >
              <Database className="w-5 h-5" />
              <span>VIEW DATA</span>
            </button>
          </div>
        </div>

        {activeTab === 'import' && <PricelistImport />}

        {activeTab === 'view' && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-cyan-300 font-mono mb-2">DATA VIEWER</h3>
              <p className="text-cyan-400/60 font-mono text-sm">
                View imported pricelist data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricelistDashboard;
