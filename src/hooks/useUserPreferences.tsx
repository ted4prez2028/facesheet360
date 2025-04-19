
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type PreferenceType = 'theme' | 'calendarView' | 'notification' | 'dashboardLayout';
type PreferenceValue = string | boolean | number | object;

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user preferences from database
          const { data, error } = await supabase
            .from('user_preferences')
            .select('preferences')
            .eq('user_id', session.user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setPreferences(data.preferences || {});
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
        const { error } = await supabase
          .from('user_preferences')
          .upsert({ 
            user_id: session.user.id, 
            preferences: newPreferences,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (error) throw error;
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
