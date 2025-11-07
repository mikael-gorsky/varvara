import React, { useState, useEffect, useRef } from 'react';
import VarvaraHeader from './components/VarvaraHeader';
import Navigation, { Level1MenuItem } from './components/Navigation';
import DashboardModule from './modules/DashboardModule';
import ChannelsModule from './modules/ChannelsModule';
import MotivationModule from './modules/MotivationModule';
import FinanceModule from './modules/FinanceModule';
import ProductsModule from './modules/ProductsModule';
import PlanModule from './modules/PlanModule';
import ImportModule from './modules/ImportModule';
import SettingsModule from './modules/SettingsModule';

function App() {
  const [activeL1, setActiveL1] = useState<Level1MenuItem>('DASHBOARD');
  const [activeL2, setActiveL2] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(100);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeL1) {
      case 'DASHBOARD':
        return <DashboardModule />;
      case 'CHANNELS':
        return <ChannelsModule activeL2={activeL2} />;
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
        return <DashboardModule />;
    }
  };

  const hasL2Menu = ['CHANNELS', 'PRODUCTS', 'PLAN', 'IMPORT', 'SETTINGS'].includes(activeL1);
  const navHeight = hasL2Menu ? 104 : 56;
  const totalOffset = headerHeight + navHeight;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div ref={headerRef}>
        <VarvaraHeader />
      </div>
      <Navigation
        activeL1={activeL1}
        activeL2={activeL2}
        onL1Change={setActiveL1}
        onL2Change={setActiveL2}
        headerHeight={headerHeight}
      />
      <main style={{ paddingTop: `${totalOffset}px` }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;