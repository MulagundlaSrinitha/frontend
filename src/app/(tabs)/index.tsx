
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import AppCard from '../../components/ui/AppCard';
import AppHeader from '../../components/ui/AppHeader';
import { vendorService } from '../../services/vendor';

type Period = 'Today' | '7 Days' | '30 Days';

type DashboardStats = {
  totalOrders: string;
  earningsToday: string;
  lowStock: string;
  pendingPayout: string;
};

const defaultStats: DashboardStats = {
  totalOrders: '0',
  earningsToday: 'Rs 0',
  lowStock: '0',
  pendingPayout: 'Rs 0',
};

export default function DashboardScreen() {
  const [period, setPeriod] = useState<Period>('7 Days');
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ordersRes, analyticsRes, earningsRes, payoutsRes, lowStockRes] =
        await Promise.allSettled([
          vendorService.getOrders({ limit: 10 }),
          vendorService.getAnalytics(),
          vendorService.getEarnings(),
          vendorService.getPayouts(),
          vendorService.getLowStock(),
        ]);

      const orders =
        ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)
          ? ordersRes.value
          : [];
      const analytics =
        analyticsRes.status === 'fulfilled' ? analyticsRes.value : {};
      const earnings =
        earningsRes.status === 'fulfilled' ? earningsRes.value : {};
      const payouts =
        payoutsRes.status === 'fulfilled' && Array.isArray(payoutsRes.value)
          ? payoutsRes.value
          : [];
      const lowStock =
        lowStockRes.status === 'fulfilled' && Array.isArray(lowStockRes.value)
          ? lowStockRes.value
          : [];

      const totalOrders =
        (analytics as any)?.totalOrders ?? (analytics as any)?.ordersCount ?? orders.length ?? 0;
      const earningsTodayValue =
        (analytics as any)?.revenueToday ?? (analytics as any)?.earningsToday ?? (earnings as any)?.todayEarnings ?? (earnings as any)?.earningsToday;
      const pendingPayoutValue =
        (earnings as any)?.pendingAmount ??
        (earnings as any)?.pendingPayout ??
        payouts
          .filter((p: any) => p.status === 'PENDING' || p.status === 'PROCESSING')
          .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

      setStats({
        totalOrders: String(totalOrders),
        earningsToday: earningsTodayValue != null ? `Rs ${Number(earningsTodayValue).toLocaleString('en-IN')}` : 'Rs 0',
        lowStock: String(lowStock.length),
        pendingPayout: pendingPayoutValue != null ? `Rs ${Number(pendingPayoutValue).toLocaleString('en-IN')}` : 'Rs 0',
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      setStats(defaultStats);
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'cart-outline' as const,
      color: '#2878F0',
    },
    {
      title: 'Earnings Today',
      value: stats.earningsToday,
      icon: 'cash-outline' as const,
      color: '#00A878',
    },
    {
      title: 'Low Stock',
      value: stats.lowStock,
      icon: 'warning-outline' as const,
      color: '#F20D48',
    },
    {
      title: 'Pending Payout',
      value: stats.pendingPayout,
      icon: 'wallet-outline' as const,
      color: '#F28C00',
    },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Next360 Vendor"
          subtitle="Store overview"
          avatarText="D"
        />

        <View style={styles.heading}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Overview of your store performance
          </Text>
        </View>

        {/* Dashboard statistics */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#059669" />
          </View>
        ) : null}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
        <View style={styles.statsGrid}>
          {statCards.map((item) => (
            <AppCard
              key={item.title}
              style={styles.statCard as ViewStyle}
              padding={14}
            >
              <View style={styles.statTop}>
                <Text style={styles.statLabel}>{item.title}</Text>

                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <Text style={styles.statValue}>{item.value}</Text>
            </AppCard>
          ))}
        </View>

        {/* Revenue */}
        <AppCard style={styles.card as ViewStyle}>
          <Text style={styles.sectionTitle}>Revenue</Text>

          <View style={styles.periods}>
            {(['Today', '7 Days', '30 Days'] as Period[]).map(
              (item) => (
                <Pressable
                  key={item}
                  onPress={() => setPeriod(item)}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: period === item,
                  }}
                  style={[
                    styles.periodButton,
                    period === item && styles.activePeriod,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      period === item && styles.activePeriodText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ),
            )}
          </View>

          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartValue}>Rs 0</Text>

            <View style={styles.chartArea}>
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
              <View style={styles.chartLine} />
            </View>

            <Text style={styles.chartCaption}>
              Revenue for {period.toLowerCase()}
            </Text>
          </View>
        </AppCard>

        {/* Orders by status */}
        <AppCard style={styles.card as ViewStyle}>
          <Text style={styles.sectionTitle}>Orders by Status</Text>

          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons
                name="bag-handle-outline"
                size={30}
                color="#64748B"
              />
            </View>

            <Text style={styles.emptyText}>No orders yet</Text>

            <Text style={styles.helperText}>
              Your order status breakdown will appear here.
            </Text>
          </View>
        </AppCard>

        {/* Recent orders */}
        <AppCard style={styles.card as ViewStyle}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>

            <Pressable
              onPress={() => router.push('/(tabs)/orders')}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.recentEmpty}>
              <Ionicons
                name="receipt-outline"
                size={28}
                color="#64748B"
              />

              <Text style={styles.emptyText}>
                Your recent orders will appear here.
              </Text>
            </View>
          ) : (
            recentOrders.map((order: any) => (
              <View key={order.id} style={styles.recentItem}>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentId}>#{order.id?.slice(-6)}</Text>
                  <Text style={styles.recentMeta}>
                    {order.status || 'Unknown'}
                  </Text>
                </View>
                <Text style={styles.recentAmount}>
                  Rs {Number(order.totalAmount || order.amount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            ))
          )}
        </AppCard>

        {/* Quick actions */}
        <AppCard style={styles.card as ViewStyle}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Pressable
            style={({ pressed }: { pressed: boolean }) => [
              styles.actionButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => router.push('/(tabs)/products')}
            accessibilityRole="button"
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color="#059669"
                />
              </View>

              <Text style={styles.actionText}>Add Product</Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color="#64748B"
            />
          </Pressable>

          <Pressable
            style={({ pressed }: { pressed: boolean }) => [
              styles.actionButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => router.push('/(tabs)/orders')}
            accessibilityRole="button"
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color="#059669"
                />
              </View>

              <Text style={styles.actionText}>View Orders</Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color="#64748B"
            />
          </Pressable>
        </AppCard>
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
    paddingBottom: 32,
  },

  heading: {
    marginBottom: 18,
    marginTop: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  statCard: {
    width: '48%',
    flexGrow: 1,
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 12,
  },

  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statLabel: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    marginRight: 6,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  periods: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },

  activePeriod: {
    backgroundColor: '#D1FAE5',
  },

  periodText: {
    color: '#475569',
    fontSize: 12,
  },

  activePeriodText: {
    color: '#047857',
    fontWeight: '700',
  },

  chartPlaceholder: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFCFE',
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  chartValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
  },

  chartArea: {
    width: '100%',
    height: 48,
    justifyContent: 'space-between',
    marginTop: 12,
  },

  chartGridLine: {
    height: 1,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },

  chartLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10B981',
  },

  chartCaption: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 12,
  },

  emptyState: {
    minHeight: 125,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  emptyIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },

  recentEmpty: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 10,
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  actionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },

  pressedButton: {
    opacity: 0.65,
  },
  
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 8,
  },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 12,
  },

  recentInfo: {
    flexDirection: 'column',
  },

  recentId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  recentMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  recentAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  actionButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 10,
  },
});


/*import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import AppCard from '../../components/ui/AppCard';
import AppHeader from '../../components/ui/AppHeader';
import { useTheme } from '../../hooks/useTheme';

type Period = 'Today' | '7 Days' | '30 Days';

const stats = [
{
title: 'Total Orders',
value: '0',
icon: 'cart-outline' as const,
color: '#2878F0',
},
{
title: 'Earnings Today',
value: 'Rs 0',
icon: 'cash-outline' as const,
color: '#00A878',
},
{
title: 'Low Stock',
value: '0',
icon: 'warning-outline' as const,
color: '#F20D48',
},
{
title: 'Pending Payout',
value: 'Rs 0',
icon: 'wallet-outline' as const,
color: '#F28C00',
},
];

export default function DashboardScreen() {
const [period, setPeriod] = useState<Period>('7 Days');
const { colors } = useTheme();
const styles = createStyles(colors);

return (
<SafeAreaView style={styles.screen} edges={['top']}>
<ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
<AppHeader
          title="Next360 Vendor"
          subtitle="Store overview"
          avatarText="D"
        />

<View style={styles.heading}>
<Text style={styles.title}>Dashboard</Text>
<Text style={styles.subtitle}>
Overview of your store performance
</Text>
</View>


<View style={styles.statsGrid}>
{stats.map((item) => (
<AppCard key={item.title} style={styles.statCard}>
<View style={styles.statTop}>
<Text style={styles.statLabel}>{item.title}</Text>

<View
style={[
styles.iconBox,
{ backgroundColor: item.color },
]}
>
<Ionicons
                    name={item.icon}
                    size={20}
                    color="#FFFFFF"
                  />
</View>
</View>

<Text style={styles.statValue}>{item.value}</Text>
</AppCard>
))}
</View>


<AppCard style={styles.card}>
<Text style={styles.sectionTitle}>Revenue</Text>

<View style={styles.periods}>
{(['Today', '7 Days', '30 Days'] as Period[]).map(
(item) => (
<Pressable
key={item}
onPress={() => setPeriod(item)}
accessibilityRole="button"
accessibilityState={{
selected: period === item,
}}
style={[
styles.periodButton,
period === item && styles.activePeriod,
]}
>
<Text
style={[
styles.periodText,
period === item && styles.activePeriodText,
]}
>
{item}
</Text>
</Pressable>
),
)}
</View>

<View style={styles.chartPlaceholder}>
<Text style={styles.chartValue}>Rs 0</Text>

<View style={styles.chartArea}>
<View style={styles.chartGridLine} />
<View style={styles.chartGridLine} />
<View style={styles.chartGridLine} />
<View style={styles.chartLine} />
</View>

<Text style={styles.chartCaption}>
Revenue for {period.toLowerCase()}
</Text>
</View>
</AppCard>

<AppCard style={styles.card}>
<Text style={styles.sectionTitle}>Orders by Status</Text>

<View style={styles.emptyState}>
<View style={styles.emptyIconBox}>
<Ionicons
                name="bag-handle-outline"
                size={30}
                color={colors.textSecondary}
              />
</View>

<Text style={styles.emptyText}>No orders yet</Text>
<Text style={styles.helperText}>
Your order status breakdown will appear here.
</Text>
</View>
</AppCard>


<AppCard style={styles.card}>
<View style={styles.sectionHeader}>
<Text style={styles.sectionTitle}>Recent Orders</Text>

<Pressable
onPress={() => router.push('/(tabs)/orders')}
hitSlop={8}
accessibilityRole="button"
>
<Text style={styles.viewAll}>View all</Text>
</Pressable>
</View>

<View style={styles.recentEmpty}>
<Ionicons
              name="receipt-outline"
              size={28}
              color={colors.textSecondary}
            />

<Text style={styles.emptyText}>
Your recent orders will appear here.
</Text>
</View>
</AppCard>


<AppCard style={styles.card}>
<Text style={styles.sectionTitle}>Quick Actions</Text>

<Pressable
style={({ pressed }: { pressed: boolean }) => [
styles.actionButton,
pressed && styles.pressedButton,
]}
onPress={() => router.push('/(tabs)/products')}
accessibilityRole="button"
>
<View style={styles.actionLeft}>
<View style={styles.actionIconBox}>
<Ionicons
                  name="add-circle-outline"
                  size={22}
                  color={colors.primary}
                />
</View>

<Text style={styles.actionText}>Add Product</Text>
</View>

<Feather
              name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
</Pressable>

<Pressable
style={({ pressed }: { pressed: boolean }) => [
  styles.actionButton,
  pressed && styles.pressedButton,
]}
onPress={() => router.push('/(tabs)/orders')}
accessibilityRole="button"
>
<View style={styles.actionLeft}>
<View style={styles.actionIconBox}>
<Ionicons
                  name="receipt-outline"
                  size={20}
                  color={colors.primary}
                />
</View>

<Text style={styles.actionText}>View Orders</Text>
</View>

<Feather
              name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
</Pressable>
</AppCard>
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
    paddingBottom: 32,
  },

  heading: {
    marginBottom: 18,
    marginTop: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },

  statCard: {
    width: '48%',
    flexGrow: 1,
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statLabel: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    marginRight: 6,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  periods: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },

  activePeriod: {
    backgroundColor: '#D1FAE5',
  },

  periodText: {
    color: '#475569',
    fontSize: 12,
  },

  activePeriodText: {
    color: '#047857',
    fontWeight: '700',
  },

  chartPlaceholder: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFCFE',
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  chartValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
  },

  chartArea: {
    width: '100%',
    height: 48,
    justifyContent: 'space-between',
    marginTop: 12,
  },

  chartGridLine: {
    height: 1,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },

  chartLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10B981',
  },

  chartCaption: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 12,
  },

  emptyState: {
    minHeight: 125,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  emptyIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },

  recentEmpty: {\r\n    minHeight: 80,\r\n    alignItems: 'center',\r\n    justifyContent: 'center',\r\n  },\r\n  recentItem: {\r\n    flexDirection: 'row',\r\n    alignItems: 'center',\r\n    justifyContent: 'space-between',\r\n    borderTopWidth: 1,\r\n    borderTopColor: '#F1F5F9',\r\n    paddingVertical: 12,\r\n  },\r\n  recentInfo: {\r\n    flexDirection: 'column',\r\n  },\r\n  recentId: {\r\n    fontSize: 13,\r\n    fontWeight: '700',\r\n    color: '#111827',\r\n  },\r\n  recentMeta: {\r\n    fontSize: 11,\r\n    color: '#64748B',\r\n    marginTop: 2,\r\n  },\r\n  recentAmount: {\r\n    fontSize: 13,\r\n    fontWeight: '700',\r\n    color: '#111827',\r\n  },\r\n  loadingWrap: {\r\n    alignItems: 'center',\r\n    justifyContent: 'center',\r\n    paddingVertical: 8,\r\n  },\r\n  errorText: {\r\n    fontSize: 12,\r\n    color: '#DC2626',\r\n    marginBottom: 8,\r\n  },\r\n\r\n  actionButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 10,
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  actionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },

  pressedButton: {
    opacity: 0.65,
  },
});



/*import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import AppCard from '../../components/ui/AppCard';
import AppHeader from '../../components/ui/AppHeader';
import { useTheme } from '../../hooks/useTheme';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Next360 Vendor"
          subtitle="Store overview"
          avatarText="D"
        />

        <View style={styles.heading}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Overview of your store performance
          </Text>
        </View>

       
        <AppCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Store Performance</Text>
            <Ionicons
              name="stats-chart-outline"
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons
                name="analytics-outline"
                size={28}
                color={colors.textSecondary}
              />
            </View>
            <Text style={styles.emptyText}>
              Performance data unavailable
            </Text>
            <Text style={styles.helperText}>
              Your orders, revenue and inventory statistics will appear here
              when connected to your store data.
            </Text>
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Orders by Status</Text>

          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons
                name="bag-handle-outline"
                size={30}
                color={colors.textSecondary}
              />
            </View>

            <Text style={styles.emptyText}>No order data available</Text>
            <Text style={styles.helperText}>
              Order status information will appear here when available.
            </Text>
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>

            <Pressable
              onPress={() => router.push('/(tabs)/orders')}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.recentEmpty}>
            <Ionicons
              name="receipt-outline"
              size={28}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              Recent orders will appear here.
            </Text>
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => router.push('/(tabs)/products')}
            accessibilityRole="button"
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.actionText}>Add Product</Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => router.push('/(tabs)/orders')}
            accessibilityRole="button"
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.actionText}>View Orders</Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    heading: {
      marginBottom: 18,
      marginTop: 8,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 5,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    emptyState: {
      minHeight: 125,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    emptyIconBox: {
      width: 54,
      height: 54,
      borderRadius: 16,
      backgroundColor: colors.inputBackground ?? colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    helperText: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.textMuted ?? colors.textSecondary,
      textAlign: 'center',
      marginTop: 5,
    },
    viewAll: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 16,
    },
  recentEmpty: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 12,
  },
  recentInfo: {
    flexDirection: 'column',
  },
  recentId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  recentMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 8,
  },

  actionButton: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.divider ?? colors.border,
      paddingVertical: 10,
    },
    actionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    actionIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primaryLight ?? colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    pressedButton: {
      opacity: 0.65,
    },
  });
}



/*import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import AppCard from '../../components/ui/AppCard';
import AppHeader from '../../components/ui/AppHeader';
import StatCard from '../../components/ui/StatCard';

type Period = 'Today' | '7 Days' | '30 Days';

const stats = [
  {
    title: 'New Orders',
    value: '0',
    icon: 'cart-outline' as const,
    color: '#2878F0',
  },
  {
    title: 'Revenue Today',
    value: 'Rs 0',
    icon: 'cash-outline' as const,
    color: '#00A878',
  },
  {
    title: 'Low Stock',
    value: '0',
    icon: 'warning-outline' as const,
    color: '#F20D48',
  },
  {
    title: 'Pending Payout',
    value: 'Rs 0',
    icon: 'wallet-outline' as const,
    color: '#F28C00',
  },
];

export default function DashboardScreen() {
  const [period, setPeriod] = useState<Period>('7 Days');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        <AppHeader
            title="Next360 Vendor"
            subtitle="Store overview"
            avatarText="D"
        />

        
        <View style={styles.heading}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Overview of your store performance
          </Text>
        </View>

        
        <View style={styles.statsGrid}>
            {stats.map((item) => (
            <StatCard
                key={item.title}
                title={item.title}
                value={item.value}
                icon={
                    <View
                        style={[
                           styles.iconBox,
                            { backgroundColor: item.color },
                        ]}
                    >
                    <Ionicons
                        name={item.icon}
                        size={20}
                        color="#FFFFFF"
                    />
                    </View>
                }
            style={styles.statCard}
           />
          ))}
        </View>


        
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Revenue</Text>

          <View style={styles.periods}>
            {(['Today', '7 Days', '30 Days'] as Period[]).map(
              (item) => (
                <Pressable
                  key={item}
                  onPress={() => setPeriod(item)}
                  style={[
                    styles.periodButton,
                    period === item && styles.activePeriod,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      period === item && styles.activePeriodText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ),
            )}
          </View>

          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartValue}>Rs 0</Text>

            <View style={styles.chartArea}>
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
              <View style={styles.chartGridLine} />
              <View style={styles.chartLine} />
            </View>

            <Text style={styles.chartCaption}>
              Revenue for {period.toLowerCase()}
            </Text>
          </View>
        </AppCard>

       
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Orders by Status</Text>

          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons
                name="bag-handle-outline"
                size={30}
                color="#94A3B8"
              />
            </View>

            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.helperText}>
              Your order status breakdown will appear here.
            </Text>
          </View>
        </AppCard>

        
        <AppCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>

            <Pressable
              onPress={() => router.push('/(tabs)/orders')}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.recentEmpty}>
            <Ionicons
              name="receipt-outline"
              size={28}
              color="#94A3B8"
            />

            <Text style={styles.emptyText}>
              Your recent orders will appear here.
            </Text>
          </View>
        </AppCard>

        
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => router.push('/(tabs)/products')}
            accessibilityRole="button"
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color="#059669"
                />
              </View>

              <Text style={styles.actionText}>Add Product</Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color="#64748B"
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressedButton,
            ]}
            onPress={() => router.push('/(tabs)/orders')}
            accessibilityRole="button"
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color="#2878F0"
                />
              </View>

              <Text style={styles.actionText}>View Orders</Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color="#64748B"
            />
          </Pressable>
        </AppCard>
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
    paddingBottom: 32,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  brand: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#C9F4E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#047857',
    fontSize: 18,
    fontWeight: '700',
  },

  heading: {
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },

  statCard: {
    width: '48%',
    flexGrow: 1,
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },

  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },

  statLabel: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  periods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },

  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
  },

  activePeriod: {
    backgroundColor: '#D1FAE5',
  },

  periodText: {
    color: '#475569',
    fontSize: 12,
  },

  activePeriodText: {
    color: '#047857',
    fontWeight: '700',
  },

  chartPlaceholder: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFCFE',
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  chartValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
  },

  chartArea: {
    width: '100%',
    height: 48,
    justifyContent: 'space-between',
    marginTop: 12,
  },

  chartGridLine: {
    height: 1,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },

  chartLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10B981',
  },

  chartCaption: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 12,
  },

  emptyState: {
    minHeight: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 16,
  },

  recentEmpty: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  actionButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 10,
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },

  pressedButton: {
    opacity: 0.65,
  },
});
*/