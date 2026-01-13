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

const DesktopDashboard: React.FC = () => {
  return (
    <div className="p-8">
      <DashboardSection
        title="performance overview"
        subtitle="REAL-TIME TRADE ANALYTICS • Q4 2024"
        actions={
          <>
            <button
              className="px-4 py-2 text-label uppercase border transition-colors"
              style={{
                borderColor: 'var(--divider-strong)',
                color: 'var(--text-primary)',
              }}
            >
              EXPORT REPORT
            </button>
            <button
              className="px-4 py-2 text-label uppercase transition-colors"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
              }}
            >
              UPDATE DATA
            </button>
          </>
        }
      >
        <DashboardGrid columns={5} gap="md">
          <MetricCard
            label="TOTAL REVENUE"
            value="$1.2M"
            chartType="bar"
            chartData={[2, 3, 4, 3, 5, 4]}
          />
          <MetricCard
            label="CONVERSION RATE"
            value="4.2%"
            chartType="line"
            chartData={[3.2, 3.5, 3.8, 4.0, 4.2]}
          />
          <MetricCard
            label="ACTIVE USERS"
            value="+842"
            chartType="bar"
            chartData={[4, 5, 3, 4, 6, 5, 4]}
          />
          <MetricCard
            label="INVENTORY FLOW"
            value="92%"
            chartType="progress"
            current={92}
            goal={100}
          />
          <MetricCard
            label="NET MARGIN"
            value="18.5%"
            chartType="line"
            chartData={[16, 17, 17.5, 18, 18.5]}
          />
          <MetricCard
            label="PENDING ORDERS"
            value="241"
            chartType="bar"
            chartData={[3, 4, 5, 4, 3, 5]}
          />
          <MetricCard
            label="SATISFACTION"
            value="4.8"
            chartType="stars"
            filled={4.8}
          />
          <MetricCard
            label="RETURN RATE"
            value="1.2%"
            valueColor="var(--accent)"
            chartType="progress"
            current={12}
            goal={100}
          />
          <MetricCard
            label="AVG TICKET"
            value="$142"
            chartType="bar"
            chartData={[3, 4, 3, 5]}
          />
          <MetricCard
            label="LOGISTICS"
            value="99%"
            chartType="circular"
            current={99}
            goal={100}
          />
        </DashboardGrid>
      </DashboardSection>
    </div>
  );
};

export default Dashboard;
