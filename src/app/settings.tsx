
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { colors as themeColors, type ThemeMode, type ThemeColors } from '../theme/colors';
import {
  storage,
  DEFAULT_SETTINGS,
  type SettingsPreferences,
} from '../services/storage';

type ThemeOption = 'Light' | 'Dark';

export default function SettingsScreen() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [preferences, setPreferences] =
    useState<SettingsPreferences>({ ...DEFAULT_SETTINGS });
  const [isLoaded, setIsLoaded] = useState(false);

  const colors = themeColors[theme];
  const isDark = theme === 'dark';
  const selectedTheme: ThemeOption = isDark ? 'Dark' : 'Light';
  const styles = createStyles(colors, isDark);

  useEffect(() => {
    let mounted = true;

    async function loadPreferences() {
      try {
        const [savedTheme, savedSettings] = await Promise.all([
          storage.getSettingsTheme(),
          storage.getSettings(),
        ]);

        if (mounted) {
          setTheme(savedTheme);
          setPreferences(savedSettings);
        }
      } catch {
        if (mounted) {
          setTheme('light');
          setPreferences({ ...DEFAULT_SETTINGS });
        }
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    }

    void loadPreferences();

    return () => {
      mounted = false;
    };
  }, []);

  const changeTheme = async (nextTheme: ThemeMode) => {
    const previousTheme = theme;

    setTheme(nextTheme);

    try {
      await storage.setSettingsTheme(nextTheme);
    } catch {
      setTheme(previousTheme);
      Alert.alert('Error', 'Could not save your theme preference.');
    }
  };

  const changePreference = async (
    key: keyof SettingsPreferences,
    value: boolean,
  ) => {
    const previousPreferences = preferences;
    const updatedPreferences = {
      ...preferences,
      [key]: value,
    };

    setPreferences(updatedPreferences);

    try {
      await storage.setSettings(updatedPreferences);
    } catch {
      setPreferences(previousPreferences);
      Alert.alert(
        'Error',
        'Could not save your notification preference.',
      );
    }
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset settings',
      'Do you want to restore the default settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await Promise.all([
                  storage.resetSettingsTheme(),
                  storage.resetSettings(),
                ]);

                setTheme('light');
                setPreferences({ ...DEFAULT_SETTINGS });

                Alert.alert('Settings reset', 'Your preferences were reset.');
              } catch {
                Alert.alert(
                  'Error',
                  'Could not reset your preferences. Please try again.',
                );
              }
            })();
          },
        },
      ],
    );
  };

  const showAccountInfo = (title: string) => {
    Alert.alert(
      title,
      `${title} management will be connected to your account and backend in a later step.`,
    );
  };

  const SettingSwitch = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon} size={21} color={colors.primary} />
      </View>

      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={!isLoaded}
        trackColor={{
          false: isDark ? '#475569' : '#CBD5E1',
          true: isDark ? '#065F46' : '#A7F3D0',
        }}
        thumbColor={value ? colors.primary : '#F8FAFC'}
      />
    </View>
  );

  const AccountRow = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <Pressable style={styles.accountRow} onPress={onPress}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon} size={21} color={colors.primary} />
      </View>

      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textSecondary}
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={colors.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Manage your app preferences
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.primary}
            />
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="options-outline"
              size={25}
              color={colors.primary}
            />
          </View>

          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>App Preferences</Text>
            <Text style={styles.infoSubtitle}>
              Customize your vendor dashboard experience.
            </Text>
          </View>
        </View>

        {/* Appearance */}
        <Text style={styles.sectionTitle}>APPEARANCE</Text>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.itemIcon}>
              <Ionicons
                name="color-palette-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Theme</Text>
              <Text style={styles.itemSubtitle}>
                Choose your preferred appearance
              </Text>
            </View>
          </View>

          <View style={styles.themeOptions}>
            {(['Light', 'Dark'] as ThemeOption[]).map((option) => {
              const selected = selectedTheme === option;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={!isLoaded}
                  onPress={() =>
                    void changeTheme(
                      option === 'Dark' ? 'dark' : 'light',
                    )
                  }
                  style={[
                    styles.themeButton,
                    selected && styles.themeButtonSelected,
                  ]}
                >
                  <Ionicons
                    name={
                      option === 'Light'
                        ? 'sunny-outline'
                        : 'moon-outline'
                    }
                    size={19}
                    color={
                      selected
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />

                  <Text
                    style={[
                      styles.themeText,
                      selected && styles.themeTextSelected,
                    ]}
                  >
                    {option}
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={17}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.helperText}>
            Your selected theme applies to this Settings screen only
            and is saved for your next visit.
          </Text>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

        <View style={styles.card}>
          <SettingSwitch
            icon="bag-check-outline"
            title="Order updates"
            subtitle="New orders and order status changes"
            value={preferences.orderAlerts}
            onValueChange={(value) =>
              void changePreference('orderAlerts', value)
            }
          />

          <View style={styles.divider} />

          <SettingSwitch
            icon="alert-circle-outline"
            title="Low stock alerts"
            subtitle="When products need restocking"
            value={preferences.stockAlerts}
            onValueChange={(value) =>
              void changePreference('stockAlerts', value)
            }
          />

          <View style={styles.divider} />

          <SettingSwitch
            icon="wallet-outline"
            title="Payment updates"
            subtitle="Earnings and payout notifications"
            value={preferences.paymentAlerts}
            onValueChange={(value) =>
              void changePreference('paymentAlerts', value)
            }
          />

          <View style={styles.divider} />

          <SettingSwitch
            icon="mail-outline"
            title="Email updates"
            subtitle="Receive store updates by email"
            value={preferences.emailUpdates}
            onValueChange={(value) =>
              void changePreference('emailUpdates', value)
            }
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>

        <View style={styles.card}>
          <AccountRow
            icon="person-circle-outline"
            title="Account information"
            subtitle="View your vendor account details"
            onPress={() => showAccountInfo('Account information')}
          />

          <View style={styles.divider} />

          {/*<AccountRow
            icon="lock-closed-outline"
            title="Privacy & security"
            subtitle="Account security preferences"
            onPress={() => showAccountInfo('Privacy & security')}
          />

          <View style={styles.divider} />*/}

          <AccountRow
            icon="help-circle-outline"
            title="Help & support"
            subtitle="Get help with your vendor account"
            onPress={() => router.push('/support' as never)}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>ABOUT</Text>

        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <View style={styles.itemIcon}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Next360 Vendor</Text>
              <Text style={styles.itemSubtitle}>
                Mobile application
              </Text>
            </View>

            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Reset */}
        <Pressable
          style={styles.resetButton}
          onPress={resetSettings}
          disabled={!isLoaded}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color="#DC2626"
          />
          <Text style={styles.resetText}>Reset Preferences</Text>
        </Pressable>

        <Text style={styles.footer}>
          Preferences are saved on this device. Notification toggles
          store your choices; actual notifications require backend
          integration.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 18,
      paddingBottom: 36,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 22,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 25,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 5,
    },
    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 15,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    infoIcon: {
      width: 46,
      height: 46,
      borderRadius: 13,
      backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoText: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    infoSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 5,
      lineHeight: 16,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 13,
      paddingVertical: 4,
      marginBottom: 22,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingVertical: 13,
    },
    itemIcon: {
      width: 39,
      height: 39,
      borderRadius: 11,
      backgroundColor: isDark ? '#273449' : '#ECFDF5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemText: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    itemSubtitle: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 15,
    },
    themeOptions: {
      gap: 8,
      marginTop: 8,
    },
    themeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 44,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
    },
    themeButtonSelected: {
      backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
      borderColor: isDark ? '#065F46' : '#A7F3D0',
    },
    themeText: {
      flex: 1,
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    themeTextSelected: {
      color: isDark ? '#6EE7B7' : '#047857',
      fontWeight: '800',
    },
    helperText: {
      fontSize: 10,
      color: colors.textSecondary,
      lineHeight: 15,
      marginTop: 12,
      marginBottom: 12,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 13,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingVertical: 13,
    },
    aboutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 13,
    },
    version: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 48,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? '#7F1D1D' : '#FECACA',
      borderRadius: 12,
    },
    resetText: {
      color: '#DC2626',
      fontSize: 13,
      fontWeight: '700',
    },
    footer: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 16,
    },
  });
}
