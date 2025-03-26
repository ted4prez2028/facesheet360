
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { Session } from '@supabase/supabase-js';
import { getUserProfile } from '@/lib/supabaseApi';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'nurse' | 'therapist' | 'cna' | 'admin';
  specialty?: string;
  licenseNumber?: string;
  profileImage?: string;
  careCoinsBalance: number;
};

type AuthContextType = {
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
  const { toast } = useToast();

  const updateUserState = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setUser(null);
      return;
    }
    
    try {
      const userData = await getUserProfile(currentSession.user.id);
      if (userData) {
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as any,
          specialty: userData.specialty || undefined,
          licenseNumber: userData.license_number || undefined,
          profileImage: userData.profile_image || undefined,
          careCoinsBalance: userData.care_coins_balance || 0
        });
      } else {
        setUser({
          id: currentSession.user.id,
          name: currentSession.user.email || '',
          email: currentSession.user.email || '',
          role: 'doctor',
          careCoinsBalance: 0
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  useEffect(() => {
    // First set up auth state listener before checking for existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, !!currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent deadlocks with Supabase client
          setTimeout(() => updateUserState(currentSession), 0);
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
          await updateUserState(currentSession);
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
  }, [updateUserState]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Login successful, session:", !!data.session);
      sonnerToast.success('Login successful');
      
      // The auth state change event will handle updating the session and user
      return Promise.resolve();
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'doctor'
          }
        }
      });
      
      if (error) throw error;
      
      console.log("Registration successful, session:", !!data.session);
      sonnerToast.success('Registration successful');
      
      // The auth state change event will handle updating the session and user
      return Promise.resolve();
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      sonnerToast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (user) {
      try {
        const dbUpdate = {
          name: userData.name,
          specialty: userData.specialty,
          license_number: userData.licenseNumber,
          profile_image: userData.profileImage,
        };
        
        const { data, error } = await supabase
          .from('users')
          .update(dbUpdate)
          .eq('id', user.id)
          .select();
          
        if (error) throw error;
        
        setUser({
          ...user,
          ...userData
        });
        
        sonnerToast.success('Profile updated successfully');
        return Promise.resolve();
      } catch (error) {
        console.error('Update profile error:', error);
        toast({
          title: "Update failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error("User not authenticated"));
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (user) {
      setUser({
        ...user,
        ...userData
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
        updateUserProfile,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
