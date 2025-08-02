import { createAdminAccount } from './createAccount';

// Execute account creation
createAdminAccount().then(result => {
  if (result.success) {
    console.log('✅ Admin account ready!');
  } else {
    console.error('❌ Failed to create admin account:', result.error);
  }
});