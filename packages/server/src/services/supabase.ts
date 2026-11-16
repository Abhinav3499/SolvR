import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
};

export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export function createUserClient(accessToken: string): SupabaseClient | null {
  if (!config.supabaseUrl) return null;
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey || 'anon', {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
