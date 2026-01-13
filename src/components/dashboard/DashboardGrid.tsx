import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  columns = 5,
  gap = 'md',
  className = '',
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Section wrapper for dashboard content
interface DashboardSectionProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
}) => {
  return (
    <section className={`mb-8 ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h2
                className="text-page-title-mobile lg:text-page-title-desktop lowercase"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="text-label uppercase mt-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

export default DashboardGrid;
