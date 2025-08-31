import { supabase } from '../lib/supabase';

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
  category: string;
  groups: ProductGroup[];
  totalProducts: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  topVendors: Array<{
    name: string;
    productCount: number;
    averagePrice: number;
  }>;
}

export interface AnalysisStats {
  totalCategories: number;
  totalGroups: number;
  totalProducts: number;
  lastAnalysisDate: string | null;
  topCategories: Array<{
    name: string;
    groupCount: number;
    productCount: number;
  }>;
}

export class ProductAnalysisService {
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('ozon_data')
        .select('category_level1')
        .not('category_level1', 'is', null);

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map(item => item.category_level1))];
      return uniqueCategories.filter(Boolean);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getAnalysisResults(): Promise<AnalysisResult[]> {
    try {
      const { data, error } = await supabase
        .from('ai_product_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by category
      const categoryMap = new Map<string, ProductGroup[]>();
      
      data?.forEach(group => {
        if (!categoryMap.has(group.category)) {
          categoryMap.set(group.category, []);
        }
        categoryMap.get(group.category)!.push(group);
      });

      // Convert to AnalysisResult format
      const results: AnalysisResult[] = [];
      
      for (const [category, groups] of categoryMap) {
        const totalProducts = groups.reduce((sum, group) => sum + group.product_names.length, 0);
        
        // Get price data for this category
        const { data: ozonData } = await supabase
          .from('ozon_data')
          .select('average_price')
          .eq('category_level1', category)
          .not('average_price', 'is', null);

        const prices = ozonData?.map(item => item.average_price) || [];
        const averagePrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        // Get vendor data
        const { data: vendorData } = await supabase
          .from('ozon_data')
          .select('seller, average_price')
          .eq('category_level1', category)
          .not('seller', 'is', null);

        const vendorMap = new Map();
        vendorData?.forEach(item => {
          if (!vendorMap.has(item.seller)) {
            vendorMap.set(item.seller, { count: 0, totalPrice: 0 });
          }
          const vendor = vendorMap.get(item.seller);
          vendor.count++;
          vendor.totalPrice += item.average_price || 0;
        });

        const topVendors = Array.from(vendorMap.entries())
          .map(([name, data]) => ({
            name,
            productCount: data.count,
            averagePrice: data.totalPrice / data.count
          }))
          .sort((a, b) => b.productCount - a.productCount)
          .slice(0, 5);

        results.push({
          category,
          groups,
          totalProducts,
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

  async getAnalysisStats(): Promise<AnalysisStats> {
    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('ai_product_groups')
        .select('category, product_names, created_at');

      if (groupsError) throw groupsError;

      const totalGroups = groupsData?.length || 0;
      const totalProducts = groupsData?.reduce((sum, group) => sum + group.product_names.length, 0) || 0;
      
      const categories = [...new Set(groupsData?.map(group => group.category) || [])];
      const totalCategories = categories.length;

      const lastAnalysisDate = groupsData && groupsData.length > 0 
        ? groupsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null;

      // Calculate top categories
      const categoryStats = new Map();
      groupsData?.forEach(group => {
        if (!categoryStats.has(group.category)) {
          categoryStats.set(group.category, { groupCount: 0, productCount: 0 });
        }
        const stats = categoryStats.get(group.category);
        stats.groupCount++;
        stats.productCount += group.product_names.length;
      });

      const topCategories = Array.from(categoryStats.entries())
        .map(([name, stats]) => ({
          name,
          groupCount: stats.groupCount,
          productCount: stats.productCount
        }))
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 5);

      return {
        totalCategories,
        totalGroups,
        totalProducts,
        lastAnalysisDate,
        topCategories
      };
    } catch (error) {
      console.error('Error fetching analysis stats:', error);
      throw error;
    }
  }

  async analyzeCategory(category: string): Promise<AnalysisResult> {
    try {
      // Get products for this category
      const { data: products, error: productsError } = await supabase
        .from('ozon_data')
        .select('*')
        .eq('category_level1', category);

      if (productsError) throw productsError;

      if (!products || products.length === 0) {
        throw new Error(`No products found for category: ${category}`);
      }

      // Call the edge function to analyze products
      const { data, error } = await supabase.functions.invoke('analyze-products', {
        body: { 
          category, 
          products: products.map(p => ({
            name: p.product_name,
            price: p.average_price,
            seller: p.seller,
            brand: p.brand
          }))
        }
      });

      if (error) throw error;

      // Store results in ai_product_groups table
      const groups = data.groups || [];
      
      for (const group of groups) {
        await supabase
          .from('ai_product_groups')
          .insert({
            category,
            group_name: group.group_name,
            group_description: group.group_description,
            product_names: group.product_names,
            price_analysis: group.price_analysis,
            confidence_score: group.confidence_score,
            vendor_analysis: group.vendor_analysis,
            ai_response: data
          });
      }

      // Return formatted result
      const totalProducts = products.length;
      const prices = products.map(p => p.average_price || 0).filter(p => p > 0);
      const averagePrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      // Calculate top vendors
      const vendorMap = new Map();
      products.forEach(product => {
        if (product.seller) {
          if (!vendorMap.has(product.seller)) {
            vendorMap.set(product.seller, { count: 0, totalPrice: 0 });
          }
          const vendor = vendorMap.get(product.seller);
          vendor.count++;
          vendor.totalPrice += product.average_price || 0;
        }
      });

      const topVendors = Array.from(vendorMap.entries())
        .map(([name, data]) => ({
          name,
          productCount: data.count,
          averagePrice: data.totalPrice / data.count
        }))
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 5);

      return {
        category,
        groups,
        totalProducts,
        averagePrice,
        priceRange: { min: minPrice, max: maxPrice },
        topVendors
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
}

// Export singleton instance
export const productAnalysisService = new ProductAnalysisService();