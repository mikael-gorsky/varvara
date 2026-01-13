import React, { useState, useEffect } from 'react';
import { Level1MenuItem, menuStructure } from './config/menuStructure';
import { AppLayout } from './components/layout/AppLayout';
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

  const handleBack = () => {
    if (activeL2) {
      setActiveL2(null);
      setActiveL3(null);
    } else {
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

  // Determine if we should show L2 sidebar (when we have L2 items and one is selected)
  const showL2Sidebar = activeL1 && menuStructure.l2Items[activeL1] !== null && activeL2 !== null;

  return (
    <AppLayout
      activeL1={activeL1}
      activeL2={activeL2}
      onSelectL1={handleSelectL1}
      onSelectL2={handleSelectL2}
      onBack={handleBack}
      showBottomTabs={showBottomTabs}
      showL2Sidebar={showL2Sidebar}
    >
      {renderContent()}
    </AppLayout>
  );
}

export default App;
