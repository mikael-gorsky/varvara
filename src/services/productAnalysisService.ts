import { supabase, supabaseAdmin } from '../lib/supabase';

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
          total: 0
        };
      } else {
        this.addDiagnostic('scan_complete', 'success', `Product categories found: ${uniqueCategories.length} categories detected`, {
          table: 'ozon_data',
          categories: uniqueCategories.slice(0, 5)
        });

        const result = {
          categories: uniqueCategories,
          total: uniqueCategories.length
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
        total: 0
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
        
        return null;
      } else {
        this.addDiagnostic('ai_analysis_success', 'success', `AI analysis completed successfully`, {
          category,
          groups_found: result.analysis?.product_groups?.length || 0
        });
        
        return result;
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
      
      return null;
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