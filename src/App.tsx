import React, { useState } from 'react';
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
  const [activeL1, setActiveL1] = useState<Level1MenuItem | null>(null);
  const [activeL2, setActiveL2] = useState<string | null>(null);
  const [serviceMessage] = useState<string>('');

  const handleBack = () => {
    setActiveL1(null);
    setActiveL2(null);
  };

  const renderContent = () => {
    if (!activeL1) {
      return null;
    }

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
        return null;
    }
  };

  const showContent = activeL1 !== null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Zone 1: App Name + Version */}
      <div style={{ paddingBottom: '24px' }}>
        <VarvaraHeader />
      </div>

      {/* Zone 2: Service Messages */}
      <div
        style={{
          minHeight: '40px',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '24px',
        }}
      >
        {serviceMessage && (
          <div style={{
            color: 'var(--accent)',
            fontSize: '14px',
            fontStyle: 'italic',
          }}>
            {serviceMessage}
          </div>
        )}
      </div>

      {/* Zone 3: Menus or Action Content */}
      <div style={{ flex: 1 }}>
        <Navigation
          activeL1={activeL1}
          activeL2={activeL2}
          onL1Change={setActiveL1}
          onL2Change={setActiveL2}
          onBack={handleBack}
        />
        {showContent && (
          <div style={{
            paddingLeft: '20px',
            paddingRight: '20px',
            marginTop: '24px',
          }}>
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;