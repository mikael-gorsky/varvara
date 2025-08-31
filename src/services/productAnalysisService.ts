import { supabase } from '../lib/supabase';

export interface ProductGroup {
  id: string;
  category: string;
  groupName: string;
  groupDescription?: string;
  productNames: string[];
  priceAnalysis?: any;
  confidenceScore?: number;
  vendorAnalysis?: any;
  aiResponse?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalysisResult {
  category: string;
  groups: ProductGroup[];
  stats: {
    totalProducts: number;
    groupsCreated: number;
    averageConfidence: number;
  };
}

export class ProductAnalysisService {
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('ozon_data')
        .select('category_level1')
        .not('category_level1', 'is', null)
        .limit(50000);

      if (error) throw error;

      const categories = [...new Set(data?.map(item => item.category_level1).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getAnalysisResults(category?: string): Promise<ProductGroup[]> {
    try {
      let query = supabase
        .from('ai_product_groups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50000);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        category: item.category,
        groupName: item.group_name,
        groupDescription: item.group_description,
        productNames: item.product_names || [],
        priceAnalysis: item.price_analysis,
        confidenceScore: item.confidence_score,
        vendorAnalysis: item.vendor_analysis,
        aiResponse: item.ai_response,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      throw error;
    }
  }

  async getAnalysisStats(category?: string): Promise<{ totalProducts: number; groupsCreated: number; averageConfidence: number }> {
    try {
      let query = supabase
        .from('ai_product_groups')
        .select('confidence_score, product_names')
        .limit(50000);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      const groups = data || [];
      const totalProducts = groups.reduce((sum, group) => sum + (group.product_names?.length || 0), 0);
      const averageConfidence = groups.length > 0 
        ? groups.reduce((sum, group) => sum + (group.confidence_score || 0), 0) / groups.length 
        : 0;

      return {
        totalProducts,
        groupsCreated: groups.length,
        averageConfidence
      };
    } catch (error) {
      console.error('Error fetching analysis stats:', error);
      throw error;
    }
  }

  async analyzeCategory(category: string): Promise<AnalysisResult> {
    try {
      // Fetch products for the category
      const { data: products, error } = await supabase
        .from('ozon_data')
        .select('product_name, brand, seller, average_price')
        .eq('category_level1', category)
        .not('product_name', 'is', null)
        .limit(50000);

      if (error) throw error;

      // Simple grouping logic (can be enhanced with AI later)
      const groups: ProductGroup[] = [];
      const processedProducts = new Set();

      products?.forEach(product => {
        if (!processedProducts.has(product.product_name)) {
          // Find similar products (basic name matching)
          const similarProducts = products.filter(p => 
            p.brand === product.brand || 
            p.seller === product.seller ||
            this.calculateSimilarity(p.product_name, product.product_name) > 0.7
          );

          if (similarProducts.length > 1) {
            const groupName = this.generateGroupName(similarProducts);
            const group: ProductGroup = {
              id: `group-${Date.now()}-${Math.random()}`,
              category,
              groupName,
              groupDescription: `Group of ${similarProducts.length} similar products`,
              productNames: similarProducts.map(p => p.product_name),
              confidenceScore: 0.8,
              priceAnalysis: {
                minPrice: Math.min(...similarProducts.map(p => p.average_price || 0)),
                maxPrice: Math.max(...similarProducts.map(p => p.average_price || 0)),
                avgPrice: similarProducts.reduce((sum, p) => sum + (p.average_price || 0), 0) / similarProducts.length
              }
            };

            groups.push(group);
            similarProducts.forEach(p => processedProducts.add(p.product_name));
          }
        }
      });

      return {
        category,
        groups,
        stats: {
          totalProducts: products?.length || 0,
          groupsCreated: groups.length,
          averageConfidence: groups.reduce((sum, g) => sum + (g.confidenceScore || 0), 0) / (groups.length || 1)
        }
      };
    } catch (error) {
      console.error('Error analyzing category:', error);
      throw error;
    }
  }

  async clearCategoryAnalysis(category: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_product_groups')
        .delete()
        .eq('category', category);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing category analysis:', error);
      throw error;
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private generateGroupName(products: any[]): string {
    // Find common words in product names
    const words = products[0].product_name.split(' ');
    const commonWords = words.filter(word => 
      products.every(p => p.product_name.includes(word))
    );
    
    if (commonWords.length > 0) {
      return commonWords.join(' ');
    }
    
    // Fallback to brand if available
    if (products[0].brand) {
      return `${products[0].brand} Products`;
    }
    
    return 'Product Group';
  }
}

export const productAnalysisService = new ProductAnalysisService();