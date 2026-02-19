import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useStyle } from '../contexts/StyleContext';
import { AVAILABLE_FONTS, PRESET_COLOR_SCHEMES, Density } from '../services/stylePreferencesService';
import { getSetting, updateSetting } from '../services/settings';
import { getSettings, updateSettings, resetToDefaults as resetInventoryDefaults, type InventorySettings } from '../services/inventorySettingsService';

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
    <div className="pt-1">
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

const ExchangeRatePanel: React.FC = () => {
  const [currentRate, setCurrentRate] = useState<string>('95.00');
  const [inputRate, setInputRate] = useState<string>('95.00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentRate = async () => {
      try {
        const rate = await getSetting('current_exchange_rate');
        if (rate) {
          setCurrentRate(rate);
          setInputRate(rate);
        }
      } catch (err) {
        console.error('Error loading exchange rate:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentRate();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const rateValue = parseFloat(inputRate);
      if (isNaN(rateValue) || rateValue <= 0) {
        setMessage('Please enter a valid positive number');
        setSaving(false);
        return;
      }

      await updateSetting('current_exchange_rate', inputRate);
      setCurrentRate(inputRate);
      setMessage('Exchange rate updated successfully');
    } catch (err) {
      console.error('Error saving exchange rate:', err);
      setMessage('Failed to save exchange rate');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  return (
    <div className="pt-1">
      <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
        EXCHANGE RATE
      </h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            CURRENT USD/RUB RATE
          </h3>
          <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
            This rate is used as fallback when specific period rates are not available
          </p>

          <div className="max-w-md space-y-4">
            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                RATE (RUB per 1 USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={inputRate}
                onChange={(e) => setInputRate(e.target.value)}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || inputRate === currentRate}
              className="px-8 py-4 border transition-all duration-fast"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--accent)',
                color: 'var(--text-primary)',
                opacity: saving || inputRate === currentRate ? 0.5 : 1,
                cursor: saving || inputRate === currentRate ? 'not-allowed' : 'pointer',
              }}
            >
              <span className="text-body uppercase">{saving ? 'SAVING...' : 'SAVE'}</span>
            </button>

            {message && (
              <p
                className="text-body"
                style={{
                  color: message.includes('success') ? 'var(--accent)' : 'var(--status-error)',
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t" style={{ borderColor: 'var(--divider-standard)' }}>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            HISTORICAL RATES
          </h3>
          <p className="text-body mb-4" style={{ color: 'var(--text-secondary)' }}>
            Fixed rates for historical periods:
          </p>
          <div className="space-y-2">
            <div className="flex justify-between p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <span className="text-body" style={{ color: 'var(--text-primary)' }}>2025</span>
              <span className="text-body" style={{ color: 'var(--text-secondary)' }}>83.21 RUB/USD</span>
            </div>
            <div className="flex justify-between p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <span className="text-body" style={{ color: 'var(--text-primary)' }}>2024</span>
              <span className="text-body" style={{ color: 'var(--text-secondary)' }}>92.66 RUB/USD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InventorySettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [formData, setFormData] = useState<InventorySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
      setFormData(data);
    } catch (err) {
      console.error('Error loading inventory settings:', err);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setMessage(null);

    try {
      await updateSettings(formData);
      setSettings(formData);
      setMessage('Inventory settings updated successfully');
    } catch (err) {
      console.error('Error saving inventory settings:', err);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all inventory settings to defaults?')) return;

    setSaving(true);
    setMessage(null);

    try {
      await resetInventoryDefaults();
      await loadSettings();
      setMessage('Settings reset to defaults');
    } catch (err) {
      console.error('Error resetting settings:', err);
      setMessage('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof InventorySettings, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [key]: value });
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  if (!formData) {
    return <div style={{ color: 'var(--text-secondary)' }}>Failed to load settings</div>;
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(formData);

  return (
    <div className="pt-1">
      <h2 className="text-page-title-mobile md:text-page-title-desktop uppercase mb-8" style={{ color: 'var(--accent)' }}>
        INVENTORY SETTINGS
      </h2>

      <div className="space-y-12">
        {/* Reorder Planning Settings */}
        <div>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            REORDER PLANNING
          </h3>
          <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
            Default parameters for automated reorder calculations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                DEFAULT LEAD TIME (DAYS)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.default_lead_time_days}
                onChange={(e) => handleChange('default_lead_time_days', parseInt(e.target.value))}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Typical for Chinese suppliers: 45 days
              </p>
            </div>

            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                DEFAULT SAFETY STOCK (DAYS)
              </label>
              <input
                type="number"
                min="0"
                max="90"
                value={formData.default_safety_stock_days}
                onChange={(e) => handleChange('default_safety_stock_days', parseInt(e.target.value))}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Buffer stock to prevent stockouts
              </p>
            </div>

            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                DEFAULT MOQ (UNITS)
              </label>
              <input
                type="number"
                min="1"
                value={formData.default_moq}
                onChange={(e) => handleChange('default_moq', parseInt(e.target.value))}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Minimum order quantity
              </p>
            </div>

            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                REORDER ALERT THRESHOLD (UNITS)
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorder_alert_threshold}
                onChange={(e) => handleChange('reorder_alert_threshold', parseInt(e.target.value))}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Alert when stock falls below this level
              </p>
            </div>
          </div>
        </div>

        {/* Container Settings */}
        <div>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            CONTAINER SPECIFICATIONS
          </h3>
          <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
            Weight limits for container optimization
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                20FT CONTAINER WEIGHT LIMIT (KG)
              </label>
              <input
                type="number"
                min="1000"
                max="50000"
                value={formData.container_20ft_weight_kg}
                onChange={(e) => handleChange('container_20ft_weight_kg', parseInt(e.target.value))}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Standard: 28,000 kg (33 CBM volume)
              </p>
            </div>

            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                40HQ CONTAINER WEIGHT LIMIT (KG)
              </label>
              <input
                type="number"
                min="1000"
                max="50000"
                value={formData.container_40hq_weight_kg}
                onChange={(e) => handleChange('container_40hq_weight_kg', parseInt(e.target.value))}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Standard: 27,000 kg (68 CBM volume)
              </p>
            </div>
          </div>
        </div>

        {/* Aging & Turnover Settings */}
        <div>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            AGING & TURNOVER THRESHOLDS
          </h3>
          <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
            Alert thresholds for inventory aging and turnover analysis
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                CRITICAL STOCK (DAYS)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.critical_stock_days}
                onChange={(e) => handleChange('critical_stock_days', parseInt(e.target.value))}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Flag products with less than this many days of stock
              </p>
            </div>

            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                AGED INVENTORY (MONTHS)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.aged_inventory_months}
                onChange={(e) => handleChange('aged_inventory_months', parseInt(e.target.value))}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Alert for inventory older than this threshold
              </p>
            </div>

            <div>
              <label className="text-label uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                TARGET TURNOVER (DAYS)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={formData.default_turnover_threshold_days}
                onChange={(e) => handleChange('default_turnover_threshold_days', parseInt(e.target.value))}
                className="w-full p-4 border transition-all duration-fast"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--divider-standard)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Expected inventory turnover period
              </p>
            </div>
          </div>
        </div>

        {/* Quality Mixing */}
        <div>
          <h3 className="text-subsection uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
            QUALITY CONTROL
          </h3>
          <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
            Rules for mixing products with different quality statuses
          </p>

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="quality-mixing"
              checked={formData.allow_quality_mixing}
              onChange={(e) => handleChange('allow_quality_mixing', e.target.checked)}
              className="w-6 h-6 cursor-pointer"
              style={{ accentColor: 'var(--accent)' }}
            />
            <label htmlFor="quality-mixing" className="text-body cursor-pointer" style={{ color: 'var(--text-primary)' }}>
              Allow mixing different quality statuses in same container (with warning)
            </label>
          </div>
          <p className="text-xs mt-2 ml-10" style={{ color: 'var(--text-secondary)' }}>
            When enabled, products with "годные" and "негодные" status can be packed together
          </p>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t flex gap-4" style={{ borderColor: 'var(--divider-standard)' }}>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-8 py-4 border transition-all duration-fast"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--accent)',
              color: 'var(--text-primary)',
              opacity: saving || !hasChanges ? 0.5 : 1,
              cursor: saving || !hasChanges ? 'not-allowed' : 'pointer',
            }}
          >
            <span className="text-body uppercase">{saving ? 'SAVING...' : 'SAVE CHANGES'}</span>
          </button>

          <button
            onClick={handleReset}
            disabled={saving}
            className="px-8 py-4 border transition-all duration-fast"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--divider-strong)',
              color: 'var(--text-primary)',
              opacity: saving ? 0.5 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            <span className="text-body uppercase">RESET TO DEFAULTS</span>
          </button>
        </div>

        {message && (
          <div
            className="p-4 border"
            style={{
              borderColor: message.includes('success') ? 'var(--accent)' : 'var(--status-error)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <p
              className="text-body"
              style={{
                color: message.includes('success') ? 'var(--accent)' : 'var(--status-error)',
              }}
            >
              {message}
            </p>
          </div>
        )}
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
      case 'EXCHANGE RATE':
        return <ExchangeRatePanel />;
      case 'INVENTORY SETTINGS':
        return <InventorySettingsPanel />;
      case 'THEME':
        return (
          <div className="pt-1">
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
          <div className="pt-1">
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
          <div className="pt-1">
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
          <div className="pt-1">
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
