
import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

import { PreferenceType, defaultPreferences } from '@/types/userPreferences';

import { UserPreferencesContext } from './UserPreferences';

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PreferenceType>(defaultPreferences);

  useEffect(() => {
    const fetchPreferences = async () => {
      // Since user_preferences table doesn't exist, use localStorage
      const storedPreferences = localStorage.getItem('userPreferences');
      if (storedPreferences) {
        try {
          const parsedPrefs = JSON.parse(storedPreferences);
          setPreferences({ ...defaultPreferences, ...parsedPrefs });
        } catch (e) {
          console.error('Failed to parse stored preferences');
        }
      }
    };

    fetchPreferences();
  }, [user?.id]);

  const updatePreference = async (key: keyof PreferenceType, value: PreferenceType[keyof PreferenceType]) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    // Save to local storage
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
