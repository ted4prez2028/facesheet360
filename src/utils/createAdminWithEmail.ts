import { supabase } from "@/integrations/supabase/client";

export const createAdminWithWelcomeEmail = async (
  email: string,
  name?: string,
  password?: string
) => {
  try {
    console.log(`Creating admin account for: ${email}`);

    const { data, error } = await supabase.functions.invoke('create-admin-and-welcome', {
      body: {
        email,
        name,
        password
      }
    });

    if (error) {
      console.error('Error creating admin account:', error);
      throw error;
    }

    console.log('Admin account created successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create admin account:', error);
    throw error;
  }
};

// Execute for mannymac7021@gmail.com
createAdminWithWelcomeEmail(
  'mannymac7021@gmail.com',
  'Manny Mac',
  'TempPassword123!'
).then(result => {
  console.log('✅ Admin account created:', result);
}).catch(error => {
  console.error('❌ Failed to create admin account:', error);
});
