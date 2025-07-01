
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

import { PreferenceType, UserPreferencesContextProps, defaultPreferences } from '@/types/userPreferences';

import { UserPreferencesContext } from './UserPreferences';

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PreferenceType>(defaultPreferences);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('preferences')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching preferences:', error);
          } else if (data?.preferences) {
            // Use type assertion to treat preferences as an object
            const storedPrefs = data.preferences as object;
            setPreferences({ ...defaultPreferences, ...storedPrefs });
          }
        } catch (error) {
          console.error('Unexpected error fetching preferences:', error);
        }
      } else {
        // Load from local storage if user is not logged in
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
          try {
            const parsedPrefs = JSON.parse(storedPreferences);
            setPreferences({ ...defaultPreferences, ...parsedPrefs });
          } catch (e) {
            console.error('Failed to parse stored preferences');
          }
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

    if (user?.id) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preferences: newPreferences,
          });

        if (error) {
          console.error('Error updating preferences:', error);
        }
      } catch (error) {
        console.error('Unexpected error updating preferences:', error);
      }
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};




