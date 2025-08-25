import React, { useState } from 'react';
import { parseCSVFile, parseExcelFile, ParsedData, ProductRow } from '../utils/csvParser';

interface OzonAnalysisProps {
  onBack: () => void;
}

const OzonAnalysis: React.FC<OzonAnalysisProps> = ({ onBack }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">OZON Data Analysis</h1>
            <p className="text-xl text-blue-200 mb-4">Import and analyze OZON marketplace reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OzonAnalysis;