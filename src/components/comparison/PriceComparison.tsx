import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Search, BarChart3, Package, AlertCircle, Hash, FileText } from 'lucide-react';
import { priceComparisonService, PriceComparisonProduct, ComparisonOverview } from '../../services/priceComparisonService';

interface PriceComparisonProps {
  onBack: () => void;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ onBack }) => {
  const [overview, setOverview] = useState<ComparisonOverview | null>(null);
  const [products, setProducts] = useState<PriceComparisonProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<PriceComparisonProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'higher' | 'lower' | 'significant'>('all');
  const [minDifference, setMinDifference] = useState<number>(5);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filterType, minDifference]);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [overviewData, productsData] = await Promise.all([
        priceComparisonService.getOverview(),
        priceComparisonService.getComparison()
      ]);
      setOverview(overviewData);
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to load comparison data:', err);
      setError('Failed to load price comparison data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError('');
    try {
      const productsData = await priceComparisonService.getComparison(searchTerm);
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to search products:', err);
      setError('Failed to search products');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    switch (filterType) {
      case 'higher':
        filtered = filtered.filter(p => (p.priceDifferencePercent || 0) > 1);
        break;
      case 'lower':
        filtered = filtered.filter(p => (p.priceDifferencePercent || 0) < -1);
        break;
      case 'significant':
        filtered = filtered.filter(p => Math.abs(p.priceDifferencePercent || 0) >= minDifference);
        break;
    }

    setFilteredProducts(filtered);
  };

  const getPriceDifferenceIcon = (difference?: number) => {
    if (!difference) return <Minus className="w-4 h-4" />;
    if (difference > 1) return <TrendingUp className="w-4 h-4" />;
    if (difference < -1) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getPriceDifferenceColor = (difference?: number) => {
    if (!difference) return 'text-gray-400';
    if (difference > 1) return 'text-red-400';
    if (difference < -1) return 'text-emerald-400';
    return 'text-cyan-400';
  };

  const getMatchTypeColor = (matchType?: string) => {
    if (matchType === 'model_number') return 'border-l-4 border-blue-400 bg-blue-400/5';
    if (matchType === 'normalized_name') return 'border-l-4 border-green-400 bg-green-400/5';
    return '';
  };

  const getMatchTypeIcon = (matchType?: string) => {
    if (matchType === 'model_number') return <Hash className="w-3 h-3 text-blue-400" />;
    if (matchType === 'normalized_name') return <FileText className="w-3 h-3 text-green-400" />;
    return null;
  };

  if (isLoading && !overview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-300 font-mono">Loading price comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-full mx-auto space-y-6">

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded text-cyan-300 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 font-mono text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO COMMAND</span>
              </button>
              <div className="h-6 border-l border-cyan-400/30"></div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg border border-violet-300">
                  <BarChart3 className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    PL VS OZON COMPARISON
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    Price Analysis: Pricelist (USD → RUB) vs Ozon Marketplace (RUB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {overview && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                  <Package className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Matched Products</h3>
              <p className="text-2xl font-bold text-blue-300 font-mono">{overview.totalMatched}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg border border-red-300">
                  <TrendingUp className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Ozon Higher</h3>
              <p className="text-2xl font-bold text-red-300 font-mono">{overview.productsWithHigherOzonPrice}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                  <TrendingDown className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Ozon Lower</h3>
              <p className="text-2xl font-bold text-emerald-300 font-mono">{overview.productsWithLowerOzonPrice}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg border border-orange-300">
                  <BarChart3 className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Avg Diff %</h3>
              <p className={`text-2xl font-bold font-mono ${overview.avgPriceDifferencePercent > 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                {overview.avgPriceDifferencePercent > 0 ? '+' : ''}{overview.avgPriceDifferencePercent.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                placeholder="Search by product name, code, or article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-gray-800 border border-cyan-400/50 text-cyan-300 rounded-lg pl-10 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-black px-6 py-2 rounded-lg font-mono font-bold text-sm hover:from-violet-400 hover:to-fuchsia-400 transition-all duration-200"
            >
              SEARCH
            </button>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-gray-800 border border-cyan-400/50 text-cyan-300 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Products</option>
              <option value="higher">Ozon Higher Only</option>
              <option value="lower">Ozon Lower Only</option>
              <option value="significant">Significant Difference</option>
            </select>
            {filterType === 'significant' && (
              <select
                value={minDifference}
                onChange={(e) => setMinDifference(Number(e.target.value))}
                className="bg-gray-800 border border-cyan-400/50 text-cyan-300 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="5">± 5%</option>
                <option value="10">± 10%</option>
                <option value="15">± 15%</option>
                <option value="20">± 20%</option>
              </select>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-300 font-mono">Loading comparison...</p>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-red-400/30 shadow-xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-300 font-mono mb-2">Error Loading Data</h3>
            <p className="text-red-400/80 font-mono">{error}</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/80 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase tracking-wider border-b border-cyan-400/30">Product Name</th>
                    <th className="px-4 py-3 text-right text-xs font-mono text-cyan-400 uppercase tracking-wider border-b border-cyan-400/30">PL Price (RUB)</th>
                    <th className="px-4 py-3 text-right text-xs font-mono text-cyan-400 uppercase tracking-wider border-b border-cyan-400/30">Ozon (RUB)</th>
                    <th className="px-4 py-3 text-right text-xs font-mono text-cyan-400 uppercase tracking-wider border-b border-cyan-400/30">Diff (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, idx) => (
                    <tr key={product.id} className={`hover:bg-gray-800/50 transition-colors duration-200 ${idx % 2 === 0 ? 'bg-gray-900/30' : ''} ${getMatchTypeColor(product.matchType)}`}>
                      <td className="px-4 py-3 text-sm font-mono text-cyan-300 border-b border-cyan-400/10">
                        <div className="flex items-center space-x-2">
                          {getMatchTypeIcon(product.matchType)}
                          <span className="max-w-md truncate">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-cyan-300 text-right border-b border-cyan-400/10">{product.pricelistPriceRub?.toFixed(2)} ₽</td>
                      <td className="px-4 py-3 text-sm font-mono text-cyan-300 text-right border-b border-cyan-400/10">{product.ozonPrice?.toFixed(2)} ₽</td>
                      <td className={`px-4 py-3 text-sm font-mono text-right border-b border-cyan-400/10 font-bold ${getPriceDifferenceColor(product.priceDifferencePercent)}`}>
                        <div className="flex items-center justify-end space-x-1">
                          {getPriceDifferenceIcon(product.priceDifferencePercent)}
                          <span>{product.priceDifferencePercent && product.priceDifferencePercent > 0 ? '+' : ''}{product.priceDifferencePercent?.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-cyan-300 font-mono mb-2">No Products Found</h3>
                <p className="text-cyan-400/80 font-mono">Try adjusting your search or filter settings</p>
              </div>
            )}
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-mono">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400">Model Number Match</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Name Match</span>
              </div>
              <div className="text-cyan-400/60">|</div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span className="text-red-400">Ozon Higher</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded"></div>
                <span className="text-emerald-400">Ozon Lower</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                <span className="text-cyan-400">Similar</span>
              </div>
              <div className="text-cyan-400/60">|</div>
              <div className="text-cyan-400/80">
                Exchange Rate: <span className="text-cyan-300 font-bold">1 USD = 88 RUB</span>
              </div>
              <div className="text-cyan-400/60">|</div>
              <div className="text-cyan-400/80">
                Showing: <span className="text-emerald-400 font-bold">{filteredProducts.length}</span> of <span className="text-cyan-300 font-bold">{products.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparison;
