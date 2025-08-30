import { supabase, supabaseAdmin } from '../lib/supabase';

export interface ProductGroup {
  id: string;
  category: string;
  group_name: string;
  group_description: string;
  product_names: string[];
  price_analysis: {
    min_price: number;
    max_price: number;
    avg_price: number;
    price_variance: string;
    outliers: string[];
  };
  confidence_score: number;
  vendor_analysis: {
    vendor_count: number;
    vendors: string[];
  };
  created_at: string;
}

export interface AnalysisResult {
  success: boolean;
  category: string;
  groups_created: number;
  ungrouped_products: number;
  analysis_confidence: number;
  data: ProductGroup[];
  error?: string;
}

export class ProductAnalysisService {
  
  /**
   * Analyze products in a specific category using AI
   * Processes one category at a time as requested
   */
  static async analyzeCategory(category: string): Promise<AnalysisResult & { diagnostics?: any[] }> {
    const diagnostics: any[] = [];
    
    try {
      diagnostics.push({
        step: 'start',
        status: 'info',
        message: `Starting AI analysis for category: ${category}`,
        timestamp: new Date().toISOString()
      });
      
      // Immediately check what env vars are available
      diagnostics.push({
        step: 'env_raw_check',
        status: 'info',
        message: 'Raw environment variable check',
        details: {
          import_meta_env: import.meta.env,
          supabase_url_raw: import.meta.env.VITE_SUPABASE_URL,
          anon_key_raw: import.meta.env.VITE_SUPABASE_ANON_KEY,
          all_vite_vars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
        }
      });
      
      // Check required environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      diagnostics.push({
        step: 'env_vars_extracted',
        status: 'info',
        message: 'Environment variables extracted',
        details: {
          supabase_url_type: typeof supabaseUrl,
          supabase_url_length: supabaseUrl?.length,
          supabase_url_value: supabaseUrl,
          anon_key_type: typeof supabaseAnonKey,
          anon_key_length: supabaseAnonKey?.length,
          openai_key_type: typeof openaiKey,
          openai_key_present: !!openaiKey
        }
      });

      if (!supabaseUrl) {
        diagnostics.push({
          step: 'env_check',
          status: 'error',
          message: 'VITE_SUPABASE_URL is missing',
          details: { env_vars_checked: ['VITE_SUPABASE_URL'] }
        });
        return {
          success: false,
          category: category,
          groups_created: 0,
          ungrouped_products: 0,
          analysis_confidence: 0,
          data: [],
          error: 'VITE_SUPABASE_URL environment variable is not defined. Please check your .env file.',
          diagnostics
        };
      }

      if (!supabaseAnonKey) {
        diagnostics.push({
          step: 'env_check',
          status: 'error',
          message: 'VITE_SUPABASE_ANON_KEY is missing',
          details: { env_vars_checked: ['VITE_SUPABASE_ANON_KEY'] }
        });
        return {
          success: false,
          category: category,
          groups_created: 0,
          ungrouped_products: 0,
          analysis_confidence: 0,
          data: [],
          error: 'VITE_SUPABASE_ANON_KEY environment variable is not defined. Please check your .env file.',
          diagnostics
        };
      }

      // Validate Supabase URL format
      try {
        new URL(supabaseUrl);
      } catch (urlError) {
        diagnostics.push({
          step: 'env_check',
          status: 'error',
          message: 'VITE_SUPABASE_URL is not a valid URL',
          details: { 
            provided_url: supabaseUrl,
            url_error: urlError instanceof Error ? urlError.message : 'Invalid URL format'
          }
        });
        return {
          success: false,
          category: category,
          groups_created: 0,
          ungrouped_products: 0,
          analysis_confidence: 0,
          data: [],
          error: `VITE_SUPABASE_URL is not a valid URL: ${supabaseUrl}`,
          diagnostics
        };
      }
      
      diagnostics.push({
        step: 'env_check',
        status: 'success',
        message: 'Environment variables validated',
        details: {
          supabase_url: supabaseUrl?.slice(0, 30) + '...',
          full_supabase_url: supabaseUrl,
          anon_key_present: !!supabaseAnonKey,
          openai_key_present: !!openaiKey
        }
      });

      // 1. Get all products for this category
      diagnostics.push({
        step: 'fetch_products',
        status: 'loading',
        message: `Fetching products for category: ${category}`
      });
      
      const { data: products, error: queryError } = await supabaseAdmin
        .from('products')
        .select('name, price, supplier, category_name')
        .eq('category_name', category)
        .eq('is_active', true);

      if (queryError) {
        diagnostics.push({
          step: 'fetch_products',
          status: 'error',
          message: 'Failed to fetch products from database',
          details: {
            category,
            error: queryError.message,
            code: queryError.code
          }
        });
        throw new Error(`Failed to fetch products: ${queryError.message}`);
      }

      if (!products || products.length === 0) {
        diagnostics.push({
          step: 'fetch_products',
          status: 'error',
          message: 'No products found for category',
          details: {
            category,
            product_count: 0
          }
        });
        return {
          success: false,
          category,
          groups_created: 0,
          ungrouped_products: 0,
          analysis_confidence: 0,
          data: [],
          error: `No active products found in category: ${category}`,
          diagnostics
        };
      }
      
      diagnostics.push({
        step: 'fetch_products',
        status: 'success',
        message: `Successfully fetched ${products.length} products`,
        details: {
          category,
          product_count: products.length,
          sample_products: products.slice(0, 3).map(p => ({
            name: p.name?.slice(0, 50) + '...',
            price: p.price,
            supplier: p.supplier
          }))
        }
      });

      // 2. Call edge function for AI analysis
      diagnostics.push({
        step: 'prepare_api_call',
        status: 'loading',
        message: 'Preparing Edge Function API call'
      });
      
      const functionUrl = `${supabaseUrl}/functions/v1/analyze-products`;
      
      // Validate the constructed function URL
      try {
        new URL(functionUrl);
      } catch (urlError) {
        diagnostics.push({
          step: 'prepare_api_call',
          status: 'error',
          message: 'Constructed function URL is invalid',
          details: {
            constructed_url: functionUrl,
            supabase_url: supabaseUrl,
            url_error: urlError instanceof Error ? urlError.message : 'Invalid URL'
          }
        });
        throw new Error(`Invalid function URL constructed: ${functionUrl}`);
        return {
          success: false,
          category: category,
          groups_created: 0,
          ungrouped_products: 0,
          analysis_confidence: 0,
          data: [],
          error: `Invalid function URL constructed: ${functionUrl}`,
          diagnostics
        };
      }
      
      const requestPayload = {
        category_name: category,
        products
      };
      
      diagnostics.push({
        step: 'prepare_api_call',
        status: 'success',
        message: 'API call prepared',
        details: {
          function_url: functionUrl,
          supabase_url: supabaseUrl,
          payload_size: JSON.stringify(requestPayload).length,
          products_count: products.length
        }
      });
      
      diagnostics.push({
        step: 'call_edge_function',
        status: 'loading',
        message: 'Calling Supabase Edge Function...',
        details: {
          url: functionUrl,
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + supabaseAnonKey?.slice(0, 10) + '...',
            'Content-Type': 'application/json'
          }
        }
      });
      
      const requestStart = Date.now();
      let response: Response;
      
      try {
        response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload)
        });
      } catch (fetchError) {
        const requestEnd = Date.now();
        diagnostics.push({
          step: 'call_edge_function',
          status: 'error',
          message: 'Failed to fetch Edge Function',
          details: {
            fetch_error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
            error_type: fetchError instanceof Error ? fetchError.constructor.name : typeof fetchError,
            function_url: functionUrl,
            supabase_url: supabaseUrl,
            request_duration_ms: requestEnd - requestStart,
            troubleshooting: {
              check_url: 'Verify VITE_SUPABASE_URL in .env file',
              expected_format: 'https://your-project-ref.supabase.co',
              current_url: supabaseUrl
            }
          }
        });
        return {
          success: false,
          category: category,
          groups_created: 0,
          ungrouped_products: 0,
          analysis_confidence: 0,
          data: [],
          error: `Calling Supabase Edge Function failed: ${fetchError instanceof Error ? fetchError.message : 'Network error'}`,
          diagnostics
        };
      }
      
      const requestEnd = Date.now();
      
      diagnostics.push({
        step: 'call_edge_function',
        status: response.ok ? 'success' : 'error',
        message: `Edge Function responded with status ${response.status}`,
        details: {
          status: response.status,
          status_text: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          request_duration_ms: requestEnd - requestStart,
          response_url: response.url,
          response_type: response.type
        }
      });

      if (!response.ok) {
        diagnostics.push({
          step: 'parse_error_response',
          status: 'loading',
          message: 'Parsing error response from Edge Function'
        });
        
        let errorData;
        try {
          const errorText = await response.text();
          diagnostics.push({
            step: 'error_response_text',
            status: 'info',
            message: 'Raw error response from Edge Function',
            details: {
              raw_text: errorText,
              text_length: errorText.length
            }
          });
          
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          errorData = { 
            error: 'Failed to parse error response',
            parse_error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
            raw_response: errorText || 'No response text'
          };
        }
        
        diagnostics.push({
          step: 'parse_error_response',
          status: 'error',
          message: 'Edge Function returned error',
          details: {
            status: response.status,
            error_data: errorData,
            parsed_successfully: typeof errorData === 'object'
          }
        });
        
        throw new Error(errorData.error || `Analysis API error: ${response.status} ${response.statusText}`);
      }

      diagnostics.push({
        step: 'parse_success_response',
        status: 'loading',
        message: 'Parsing successful response from Edge Function'
      });
      
      let result: AnalysisResult;
      try {
        const responseText = await response.text();
        diagnostics.push({
          step: 'success_response_text',
          status: 'info',
          message: 'Raw success response from Edge Function',
          details: {
            raw_text: responseText.slice(0, 1000) + (responseText.length > 1000 ? '...[truncated]' : ''),
            full_length: responseText.length,
            starts_with: responseText.slice(0, 100),
            ends_with: responseText.slice(-100)
          }
        });
        
        result = JSON.parse(responseText);
        
        diagnostics.push({
          step: 'response_parsed',
          status: 'success',
          message: 'Successfully parsed Edge Function response',
          details: {
            response_keys: Object.keys(result),
            has_diagnostics: !!(result as any).diagnostics,
            diagnostics_count: (result as any).diagnostics?.length || 0
          }
        });
        
      } catch (parseError) {
        diagnostics.push({
          step: 'parse_success_response',
          status: 'error',
          message: 'Failed to parse success response',
          details: {
            parse_error: parseError instanceof Error ? parseError.message : 'Unknown error',
            response_type: typeof responseText,
            response_preview: responseText?.slice(0, 200)
          }
        });
        throw new Error(`Failed to parse success response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      // Merge Edge Function diagnostics with our own
      if ((result as any).diagnostics && Array.isArray((result as any).diagnostics)) {
        diagnostics.push({
          step: 'merge_diagnostics',
          status: 'info',
          message: `Merging ${(result as any).diagnostics.length} diagnostics from Edge Function`,
          details: {
            edge_function_diagnostics: (result as any).diagnostics.length,
            frontend_diagnostics: diagnostics.length
          }
        });
        
        // Add Edge Function diagnostics to our diagnostics array
        diagnostics.push(...(result as any).diagnostics);
      }
      
      diagnostics.push({
        step: 'parse_success_response',
        status: 'success',
        message: 'Successfully parsed Edge Function response',
        details: {
          success: result.success,
          groups_created: result.groups_created,
          analysis_confidence: result.analysis_confidence
        }
      });
      
      // Add diagnostics to result
      result.diagnostics = diagnostics;
      return result;

    } catch (error) {
      diagnostics.push({
        step: 'error',
        status: 'error',
        message: 'Analysis failed with exception',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          error_type: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack : undefined
        }
      });
      
      console.error('Product analysis service error:', error);
      return {
        success: false,
        category: category,
        groups_created: 0,
        ungrouped_products: 0,
        analysis_confidence: 0,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        diagnostics
      };
    }
  }

  /**
   * Get all available product categories for analysis
   */
  static async getCategories(): Promise<{
    categories: string[];
    diagnostics: Array<{
      step: string;
      status: 'success' | 'error' | 'info';
      message: string;
      details?: any;
    }>;
  }> {
    const diagnostics: Array<{ step: string; status: 'success' | 'error' | 'info'; message: string; details?: any }> = [];
    
    try {
      // 1. Get count of all products
      const { count, error: countError } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        diagnostics.push({
          step: 'connection_error',
          status: 'error',
          message: 'Database connection failed',
          details: { error: countError.message }
        });
        return { categories: [], diagnostics };
      }

      diagnostics.push({
        step: 'connection',
        status: 'success',
        message: `TABLE: products contains ${count} total rows`,
      });

      // 2. Test query - get sample data first
      const { data: sampleData, error: sampleError } = await supabaseAdmin
        .from('products')
        .select('id, category_name, supplier')
        .limit(10);

      if (sampleError) {
        diagnostics.push({
          step: 'sample_query_error',
          status: 'error',
          message: 'Failed to fetch sample data',
          details: { error: sampleError.message }
        });
        return { categories: [], diagnostics };
      }

      diagnostics.push({
        step: 'sample_data',
        status: 'success',
        message: `Sample data retrieved: ${sampleData?.length || 0} rows`,
        details: {
          sample: sampleData?.map(row => ({
            id: row.id?.slice(0, 8),
            category_name: row.category_name,
            supplier: row.supplier
          }))
        }
      });

      if (count === 0) {
        diagnostics.push({
          step: 'no_data',
          status: 'error',
          message: 'No products found in database'
        }
        )
      }
      // 3. Get all category_name values
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('category_name')
        .not('category_name', 'is', null)
        .neq('category_name', '')
        .order('category_name');

      // Use a direct SQL query to get DISTINCT categories
      const { data: distinctData, error: distinctError } = await supabaseAdmin
        .rpc('get_distinct_categories');

      // If RPC doesn't work, fall back to processing the data manually
      const categoryData = distinctError ? data : distinctData;
      const finalError = distinctError ? error : distinctError;

      if (finalError && error) {
        diagnostics.push({
          step: 'query_error',
          status: 'error',
          message: 'Failed to fetch categories',
          details: { error: finalError?.message || error.message }
        });
        return { categories: [], diagnostics };
        return { categories: [], diagnostics };
      }
      
      diagnostics.push({
        step: 'raw_query_result',
        status: 'info',
        message: `Query returned ${categoryData?.length || 0} rows`,
        details: {
          first_10_results: categoryData?.slice(0, 10).map(row => 
            typeof row === 'string' ? row : row.category_name
          )
        }
      });
      
      const allCategoryValues = categoryData?.map(p => 
        typeof p === 'string' ? p : p.category_name
      ).filter(c => c && c.trim() !== '') || [];
      const uniqueCategories = [...new Set(allCategoryValues)];
      
      diagnostics.push({
        step: 'processing_result',
        status: 'info',
        message: `Processed ${allCategoryValues.length} category values into ${uniqueCategories.length} unique categories`,
        details: {
          all_values_count: allCategoryValues.length,
          unique_categories: uniqueCategories,
          sample_raw_values: allCategoryValues.slice(0, 10)
        }
      });

      diagnostics.push({
        step: 'final_categories',
        status: 'success',
        message: `Found ${uniqueCategories.length} unique categories`,
        details: {
          categories: uniqueCategories
        }
      });
      
      return { categories: uniqueCategories, diagnostics };

    } catch (error) {
      diagnostics.push({
        step: 'error',
        status: 'error',
        message: 'Unexpected error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return { categories: [], diagnostics };
    }
  }

  /**
   * Get existing AI analysis results for a category
   */
  static async getAnalysisResults(category?: string): Promise<ProductGroup[]> {
    try {
      let query = supabaseAdmin
        .from('ai_product_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch analysis results:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Get analysis results error:', error);
      return [];
    }
  }

  /**
   * Delete analysis results for a category (to re-run analysis)
   */
  static async clearCategoryAnalysis(category: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('ai_product_groups')
        .delete()
        .eq('category', category);

      if (error) {
        console.error('Failed to clear category analysis:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Clear analysis error:', error);
      return false;
    }
  }

  /**
   * Get analysis statistics across all categories
   */
  static async getAnalysisStats() {
    try {
      const { data, error } = await supabaseAdmin
        .from('ai_product_groups')
        .select('category, confidence_score, created_at');

      if (error) {
        console.error('Failed to fetch analysis stats:', error);
        return null;
      }

      const stats = {
        total_groups: data?.length || 0,
        categories_analyzed: new Set(data?.map(g => g.category)).size,
        avg_confidence: data?.length > 0 
          ? (data.reduce((sum, g) => sum + (g.confidence_score || 0), 0) / data.length).toFixed(2)
          : 0,
        last_analysis: data?.length > 0 
          ? new Date(Math.max(...data.map(g => new Date(g.created_at).getTime()))).toLocaleDateString()
          : 'Never'
      };

      return stats;
    } catch (error) {
      console.error('Get analysis stats error:', error);
      return null;
    }
  }
}