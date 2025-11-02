
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
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session with proper error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setUser(null);
          setSupabaseUser(null);
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          console.log('🔑 User authenticated, fetching profile...');
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('👋 User signed out, clearing state...');
          setSupabaseUser(null);
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed...');
          setSupabaseUser(session.user);
          // Don't refetch user profile on token refresh to avoid rate limiting
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📊 Database query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        toast.error('Failed to load user profile');
        return;
      }

      if (!data) {
        console.log('🆕 User profile not found, creating one...');
        await createUserProfile(userId);
        return;
      }

      console.log('✅ User profile found:', data);
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
      console.log('🚀 Setting user profile:', userProfile);
      setUser(userProfile);
    } catch (error) {
      console.error('💥 Error in fetchUserProfile:', error);
      toast.error('Authentication error');
    }
  };


  const createUserProfile = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      console.log('Creating new user profile in database...');
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          user_id: userId,
          email: authUser.user?.email || '',
          name: authUser.user?.user_metadata?.name || 'User',
          role: (authUser.user?.user_metadata?.role as 'doctor' | 'nurse' | 'therapist' | 'cna') || 'doctor',
          care_coins_balance: 0
        });

      if (error) {
        console.error('Error creating user profile:', error);
        toast.error('Failed to create user profile');
        return;
      }

      console.log('User profile created successfully, fetching...');
      await fetchUserProfile(userId);
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      toast.error('Failed to initialize user account');
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
      // Don't set isLoading to false here - let onAuthStateChange handle it
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false); // Only set to false on error
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) throw error;
      
      toast.success('Account created successfully! Please check your email to verify your account.');
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

  console.log('🔐 AuthContext state:', { 
    isAuthenticated: !!user, 
    isLoading, 
    hasUser: !!user, 
    userId: user?.id 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Temporary export to maintain compatibility while we migrate imports
export { useAuth } from '@/hooks/useAuth';

