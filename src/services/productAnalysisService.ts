import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, DollarSign, BarChart3, Activity, Eye, ChevronRight, ArrowLeft, Crown, Zap } from 'lucide-react';
import { supabase, supabaseAdmin } from '../lib/supabase';

export interface ProductGroup {
  id: string;
  category: string;
  group_name: string;
  group_description?: string;
  product_names: string[];
  price_analysis?: any;
  confidence_score?: number;
  vendor_analysis?: any;
  ai_response?: any;
  created_at?: string;
  updated_at?: string;
}

export interface AnalysisResult {
  success: boolean;
  error?: string;
  groups_created?: number;
  analysis_confidence?: number;
  diagnostics?: any[];
}

interface Client {
  id: string;
  name: string;
  sales: number;
  growth: number;
  industry: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number;
  units: number;
  growth: number;
}

interface KPIData {
  totalRevenue: number;
  topProductsShare: number;
  majorClientsShare: number;
  averageProductMargin: number;
}

export interface DiagnosticMessage {
  id: string;
  type: 'loading' | 'success' | 'error' | 'info';
  message: string;
  details?: any;
  timestamp: Date;
}

export class ProductAnalysisService {
  private diagnostics: DiagnosticMessage[] = [];
  private diagnosticCallbacks: ((diagnostic: DiagnosticMessage) => void)[] = [];

  onDiagnostic(callback: (diagnostic: DiagnosticMessage) => void) {
    this.diagnosticCallbacks.push(callback);
  }

  private addDiagnostic(id: string, type: DiagnosticMessage['type'], message: string, details?: any) {
    const diagnostic: DiagnosticMessage = {
      id,
      type,
      message,
      details,
      timestamp: new Date()
    };
    
    this.diagnostics.push(diagnostic);
    this.diagnosticCallbacks.forEach(callback => callback(diagnostic));
  }

  async testConnection() {
    try {
      const { data: testData, error: testError } = await supabase
        .from('ozon_data')
        .select('id')
        .limit(1);

      if (testError) {
        if (testError.message.includes('relation "ozon_data" does not exist')) {
          this.addDiagnostic('table_not_found', 'error', 'OZON_DATA table not found in database', {
            table: 'ozon_data',
            suggestion: 'Import OZON data first to create the table'
          });
          return false;
        } else {
          this.addDiagnostic('connection_failed', 'error', 'Database connection failed', {
            table: 'ozon_data',
            error: testError.message
          });
          return false;
        }
      } else {
        this.addDiagnostic('connection_established', 'success', 'Database connection established with OZON_DATA table');
        return true;
      }
    } catch (error) {
      this.addDiagnostic('connection_error', 'error', 'Connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async getCategories() {
    try {
      this.addDiagnostic('data_scan', 'loading', 'Scanning database for product categories...');

      // 1. Get count of all products
      const { count, error: countError } = await supabaseAdmin
        .from('ozon_data')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      this.addDiagnostic('count_check', 'info', `TABLE: ozon_data contains ${count} total rows`, {
        count
      });

      // 2. Test query - get sample data first
      const { data: sampleData, error: sampleError } = await supabaseAdmin
        .from('ozon_data')
        .select('id, category_level1, seller')
        .limit(10);

      if (sampleError) {
        throw sampleError;
      }

      this.addDiagnostic('sample_check', 'info', 'Sample data retrieved successfully', {
        sample: sampleData?.map(row => ({
          id: row.id?.slice(0, 8),
          category_level1: row.category_level1,
          seller: row.seller
        }))
      });

      // 3. Get all category_level1 values
      const { data, error } = await supabaseAdmin
        .from('ozon_data')
        .select('category_level1')
        .not('category_level1', 'is', null)
        .neq('category_level1', '')
        .order('category_level1');

      if (error) {
        throw error;
      }

      const categoryData = data as { category_level1: string }[];
      
      const allCategoryValues = categoryData?.map(p => 
        typeof p === 'string' ? p : p.category_level1
      ).filter(c => c && c.trim() !== '') || [];

      const uniqueCategories = [...new Set(allCategoryValues)];

      if (uniqueCategories.length === 0) {
        this.addDiagnostic('no_categories_found', 'error', 'No product categories found in database', {
          table: 'ozon_data',
          fields_checked: ['category_level1'],
          suggestion: 'Import OZON data with valid category information first'
        });
        
        return {
          categories: [],
          total: 0,
          diagnostics: this.diagnostics
        };
      } else {
        this.addDiagnostic('scan_complete', 'success', `Product categories found: ${uniqueCategories.length} categories detected`, {
          table: 'ozon_data',
          categories: uniqueCategories.slice(0, 5)
        });

        const result = {
          categories: uniqueCategories,
          total: uniqueCategories.length,
          diagnostics: this.diagnostics
        };

        this.addDiagnostic('categories_ready', 'info', 'Categories ready for analysis', {
          table: 'ozon_data', 
          categories: result.categories
        });

        return result;
      }

    } catch (error) {
      this.addDiagnostic('critical_failure', 'error', 'Category scan failed', {
        table: 'ozon_data',
        error: error instanceof Error ? error.message : 'Unknown system malfunction'
      });
      
      return {
        categories: [],
        total: 0,
        diagnostics: this.diagnostics
      };
    }
  }

  async analyzeSuppliers() {
    try {
      const { data, error } = await supabaseAdmin
        .from('ozon_data')
        .select('seller')
        .not('seller', 'is', null)
        .neq('seller', '');

      if (error) throw error;

      const supplierCounts: { [key: string]: number } = {};
      data?.forEach(product => {
        if (product.seller) {
          supplierCounts[product.seller] = (supplierCounts[product.seller] || 0) + 1;
        }
      });

      const sortedSuppliers = Object.entries(supplierCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      return sortedSuppliers;
    } catch (error) {
      console.error('Error analyzing suppliers:', error);
      return [];
    }
  }

  async getAnalysisResults(): Promise<ProductGroup[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('ai_product_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading analysis results:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAnalysisResults:', error);
      return [];
    }
  }

  async getAnalysisStats() {
    try {
      const { data: groups, error: groupsError } = await supabaseAdmin
        .from('ai_product_groups')
        .select('confidence_score, category, created_at');

      if (groupsError) {
        console.error('Error loading analysis stats:', groupsError);
        return {
          total_groups: 0,
          categories_analyzed: 0,
          avg_confidence: 0,
          last_analysis: 'Never'
        };
      }

      const totalGroups = groups?.length || 0;
      const categoriesAnalyzed = [...new Set(groups?.map(g => g.category))].length;
      const avgConfidence = groups?.length ? 
        Math.round((groups.reduce((sum, g) => sum + (g.confidence_score || 0), 0) / groups.length) * 100) : 0;
      
      const lastAnalysis = groups?.length && groups[0]?.created_at ? 
        new Date(groups[0].created_at).toLocaleDateString() : 'Never';

      return {
        total_groups: totalGroups,
        categories_analyzed: categoriesAnalyzed,
        avg_confidence: avgConfidence,
        last_analysis: lastAnalysis
      };
    } catch (error) {
      console.error('Error in getAnalysisStats:', error);
      return {
        total_groups: 0,
        categories_analyzed: 0,
        avg_confidence: 0,
        last_analysis: 'Error'
      };
    }
  }

  async clearCategoryAnalysis(category: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('ai_product_groups')
        .delete()
        .eq('category', category);

      if (error) {
        throw error;
      }

      this.addDiagnostic('category_purged', 'success', `Analysis data purged for category: ${category}`, {
        category
      });
    } catch (error) {
      this.addDiagnostic('purge_failed', 'error', `Failed to purge category analysis: ${category}`, {
        category,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async analyzeCategory(category: string) {
    try {
      this.addDiagnostic('ai_analysis_start', 'loading', `Starting AI analysis for category: ${category}`);

      // First get total count for this category (including inactive products)
      const { count: totalCount, error: countError } = await supabaseAdmin
        .from('ozon_data')
        .select('*', { count: 'exact', head: true })
        .eq('category_level1', category);

      if (countError) {
        throw countError;
      }

      this.addDiagnostic('category_count', 'info', `Found ${totalCount} products in category: ${category}`, {
        category,
        total_count: totalCount
      });

      // Get ALL products for this category (remove is_active filter)
      const { data: products, error: queryError } = await supabaseAdmin
        .from('ozon_data')
        .select('product_name, average_price, seller, category_level1')
        .eq('category_level1', category);

      if (queryError) {
        throw queryError;
      }

      this.addDiagnostic('category_data_loaded', 'info', `Loaded ${products?.length || 0} products for analysis`, {
        category,
        products_loaded: products?.length || 0,
        details: {
          category,
          product_count: products?.length || 0,
          unique_sellers: [...new Set(products?.map(p => p.seller).filter(Boolean))].length,
          sellers_list: [...new Set(products?.map(p => p.seller).filter(Boolean))],
          sample_products: products?.slice(0, 3).map(p => ({
            name: p.product_name?.slice(0, 50) + '...',
            price: p.average_price,
            seller: p.seller
          }))
        }
      });

      // Call AI analysis
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-products`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category,
            products: products || []
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        this.addDiagnostic('ai_analysis_failed', 'error', `AI analysis failed: ${result.error}`, {
          category,
          products_count: products?.length || 0
        });
        
        if (result.error.includes('API key')) {
          alert(`⚠️ AI Configuration Required\n\n${result.error}\n\nConfigure OPENAI_API_KEY in your Supabase Edge Function settings.`);
        }
        
        return {
          success: false,
          error: result.error,
          diagnostics: this.diagnostics
        };
      } else {
        this.addDiagnostic('ai_analysis_success', 'success', `AI analysis completed successfully`, {
          category,
          groups_found: result.analysis?.product_groups?.length || 0
        });
        
        return {
          success: true,
          groups_created: result.analysis?.product_groups?.length || 0,
          analysis_confidence: result.analysis?.confidence || 0,
          diagnostics: this.diagnostics
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.addDiagnostic('critical_ai_failure', 'error', 'AI system error detected', {
        category,
        error: errorMessage
      });

      if (errorMessage.includes('fetch')) {
        alert(`⚠️ AI Service Unavailable\n\n${errorMessage}\n\nConfigure OpenAI API key in Supabase Edge Function settings.`);
      } else {
        alert(`AI Analysis Error: ${errorMessage}`);
      }
      
      return {
        success: false,
        error: errorMessage,
        diagnostics: this.diagnostics
      };
    }
  }

  getDiagnostics() {
    return this.diagnostics;
  }

  clearDiagnostics() {
    this.diagnostics = [];
  }
}

export const productAnalysisService = new ProductAnalysisService();

interface CEODashboardProps {
  onBack: () => void;
}

const CEODashboard: React.FC<CEODashboardProps> = ({ onBack }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Demo data - will be replaced with real data later
  const kpiData: KPIData = {
    totalRevenue: 3906946,
    topProductsShare: 94.04,
    majorClientsShare: 80.3,
    averageProductMargin: 39.2
  };

  const topClients: Client[] = [
    { id: '1', name: 'Интернет Решения', sales: 850323, growth: 44, industry: 'E-commerce' },
    { id: '2', name: 'Бердандер', sales: 384399, growth: 42, industry: 'Manufacturing' },
    { id: '3', name: 'Руссблaнкоиздат', sales: 381484, growth: 43, industry: 'Publishing' },
    { id: '4', name: 'Хаскел/Мерлион', sales: 240359, growth: 44, industry: 'Technology' },
    { id: '5', name: 'ВсеИнструменты.ру', sales: 239115, growth: 39, industry: 'E-commerce' },
    { id: '6', name: 'АРВАДА', sales: 192300, growth: 24, industry: 'Retail' },
    { id: '7', name: 'ДНС Ритейл', sales: 164424, growth: 44, industry: 'Electronics' },
    { id: '8', name: 'ОнЛайн Трейд', sales: 164407, growth: 38, industry: 'E-commerce' },
    { id: '9', name: 'Компсервис', sales: 134523, growth: 40, industry: 'IT Services' },
    { id: '10', name: 'АЛЬФАПРИНТ МЕНЕДЖМЕНТ', sales: 130450, growth: 44, industry: 'Printing' },
    { id: '11', name: 'Мишин Александр Николаевич ИП', sales: 76356, growth: 44, industry: 'Individual' },
    { id: '12', name: 'Сибирский успех', sales: 66374, growth: 44, industry: 'Regional' },
    { id: '13', name: 'Павлов Николай Александрович ИП', sales: 59917, growth: 43, industry: 'Individual' },
    { id: '14', name: 'Триовист', sales: 53876, growth: 33, industry: 'Consulting' }
  ];

  const topProducts: Product[] = [
    { id: '1', name: 'Уничтожители Office Kit', category: 'Office Equipment', sales: 1840810, units: 0, growth: 44.28 },
    { id: '2', name: 'Пленка в пакетах', category: 'Packaging', sales: 839463, units: 0, growth: 35.26 },
    { id: '3', name: 'Ламинаторы пакетные', category: 'Office Equipment', sales: 270118, units: 0, growth: 39.83 },
    { id: '4', name: 'Переплет (Renz?)', category: 'Binding', sales: 268723, units: 0, growth: 42.78 },
    { id: '5', name: 'Переплетчики Office Kit', category: 'Office Equipment', sales: 246391, units: 0, growth: 41.81 },
    { id: '6', name: 'Уничтожители HSM офисное', category: 'Office Equipment', sales: 118939, units: 0, growth: 39.21 },
    { id: '7', name: 'Пружины', category: 'Binding', sales: 89487, units: 0, growth: 31.01 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    const percentage = (value / total) * 100;
    return percentage.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%), 
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Imperial Command Header */}
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300 relative">
                  <Crown className="w-6 h-6 text-black" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-black"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    IMPERIAL COMMAND CENTER
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    Real-time Strategic Overview
                  </p>
                  <p className="text-teal-300 text-sm font-mono">EMPIRE: ОФИС-КИТ</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-2">
                <p className="text-xl font-bold text-cyan-300 font-mono">
                  {currentTime.toLocaleTimeString()}
                </p>
                <p className="text-cyan-400/80 font-mono text-sm">
                  {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Resource Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                <DollarSign className="w-4 h-4 text-black" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Imperial Treasury</h3>
            <p className="text-lg font-bold text-emerald-300 font-mono">{formatCurrency(kpiData.totalRevenue)}</p>
            <p className="text-emerald-400/60 text-xs font-mono">Credits Generated</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                <Package className="w-4 h-4 text-black" />
              </div>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Top 7 Resources</h3>
            <p className="text-lg font-bold text-emerald-300 font-mono">{kpiData.topProductsShare}%</p>
            <p className="text-emerald-400/60 text-xs font-mono">Revenue Share</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg border border-purple-300">
                <Users className="w-4 h-4 text-black" />
              </div>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Major 14 Factions</h3>
            <p className="text-lg font-bold text-purple-300 font-mono">{kpiData.majorClientsShare}%</p>
            <p className="text-purple-400/60 text-xs font-mono">Trade Influence</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                <Activity className="w-4 h-4 text-black" />
              </div>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Avg Efficiency</h3>
            <p className="text-lg font-bold text-blue-300 font-mono">{kpiData.averageProductMargin}%</p>
            <p className="text-blue-400/60 text-xs font-mono">Resource Yield</p>
          </div>
        </div>

        {/* Strategic Intelligence Panels */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          
          {/* Major Trade Factions */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-blue-400/30 text-blue-400 text-xs px-2 py-1 rounded font-mono">
                TRADE-01
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                <Users className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">MAJOR TRADE FACTIONS</h2>
                <p className="text-cyan-400/80 text-sm font-mono">Strategic Partnership Analysis</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div
                  key={client.id}
                  className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-4 hover:border-cyan-400/40 hover:bg-gray-800/60 transition-all duration-200 relative"
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-500 rounded-l-lg"></div>
                  
                  <div className="flex items-start gap-3 ml-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-black font-bold text-xs shadow-lg flex-shrink-0 border border-indigo-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-semibold text-cyan-300 text-sm leading-tight font-mono">
                        {client.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-gray-700/50 border border-cyan-400/30 text-cyan-400 px-2 py-1 rounded font-mono">
                          {client.industry}
                        </span>
                        <span className="text-cyan-400/60 font-mono">•</span>
                        <span className="text-cyan-300 font-mono">{formatPercentage(client.sales, kpiData.totalRevenue)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-cyan-300 text-sm font-mono">
                          {formatCurrency(client.sales)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-1 rounded">
                            +{client.growth}%
                          </span>
                          <ChevronRight className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-emerald-400/30 text-emerald-400 text-xs px-2 py-1 rounded font-mono">
                RES-01
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                <Package className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-cyan-300 font-mono tracking-wide">TOP PRODUCTS</h2>
                <p className="text-cyan-400/80 text-sm font-mono">Top Performing Products</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-gray-800/40 border border-cyan-400/20 rounded-lg p-4 hover:border-cyan-400/40 hover:bg-gray-800/60 transition-all duration-200 relative"
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-lg"></div>
                  
                  <div className="flex items-start gap-3 ml-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-black font-bold text-xs shadow-lg flex-shrink-0 border border-emerald-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-semibold text-cyan-300 text-sm leading-tight font-mono">
                        {product.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-gray-700/50 border border-cyan-400/30 text-cyan-400 px-2 py-1 rounded font-mono">
                          {product.category}
                        </span>
                        <span className="text-cyan-400/60 font-mono">•</span>
                        <span className="text-cyan-300 font-mono">{formatPercentage(product.sales, kpiData.totalRevenue)}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-cyan-300 text-sm font-mono">
                          {formatCurrency(product.sales)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-1 rounded">
                            +{product.growth.toFixed(1)}%
                          </span>
                          <ChevronRight className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Command Status */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-300 font-mono font-bold text-sm">EXECUTIVE DASHBOARD ACTIVE</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400/80 font-mono text-sm">REAL-TIME ANALYTICS</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-emerald-400 font-mono text-sm">ORGANIZATION: ОФИС-КИТ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;