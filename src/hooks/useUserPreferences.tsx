
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type PreferenceType = 'theme' | 'calendarView' | 'notification' | 'dashboardLayout';
type PreferenceValue = string | boolean | number | object;

interface UserPreferences {
  [key: string]: PreferenceValue;
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error: fetchError } = await supabase
            .from('user_preferences')
            .select('preferences')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (fetchError) throw fetchError;
          
          if (data?.preferences) {
            setPreferences(data.preferences as UserPreferences);
          }
        } else {
          // If not logged in, try to get preferences from local storage
          const storedPrefs = localStorage.getItem('userPreferences');
          if (storedPrefs) {
            setPreferences(JSON.parse(storedPrefs));
          }
        }
      } catch (err) {
        console.error("Error loading user preferences:", err);
        setError(err instanceof Error ? err : new Error('Unknown error loading preferences'));
      } finally {
        setLoading(false);
      }
    };
    
    loadPreferences();
  }, []);

  const savePreference = async (key: PreferenceType, value: PreferenceValue) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      
      // Save to local storage in any case
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      
      // If logged in, save to database
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { error: saveError } = await supabase
          .from('user_preferences')
          .upsert({ 
            user_id: session.user.id, 
            preferences: newPreferences as unknown as Json,
            updated_at: new Date().toISOString()
          });
        
        if (saveError) throw saveError;
      }
      
      return true;
    } catch (err) {
      console.error("Error saving preference:", err);
      setError(err instanceof Error ? err : new Error('Unknown error saving preference'));
      return false;
    }
  };
  
  const getPreference = <T extends PreferenceValue>(key: PreferenceType, defaultValue: T): T => {
    return (preferences[key] as T) ?? defaultValue;
  };

  return { 
    preferences, 
    loading, 
    error, 
    savePreference, 
    getPreference 
  };
}
