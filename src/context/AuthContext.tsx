
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types';
import { AuthContextType } from '@/types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const transformUserData = (userData: any): User => {
    return {
      id: userData.id || userData.user_id,
      name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email?.split('@')[0],
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'user',
      title: userData.title,
      specialty: userData.specialty,
      license_number: userData.license_number,
      profile_image: userData.profile_image,
      care_coins_balance: userData.care_coins_balance || userData.credits || 0,
      careCoinsBalance: userData.care_coins_balance || userData.credits || 0,
      online_status: userData.online_status,
      organization: userData.organization,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      user_id: userData.user_id || userData.id,
      credits: userData.credits || 0,
      remaining_credits: userData.remaining_credits || 0,
      total_credits: userData.total_credits || 0,
      is_admin: userData.is_admin || false,
      image_url: userData.image_url
    };
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Create basic user data from auth if profile doesn't exist
        const authUser = session?.user;
        if (authUser) {
          const basicUser: User = {
            id: authUser.id,
            user_id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            first_name: authUser.user_metadata?.first_name,
            last_name: authUser.user_metadata?.last_name,
            role: 'user',
            care_coins_balance: 0,
            careCoinsBalance: 0,
            credits: 0,
            remaining_credits: 0,
            total_credits: 0,
            is_admin: false
          };
          setUser(basicUser);
        }
      } else if (data) {
        const transformedUser = transformUserData(data);
        setUser(transformedUser);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
          }
        }
      });

      if (error) throw error;

      // Create user profile in users table
      if (data.user) {
        const profileData = {
          user_id: data.user.id,
          email: email,
          name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || email.split('@')[0],
          credits: 100,
          remaining_credits: 100,
          total_credits: 100,
          is_admin: false
        };

        const { error: profileError } = await supabase
          .from('users')
          .insert([profileData]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user?.user_id) return;

    try {
      const updateData = {
        name: userData.name,
        email: userData.email,
        credits: userData.credits,
        remaining_credits: userData.remaining_credits,
        total_credits: userData.total_credits,
        is_admin: userData.is_admin
      };

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('user_id', user.user_id)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        const transformedUser = transformUserData(data);
        setUser(transformedUser);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    login,
    signUp,
    logout,
    updateUserProfile,
    updateCurrentUser: (userData: Partial<User>) => {
      if (user) {
        setUser({ ...user, ...userData });
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { AuthContextType };
