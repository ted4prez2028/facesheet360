
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoRefresh: boolean;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    notifications: true,
    autoRefresh: true
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      // Try to load from localStorage as fallback
      const savedPreferences = localStorage.getItem(`user_preferences_${user.id}`);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
    setIsLoading(false);
  }, [user, loadPreferences]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);
      
      // Save to localStorage as fallback
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return {
    preferences,
    isLoading,
    updatePreferences
  };
};
