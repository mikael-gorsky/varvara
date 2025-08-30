import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, BarChart3, TrendingUp, Users, AlertCircle, X } from 'lucide-react';
import { ProductAnalysisService, ProductGroup, AnalysisResult } from '../services/productAnalysisService';
import { supabase, supabaseAdmin } from '../lib/supabase';

interface OzonAnalysisProps {
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

const OzonAnalysis: React.FC<OzonAnalysisProps> = ({ onBack }) => {
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
    // Only show diagnostics during category loading if not analyzing
    if (!analyzingCategory) {
      setDiagnostics([]);
      setShowDiagnostics(true);
    }

    try {
      // Only add category loading diagnostics if not doing AI analysis
      if (!analyzingCategory) {
        addDiagnostic('connect', 'loading', 'Connecting to database...');
      }
      
      // First check if we can connect at all
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (testError) {
        if (!analyzingCategory) {
          addDiagnostic('connection', 'error', 'Database connection failed', {
            table: 'products',
            error: testError.message,
            code: testError.code
          });
        }
        setCategories([]);
        return;
      }

      if (!analyzingCategory) {
        addDiagnostic('connection', 'success', 'Connected to TABLE: products');
      }
      
      if (!analyzingCategory) {
        addDiagnostic('sample', 'loading', 'Checking sample data...');
      }
      const result = await ProductAnalysisService.getCategories();
      
      // Add service diagnostics only if not doing AI analysis
      if (!analyzingCategory) {
        result.diagnostics.forEach(diag => {
          addDiagnostic(diag.step, diag.status as any, diag.message, diag.details);
        });
      }
      
      if (result.categories.length === 0) {
        if (!analyzingCategory) {
          addDiagnostic('final_status', 'error', 'No categories available for analysis', {
            table: 'products',
            fields_checked: ['category', 'category_name'],
            suggestion: 'Import products with valid category data first'
          });
        }
      } else {
        if (!analyzingCategory) {
          addDiagnostic('final_status', 'success', `Ready for analysis with ${result.categories.length} categories`, {
            table: 'products',
            categories: result.categories
          });
        }
      }
      
      setCategories(result.categories);
      
      // Load suppliers for filtering
      await loadSuppliers();

    } catch (error) {
      if (!analyzingCategory) {
        addDiagnostic('error', 'error', 'Failed to load categories', {
          table: 'products',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      // Get all suppliers with their product counts
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('supplier')
        .not('supplier', 'is', null)
        .neq('supplier', '');

      if (error) {
        console.error('Failed to load suppliers:', error);
        return;
      }

      // Count suppliers
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
      console.error('Load suppliers error:', error);
    }
  };
  const loadAnalysisResults = async () => {
    try {
      const results = await ProductAnalysisService.getAnalysisResults();
      setAnalysisResults(results);
    } catch (error) {
      console.error('Failed to load analysis results:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await ProductAnalysisService.getAnalysisStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const analyzeCategory = async (category: string) => {
    setAnalyzingCategory(category);
    // Clear all diagnostics and show only AI-related ones
    setDiagnostics([]);
    setShowDiagnostics(true);
    
    try {
      addDiagnostic('ai_analysis_start', 'loading', `Starting AI analysis for: ${category}`);
      
      const result = await ProductAnalysisService.analyzeCategory(category);
      
      // Add only AI analysis diagnostics to our diagnostic display
      if (result.diagnostics) {
        // Filter to show only AI-related steps
        // Show ALL diagnostics - no filtering!
        result.diagnostics.forEach((diag: any) => {
          addDiagnostic(diag.step, diag.status, diag.message, diag.details);
        });
      }
      
      if (result.success) {
        addDiagnostic('ai_analysis_complete', 'success', `Analysis completed successfully`, {
          groups_created: result.groups_created,
          analysis_confidence: result.analysis_confidence
        });
        
        // Refresh analysis results and stats
        await loadAnalysisResults();
        await loadStats();
      } else {
        addDiagnostic('ai_analysis_failed', 'error', `Analysis failed: ${result.error}`, {
          error: result.error,
          category
        });
        
        if (result.error?.includes('OpenAI API key')) {
          alert(`⚠️ OpenAI Configuration Required\n\n${result.error}\n\nPlease configure OPENAI_API_KEY in your Supabase Edge Function settings.`);
        } else {
          alert(`Analysis failed: ${result.error}`);
        }
      }
    } catch (error) {
      // If there's an error, try to get diagnostics from the error object
      if (error && typeof error === 'object' && 'diagnostics' in error) {
        (error as any).diagnostics?.forEach((diag: any) => {
          addDiagnostic(diag.step, diag.status, diag.message, diag.details);
        });
      }
      
      addDiagnostic('ai_analysis_exception', 'error', 'Analysis threw exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('OpenAI') || errorMessage.includes('API key')) {
        alert(`⚠️ Configuration Required\n\n${errorMessage}\n\nSet up OpenAI API key in Supabase Edge Function environment variables.`);
      } else {
        alert(`Analysis error: ${errorMessage}`);
      }
    } finally {
      setAnalyzingCategory(null);
    }
  };

  const clearCategoryAnalysis = async (category: string) => {
    if (confirm(`Clear AI analysis for category "${category}"?`)) {
      try {
        await ProductAnalysisService.clearCategoryAnalysis(category);
        await loadAnalysisResults();
        await loadStats();
      } catch (error) {
        alert(`Failed to clear analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      {/* Diagnostic Overlay */}
      {showDiagnostics && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Diagnostic Information</h3>
              <button 
                onClick={() => setShowDiagnostics(false)}
                className="text-gray-600 hover:text-gray-800 bg-white bg-opacity-50 rounded p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {diagnostics.map((diag, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-sm">{getStatusIcon(diag.status)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{diag.message}</p>
                    {diag.details && (
                      <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Analytics</span>
            </button>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <span>OZON Data Analytics</span>
            </h1>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Analysis Overview</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Groups</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total_groups}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Categories Analyzed</p>
                <p className="text-2xl font-bold text-green-800">{stats.categories_analyzed}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Avg Confidence</p>
                <p className="text-2xl font-bold text-purple-800">{stats.avg_confidence}%</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Last Analysis</p>
                <p className="text-lg font-bold text-orange-800">{stats.last_analysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>TABLE: products | Categories ({categories.length})</span>
            </h2>
            <button
              onClick={loadCategories}
              disabled={loadingCategories}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingCategories ? 'animate-spin' : ''}`} />
              <span>Refresh Categories</span>
            </button>
          </div>

          {/* Supplier Filter */}
          {suppliers.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Supplier ({suppliers.length} suppliers):</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    !selectedSupplier 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Suppliers
                </button>
                {suppliers.slice(0, 10).map(supplier => (
                  <button
                    key={supplier.name}
                    onClick={() => setSelectedSupplier(supplier.name)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedSupplier === supplier.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Categories Found</h3>
              <p className="text-gray-500">Import products to TABLE: products with valid category/category_name fields.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => {
                const isAnalyzed = isCategoryAnalyzed(category);
                const categoryResults = getCategoryResults(category);
                const isAnalyzing = analyzingCategory === category;

                return (
                  <div key={category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`w-3 h-3 rounded-full ${isAnalyzed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <h3 className="font-medium text-gray-800">{category}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isAnalyzed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isAnalyzed ? '✅ Analyzed' : '⚠️ Not Analyzed'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isAnalyzing ? (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Analyzing...</span>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => analyzeCategory(category)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              {isAnalyzed ? 'Re-analyze' : 'Analyze'}
                            </button>
                            {isAnalyzed && (
                              <button
                                onClick={() => clearCategoryAnalysis(category)}
                                className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors"
                              >
                                Clear
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {categoryResults.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <p className="font-medium text-gray-700 mb-1">Analysis Results:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                          <span>Groups: {categoryResults.length}</span>
                          <span>Confidence: {(categoryResults.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / categoryResults.length).toFixed(1)}%</span>
                          <span>Products: {categoryResults.reduce((sum, r) => sum + r.product_names.length, 0)}</span>
                        </div>
                        
                        {/* Detailed Group Breakdown */}
                        <div className="mt-4 space-y-3">
                          <p className="font-medium text-gray-800 text-sm">Detailed Groups:</p>
                          {categoryResults.map((group, index) => (
                            <div key={group.id} className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-800 text-sm">
                                  {index + 1}. {group.group_name}
                                </h4>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {(group.confidence_score * 100).toFixed(1)}% confidence
                                </span>
                              </div>
                              {group.group_description && (
                                <p className="text-xs text-gray-600 mb-2 italic">
                                  {group.group_description}
                                </p>
                              )}
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700">
                                  Products ({group.product_names.length}):
                                </p>
                                <div className="pl-3 space-y-1">
                                  {group.product_names.slice(0, 10).map((product, pIndex) => (
                                    <p key={pIndex} className="text-xs text-gray-600">
                                      • {product}
                                    </p>
                                  ))}
                                  {group.product_names.length > 10 && (
                                    <p className="text-xs text-gray-500 italic">
                                      ... and {group.product_names.length - 10} more products
                                    </p>
                                  )}
                                </div>
                              </div>
                              {group.vendor_analysis && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">Suppliers:</span> {group.vendor_analysis.vendors?.join(', ') || 'N/A'}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OzonAnalysis;