import { supabase } from "@/integrations/supabase/client";

// Create the admin account immediately
const createAdminAccount = async () => {
  try {
    console.log('Creating admin doctor account...');
    
    const { data, error } = await supabase.functions.invoke('create-admin-doctor', {
      body: {
        email: 'tdicusmurray@gmail.com',
        password: 'Klasfad4',
        name: 'Admin Doctor'
      }
    });

    if (error) {
      console.error('Error creating admin account:', error);
      return { success: false, error };
    }

    console.log('Admin account created successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to create admin account:', error);
    return { success: false, error };
  }
};

// Export for manual execution
export { createAdminAccount };