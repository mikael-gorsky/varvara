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
  const l2Items = activeL1 ? menuStructure.l2Items[activeL1] : null;
  const disabledL2 = activeL1 ? menuStructure.disabledL2Items?.[activeL1] || [] : [];
  const l3Items = activeL2 && menuStructure.l3Items ? menuStructure.l3Items[activeL2] : null;
  const showL3Sidebar = hasL3Items && l3Items && l3Items.length > 0;

  const handleL1Click = (item: Level1MenuItem) => {
    onSelectL1(item);
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-sidebar flex flex-col z-40"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Logo */}
      <div className="px-6 py-8">
        <h1
          className="text-logo uppercase"
          style={{ color: 'var(--text-primary)' }}
        >
          VARVARA<span style={{ color: '#E91E63' }}>.</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 overflow-y-auto">
        {showL3Sidebar && l3Items ? (
          // L3 Menu for third-level pages
          <>
            <p
              className="text-label-xs uppercase mb-4"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {activeL2}
            </p>
            <div className="space-y-1">
              {l3Items.map((item) => {
                const isActive = activeL3 === item;

                return (
                  <button
                    key={item}
                    onClick={() => onSelectL3?.(item)}
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
          </>
        ) : showL2Sidebar && l2Items ? (
          // L2 Menu for second-level pages
          <>
            <p
              className="text-label-xs uppercase mb-4"
              style={{ color: 'var(--text-tertiary)' }}
            >
              CATEGORY
            </p>
            <div className="space-y-1">
              {l2Items.map((item) => {
                const isActive = activeL2 === item;
                const isDisabled = disabledL2.includes(item);

                return (
                  <button
                    key={item}
                    onClick={() => !isDisabled && onSelectL2(item)}
                    disabled={isDisabled}
                    className={`
                      block w-full text-left py-2 transition-colors
                      ${isActive ? 'text-menu-desktop-active' : 'text-menu-desktop'}
                    `}
                    style={{
                      color: isDisabled
                        ? 'var(--text-disabled)'
                        : isActive
                          ? '#E91E63'
                          : 'var(--text-tertiary)',
                    }}
                  >
                    {item.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          // L1 Menu (main navigation)
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
        )}
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
