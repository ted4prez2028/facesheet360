
import { getUserProfile } from '@/lib/supabaseApi';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/auth';

export const updateUserState = async (currentSession: Session | null): Promise<User | null> => {
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
    } else {
      return {
        id: currentSession.user.id,
        name: currentSession.user.email || '',
        email: currentSession.user.email || '',
        role: 'doctor',
        careCoinsBalance: 0
      };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};
