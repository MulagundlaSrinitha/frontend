import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  colors,
  type ThemeColors,
  type ThemeMode,
} from './colors';

import { storage } from '../services/storage';

type ThemeContextType = {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  isReady: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme?: ThemeMode;
};

export function ThemeProvider({
  children,
  initialTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadTheme() {
      try {
        const savedTheme = await storage.getTheme();

        if (mounted && savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.warn('Unable to load saved theme:', error);
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);

    storage.setTheme(nextTheme).catch((error) => {
      console.warn('Unable to save theme:', error);
    });
  };

  const toggleTheme = () => {
    setThemeState((currentTheme) => {
      const nextTheme =
        currentTheme === 'light' ? 'dark' : 'light';

      storage.setTheme(nextTheme).catch((error) => {
        console.warn('Unable to save theme:', error);
      });

      return nextTheme;
    });
  };

  const value = useMemo(
    () => ({
      theme,
      colors: colors[theme],
      isDark: theme === 'dark',
      isReady,
      toggleTheme,
      setTheme,
    }),
    [theme, isReady]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useThemeContext must be used inside ThemeProvider'
    );
  }

  return context;
}
