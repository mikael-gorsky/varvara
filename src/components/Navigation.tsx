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
  activeL1: Level1MenuItem;
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
  console.log('Navigation rendering, headerHeight:', headerHeight);

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
  const currentL2Items = level2Items[activeL1];

  useEffect(() => {
    if (currentL2Items) {
      setIsL2Visible(true);
    } else {
      setIsL2Visible(false);
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
        backgroundColor: '#000000',
        borderBottom: '1px solid #333333'
      }}
    >
      <div className="h-14 flex items-center overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-0 px-5 md:px-8 lg:px-12">
          {l1Items.map((item) => {
            const isActive = activeL1 === item;
            return (
              <button
                key={item}
                onClick={() => handleL1Click(item)}
                className="text-menu-l1 uppercase px-8 h-14 relative transition-colors duration-fast whitespace-nowrap"
                style={{
                  color: isActive ? '#E91E63' : '#666666',
                  fontWeight: 600,
                  fontSize: '13px',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#AAAAAA';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#666666';
                  }
                }}
              >
                {item}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[3px] transition-all duration-normal"
                    style={{ backgroundColor: '#E91E63' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isL2Visible && currentL2Items && (
        <div
          className="h-12 flex items-center overflow-x-auto scrollbar-hide border-b transition-all duration-normal"
          style={{ borderColor: '#222222' }}
        >
          <div className="flex items-center gap-0 px-5 md:px-8 lg:px-12">
            {currentL2Items.map((item) => {
              const isActive = activeL2 === item;
              return (
                <button
                  key={item}
                  onClick={() => onL2Change(item)}
                  className="text-menu-l2 capitalize px-6 h-12 relative transition-colors duration-fast whitespace-nowrap"
                  style={{
                    color: isActive ? '#FFFFFF' : '#666666',
                    fontWeight: 500,
                    fontSize: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#AAAAAA';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#666666';
                    }
                  }}
                >
                  {item}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-normal"
                      style={{ backgroundColor: '#E91E63' }}
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
