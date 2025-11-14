import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useStyle } from '../contexts/StyleContext';
import { AVAILABLE_FONTS, PRESET_COLOR_SCHEMES, Density } from '../services/stylePreferencesService';

interface SettingsModuleProps {
  activeL2: string | null;
}

const InterfaceDesignPanel: React.FC = () => {
  const { preferences, updateColorScheme, updateDensity, updateFontFamily, updateFontSizeScale, resetToDefaults } = useStyle();
  const [customColor, setCustomColor] = useState(preferences?.colorScheme.accent || '#90CAF9');

  if (!preferences) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading preferences...</div>;
  }

  const densityOptions: { value: Density; label: string; description: string }[] = [
    { value: 'compact', label: 'COMPACT', description: 'Reduced spacing, more content' },
    { value: 'normal', label: 'NORMAL', description: 'Balanced spacing' },
    { value: 'spacious', label: 'SPACIOUS', description: 'Generous spacing, relaxed' },
  ];

  return (
    <div>
      <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
        INTERFACE DESIGN
      </h2>

      <div className="space-y-12">
        <div>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            COLOR SCHEME
          </h3>
          <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
            Choose accent color for interface elements
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {PRESET_COLOR_SCHEMES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateColorScheme(preset.scheme)}
                className="p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: preferences.colorScheme.accent === preset.scheme.accent ? 'var(--surface-2)' : 'var(--bg-secondary)',
                  borderColor: preferences.colorScheme.accent === preset.scheme.accent ? preset.scheme.accent : 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8"
                    style={{ backgroundColor: preset.scheme.accent }}
                  />
                  <span className="text-body uppercase">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                CUSTOM COLOR
              </label>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-full h-12 cursor-pointer"
                style={{ border: '1px solid var(--divider-standard)' }}
              />
            </div>
            <button
              onClick={() => updateColorScheme({
                accent: customColor,
                accentHover: customColor + 'CC',
                accentPressed: customColor + '88',
              })}
              className="px-6 py-3 border transition-all duration-fast"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--accent)',
                color: 'var(--text-primary)',
                marginTop: '24px',
              }}
            >
              <span className="text-body uppercase">APPLY</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            DENSITY
          </h3>
          <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
            Adjust spacing throughout the interface
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {densityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateDensity(option.value)}
                className="p-6 border transition-all duration-fast text-left"
                style={{
                  backgroundColor: preferences.density === option.value ? 'var(--surface-2)' : 'var(--bg-secondary)',
                  borderColor: preferences.density === option.value ? 'var(--accent)' : 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="text-menu-l2 uppercase mb-2">{option.label}</div>
                <div className="text-label" style={{ color: 'var(--text-secondary)' }}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            FONT FAMILY
          </h3>
          <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
            Select typeface for the interface
          </p>
          <select
            value={preferences.fontFamily}
            onChange={(e) => updateFontFamily(e.target.value)}
            className="w-full p-4 border transition-all duration-fast"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--divider-standard)',
              color: 'var(--text-primary)',
              fontSize: '16px',
            }}
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            FONT SIZE
          </h3>
          <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
            Adjust text size scale: {Math.round(preferences.fontSizeScale * 100)}%
          </p>
          <div className="flex items-center gap-6">
            <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
              80%
            </span>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={preferences.fontSizeScale}
              onChange={(e) => updateFontSizeScale(parseFloat(e.target.value))}
              className="flex-1"
              style={{ accentColor: 'var(--accent)' }}
            />
            <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
              150%
            </span>
          </div>
          <div className="mt-6 p-6 border" style={{ borderColor: 'var(--divider-standard)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-label mb-2" style={{ color: 'var(--text-secondary)' }}>
              PREVIEW
            </div>
            <p className="text-body" style={{ color: 'var(--text-primary)' }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>

        <div className="pt-6 border-t" style={{ borderColor: 'var(--divider-standard)' }}>
          <button
            onClick={resetToDefaults}
            className="px-8 py-4 border transition-all duration-fast"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--divider-strong)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="text-body uppercase">RESET TO DEFAULTS</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsModule: React.FC<SettingsModuleProps> = ({ activeL2 }) => {
  const { theme, setTheme } = useTheme();

  const renderContent = () => {
    switch (activeL2) {
      case 'INTERFACE DESIGN':
        return <InterfaceDesignPanel />;
      case 'THEME':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
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
      case 'LANGUAGE':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              LANGUAGE
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              Language settings coming soon...
            </p>
          </div>
        );
      case 'USERS':
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
              USERS
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              User management coming soon...
            </p>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
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
