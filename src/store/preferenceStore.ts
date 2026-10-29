
/*import { create } from 'zustand';
import { storage } from '../services/storage';

export type ThemePreference = 'light' | 'dark' | 'system';

interface PreferencesState {
  theme: ThemePreference;
  notificationsEnabled: boolean;
  isHydrated: boolean;

  loadPreferences: () => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>()(
  (set) => ({
    theme: 'system',
    notificationsEnabled: true,
    isHydrated: false,

    loadPreferences: async () => {
      try {
        const [savedTheme, savedNotifications] = await Promise.all([
          storage.getTheme(),
          storage.getNotificationsEnabled(),
        ]);

        set({
          theme:
            savedTheme === 'light' || savedTheme === 'dark'
              ? savedTheme
              : 'system',
          notificationsEnabled: savedNotifications ?? true,
          isHydrated: true,
        });
      } catch (error) {
        console.error('Failed to load preferences:', error);
        set({ isHydrated: true });
      }
    },

    setTheme: async (theme) => {
      set({ theme });
      await storage.setTheme(theme);
    },

    setNotificationsEnabled: async (enabled) => {
      set({ notificationsEnabled: enabled });
      await storage.setNotificationsEnabled(enabled);
    },
  }),
);
*/