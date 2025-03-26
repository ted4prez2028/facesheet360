
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AuthContextType, User } from '@/types/auth';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { updateUserState } from '@/hooks/useUserStateUpdater';
import { toast } from 'sonner';

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
      (event, currentSession) => {
        console.log("Auth state changed:", event, !!currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent deadlocks with Supabase client
          setTimeout(async () => {
            try {
              // Simplified user state update to avoid RLS issues
              const userData: User = {
                id: currentSession.user.id,
                name: currentSession.user.email || '',
                email: currentSession.user.email || '',
                role: 'doctor',
                careCoinsBalance: 0
              };
              
              setUser(userData);
              
              if (event === 'SIGNED_IN') {
                toast.success("Successfully logged in");
              }
            } catch (error) {
              console.error("Error updating user state:", error);
              // Set minimal user data in case of error
              setUser({
                id: currentSession.user.id,
                name: currentSession.user.email || '',
                email: currentSession.user.email || '',
                role: 'doctor',
                careCoinsBalance: 0
              });
            }
          }, 0);
        } else {
          setUser(null);
          
          if (event === 'SIGNED_OUT') {
            toast.success("Successfully logged out");
          }
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
          try {
            // Simplified user object to bypass RLS issues
            const userData: User = {
              id: currentSession.user.id,
              name: currentSession.user.email || '',
              email: currentSession.user.email || '',
              role: 'doctor',
              careCoinsBalance: 0
            };
            
            setUser(userData);
          } catch (error) {
            console.error("Error initializing user state:", error);
            // Set minimal user data in case of error
            setUser({
              id: currentSession.user.id,
              name: currentSession.user.email || '',
              email: currentSession.user.email || '',
              role: 'doctor',
              careCoinsBalance: 0
            });
          }
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
        updateCurrentUser: (userData: Partial<User>) => {
          setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
