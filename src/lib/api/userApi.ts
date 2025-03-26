
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Fetches all users from the database
 * @returns A promise that resolves to an array of users
 */
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Fetches a single user by ID
 * @param id The user's ID
 * @returns A promise that resolves to the user
 */
export const getUserById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`User with ID ${id} not found`);
    
    return data as User;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches the current user's profile
 * @param id The user's ID
 * @returns A promise that resolves to the user profile
 */
export const getUserProfile = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`User profile with ID ${id} not found`);
    
    return data as User;
  } catch (error) {
    console.error(`Error fetching user profile with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Updates a user's profile
 * @param id The user's ID
 * @param updates The fields to update
 * @returns A promise that resolves to the updated user
 */
export const updateUser = async (id: string, updates: Partial<User>) => {
  try {
    // Add updated_at timestamp
    const updatedUser = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("users")
      .update(updatedUser)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`User with ID ${id} not found or could not be updated`);
    
    return data as User;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Updates a user's online status
 * @param id The user's ID
 * @param isOnline The online status
 * @returns A promise that resolves to the updated user
 */
export const updateUserOnlineStatus = async (id: string, isOnline: boolean) => {
  try {
    const { data, error } = await supabase
      .from("users")
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
    console.error(`Error updating online status for user with ID ${id}:`, error);
    throw error;
  }
};
