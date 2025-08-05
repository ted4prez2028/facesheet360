import { supabase } from "@/integrations/supabase/client";

export const createInitialAdminAccount = async () => {
  try {
    console.log('Creating initial admin account...');
    
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

    console.log('Initial admin account created successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to create initial admin account:', error);
    return { success: false, error };
  }
};

// Execute this function to create the admin account
createInitialAdminAccount().then(result => {
  if (result.success) {
    console.log('✅ Initial admin account ready!');
  } else {
    console.error('❌ Failed to create initial admin account:', result.error);
  }
});