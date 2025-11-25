import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Package, Users, BarChart3 } from 'lucide-react';
import { marketplaceAnalyticsService, MarketplaceOverview, CategoryStats, SupplierStats } from '../../services/marketplaceAnalyticsService';

interface OzonMarketplaceAnalyticsProps {
  onBack?: () => void;
}

type ViewState = 'menu' | 'categories-list' | 'suppliers-list';

const OzonMarketplaceAnalytics: React.FC<OzonMarketplaceAnalyticsProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<ViewState>('menu');
  const [overview, setOverview] = useState<MarketplaceOverview | null>(null);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'revenue'>('revenue');

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

  const loadSuppliers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await marketplaceAnalyticsService.getSuppliersWithMinProducts(100);
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
      default:
        return filtered;
    }
  };

  if (isLoading && !overview) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 'var(--spacing-3)'
      }}>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  const renderMenu = () => (
    <div style={{ padding: 'var(--spacing-3)' }}>
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase" style={{ color: 'var(--accent)' }}>
          COMPANIES
        </h2>
      </div>

      {overview && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-3)'
        }}>
          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <Package size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Categories</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {overview.totalCategories}
            </p>
          </div>

          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <Users size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Suppliers (100+)</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {overview.suppliersOver100}
            </p>
          </div>

          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Products</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {overview.totalProducts.toLocaleString()}
            </p>
          </div>

          <div style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-1)' }}>
              <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>Total Revenue</span>
            </div>
            <p className="text-kpi-value-mobile md:text-kpi-value-desktop" style={{ color: 'var(--text-primary)' }}>
              {(overview.totalRevenue / 1_000_000).toFixed(1)}M
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        <button
          onClick={loadCategories}
          style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)',
            color: 'var(--text-primary)',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-1)';
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            e.currentTarget.style.borderColor = 'var(--divider-standard)';
          }}
        >
          <span className="text-menu-l2">VIEW CATEGORIES</span>
        </button>

        <button
          onClick={loadSuppliers}
          style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--divider-standard)',
            color: 'var(--text-primary)',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-1)';
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            e.currentTarget.style.borderColor = 'var(--divider-standard)';
          }}
        >
          <span className="text-menu-l2">VIEW SUPPLIERS</span>
        </button>
      </div>
    </div>
  );

  const renderCategoriesList = () => {
    const filtered = getFilteredAndSortedCategories();

    return (
      <div style={{ padding: 'var(--spacing-3)' }}>
        <div style={{ marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <button
            onClick={handleBackToMenu}
            style={{
              padding: 'var(--spacing-1)',
              backgroundColor: 'transparent',
              border: '1px solid var(--divider-standard)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-0-5)',
            }}
          >
            <ArrowLeft size={16} />
            <span className="text-body">BACK</span>
          </button>
          <h2 className="text-subsection uppercase" style={{ color: 'var(--accent)' }}>
            CATEGORIES
          </h2>
        </div>

        <div style={{ marginBottom: 'var(--spacing-2)', display: 'flex', gap: 'var(--spacing-1)' }}>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: 'var(--spacing-1)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            className="text-body"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: 'var(--spacing-1)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            className="text-body"
          >
            <option value="revenue">By Revenue</option>
            <option value="count">By Count</option>
            <option value="name">By Name</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider-strong)' }}>
                <th className="text-label uppercase" style={{ textAlign: 'left', padding: 'var(--spacing-1)', color: 'var(--text-tertiary)' }}>
                  Category
                </th>
                <th className="text-label uppercase" style={{ textAlign: 'right', padding: 'var(--spacing-1)', color: 'var(--text-tertiary)' }}>
                  Products
                </th>
                <th className="text-label uppercase" style={{ textAlign: 'right', padding: 'var(--spacing-1)', color: 'var(--text-tertiary)' }}>
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr
                  key={cat.category}
                  style={{ borderBottom: '1px solid var(--divider-standard)' }}
                >
                  <td className="text-body" style={{ padding: 'var(--spacing-1)', color: 'var(--text-primary)' }}>
                    {cat.category}
                  </td>
                  <td className="text-body" style={{ padding: 'var(--spacing-1)', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    {cat.productCount}
                  </td>
                  <td className="text-body" style={{ padding: 'var(--spacing-1)', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    ₽{(cat.totalRevenue / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSuppliersList = () => {
    const filtered = getFilteredAndSortedSuppliers();

    return (
      <div style={{ padding: 'var(--spacing-3)' }}>
        <div style={{ marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <button
            onClick={handleBackToMenu}
            style={{
              padding: 'var(--spacing-1)',
              backgroundColor: 'transparent',
              border: '1px solid var(--divider-standard)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-0-5)',
            }}
          >
            <ArrowLeft size={16} />
            <span className="text-body">BACK</span>
          </button>
          <h2 className="text-subsection uppercase" style={{ color: 'var(--accent)' }}>
            SUPPLIERS
          </h2>
        </div>

        <div style={{ marginBottom: 'var(--spacing-2)', display: 'flex', gap: 'var(--spacing-1)' }}>
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: 'var(--spacing-1)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            className="text-body"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: 'var(--spacing-1)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            className="text-body"
          >
            <option value="revenue">By Revenue</option>
            <option value="count">By Count</option>
            <option value="name">By Name</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider-strong)' }}>
                <th className="text-label uppercase" style={{ textAlign: 'left', padding: 'var(--spacing-1)', color: 'var(--text-tertiary)' }}>
                  Supplier
                </th>
                <th className="text-label uppercase" style={{ textAlign: 'right', padding: 'var(--spacing-1)', color: 'var(--text-tertiary)' }}>
                  Products
                </th>
                <th className="text-label uppercase" style={{ textAlign: 'right', padding: 'var(--spacing-1)', color: 'var(--text-tertiary)' }}>
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sup) => (
                <tr
                  key={sup.supplier}
                  style={{ borderBottom: '1px solid var(--divider-standard)' }}
                >
                  <td className="text-body" style={{ padding: 'var(--spacing-1)', color: 'var(--text-primary)' }}>
                    {sup.supplier}
                  </td>
                  <td className="text-body" style={{ padding: 'var(--spacing-1)', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    {sup.productCount}
                  </td>
                  <td className="text-body" style={{ padding: 'var(--spacing-1)', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    ₽{(sup.totalRevenue / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
