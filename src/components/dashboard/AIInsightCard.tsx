import React from 'react';
import { Sparkles, Star } from 'lucide-react';

interface AIInsightCardProps {
  message: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact';
  className?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  message,
  primaryAction,
  secondaryAction,
  variant = 'default',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div
        className={`p-4 ${className}`}
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="flex items-start gap-3">
          <Star
            size={16}
            style={{ color: 'var(--accent)' }}
            className="mt-0.5 flex-shrink-0"
          />
          <p className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-5 border-t ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--accent)',
        borderTopWidth: '2px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} style={{ color: 'var(--accent)' }} />
        <span
          className="text-label uppercase"
          style={{ color: 'var(--accent)' }}
        >
          VARVARA AI INSIGHT
        </span>
      </div>

      {/* Message */}
      <p className="text-body mb-4" style={{ color: 'var(--text-primary)' }}>
        {message}
      </p>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-4 py-2 text-label uppercase transition-colors"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#FFFFFF',
              }}
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 text-label uppercase transition-colors border"
              style={{
                borderColor: 'var(--divider-strong)',
                color: 'var(--text-primary)',
                backgroundColor: 'transparent',
              }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Status bar component for footer
interface StatusBarProps {
  status: string;
  message: string;
  metrics?: {
    label: string;
    value: string;
  };
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status,
  message,
  metrics,
  className = '',
}) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 lg:left-sidebar px-4 py-3 flex items-center justify-between ${className}`}
      style={{ backgroundColor: 'var(--bg-elevated)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-2)' }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--status-connected)' }} />
        </div>
        <div>
          <p className="text-label-xs uppercase" style={{ color: 'var(--text-tertiary)' }}>
            {status}
          </p>
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
        </div>
      </div>

      {metrics && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-body-sm" style={{ color: 'var(--text-tertiary)' }}>
              {metrics.value}
            </span>
            <span className="text-label-xs uppercase ml-2" style={{ color: 'var(--text-tertiary)' }}>
              {metrics.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightCard;
