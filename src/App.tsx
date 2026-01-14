import React, { useState, useEffect } from 'react';
import { Level1MenuItem, menuStructure } from './config/menuStructure';
import { AppLayout } from './components/layout/AppLayout';
import { TileNavigation } from './components/navigation/TileNavigation';
import Dashboard from './pages/Dashboard';
import ChannelsModule from './modules/ChannelsModule';
import MotivationModule from './modules/MotivationModule';
import FinanceModule from './modules/FinanceModule';
import ProductsModule from './modules/ProductsModule';
import PlanModule from './modules/PlanModule';
import ImportModule from './modules/ImportModule';
import SettingsModule from './modules/SettingsModule';

function App() {
  const [activeL1, setActiveL1] = useState<Level1MenuItem | null>('DASHBOARD');
  const [activeL2, setActiveL2] = useState<string | null>(null);
  const [activeL3, setActiveL3] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectL1 = (item: Level1MenuItem) => {
    setActiveL1(item);
    setActiveL2(null);
    setActiveL3(null);
  };

  const handleSelectL2 = (item: string) => {
    setActiveL2(item);
    setActiveL3(null);
  };

  const handleSelectL3 = (item: string) => {
    setActiveL3(item);
  };

  const handleBack = () => {
    if (activeL3) {
      setActiveL3(null);
    } else if (activeL2) {
      setActiveL2(null);
    } else if (activeL1) {
      setActiveL1(null);
    }
  };

  const renderContent = () => {
    if (!activeL1) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-body" style={{ color: 'var(--text-tertiary)' }}>
            Select a menu item to get started
          </p>
        </div>
      );
    }

    // On desktop, show tile navigation for L1 items with L2 subitems (when no L2 selected)
    const hasL2Items = menuStructure.l2Items[activeL1] !== null;
    if (!isMobile && hasL2Items && !activeL2) {
      return (
        <TileNavigation
          activeL1={activeL1}
          onSelectL2={handleSelectL2}
          disabledItems={menuStructure.disabledL2Items?.[activeL1] || []}
        />
      );
    }

    // On desktop, show L3 tile navigation when L2 is selected but L3 is not
    const l3Items = activeL2 && menuStructure.l3Items?.[activeL2];
    if (!isMobile && l3Items && !activeL3) {
      return (
        <div className="p-8">
          <h1
            className="text-section-title mb-8"
            style={{ color: 'var(--text-primary)' }}
          >
            {activeL2.toLowerCase()} sections
          </h1>
          <div className="flex gap-4 flex-wrap">
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
                {activeL2}
              </span>
            </button>

            {/* L3 Item Tiles */}
            {l3Items.map((item) => (
              <button
                key={item}
                onClick={() => handleSelectL3(item)}
                className="flex-shrink-0 flex flex-col justify-end p-4 transition-all border hover:opacity-80"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--divider-standard)',
                  width: '160px',
                  height: '180px',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="text-body-lg font-medium uppercase"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item}
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    switch (activeL1) {
      case 'DASHBOARD':
        return <Dashboard isMobile={isMobile} />;
      case 'CHANNELS':
        return <ChannelsModule activeL2={activeL2} activeL3={activeL3} />;
      case 'MOTIVATION':
        return <MotivationModule />;
      case 'FINANCE':
        return <FinanceModule />;
      case 'PRODUCTS':
        return <ProductsModule activeL2={activeL2} />;
      case 'PLAN':
        return <PlanModule activeL2={activeL2} />;
      case 'IMPORT':
        return <ImportModule activeL2={activeL2} />;
      case 'SETTINGS':
        return <SettingsModule activeL2={activeL2} />;
      default:
        return null;
    }
  };

  // Determine if we should show bottom tabs (only on dashboard in mobile)
  const showBottomTabs = isMobile && activeL1 === 'DASHBOARD';

  // Determine if we should show L2 sidebar (show when L1 has L2 items)
  const hasL2Items = activeL1 && menuStructure.l2Items[activeL1] !== null;
  const showL2Sidebar = !!hasL2Items;

  // Check if current L2 has L3 items
  const hasL3Items = activeL2 && menuStructure.l3Items && menuStructure.l3Items[activeL2];

  return (
    <AppLayout
      activeL1={activeL1}
      activeL2={activeL2}
      activeL3={activeL3}
      onSelectL1={handleSelectL1}
      onSelectL2={handleSelectL2}
      onSelectL3={handleSelectL3}
      onBack={handleBack}
      showBottomTabs={showBottomTabs}
      showL2Sidebar={showL2Sidebar}
      hasL3Items={!!hasL3Items}
    >
      {renderContent()}
    </AppLayout>
  );
}

export default App;
