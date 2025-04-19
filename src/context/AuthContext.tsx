
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  session: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Add alias for signOut for backward compatibility
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  updateCurrentUser?: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const userData = await getUserProfile(session.user.id);
          setUser(userData || {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'doctor',
            careCoinsBalance: 0
          } as User);
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
        setUser(userData || {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'doctor',
          careCoinsBalance: 0
        } as User);
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

      return data as User;
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
    } catch (error: any) {
      console.error('Sign-in error:', error.message);
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
    } catch (error: any) {
      console.error('Sign-out error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>): Promise<void> => {
    if (!user?.id) throw new Error("User is not authenticated");
    
    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
    } catch (error: any) {
      console.error('Error updating user profile:', error.message);
      throw error;
    }
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value: AuthContextType = {
    user,
    session,
    signIn,
    signOut,
    logout: signOut, // Add alias for signOut
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
