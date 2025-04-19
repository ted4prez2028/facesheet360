
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
    detectSessionInUrl: false, // Change to false to prevent automatic URL parsing
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
  },
  // Add retry configuration
  retryAttempts: 3,
  retryInterval: 1000
});

// Clear any pending auth state on startup
if (typeof window !== 'undefined') {
  try {
    const url = new URL(window.location.href);
    if (url.hash && url.hash.includes('access_token')) {
      // In case there's a lingering auth redirect, remove it
      window.history.replaceState(
        {}, 
        document.title, 
        url.pathname + url.search
      );
    }
  } catch (e) {
    console.error("Failed to clean URL:", e);
  }
}

// Add comprehensive debug logging for auth state changes in development
if (process.env.NODE_ENV === 'development') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    // Add more detailed debugging for session objects
    if (session) {
      console.log('Session active:', {
        userId: session.user?.id,
        expiresAt: new Date(session.expires_at ? session.expires_at * 1000 : 0).toISOString(),
      });
    } else {
      console.log('No active session');
    }
  });
  
  // Add connection status check with better error handling
  supabase
    .from('users')
    .select('count(*)', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) {
        console.error('Supabase connection error:', error);
        console.log('Check if your Supabase project is active and the API keys are correct');
      } else {
        console.log('Supabase connection successful');
      }
    })
    .catch(err => {
      console.error('Supabase connection critical error:', err);
    });
    
  // Add health check for the session with better error handling
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Supabase session error:', error);
      console.log('Try clearing local storage and logging in again');
    } else if (data.session) {
      console.log('Supabase session active:', data.session.user.id);
      console.log('Session expires at:', new Date(data.session.expires_at ? data.session.expires_at * 1000 : 0).toISOString());
    } else {
      console.log('No active Supabase session');
      console.log('User needs to log in');
    }
  })
  .catch(err => {
    console.error('Critical session check error:', err);
  });
}

// Add a helper function to check authentication status
export const isAuthenticated = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};
