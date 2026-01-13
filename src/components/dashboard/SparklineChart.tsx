import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

// Line chart sparkline
export const SparklineLine: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 40,
  color = 'var(--text-primary)',
  strokeWidth = 1.5,
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Bar chart sparkline
export const SparklineBar: React.FC<SparklineProps & { barGap?: number }> = ({
  data,
  width = 100,
  height = 40,
  color = 'var(--text-primary)',
  barGap = 4,
}) => {
  if (data.length < 1) return null;

  const max = Math.max(...data);
  const barWidth = (width - barGap * (data.length - 1)) / data.length;

  return (
    <svg width={width} height={height}>
      {data.map((value, index) => {
        const barHeight = (value / max) * height;
        const x = index * (barWidth + barGap);
        const y = height - barHeight;
        const isLast = index === data.length - 1;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={isLast ? color : 'var(--text-tertiary)'}
            rx={0}
          />
        );
      })}
    </svg>
  );
};

// Area chart sparkline
export const SparklineArea: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 40,
  color = 'var(--text-primary)',
  strokeWidth = 1.5,
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const linePoints = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Create closed path for area fill
  const areaPath = `M0,${height} L${linePoints.split(' ').join(' L')} L${width},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGradient)" />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Progress bar
interface ProgressBarProps {
  current: number;
  goal: number;
  width?: number;
  height?: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  goal,
  width = 100,
  height = 4,
  color = 'var(--accent)',
}) => {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div
      className="relative rounded-sm overflow-hidden"
      style={{ width, height, backgroundColor: 'var(--surface-2)' }}
    >
      <div
        className="absolute left-0 top-0 h-full transition-all duration-300"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
};

// Dot indicator (for ratings or small counts)
interface DotIndicatorProps {
  filled: number;
  total: number;
  size?: number;
  gap?: number;
  color?: string;
}

export const DotIndicator: React.FC<DotIndicatorProps> = ({
  filled,
  total,
  size = 8,
  gap = 4,
  color = 'var(--text-primary)',
}) => {
  return (
    <div className="flex items-center" style={{ gap }}>
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className="rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: index < filled ? color : 'var(--surface-2)',
          }}
        />
      ))}
    </div>
  );
};

// Star rating
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  color = 'var(--accent)',
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < Math.floor(rating);
        const partial = index === Math.floor(rating) && rating % 1 > 0;

        return (
          <svg
            key={index}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? color : partial ? color : 'var(--surface-2)'}
            opacity={filled || partial ? 1 : 0.3}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
};

// Circular progress
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 40,
  strokeWidth = 3,
  color = 'var(--accent)',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};
