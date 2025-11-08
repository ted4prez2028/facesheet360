import { User as SupabaseUser } from '@supabase/supabase-js';

// Extended User type that combines Supabase auth user with profile data
export interface User extends SupabaseUser {
  name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  profile_image?: string | null; // Alias for avatar_url
  role?: string | null;
  specialty?: string | null;
  bio?: string | null;
  care_coins_balance?: number;
  online_status?: boolean;
  last_seen?: string | null;
}

// Profile data from database
export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  specialty?: string | null;
  bio?: string | null;
  care_coins_balance?: number;
  online_status?: boolean;
  last_seen?: string | null;
  created_at?: string;
  updated_at?: string;
}
