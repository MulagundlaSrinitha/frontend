
import { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

type MenuItem = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

type MenuSection = {
  heading: string;
  items: MenuItem[];
};

const sections: MenuSection[] = [
  {
    heading: 'STORE MANAGEMENT',
    items: [
      {
        title: 'Store Profile',
        subtitle: 'Store details and contact information',
        icon: 'storefront-outline',
        route: '/store-profile',
      },
      {
        title: 'Categories',
        subtitle: 'Organize your product categories',
        icon: 'grid-outline',
        route: '/categories',
      },
      {
        title: 'Stock Management',
        subtitle: 'View and update product stock',
        icon: 'cube-outline',
        route: '/stock-management',
      },
      {
        title: 'Low Stock Alerts',
        subtitle: 'Products that need restocking',
        icon: 'alert-circle-outline',
        route: '/low-stock',
      },
    ],
  },
  {
    heading: 'ORDERS',
    items: [
      {
        title: 'All Orders',
        subtitle: 'View and manage customer orders',
        icon: 'receipt-outline',
        route: '/orders',
      },
      {
        title: 'Returns',
        subtitle: 'Manage returned products and requests',
        icon: 'return-down-back-outline',
        route: '/returns',
      },
    ],
  },
  {
    heading: 'PROMOTIONS',
    items: [
      {
        title: 'Coupons',
        subtitle: 'Create and manage discount coupons',
        icon: 'pricetag-outline',
        route: '/coupons',
      },
      {
        title: 'Offers',
        subtitle: 'Manage store offers and promotions',
        icon: 'gift-outline',
        route: '/offers',
      },
    ],
  },
  {
    heading: 'CUSTOMERS',
    items: [
      {
        title: 'Customers',
        subtitle: 'View your customer list',
        icon: 'people-outline',
        route: '/customers',
      },
    ],
  },
  {
    heading: 'FINANCE & ANALYTICS',
    items: [
      {
        title: 'Analytics Overview',
        subtitle: 'Review store performance',
        icon: 'bar-chart-outline',
        route: '/analytics',
      },
      {
        title: 'Sales',
        subtitle: 'View sales reports',
        icon: 'trending-up-outline',
        route: '/sales',
      },
      {
        title: 'Revenue',
        subtitle: 'Track store revenue',
        icon: 'stats-chart-outline',
        route: '/revenue',
      },
      {
        title: 'Earnings Overview',
        subtitle: 'View your earnings summary',
        icon: 'wallet-outline',
        route: '/earnings',
      },
      {
        title: 'Payouts',
        subtitle: 'View payout details and status',
        icon: 'cash-outline',
        route: '/payouts',
      },
      {
        title: 'Transactions',
        subtitle: 'Review payment transactions',
        icon: 'card-outline',
        route: '/transactions',
      },
    ],
  },
  {
    heading: 'PREFERENCES',
    items: [
      {
        title: 'Notifications',
        subtitle: 'View and manage notifications',
        icon: 'notifications-outline',
        route: '/notifications',
      },
      {
        title: 'Settings',
        subtitle: 'App and account preferences',
        icon: 'settings-outline',
        route: '/settings',
      },
      {
        title: 'Support',
        subtitle: 'Help and contact support',
        icon: 'help-circle-outline',
        route: '/support',
      },
    ],
  },
];

export default function MoreScreen() {
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const clearSession = useAuthStore(
    (state) => state.clearSession,
  );

  const openMenu = (route: string) => {
    router.push(route as never);
  };

  const handleLogout = () => {
    if (isLoggingOut) return;

    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your vendor account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);

            try {
              await authService.logout();
            } catch (error) {
              // Server logout fail aina local logout continue avvali.
              console.error('Server logout failed:', error);
            } finally {
              // Clear local authentication session.
              clearSession();

              // Return to the login screen.
              router.replace('/(auth)/login' as never);

              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>NEXT360 VENDOR</Text>
            <Text style={styles.title}>More</Text>
            <Text style={styles.subtitle}>
              Store tools, finance and account settings
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="apps-outline"
              size={25}
              color="#059669"
            />
          </View>
        </View>

        <Pressable
          style={styles.profileCard}
          onPress={() => openMenu('/store-profile')}
        >
          <View style={styles.avatar}>
            <Ionicons
              name="storefront"
              size={27}
              color="#047857"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.storeName}>Your Store</Text>
            <Text style={styles.storeSubtitle}>
              Store profile not configured
            </Text>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>
                Store overview
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#64748B"
          />
        </Pressable>

        {/* Quick access cards */}
        <View style={styles.quickGrid}>
          <Pressable
            style={styles.quickCard}
            onPress={() => openMenu('/products')}
          >
            <View
              style={[
                styles.quickIcon,
                { backgroundColor: '#D1FAE5' },
              ]}
            >
              <Ionicons
                name="cube-outline"
                size={23}
                color="#047857"
              />
            </View>

            <Text style={styles.quickTitle}>Products</Text>
            <Text style={styles.quickSubtitle}>
              Product management
            </Text>
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => openMenu('/orders')}
          >
            <View
              style={[
                styles.quickIcon,
                { backgroundColor: '#DBEAFE' },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={23}
                color="#1D4ED8"
              />
            </View>

            <Text style={styles.quickTitle}>Orders</Text>
            <Text style={styles.quickSubtitle}>
              Order management
            </Text>
          </Pressable>
        </View>

        {/* All vendor menu sections */}
        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.sectionHeading}>
              {section.heading}
            </Text>

            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <View key={item.title}>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => openMenu(item.route)}
                  >
                    <View style={styles.menuIcon}>
                      <Ionicons
                        name={item.icon}
                        size={21}
                        color="#059669"
                      />
                    </View>

                    <View style={styles.menuText}>
                      <Text style={styles.menuTitle}>
                        {item.title}
                      </Text>
                      <Text style={styles.menuSubtitle}>
                        {item.subtitle}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#94A3B8"
                    />
                  </Pressable>

                  {index < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Local notification preference */}
        <View style={styles.notificationCard}>
          <View style={styles.menuIcon}>
            <Ionicons
              name="notifications-outline"
              size={21}
              color="#059669"
            />
          </View>

          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>
              Push Notifications
            </Text>
            <Text style={styles.menuSubtitle}>
              {notificationsEnabled
                ? 'Preference enabled (local only)'
                : 'Preference disabled (local only)'}
            </Text>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{
              false: '#CBD5E1',
              true: '#A7F3D0',
            }}
            thumbColor={
              notificationsEnabled ? '#059669' : '#F8FAFC'
            }
          />
        </View>

        {/* Account settings */}
        <Pressable
          style={styles.accountButton}
          onPress={() => openMenu('/settings')}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color="#DC2626"
          />
          <Text style={styles.accountButtonText}>
            Account Settings
          </Text>
        </Pressable>

        {/* Logout button */}
        <Pressable
          style={[
            styles.logoutButton,
            isLoggingOut && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#DC2626"
          />
          <Text style={styles.logoutButtonText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </Pressable>

        <Text style={styles.version}>
          Next360 Vendor · Mobile App
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  storeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  activeText: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  quickIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  quickSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#64748B',
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    paddingHorizontal: 13,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 11,
  },
  menuIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 50,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    padding: 13,
    marginBottom: 16,
  },
  accountButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    minHeight: 48,
  },
  accountButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    minHeight: 48,
    marginTop: 10,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 18,
  },
});

/*import { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

type MenuItem = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

type MenuSection = {
  heading: string;
  items: MenuItem[];
};

const sections: MenuSection[] = [
  {
    heading: 'STORE MANAGEMENT',
    items: [
      {
        title: 'Store Profile',
        subtitle: 'Store details and contact information',
        icon: 'storefront-outline',
        route: '/store-profile',
      },
      {
        title: 'Categories',
        subtitle: 'Organize your product categories',
        icon: 'grid-outline',
        route: '/categories',
      },
      {
        title: 'Stock Management',
        subtitle: 'View and update product stock',
        icon: 'cube-outline',
        route: '/stock-management',
      },
      {
        title: 'Low Stock Alerts',
        subtitle: 'Products that need restocking',
        icon: 'alert-circle-outline',
        route: '/low-stock',
      },
    ],
  },
  {
    heading: 'ORDERS',
    items: [
      {
        title: 'All Orders',
        subtitle: 'View and manage customer orders',
        icon: 'receipt-outline',
        route: '/orders',
      },
      {
        title: 'Returns',
        subtitle: 'Manage returned products and requests',
        icon: 'return-down-back-outline',
        route: '/returns',
      },
    ],
  },
  {
    heading: 'PROMOTIONS',
    items: [
      {
        title: 'Coupons',
        subtitle: 'Create and manage discount coupons',
        icon: 'pricetag-outline',
        route: '/coupons',
      },
      {
        title: 'Offers',
        subtitle: 'Manage store offers and promotions',
        icon: 'gift-outline',
        route: '/offers',
      },
    ],
  },
  {
    heading: 'CUSTOMERS',
    items: [
      {
        title: 'Customers',
        subtitle: 'View your customer list',
        icon: 'people-outline',
        route: '/customers',
      },
    ],
  },
  {
    heading: 'FINANCE & ANALYTICS',
    items: [
      {
        title: 'Analytics Overview',
        subtitle: 'Review store performance',
        icon: 'bar-chart-outline',
        route: '/analytics',
      },
      {
        title: 'Sales',
        subtitle: 'View sales reports',
        icon: 'trending-up-outline',
        route: '/sales',
      },
      {
        title: 'Revenue',
        subtitle: 'Track store revenue',
        icon: 'stats-chart-outline',
        route: '/revenue',
      },
      {
        title: 'Earnings Overview',
        subtitle: 'View your earnings summary',
        icon: 'wallet-outline',
        route: '/earnings',
      },
      {
        title: 'Payouts',
        subtitle: 'View payout details and status',
        icon: 'cash-outline',
        route: '/payouts',
      },
      {
        title: 'Transactions',
        subtitle: 'Review payment transactions',
        icon: 'card-outline',
        route: '/transactions',
      },
    ],
  },
  {
    heading: 'PREFERENCES',
    items: [
      {
        title: 'Notifications',
        subtitle: 'View and manage notifications',
        icon: 'notifications-outline',
        route: '/notifications',
      },
      {
        title: 'Settings',
        subtitle: 'App and account preferences',
        icon: 'settings-outline',
        route: '/settings',
      },
      {
        title: 'Support',
        subtitle: 'Help and contact support',
        icon: 'help-circle-outline',
        route: '/support',
      },
    ],
  },
];

export default function MoreScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clearSession = useAuthStore((state) => state.clearSession);

  const openMenu = (route: string) => {
    router.push(route as never);
  };

  /*const handleLogout = () => {
    if (isLoggingOut) return;

    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your vendor account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);

            try {
              await authService.logout();
              router.replace('/(auth)/login' as never);
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert(
                'Logout Error',
                'Unable to log out. Please try again.',
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };
  
const handleLogout = () => {
  if (isLoggingOut) return;

  Alert.alert(
    'Logout',
    'Are you sure you want to log out of your vendor account?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);

          try {
            await authService.logout();

            // Clear the in-memory Zustand session.
            clearSession();

            // Navigate to login after logout.
            router.replace('/(auth)/login' as never);
          } catch (error) {
            console.error('Logout failed:', error);

            Alert.alert(
              'Logout Error',
              'Unable to log out. Please try again.',
            );
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ],
    { cancelable: true },
  );
};


  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>NEXT360 VENDOR</Text>
            <Text style={styles.title}>More</Text>
            <Text style={styles.subtitle}>
              Store tools, finance and account settings
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="apps-outline" size={25} color="#059669" />
          </View>
        </View>

        <Pressable
          style={styles.profileCard}
          onPress={() => openMenu('/store-profile')}
        >
          <View style={styles.avatar}>
            <Ionicons name="storefront" size={27} color="#047857" />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.storeName}>Your Store</Text>
            <Text style={styles.storeSubtitle}>
              Store profile not configured
            </Text>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Store overview</Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#64748B"
          />
        </Pressable>

        
        <View style={styles.quickGrid}>
          <Pressable
            style={styles.quickCard}
            onPress={() => openMenu('/products')}
          >
            <View
              style={[
                styles.quickIcon,
                { backgroundColor: '#D1FAE5' },
              ]}
            >
              <Ionicons name="cube-outline" size={23} color="#047857" />
            </View>

            <Text style={styles.quickTitle}>Products</Text>
            <Text style={styles.quickSubtitle}>
              Product management
            </Text>
          </Pressable>

          <Pressable
            style={styles.quickCard}
            onPress={() => openMenu('/orders')}
          >
            <View
              style={[
                styles.quickIcon,
                { backgroundColor: '#DBEAFE' },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={23}
                color="#1D4ED8"
              />
            </View>

            <Text style={styles.quickTitle}>Orders</Text>
            <Text style={styles.quickSubtitle}>
              Order management
            </Text>
          </Pressable>
        </View>

     
        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.sectionHeading}>
              {section.heading}
            </Text>

            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <View key={item.title}>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => openMenu(item.route)}
                  >
                    <View style={styles.menuIcon}>
                      <Ionicons
                        name={item.icon}
                        size={21}
                        color="#059669"
                      />
                    </View>

                    <View style={styles.menuText}>
                      <Text style={styles.menuTitle}>
                        {item.title}
                      </Text>
                      <Text style={styles.menuSubtitle}>
                        {item.subtitle}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#94A3B8"
                    />
                  </Pressable>

                  {index < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        
        <View style={styles.notificationCard}>
          <View style={styles.menuIcon}>
            <Ionicons
              name="notifications-outline"
              size={21}
              color="#059669"
            />
          </View>

          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>
              Push Notifications
            </Text>
            <Text style={styles.menuSubtitle}>
              {notificationsEnabled
                ? 'Preference enabled (local only)'
                : 'Preference disabled (local only)'}
            </Text>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{
              false: '#CBD5E1',
              true: '#A7F3D0',
            }}
            thumbColor={
              notificationsEnabled ? '#059669' : '#F8FAFC'
            }
          />
        </View>

       
        <Pressable
          style={styles.accountButton}
          onPress={() => openMenu('/settings')}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color="#DC2626"
          />
          <Text style={styles.accountButtonText}>
            Account Settings
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.logoutButton,
            isLoggingOut && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#DC2626"
          />
          <Text style={styles.logoutButtonText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </Pressable>

        <Text style={styles.version}>
          Next360 Vendor · Mobile App
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  storeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  activeText: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  quickIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  quickSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#64748B',
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    paddingHorizontal: 13,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 11,
  },
  menuIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 50,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    padding: 13,
    marginBottom: 16,
  },
  accountButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    minHeight: 48,
  },
  accountButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    minHeight: 48,
    marginTop: 10,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 18,
  },
});*/