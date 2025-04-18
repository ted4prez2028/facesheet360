
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tuembzleutkexrmrzxkg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW1iemxldXRrZXhybXJ6eGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTcwMzksImV4cCI6MjA1ODU3MzAzOX0.nEy5OlfHeFFIFinnAbD2oYGsxnSuE-mTXqAGv98f1eE";

// Initialize the Supabase client with optimized configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    detectSessionInUrl: false, // This prevents issues with HTTPS redirects
    flowType: 'pkce',
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

// Add debug logging for auth state changes in development
if (process.env.NODE_ENV === 'development') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
  });
  
  // Add connection status check
  supabase
    .from('users')
    .select('count(*)', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) {
        console.error('Supabase connection error:', error);
      } else {
        console.log('Supabase connection successful');
      }
    });
    
  // Add health check for the session
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Supabase session error:', error);
    } else if (data.session) {
      console.log('Supabase session active:', data.session.user.id);
    } else {
      console.log('No active Supabase session');
    }
  });
}
