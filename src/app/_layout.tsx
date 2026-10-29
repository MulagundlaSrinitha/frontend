
import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

import { ThemeProvider } from '../theme/ThemeProvider';
import { useTheme } from '../hooks/useTheme';
import { storage } from '../services/storage';
import { authService } from '../services/auth';
import { setUnauthorizedHandler } from '../services/api';
import { useAuthStore } from '../store/authStore';

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const currentGroup = segments[0] as string | undefined;

  const isInitializing = useAuthStore(
    (state) => state.isInitializing,
  );
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setInitializing = useAuthStore(
    (state) => state.setInitializing,
  );

  // Handle expired or invalid authentication tokens.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void (async () => {
        try {
          await storage.removeAuthToken();
        } catch (error) {
          console.error('Could not remove auth token:', error);
        } finally {
          clearSession();
          router.replace('/(auth)/login' as any);
        }
      })();
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearSession]);

  // Restore the session when the app starts.
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const token = await storage.getAuthToken();

        if (!token) {
          if (mounted) {
            clearSession();
          }
          return;
        }

        const user = await authService.getProfile();

        if (!mounted) {
          return;
        }

        if (user.role !== 'VENDOR') {
          try {
            await authService.logout();
          } catch (error) {
            console.error('Could not complete server logout:', error);
            await storage.removeAuthToken();
          } finally {
            clearSession();
          }
          return;
        }

        setSession(user);
      } catch (error) {
        console.error('Could not restore auth session:', error);

        if (mounted) {
          try {
            await storage.removeAuthToken();
          } catch (storageError) {
            console.error(
              'Could not remove invalid auth token:',
              storageError,
            );
          }

          clearSession();
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      mounted = false;
    };
  }, [clearSession, setSession, setInitializing]);

  // Redirect based on the restored Zustand session.
  useEffect(() => {
    if (isInitializing || !currentGroup) {
      return;
    }

    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated && currentGroup !== '(auth)') {
      router.replace('/(auth)/login' as any);
      return;
    }

    if (isAuthenticated && currentGroup === '(auth)') {
      router.replace('/(tabs)');
    }
  }, [isInitializing, currentGroup]);

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/verify-otp" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/*
import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

import { ThemeProvider } from '../theme/ThemeProvider';
import { useTheme } from '../hooks/useTheme';
import { storage } from '../services/storage';
import { authService } from '../services/auth';
import { useAuthStore } from '../store/authStore';

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const currentGroup = segments[0] as string | undefined;

  const isInitializing = useAuthStore(
    (state) => state.isInitializing,
  );
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setInitializing = useAuthStore(
    (state) => state.setInitializing,
  );

  // Restore the session when the app starts.
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const token = await storage.getAuthToken();

        if (!token) {
          if (mounted) {
            clearSession();
          }
          return;
        }

        const user = await authService.getProfile();

        if (mounted) {
          if (user.role !== 'VENDOR') {
            await authService.logout();
            clearSession();
            return;
          }

          setSession(user);
        }
      } catch (error) {
        console.error('Could not restore auth session:', error);

        if (mounted) {
          try {
            await storage.removeAuthToken();
          } catch (storageError) {
            console.error(
              'Could not remove invalid auth token:',
              storageError,
            );
          }

          clearSession();
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      mounted = false;
    };
  }, [clearSession, setSession, setInitializing]);

  // Redirect based on the restored Zustand session.
  useEffect(() => {
    if (isInitializing || !currentGroup) {
      return;
    }

    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated && currentGroup !== '(auth)') {
      router.replace('/(auth)/login' as any);
      return;
    }

    if (isAuthenticated && currentGroup === '(auth)') {
      router.replace('/(tabs)');
    }
  }, [isInitializing, currentGroup]);

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/verify-otp" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}


/*
import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

import { ThemeProvider } from '../theme/ThemeProvider';
import { useTheme } from '../hooks/useTheme';
import { storage } from '../services/storage';

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const currentGroup = segments[0] as string | undefined;

  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Read the saved token once when the app starts.
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const token = await storage.getAuthToken();

        if (mounted) {
          setIsAuthenticated(Boolean(token));
        }
      } catch (error) {
        console.error('Could not read auth token:', error);

        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    void initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Redirect only after the initial token check is complete.
  useEffect(() => {
    if (!isReady || !currentGroup) {
      return;
    }

    const checkAndRedirect = async () => {
      try {
        const token = await storage.getAuthToken();
        const authenticated = Boolean(token);

        if (!authenticated && currentGroup !== '(auth)') {
          router.replace('/(auth)/login' as any);
          return;
        }

        if (authenticated && currentGroup === '(auth)') {
          router.replace('/(tabs)');
          return;
        }
      } catch (error) {
        console.error('Could not read auth token:', error);
        if (currentGroup !== '(auth)') {
          router.replace('/(auth)/login' as any);
        }
      }
    };

    void checkAndRedirect();
  }, [isReady, currentGroup]);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          headerShown: false,
          //contentStyle: {
            //backgroundColor: colors.background,
          //},
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/verify-otp" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/*
import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

import { ThemeProvider } from '../theme/ThemeProvider';
import { useTheme } from '../hooks/useTheme';
import { storage } from '../services/storage';

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const currentGroup = (segments as string[])[0];

  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuthAndRoute() {
      setIsReady(false);

      try {
        const token = await storage.getAuthToken();
        const authenticated = Boolean(token);

        if (!mounted) return;

        setIsAuthenticated(authenticated);

        if (!authenticated && currentGroup !== '(auth)') {
          router.replace('/(auth)/login ' as any);
        } else if (authenticated && currentGroup === '(auth)') {
          router.replace('/(tabs)');
        }
      } catch {
        if (!mounted) return;

        setIsAuthenticated(false);

        if (currentGroup !== '(auth)') {
          router.replace('/(auth)/login' as any);
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    checkAuthAndRoute();

    return () => {
      mounted = false;
    };
  }, [currentGroup]);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/verify-otp" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
*/