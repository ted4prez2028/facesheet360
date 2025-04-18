
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tuembzleutkexrmrzxkg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW1iemxldXRrZXhybXJ6eGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTcwMzksImV4cCI6MjA1ODU3MzAzOX0.nEy5OlfHeFFIFinnAbD2oYGsxnSuE-mTXqAGv98f1eE";

// Initialize the Supabase client with optimized configuration for HTTPS
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    detectSessionInUrl: false, // Disable this to prevent issues with HTTPS redirects
    flowType: 'pkce', // Using PKCE flow for better security with HTTPS
  },
  global: {
    headers: {
      'x-client-info': 'facesheet360-ehr',
    }
  }
});

// Debug logging for development environment
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase client initialized with URL:', SUPABASE_URL);
  
  // Add auth state change listener for debugging
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
  });
  
  // Test connection and log results
  setTimeout(() => {
    console.log('Testing Supabase connection...');
    supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true })
      .then(({ error }) => {
        if (error) {
          console.error('Supabase connection test failed:', error);
        } else {
          console.log('Supabase connection test successful');
        }
      });
  }, 1000);
}
