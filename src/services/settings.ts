/**
 * App Settings Service
 */

import { supabase } from '../lib/supabase';

export interface AppSetting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

/**
 * Get a setting value by key
 */
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) {
    console.warn(`Setting "${key}" not found`);
    return null;
  }

  return data.value;
}

/**
 * Update a setting value
 */
export async function updateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw error;
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<AppSetting[]> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .order('key');

  if (error) throw error;
  return data || [];
}

/**
 * Get current exchange rate from settings
 */
export async function getCurrentExchangeRate(): Promise<number> {
  const rate = await getSetting('current_exchange_rate');
  return rate ? parseFloat(rate) : 95.0; // Default fallback
}
