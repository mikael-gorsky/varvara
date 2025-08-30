import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, BarChart3, TrendingUp, Users, AlertCircle, X, Zap, Activity, Database, Brain } from 'lucide-react';
import { ProductAnalysisService, ProductGroup, AnalysisResult } from '../../services/productAnalysisService';
import { supabase, supabaseAdmin } from '../../lib/supabase';

interface OzonProductAnalysisProps {
  onBack: () => void;
}

interface Supplier {
  name: string;
  count: number;
}

interface DiagnosticInfo {
  step: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  details?: any;
}

const OzonProductAnalysis: React.FC<OzonProductAnalysisProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<ProductGroup[]>([]);
  const [analyzingCategory, setAnalyzingCategory] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const addDiagnostic = (step: string, status: 'loading' | 'success' | 'error', message: string, details?: any) => {
    const newDiagnostic = { step, status, message, details };
    setDiagnostics(prev => [...prev, newDiagnostic]);
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    if (!analyzingCategory) {
      setDiagnostics([]);
      setShowDiagnostics(true);
    }

    try {
      if (!analyzingCategory) {
        addDiagnostic('database_connect', 'loading', 'Establishing quantum link to database core...');
      }
      
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (testError) {
        if (!analyzingCategory) {
          addDiagnostic('connection_failed', 'error', 'Quantum database link failed', {
            table: 'products',
            error: testError.message,
            code: testError.code
          });
        }
        setCategories([]);
        return;
      }

      if (!analyzingCategory) {
        addDiagnostic('connection_established', 'success', 'Quantum link established with PRODUCTS database');
      }
      
      if (!analyzingCategory) {
        addDiagnostic('data_scan', 'loading', 'Scanning database for strategic intelligence...');
      }
      const result = await ProductAnalysisService.getCategories();
      
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
        addDiagnostic('system_error', 'error', 'Critical system failure during category scan', {
          table: 'products',
          error: error instanceof Error ? error.message : 'Unknown system malfunction'
        });
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('supplier')
        .not('supplier', 'is', null)
        .neq('supplier', '');

      if (error) {
        console.error('Failed to load trade partners:', error);
        return;
      }

      const supplierCounts: { [key: string]: number } = {};
      data?.forEach(product => {
        if (product.supplier) {
          supplierCounts[product.supplier] = (supplierCounts[product.supplier] || 0) + 1;
        }
      });

      const supplierList = Object.entries(supplierCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setSuppliers(supplierList);
    } catch (error) {
      console.error('Load trade partners error:', error);
    }
  };

  const loadAnalysisResults = async () => {
    try {
      const results = await ProductAnalysisService.getAnalysisResults();
      setAnalysisResults(results);
    } catch (error) {
      console.error('Failed to load analysis archives:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await ProductAnalysisService.getAnalysisStats();
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
      
      const result = await ProductAnalysisService.analyzeCategory(category);
      
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
        await ProductAnalysisService.clearCategoryAnalysis(category);
        await loadAnalysisResults();
        await loadStats();
      } catch (error) {
        alert(`Purge operation failed: ${error instanceof Error ? error.message : 'Unknown system error'}`);
      }
    }
  };

  useEffect(() => {
    loadCategories();
    loadAnalysisResults();
    loadStats();
  }, []);

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return '🟡';
      case 'success':
        return '🟢';
      case 'error':
        return '🔴';
      default:
        return '🔵';
    }
  };

  const isCategoryAnalyzed = (category: string) => {
    return analysisResults.some(result => result.category === category);
  };

  const getCategoryResults = (category: string) => {
    return analysisResults.filter(result => result.category === category);
  };

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%), 
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      
      {/* Quantum Diagnostic Interface */}
      {showDiagnostics && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-cyan-400/40 shadow-xl shadow-cyan-400/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-cyan-300 font-mono">QUANTUM DIAGNOSTICS</h3>
              <button 
                onClick={() => setShowDiagnostics(false)}
                className="text-cyan-400 hover:text-cyan-300 bg-gray-800/50 border border-cyan-400/30 rounded p-1 hover:border-cyan-400/50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {diagnostics.map((diag, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-gray-800/30 border border-cyan-400/20 rounded">
                  <span className="text-sm">{getStatusIcon(diag.status)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-mono text-cyan-300">{diag.message}</p>
                    {diag.details && (
                      <pre className="text-xs text-cyan-400/60 mt-1 whitespace-pre-wrap font-mono max-h-20 overflow-y-auto">
                        {typeof diag.details === 'object' 
                          ? JSON.stringify(diag.details, null, 2)
                          : diag.details}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Command Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded text-cyan-300 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 font-mono text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO OZON COMMAND</span>
              </button>
              <div className="h-6 border-l border-cyan-400/30"></div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg border border-purple-300 relative">
                  <Brain className="w-6 h-6 text-black" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border border-black"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    AI PATTERN RECOGNITION
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    Strategic Asset Classification Systems
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-300 text-sm font-mono">AI CORE ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Intelligence Overview */}
        {stats && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-emerald-400/30 text-emerald-400 text-xs px-2 py-1 rounded font-mono">
                INT-01
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-cyan-300 mb-6 flex items-center space-x-3 font-mono tracking-wide">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span>STRATEGIC INTELLIGENCE OVERVIEW</span>
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 border border-blue-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Analysis Groups</span>
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-300 font-mono">{stats.total_groups}</p>
                <p className="text-blue-400/60 text-xs font-mono">Product Groups</p>
              </div>
              
              <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Categories</span>
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-300 font-mono">{stats.categories_analyzed}</p>
                <p className="text-emerald-400/60 text-xs font-mono">Product Categories</p>
              </div>
              
              <div className="bg-gray-800/50 border border-purple-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">AI Confidence</span>
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-purple-300 font-mono">{stats.avg_confidence}%</p>
                <p className="text-purple-400/60 text-xs font-mono">Algorithm Accuracy</p>
              </div>
              
              <div className="bg-gray-800/50 border border-orange-400/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-400"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">Last Analysis</span>
                  <Activity className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-lg font-bold text-orange-300 font-mono">{stats.last_analysis}</p>
                <p className="text-orange-400/60 text-xs font-mono">Temporal Sync</p>
              </div>
            </div>
          </div>
        )}

        {/* Strategic Categories Database */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
          <div className="absolute top-4 right-4">
            <span className="bg-gray-800/60 border border-cyan-400/30 text-cyan-400 text-xs px-2 py-1 rounded font-mono">
              DB-PROD
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-cyan-300 flex items-center space-x-3 font-mono tracking-wide">
              <Database className="w-6 h-6 text-cyan-400" />
              <span>PRODUCT DATABASE | CATEGORIES ({categories.length})</span>
            </h2>
            <button
              onClick={loadCategories}
              disabled={loadingCategories}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 border border-cyan-400 text-black rounded hover:from-cyan-500 hover:to-teal-500 transition-all duration-200 disabled:opacity-50 font-mono font-bold"
            >
              <RefreshCw className={`w-4 h-4 ${loadingCategories ? 'animate-spin' : ''}`} />
              <span>REFRESH DATABASE</span>
            </button>
          </div>

          {/* Trade Partner Filter */}
          {suppliers.length > 0 && (
            <div className="mb-6 p-4 bg-gray-800/30 border border-cyan-400/20 rounded-lg">
              <h3 className="text-sm font-mono text-cyan-400 mb-3 uppercase tracking-wider">
                Filter by Supplier ({suppliers.length} suppliers):
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className={`px-3 py-1 text-xs rounded border font-mono transition-all duration-200 ${
                    !selectedSupplier 
                      ? 'bg-cyan-600 text-black border-cyan-400' 
                      : 'bg-gray-800/50 text-cyan-400 border-cyan-400/30 hover:border-cyan-400/50'
                  }`}
                >
                  ALL PARTNERS
                </button>
                {suppliers.slice(0, 10).map(supplier => (
                  <button
                    key={supplier.name}
                    onClick={() => setSelectedSupplier(supplier.name)}
                    className={`px-3 py-1 text-xs rounded border font-mono transition-all duration-200 ${
                      selectedSupplier === supplier.name
                        ? 'bg-cyan-600 text-black border-cyan-400'
                        : 'bg-gray-800/50 text-cyan-400 border-cyan-400/30 hover:border-cyan-400/50'
                    }`}
                  >
                    {supplier.name} ({supplier.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-300">
                <AlertCircle className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-mono text-red-300 mb-2 tracking-wide">NO PRODUCT CATEGORIES DETECTED</h3>
              <p className="text-red-400/80 font-mono text-sm">Import product data to database with valid category classifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const isAnalyzed = isCategoryAnalyzed(category);
                const categoryResults = getCategoryResults(category);
                const isAnalyzing = analyzingCategory === category;

                return (
                  <div key={category} className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-6 hover:border-cyan-400/40 hover:bg-gray-800/60 transition-all duration-200 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 w-1 h-full rounded-l-lg ${
                      isAnalyzed ? 'bg-gradient-to-b from-emerald-400 to-teal-400' : 'bg-gradient-to-b from-gray-600 to-gray-500'
                    }`}></div>
                    
                    <div className="flex items-center justify-between mb-4 ml-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isAnalyzed 
                            ? 'bg-emerald-400 border-emerald-300 shadow-lg shadow-emerald-400/50' 
                            : 'bg-gray-600 border-gray-500'
                        }`}></div>
                        <h3 className="font-mono text-lg text-cyan-300 tracking-wide">{category}</h3>
                        <span className={`px-3 py-1 text-xs rounded border font-mono ${
                          isAnalyzed 
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' 
                            : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                        }`}>
                          {isAnalyzed ? '✅ AI ANALYZED' : '⚠️ AWAITING ANALYSIS'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {isAnalyzing ? (
                          <div className="flex items-center space-x-2 text-purple-400">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-mono">AI PROCESSING...</span>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => analyzeCategory(category)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-400 text-black rounded hover:from-purple-500 hover:to-pink-500 transition-all duration-200 font-mono font-bold text-sm"
                            >
                              <Zap className="w-4 h-4" />
                              <span>{isAnalyzed ? 'RE-DEPLOY AI' : 'DEPLOY AI'}</span>
                            </button>
                            {isAnalyzed && (
                              <button
                                onClick={() => clearCategoryAnalysis(category)}
                                className="px-3 py-2 bg-red-900/50 border border-red-500/50 text-red-300 rounded hover:bg-red-900/70 hover:border-red-400 transition-all duration-200 font-mono text-sm"
                              >
                                PURGE
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {categoryResults.length > 0 && (
                      <div className="ml-4 space-y-4">
                        <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg p-4">
                          <p className="font-mono text-emerald-300 font-bold mb-2 text-sm">AI ANALYSIS RESULTS:</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                              <span className="text-emerald-400">Groups: {categoryResults.length}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span className="text-purple-400">Confidence: {(categoryResults.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / categoryResults.length * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                              <span className="text-cyan-400">Assets: {categoryResults.reduce((sum, r) => sum + r.product_names.length, 0)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-3 bg-blue-900/20 border border-blue-400/30 rounded text-xs font-mono">
                            <p className="text-blue-300 font-bold mb-2">OPERATIONAL SCOPE:</p>
                            <div className="grid grid-cols-2 gap-2 text-blue-400">
                              <span>📦 Total Assets: {(() => {
                                const totalProducts = categoryResults[0]?.ai_response?.total_products_analyzed;
                                return totalProducts || 'Loading...';
                              })()}</span>
                              <span>🏪 Trade Partners: {(() => {
                                const totalSuppliers = categoryResults[0]?.ai_response?.total_suppliers_analyzed;
                                return totalSuppliers || 'Loading...';
                              })()}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-mono text-cyan-300 font-bold text-sm">CLASSIFIED INTELLIGENCE GROUPS:</p>
                              <button
                                onClick={() => {
                                  const groups = categoryResults.map((group, i) => 
                                    `Group ${i+1}: ${group.group_name}\n` +
                                    `Classification: ${group.group_description || 'N/A'}\n` +
                                    `Assets (${group.product_names.length}):\n` +
                                    group.product_names.map(p => `  • ${p}`).join('\n') +
                                    `\nTrade Partners: ${group.vendor_analysis?.vendors?.join(', ') || 'N/A'}\n\n`
                                  ).join('');
                                  
                                  navigator.clipboard.writeText(groups);
                                  alert('Intelligence data transferred to clipboard buffer!');
                                }}
                                className="text-xs bg-cyan-600 text-black px-3 py-1 rounded border border-cyan-400 hover:bg-cyan-500 font-mono font-bold"
                              >
                                EXTRACT ALL DATA
                              </button>
                            </div>
                            {categoryResults.map((group, index) => (
                              <div key={group.id} className="bg-gray-800/60 border border-cyan-400/20 rounded-lg p-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-cyan-400"></div>
                                
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-mono text-cyan-300 font-bold text-sm tracking-wide">
                                    CLASSIFICATION {index + 1}: {group.group_name}
                                  </h4>
                                  <span className="bg-purple-400/10 border border-purple-400/30 text-purple-400 text-xs px-2 py-1 rounded font-mono">
                                    {(group.confidence_score * 100).toFixed(1)}% CONFIDENCE
                                  </span>
                                </div>
                                
                                {group.group_description && (
                                  <p className="text-sm text-cyan-400/80 mb-3 italic bg-gray-900/30 border border-cyan-400/20 p-3 rounded font-mono">
                                    {group.group_description}
                                  </p>
                                )}
                                
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-mono text-emerald-400 font-bold mb-2">
                                      STRATEGIC ASSETS ({group.product_names.length}):
                                    </p>
                                    <div className="pl-3 space-y-1 max-h-32 overflow-y-auto bg-gray-900/30 border border-cyan-400/20 p-3 rounded">
                                      {group.product_names.map((product, pIndex) => (
                                        <p key={pIndex} className="text-xs text-cyan-400/80 leading-relaxed font-mono">
                                          • {product}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {group.vendor_analysis && (
                                    <div className="pt-3 border-t border-cyan-400/20">
                                      <p className="text-sm font-mono text-teal-400 font-bold mb-2">
                                        TRADE PARTNERS ({group.vendor_analysis.vendor_count || 0}):
                                      </p>
                                      <p className="text-xs text-teal-400/80 bg-gray-900/30 border border-cyan-400/20 p-2 rounded font-mono">
                                        {group.vendor_analysis.vendors?.join(', ') || 'CLASSIFIED'}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="pt-3 border-t border-cyan-400/20">
                                    <button
                                      onClick={() => {
                                        const groupText = `Strategic Classification: ${group.group_name}\n` +
                                          `Intelligence Summary: ${group.group_description || 'CLASSIFIED'}\n` +
                                          `Strategic Assets (${group.product_names.length}):\n` +
                                          group.product_names.map(p => `  • ${p}`).join('\n') +
                                          `\nTrade Partners: ${group.vendor_analysis?.vendors?.join(', ') || 'CLASSIFIED'}`;
                                        
                                        navigator.clipboard.writeText(groupText);
                                        alert('Classification data extracted to clipboard buffer!');
                                      }}
                                      className="text-xs bg-gray-700 border border-cyan-400/30 text-cyan-400 px-3 py-1 rounded hover:bg-gray-600 hover:border-cyan-400/50 transition-all duration-200 font-mono"
                                    >
                                      EXTRACT CLASSIFICATION DATA
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Status Footer */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-cyan-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
              <span className="text-purple-300 font-mono font-bold text-sm">AI PATTERN RECOGNITION ACTIVE</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400/80 font-mono text-sm">NEURAL NETWORKS: OPERATIONAL</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-400 font-mono text-sm">EMPIRE: ОФИС-КИТ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OzonProductAnalysis;