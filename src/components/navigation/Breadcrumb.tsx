import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Level1MenuItem } from '../../config/menuStructure';

interface BreadcrumbProps {
  activeL1: Level1MenuItem | null;
  activeL2: string | null;
  activeL3?: string | null;
  onNavigateHome: () => void;
  onNavigateL1: () => void;
  onNavigateL2: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  activeL1,
  activeL2,
  activeL3,
  onNavigateHome,
  onNavigateL1,
  onNavigateL2,
}) => {
  return (
    <nav className="flex items-center gap-2 text-label-sm uppercase tracking-wider">
      <button
        onClick={onNavigateHome}
        className="transition-colors hover:opacity-80"
        style={{ color: 'var(--text-tertiary)' }}
      >
        HOME
      </button>

      {activeL1 && (
        <>
          <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
          <button
            onClick={onNavigateL1}
            className="transition-colors hover:opacity-80"
            style={{ color: activeL2 ? 'var(--text-tertiary)' : '#E91E63' }}
          >
            {activeL1}
          </button>
        </>
      )}

      {activeL2 && (
        <>
          <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
          <button
            onClick={onNavigateL2}
            className="transition-colors hover:opacity-80"
            style={{ color: activeL3 ? 'var(--text-tertiary)' : '#E91E63' }}
          >
            {activeL2}
          </button>
        </>
      )}

      {activeL3 && (
        <>
          <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ color: '#E91E63' }}>
            {activeL3}
          </span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
