import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  StylePreferences,
  ColorScheme,
  Density,
  loadStylePreferences,
  saveStylePreferences,
  applyStylesToDocument,
} from '../services/stylePreferencesService';

interface StyleContextType {
  preferences: StylePreferences | null;
  loading: boolean;
  updateColorScheme: (colorScheme: ColorScheme) => Promise<void>;
  updateDensity: (density: Density) => Promise<void>;
  updateFontFamily: (fontFamily: string) => Promise<void>;
  updateFontSizeScale: (scale: number) => Promise<void>;
  updatePreferences: (preferences: Partial<StylePreferences>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyle must be used within StyleProvider');
  }
  return context;
};

interface StyleProviderProps {
  children: ReactNode;
}

export const StyleProvider: React.FC<StyleProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<StylePreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStyles = async () => {
      try {
        const prefs = await loadStylePreferences();
        setPreferences(prefs);
        applyStylesToDocument(prefs);
      } catch (err) {
        console.error('Failed to initialize style preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeStyles();
  }, []);

  const updateAndSave = async (updatedPreferences: StylePreferences) => {
    setPreferences(updatedPreferences);
    applyStylesToDocument(updatedPreferences);
    await saveStylePreferences(updatedPreferences);
  };

  const updateColorScheme = async (colorScheme: ColorScheme) => {
    if (!preferences) return;
    const updated = { ...preferences, colorScheme };
    await updateAndSave(updated);
  };

  const updateDensity = async (density: Density) => {
    if (!preferences) return;
    const updated = { ...preferences, density };
    await updateAndSave(updated);
  };

  const updateFontFamily = async (fontFamily: string) => {
    if (!preferences) return;
    const updated = { ...preferences, fontFamily };
    await updateAndSave(updated);
  };

  const updateFontSizeScale = async (scale: number) => {
    if (!preferences) return;
    const updated = { ...preferences, fontSizeScale: scale };
    await updateAndSave(updated);
  };

  const updatePreferences = async (partial: Partial<StylePreferences>) => {
    if (!preferences) return;
    const updated = { ...preferences, ...partial };
    await updateAndSave(updated);
  };

  const resetToDefaults = async () => {
    if (!preferences) return;
    const defaults: StylePreferences = {
      userId: preferences.userId,
      colorScheme: {
        accent: '#90CAF9',
        accentHover: '#BBDEFB',
        accentPressed: '#64B5F6',
      },
      density: 'normal',
      fontFamily: 'Montserrat',
      fontSizeScale: 1.0,
    };
    await updateAndSave(defaults);
  };

  return (
    <StyleContext.Provider
      value={{
        preferences,
        loading,
        updateColorScheme,
        updateDensity,
        updateFontFamily,
        updateFontSizeScale,
        updatePreferences,
        resetToDefaults,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};
