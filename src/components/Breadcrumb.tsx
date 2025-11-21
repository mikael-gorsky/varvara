import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (items.length <= 1) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '0',
        paddingRight: '0',
        marginBottom: 'calc(8px * var(--density-multiplier))',
        flexWrap: 'wrap',
        overflowX: 'auto',
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = !isLast;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight
                className="w-4 h-4 flex-shrink-0"
                style={{
                  color: 'var(--text-tertiary)',
                  opacity: 0.5,
                }}
              />
            )}
            <button
              onClick={isClickable ? item.onClick : undefined}
              disabled={!isClickable}
              style={{
                color: isLast ? 'rgba(255, 255, 255, 1)' : 'var(--text-tertiary)',
                fontSize: 'calc(14px * var(--font-size-scale))',
                fontWeight: isLast ? 600 : 400,
                letterSpacing: '0.02em',
                lineHeight: 1.2,
                transition: 'color 300ms ease',
                border: 'none',
                background: 'transparent',
                cursor: isClickable ? 'pointer' : 'default',
                padding: '4px 0',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (isClickable) {
                  e.currentTarget.style.color = 'var(--accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (isClickable) {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }
              }}
            >
              {item.label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
