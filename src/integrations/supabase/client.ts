
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tuembzleutkexrmrzxkg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZW1iemxldXRrZXhybXJ6eGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTcwMzksImV4cCI6MjA1ODU3MzAzOX0.nEy5OlfHeFFIFinnAbD2oYGsxnSuE-mTXqAGv98f1eE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    redirectTo: 'http://104.238.130.223:8080/'
  }
});

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
