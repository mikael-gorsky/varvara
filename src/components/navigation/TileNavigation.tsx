import React from 'react';
import { Level1MenuItem, menuStructure, TileGroup } from '../../config/menuStructure';

interface TileNavigationProps {
  activeL1: Level1MenuItem;
  onSelectL2: (item: string) => void;
  disabledItems?: string[];
}

export const TileNavigation: React.FC<TileNavigationProps> = ({
  activeL1,
  onSelectL2,
  disabledItems = [],
}) => {
  const tileGroups = menuStructure.tileGroups?.[activeL1] || [];

  // If no tile groups defined, fall back to showing L2 items as a single group
  const groups: TileGroup[] = tileGroups.length > 0
    ? tileGroups
    : menuStructure.l2Items[activeL1]
      ? [{ category: activeL1, items: menuStructure.l2Items[activeL1] || [] }]
      : [];

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Page Title */}
      <h1
        className="text-section-title mb-8"
        style={{ color: 'var(--text-primary)' }}
      >
        {activeL1.toLowerCase()} distribution tiles
      </h1>

      {/* Tile Grid */}
      <div className="space-y-4">
        {groups.map((group, groupIndex) => (
          <div key={group.category} className="flex gap-4 flex-wrap">
            {/* Category Tile - Large Pink */}
            <button
              className="flex-shrink-0 flex items-end p-6 transition-all hover:opacity-90"
              style={{
                backgroundColor: '#E91E63',
                width: '280px',
                height: '180px',
              }}
            >
              <span
                className="text-2xl font-medium uppercase"
                style={{ color: 'white' }}
              >
                {group.category}
              </span>
            </button>

            {/* Item Tiles - Smaller */}
            {group.items.map((item, itemIndex) => {
              const isDisabled = disabledItems.includes(item);
              const hasL3 = menuStructure.l3Items && menuStructure.l3Items[item];

              return (
                <button
                  key={item}
                  onClick={() => !isDisabled && onSelectL2(item)}
                  disabled={isDisabled}
                  className="flex-shrink-0 flex flex-col justify-end p-4 transition-all border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--divider-standard)',
                    width: '160px',
                    height: '180px',
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span
                    className="text-body-lg font-medium uppercase"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item}
                  </span>
                  {hasL3 && (
                    <span
                      className="text-label-xs mt-1"
                      style={{ color: '#E91E63' }}
                    >
                      → {menuStructure.l3Items![item].length} sections
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TileNavigation;
