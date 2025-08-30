import React, { useState } from 'react';
import { ArrowLeft, FileSpreadsheet, BarChart3, Database, Upload } from 'lucide-react';
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
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Main Menu</span>
                  </button>
                  <div className="h-6 border-l border-gray-300"></div>
                  <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                    <span>OZON Data Analytics</span>
                  </h1>
                </div>
              </div>

              {/* Component Selection */}
              <div className="grid gap-6 md:grid-cols-2">
                <div
                  onClick={() => handleSelectComponent('data-import')}
                  className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Data Import</h3>
                      <p className="text-gray-600">Import Excel/CSV files</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Upload and import OZON marketplace data from Excel or CSV files directly into the Supabase database for analysis.
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    <span>Launch Import Tool</span>
                    <Database className="w-4 h-4 ml-2" />
                  </div>
                </div>

                <div
                  onClick={() => handleSelectComponent('product-analysis')}
                  className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-purple-200"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Product Analysis</h3>
                      <p className="text-gray-600">AI-powered grouping</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Use AI to analyze and group similar products from your database, identify patterns, and generate insights.
                  </p>
                  <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                    <span>Launch Analysis Tool</span>
                    <BarChart3 className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-8 bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-gray-700 font-medium text-sm">OZON Analytics Ready • 2 Tools Available</p>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
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