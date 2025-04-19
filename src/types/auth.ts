
import { Session } from '@supabase/supabase-js';

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty?: string;
  license_number?: string;
  profile_image?: string;
  care_coins_balance: number;
  online_status?: boolean;
  organization?: string;
  created_at?: string;
  updated_at?: string;
};

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  updateCurrentUser?: (userData: Partial<User>) => void;
};
