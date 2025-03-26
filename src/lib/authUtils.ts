
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Checks if a user session exists
 * @returns Promise that resolves to a boolean indicating if a session exists
 */
export const checkSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error checking session:", error);
      return false;
    }
    
    if (!data.session) {
      return false;
    }
    
    // Check if token is expired or about to expire
    if (data.session.expires_at) {
      const expiresAt = new Date(data.session.expires_at * 1000);
      const now = new Date();
      
      // If token expires in less than 5 minutes, try to refresh it
      if ((expiresAt.getTime() - now.getTime()) < 5 * 60 * 1000) {
        console.log("Session expiring soon, refreshing token...");
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          return false;
        }
      }
    }
    
    return true;
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
