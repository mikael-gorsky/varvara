import { supabase } from '../lib/supabase';

export interface PriceComparisonProduct {
  id: string;
  code: string;
  article?: string;
  name: string;
  category?: string;
  pricelistPriceUSD?: number;
  pricelistPriceRub?: number;
  ozonPrice?: number;
  priceDifferencePercent?: number;
  ozonProductName?: string;
  matchType?: 'model_number' | 'normalized_name';
}

export interface ComparisonOverview {
  totalMatched: number;
  avgPriceDifferencePercent: number;
  productsWithHigherOzonPrice: number;
  productsWithLowerOzonPrice: number;
  productsWithEqualPrice: number;
}

const EXCHANGE_RATE_USD_TO_RUB = 88;
const OFFICE_KIT_SUPPLIER = 'ООО «Офис Кит»';

class PriceComparisonService {
  private convertUSDToRub(priceUSD: number): number {
    return priceUSD * EXCHANGE_RATE_USD_TO_RUB;
  }

  private normalizeProductName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private extractModelNumber(name: string): string | null {
    const patterns = [
      /\b([LS]\d{4})[A-Z]?\b/i,
      /\b([A-Z]\d{3,4})[A-Z]?\b/i,
      /office\s*kit\s*([A-Z]?\d{3,4})[A-Z]?/i,
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        return match[1].toUpperCase();
      }
    }
    return null;
  }

  private extractArticleFromName(name: string): string | null {
    const match = name.match(/office\s*kit\s*([A-Z]?\d{3,4}[A-Z]?)/i);
    return match ? match[1].toUpperCase() : null;
  }

  private findBestMatch(plProduct: any, ozonProducts: any[]): { product: any; matchType: 'model_number' | 'normalized_name' } | null {
    const plArticle = plProduct.article;
    const plName = plProduct.name;

    if (plArticle) {
      const plBaseModel = this.extractModelNumber(plArticle);

      for (const ozonProduct of ozonProducts) {
        const ozonModelNumber = this.extractModelNumber(ozonProduct.product_name);
        const ozonArticle = this.extractArticleFromName(ozonProduct.product_name);

        if (plArticle && ozonArticle && plArticle.toUpperCase() === ozonArticle.toUpperCase()) {
          return { product: ozonProduct, matchType: 'model_number' };
        }

        if (plBaseModel && ozonModelNumber && plBaseModel === ozonModelNumber) {
          return { product: ozonProduct, matchType: 'model_number' };
        }
      }
    }

    const plModelNumber = this.extractModelNumber(plName);
    if (plModelNumber) {
      for (const ozonProduct of ozonProducts) {
        const ozonModelNumber = this.extractModelNumber(ozonProduct.product_name);
        if (ozonModelNumber && ozonModelNumber === plModelNumber) {
          return { product: ozonProduct, matchType: 'model_number' };
        }
      }
    }

    const normalizedPlName = this.normalizeProductName(plName);
    for (const ozonProduct of ozonProducts) {
      const normalizedOzonName = this.normalizeProductName(ozonProduct.product_name);
      if (normalizedOzonName === normalizedPlName) {
        return { product: ozonProduct, matchType: 'normalized_name' };
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
      const pricelistPriceUSD = plProduct.pricelist_prices?.[0]?.price;

      if (!pricelistPriceUSD) return;

      const matchResult = this.findBestMatch(plProduct, validOzonProducts);

      if (matchResult && matchResult.product.average_price) {
        const ozonPriceRub = matchResult.product.average_price;
        const pricelistPriceRub = this.convertUSDToRub(pricelistPriceUSD);
        const priceDifferencePercent = ((ozonPriceRub - pricelistPriceRub) / pricelistPriceRub) * 100;

        comparisons.push({
          id: plProduct.id,
          code: plProduct.code,
          article: plProduct.article,
          name: plProduct.name,
          category: plProduct.category,
          pricelistPriceUSD,
          pricelistPriceRub,
          ozonPrice: ozonPriceRub,
          priceDifferencePercent,
          ozonProductName: matchResult.product.product_name,
          matchType: matchResult.matchType,
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
        avgPriceDifferencePercent: 0,
        productsWithHigherOzonPrice: 0,
        productsWithLowerOzonPrice: 0,
        productsWithEqualPrice: 0,
      };
    }

    const totalDifferencePercent = comparisons.reduce((sum, p) => sum + (p.priceDifferencePercent || 0), 0);

    const productsWithHigherOzonPrice = comparisons.filter(p => (p.priceDifferencePercent || 0) > 1).length;
    const productsWithLowerOzonPrice = comparisons.filter(p => (p.priceDifferencePercent || 0) < -1).length;
    const productsWithEqualPrice = comparisons.filter(p => Math.abs(p.priceDifferencePercent || 0) <= 1).length;

    return {
      totalMatched: comparisons.length,
      avgPriceDifferencePercent: totalDifferencePercent / comparisons.length,
      productsWithHigherOzonPrice,
      productsWithLowerOzonPrice,
      productsWithEqualPrice,
    };
  }
}

export const priceComparisonService = new PriceComparisonService();
