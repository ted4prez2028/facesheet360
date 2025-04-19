
import { createContext, useContext, useState, useEffect } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface UserPreferencesContextType {
  theme: string;
  setTheme: (theme: string) => void;
  dashboardLayout: string;
  setDashboardLayout: (layout: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const defaultContext: UserPreferencesContextType = {
  theme: 'light',
  setTheme: () => {},
  dashboardLayout: 'default',
  setDashboardLayout: () => {},
  notificationsEnabled: true,
  setNotificationsEnabled: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
};

const UserPreferencesContext = createContext<UserPreferencesContextType>(defaultContext);

export const useUserPreferencesContext = () => useContext(UserPreferencesContext);

interface UserPreferencesProviderProps {
  children: React.ReactNode;
}

export const UserPreferencesProvider = ({ children }: UserPreferencesProviderProps) => {
  const [theme, setThemeState] = useState<string>('light');
  const [dashboardLayout, setDashboardLayoutState] = useState<string>('default');
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  
  const { preferences, savePreference } = useUserPreferences();

  // Load preferences from hook
  useEffect(() => {
    if (preferences) {
      setThemeState(preferences.theme as string || 'light');
      setDashboardLayoutState(preferences.dashboardLayout as string || 'default');
      setNotificationsEnabledState(preferences.notification as boolean || true);
      setSoundEnabledState(preferences.soundEnabled as boolean || true);
    }
  }, [preferences]);

  const setTheme = (value: string) => {
    setThemeState(value);
    savePreference('theme', value);
  };

  const setDashboardLayout = (value: string) => {
    setDashboardLayoutState(value);
    savePreference('dashboardLayout', value);
  };

  const setNotificationsEnabled = (value: boolean) => {
    setNotificationsEnabledState(value);
    savePreference('notification', value);
  };

  const setSoundEnabled = (value: boolean) => {
    setSoundEnabledState(value);
    savePreference('soundEnabled', value);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        theme,
        setTheme,
        dashboardLayout,
        setDashboardLayout,
        notificationsEnabled,
        setNotificationsEnabled,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};
