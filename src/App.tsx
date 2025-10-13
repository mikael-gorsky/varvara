import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import CEODashboard from './components/CEODashboard';
import OzonDashboard from './components/OzonDashboard';
import ServiceModule from './components/ServiceModule';

type ActiveModule = 'main-menu' | 'ceo-dashboard' | 'ozon-dashboard' | 'service-module';

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
      case 'service-module':
        return <ServiceModule onBack={handleBack} />;
      default:
        return <MainMenu onSelectModule={handleSelectModule} />;
    }
  };

  return renderModule();
}

export default App;