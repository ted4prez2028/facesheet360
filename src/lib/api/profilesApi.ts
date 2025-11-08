import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Fetches all profiles from the database
 * @returns A promise that resolves to an array of user profiles
 */
export const getProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw error;
  }
};

/**
 * Fetches a single profile by ID
 * @param id The user's ID
 * @returns A promise that resolves to the user profile
 */
export const getProfileById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`Profile with ID ${id} not found`);
    
    return data as User;
  } catch (error) {
    console.error(`Error fetching profile with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Updates a user's profile
 * @param id The user's ID
 * @param updates The fields to update
 * @returns A promise that resolves to the updated profile
 */
export const updateProfile = async (id: string, updates: Partial<User>) => {
  try {
    const updatedProfile = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(updatedProfile)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`Profile with ID ${id} not found or could not be updated`);
    
    return data as User;
  } catch (error) {
    console.error(`Error updating profile with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Updates a user's online status
 * @param id The user's ID
 * @param isOnline The online status
 * @returns A promise that resolves to the updated profile
 */
export const updateProfileOnlineStatus = async (id: string, isOnline: boolean) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ 
        online_status: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error(`Error updating online status for profile with ID ${id}:`, error);
    throw error;
  }
};
