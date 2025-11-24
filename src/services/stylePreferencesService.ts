import { supabase } from '../lib/supabase';

export interface ColorScheme {
  accent: string;
  accentHover: string;
  accentPressed: string;
}

export type Density = 'compact' | 'normal' | 'spacious';

export interface StylePreferences {
  id?: string;
  userId: string;
  colorScheme: ColorScheme;
  density: Density;
  fontFamily: string;
  fontSizeScale: number;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_PREFERENCES: Omit<StylePreferences, 'userId'> = {
  colorScheme: {
    accent: '#90CAF9',
    accentHover: '#BBDEFB',
    accentPressed: '#64B5F6',
  },
  density: 'normal',
  fontFamily: 'Segoe UI',
  fontSizeScale: 1.0,
};

function generateAnonymousUserId(): string {
  const stored = localStorage.getItem('varvara-user-id');
  if (stored) return stored;

  const newId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('varvara-user-id', newId);
  return newId;
}

export async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || generateAnonymousUserId();
}

export async function loadStylePreferences(): Promise<StylePreferences> {
  try {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('user_style_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Failed to load style preferences from database:', error);
      return loadFromLocalStorage(userId);
    }

    if (!data) {
      return {
        userId,
        ...DEFAULT_PREFERENCES,
      };
    }

    return {
      id: data.id,
      userId: data.user_id,
      colorScheme: data.color_scheme as ColorScheme,
      density: data.density as Density,
      fontFamily: data.font_family,
      fontSizeScale: data.font_size_scale,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error('Error loading style preferences:', err);
    const userId = await getUserId();
    return loadFromLocalStorage(userId);
  }
}

export async function saveStylePreferences(preferences: StylePreferences): Promise<void> {
  try {
    const userId = await getUserId();

    const { data: existing } = await supabase
      .from('user_style_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const dbData = {
      user_id: userId,
      color_scheme: preferences.colorScheme,
      density: preferences.density,
      font_family: preferences.fontFamily,
      font_size_scale: preferences.fontSizeScale,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase
        .from('user_style_preferences')
        .update(dbData)
        .eq('user_id', userId);

      if (error) {
        console.warn('Failed to update style preferences in database:', error);
        saveToLocalStorage(preferences);
        return;
      }
    } else {
      const { error } = await supabase
        .from('user_style_preferences')
        .insert({
          ...dbData,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('Failed to insert style preferences in database:', error);
        saveToLocalStorage(preferences);
        return;
      }
    }

    saveToLocalStorage(preferences);
  } catch (err) {
    console.error('Error saving style preferences:', err);
    saveToLocalStorage(preferences);
  }
}

function loadFromLocalStorage(userId: string): StylePreferences {
  try {
    const stored = localStorage.getItem('varvara-style-preferences');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...parsed, userId };
    }
  } catch (err) {
    console.warn('Failed to parse stored preferences:', err);
  }

  return {
    userId,
    ...DEFAULT_PREFERENCES,
  };
}

function saveToLocalStorage(preferences: StylePreferences): void {
  try {
    localStorage.setItem('varvara-style-preferences', JSON.stringify(preferences));
  } catch (err) {
    console.warn('Failed to save preferences to localStorage:', err);
  }
}

export function getDensityMultiplier(density: Density): number {
  switch (density) {
    case 'compact':
      return 0.75;
    case 'spacious':
      return 1.25;
    default:
      return 1.0;
  }
}

export function applyStylesToDocument(preferences: StylePreferences): void {
  const root = document.documentElement;
  const densityMultiplier = getDensityMultiplier(preferences.density);

  root.style.setProperty('--accent', preferences.colorScheme.accent);
  root.style.setProperty('--accent-hover', preferences.colorScheme.accentHover);
  root.style.setProperty('--accent-pressed', preferences.colorScheme.accentPressed);

  root.style.setProperty('--font-family-primary', preferences.fontFamily);
  root.style.setProperty('--font-size-scale', preferences.fontSizeScale.toString());
  root.style.setProperty('--density-multiplier', densityMultiplier.toString());

  document.body.style.fontFamily = preferences.fontFamily;
}

export const AVAILABLE_FONTS = [
  'Segoe UI',
  'Arial',
  'Helvetica Neue',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Inter',
  'System UI',
];

export const PRESET_COLOR_SCHEMES: { name: string; scheme: ColorScheme }[] = [
  {
    name: 'Default Blue',
    scheme: {
      accent: '#90CAF9',
      accentHover: '#BBDEFB',
      accentPressed: '#64B5F6',
    },
  },
  {
    name: 'Cyan',
    scheme: {
      accent: '#4DD0E1',
      accentHover: '#80DEEA',
      accentPressed: '#26C6DA',
    },
  },
  {
    name: 'Teal',
    scheme: {
      accent: '#4DB6AC',
      accentHover: '#80CBC4',
      accentPressed: '#26A69A',
    },
  },
  {
    name: 'Green',
    scheme: {
      accent: '#81C784',
      accentHover: '#A5D6A7',
      accentPressed: '#66BB6A',
    },
  },
  {
    name: 'Orange',
    scheme: {
      accent: '#FFB74D',
      accentHover: '#FFCC80',
      accentPressed: '#FFA726',
    },
  },
  {
    name: 'Pink',
    scheme: {
      accent: '#F06292',
      accentHover: '#F48FB1',
      accentPressed: '#EC407A',
    },
  },
];
