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
        .select('name, price, external_id, supplier')
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
  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category, is_active')
        .limit(1000);

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No products found in database. Import some data first.');
      }

      // Get unique categories
      const uniqueCategories = [...new Set(data?.map(p => p.category) || [])];
      const filteredCategories = uniqueCategories.filter(cat => cat && cat.trim());
      console.log(`✅ Returning ${filteredCategories.length} unique categories`);
      
      return filteredCategories;

    } catch (error) {
      console.error('❌ Get categories error:', error);
      return [];
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