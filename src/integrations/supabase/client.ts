
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://fzyowqpaceazrcwpukhf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eW93cXBhY2VhenJjd3B1a2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODEzNjUsImV4cCI6MjA3ODU1NzM2NX0.GTExhfgZVUbO14dmp3hZ9Kn-jxOFQX6sv0BhoNZsQ7k";

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


