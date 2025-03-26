import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  updateCurrentUser?: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signUp: async () => {},
  logout: () => {},
  updateUserProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateUserState = async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setUser(null);
      return;
    }
    
    try {
      const userData = await getUserProfile(currentSession.user.id);
      if (userData) {
        // Transform to match our User type
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
        // If no user data yet (might happen during initial sign up before trigger completes)
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
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase auth state changes
          setTimeout(() => updateUserState(currentSession), 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        updateUserState(currentSession)
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      sonnerToast.success('Login successful');
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Sign up the user
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
      
      sonnerToast.success('Registration successful');
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
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
      navigate('/login');
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
        // Convert from our UI model to database model
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
        
        // Update the local user state
        setUser({
          ...user,
          ...userData
        });
        
        sonnerToast.success('Profile updated successfully');
      } catch (error) {
        console.error('Update profile error:', error);
        toast({
          title: "Update failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    }
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
