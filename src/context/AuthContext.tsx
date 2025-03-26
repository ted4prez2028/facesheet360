
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AuthContextType, User } from '@/types/auth';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { updateUserState } from '@/hooks/useUserStateUpdater';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const authOperations = useAuthOperations(setUser, setSession, setIsLoading);

  useEffect(() => {
    // First set up auth state listener before checking for existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, !!currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent deadlocks with Supabase client
          setTimeout(async () => {
            const userData = await updateUserState(currentSession);
            setUser(userData);
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Got existing session:", !!currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          const userData = await updateUserState(currentSession);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        ...authOperations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
