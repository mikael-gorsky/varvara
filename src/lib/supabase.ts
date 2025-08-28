import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server operations (imports, etc.)
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  console.warn('VITE_SUPABASE_SERVICE_ROLE_KEY not found - admin operations will fail');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          external_id: string | null;
          name: string;
          category: string;
          price: number | null;
          quantity: number | null;
          supplier: string | null;
          import_date: string | null;
          created_at: string;
          updated_at: string;
          // Product identification
          sku: string | null;
          barcode: string | null;
          subcategory: string | null;
          brand: string | null;
          model: string | null;
          // Financial and pricing
          cost_price: number | null;
          wholesale_price: number | null;
          retail_price: number | null;
          margin_percent: number | null;
          tax_rate: number | null;
          // Inventory and logistics
          min_stock: number | null;
          max_stock: number | null;
          reorder_point: number | null;
          warehouse_location: string | null;
          weight: number | null;
          dimensions: string | null;
          // Supplier information
          supplier_sku: string | null;
          supplier_price: number | null;
          lead_time_days: number | null;
          supplier_contact: string | null;
          // Sales and marketing
          description: string | null;
          short_description: string | null;
          sales_rank: number | null;
          sales_velocity: number | null;
          // Status and metadata
          status: string | null;
          is_active: boolean | null;
          last_sold_date: string | null;
          discontinue_date: string | null;
          // Custom fields
          custom_field_1: string | null;
          custom_field_2: string | null;
          custom_field_3: string | null;
          custom_field_4: string | null;
          custom_field_5: string | null;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          name: string;
          category: string;
          price?: number | null;
          quantity?: number | null;
          supplier?: string | null;
          import_date?: string | null;
          created_at?: string;
          updated_at?: string;
          sku?: string | null;
          barcode?: string | null;
          subcategory?: string | null;
          brand?: string | null;
          model?: string | null;
          cost_price?: number | null;
          wholesale_price?: number | null;
          retail_price?: number | null;
          margin_percent?: number | null;
          tax_rate?: number | null;
          min_stock?: number | null;
          max_stock?: number | null;
          reorder_point?: number | null;
          warehouse_location?: string | null;
          weight?: number | null;
          dimensions?: string | null;
          supplier_sku?: string | null;
          supplier_price?: number | null;
          lead_time_days?: number | null;
          supplier_contact?: string | null;
          description?: string | null;
          short_description?: string | null;
          sales_rank?: number | null;
          sales_velocity?: number | null;
          status?: string | null;
          is_active?: boolean | null;
          last_sold_date?: string | null;
          discontinue_date?: string | null;
          custom_field_1?: string | null;
          custom_field_2?: string | null;
          custom_field_3?: string | null;
          custom_field_4?: string | null;
          custom_field_5?: string | null;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          name?: string;
          category?: string;
          price?: number | null;
          quantity?: number | null;
          supplier?: string | null;
          import_date?: string | null;
          created_at?: string;
          updated_at?: string;
          sku?: string | null;
          barcode?: string | null;
          subcategory?: string | null;
          brand?: string | null;
          model?: string | null;
          cost_price?: number | null;
          wholesale_price?: number | null;
          retail_price?: number | null;
          margin_percent?: number | null;
          tax_rate?: number | null;
          min_stock?: number | null;
          max_stock?: number | null;
          reorder_point?: number | null;
          warehouse_location?: string | null;
          weight?: number | null;
          dimensions?: string | null;
          supplier_sku?: string | null;
          supplier_price?: number | null;
          lead_time_days?: number | null;
          supplier_contact?: string | null;
          description?: string | null;
          short_description?: string | null;
          sales_rank?: number | null;
          sales_velocity?: number | null;
          status?: string | null;
          is_active?: boolean | null;
          last_sold_date?: string | null;
          discontinue_date?: string | null;
          custom_field_1?: string | null;
          custom_field_2?: string | null;
          custom_field_3?: string | null;
          custom_field_4?: string | null;
          custom_field_5?: string | null;
        };
      };
    };
    ai_product_groups: {
      Row: {
        id: string;
        category: string;
        group_name: string;
        group_description: string | null;
        product_names: string[];
        price_analysis: {
          min_price: number;
          max_price: number;
          avg_price: number;
          price_variance: string;
          outliers: string[];
        };
        confidence_score: number | null;
        vendor_analysis: {
          vendor_count: number;
          vendors: string[];
        };
        ai_response: any;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        category: string;
        group_name: string;
        group_description?: string | null;
        product_names: string[];
        price_analysis?: any;
        confidence_score?: number | null;
        vendor_analysis?: any;
        ai_response?: any;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        category?: string;
        group_name?: string;
        group_description?: string | null;
        product_names?: string[];
        price_analysis?: any;
        confidence_score?: number | null;
        vendor_analysis?: any;
        ai_response?: any;
        created_at?: string;
        updated_at?: string;
      };
    };
  };
};