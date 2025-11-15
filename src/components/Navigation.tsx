import React from 'react';
import Breadcrumb from './Breadcrumb';
import { menuStructure, buildBreadcrumbs } from '../config/menuStructure';

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

const Navigation: React.FC<NavigationProps> = ({
  activeL1,
  activeL2,
  onL1Change,
  onL2Change,
  onBack,
}) => {
  const { l1Items, l2Items, disabledL2Items } = menuStructure;
  const currentL2Items = activeL1 ? l2Items[activeL1] : null;
  const currentDisabledL2Items = activeL1 ? disabledL2Items?.[activeL1] || [] : [];
  const showL2Menu = activeL1 && currentL2Items;
  const showL1Menu = !activeL1;
  const showActionableL1 = activeL1 && !currentL2Items;

  const handleL1Click = (item: Level1MenuItem) => {
    onL1Change(item);
  };

  const handleNavigateToMain = () => {
    onBack();
  };

  const handleNavigateToL1 = () => {
    if (activeL2 && activeL1) {
      const firstL2 = l2Items[activeL1]?.[0];
      if (firstL2) {
        onL2Change(firstL2);
      }
    }
  };

  const breadcrumbs = buildBreadcrumbs(
    activeL1,
    activeL2,
    handleNavigateToMain,
    handleNavigateToL1
  );

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
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
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
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      {/* Level 2 Menu */}
      {showL2Menu && (
        <div>
          <Breadcrumb items={breadcrumbs} />
          {currentL2Items!.map((item) => {
            const isActive = activeL2 === item;
            const isDisabled = currentDisabledL2Items.includes(item);
            return (
              <button
                key={item}
                onClick={() => !isDisabled && onL2Change(item)}
                className="text-menu-l1 uppercase whitespace-nowrap"
                disabled={isDisabled}
                style={{
                  color: isDisabled
                    ? 'rgba(255, 255, 255, 0.3)'
                    : isActive
                      ? 'rgba(255, 255, 255, 1)'
                      : 'rgba(255, 255, 255, 0.6)',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  paddingLeft: '0',
                  paddingRight: '0',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                  transition: 'color 300ms ease',
                  border: 'none',
                  background: 'transparent',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isDisabled) {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !isDisabled) {
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
