
import { Session } from '@supabase/supabase-js';

export type User = {
  id: string;
  name: string;
  email: string;
  role: string; // Allow any string for role to match database
  specialty?: string;
  licenseNumber?: string;
  profileImage?: string;
  careCoinsBalance: number;
  online_status?: boolean;
  organization?: string; // Add organization field
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
