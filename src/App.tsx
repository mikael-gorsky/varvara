import React, { useState } from 'react';
import AnalyticsPicker from './components/AnalyticsPicker';
import CEODashboard from './components/CEODashboard';
import ExcelImport from './components/ExcelImport';

type ActiveModule = 'picker' | 'ceo-dashboard' | 'excel-import';

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
      case 'excel-import':
        return <ExcelImport onBack={handleBack} />;
      default:
        return <AnalyticsPicker onSelectModule={handleSelectModule} />;
    }
  };

  return renderModule();
}

export default App;