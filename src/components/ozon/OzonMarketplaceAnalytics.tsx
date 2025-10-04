import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Package, Users, BarChart3, Search, Filter, ChevronRight } from 'lucide-react';
import { marketplaceAnalyticsService, MarketplaceOverview, CategoryStats, SupplierStats } from '../../services/marketplaceAnalyticsService';

interface OzonMarketplaceAnalyticsProps {
  onBack: () => void;
}

type ViewState = 'menu' | 'categories-list' | 'suppliers-list' | 'category-detail' | 'supplier-detail';

const OzonMarketplaceAnalytics: React.FC<OzonMarketplaceAnalyticsProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<ViewState>('menu');
  const [overview, setOverview] = useState<MarketplaceOverview | null>(null);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'revenue' | 'avgDaysOOS'>('revenue');
  const [minProducts, setMinProducts] = useState<number>(100);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await marketplaceAnalyticsService.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load overview:', err);
      setError('Failed to load marketplace overview');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await marketplaceAnalyticsService.getCategories();
      setCategories(data);
      setViewState('categories-list');
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuppliers = async (threshold?: number) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await marketplaceAnalyticsService.getSuppliersWithMinProducts(threshold || minProducts);
      setSuppliers(data);
      setViewState('suppliers-list');
    } catch (err) {
      console.error('Failed to load suppliers:', err);
      setError('Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMenu = () => {
    setViewState('menu');
    setSearchTerm('');
  };

  const getFilteredAndSortedCategories = () => {
    let filtered = categories.filter(cat =>
      cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'name':
        return filtered.sort((a, b) => a.category.localeCompare(b.category));
      case 'count':
        return filtered.sort((a, b) => b.productCount - a.productCount);
      case 'revenue':
        return filtered.sort((a, b) => b.totalRevenue - a.totalRevenue);
      default:
        return filtered;
    }
  };

  const getFilteredAndSortedSuppliers = () => {
    let filtered = suppliers.filter(sup =>
      sup.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'name':
        return filtered.sort((a, b) => a.supplier.localeCompare(b.supplier));
      case 'count':
        return filtered.sort((a, b) => b.productCount - a.productCount);
      case 'revenue':
        return filtered.sort((a, b) => b.totalRevenue - a.totalRevenue);
      case 'avgDaysOOS':
        return filtered.sort((a, b) => b.averagePrice - a.averagePrice);
      default:
        return filtered;
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-300 font-mono">Loading analytics data...</p>
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

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
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
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg border border-orange-300">
                  <TrendingUp className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                    MARKETPLACE ANALYTICS
                  </h1>
                  <p className="text-cyan-400/80 text-sm font-mono">
                    Intelligence & Insights Dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {overview && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                  <Package className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Categories</h3>
              <p className="text-2xl font-bold text-blue-300 font-mono">{overview.totalCategories}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                  <Users className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Suppliers (50+)</h3>
              <p className="text-2xl font-bold text-emerald-300 font-mono">{suppliers.length || '...'}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg border border-orange-300">
                  <BarChart3 className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Products</h3>
              <p className="text-2xl font-bold text-orange-300 font-mono">{overview.totalProducts.toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg border border-violet-300">
                  <TrendingUp className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">Revenue</h3>
              <p className="text-2xl font-bold text-violet-300 font-mono">{(overview.totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Categories Button */}
          <div
            onClick={loadCategories}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 cursor-pointer hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>

            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-blue-400/30 text-blue-400 text-xs px-2 py-1 rounded font-mono">
                AN01
              </span>
            </div>

            <div className="absolute top-6 left-6 w-4 h-4 border-l-2 border-t-2 border-blue-400/40"></div>
            <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-blue-400/40"></div>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg border border-blue-300 relative group-hover:scale-110 transition-transform duration-300">
                <Package className="w-10 h-10 text-black" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <BarChart3 className="w-3 h-3 text-black" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-blue-300 mb-3 font-mono tracking-wide">
                  CATEGORIES ANALYTICS
                </h3>
                <p className="text-blue-400/80 text-sm leading-relaxed font-mono max-w-sm">
                  Explore all product categories with detailed insights on products, suppliers, and market performance metrics.
                </p>
              </div>

              <div className="bg-gray-800/50 border border-blue-400/30 rounded-lg px-6 py-3 w-full group-hover:bg-blue-400/10 transition-colors duration-300">
                <div className="flex items-center justify-center text-blue-400 text-sm font-mono font-bold space-x-2">
                  <ChevronRight className="w-4 h-4" />
                  <span>EXPLORE CATEGORIES</span>
                </div>
              </div>
            </div>
          </div>

          {/* Suppliers Button */}
          <div
            onClick={loadSuppliers}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-8 cursor-pointer hover:border-cyan-400/60 hover:shadow-cyan-400/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

            <div className="absolute top-4 right-4">
              <span className="bg-gray-800/60 border border-emerald-400/30 text-emerald-400 text-xs px-2 py-1 rounded font-mono">
                AN02
              </span>
            </div>

            <div className="absolute top-6 left-6 w-4 h-4 border-l-2 border-t-2 border-emerald-400/40"></div>
            <div className="absolute bottom-6 right-6 w-4 h-4 border-r-2 border-b-2 border-emerald-400/40"></div>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg border border-emerald-300 relative group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-black" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-black" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-emerald-300 mb-3 font-mono tracking-wide">
                  SUPPLIERS ANALYTICS
                </h3>
                <p className="text-emerald-400/80 text-sm leading-relaxed font-mono max-w-sm">
                  Analyze high-volume suppliers with 50+ products across categories and track their marketplace presence.
                </p>
              </div>

              <div className="bg-gray-800/50 border border-emerald-400/30 rounded-lg px-6 py-3 w-full group-hover:bg-emerald-400/10 transition-colors duration-300">
                <div className="flex items-center justify-center text-emerald-400 text-sm font-mono font-bold space-x-2">
                  <ChevronRight className="w-4 h-4" />
                  <span>EXPLORE SUPPLIERS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-400/30 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-orange-400"></div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-lg shadow-orange-400/50"></div>
              <span className="text-orange-300 font-mono font-bold text-sm">ANALYTICS READY</span>
            </div>
            <div className="text-cyan-400/60 font-mono text-sm">|</div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400/80 font-mono text-sm">MODULES ACTIVE:</span>
              <span className="text-emerald-400 font-mono font-bold">2/2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoriesList = () => {
    const filteredCategories = getFilteredAndSortedCategories();

    return (
      <div className="min-h-screen bg-black p-6" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                         radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
      }}>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg border border-blue-300">
                    <Package className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                      CATEGORIES ANALYTICS
                    </h1>
                    <p className="text-cyan-400/80 text-sm font-mono">
                      {filteredCategories.length} Categories Found
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 border border-cyan-400/50 text-cyan-300 rounded-lg pl-10 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-800 border border-cyan-400/50 text-cyan-300 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="revenue">Sort by Revenue</option>
                  <option value="avgDaysOOS">Sort by Avg Days OOS</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Suppliers List */}
          <div className="grid gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.category}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 hover:border-blue-400/60 hover:shadow-blue-400/20 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-cyan-300 font-mono mb-2">{category.category}</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-cyan-400/60 font-mono">Products:</span>
                        <p className="text-blue-300 font-bold font-mono">{category.productCount}</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60 font-mono">Suppliers:</span>
                        <p className="text-emerald-300 font-bold font-mono">{category.supplierCount}</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60 font-mono">Avg Price:</span>
                        <p className="text-orange-300 font-bold font-mono">{category.averagePrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60 font-mono">Revenue:</span>
                        <p className="text-violet-300 font-bold font-mono">{category.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-12 text-center">
              <Package className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-cyan-300 font-mono mb-2">No Categories Found</h3>
              <p className="text-cyan-400/80 font-mono">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSuppliersList = () => {
    const filteredSuppliers = getFilteredAndSortedSuppliers();

    return (
      <div className="min-h-screen bg-black p-6" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.02) 0%, transparent 50%),
                         radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.01) 0%, transparent 50%)`
      }}>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
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
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border border-emerald-300">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
                      SUPPLIERS ANALYTICS
                    </h1>
                    <p className="text-cyan-400/80 text-sm font-mono">
                      {filteredSuppliers.length} Suppliers (50+ Products)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center justify-end space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-cyan-400" />
                <select
                  value={minProducts}
                  onChange={(e) => {
                    const newThreshold = Number(e.target.value);
                    setMinProducts(newThreshold);
                    loadSuppliers(newThreshold);
                  }}
                  className="bg-gray-800 border border-cyan-400/50 text-cyan-300 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="100">Min 100 Products</option>
                  <option value="75">Min 75 Products</option>
                  <option value="50">Min 50 Products</option>
                  <option value="25">Min 25 Products</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-800 border border-cyan-400/50 text-cyan-300 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="revenue">Sort by Revenue</option>
                  <option value="avgDaysOOS">Sort by Avg Days OOS</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Suppliers List */}
          <div className="grid gap-4">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.supplier}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-6 hover:border-emerald-400/60 hover:shadow-emerald-400/20 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-cyan-300 font-mono mb-2">{supplier.supplier}</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-cyan-400/60 font-mono">Products:</span>
                        <p className="text-emerald-300 font-bold font-mono">{supplier.productCount}</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60 font-mono">Categories:</span>
                        <p className="text-blue-300 font-bold font-mono">{supplier.categoryCount}</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60 font-mono">Avg Days OOS:</span>
                        <p className="text-orange-300 font-bold font-mono">{supplier.averagePrice.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-cyan-400/60 font-mono">Revenue:</span>
                        <p className="text-violet-300 font-bold font-mono">{supplier.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-cyan-400/30 shadow-xl p-12 text-center">
              <Users className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-cyan-300 font-mono mb-2">No Suppliers Found</h3>
              <p className="text-cyan-400/80 font-mono">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  switch (viewState) {
    case 'categories-list':
      return renderCategoriesList();
    case 'suppliers-list':
      return renderSuppliersList();
    default:
      return renderMenu();
  }
};

export default OzonMarketplaceAnalytics;
