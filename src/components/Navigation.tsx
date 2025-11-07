import React, { useEffect, useState } from 'react';

export type Level1MenuItem =
  | 'DASHBOARD'
  | 'CHANNELS'
  | 'MOTIVATION'
  | 'FINANCE'
  | 'PRODUCTS'
  | 'PLAN'
  | 'IMPORT'
  | 'SETTINGS';

interface NavigationProps {
  activeL1: Level1MenuItem | null;
  activeL2: string | null;
  onL1Change: (item: Level1MenuItem) => void;
  onL2Change: (item: string) => void;
  headerHeight: number;
}

const level2Items: Record<Level1MenuItem, string[] | null> = {
  DASHBOARD: null,
  CHANNELS: ['Cumulative', 'Ozon', 'Wildberries', 'Yandex', 'Resellers', 'Tenders'],
  MOTIVATION: null,
  FINANCE: null,
  PRODUCTS: ['Catalog', 'Performance', 'Inventory', 'Categories'],
  PLAN: ['Sales Plans', 'Budget', 'Targets', 'Timeline'],
  IMPORT: ['Marketplaces', 'Price Lists', 'Accounting'],
  SETTINGS: ['Theme', 'Language', 'Users'],
};

const Navigation: React.FC<NavigationProps> = ({
  activeL1,
  activeL2,
  onL1Change,
  onL2Change,
  headerHeight,
}) => {
  const l1Items: Level1MenuItem[] = [
    'DASHBOARD',
    'CHANNELS',
    'MOTIVATION',
    'FINANCE',
    'PRODUCTS',
    'PLAN',
    'IMPORT',
    'SETTINGS',
  ];

  const [isL2Visible, setIsL2Visible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentL2Items = activeL1 ? level2Items[activeL1] : null;

  useEffect(() => {
    if (currentL2Items) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsL2Visible(true);
        setIsTransitioning(false);
      }, 300);
    } else {
      if (isL2Visible) {
        setIsTransitioning(true);
        setTimeout(() => {
          setIsL2Visible(false);
          setIsTransitioning(false);
        }, 300);
      }
    }
  }, [activeL1, currentL2Items]);

  const handleL1Click = (item: Level1MenuItem) => {
    if (activeL1 === item) return;

    onL1Change(item);

    const hasL2 = level2Items[item] !== null;
    if (hasL2) {
      const firstL2 = level2Items[item]![0];
      onL2Change(firstL2);
    } else {
      onL2Change('');
    }
  };

  return (
    <div
      className="fixed left-0 right-0 z-40"
      style={{
        top: `${headerHeight}px`,
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Level 1 Menu */}
      <div
        className="overflow-x-auto scrollbar-hide"
        style={{
          height: '56px',
          borderBottom: '1px solid var(--divider-standard)',
        }}
      >
        <div className="flex items-center h-full px-5 md:px-8 lg:px-12">
          {l1Items.map((item) => {
            const isActive = activeL1 === item;
            return (
              <button
                key={item}
                onClick={() => handleL1Click(item)}
                className="text-menu-l1 uppercase whitespace-nowrap relative"
                style={{
                  color: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.6)',
                  paddingLeft: '32px',
                  paddingRight: '32px',
                  height: '56px',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                  transition: 'color 300ms ease',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  }
                }}
              >
                {item}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: '3px',
                      backgroundColor: 'var(--accent)',
                      transition: 'all 300ms ease',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Level 2 Menu - Slide Animation */}
      {currentL2Items && (
        <div
          className="overflow-x-auto scrollbar-hide"
          style={{
            height: '48px',
            borderBottom: '1px solid var(--divider-standard)',
            transform: isL2Visible ? 'translateX(0)' : 'translateX(100%)',
            opacity: isL2Visible ? 1 : 0,
            transition: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        >
          <div className="flex items-center h-full px-5 md:px-8 lg:px-12">
            {currentL2Items.map((item) => {
              const isActive = activeL2 === item;
              return (
                <button
                  key={item}
                  onClick={() => onL2Change(item)}
                  className="text-menu-l2 whitespace-nowrap relative"
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'rgba(255, 255, 255, 0.5)',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    height: '48px',
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                    lineHeight: 1.3,
                    transition: 'color 300ms ease',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                    }
                  }}
                >
                  {item}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: '2px',
                        backgroundColor: 'var(--accent)',
                        transition: 'all 300ms ease',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;
