import React, { useState } from 'react';
import { ArrowLeft, Package, Upload, Database, Zap, FileSpreadsheet, DollarSign } from 'lucide-react';
import OzonDashboard from './OzonDashboard';
import PricelistDashboard from './PricelistDashboard';

interface ServiceModuleProps {
  onBack: () => void;
}

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

interface ImportSource {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

const ServiceModule: React.FC<ServiceModuleProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImportSource, setSelectedImportSource] = useState<string | null>(null);

  const categories: ServiceCategory[] = [
    {
      id: 'imports',
      title: 'Import Services',
      description: 'Import and process data from various sources and marketplaces',
      icon: <Upload className="w-8 h-8" />,
      color: 'from-emerald-400 to-teal-500',
      available: true
    },
    {
      id: 'exports',
      title: 'Export Services',
      description: 'Export data to various formats and external systems',
      icon: <Database className="w-8 h-8" />,
      color: 'from-blue-400 to-cyan-500',
      available: false
    },
    {
      id: 'integrations',
      title: 'Integration Services',
      description: 'Connect and sync with third-party services and APIs',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-orange-400 to-yellow-500',
      available: false
    },
    {
      id: 'automation',
      title: 'Automation Services',
      description: 'Automated workflows and scheduled task management',
      icon: <Package className="w-8 h-8" />,
      color: 'from-purple-400 to-pink-500',
      available: false
    }
  ];

  const importSources: ImportSource[] = [
    {
      id: 'ozon',
      name: 'OZON Marketplace',
      description: 'Import product and sales data from OZON e-commerce platform',
      icon: <FileSpreadsheet className="w-8 h-8" />,
      color: 'from-emerald-400 to-teal-500',
      available: true
    },
    {
      id: 'pricelist',
      name: 'Product Pricelist',
      description: 'Import Excel pricelists with multi-supplier pricing data',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'from-cyan-400 to-blue-500',
      available: true
    }
  ];

  if (selectedImportSource === 'ozon') {
    return <OzonDashboard onBack={() => setSelectedImportSource(null)} />;
  }

  if (selectedImportSource === 'pricelist') {
    return <PricelistDashboard onBack={() => setSelectedImportSource(null)} />;
  }

  if (selectedCategory === 'imports') {
    return (
      <div className="min-h-screen bg-black p-6" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                         radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
      }}>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="bg-gradient-to-r from-gray-800 to-gray-700 border border-cyan-400/30 text-cyan-300 p-3 rounded-lg hover:border-cyan-400/60 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-cyan-300 font-mono tracking-wider">
                    IMPORT SERVICES
                  </h1>
                  <p className="text-cyan-400/80 font-mono text-sm mt-1">
                    Select an import source to begin data import
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-mono">SERVICE ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Import Sources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {importSources.map((source, index) => (
              <div
                key={source.id}
                onClick={() => source.available && setSelectedImportSource(source.id)}
                className={`
                  bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6
                  transition-all duration-300 cursor-pointer relative overflow-hidden
                  ${source.available
                    ? 'hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl active:scale-95'
                    : 'opacity-60 cursor-not-allowed border-gray-600/30'
                  }
                `}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${source.color}`}></div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {source.available ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-xs font-mono">READY</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-yellow-400 text-xs font-mono">SOON</span>
                    </div>
                  )}
                </div>

                {/* Source ID */}
                <div className="absolute top-4 left-4">
                  <span className="bg-gray-800/60 border border-cyan-400/30 text-cyan-400 text-xs px-2 py-1 rounded font-mono">
                    I{String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center space-y-4 mt-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${source.color} rounded-xl flex items-center justify-center shadow-lg border border-white/20 relative`}>
                    {source.icon}
                    {source.available && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-cyan-300 mb-2 font-mono tracking-wide">
                      {source.name}
                    </h3>
                    <p className="text-cyan-400/80 text-sm leading-relaxed font-mono">
                      {source.description}
                    </p>
                  </div>

                  {source.available && (
                    <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg px-3 py-1.5">
                      <div className="flex items-center text-emerald-400 text-xs font-mono font-bold">
                        <span>LAUNCH</span>
                        <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
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

          {/* Info Panel */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Upload className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-cyan-300 font-mono">IMPORT SOURCES</h3>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    {importSources.filter(s => s.available).length} of {importSources.length} import sources available
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 font-mono text-sm font-bold">IMPORT SERVICE READY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>

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
                  SERVICE MODULE
                </h1>
                <p className="text-cyan-400/80 font-mono text-sm mt-1">
                  Manage data processing and integration services
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-mono">MODULE ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Service Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              onClick={() => category.available && setSelectedCategory(category.id)}
              className={`
                bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8
                transition-all duration-300 cursor-pointer relative overflow-hidden
                ${category.available
                  ? 'hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl active:scale-95'
                  : 'opacity-60 cursor-not-allowed border-gray-600/30'
                }
              `}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${category.color}`}></div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {category.available ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-xs font-mono">AVAILABLE</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 text-xs font-mono">COMING SOON</span>
                  </div>
                )}
              </div>

              {/* Category ID */}
              <div className="absolute top-4 left-4">
                <span className="bg-gray-800/60 border border-cyan-400/30 text-cyan-400 text-xs px-2 py-1 rounded font-mono">
                  S{String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-start space-x-6 mt-8">
                <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0`}>
                  {category.icon}
                  {category.available && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-3 font-mono tracking-wide">
                    {category.title}
                  </h3>
                  <p className="text-cyan-400/80 text-sm leading-relaxed font-mono">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Corner Accents */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-400/30"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-400/30"></div>
            </div>
          ))}
        </div>

        {/* Info Panel */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="text-lg font-bold text-cyan-300 font-mono">SERVICE STATUS</h3>
                <p className="text-cyan-400/80 text-sm font-mono">
                  {categories.filter(c => c.available).length} of {categories.length} service categories available
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-mono text-sm font-bold">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModule;
