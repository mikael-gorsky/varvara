import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, BarChart3, TrendingUp, Users, AlertCircle, X, Zap, Activity, Database, Brain } from 'lucide-react';
import { productAnalysisService, ProductGroup, AnalysisResult } from '../../services/productAnalysisService';
import { supabase, supabaseAdmin } from '../../lib/supabase';

interface Supplier {
  id: string;
  name: string;
  product_count: number;
}

interface Category {
  category: string;
  product_count: number;
  total_sales: number;
  avg_price: number;
}

interface AnalysisStats {
  total_categories: number;
  analyzed_categories: number;
  total_groups: number;
  last_analysis: string | null;
}

interface Diagnostic {
  id: string;
  step: string;
  status: 'loading' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: Date;
}

interface ProductAnalysisProps {
  onBack: () => void;
}

const ProductAnalysis: React.FC<ProductAnalysisProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [stats, setStats] = useState<AnalysisStats>({
    total_categories: 0,
    analyzed_categories: 0,
    total_groups: 0,
    last_analysis: null
  });
  const [loading, setLoading] = useState(true);
  const [analyzingCategory, setAnalyzingCategory] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const addDiagnostic = (step: string, status: 'loading' | 'success' | 'error' | 'warning', message: string, details?: any) => {
    const diagnostic: Diagnostic = {
      id: `${step}-${Date.now()}`,
      step,
      status,
      message,
      details,
      timestamp: new Date()
    };
    setDiagnostics(prev => [...prev, diagnostic]);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await loadCategories();
      await loadAnalysisResults();
      await loadStats();
    } catch (error) {
      console.error('Failed to load strategic intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      if (!analyzingCategory) {
        setDiagnostics([]);
        addDiagnostic('system_init', 'loading', 'Initializing strategic intelligence core...');
      }
      
      if (!analyzingCategory) {
        addDiagnostic('data_scan', 'loading', 'Scanning database for strategic intelligence...');
      }
      const result = await productAnalysisService.getCategories();
      
      if (!analyzingCategory) {
        result.diagnostics.forEach(diag => {
          addDiagnostic(diag.step, diag.status as any, diag.message, diag.details);
        });
      }
      
      if (result.categories.length === 0) {
        if (!analyzingCategory) {
          addDiagnostic('no_strategic_data', 'error', 'No strategic categories detected in database core', {
            table: 'products',
            fields_checked: ['category', 'category_name'],
            suggestion: 'Import strategic assets with valid classification data first'
          });
        }
      } else {
        if (!analyzingCategory) {
          addDiagnostic('scan_complete', 'success', `Strategic intelligence ready: ${result.categories.length} categories detected`, {
            table: 'products',
            categories: result.categories
          });
        }
      }
      
      setCategories(result.categories);
      await loadSuppliers();
    } catch (error) {
      if (!analyzingCategory) {
        addDiagnostic('critical_failure', 'error', 'Strategic intelligence core malfunction', {
          error: error instanceof Error ? error.message : 'Unknown system failure'
        });
      }
      console.error('Failed to load categories:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      if (!analyzingCategory) {
        addDiagnostic('supplier_scan', 'loading', 'Scanning supplier networks...');
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('supplier_name')
        .not('supplier_name', 'is', null)
        .not('supplier_name', 'eq', '');

      if (error) throw error;

      const supplierCounts = data.reduce((acc: Record<string, number>, product) => {
        const supplier = product.supplier_name;
        acc[supplier] = (acc[supplier] || 0) + 1;
        return acc;
      }, {});

      const suppliersArray = Object.entries(supplierCounts)
        .map(([name, count]) => ({
          id: name,
          name,
          product_count: count as number
        }))
        .sort((a, b) => b.product_count - a.product_count);

      setSuppliers(suppliersArray);
      
      if (!analyzingCategory) {
        addDiagnostic('supplier_scan_complete', 'success', `Supplier network mapped: ${suppliersArray.length} active suppliers`, {
          total_suppliers: suppliersArray.length,
          top_supplier: suppliersArray[0]?.name,
          top_supplier_products: suppliersArray[0]?.product_count
        });
      }
    } catch (error) {
      if (!analyzingCategory) {
        addDiagnostic('supplier_scan_failed', 'error', 'Supplier network scan failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      console.error('Failed to load suppliers:', error);
    }
  };

  const loadAnalysisResults = async () => {
    try {
      const results = await productAnalysisService.getAnalysisResults();
      setAnalysisResults(results);
    } catch (error) {
      console.error('Failed to load analysis archives:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await productAnalysisService.getAnalysisStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load strategic statistics:', error);
    }
  };

  const analyzeCategory = async (category: string) => {
    setAnalyzingCategory(category);
    setDiagnostics([]);
    setShowDiagnostics(true);
    
    try {
      addDiagnostic('ai_deployment', 'loading', `Deploying AI algorithms for strategic category: ${category}`);
      
      const result = await productAnalysisService.analyzeCategory(category);
      
      if (result.diagnostics) {
        result.diagnostics.forEach((diag: any) => {
          addDiagnostic(diag.step, diag.status, diag.message, diag.details);
        });
      }
      
      if (result.success) {
        addDiagnostic('ai_mission_success', 'success', `AI analysis protocols completed successfully`, {
          groups_created: result.groups_created,
          analysis_confidence: result.analysis_confidence
        });
        
        await loadAnalysisResults();
        await loadStats();
      } else {
        addDiagnostic('ai_mission_failed', 'error', `AI analysis protocols failed: ${result.error}`, {
          error: result.error,
          category
        });
        
        if (result.error?.includes('OpenAI API key')) {
          alert(`⚠️ AI Core Configuration Required\n\n${result.error}\n\nConfigure OPENAI_API_KEY in your galactic database Edge Function settings.`);
        } else {
          alert(`AI Analysis Failed: ${result.error}`);
        }
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'diagnostics' in error) {
        (error as any).diagnostics?.forEach((diag: any) => {
          addDiagnostic(diag.step, diag.status, diag.message, diag.details);
        });
      }
      
      addDiagnostic('critical_ai_failure', 'error', 'AI core system malfunction detected', {
        error: error instanceof Error ? error.message : 'Unknown system failure',
        category
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('OpenAI') || errorMessage.includes('API key')) {
        alert(`⚠️ AI Core Offline\n\n${errorMessage}\n\nEstablish connection to OpenAI neural networks in galactic database settings.`);
      } else {
        alert(`Critical AI Failure: ${errorMessage}`);
      }
    } finally {
      setAnalyzingCategory(null);
    }
  };

  const clearCategoryAnalysis = async (category: string) => {
    if (confirm(`WARNING: Purge AI analysis data for strategic category "${category}"? This action cannot be reversed.`)) {
      try {
        await productAnalysisService.clearCategoryAnalysis(category);
        await loadAnalysisResults();
        await loadStats();
      } catch (error) {
        alert(`Purge operation failed: ${error instanceof Error ? error.message : 'Unknown system error'}`);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />;
      case 'error':
        return <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />;
      case 'warning':
        return <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading':
        return 'text-cyan-400';
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-cyan-400 font-mono">Initializing Strategic Intelligence Core...</p>
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
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg border border-purple-300 relative">
                  <Brain className="w-6 h-6 text-black" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-black animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    AI STRATEGIC ANALYSIS
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    Neural Network Product Intelligence
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                disabled={analyzingCategory !== null}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded text-cyan-300 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 font-mono text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${analyzingCategory ? 'animate-spin' : ''}`} />
                <span>REFRESH INTEL</span>
              </button>
              
              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded text-cyan-300 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 font-mono text-sm"
              >
                <Activity className="w-4 h-4" />
                <span>DIAGNOSTICS</span>
                {diagnostics.length > 0 && (
                  <span className="bg-cyan-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                    {diagnostics.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                <Database className="w-4 h-4 text-black" />
              </div>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Total Categories</h3>
            <p className="text-lg font-bold text-blue-300 font-mono">{stats.total_categories}</p>
            <p className="text-blue-400/60 text-xs font-mono">Strategic Classifications</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                <Brain className="w-4 h-4 text-black" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">AI Analyzed</h3>
            <p className="text-lg font-bold text-emerald-300 font-mono">{stats.analyzed_categories}</p>
            <p className="text-emerald-400/60 text-xs font-mono">Neural Processing Complete</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg border border-purple-300">
                <Users className="w-4 h-4 text-black" />
              </div>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Product Groups</h3>
            <p className="text-lg font-bold text-purple-300 font-mono">{stats.total_groups}</p>
            <p className="text-purple-400/60 text-xs font-mono">AI Classifications</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg border border-yellow-300">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <Activity className="w-4 h-4 text-yellow-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Last Analysis</h3>
            <p className="text-lg font-bold text-yellow-300 font-mono">
              {stats.last_analysis ? new Date(stats.last_analysis).toLocaleDateString() : 'Never'}
            </p>
            <p className="text-yellow-400/60 text-xs font-mono">Neural Network Activity</p>
          </div>
        </div>

        {/* Diagnostics Panel */}
        {showDiagnostics && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg border border-cyan-300">
                  <Activity className="w-4 h-4 text-black" />
                </div>
                <h2 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">SYSTEM DIAGNOSTICS</h2>
              </div>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {diagnostics.length === 0 ? (
                <p className="text-cyan-400/60 font-mono text-sm">No diagnostic data available</p>
              ) : (
                diagnostics.map((diagnostic) => (
                  <div
                    key={diagnostic.id}
                    className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-3 hover:border-cyan-400/40 transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(diagnostic.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-mono text-sm ${getStatusColor(diagnostic.status)}`}>
                            {diagnostic.message}
                          </p>
                          <span className="text-cyan-400/60 font-mono text-xs">
                            {diagnostic.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {diagnostic.details && (
                          <pre className="text-cyan-400/60 font-mono text-xs mt-1 whitespace-pre-wrap">
                            {JSON.stringify(diagnostic.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Categories Panel */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">STRATEGIC CATEGORIES</h2>
                <p className="text-cyan-400/80 text-sm font-mono">AI Analysis Targets</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-yellow-400 font-mono">No strategic categories detected</p>
                  <p className="text-cyan-400/60 font-mono text-sm mt-2">Import product data with valid categories first</p>
                </div>
              ) : (
                categories.map((category) => {
                  const isAnalyzed = analysisResults.some(result => result.category === category.category);
                  const isAnalyzing = analyzingCategory === category.category;
                  
                  return (
                    <div
                      key={category.category}
                      className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-4 hover:border-cyan-400/40 transition-all duration-200 relative"
                    >
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-lg"></div>
                      
                      <div className="ml-2 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-cyan-300 text-sm leading-tight font-mono">
                              {category.category}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-cyan-400/60 font-mono text-xs">
                                {category.product_count} products
                              </span>
                              <span className="text-cyan-400/60 font-mono text-xs">
                                {formatCurrency(category.total_sales)}
                              </span>
                              <span className="text-cyan-400/60 font-mono text-xs">
                                Avg: {formatCurrency(category.avg_price)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isAnalyzed && (
                              <span className="bg-emerald-400/20 border border-emerald-400/50 text-emerald-400 px-2 py-1 rounded font-mono text-xs">
                                ANALYZED
                              </span>
                            )}
                            {isAnalyzing && (
                              <span className="bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 px-2 py-1 rounded font-mono text-xs flex items-center space-x-1">
                                <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>ANALYZING</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => analyzeCategory(category.category)}
                            disabled={isAnalyzing || analyzingCategory !== null}
                            className="flex items-center space-x-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black rounded font-mono text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Brain className="w-3 h-3" />
                            <span>{isAnalyzed ? 'RE-ANALYZE' : 'ANALYZE'}</span>
                          </button>
                          
                          {isAnalyzed && (
                            <button
                              onClick={() => clearCategoryAnalysis(category.category)}
                              disabled={isAnalyzing || analyzingCategory !== null}
                              className="flex items-center space-x-2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-mono text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-3 h-3" />
                              <span>PURGE</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Analysis Results Panel */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg border border-purple-300">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">AI ANALYSIS RESULTS</h2>
                <p className="text-cyan-400/80 text-sm font-mono">Neural Network Classifications</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analysisResults.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-400 font-mono">No AI analysis results available</p>
                  <p className="text-cyan-400/60 font-mono text-sm mt-2">Run analysis on strategic categories to see results</p>
                </div>
              ) : (
                analysisResults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-4 hover:border-cyan-400/40 transition-all duration-200 relative"
                  >
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-500 rounded-l-lg"></div>
                    
                    <div className="ml-2 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-cyan-300 text-sm font-mono">
                            {result.category}
                          </h3>
                          <p className="text-cyan-400/60 font-mono text-xs">
                            Analyzed: {new Date(result.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className="bg-purple-400/20 border border-purple-400/50 text-purple-400 px-2 py-1 rounded font-mono text-xs">
                          {result.groups.length} GROUPS
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {result.groups.slice(0, 3).map((group, index) => (
                          <div key={index} className="bg-gray-700/30 border border-cyan-400/10 rounded p-2">
                            <h4 className="text-cyan-300 font-mono text-xs font-semibold">
                              {group.name}
                            </h4>
                            <p className="text-cyan-400/60 font-mono text-xs mt-1">
                              {group.description}
                            </p>
                            <p className="text-cyan-400/40 font-mono text-xs mt-1">
                              {group.products.length} products
                            </p>
                          </div>
                        ))}
                        {result.groups.length > 3 && (
                          <p className="text-cyan-400/60 font-mono text-xs text-center">
                            +{result.groups.length - 3} more groups...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Command Status */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-cyan-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
              <span className="text-purple-300 font-mono font-bold text-sm">AI STRATEGIC ANALYSIS ACTIVE</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400/80 font-mono text-sm">NEURAL NETWORKS ONLINE</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-400 font-mono text-sm">READY FOR ANALYSIS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalysis;