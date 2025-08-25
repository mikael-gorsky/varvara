import React, { useState } from 'react';
import AnalyticsPicker from './components/AnalyticsPicker';
import CEODashboard from './components/CEODashboard';
import OzonAnalysis from './components/OzonAnalysis';

type ActiveModule = 'picker' | 'ceo-dashboard' | 'ozon-analysis';

function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('picker');

  const handleSelectModule = (moduleId: string) => {
    setActiveModule(moduleId as ActiveModule);
  };

  const handleBack = () => {
    setActiveModule('picker');
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'ceo-dashboard':
        return <CEODashboard onBack={handleBack} />;
      case 'ozon-analysis':
        return <OzonAnalysis onBack={handleBack} />;
      default:
        return <AnalyticsPicker onSelectModule={handleSelectModule} />;
    }
  };

  return renderModule();
}

export default App;