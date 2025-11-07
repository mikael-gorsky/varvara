import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModuleProps {
  activeL2: string | null;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ activeL2 }) => {
  const { theme, setTheme } = useTheme();

  const renderContent = () => {
    switch (activeL2) {
      case 'Theme':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              THEME
            </h2>
            <div className="space-y-4">
              <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
                Select application theme
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setTheme('dark')}
                  className="px-8 py-4 border transition-all duration-fast min-h-[48px]"
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--surface-2)' : 'var(--bg-secondary)',
                    borderColor: theme === 'dark' ? '#E91E63' : 'var(--divider-standard)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span className="text-body uppercase tracking-wider">DARK</span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className="px-8 py-4 border transition-all duration-fast min-h-[48px]"
                  style={{
                    backgroundColor: theme === 'light' ? 'var(--surface-2)' : 'var(--bg-secondary)',
                    borderColor: theme === 'light' ? '#E91E63' : 'var(--divider-standard)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span className="text-body uppercase tracking-wider">LIGHT</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'Language':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              LANGUAGE
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Language settings coming soon...
            </p>
          </div>
        );
      case 'Users':
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              USERS
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              User management coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div className="px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: '#E91E63' }}>
              SETTINGS
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Select a settings category
            </p>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
};

export default SettingsModule;
