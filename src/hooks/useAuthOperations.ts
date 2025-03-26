import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { getUserProfile } from '@/lib/supabaseApi';

export const useAuthOperations = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setSession: React.Dispatch<React.SetStateAction<import('@supabase/supabase-js').Session | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();

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
      
      return Promise.resolve();
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      const user = await getUserState();
      if (!user) {
        return Promise.reject(new Error("User not authenticated"));
      }
      
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
      
      // Update state
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
      
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
  };

  const getUserState = async (): Promise<User | null> => {
    const { data } = await supabase.auth.getSession();
    const currentSession = data.session;
    
    if (!currentSession?.user) {
      return null;
    }
    
    try {
      const userData = await getUserProfile(currentSession.user.id);
      if (userData) {
        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as any,
          specialty: userData.specialty || undefined,
          licenseNumber: userData.license_number || undefined,
          profileImage: userData.profile_image || undefined,
          careCoinsBalance: userData.care_coins_balance || 0
        };
      }
    } catch (error) {
      console.error("Error getting user state:", error);
    }
    
    return null;
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  };

  return {
    login,
    signUp,
    logout,
    updateUserProfile,
    updateCurrentUser
  };
};
