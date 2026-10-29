import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '../theme/colors';

const THEME_KEY = '@vendor_app_theme';
const SETTINGS_THEME_KEY = '@vendor_settings_theme';
const SETTINGS_KEY = '@vendor_app_settings';
const AUTH_TOKEN_KEY = '@vendor_app_access_token';

export type SettingsPreferences = {
  orderAlerts: boolean;
  stockAlerts: boolean;
  paymentAlerts: boolean;
  emailUpdates: boolean;
};

export const DEFAULT_SETTINGS: SettingsPreferences = {
  orderAlerts: true,
  stockAlerts: true,
  paymentAlerts: true,
  emailUpdates: false,
};

export const storage = {
  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  },
  // Existing global theme storage
  async getTheme(): Promise<ThemeMode | null> {
    const value = await AsyncStorage.getItem(THEME_KEY);

    if (value === 'light' || value === 'dark') {
      return value;
    }

    return null;
  },

  async setTheme(theme: ThemeMode): Promise<void> {
    await AsyncStorage.setItem(THEME_KEY, theme);
  },

  async removeTheme(): Promise<void> {
    await AsyncStorage.removeItem(THEME_KEY);
  },

  // Settings screen theme storage
  async getSettingsTheme(): Promise<ThemeMode> {
    const value = await AsyncStorage.getItem(SETTINGS_THEME_KEY);

    return value === 'dark' ? 'dark' : 'light';
  },

  async setSettingsTheme(theme: ThemeMode): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_THEME_KEY, theme);
  },

  async resetSettingsTheme(): Promise<void> {
    await AsyncStorage.removeItem(SETTINGS_THEME_KEY);
  },

  // Notification preferences storage
  async getSettings(): Promise<SettingsPreferences> {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);

      if (!saved) {
        return { ...DEFAULT_SETTINGS };
      }

      const parsed: unknown = JSON.parse(saved);

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed)
      ) {
        return { ...DEFAULT_SETTINGS };
      }

      const value = parsed as Partial<SettingsPreferences>;

      return {
        orderAlerts:
          typeof value.orderAlerts === 'boolean'
            ? value.orderAlerts
            : DEFAULT_SETTINGS.orderAlerts,

        stockAlerts:
          typeof value.stockAlerts === 'boolean'
            ? value.stockAlerts
            : DEFAULT_SETTINGS.stockAlerts,

        paymentAlerts:
          typeof value.paymentAlerts === 'boolean'
            ? value.paymentAlerts
            : DEFAULT_SETTINGS.paymentAlerts,

        emailUpdates:
          typeof value.emailUpdates === 'boolean'
            ? value.emailUpdates
            : DEFAULT_SETTINGS.emailUpdates,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  async setSettings(
    settings: SettingsPreferences,
  ): Promise<void> {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings),
    );
  },

  async resetSettings(): Promise<void> {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(DEFAULT_SETTINGS),
    );
  },
};