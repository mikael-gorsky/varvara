import { supabase } from '../lib/supabase';

export interface ProductAnalysisResult {
  categories: string[];
  error?: string;
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

  onDiagnostic(callback: (diagnostic: DiagnosticMessage) => void) {
    this.diagnosticCallbacks.push(callback);
  }

  async analyzeProductsByCategory(category: string): Promise<any> {
    try {
      this.addDiagnostic('analysis_start', 'loading', `Starting analysis for category: ${category}`);

      // Get the supabaseAdmin client for service role access
      const supabaseAdmin = supabase;

      // First get total count for this category
      const { count: totalCount, error: countError } = await supabaseAdmin
        .from('ozon_data')
        .select('*', { count: 'exact', head: true })
        .eq('category_level1', category);

      if (countError) {
        this.addDiagnostic('count_error', 'error', `Failed to count products: ${countError.message}`);
        return { error: countError.message };
      }

      this.addDiagnostic('count_complete', 'success', `Found ${totalCount} products in category`);

      // Get ALL products for this category
      const { data: products, error: queryError } = await supabaseAdmin
        .from('ozon_data')
        .select('product_name, average_price, seller, category_level1')
        .eq('category_level1', category);

      if (queryError) {
        this.addDiagnostic('query_error', 'error', `Database query failed: ${queryError.message}`);
        return { error: queryError.message };
      }

      if (!products || products.length === 0) {
        this.addDiagnostic('no_products', 'error', `No products found in category: ${category}`);
        return { error: 'No products found' };
      }

      this.addDiagnostic('data_retrieved', 'success', `Retrieved ${products.length} products for analysis`, {
        details: {
          category,
          product_count: products.length,
          unique_sellers: [...new Set(products.map(p => p.seller).filter(Boolean))].length,
          sellers_list: [...new Set(products.map(p => p.seller).filter(Boolean))],
          sample_products: products.slice(0, 3).map(p => ({
            name: p.product_name?.slice(0, 50) + '...',
            price: p.average_price,
            seller: p.seller
          }))
        }
      });

      this.addDiagnostic('ai_analysis_start', 'loading', `Starting AI analysis for category: ${category}`);

      // Call the edge function for AI analysis
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          products: products.map(p => ({
            product_name: p.product_name,
            average_price: p.average_price,
            seller: p.seller
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI analysis failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        this.addDiagnostic('ai_analysis_failed', 'error', `AI analysis failed: ${result.error}`, {
          category,
          product_count: products.length
        });

        if (result.error.includes('API key')) {
          alert(`⚠️ AI Configuration Required\n\n${result.error}\n\nConfigure OPENAI_API_KEY in your Supabase Edge Function settings.`);
        }
        
        return { error: result.error };
      }

      this.addDiagnostic('ai_analysis_success', 'success', `AI analysis completed successfully`, {
        category,
        groups_created: result.groups?.length || 0,
        confidence_score: result.confidence_score
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.addDiagnostic('critical_ai_failure', 'error', 'AI system error detected', {
        table: 'ozon_data',
        error: errorMessage
      });

      if (errorMessage.includes('API key') || errorMessage.includes('OpenAI')) {
        alert(`⚠️ AI Service Unavailable\n\n${errorMessage}\n\nConfigure OpenAI API key in Supabase Edge Function settings.`);
      } else {
        alert(`AI Analysis Error: ${errorMessage}`);
      }

      return { error: errorMessage };
    }
  }

  async getAvailableCategories(): Promise<ProductAnalysisResult> {
    try {
      // 1. Get count of all products
      const { count, error: countError } = await supabase
        .from('ozon_data')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        return { categories: [], error: countError.message };
      }

      this.addDiagnostic('table_scan', 'info', `TABLE: ozon_data contains ${count} total rows`);

      // 2. Test query - get sample data first
      const { data: sampleData, error: sampleError } = await supabase
        .from('ozon_data')
        .select('id, category_level1, seller')
        .limit(10);

      if (sampleError) {
        this.addDiagnostic('sample_error', 'error', 'Failed to retrieve sample data', {
          error: sampleError.message
        });
        return { categories: [], error: sampleError.message };
      }

      this.addDiagnostic('sample_retrieved', 'success', `Sample data retrieved: ${sampleData?.length || 0} rows`, {
        details: {
          sample: sampleData?.map(row => ({
            id: row.id?.slice(0, 8),
            category_level1: row.category_level1,
            seller: row.seller
          }))
        }
      });

      // 3. Get all category_level1 values
      const { data, error } = await supabase
        .from('ozon_data')
        .select('category_level1')
        .not('category_level1', 'is', null)
        .neq('category_level1', '')
        .order('category_level1');

      if (error) {
        return { categories: [], error: error.message };
      }

      const categoryData = data as Array<{ category_level1: string }> | any[];
      
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
        
        return { categories: [], error: 'No categories found' };
      }

      const result = { categories: uniqueCategories };
      
      this.addDiagnostic('scan_complete', 'success', `Product categories found: ${result.categories.length} categories detected`, {
        table: 'ozon_data',
        categories: result.categories
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addDiagnostic('system_error', 'error', 'System error during category scan', {
        table: 'ozon_data',
        error: errorMessage
      });
      return { categories: [], error: errorMessage };
    }
  }

  async testDatabaseConnection(): Promise<boolean> {
    try {
      const { data: testData, error: testError } = await supabase
        .from('ozon_data')
        .select('id')
        .limit(1);

      if (testError) {
        if (testError.message.includes('permission denied') || testError.message.includes('JWT')) {
          this.addDiagnostic('connection_failed', 'error', 'Database connection failed', {
            table: 'ozon_data',
            error: testError.message,
            suggestion: 'Check Supabase configuration and authentication'
          });
          return false;
        }
      }

      this.addDiagnostic('connection_established', 'success', 'Database connection established with OZON_DATA table');
      return true;

    } catch (error) {
      this.addDiagnostic('connection_error', 'error', 'Database connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async getSupplierDistribution() {
    try {
      this.addDiagnostic('data_scan', 'loading', 'Scanning database for product categories...');

      const { data, error } = await supabase
        .from('ozon_data')
        .select('seller')
        .not('seller', 'is', null)
        .neq('seller', '');

      if (error) {
        throw error;
      }

      const supplierCounts: { [key: string]: number } = {};
      data?.forEach(product => {
        if (product.seller) {
          supplierCounts[product.seller] = (supplierCounts[product.seller] || 0) + 1;
        }
      });

      return {
        suppliers: Object.keys(supplierCounts).length,
        distribution: supplierCounts
      };

    } catch (error) {
      console.error('Error getting supplier distribution:', error);
      return { suppliers: 0, distribution: {} };
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