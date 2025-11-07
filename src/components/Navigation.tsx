import React from 'react';

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
  onBack: () => void;
}

const level2Items: Record<Level1MenuItem, string[] | null> = {
  DASHBOARD: null,
  CHANNELS: ['CUMULATIVE', 'OZON', 'WILDBERRIES', 'YANDEX', 'RESELLERS', 'TENDERS'],
  MOTIVATION: null,
  FINANCE: null,
  PRODUCTS: ['CATALOG', 'PERFORMANCE', 'INVENTORY', 'CATEGORIES'],
  PLAN: ['SALES PLANS', 'BUDGET', 'TARGETS', 'TIMELINE'],
  IMPORT: ['MARKETPLACES', 'PRICE LISTS', 'ACCOUNTING'],
  SETTINGS: ['THEME', 'LANGUAGE', 'USERS'],
};

const Navigation: React.FC<NavigationProps> = ({
  activeL1,
  activeL2,
  onL1Change,
  onL2Change,
  onBack,
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

  const currentL2Items = activeL1 ? level2Items[activeL1] : null;
  const showL2Menu = activeL1 && currentL2Items;
  const showL1Menu = !activeL1;
  const showActionableL1 = activeL1 && !currentL2Items;

  const handleL1Click = (item: Level1MenuItem) => {
    const hasL2 = level2Items[item] !== null;
    onL1Change(item);
    if (hasL2) {
      onL2Change(level2Items[item]![0]);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}
    >
      {/* Level 1 Menu */}
      {showL1Menu && (
        <div>
          {l1Items.map((item) => (
            <button
              key={item}
              onClick={() => handleL1Click(item)}
              className="text-menu-l1 uppercase whitespace-nowrap"
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '0',
                paddingRight: '0',
                fontWeight: 400,
                letterSpacing: '0.02em',
                lineHeight: 1.2,
                transition: 'color 300ms ease',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Actionable L1 Item (no L2 submenu) */}
      {showActionableL1 && (
        <div>
          <button
            onClick={onBack}
            className="text-menu-l1 uppercase whitespace-nowrap"
            style={{
              color: 'rgba(255, 255, 255, 1)',
              paddingTop: '16px',
              paddingBottom: '16px',
              paddingLeft: '0',
              paddingRight: '0',
              fontWeight: 400,
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              textAlign: 'left',
            }}
          >
            {activeL1}
          </button>
        </div>
      )}

      {/* Level 2 Menu */}
      {showL2Menu && (
        <div>
          <button
            onClick={onBack}
            className="text-menu-l1 uppercase whitespace-nowrap"
            style={{
              color: 'rgba(255, 255, 255, 1)',
              paddingTop: '16px',
              paddingBottom: '16px',
              paddingLeft: '0',
              paddingRight: '0',
              fontWeight: 400,
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              textAlign: 'left',
              marginBottom: '8px',
            }}
          >
            {activeL1}
          </button>
          {currentL2Items!.map((item) => {
            const isActive = activeL2 === item;
            return (
              <button
                key={item}
                onClick={() => onL2Change(item)}
                className="text-menu-l1 uppercase whitespace-nowrap"
                style={{
                  color: isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.6)',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  paddingLeft: '0',
                  paddingRight: '0',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                  transition: 'color 300ms ease',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
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
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Navigation;
