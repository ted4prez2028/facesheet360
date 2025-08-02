import { createAdminDoctorAccount } from './createAdminAccount';

// This function will be called once to set up the admin account
export const setupInitialAdminAccount = async () => {
  try {
    const result = await createAdminDoctorAccount(
      'tdicusmurray@gmail.com', 
      'Klasfad4', 
      'Admin Doctor'
    );
    
    console.log('Admin account created successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to create admin account:', error);
    throw error;
  }
};

// Call this function to create the account
setupInitialAdminAccount();