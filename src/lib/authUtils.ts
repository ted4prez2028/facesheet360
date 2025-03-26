
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Checks if a user session exists
 * @returns Promise that resolves to a boolean indicating if a session exists
 */
export const checkSession = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
};

/**
 * Formats user data from database format to application format
 */
export const formatUserData = (userData: any): User => {
  return {
    id: userData.id,
    name: userData.name || '',
    email: userData.email || '',
    role: userData.role || 'doctor',
    specialty: userData.specialty || undefined,
    license_number: userData.license_number || undefined,
    profile_image: userData.profile_image || undefined,
    care_coins_balance: userData.care_coins_balance || 0,
    created_at: userData.created_at || '',
    updated_at: userData.updated_at || '',
  };
};

/**
 * Get current authenticated user information
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error || !data) {
      throw error || new Error('User data not found');
    }
    
    return formatUserData(data);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
