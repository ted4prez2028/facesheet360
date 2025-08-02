import { supabase } from "@/integrations/supabase/client";

export const createAdminDoctorAccount = async (email: string, password: string, name?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-doctor', {
      body: {
        email,
        password,
        name
      }
    });

    if (error) {
      console.error('Error creating admin doctor account:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create admin doctor account:', error);
    throw error;
  }
};