import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import CEODashboard from './components/CEODashboard';
import OzonDashboard from './components/OzonDashboard';

type ActiveModule = 'main-menu' | 'ceo-dashboard' | 'ozon-dashboard';

function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('main-menu');

  const handleSelectModule = (moduleId: string) => {
    setActiveModule(moduleId as ActiveModule);
  };

  const handleBack = () => {
    setActiveModule('main-menu');
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'ceo-dashboard':
        return <CEODashboard onBack={handleBack} />;
      case 'ozon-dashboard':
        return <OzonDashboard onBack={handleBack} />;
      default:
        return <MainMenu onSelectModule={handleSelectModule} />;
    }
  };

  return renderModule();
}

export default App;