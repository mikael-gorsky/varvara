// Inventory Settings Service
// Created: 2026-02-20
// Purpose: Manage global inventory configuration settings

import { supabase } from '../lib/supabase';

export interface InventorySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'number' | 'boolean' | 'text';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventorySettings {
  default_lead_time_days: number;
  default_moq: number;
  default_safety_stock_days: number;
  default_turnover_threshold_days: number;
  container_20ft_weight_kg: number;
  container_40hq_weight_kg: number;
  allow_quality_mixing: boolean;
  reorder_alert_threshold: number;
  critical_stock_days: number;
  aged_inventory_months: number;
}

const DEFAULT_SETTINGS: InventorySettings = {
  default_lead_time_days: 45,
  default_moq: 1,
  default_safety_stock_days: 30,
  default_turnover_threshold_days: 90,
  container_20ft_weight_kg: 28000,
  container_40hq_weight_kg: 27000,
  allow_quality_mixing: true,
  reorder_alert_threshold: 10,
  critical_stock_days: 7,
  aged_inventory_months: 12
};

/**
 * Get all inventory settings
 */
export async function getAllSettings(): Promise<InventorySetting[]> {
  const { data, error } = await supabase
    .from('inv_system_settings')
    .select('*')
    .order('setting_key');

  if (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get settings as typed object
 */
export async function getSettings(): Promise<InventorySettings> {
  try {
    const settingsArray = await getAllSettings();
    const settings: any = { ...DEFAULT_SETTINGS };

    for (const setting of settingsArray) {
      if (setting.setting_key in DEFAULT_SETTINGS) {
        if (setting.setting_type === 'number') {
          settings[setting.setting_key] = parseFloat(setting.setting_value);
        } else if (setting.setting_type === 'boolean') {
          settings[setting.setting_key] = setting.setting_value === 'true';
        } else {
          settings[setting.setting_key] = setting.setting_value;
        }
      }
    }

    return settings;
  } catch (error) {
    console.error('Error getting settings, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Get a single setting value
 */
export async function getSetting(key: string, defaultValue?: any): Promise<any> {
  const { data, error } = await supabase
    .from('inv_system_settings')
    .select('setting_value, setting_type')
    .eq('setting_key', key)
    .single();

  if (error || !data) {
    return defaultValue;
  }

  if (data.setting_type === 'number') {
    return parseFloat(data.setting_value);
  } else if (data.setting_type === 'boolean') {
    return data.setting_value === 'true';
  }

  return data.setting_value;
}

/**
 * Update a setting value
 */
export async function updateSetting(
  key: string,
  value: string | number | boolean
): Promise<void> {
  const stringValue = String(value);

  const { error } = await supabase
    .from('inv_system_settings')
    .update({
      setting_value: stringValue,
      updated_at: new Date().toISOString()
    })
    .eq('setting_key', key);

  if (error) {
    console.error('Error updating setting:', error);
    throw error;
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(settings: Partial<InventorySettings>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => ({
    setting_key: key,
    setting_value: String(value),
    updated_at: new Date().toISOString()
  }));

  // Update each setting individually (Supabase doesn't support bulk update well)
  for (const update of updates) {
    await updateSetting(update.setting_key, update.setting_value);
  }
}

/**
 * Reset all settings to defaults
 */
export async function resetToDefaults(): Promise<void> {
  await updateSettings(DEFAULT_SETTINGS);
}

/**
 * Validate setting value
 */
export function validateSetting(key: string, value: any): { valid: boolean; error?: string } {
  const numericSettings = [
    'default_lead_time_days',
    'default_moq',
    'default_safety_stock_days',
    'default_turnover_threshold_days',
    'container_20ft_weight_kg',
    'container_40hq_weight_kg',
    'reorder_alert_threshold',
    'critical_stock_days',
    'aged_inventory_months'
  ];

  if (numericSettings.includes(key)) {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return { valid: false, error: 'Must be a positive number' };
    }

    // Specific validations
    if (key === 'default_lead_time_days' && num > 365) {
      return { valid: false, error: 'Lead time cannot exceed 365 days' };
    }
    if (key === 'container_20ft_weight_kg' && num > 50000) {
      return { valid: false, error: 'Weight limit seems too high (max 50,000 kg)' };
    }
    if (key === 'container_40hq_weight_kg' && num > 50000) {
      return { valid: false, error: 'Weight limit seems too high (max 50,000 kg)' };
    }
  }

  return { valid: true };
}
