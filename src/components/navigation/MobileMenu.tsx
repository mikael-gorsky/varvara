import React from 'react';
import { X, Sparkles, Search } from 'lucide-react';
import { Level1MenuItem, menuStructure } from '../../config/menuStructure';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeL1: Level1MenuItem | null;
  activeL2: string | null;
  activeL3?: string | null;
  onSelectL1: (item: Level1MenuItem) => void;
  onSelectL2: (item: string) => void;
  onSelectL3?: (item: string) => void;
  onBack: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  activeL1,
  activeL2,
  activeL3,
  onSelectL1,
  onSelectL2,
  onSelectL3,
  onBack,
}) => {
  // Check if we're showing L2 menu
  const showL2Menu = activeL1 && menuStructure.l2Items[activeL1];
  const l2Items = activeL1 ? menuStructure.l2Items[activeL1] : null;
  const disabledL2 = activeL1 ? menuStructure.disabledL2Items?.[activeL1] || [] : [];

  // Check if we're showing L3 menu
  const l3Items = activeL2 && menuStructure.l3Items ? menuStructure.l3Items[activeL2] : null;
  const showL3Menu = activeL2 && l3Items && l3Items.length > 0;

  if (!isOpen) return null;

  const handleL1Click = (item: Level1MenuItem) => {
    const hasL2 = menuStructure.l2Items[item] !== null;
    onSelectL1(item);
    if (!hasL2) {
      onClose();
    }
  };

  const handleL2Click = (item: string) => {
    if (!disabledL2.includes(item)) {
      onSelectL2(item);
      // Check if this L2 item has L3 items - if so, don't close
      const hasL3 = menuStructure.l3Items && menuStructure.l3Items[item];
      if (!hasL3) {
        onClose();
      }
    }
  };

  const handleL3Click = (item: string) => {
    onSelectL3?.(item);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 safe-area-top">
        <button
          onClick={(showL2Menu || showL3Menu) ? onBack : onClose}
          className="p-2 -ml-2 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          {(showL2Menu || showL3Menu) ? (
            <span className="text-body">{'< BACK'}</span>
          ) : (
            <X size={24} />
          )}
        </button>
        <span
          className="text-logo uppercase"
          style={{ color: 'var(--text-primary)' }}
        >
          VARVARA
        </span>
      </div>

      {/* Menu Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {showL3Menu && l3Items ? (
          // L3 Menu
          <>
            {/* Breadcrumb */}
            <div className="mb-2" style={{ color: 'var(--text-tertiary)' }}>
              <span className="text-body-sm">HOME / {activeL1} / </span>
              <span className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                {activeL2}
              </span>
            </div>

            {/* Section Label */}
            <p
              className="text-label-sm uppercase mb-4"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {activeL2} MENU
            </p>

            {/* L3 Items */}
            <nav className="space-y-1">
              {l3Items.map((item) => {
                const isActive = activeL3 === item;

                return (
                  <button
                    key={item}
                    onClick={() => handleL3Click(item)}
                    className={`
                      block w-full text-left py-2 transition-colors
                      ${isActive ? 'text-menu-mobile-active' : 'text-menu-mobile'}
                    `}
                    style={{
                      color: isActive ? '#E91E63' : 'var(--text-tertiary)',
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </nav>
          </>
        ) : showL2Menu && l2Items ? (
          // L2 Menu
          <>
            {/* Breadcrumb */}
            <div className="mb-2" style={{ color: 'var(--text-tertiary)' }}>
              <span className="text-body-sm">HOME / </span>
              <span className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                {activeL1}
              </span>
            </div>

            {/* Section Label */}
            <p
              className="text-label-sm uppercase mb-4"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {activeL1} MENU
            </p>

            {/* L2 Items */}
            <nav className="space-y-1">
              {l2Items.map((item) => {
                const isActive = activeL2 === item;
                const isDisabled = disabledL2.includes(item);

                return (
                  <button
                    key={item}
                    onClick={() => handleL2Click(item)}
                    disabled={isDisabled}
                    className={`
                      block w-full text-left py-2 transition-colors
                      ${isActive ? 'text-menu-mobile-active' : 'text-menu-mobile'}
                    `}
                    style={{
                      color: isDisabled
                        ? 'var(--text-disabled)'
                        : isActive
                          ? '#E91E63'
                          : 'var(--text-tertiary)',
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </nav>
          </>
        ) : (
          // L1 Menu
          <>
            {/* Section Label */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-0.5" style={{ backgroundColor: '#E91E63' }} />
              <span
                className="text-label-sm uppercase"
                style={{ color: '#E91E63' }}
              >
                SYSTEM CORE
              </span>
            </div>

            {/* L1 Items */}
            <nav className="space-y-1">
              {menuStructure.l1Items.map((item) => {
                const isActive = activeL1 === item;
                const hasAI = item === 'MOTIVATION' || item === 'PLAN';

                return (
                  <button
                    key={item}
                    onClick={() => handleL1Click(item)}
                    className={`
                      flex items-center gap-3 w-full text-left py-2 transition-colors
                      ${isActive ? 'text-menu-mobile-active' : 'text-menu-mobile'}
                    `}
                    style={{
                      color: isActive ? '#E91E63' : 'var(--text-primary)',
                    }}
                  >
                    {item}
                    {hasAI && (
                      item === 'MOTIVATION' ? (
                        <Sparkles size={20} style={{ color: '#E91E63' }} />
                      ) : (
                        <span
                          className="text-label-xs px-2 py-0.5 border rounded"
                          style={{
                            borderColor: '#E91E63',
                            color: '#E91E63',
                          }}
                        >
                          AI
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </nav>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-4 border-t safe-area-bottom"
        style={{ borderColor: 'var(--divider-standard)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-label-xs uppercase"
              style={{ color: 'var(--text-tertiary)' }}
            >
              SYSTEM READY
            </p>
            <p
              className="text-body-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              v2.0.4 • trade portal
            </p>
          </div>
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          >
            <Search size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
