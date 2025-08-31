import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Package, BarChart3, Activity, Brain, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { productAnalysisService, AnalysisResult, AnalysisStats } from '../../services/productAnalysisService';

interface OzonProductAnalysisProps {
  onBack: () => void;
}

const OzonProductAnalysis: React.FC<OzonProductAnalysisProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadCategories = async () => {
    try {
      const result = await productAnalysisService.getCategories();
      setCategories(result || []); // Defensive programming - ensure it's always an array
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories');
      setCategories([]); // Set to empty array on error
    }
  };

  const loadStats = async () => {
    try {
      const stats = await productAnalysisService.getAnalysisStats();
      setAnalysisStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load statistics');
    }
  };

  const loadResults = async () => {
    try {
      const results = await productAnalysisService.getAnalysisResults();
      setAnalysisResults(results || []); // Defensive programming - ensure it's always an array
    } catch (error) {
      console.error('Failed to load results:', error);
      setError('Failed to load analysis results');
      setAnalysisResults([]); // Set to empty array on error
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await Promise.all([
        loadCategories(),
        loadStats(),
        loadResults()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnalyzeCategory = async () => {
    if (!selectedCategory) return;

    setIsAnalyzing(true);
    setError('');

    try {
      await productAnalysisService.analyzeCategory(selectedCategory);
      await loadResults(); // Reload to show new results
      await loadStats(); // Update stats
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearCategory = async (category: string) => {
    try {
      await productAnalysisService.clearCategoryAnalysis(category);
      await loadResults(); // Reload to show updated results
      await loadStats(); // Update stats
    } catch (error) {
      console.error('Failed to clear analysis:', error);
      setError('Failed to clear analysis');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-300 font-mono">Loading analysis data...</p>
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg border border-purple-300">
                  <Brain className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    AI PRODUCT ANALYSIS
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    Intelligent Market Intelligence
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-mono">{error}</span>
          </div>
        )}

        {/* Stats Overview */}
        {analysisStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                  <BarChart3 className="w-4 h-4 text-black" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Categories</h3>
              <p className="text-lg font-bold text-emerald-300 font-mono">{analysisStats.totalCategories}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                  <Package className="w-4 h-4 text-black" />
                </div>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Groups</h3>
              <p className="text-lg font-bold text-blue-300 font-mono">{analysisStats.totalGroups}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg border border-purple-300">
                  <Brain className="w-4 h-4 text-black" />
                </div>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Products</h3>
              <p className="text-lg font-bold text-purple-300 font-mono">{analysisStats.totalProducts}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg border border-orange-300">
                  <Zap className="w-4 h-4 text-black" />
                </div>
                <Activity className="w-4 h-4 text-orange-400" />
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Last Analysis</h3>
              <p className="text-lg font-bold text-orange-300 font-mono">
                {analysisStats.lastAnalysisDate 
                  ? new Date(analysisStats.lastAnalysisDate).toLocaleDateString()
                  : 'None'
                }
              </p>
            </div>
          </div>
        )}

        {/* Analysis Controls */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-400"></div>
          <h2 className="text-xl font-bold text-cyan-300 font-mono mb-4">Category Analysis</h2>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border border-cyan-400/50 text-cyan-300 rounded-lg px-4 py-2 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleAnalyzeCategory}
              disabled={!selectedCategory || isAnalyzing}
              className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg transition-all duration-200 font-mono"
            >
              <Brain className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Category'}</span>
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResults.length > 0 && (
          <div className="space-y-6">
            {analysisResults.map((result) => (
              <div key={result.category} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                      <Package className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-cyan-300 font-mono">{result.category}</h3>
                      <p className="text-cyan-400/80 text-sm font-mono">{result.groups.length} groups • {result.totalProducts} products</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleClearCategory(result.category)}
                    className="px-4 py-2 bg-red-600/20 border border-red-400/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-all duration-200 font-mono text-sm"
                  >
                    Clear Analysis
                  </button>
                </div>

                {/* Category Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-3">
                    <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Avg Price</h4>
                    <p className="text-lg font-bold text-cyan-300 font-mono">
                      ${result.averagePrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-3">
                    <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Price Range</h4>
                    <p className="text-lg font-bold text-cyan-300 font-mono">
                      ${result.priceRange.min} - ${result.priceRange.max}
                    </p>
                  </div>
                  <div className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-3">
                    <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Top Vendor</h4>
                    <p className="text-lg font-bold text-cyan-300 font-mono">
                      {result.topVendors[0]?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Product Groups */}
                <div className="space-y-3">
                  {result.groups.map((group) => (
                    <div key={group.id} className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-cyan-300 font-mono">{group.group_name}</h4>
                        {group.confidence_score && (
                          <span className="bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs px-2 py-1 rounded font-mono">
                            {(group.confidence_score * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                      {group.group_description && (
                        <p className="text-cyan-400/80 text-sm mb-3 font-mono">{group.group_description}</p>
                      )}
                      <div className="text-xs text-cyan-400/60 font-mono">
                        {group.product_names.length} products in this group
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {analysisResults.length === 0 && !isLoading && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-12 text-center">
            <Brain className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-cyan-300 font-mono mb-2">No Analysis Results</h3>
            <p className="text-cyan-400/80 font-mono">Select a category and run analysis to see intelligent product groupings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OzonProductAnalysis;