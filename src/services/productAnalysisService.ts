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
  static async analyzeCategory(category: string): Promise<AnalysisResult> {
    try {
      // 1. Get all products for this category
      const { data: products, error: queryError } = await supabaseAdmin
        .from('products')
        .select('name, price, supplier, category_name') // Updated column names
        .eq('category', category)
        .eq('is_active', true);

      if (queryError) {
        throw new Error(`Failed to fetch products: ${queryError.message}`);
      }

      if (!products || products.length === 0) {
        return {
          success: false,
          category,
          groups_created: 0,
          ungrouped_products: 0,
          analysis_confidence: 0,
          data: [],
          error: `No active products found in category: ${category}`
        };
      }

      // 2. Call edge function for AI analysis
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-products`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          products
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(errorData.error || `Analysis API error: ${response.status} ${response.statusText}`);
      }

      const result: AnalysisResult = await response.json();
      return result;

    } catch (error) {
      console.error('Product analysis service error:', error);
      return {
        success: false,
        category,
        groups_created: 0,
        ungrouped_products: 0,
        analysis_confidence: 0,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
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
      // 1. Check database connection details
      diagnostics.push({
        step: 'db_config',
        status: 'info',
        message: 'Database configuration check...',
        details: {
          supabase_url: import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL.slice(0, 30)}...` : 'NOT SET',
          anon_key_available: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          service_key_available: !!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
          using_client_type: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'ADMIN (service_role)' : 'REGULAR (anon)'
        }
      });
      
      // 2. Test raw connection with COUNT
      diagnostics.push({
        step: 'count_test',
        status: 'info',
        message: 'Testing basic table access with COUNT(*)...',
      });

      const { count, error: countError } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        diagnostics.push({
          step: 'count_error',
          status: 'error',
          message: 'COUNT query failed - table access blocked',
          details: { 
            error_message: countError.message,
            error_code: countError.code,
            error_hint: countError.hint,
            possible_causes: [
              'Wrong database URL',
              'Invalid service role key', 
              'Table does not exist',
              'RLS policy blocking admin access'
            ]
          }
        });
        return { categories: [], diagnostics };
      }

      diagnostics.push({
        step: 'count_result',
        status: count > 0 ? 'success' : 'error',
        message: `TABLE: products contains ${count} total rows`,
        details: { total_products: count }
      });

      if (count === 0) {
        diagnostics.push({
          step: 'empty_table',
          status: 'error',
          message: 'Table is completely empty - no products imported yet',
          details: { 
            action_needed: 'Import products data first',
            table: 'products'
          }
        });
        return { categories: [], diagnostics };
      }

      // 3. Test sample query with SELECT
      diagnostics.push({
        step: 'sample_query',
        status: 'info',
        message: 'Querying sample products with SELECT...',
      });
      
      // Try different SELECT approaches to diagnose the exact issue
      let sampleData = null;
      let sampleError = null;
      
      // Test 1: Simple SELECT with just ID
      diagnostics.push({
        step: 'test_simple_select',
        status: 'info',
        message: 'Testing simple SELECT id only...'
      });
      
      const { data: idTest, error: idError } = await supabaseAdmin
        .from('products')
        .select('id')
        .limit(3);

      if (idError) {
        diagnostics.push({
          step: 'simple_select_error',
          status: 'error', 
          message: 'Even simple SELECT id failed',
          details: {
            error_message: idError.message,
            error_code: idError.code,
            error_hint: idError.hint,
            error_details: idError.details
          }
        });
        sampleError = idError;
      } else {
        diagnostics.push({
          step: 'simple_select_result',
          status: idTest?.length > 0 ? 'success' : 'error',
          message: `Simple SELECT returned ${idTest?.length || 0} IDs`,
          details: { ids: idTest?.map(p => p.id.slice(0, 8) + '...') }
        });
        
        if (idTest?.length > 0) {
          // Test 2: Full field SELECT if simple works
          diagnostics.push({
            step: 'test_full_select',
            status: 'info',
            message: 'Testing full field SELECT...'
          });
          
          const { data: fullData, error: fullError } = await supabaseAdmin
            .from('products')
            .select('id, name, category, category_name, supplier, price, is_active')
            .limit(3);
            
          if (fullError) {
            diagnostics.push({
              step: 'full_select_error',
              status: 'error',
              message: 'Full field SELECT failed',
              details: {
                error_message: fullError.message,
                error_code: fullError.code,
                issue: 'Specific column access blocked by RLS policy'
              }
            });
            sampleError = fullError;
          } else {
            sampleData = fullData;
            diagnostics.push({
              step: 'full_select_success',
              status: 'success',
              message: `Full SELECT returned ${fullData?.length || 0} products`
            });
          }
        } else {
          sampleError = { message: 'Simple SELECT returned empty despite COUNT > 0' };
        }
      }

      if (sampleError) {
        diagnostics.push({
          step: 'sample_error',
          status: 'error',
          message: 'All SELECT queries failed with admin client',
          details: { 
            error_message: sampleError.message, 
            code: sampleError.code,
            hint: sampleError.hint,
            count_works_but_select_fails: true,
            diagnosis: sampleError.code === '42501' ? 'RLS policy specifically blocking SELECT operations for service role' : 'Service role misconfiguration or RLS policy issue',
            solution: 'Check RLS policies on products table - they may be blocking service role SELECT operations'
          }
        });
        return { categories: [], diagnostics };
      }

      diagnostics.push({
        step: 'sample_data',
        status: sampleData?.length > 0 ? 'success' : 'error',
        message: `Final result: Retrieved ${sampleData?.length || 0} products from TABLE: products`,
        details: {
          sample_data: sampleData?.map(p => ({
            id: p.id.slice(0, 8) + '...',
            name: p.name?.slice(0, 30) + (p.name && p.name.length > 30 ? '...' : ''),
            category: p.category,
            category_name: p.category_name,
            supplier: p.supplier,
            price: p.price
          })) || []
        }
      });
      
      if (!sampleData || sampleData.length === 0) {
        diagnostics.push({
          step: 'select_empty',
          status: 'error',
          message: 'SELECT returned empty result despite COUNT > 0',
          details: { 
            issue: 'This suggests a configuration problem - COUNT shows data exists but SELECT cannot retrieve it',
            check: 'Verify service role key and database URL are correct'
          }
        });
        return { categories: [], diagnostics };
      }

      // 4. Analyze category columns
      const categoryAnalysis = {
        sample_size: sampleData.length,
        category_field: {
          null_count: sampleData.filter(p => p.category === null).length,
          empty_count: sampleData.filter(p => p.category === '').length,
          valid_count: sampleData.filter(p => p.category && p.category.trim() !== '').length,
          unique_values: [...new Set(sampleData.map(p => p.category).filter(c => c && c.trim() !== ''))]
        },
        category_name_field: {
          null_count: sampleData.filter(p => p.category_name === null).length,
          empty_count: sampleData.filter(p => p.category_name === '').length,
          valid_count: sampleData.filter(p => p.category_name && p.category_name.trim() !== '').length,
          unique_values: [...new Set(sampleData.map(p => p.category_name).filter(c => c && c.trim() !== ''))]
        }
      };
      
      diagnostics.push({
        step: 'category_analysis',
        status: 'success',
        message: 'Category columns analysis completed',
        details: categoryAnalysis
      });

      // 5. Get all categories from both columns
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('category, category_name');

      if (error) {
        diagnostics.push({
          step: 'full_category_query_error',
          status: 'error',
          message: 'Failed to fetch all category data',
          details: { error: error.message, code: error.code }
        });
        return { categories: [], diagnostics };
      }
      
      // Combine categories from both columns
      const allCategoryValues = [
        ...data?.map(p => p.category).filter(c => c && c.trim() !== '') || [],
        ...data?.map(p => p.category_name).filter(c => c && c.trim() !== '') || []
      ];
      
      const uniqueCategories = [...new Set(allCategoryValues)];
      
      diagnostics.push({
        step: 'final_categories',
        status: 'success',
        message: `Found ${uniqueCategories.length} unique categories from both columns`,
        details: {
          from_category_column: [...new Set(data?.map(p => p.category).filter(c => c && c.trim() !== '') || [])],
          from_category_name_column: [...new Set(data?.map(p => p.category_name).filter(c => c && c.trim() !== '') || [])],
          final_categories: uniqueCategories
        }
      });
      
      return { categories: uniqueCategories, diagnostics };

    } catch (error) {
      diagnostics.push({
        step: 'exception',
        status: 'error',
        message: 'Unexpected error during category retrieval',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return { categories: [], diagnostics };
    }
  }

  /**</action>
        diagnostics.push({
          step: 'no_valid_categories',
          status: 'error',
          message: 'No products with non-null categories found',
          details: { 
            issue: 'All category values appear to be NULL',
            suggestion: 'Check your import process - category column should contain values like "Office Equipment", "Packaging", etc.'
          }
        });
        return { categories: [], diagnostics };
      }

      const allCategories = data.map(p => p.category);
      
      diagnostics.push({
        step: 'raw_categories',
        status: 'info',
        message: `Raw category values (first 20 of ${allCategories.length})`,
        details: { 
          raw_values: allCategories.slice(0, 20),
          total_raw: allCategories.length
        }
      });
      
      // Get unique categories and filter empties
      const uniqueCategories = [...new Set(allCategories)];
      const filteredCategories = uniqueCategories.filter(cat => cat && cat.trim() !== '');
      
      diagnostics.push({
        step: 'category_filtering',
        status: 'info',
        message: 'Category filtering completed',
        details: {
          unique_before_filter: uniqueCategories,
          valid_after_filter: filteredCategories,
          total_unique: uniqueCategories.length,
          total_valid: filteredCategories.length
        }
      });
      
      if (filteredCategories.length === 0) {
        diagnostics.push({
          step: 'final_result',
          status: 'error',
          message: 'No valid categories after filtering',
          details: { 
            issue: 'All categories are either NULL, empty strings, or whitespace only',
            found_values: uniqueCategories,
            suggestion: 'Your import data needs to have proper category values'
          }
        });
      } else {
        diagnostics.push({
          step: 'final_result',
          status: 'success',
          message: `Successfully found ${filteredCategories.length} valid categories`,
          details: { categories: filteredCategories }
        });
      }
      
      return { categories: filteredCategories, diagnostics };

    } catch (error) {
      diagnostics.push({
        step: 'exception',
        status: 'error',
        message: 'Exception occurred during category retrieval',
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
      let query = supabase
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
      const { error } = await supabase
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
      const { data, error } = await supabase
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