import { createContext, useContext } from 'react';
import { UserPreferencesContextProps, defaultPreferences } from '@/types/userPreferences';

export const UserPreferencesContext = createContext<UserPreferencesContextProps>({
  preferences: defaultPreferences,
  updatePreference: () => {},
});

// Hook for easy access to preferences
export const useUserPreferences = () => useContext(UserPreferencesContext);