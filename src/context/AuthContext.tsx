import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from '@/types';
import { toast } from 'sonner';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id);
        setSession(session);
        setIsLoading(false);
        
        if (session?.user) {
          const enrichedUser = await syncUserProfile(session.user);
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 Initial session check:', session?.user?.id);
      setSession(session);
      setIsLoading(false);
      
      if (session?.user) {
        const enrichedUser = await syncUserProfile(session.user);
        setUser(enrichedUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const syncUserProfile = async (authUser: SupabaseUser): Promise<User> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', error);
      }

      if (!profile) {
        console.log('🆕 Creating new profile for user');
        const newProfile = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          care_coins_balance: 0,
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
        }

        return {
          id: authUser.id,
          email: authUser.email || '',
          name: newProfile.name,
          role: 'doctor',
          care_coins_balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      // Return enriched user with profile data
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name || authUser.email?.split('@')[0] || 'User',
        role: (profile.role as User['role']) || 'doctor',
        specialty: profile.specialty,
        profile_image: profile.avatar_url,
        care_coins_balance: Number(profile.care_coins_balance) || 0,
        online_status: profile.online_status,
        last_seen: profile.last_seen,
        bio: profile.bio,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    } catch (error) {
      console.error('💥 Error syncing profile:', error);
      // Return minimal user data on error
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.email?.split('@')[0] || 'User',
        role: 'doctor',
        care_coins_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('❌ Error signing out:', error);
      setAuthError(error.message);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  };

  const logout = signOut; // Alias for compatibility

  const value = {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    signOut,
    logout,
    authError,
  };

  console.log('🔐 AuthContext state:', { 
    isAuthenticated: !!session, 
    isLoading, 
    hasUser: !!user, 
    userId: user?.id 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Temporary export to maintain compatibility while we migrate imports
export { useAuth } from '@/hooks/useAuth';
