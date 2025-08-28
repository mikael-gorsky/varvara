import { supabase } from '../lib/supabase';

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
      const { data: products, error: queryError } = await supabase
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
        throw new Error(`Analysis API error: ${response.status} ${response.statusText}`);
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
      diagnostics.push({
        step: 'query_start',
        status: 'info',
        message: 'Querying TABLE: products | FIELDS: id, name, category, category_name, supplier, price, is_active',
      });
      
      // First, get sample of actual data to diagnose category column
      const { data: sampleData, error: sampleError } = await supabase
        .from('products')
        .select('id, name, category, category_name, supplier, price, is_active')
        .limit(10);

      if (sampleError) {
        diagnostics.push({
          step: 'sample_error',
          status: 'error',
          message: 'Failed to query products table',
          details: { error: sampleError.message, code: sampleError.code }
        });
        return { categories: [], diagnostics };
      }

      diagnostics.push({
        step: 'sample_data',
        status: 'success',
        message: `Retrieved ${sampleData?.length || 0} products from TABLE: products`,
        details: {
          table: 'products',
          fields_queried: ['id', 'name', 'category', 'category_name', 'supplier', 'price', 'is_active'],
          sample_data: sampleData?.map(p => ({
            id: p.id.slice(0, 8) + '...',
            name: p.name?.slice(0, 30) + (p.name && p.name.length > 30 ? '...' : ''),
            category: p.category,
            category_name: p.category_name,
            supplier: p.supplier,
            is_active: p.is_active,
            price: p.price
          })) || []
        }
      });
      
      if (!sampleData || sampleData.length === 0) {
        diagnostics.push({
          step: 'no_products',
          status: 'error',
          message: 'No products found in database',
          details: { suggestion: 'Import some products first' }
        });
        return { categories: [], diagnostics };
      }

      // Analyze category values
      const categoryAnalysis = {
        total_sample: sampleData.length,
        null_categories: sampleData.filter(p => p.category === null).length,
        empty_categories: sampleData.filter(p => p.category === '').length,
        valid_categories: sampleData.filter(p => p.category && p.category.trim() !== '').length,
        unique_category_values: [...new Set(sampleData.map(p => p.category).filter(c => c && c.trim() !== ''))]
      };
      
      diagnostics.push({
        step: 'category_analysis',
        status: 'info',
        message: 'Category column analysis completed',
        details: categoryAnalysis
      });

      // Count total products and categories
      const { count: totalCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      diagnostics.push({
        step: 'total_count',
        status: 'success',
        message: `Total products in database: ${totalCount || 0}`,
      });

      // Get all categories
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        diagnostics.push({
          step: 'category_query_error',
          status: 'error',
          message: 'Failed to fetch categories',
          details: { error: error.message, code: error.code }
        });
        return { categories: [], diagnostics };
      }
      
      diagnostics.push({
        step: 'category_query',
        status: 'success',
        message: `Found ${data?.length || 0} products with non-null categories`,
      });
      
      if (!data || data.length === 0) {
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