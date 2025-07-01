/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Add alias for signOut for backward compatibility
  login: (email: string, password: string) => Promise<void>; // Alias for signIn
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null; // Added to track authentication errors
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  updateCurrentUser?: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUser = (userData: Partial<User>): User => ({
  id: userData.id,
  name: userData.name || userData.email?.split('@')[0] || 'User',
  email: userData.email || '',
  role: userData.role || 'doctor',
  specialty: userData.specialty,
  license_number: userData.license_number,
  profile_image: userData.profile_image,
  care_coins_balance: userData.care_coins_balance || 0,
  online_status: userData.online_status,
  organization: userData.organization,
  created_at: userData.created_at,
  updated_at: userData.updated_at
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const userData = await getUserProfile(session.user.id);
          setUser(userData ? initialUser(userData) : initialUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            role: session.user.user_metadata?.role || 'doctor'
          }));
          setSession(session);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error loading session:', errorMessage);
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
        setAuthError(errorMessage);
      } finally {
        setIsLoading(false);
        console.log('AuthContext: Initial load finished. isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
      };
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, 'session:', session);
      if (event === 'SIGNED_IN' && session) {
        const userData = await getUserProfile(session.user.id);
        setUser(userData ? initialUser(userData) : initialUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          role: session.user.user_metadata?.role || 'doctor'
        }));
        setSession(session);
        setIsAuthenticated(true);
        console.log('AuthContext: User SIGNED_IN. isAuthenticated:', true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
        console.log('AuthContext: User SIGNED_OUT. isAuthenticated:', false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        role: 'doctor', // Default role since not in DB
        specialty: '', // Default since not in DB
        license_number: '', // Default since not in DB
        profile_image: '', // Default since not in DB
        care_coins_balance: data.credits || 0,
        online_status: false, // Default since not in DB
        organization: '', // Default since not in DB
        created_at: data.created_at,
        updated_at: data.updated_at
      } as User;
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      const userData = await getUserProfile(data.user.id);
      setUser(userData || {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
        role: data.user.user_metadata?.role || 'doctor',
        care_coins_balance: 0
      } as User);
      setSession(data.session);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Sign-in error:', errorMessage);
      setAuthError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error: unknown) {
      console.error('Sign-out error:', error instanceof Error ? error.message : error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          user_id: data.user.id,
          name: userData.name,
          email: email,
          credits: 0
        });
        
        if (profileError) throw profileError;
      }
    } catch (error: unknown) {
      console.error('Sign-up error:', error instanceof Error ? error.message : error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>): Promise<void> => {
    if (!user?.id) throw new Error("User is not authenticated");
    
    try {
      const dbData: any = {};
      if (userData.name) dbData.name = userData.name;
      if (userData.email) dbData.email = userData.email;
      // Only update fields that exist in the database
      if (userData.care_coins_balance !== undefined) dbData.credits = userData.care_coins_balance;
      
      const { error } = await supabase
        .from('users')
        .update(dbData)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
    } catch (error: unknown) {
      console.error('Error updating user profile:', error instanceof Error ? error.message : error);
      throw error;
    }
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };
  
  const login = signIn;
  
  const value: AuthContextType = {
    user,
    session,
    signIn,
    signOut,
    logout: signOut,
    login,
    signUp,
    isAuthenticated,
    isLoading,
    authError,
    updateUserProfile,
    updateCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
