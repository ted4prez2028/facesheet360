export type PreferenceType = {
  theme: 'light' | 'dark' | 'system';
  dashboardLayout: string;
  notification: boolean;
  soundEnabled: boolean;
};

export interface UserPreferencesContextProps {
  preferences: PreferenceType;
  updatePreference: (key: keyof PreferenceType, value: PreferenceType[keyof PreferenceType]) => void;
};

export const defaultPreferences: PreferenceType = {
  theme: 'system',
  dashboardLayout: 'default',
  notification: true,
  soundEnabled: true,
};