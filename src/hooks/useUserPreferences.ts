import { useContext } from 'react';
import { UserPreferencesContext } from '@/context/UserPreferencesContext';

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};