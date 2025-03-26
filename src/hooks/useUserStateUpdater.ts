
import { getUserProfile } from '@/lib/supabaseApi';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export const updateUserState = async (currentSession: Session | null): Promise<User | null> => {
  if (!currentSession?.user) {
    return null;
  }
  
  try {
    // Try to get the user profile from the database first
    const userData = await getUserProfile(currentSession.user.id).catch(error => {
      console.warn("Error from getUserProfile, falling back to auth metadata:", error);
      return null;
    });
    
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
    } else {
      // If database query fails, fall back to session user metadata
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const userMeta = user.user_metadata || {};
      
      return {
        id: user.id,
        name: userMeta.name || user.email || '',
        email: user.email || '',
        role: userMeta.role || 'doctor',
        careCoinsBalance: 0
      };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    
    // Last resort fallback - construct user from session only
    return {
      id: currentSession.user.id,
      name: currentSession.user.email || '',
      email: currentSession.user.email || '',
      role: 'doctor',
      careCoinsBalance: 0
    };
  }
};
