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
  const [headerHeight, setHeaderHeight] = useState(80);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        console.log('Header height:', height);
        setHeaderHeight(height);
      }
    };

    // Initial measurement
    updateHeaderHeight();

    // Measure after a short delay to ensure styles are applied
    const timer = setTimeout(updateHeaderHeight, 100);

    const handleResize = () => {
      updateHeaderHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
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
  const totalOffset = Math.max(headerHeight, 80) + navHeight;

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