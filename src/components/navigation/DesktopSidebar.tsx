import React from 'react';
import { User } from 'lucide-react';
import { Level1MenuItem, menuStructure } from '../../config/menuStructure';

interface DesktopSidebarProps {
  activeL1: Level1MenuItem | null;
  activeL2: string | null;
  activeL3?: string | null;
  onSelectL1: (item: Level1MenuItem) => void;
  onSelectL2: (item: string) => void;
  onSelectL3?: (item: string) => void;
  showL2Sidebar?: boolean;
  hasL3Items?: boolean;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeL1,
  activeL2,
  activeL3,
  onSelectL1,
  onSelectL2,
  onSelectL3,
  showL2Sidebar = false,
  hasL3Items = false,
}) => {
  const handleL1Click = (item: Level1MenuItem) => {
    onSelectL1(item);
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-sidebar flex flex-col z-40"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header with breadcrumb */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 text-label-xs uppercase tracking-wider">
          <span style={{ color: 'var(--text-tertiary)' }}>VARVARA</span>
          {activeL1 && (
            <>
              <span style={{ color: 'var(--text-tertiary)' }}>&gt;</span>
              <span style={{ color: '#E91E63' }}>{activeL1}</span>
            </>
          )}
        </div>
      </div>

      {/* Section Label */}
      <div className="px-6 mb-4">
        <p
          className="text-label-xs uppercase tracking-wider"
          style={{ color: 'var(--text-tertiary)' }}
        >
          SYSTEM ACCESS
        </p>
      </div>

      {/* Navigation - Always L1 Menu */}
      <nav className="flex-1 px-6 overflow-y-auto">
        <div className="space-y-1">
          {menuStructure.l1Items.map((item) => {
            const isActive = activeL1 === item;

            return (
              <button
                key={item}
                onClick={() => handleL1Click(item)}
                className={`
                  block w-full text-left py-2 transition-colors
                  ${isActive ? 'text-menu-desktop-active' : 'text-menu-desktop'}
                `}
                style={{
                  color: isActive ? '#E91E63' : 'var(--text-tertiary)',
                }}
              >
                {item.toLowerCase()}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer - User Info */}
      <div
        className="px-6 py-6 border-t"
        style={{ borderColor: 'var(--divider-standard)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-2)' }}
          >
            <User size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div>
            <p
              className="text-label uppercase"
              style={{ color: 'var(--text-primary)' }}
            >
              ADMINISTRATOR
            </p>
            <p
              className="text-body-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Trade Ops Center
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
