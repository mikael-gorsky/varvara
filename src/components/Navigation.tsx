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
  activeL3: string | null;
  activeL4: string | null;
  onL1Change: (item: Level1MenuItem) => void;
  onL2Change: (item: string) => void;
  onL3Change: (item: string) => void;
  onL4Change: (item: string) => void;
  onBack: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeL1,
  activeL2,
  activeL3,
  activeL4,
  onL1Change,
  onL2Change,
  onL3Change,
  onL4Change,
  onBack,
}) => {
  const { l1Items, l2Items, l3Items, l4Items, disabledL2Items } = menuStructure;
  const currentL2Items = activeL1 ? l2Items[activeL1] : null;
  const currentL3Items = activeL2 && l3Items ? l3Items[activeL2] : null;
  const currentL4Items = activeL3 && l4Items ? l4Items[activeL3] : null;
  const currentDisabledL2Items = activeL1 ? disabledL2Items?.[activeL1] || [] : [];
  const showL4Menu = activeL3 && currentL4Items && currentL4Items.length > 0;
  const showL3Menu = activeL2 && currentL3Items && !showL4Menu;
  const showL2Menu = activeL1 && currentL2Items && !showL3Menu;
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

  const breadcrumbsL3 = [...breadcrumbs];
  if (activeL3) {
    breadcrumbsL3.push({
      label: activeL3,
      onClick: () => {},
    });
  }

  const breadcrumbsL4 = [...breadcrumbsL3];
  if (activeL4) {
    breadcrumbsL4.push({
      label: activeL4,
      onClick: () => {},
    });
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        paddingLeft: '16px',
        paddingRight: '16px',
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
                paddingTop: '18px',
                paddingBottom: '18px',
                paddingLeft: '0',
                paddingRight: '0',
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
                minHeight: '44px',
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
                  paddingTop: '18px',
                  paddingBottom: '18px',
                  paddingLeft: '0',
                  paddingRight: '0',
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
                  minHeight: '44px',
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

      {/* Level 3 Menu */}
      {showL3Menu && (
        <div>
          <Breadcrumb items={breadcrumbs} />
          {currentL3Items!.map((item) => {
            const isActive = activeL3 === item;
            return (
              <button
                key={item}
                onClick={() => onL3Change(item)}
                className="text-menu-l1 uppercase whitespace-nowrap"
                style={{
                  color: isActive
                    ? 'rgba(255, 255, 255, 1)'
                    : 'rgba(255, 255, 255, 0.6)',
                  paddingTop: '18px',
                  paddingBottom: '18px',
                  paddingLeft: '0',
                  paddingRight: '0',
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
                  minHeight: '44px',
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

      {/* Level 4 Menu */}
      {showL4Menu && (
        <div>
          <Breadcrumb items={breadcrumbsL3} />
          {currentL4Items!.map((item) => {
            const isActive = activeL4 === item;
            return (
              <button
                key={item}
                onClick={() => onL4Change(item)}
                className="text-menu-l1 uppercase whitespace-nowrap"
                style={{
                  color: isActive
                    ? 'rgba(255, 255, 255, 1)'
                    : 'rgba(255, 255, 255, 0.6)',
                  paddingTop: '18px',
                  paddingBottom: '18px',
                  paddingLeft: '0',
                  paddingRight: '0',
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
                  minHeight: '44px',
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
