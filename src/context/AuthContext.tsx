import React, { createContext, useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';

export interface AuthContextType {
  user: User | null;
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync Clerk user with local profile
  useEffect(() => {
    if (!isLoaded) return;

    console.log('🔐 Clerk auth state:', { isSignedIn, userId: clerkUser?.id });

    if (isSignedIn && clerkUser) {
      fetchOrCreateProfile(clerkUser.id, clerkUser);
    } else {
      setUser(null);
    }
  }, [isSignedIn, clerkUser, isLoaded]);

  const fetchOrCreateProfile = async (clerkId: string, clerkUser: any) => {
    try {
      console.log('🔍 Fetching profile for Clerk user:', clerkId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', clerkId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', error);
        return;
      }

      if (!data) {
        console.log('🆕 Creating new profile for Clerk user');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            clerk_user_id: clerkId,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            name: clerkUser.fullName || clerkUser.firstName || 'User',
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
          return;
        }

        setUser({
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name || '',
          role: newProfile.role || 'patient',
          care_coins_balance: 0,
        });
      } else {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name || '',
          role: data.role || 'patient',
          care_coins_balance: 0,
        });
      }
    } catch (error) {
      console.error('💥 Error in fetchOrCreateProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthError('Please use the /auth page to sign in with Clerk');
    toast.error('Please use the /auth page to sign in');
    throw new Error('Use Clerk authentication at /auth');
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    setAuthError('Please use the /auth page to sign up with Clerk');
    toast.error('Please use the /auth page to sign up');
    throw new Error('Use Clerk authentication at /auth');
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
      setUser(null);
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
    isAuthenticated: isSignedIn && !!user,
    isLoading: !isLoaded,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    updateProfile,
    updateUserProfile: updateProfile,
    login: signIn,
    authError
  };

  console.log('🔐 AuthContext state:', { 
    isAuthenticated: isSignedIn && !!user, 
    isLoading: !isLoaded, 
    hasUser: !!user, 
    userId: user?.id 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Temporary export to maintain compatibility while we migrate imports
export { useAuth } from '@/hooks/useAuth';

