
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}


/*import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';

type Period = 'Today' | '7 Days' | '30 Days';

const stats = [
  { title: 'New Orders', value: '0', icon: '🛒', color: '#2878F0' },
  { title: 'Revenue Today', value: '₹0', icon: '₹', color: '#00A878' },
  { title: 'Low Stock', value: '0', icon: '⚠', color: '#F20D48' },
  { title: 'Pending Payout', value: '₹0', icon: '↗', color: '#F28C00' },
];

export default function DashboardScreen() {
  const [period, setPeriod] = useState<Period>('7 Days');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Next360 Vendor</Text>
          <Text style={styles.subtitle}>Store overview</Text>
        </View>
        <Text style={styles.avatar}>D</Text>
      </View>

      <View style={styles.heading}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Overview of your store performance</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.title} style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>{item.title}</Text>
              <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Revenue</Text>
        <View style={styles.periods}>
          {(['Today', '7 Days', '30 Days'] as Period[]).map((item) => (
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
          ))}
        </View>

        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartValue}>₹0</Text>
          <View style={styles.chartLine} />
          <Text style={styles.chartCaption}>
            Revenue for {period.toLowerCase()}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Orders by Status</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <Text style={styles.emptyText}>Your recent orders will appear here.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Pressable
          style={styles.actionButton}
          onPress={() => alert('Add Product screen will be implemented next.')}
        >
          <Text style={styles.actionText}>＋  Add Product</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => alert('Orders screen will be implemented next.')}
        >
          <Text style={styles.actionText}>View Orders</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
      </View>
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
    color: '#047857',
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    fontSize: 18,
    fontWeight: '700',
    paddingTop: 9,
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
  icon: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
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
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFCFE',
    borderRadius: 10,
  },
  chartValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
  },
  chartLine: {
    height: 2,
    width: '90%',
    backgroundColor: '#10B981',
    marginTop: 24,
  },
  chartCaption: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 12,
  },
  emptyState: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  actionButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 10,
  },
  actionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },
  actionArrow: {
    color: '#059669',
    fontSize: 24,
  },
});
*/