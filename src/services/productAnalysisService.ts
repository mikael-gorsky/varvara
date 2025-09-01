import { supabaseAdmin } from '../lib/supabase';

export interface AnalysisResult {
  category: string;
  groups: AnalysisGroup[];
  totalProducts: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  topVendors: Array<{
    name: string;
    count: number;
  }>;
}

export interface AnalysisGroup {
  id: string;
  group_name: string;
  group_description?: string;
  product_names: string[];
  confidence_score?: number;
  price_analysis?: any;
  vendor_analysis?: any;
}

export interface AnalysisStats {
  totalCategories: number;
  totalGroups: number;
  totalProducts: number;
  lastAnalysisDate?: string;
}

class ProductAnalysisService {
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('ozon_data')
        .select('category_level1')
        .not('category_level1', 'is', null);

      if (error) throw error;

      const categories = [...new Set(data.map(item => item.category_level1))];
      return categories.filter(cat => cat && cat.trim());
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getAnalysisStats(): Promise<AnalysisStats> {
    try {
      const [categoriesResult, groupsResult, productsResult] = await Promise.all([
        supabaseAdmin.from('ozon_data').select('category_level1', { count: 'exact' }),
        supabaseAdmin.from('ai_product_groups').select('id', { count: 'exact' }),
        supabaseAdmin.from('ai_product_groups').select('product_names')
      ]);

      const uniqueCategories = new Set();
      if (categoriesResult.data) {
        categoriesResult.data.forEach(item => {
          if (item.category_level1) uniqueCategories.add(item.category_level1);
        });
      }

      let totalProducts = 0;
      if (productsResult.data) {
        productsResult.data.forEach(group => {
          if (group.product_names && Array.isArray(group.product_names)) {
            totalProducts += group.product_names.length;
          }
        });
      }

      // Get last analysis date
      const { data: lastAnalysis } = await supabaseAdmin
        .from('ai_product_groups')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        totalCategories: uniqueCategories.size,
        totalGroups: groupsResult.count || 0,
        totalProducts,
        lastAnalysisDate: lastAnalysis?.[0]?.created_at
      };
    } catch (error) {
      console.error('Error fetching analysis stats:', error);
      throw error;
    }
  }

  async getAnalysisResults(): Promise<AnalysisResult[]> {
    try {
      const { data: groups, error } = await supabaseAdmin
        .from('ai_product_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupsByCategory = groups?.reduce((acc, group) => {
        const category = group.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(group);
        return acc;
      }, {} as Record<string, AnalysisGroup[]>) || {};

      const results: AnalysisResult[] = [];

      for (const [category, categoryGroups] of Object.entries(groupsByCategory)) {
        // Get all product names for this category
        const allProductNames = categoryGroups.flatMap(g => g.product_names || []);
        
        // Get product data for price analysis
        const { data: products } = await supabaseAdmin
          .from('ozon_data')
          .select('average_price, seller')
          .in('product_name', allProductNames);

        const prices = products?.map(p => p.average_price).filter(p => p > 0) || [];
        const vendors = products?.map(p => p.seller).filter(s => s) || [];
        
        const averagePrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;

        // Count vendors
        const vendorCounts = vendors.reduce((acc, vendor) => {
          acc[vendor] = (acc[vendor] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topVendors = Object.entries(vendorCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        results.push({
          category,
          groups: categoryGroups,
          totalProducts: allProductNames.length,
          averagePrice,
          priceRange: { min: minPrice, max: maxPrice },
          topVendors
        });
      }

      return results;
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      throw error;
    }
  }

  async analyzeCategory(category: string): Promise<void> {
    try {
      // Get products for this category
      const { data: products, error } = await supabaseAdmin
        .from('ozon_data')
        .select('product_name, average_price, seller, brand')
        .eq('category_level1', category);

      if (error) throw error;

      if (!products || products.length === 0) {
        throw new Error(`No products found for category: ${category}`);
      }

      // Simple grouping logic - in a real app, this would use AI
      const groups = this.createProductGroups(products, category);

      // Save groups to database
      for (const group of groups) {
        await supabaseAdmin
          .from('ai_product_groups')
          .insert(group);
      }
    } catch (error) {
      console.error('Error analyzing category:', error);
      throw error;
    }
  }

  private createProductGroups(products: any[], category: string) {
    // Simple grouping by brand or similar words in product names
    const groups: any[] = [];
    const processed = new Set<string>();

    for (const product of products) {
      if (processed.has(product.product_name)) continue;

      const similarProducts = products.filter(p => 
        !processed.has(p.product_name) && 
        (p.brand === product.brand || this.areSimilarProducts(p.product_name, product.product_name))
      );

      if (similarProducts.length >= 2) {
        const groupName = product.brand || this.extractGroupName(product.product_name);
        
        groups.push({
          category,
          group_name: groupName,
          group_description: `Products grouped by ${product.brand ? 'brand' : 'similarity'}`,
          product_names: similarProducts.map(p => p.product_name),
          confidence_score: 0.8,
          price_analysis: {
            average: similarProducts.reduce((a, p) => a + p.average_price, 0) / similarProducts.length,
            range: {
              min: Math.min(...similarProducts.map(p => p.average_price)),
              max: Math.max(...similarProducts.map(p => p.average_price))
            }
          },
          vendor_analysis: {
            vendors: [...new Set(similarProducts.map(p => p.seller))],
            total_vendors: new Set(similarProducts.map(p => p.seller)).size
          }
        });

        similarProducts.forEach(p => processed.add(p.product_name));
      }
    }

    return groups;
  }

  private areSimilarProducts(name1: string, name2: string): boolean {
    const words1 = name1.toLowerCase().split(' ');
    const words2 = name2.toLowerCase().split(' ');
    
    const commonWords = words1.filter(word => 
      word.length > 3 && words2.includes(word)
    );
    
    return commonWords.length >= 2;
  }

  private extractGroupName(productName: string): string {
    const words = productName.split(' ');
    return words.slice(0, 2).join(' ');
  }

  async clearCategoryAnalysis(category: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('ai_product_groups')
        .delete()
        .eq('category', category);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing category analysis:', error);
      throw error;
    }
  }
}

export const productAnalysisService = new ProductAnalysisService();