import React, { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  category: string;
  revenue_rub: number;
  revenue_usd: number;
  margin_rub: number;
  margin_usd: number;
  margin_percent: number;
  has_anomaly?: boolean;
  anomaly_message?: string;
}

interface KPIData {
  total_revenue_rub: number;
  total_revenue_usd: number;
  total_margin_rub: number;
  total_margin_usd: number;
  avg_margin_percent: number;
  active_customers: number;
}

interface FilterState {
  period: string;
  category: string;
  compare_to: string | null;
}

const MarginAnalyticsModule: React.FC = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    period: '2026-01',
    category: 'all',
    compare_to: null,
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sortBy, setSortBy] = useState<'margin_rub' | 'revenue_rub' | 'margin_percent'>('margin_rub');

  // Mock data - will be replaced with Supabase queries
  const exchangeRate = 92.3; // USD/RUB for period

  const kpiData: KPIData = {
    total_revenue_rub: 28487599,
    total_revenue_usd: 28487599 / exchangeRate,
    total_margin_rub: 10060830,
    total_margin_usd: 10060830 / exchangeRate,
    avg_margin_percent: 35.3,
    active_customers: 42,
  };

  const customers: Customer[] = [
    {
      id: '1',
      name: 'Интернет Решения',
      category: 'E-commerce',
      revenue_rub: 3906946,
      revenue_usd: 3906946 / exchangeRate,
      margin_rub: 1104725,
      margin_usd: 1104725 / exchangeRate,
      margin_percent: 28.3,
    },
    {
      id: '2',
      name: 'Бердандер',
      category: 'Manufacturing',
      revenue_rub: 2450000,
      revenue_usd: 2450000 / exchangeRate,
      margin_rub: 850000,
      margin_usd: 850000 / exchangeRate,
      margin_percent: 34.7,
      has_anomaly: true,
      anomaly_message: 'MARGIN DROP: -22% vs last month',
    },
  ];

  const formatCurrency = (amount: number, currency: 'RUB' | 'USD'): string => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      return new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Page Title */}
      <div className="mb-8">
        <h2
          className="text-page-title-mobile md:text-page-title-desktop uppercase mb-2"
          style={{ color: 'var(--accent)' }}
        >
          MARGIN ANALYTICS
        </h2>
        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
          Exchange rate: {exchangeRate.toFixed(2)} RUB/USD ({filterState.period} avg)
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div
          className="p-6 min-h-[140px] flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            TOTAL REVENUE
          </p>
          <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(kpiData.total_revenue_usd, 'USD')}
          </p>
          <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
            RUB {formatCurrency(kpiData.total_revenue_rub, 'RUB')}
          </p>
        </div>

        {/* Total Margin */}
        <div
          className="p-6 min-h-[140px] flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            TOTAL MARGIN
          </p>
          <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(kpiData.total_margin_usd, 'USD')}
          </p>
          <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
            RUB {formatCurrency(kpiData.total_margin_rub, 'RUB')}
          </p>
        </div>

        {/* Margin % */}
        <div
          className="p-6 min-h-[140px] flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            MARGIN %
          </p>
          <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
            {formatPercent(kpiData.avg_margin_percent)}
          </p>
        </div>

        {/* Active Customers */}
        <div
          className="p-6 min-h-[140px] flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <p className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
            ACTIVE CUSTOMERS
          </p>
          <p className="text-kpi-value my-2" style={{ color: 'var(--text-primary)' }}>
            {kpiData.active_customers}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="p-6 mb-6 space-y-4 lg:space-y-0 lg:flex lg:gap-4 lg:items-end"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Period Filter */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            PERIOD
          </p>
          <select
            className="w-full p-3 text-body bg-transparent border"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            value={filterState.period}
            onChange={(e) => setFilterState({ ...filterState, period: e.target.value })}
          >
            <option value="2026-01">Jan 2026</option>
            <option value="2025-12">Dec 2025</option>
            <option value="2025-11">Nov 2025</option>
            <option value="2025-10">Oct 2025</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
            CATEGORY
          </p>
          <select
            className="w-full p-3 text-body bg-transparent border"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--divider-standard)',
              color: 'var(--text-primary)',
            }}
            value={filterState.category}
            onChange={(e) => setFilterState({ ...filterState, category: e.target.value })}
          >
            <option value="all">All Categories</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Retail">Retail</option>
          </select>
        </div>

        {/* Apply Button */}
        <button
          className="w-full lg:w-auto px-6 py-3 text-body uppercase transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#E91E63', color: 'white' }}
          onClick={() => {
            // Trigger data reload
            console.log('Applying filters:', filterState);
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Customer List */}
      <div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h3 className="text-section-title uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>
          CUSTOMERS BY MARGIN
        </h3>
        <div className="space-y-4">
          {customers
            .sort((a, b) => {
              if (sortBy === 'margin_rub') return b.margin_rub - a.margin_rub;
              if (sortBy === 'revenue_rub') return b.revenue_rub - a.revenue_rub;
              return b.margin_percent - a.margin_percent;
            })
            .map((customer, index) => (
              <div
                key={customer.id}
                className="p-4 border-l-2 transition-colors duration-fast hover:bg-[var(--bg-primary)] cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: '#E91E63',
                }}
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <span className="text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="flex-1 min-w-0">
                    {/* Customer Name */}
                    <p className="text-body mb-1" style={{ color: 'var(--text-primary)' }}>
                      {customer.name}
                    </p>

                    {/* Category */}
                    <p className="text-label-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
                      {customer.category}
                    </p>

                    {/* Metrics Row */}
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
                          REVENUE
                        </p>
                        <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(customer.revenue_usd, 'USD')}{' '}
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            RUB {formatCurrency(customer.revenue_rub, 'RUB')}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
                          MARGIN
                        </p>
                        <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(customer.margin_usd, 'USD')}{' '}
                          <span style={{ color: 'var(--text-tertiary)' }}>
                            RUB {formatCurrency(customer.margin_rub, 'RUB')}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
                          MARGIN %
                        </p>
                        <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                          {formatPercent(customer.margin_percent)}
                        </p>
                      </div>
                    </div>

                    {/* Anomaly Alert */}
                    {customer.has_anomaly && (
                      <div
                        className="mt-2 p-2 border-l-2"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--status-warning)',
                        }}
                      >
                        <p className="text-label-xs uppercase" style={{ color: 'var(--status-warning)' }}>
                          ⚠ {customer.anomaly_message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MarginAnalyticsModule;
