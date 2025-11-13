
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kxngtgrfdqhfpsqyhcui.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bmd0Z3JmZHFoZnBzcXloY3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTMxNTcsImV4cCI6MjA3ODEyOTE1N30.pdFjK1DwlumuCtsK7bWvzoabHnVpmV8wkN9ln5bjWto";

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


