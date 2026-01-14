import React from 'react';
import {
  DashboardGrid,
  DashboardSection,
  MetricCard,
  MetricCardCompact,
  AIInsightCard,
} from '../components/dashboard';
import { ProgressBar } from '../components/dashboard/SparklineChart';

// Sample data for demonstration
const metricsData = {
  revenue: {
    value: '$124.5k',
    data: [20, 35, 25, 45, 30, 55, 40, 60, 50, 65, 55, 70],
  },
  orders: {
    value: '842',
    data: [3, 4, 3, 5, 4, 5],
  },
  conversion: {
    value: '3.2%',
    data: [2.1, 2.5, 2.3, 2.8, 2.6, 3.0, 2.8, 3.2],
  },
  stockItems: {
    value: '12,402',
    current: 85,
    goal: 100,
  },
  active: {
    value: '48',
    data: [2, 3, 4, 3, 5],
  },
  grossMargin: {
    value: '24.2%',
    data: [20, 22, 21, 23, 22, 24, 23, 24.2],
  },
  returns: {
    value: '0.8%',
    filled: 1,
    total: 4,
  },
  avgLeadTime: {
    value: '4.2',
    unit: 'days',
  },
};

interface DashboardProps {
  isMobile?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ isMobile = false }) => {
  if (isMobile) {
    return <MobileDashboard />;
  }

  return <DesktopDashboard />;
};

const MobileDashboard: React.FC = () => {
  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-body-sm" style={{ color: 'var(--text-tertiary)' }}>
          {'< back'}
        </p>
        <p className="text-label-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          home / <span style={{ color: 'var(--text-primary)' }}>dashboard</span>
        </p>
      </div>

      {/* Section Label */}
      <p className="text-label uppercase mb-2" style={{ color: 'var(--accent)' }}>
        OVERVIEW
      </p>

      {/* Title */}
      <h1
        className="text-page-title-mobile lowercase mb-8"
        style={{ color: 'var(--text-primary)' }}
      >
        dashboard
      </h1>

      {/* Metrics - Mobile stacked layout */}
      <MetricCardCompact
        label="revenue"
        value={metricsData.revenue.value}
        chartType="line"
        chartData={metricsData.revenue.data}
      />

      <div className="grid grid-cols-2 gap-4 py-4 border-b" style={{ borderColor: 'var(--divider-standard)' }}>
        <div>
          <p className="text-body-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>orders</p>
          <div className="mb-2">
            <svg width="80" height="30">
              {metricsData.orders.data.map((v, i) => (
                <rect
                  key={i}
                  x={i * 14}
                  y={30 - v * 5}
                  width={10}
                  height={v * 5}
                  fill={i === metricsData.orders.data.length - 1 ? 'var(--text-primary)' : 'var(--text-tertiary)'}
                />
              ))}
            </svg>
          </div>
          <p className="text-kpi-value" style={{ color: 'var(--text-primary)' }}>
            {metricsData.orders.value}
          </p>
        </div>
        <div>
          <p className="text-body-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>conversion</p>
          <div className="mb-2">
            <svg width="80" height="30">
              <polyline
                points={metricsData.conversion.data.map((v, i) => `${i * 11},${30 - v * 8}`).join(' ')}
                fill="none"
                stroke="var(--text-tertiary)"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
            </svg>
          </div>
          <p className="text-kpi-value" style={{ color: 'var(--text-primary)' }}>
            {metricsData.conversion.value}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-b" style={{ borderColor: 'var(--divider-standard)' }}>
        <div>
          <p className="text-body-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>stock items</p>
          <ProgressBar current={metricsData.stockItems.current} goal={metricsData.stockItems.goal} width={100} color="var(--text-primary)" />
          <p className="text-kpi-value mt-2" style={{ color: 'var(--text-primary)' }}>
            {metricsData.stockItems.value}
          </p>
        </div>
        <div>
          <p className="text-body-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>active</p>
          <div className="mb-2">
            <svg width="80" height="30">
              {metricsData.active.data.map((v, i) => (
                <rect
                  key={i}
                  x={i * 18}
                  y={30 - v * 5}
                  width={14}
                  height={v * 5}
                  fill={i >= metricsData.active.data.length - 2 ? 'var(--text-primary)' : 'var(--text-tertiary)'}
                />
              ))}
            </svg>
          </div>
          <p className="text-kpi-value" style={{ color: 'var(--text-primary)' }}>
            {metricsData.active.value}
          </p>
        </div>
      </div>

      <MetricCardCompact
        label="gross margin"
        value={metricsData.grossMargin.value}
        chartType="area"
        chartData={metricsData.grossMargin.data}
      />

      <div className="grid grid-cols-2 gap-4 py-4 border-b" style={{ borderColor: 'var(--divider-standard)' }}>
        <div>
          <p className="text-body-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>returns</p>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: i < 1 ? 'var(--text-primary)' : 'var(--surface-2)' }}
              />
            ))}
          </div>
          <p className="text-kpi-value" style={{ color: 'var(--text-primary)' }}>
            {metricsData.returns.value}
          </p>
        </div>
        <div>
          <p className="text-body-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>avg lead time</p>
          <p className="text-kpi-value-lg" style={{ color: 'var(--text-primary)' }}>
            {metricsData.avgLeadTime.value}
            <span className="text-body-sm ml-1" style={{ color: 'var(--text-tertiary)' }}>
              {metricsData.avgLeadTime.unit}
            </span>
          </p>
        </div>
      </div>

      {/* Fulfillment Target */}
      <div className="py-4 border-b" style={{ borderColor: 'var(--divider-standard)' }}>
        <p className="text-body-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
          fulfillment target
        </p>
        <ProgressBar current={92} goal={100} width={300} color="var(--accent)" />
        <div className="flex justify-between mt-2">
          <span className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>CURRENT: 92%</span>
          <span className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>GOAL: 95%</span>
        </div>
      </div>

      {/* AI Insight */}
      <div className="mt-6">
        <AIInsightCard
          variant="compact"
          message={
            <>
              AI predicts inventory shortage on <span className="underline">Product_X</span> in 12 days based on current velocity.
            </>
          }
        />
      </div>
    </div>
  );
};

// Static data for dashboard
const salesData = [
  { year: '2023', sales: 6285447 },
  { year: '2024', sales: 7008763 },
  { year: '2025', sales: 7265397 },
];

const productMixData = [
  { category: 'Office Kit equipment', y2023: 58.4, y2024: 65.9, y2025: 61.0 },
  { category: 'Accessories', y2023: 17.5, y2024: 16.2, y2025: 24.3 },
  { category: 'RENZ', y2023: 8.1, y2024: 5.5, y2025: 6.1 },
  { category: 'HSM', y2023: 7.9, y2024: 6.6, y2025: 4.5 },
  { category: 'Other', y2023: 8.1, y2024: 5.8, y2025: 4.1 },
];

const channelData = [
  { channel: 'Retail chains', salesShare: 63, profitShare: 78 },
  { channel: 'Marketplaces', salesShare: 22, profitShare: 3.5 },
  { channel: 'Regions', salesShare: 9, profitShare: 11 },
  { channel: 'Direct customers', salesShare: 4, profitShare: 5.5 },
  { channel: 'Tenders', salesShare: 1.2, profitShare: 1.7 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const DesktopDashboard: React.FC = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Sales Volume by Year */}
      <div
        className="p-4 md:p-6 border"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--divider-standard)' }}
      >
        <h2
          className="text-body-lg md:text-section-title mb-4 md:mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          Sales Volume, by Year
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {salesData.map((item, index) => (
            <div
              key={item.year}
              className="p-4 border"
              style={{ borderColor: 'var(--divider-standard)' }}
            >
              <p className="text-label uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>
                {item.year}
              </p>
              <p
                className="text-kpi-value md:text-kpi-value-lg"
                style={{ color: index === salesData.length - 1 ? '#E91E63' : 'var(--text-primary)' }}
              >
                {formatCurrency(item.sales)}
              </p>
              {/* Mini bar */}
              <div className="mt-3 h-2 bg-surface-2" style={{ backgroundColor: 'var(--surface-2)' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${(item.sales / Math.max(...salesData.map(d => d.sales))) * 100}%`,
                    backgroundColor: index === salesData.length - 1 ? '#E91E63' : 'var(--text-tertiary)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Mix by Year */}
      <div
        className="p-4 md:p-6 border"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--divider-standard)' }}
      >
        <h2
          className="text-body-lg md:text-section-title mb-4 md:mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          Product Mix by Year
        </h2>

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider-standard)' }}>
                <th className="text-left py-3 text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  Category
                </th>
                <th className="text-right py-3 text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  2023
                </th>
                <th className="text-right py-3 text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  2024
                </th>
                <th className="text-right py-3 text-label uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  2025
                </th>
              </tr>
            </thead>
            <tbody>
              {productMixData.map((item, index) => (
                <tr
                  key={item.category}
                  style={{ borderBottom: index < productMixData.length - 1 ? '1px solid var(--divider-standard)' : 'none' }}
                >
                  <td className="py-3 text-body" style={{ color: 'var(--text-primary)' }}>
                    {item.category}
                  </td>
                  <td className="py-3 text-body text-right" style={{ color: 'var(--text-secondary)' }}>
                    {item.y2023}%
                  </td>
                  <td className="py-3 text-body text-right" style={{ color: 'var(--text-secondary)' }}>
                    {item.y2024}%
                  </td>
                  <td className="py-3 text-body text-right font-medium" style={{ color: '#E91E63' }}>
                    {item.y2025}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {productMixData.map((item) => (
            <div
              key={item.category}
              className="p-3 border"
              style={{ borderColor: 'var(--divider-standard)' }}
            >
              <p className="text-body font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {item.category}
              </p>
              <div className="flex justify-between text-body-sm">
                <span style={{ color: 'var(--text-tertiary)' }}>2023: {item.y2023}%</span>
                <span style={{ color: 'var(--text-tertiary)' }}>2024: {item.y2024}%</span>
                <span style={{ color: '#E91E63' }}>2025: {item.y2025}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel Performance */}
      <div
        className="p-4 md:p-6 border"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--divider-standard)' }}
      >
        <h2
          className="text-body-lg md:text-section-title mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Channel Performance
        </h2>
        <p className="text-label-xs uppercase mb-4 md:mb-6" style={{ color: 'var(--text-tertiary)' }}>
          JANUARY - NOVEMBER 2025
        </p>

        {/* Comparison chart - works on both mobile and desktop */}
        <div className="space-y-4">
          {channelData.map((item) => (
            <div key={item.channel} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-body" style={{ color: 'var(--text-primary)' }}>
                  {item.channel}
                </span>
                <div className="flex gap-4 text-body-sm">
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    Sales: <strong>{item.salesShare}%</strong>
                  </span>
                  <span style={{ color: '#E91E63' }}>
                    Profit: <strong>{item.profitShare}%</strong>
                  </span>
                </div>
              </div>
              {/* Stacked comparison bar */}
              <div className="relative h-8 flex" style={{ backgroundColor: 'var(--surface-2)' }}>
                {/* Sales bar */}
                <div
                  className="h-full flex items-center justify-end pr-2"
                  style={{
                    width: `${item.salesShare}%`,
                    backgroundColor: 'var(--surface-3)',
                  }}
                >
                  <span className="text-label-xs" style={{ color: 'var(--text-primary)' }}>
                    {item.salesShare}%
                  </span>
                </div>
                {/* Profit indicator line */}
                <div
                  className="absolute top-0 bottom-0 w-1"
                  style={{
                    left: `${item.profitShare}%`,
                    backgroundColor: '#E91E63',
                  }}
                />
                {/* Profit label */}
                <div
                  className="absolute top-0 bottom-0 flex items-center"
                  style={{
                    left: `${item.profitShare + 1}%`,
                  }}
                >
                  <span className="text-label-xs px-1 py-0.5" style={{ backgroundColor: '#E91E63', color: 'white' }}>
                    {item.profitShare}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t" style={{ borderColor: 'var(--divider-standard)' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: 'var(--surface-3)' }} />
            <span className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>Share of Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1" style={{ backgroundColor: '#E91E63' }} />
            <span className="text-label-xs" style={{ color: 'var(--text-tertiary)' }}>Share of Profit (marker)</span>
          </div>
        </div>

        {/* Insight text */}
        <div
          className="mt-4 p-3 text-body-sm"
          style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-secondary)' }}
        >
          <strong style={{ color: '#E91E63' }}>Insight:</strong> Retail chains generate 63% of sales but 78% of profit.
          Marketplaces have high sales (22%) but low profitability (3.5%).
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
