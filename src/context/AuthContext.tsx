
import React, { createContext, useEffect, useState, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';
import { useCareCoins } from '@/hooks/useCareCoins';

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

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { ensureAdminBalance } = useCareCoins();
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        
        if (session?.user && mounted) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user.id);
        } 
        
        if (mounted) {
          setIsLoading(false);
        }
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
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔑 User signed in, setting supabase user and fetching profile...');
          setSupabaseUser(session.user);
          setIsLoading(true);
          // Defer the profile fetch to avoid potential race conditions
          setTimeout(async () => {
            try {
              await fetchUserProfile(session.user.id);
            } catch (error) {
              console.error('❌ Failed to fetch user profile after sign in:', error);
              await createFallbackUser(session.user.id);
            } finally {
              setIsLoading(false);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('👋 User signed out, clearing state...');
          setSupabaseUser(null);
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed...');
          setSupabaseUser(session.user);
          // Don't refetch user profile on token refresh if we already have user data
          if (!userRef.current) {
            setTimeout(async () => {
              try {
                await fetchUserProfile(session.user.id);
              } catch (error) {
                console.error('❌ Failed to fetch user profile after token refresh:', error);
                await createFallbackUser(session.user.id);
              } finally {
                setIsLoading(false);
              }
            }, 100);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📊 Database query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('🆕 User profile not found, creating one...');
          await createUserProfile(userId);
          return;
        }
        // If other error, create a basic user from auth data
        console.log('🔄 Creating fallback user profile due to error...');
        await createFallbackUser(userId);
        return;
      }

      if (data) {
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
        if (userProfile.email === 'tdicusmurray@gmail.com' && userProfile.role !== 'admin') {
          await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', userProfile.id);
          userProfile.role = 'admin';
        }
        setUser(userProfile);
        await ensureAdminBalance(userProfile.email, userProfile.id);
        console.log('✨ User profile set successfully');
      } else {
        console.log('⚠️ No data returned, creating fallback user...');
        await createFallbackUser(userId);
      }
    } catch (error) {
      console.error('💥 Error in fetchUserProfile:', error);
      // Always create fallback user to prevent loading freeze
      await createFallbackUser(userId);
    }
  };

  const createFallbackUser = async (userId: string) => {
    try {
      console.log('🔧 Creating fallback user for:', userId);
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        console.log('📝 Creating fallback user profile from auth data');
        const basicUser: User = {
          id: authUser.user.id,
          email: authUser.user.email || '',
          name: authUser.user.user_metadata?.name || authUser.user.email || 'User',
          role: (authUser.user.user_metadata?.role as 'doctor' | 'nurse' | 'therapist' | 'cna') || 'doctor',
          care_coins_balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('🎯 Setting fallback user:', basicUser);
        setUser(basicUser);
        console.log('✅ Fallback user set successfully');
      } else {
        console.error('❌ No auth user found for fallback');
      }
    } catch (error) {
      console.error('💥 Error creating fallback user:', error);
      // Even if this fails, create a minimal user to prevent freeze
      const minimalUser: User = {
        id: userId,
        email: 'user@example.com',
        name: 'User',
        role: 'doctor',
        care_coins_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('🆘 Setting minimal user to prevent freeze:', minimalUser);
      setUser(minimalUser);
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
        // Fallback to creating user from auth data
        await createFallbackUser(userId);
        return;
      }

      console.log('User profile created successfully, fetching...');
      // Fetch the newly created profile
      await fetchUserProfile(userId);
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // Always fallback to prevent freeze
      await createFallbackUser(userId);
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
    // Treat the presence of a Supabase session as authenticated even if the
    // profile hasn't finished loading. This prevents valid sessions from being
    // redirected to the login page when navigating directly to protected
    // routes or on slow network connections.
    isAuthenticated: !!supabaseUser,
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

// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from '@/hooks/useAuth';

