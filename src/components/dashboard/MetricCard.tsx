import React from 'react';
import {
  SparklineLine,
  SparklineBar,
  SparklineArea,
  ProgressBar,
  DotIndicator,
  StarRating,
  CircularProgress,
} from './SparklineChart';

export type ChartType = 'line' | 'bar' | 'area' | 'progress' | 'dots' | 'stars' | 'circular' | 'none';

interface MetricCardProps {
  label: string;
  value: string | number;
  chartType?: ChartType;
  chartData?: number[];
  chartColor?: string;
  // For progress type
  current?: number;
  goal?: number;
  // For dots/stars type
  filled?: number;
  total?: number;
  // Styling
  valueColor?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  chartType = 'none',
  chartData = [],
  chartColor,
  current,
  goal,
  filled,
  total,
  valueColor,
  className = '',
}) => {
  const renderChart = () => {
    const color = chartColor || 'var(--accent)';

    switch (chartType) {
      case 'line':
        return <SparklineLine data={chartData} color={color} width={80} height={30} />;
      case 'bar':
        return <SparklineBar data={chartData} color={color} width={80} height={30} />;
      case 'area':
        return <SparklineArea data={chartData} color={color} width={120} height={40} />;
      case 'progress':
        return current !== undefined && goal !== undefined ? (
          <ProgressBar current={current} goal={goal} color={color} width={80} />
        ) : null;
      case 'dots':
        return filled !== undefined && total !== undefined ? (
          <DotIndicator filled={filled} total={total} color={color} />
        ) : null;
      case 'stars':
        return filled !== undefined ? (
          <StarRating rating={filled} color={color} />
        ) : null;
      case 'circular':
        return current !== undefined && goal !== undefined ? (
          <CircularProgress percentage={(current / goal) * 100} color={color} size={36} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-4 lg:p-5 flex flex-col h-full ${className}`}
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      {/* Label */}
      <p
        className="text-label-xs uppercase mb-2"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className="text-kpi-value mb-3"
        style={{ color: valueColor || 'var(--text-primary)' }}
      >
        {value}
      </p>

      {/* Chart */}
      <div className="mt-auto">
        {renderChart()}
      </div>
    </div>
  );
};

// Compact variant for mobile
export const MetricCardCompact: React.FC<MetricCardProps> = ({
  label,
  value,
  chartType = 'none',
  chartData = [],
  chartColor,
  current,
  goal,
  filled,
  total,
  valueColor,
}) => {
  const color = chartColor || 'var(--accent)';

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <SparklineLine data={chartData} color={color} width={100} height={40} />;
      case 'bar':
        return <SparklineBar data={chartData} color={color} width={100} height={40} />;
      case 'area':
        return <SparklineArea data={chartData} color={color} width={150} height={50} />;
      case 'progress':
        return current !== undefined && goal !== undefined ? (
          <ProgressBar current={current} goal={goal} color={color} width={100} />
        ) : null;
      case 'dots':
        return filled !== undefined && total !== undefined ? (
          <DotIndicator filled={filled} total={total} color={color} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="py-4 border-b" style={{ borderColor: 'var(--divider-standard)' }}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <p
          className="text-body-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {label}
        </p>
        <p
          className="text-kpi-value text-right"
          style={{ color: valueColor || 'var(--text-primary)' }}
        >
          {value}
        </p>
      </div>

      {/* Chart row */}
      {chartType !== 'none' && (
        <div className="mt-2">
          {renderChart()}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
