import { supabase } from '../lib/supabase';

export interface PriceComparisonProduct {
  id: string;
  code: string;
  article?: string;
  name: string;
  category?: string;
  pricelistPrice?: number;
  ozonPrice?: number;
  ozonPriceUSD?: number;
  priceDifferenceUSD?: number;
  priceDifferencePercent?: number;
  ozonProductName?: string;
}

export interface ComparisonOverview {
  totalMatched: number;
  avgPriceDifferenceUSD: number;
  avgPriceDifferencePercent: number;
  productsWithHigherOzonPrice: number;
  productsWithLowerOzonPrice: number;
  productsWithEqualPrice: number;
}

const EXCHANGE_RATE_USD_TO_RUB = 88;
const OFFICE_KIT_SUPPLIER = 'ООО «Офис Кит»';

class PriceComparisonService {
  private convertRubToUSD(priceRub: number): number {
    return priceRub / EXCHANGE_RATE_USD_TO_RUB;
  }

  private normalizeProductName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private extractModelNumber(name: string): string | null {
    const patterns = [
      /\b([LS]\d{4})\b/i,
      /\b([A-Z]\d{3,4}[A-Z]?)\b/i,
      /office\s*kit\s*([A-Z]?\d{3,4}[A-Z]?)/i,
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        return match[1].toUpperCase();
      }
    }
    return null;
  }

  private findBestMatch(plName: string, ozonProducts: any[]): any | null {
    const plModelNumber = this.extractModelNumber(plName);

    if (plModelNumber) {
      for (const ozonProduct of ozonProducts) {
        const ozonModelNumber = this.extractModelNumber(ozonProduct.product_name);
        if (ozonModelNumber && ozonModelNumber === plModelNumber) {
          return ozonProduct;
        }
      }
    }

    const normalizedPlName = this.normalizeProductName(plName);
    for (const ozonProduct of ozonProducts) {
      const normalizedOzonName = this.normalizeProductName(ozonProduct.product_name);
      if (normalizedOzonName === normalizedPlName) {
        return ozonProduct;
      }
    }

    return null;
  }

  async getComparison(searchTerm?: string): Promise<PriceComparisonProduct[]> {
    let pricelistQuery = supabase
      .from('pricelist_products')
      .select(`
        id,
        code,
        article,
        name,
        category,
        pricelist_prices!inner(supplier, price)
      `)
      .eq('pricelist_prices.supplier', 'Розничные');

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim();
      pricelistQuery = pricelistQuery.or(`name.ilike.%${term}%,code.ilike.%${term}%,article.ilike.%${term}%`);
    }

    const { data: pricelistProducts, error: pricelistError } = await pricelistQuery;

    if (pricelistError) {
      throw new Error(`Failed to fetch pricelist products: ${pricelistError.message}`);
    }

    const { data: ozonProducts, error: ozonError } = await supabase
      .from('ozon_data')
      .select('product_name, seller, brand, category_level1, average_price')
      .eq('seller', OFFICE_KIT_SUPPLIER);

    if (ozonError) {
      throw new Error(`Failed to fetch Ozon products: ${ozonError.message}`);
    }

    const validOzonProducts = (ozonProducts || []).filter(
      (p) => p.product_name && p.average_price
    );

    const comparisons: PriceComparisonProduct[] = [];

    (pricelistProducts || []).forEach((plProduct: any) => {
      const pricelistPrice = plProduct.pricelist_prices?.[0]?.price;

      if (!pricelistPrice) return;

      const ozonProduct = this.findBestMatch(plProduct.name, validOzonProducts);

      if (ozonProduct && ozonProduct.average_price) {
        const ozonPriceRub = ozonProduct.average_price;
        const ozonPriceUSD = this.convertRubToUSD(ozonPriceRub);
        const priceDifferenceUSD = ozonPriceUSD - pricelistPrice;
        const priceDifferencePercent = ((priceDifferenceUSD / pricelistPrice) * 100);

        comparisons.push({
          id: plProduct.id,
          code: plProduct.code,
          article: plProduct.article,
          name: plProduct.name,
          category: plProduct.category,
          pricelistPrice,
          ozonPrice: ozonPriceRub,
          ozonPriceUSD,
          priceDifferenceUSD,
          priceDifferencePercent,
          ozonProductName: ozonProduct.product_name,
        });
      }
    });

    return comparisons.sort((a, b) => {
      const diffA = Math.abs(a.priceDifferencePercent || 0);
      const diffB = Math.abs(b.priceDifferencePercent || 0);
      return diffB - diffA;
    });
  }

  async getOverview(): Promise<ComparisonOverview> {
    const comparisons = await this.getComparison();

    if (comparisons.length === 0) {
      return {
        totalMatched: 0,
        avgPriceDifferenceUSD: 0,
        avgPriceDifferencePercent: 0,
        productsWithHigherOzonPrice: 0,
        productsWithLowerOzonPrice: 0,
        productsWithEqualPrice: 0,
      };
    }

    const totalDifferenceUSD = comparisons.reduce((sum, p) => sum + (p.priceDifferenceUSD || 0), 0);
    const totalDifferencePercent = comparisons.reduce((sum, p) => sum + (p.priceDifferencePercent || 0), 0);

    const productsWithHigherOzonPrice = comparisons.filter(p => (p.priceDifferenceUSD || 0) > 0.5).length;
    const productsWithLowerOzonPrice = comparisons.filter(p => (p.priceDifferenceUSD || 0) < -0.5).length;
    const productsWithEqualPrice = comparisons.filter(p => Math.abs(p.priceDifferenceUSD || 0) <= 0.5).length;

    return {
      totalMatched: comparisons.length,
      avgPriceDifferenceUSD: totalDifferenceUSD / comparisons.length,
      avgPriceDifferencePercent: totalDifferencePercent / comparisons.length,
      productsWithHigherOzonPrice,
      productsWithLowerOzonPrice,
      productsWithEqualPrice,
    };
  }
}

export const priceComparisonService = new PriceComparisonService();
