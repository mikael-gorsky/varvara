import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, Package, Search, ChevronRight, BarChart3 } from 'lucide-react';
import {
  pricelistAnalyticsService,
  PricelistOverview,
  ProductWithPrices
} from '../../services/pricelistAnalyticsService';

interface PricelistAnalyticsProps {
  onBack: () => void;
}

type ViewState = 'menu' | 'full-pricelist';

const PricelistAnalytics: React.FC<PricelistAnalyticsProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<ViewState>('menu');
  const [overview, setOverview] = useState<PricelistOverview | null>(null);
  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [allCustomers, setAllCustomers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (viewState === 'full-pricelist' && products.length === 0 && !isLoading) {
      loadProducts();
    }
  }, [viewState]);

  const loadOverview = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await pricelistAnalyticsService.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load overview:', err);
      setError('Failed to load pricelist overview');
    } finally {
      setIsLoading(false);
    }
  };


  const loadProducts = async (search?: string) => {
    setIsLoading(true);
    setError('');
    try {
      const [productsData, customersData] = await Promise.all([
        pricelistAnalyticsService.getProductsWithPrices(search),
        pricelistAnalyticsService.getAllCustomers()
      ]);
      setProducts(productsData);
      setAllCustomers(customersData);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMenu = () => {
    setViewState('menu');
    setSearchTerm('');
  };

  const handleSearch = () => {
    if (viewState === 'full-pricelist') {
      loadProducts(searchTerm);
    }
  };


  if (isLoading && !overview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-300 font-mono">Loading pricelist data...</p>
        </div>
      </div>
    );
  }

  const renderMenu = () => (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
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
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg border border-cyan-300">
                  <DollarSign className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    PRICELIST ANALYTICS
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    Customer Price Intelligence Dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {overview && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                  <Package className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Products</h3>
              <p className="text-2xl font-bold text-blue-300 font-mono">{overview.totalProducts.toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                  <DollarSign className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Min Price</h3>
              <p className="text-2xl font-bold text-emerald-300 font-mono">{overview.priceRange.min.toFixed(0)}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg border border-orange-300">
                  <DollarSign className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Max Price</h3>
              <p className="text-2xl font-bold text-orange-300 font-mono">{overview.priceRange.max.toFixed(0)}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg border border-violet-300">
                  <DollarSign className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Avg Price</h3>
              <p className="text-2xl font-bold text-violet-300 font-mono">{overview.priceRange.avg.toFixed(0)}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          <div
            onClick={() => setViewState('full-pricelist')}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 cursor-pointer hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>

            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-cyan-400/30 text-cyan-400 text-xs px-2 py-1 rounded font-mono">
                PL01
              </span>
            </div>

            <div className="absolute top-6 left-6 w-4 h-4 border-l-2 border-t-2 border-cyan-400/40"></div>
            <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-cyan-400/40"></div>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg border border-cyan-300 relative group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-10 h-10 text-black" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <BarChart3 className="w-3 h-3 text-black" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-cyan-300 mb-3 font-mono tracking-wide">
                  FULL PRICELIST
                </h3>
                <p className="text-cyan-400/80 text-sm leading-relaxed font-mono max-w-sm">
                  View complete product catalog with customer pricing comparison side-by-side.
                </p>
              </div>

              <div className="bg-gray-800/50 border border-cyan-400/30 rounded-lg px-6 py-3 w-full group-hover:bg-cyan-400/10 transition-colors duration-300">
                <div className="flex items-center justify-center text-cyan-400 text-sm font-mono font-bold space-x-2">
                  <ChevronRight className="w-4 h-4" />
                  <span>VIEW PRICELIST</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
              <span className="text-cyan-300 font-mono font-bold text-sm">PRICELIST ANALYTICS READY</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400/80 font-mono text-sm">MODULE ACTIVE:</span>
              <span className="text-emerald-400 font-mono font-bold">FULL PRICELIST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFullPricelist = () => (
    <div className="min-h-screen bg-black p-6" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                       radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
    }}>
      <div className="max-w-full mx-auto space-y-6">

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToMenu}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-cyan-400/50 rounded text-cyan-300 hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 font-mono text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK TO MENU</span>
              </button>
              <div className="h-6 border-l border-cyan-400/30"></div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg border border-cyan-300">
                  <DollarSign className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    FULL PRICELIST
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    {products.length} Products Found
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
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
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-6 py-2 rounded-lg font-mono font-bold text-sm hover:from-cyan-400 hover:to-blue-400 transition-all duration-200"
            >
              SEARCH
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-300 font-mono">Loading products...</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/80 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase tracking-wider border-b border-cyan-400/30">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase tracking-wider border-b border-cyan-400/30">Article</th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase tracking-wider border-b border-cyan-400/30">Product Name</th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-cyan-400 uppercase tracking-wider border-b border-cyan-400/30">Category</th>
                    {allCustomers.map(customer => (
                      <th key={customer} className="px-4 py-3 text-right text-xs font-mono text-emerald-400 uppercase tracking-wider border-b border-cyan-400/30 whitespace-nowrap">
                        {customer}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => (
                    <tr key={product.id} className={`hover:bg-gray-800/50 transition-colors duration-200 ${idx % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
                      <td className="px-4 py-3 text-sm font-mono text-cyan-300 border-b border-cyan-400/10">{product.code}</td>
                      <td className="px-4 py-3 text-sm font-mono text-cyan-300 border-b border-cyan-400/10">{product.article || '-'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-cyan-300 border-b border-cyan-400/10 max-w-xs truncate">{product.name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-orange-300 border-b border-cyan-400/10">{product.category || '-'}</td>
                      {allCustomers.map(customer => {
                        const price = product.customerPrices[customer];
                        const isLowest = price === product.lowestPrice && product.lowestPrice !== product.highestPrice;
                        const isHighest = price === product.highestPrice && product.lowestPrice !== product.highestPrice;

                        return (
                          <td
                            key={customer}
                            className={`px-4 py-3 text-sm font-mono text-right border-b border-cyan-400/10 ${
                              price === null || price === undefined
                                ? 'text-gray-600'
                                : isLowest
                                  ? 'text-emerald-400 font-bold'
                                  : isHighest
                                    ? 'text-orange-400 font-bold'
                                    : 'text-cyan-300'
                            }`}
                          >
                            {price !== null && price !== undefined ? price.toFixed(2) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-cyan-300 font-mono mb-2">No Products Found</h3>
                <p className="text-cyan-400/80 font-mono">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        )}

        {products.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4">
            <div className="flex items-center justify-center space-x-6 text-sm font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded"></div>
                <span className="text-emerald-400">Lowest Price</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span className="text-orange-400">Highest Price</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span className="text-gray-400">No Price</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );


  switch (viewState) {
    case 'full-pricelist':
      return renderFullPricelist();
    default:
      return renderMenu();
  }
};

export default PricelistAnalytics;
