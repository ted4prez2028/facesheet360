
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';

export interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  authError: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for testing
const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'doctor@example.com',
  name: 'Dr. Smith',
  role: 'doctor',
  care_coins_balance: 150,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          // For development, use mock user if no session
          console.log('No session found, using mock user for development');
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Fallback to mock user
        setUser(mockUser);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createUserProfile(userId);
        }
        return;
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          email: data.email || '',
          name: data.name || '',
          role: (data.role as 'doctor' | 'nurse' | 'therapist' | 'cna') || 'doctor',
          specialty: data.specialty,
          care_coins_balance: data.care_coins_balance || 0,
          organization: data.organization,
          online_status: data.online_status,
          last_seen: data.last_seen,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          user_id: userId,
          email: authUser.user?.email || '',
          name: authUser.user?.user_metadata?.name || 'User',
          role: 'doctor',
          care_coins_balance: 0
        });

      if (error) {
        console.error('Error creating user profile:', error);
        return;
      }

      // Fetch the newly created profile
      await fetchUserProfile(userId);
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Signed in successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      
      toast.success('Account created successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign up';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSupabaseUser(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  };

  const logout = signOut; // Alias for signOut
  const login = signIn; // Alias for signIn

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const updateUserProfile = updateProfile; // Alias for updateProfile

  const value = {
    user,
    supabaseUser,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    logout,
    updateProfile,
    updateUserProfile,
    login,
    authError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
