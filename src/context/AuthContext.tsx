
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
        console.error('Error loading session:', error);
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
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
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        specialty: data.specialty,
        license_number: data.license_number,
        profile_image: data.profile_image,
        care_coins_balance: data.care_coins_balance || 0,
        online_status: data.online_status,
        organization: data.organization,
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
        careCoinsBalance: 0
      } as User);
      setSession(data.session);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      console.error('Sign-in error:', error instanceof Error ? error.message : error);
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
          id: data.user.id,
          name: userData.name,
          email: email,
          role: userData.role || 'doctor',
          care_coins_balance: 0
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
      const dbData: Partial<User> = {};
      if (userData.name) dbData.name = userData.name;
      if (userData.email) dbData.email = userData.email;
      if (userData.specialty) dbData.specialty = userData.specialty;
      if (userData.license_number) dbData.license_number = userData.license_number;
      if (userData.profile_image) dbData.profile_image = userData.profile_image;
      if (userData.care_coins_balance !== undefined) dbData.care_coins_balance = userData.care_coins_balance;
      if (userData.role) dbData.role = userData.role;
      if (userData.organization) dbData.organization = userData.organization;
      
      const { error } = await supabase
        .from('users')
        .update(dbData)
        .eq('id', user.id);
        
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
    updateUserProfile,
    updateCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Force recompile
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


