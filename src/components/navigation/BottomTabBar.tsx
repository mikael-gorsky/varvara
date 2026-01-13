import React from 'react';
import { LayoutGrid, Package, ShoppingCart, Sparkles, Settings } from 'lucide-react';

export type TabId = 'metrics' | 'inventory' | 'sales' | 'predict' | 'setup';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'metrics', label: 'METRICS', icon: LayoutGrid },
  { id: 'inventory', label: 'INVENTORY', icon: Package },
  { id: 'sales', label: 'SALES', icon: ShoppingCart },
  { id: 'predict', label: 'PREDICT', icon: Sparkles },
  { id: 'setup', label: 'SETUP', icon: Settings },
];

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div
        className="flex items-center justify-around border-t"
        style={{ borderColor: 'var(--divider-standard)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center py-3 px-4 min-w-[64px] transition-colors"
            >
              <Icon
                size={22}
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              />
              <span
                className="text-label-xs uppercase mt-1"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
