import React from 'react';
import { ChevronRight, AlertTriangle } from 'lucide-react';

type ChannelStatus = 'connected' | 'sync_issue' | 'disconnected';

interface ChannelCardProps {
  index: number;
  name: string;
  status: ChannelStatus;
  skuCount: number;
  revenue: number;
  revenueLabel?: string;
  onClick?: () => void;
}

const statusConfig: Record<ChannelStatus, { label: string; color: string; icon?: React.ElementType }> = {
  connected: {
    label: 'CONNECTED',
    color: 'var(--status-connected)',
  },
  sync_issue: {
    label: 'SYNC ISSUE',
    color: 'var(--status-warning)',
    icon: AlertTriangle,
  },
  disconnected: {
    label: 'DISCONNECTED',
    color: 'var(--status-error)',
  },
};

export const ChannelCard: React.FC<ChannelCardProps> = ({
  index,
  name,
  status,
  skuCount,
  revenue,
  revenueLabel = 'REVENUE (24H)',
  onClick,
}) => {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  const formattedIndex = String(index).padStart(2, '0');
  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(revenue);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 border-b transition-colors hover:bg-[var(--surface-1)]"
      style={{ borderColor: 'var(--divider-standard)' }}
    >
      {/* Index */}
      <span
        className="text-kpi-value w-12 text-right flex-shrink-0"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {formattedIndex}
      </span>

      {/* Channel Info */}
      <div className="flex-1 text-left">
        <p className="text-body-lg lowercase" style={{ color: 'var(--text-primary)' }}>
          {name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {StatusIcon && (
            <StatusIcon size={12} style={{ color: statusInfo.color }} />
          )}
          {!StatusIcon && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusInfo.color }}
            />
          )}
          <span className="text-label-xs uppercase" style={{ color: statusInfo.color }}>
            {statusInfo.label}
          </span>
          <span
            className="text-body-sm ml-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            SKUs: {skuCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Revenue */}
      <div className="text-right flex-shrink-0">
        <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
          {revenueLabel}
        </p>
        <p className="text-body-lg" style={{ color: 'var(--text-primary)' }}>
          {formattedRevenue}
        </p>
      </div>

      {/* Chevron */}
      <div
        className="w-10 h-10 flex items-center justify-center flex-shrink-0 border"
        style={{ borderColor: 'var(--divider-standard)' }}
      >
        <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
      </div>
    </button>
  );
};

// Header for channel list
interface ChannelListHeaderProps {
  title: string;
  subtitle: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ChannelListHeader: React.FC<ChannelListHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2
          className="text-section-title lowercase"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>
        <p className="text-body-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          {subtitle}
        </p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 text-label uppercase transition-colors"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#FFFFFF',
          }}
        >
          <span>+</span>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default ChannelCard;
