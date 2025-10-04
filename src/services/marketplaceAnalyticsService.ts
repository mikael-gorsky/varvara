import { supabaseAdmin } from '../lib/supabase';

export interface CategoryStats {
  category: string;
  productCount: number;
  totalRevenue: number;
  averagePrice: number;
  topSuppliers: string[];
  supplierCount: number;
}

export interface SupplierStats {
  supplier: string;
  productCount: number;
  categoryCount: number;
  categories: string[];
  totalRevenue: number;
  averagePrice: number;
}

export interface MarketplaceOverview {
  totalCategories: number;
  totalSuppliers: number;
  totalProducts: number;
  totalRevenue: number;
}

class MarketplaceAnalyticsService {
  async getOverview(): Promise<MarketplaceOverview> {
    try {
      const { data: products, error } = await supabaseAdmin
        .from('ozon_data')
        .select('category_level3, seller, ordered_sum')
        .limit(100000);

      if (error) throw error;

      const uniqueCategories = new Set<string>();
      const uniqueSuppliers = new Set<string>();
      let totalRevenue = 0;

      products?.forEach(product => {
        if (product.category_level3) uniqueCategories.add(product.category_level3);
        if (product.seller) uniqueSuppliers.add(product.seller);
        totalRevenue += product.ordered_sum || 0;
      });

      return {
        totalCategories: uniqueCategories.size,
        totalSuppliers: uniqueSuppliers.size,
        totalProducts: products?.length || 0,
        totalRevenue
      };
    } catch (error) {
      console.error('Error fetching marketplace overview:', error);
      throw error;
    }
  }

  async getCategories(): Promise<CategoryStats[]> {
    try {
      const { data: products, error } = await supabaseAdmin
        .from('ozon_data')
        .select('category_level3, seller, ordered_sum, average_price')
        .not('category_level3', 'is', null)
        .limit(100000);

      if (error) throw error;

      const categoryMap = new Map<string, {
        products: any[];
        suppliers: Set<string>;
      }>();

      products?.forEach(product => {
        const category = product.category_level3;
        if (!category) return;

        if (!categoryMap.has(category)) {
          categoryMap.set(category, { products: [], suppliers: new Set() });
        }

        const categoryData = categoryMap.get(category)!;
        categoryData.products.push(product);
        if (product.seller) categoryData.suppliers.add(product.seller);
      });

      const categories: CategoryStats[] = [];

      categoryMap.forEach((data, category) => {
        const totalRevenue = data.products.reduce((sum, p) => sum + (p.ordered_sum || 0), 0);
        const averagePrice = data.products.reduce((sum, p) => sum + (p.average_price || 0), 0) / data.products.length;

        const supplierCounts = new Map<string, number>();
        data.products.forEach(p => {
          if (p.seller) {
            supplierCounts.set(p.seller, (supplierCounts.get(p.seller) || 0) + 1);
          }
        });

        const topSuppliers = Array.from(supplierCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([supplier]) => supplier);

        categories.push({
          category,
          productCount: data.products.length,
          totalRevenue,
          averagePrice,
          topSuppliers,
          supplierCount: data.suppliers.size
        });
      });

      return categories.sort((a, b) => b.productCount - a.productCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getSuppliersWithMinProducts(minProducts: number = 50): Promise<SupplierStats[]> {
    try {
      const { data: products, error } = await supabaseAdmin
        .from('ozon_data')
        .select('seller, category_level3, ordered_sum, average_price')
        .not('seller', 'is', null)
        .not('category_level3', 'is', null)
        .limit(100000);

      if (error) throw error;

      console.log('Total products fetched:', products?.length);
      const gelosSample = products?.filter(p => p.seller === 'ГЕЛЕОС').slice(0, 10);
      console.log('ГЕЛЕОС sample (first 10):', gelosSample?.map(p => ({ seller: p.seller, category: p.category_level3 })));

      const supplierMap = new Map<string, {
        products: any[];
        categories: Set<string>;
      }>();

      products?.forEach(product => {
        const supplier = product.seller;
        const category = product.category_level3;
        if (!supplier || !category) return;

        if (!supplierMap.has(supplier)) {
          supplierMap.set(supplier, { products: [], categories: new Set() });
        }

        const supplierData = supplierMap.get(supplier)!;
        supplierData.products.push(product);
        supplierData.categories.add(category);
      });

      const suppliers: SupplierStats[] = [];

      supplierMap.forEach((data, supplier) => {
        if (data.products.length >= minProducts) {
          const totalRevenue = data.products.reduce((sum, p) => sum + (p.ordered_sum || 0), 0);
          const averagePrice = data.products.reduce((sum, p) => sum + (p.average_price || 0), 0) / data.products.length;

          console.log(`Supplier: ${supplier}, Products: ${data.products.length}, Categories Set:`, data.categories);

          suppliers.push({
            supplier,
            productCount: data.products.length,
            categoryCount: data.categories.size,
            categories: Array.from(data.categories),
            totalRevenue,
            averagePrice
          });
        }
      });

      return suppliers.sort((a, b) => b.productCount - a.productCount);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  async getCategoryDetails(category: string): Promise<CategoryStats | null> {
    try {
      const { data: products, error } = await supabaseAdmin
        .from('ozon_data')
        .select('*')
        .eq('category_level3', category);

      if (error) throw error;
      if (!products || products.length === 0) return null;

      const suppliers = new Set<string>();
      const supplierCounts = new Map<string, number>();
      let totalRevenue = 0;
      let totalPrice = 0;

      products.forEach(product => {
        if (product.seller) {
          suppliers.add(product.seller);
          supplierCounts.set(product.seller, (supplierCounts.get(product.seller) || 0) + 1);
        }
        totalRevenue += product.ordered_sum || 0;
        totalPrice += product.average_price || 0;
      });

      const topSuppliers = Array.from(supplierCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([supplier]) => supplier);

      return {
        category,
        productCount: products.length,
        totalRevenue,
        averagePrice: totalPrice / products.length,
        topSuppliers,
        supplierCount: suppliers.size
      };
    } catch (error) {
      console.error('Error fetching category details:', error);
      throw error;
    }
  }

  async getSupplierDetails(supplier: string): Promise<SupplierStats | null> {
    try {
      const { data: products, error } = await supabaseAdmin
        .from('ozon_data')
        .select('*')
        .eq('seller', supplier);

      if (error) throw error;
      if (!products || products.length === 0) return null;

      const categories = new Set<string>();
      let totalRevenue = 0;
      let totalPrice = 0;

      products.forEach(product => {
        if (product.category_level3) categories.add(product.category_level3);
        totalRevenue += product.ordered_sum || 0;
        totalPrice += product.average_price || 0;
      });

      return {
        supplier,
        productCount: products.length,
        categoryCount: categories.size,
        categories: Array.from(categories),
        totalRevenue,
        averagePrice: totalPrice / products.length
      };
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      throw error;
    }
  }
}

export const marketplaceAnalyticsService = new MarketplaceAnalyticsService();
