
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getEnv } from '@/utils/envValidation';

// Validate environment variables on import
let env: ReturnType<typeof getEnv>;
try {
  env = getEnv();
} catch (error) {
  console.error('Failed to validate environment variables:', error);
  throw error;
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Initialize the Supabase client with optimized configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-client-info': 'facesheet360-ehr'
    }
  }
});


