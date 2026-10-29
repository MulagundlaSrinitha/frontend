
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Period = 'Today' | '7 Days' | '30 Days';

type RevenueRecord = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  period: Period;
  icon: keyof typeof Ionicons.glyphMap;
};



const periodRevenue: Record<Period, number> = {
  Today: 0,
  '7 Days': 0,
  '30 Days': 0,
};

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

export default function RevenueScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('7 Days');

  const visibleRecords: RevenueRecord[] = [];

  const totalRevenue = periodRevenue[period];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color="#172033" />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.title}>Revenue</Text>
              <Text style={styles.subtitle}>
                Track your store earnings
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="wallet-outline"
                size={23}
                color="#059669"
              />
            </View>
          </View>

          <View style={styles.periodContainer}>
            {(['Today', '7 Days', '30 Days'] as Period[]).map((item) => {
              const selected = period === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setPeriod(item)}
                  style={[
                    styles.periodButton,
                    selected && styles.periodButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selected && styles.periodTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Total Revenue</Text>
                <Text style={styles.heroAmount}>
                  {formatCurrency(totalRevenue)}
                </Text>
              </View>

              <View style={styles.heroIcon}>
                <Ionicons
                  name="trending-up"
                  size={25}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroFooter}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#D1FAE5"
              />
              <Text style={styles.heroFooterText}>
                Actual revenue data is not available yet.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Revenue Overview</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: '#D1FAE5' },
                ]}
              >
                <Ionicons
                  name="cash-outline"
                  size={21}
                  color="#059669"
                />
              </View>
              <Text style={styles.statLabel}>Gross Revenue</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(totalRevenue)}
              </Text>
              <Text style={styles.statHint}>Before deductions</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: '#DBEAFE' },
                ]}
              >
                <Ionicons
                  name="cart-outline"
                  size={21}
                  color="#2563EB"
                />
              </View>
              <Text style={styles.statLabel}>Orders</Text>
              <Text style={styles.statAmount}>
                0
              </Text>
              <Text style={styles.statHint}>Orders recorded</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: '#FEF3C7' },
                ]}
              >
                <Ionicons
                  name="receipt-outline"
                  size={21}
                  color="#D97706"
                />
              </View>
              <Text style={styles.statLabel}>Avg. Order Value</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(
                  Math.round(
                    totalRevenue /
                      (period === 'Today'
                        ? 2
                        : period === '7 Days'
                          ? 12
                          : 38),
                  ),
                )}
              </Text>
              <Text style={styles.statHint}>Revenue per order</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: '#F3E8FF' },
                ]}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={21}
                  color="#9333EA"
                />
              </View>
              <Text style={styles.statLabel}>Net Revenue</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(0)}
              </Text>
              <Text style={styles.statHint}>Illustrative estimate</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
            <Text style={styles.mutedText}>{period}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[
                    styles.smallDot,
                    { backgroundColor: '#059669' },
                  ]}
                />
                <Text style={styles.breakdownLabel}>Product Sales</Text>
              </View>
              <Text style={styles.breakdownAmount}>
                {formatCurrency(0)}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: '85%' },
                ]}
              />
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[
                    styles.smallDot,
                    { backgroundColor: '#F59E0B' },
                  ]}
                />
                <Text style={styles.breakdownLabel}>
                  Other adjustments
                </Text>
              </View>
              <Text style={styles.breakdownAmount}>
                {formatCurrency(0)}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: '15%',
                    backgroundColor: '#F59E0B',
                  },
                ]}
              />
            </View>

            <Text style={styles.note}>
              Illustrative breakdown only; actual settlement values may differ.
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Revenue</Text>
            <Text style={styles.mutedText}>
              {visibleRecords.length} records
            </Text>
          </View>

          {visibleRecords.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="receipt-outline"
                size={32}
                color="#94A3B8"
              />
              <Text style={styles.emptyTitle}>No revenue records</Text>
              <Text style={styles.emptySubtitle}>
  Revenue records will appear here when data is available.
</Text>
            </View>
          ) : (
            visibleRecords.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordIcon}>
                  <Ionicons
                    name={record.icon}
                    size={21}
                    color="#059669"
                  />
                </View>

                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordSubtitle}>
                    {record.subtitle}
                  </Text>
                </View>

                <Text style={styles.recordAmount}>
                  +{formatCurrency(record.amount)}
                </Text>
              </View>
            ))
          )}

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color="#64748B"
            />
            <Text style={styles.footerText}>
              Revenue data will be connected to your store API later.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  content: {
    padding: 20,
    paddingTop: 52,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172033',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 3,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodContainer: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 14,
    backgroundColor: '#E9EEF5',
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  periodText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#059669',
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: '#047857',
    borderRadius: 22,
    padding: 22,
    marginBottom: 26,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    color: '#D1FAE5',
    fontSize: 14,
    fontWeight: '500',
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginVertical: 18,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  heroFooterText: {
    color: '#D1FAE5',
    fontSize: 12,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 26,
    gap: 12,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172033',
    marginTop: 7,
  },
  statHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  mutedText: {
    fontSize: 12,
    color: '#718096',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF1F6',
    marginBottom: 26,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  smallDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#475569',
  },
  breakdownAmount: {
    fontSize: 13,
    color: '#172033',
    fontWeight: '700',
  },
  progressTrack: {
    height: 7,
    borderRadius: 5,
    backgroundColor: '#E9EEF5',
    overflow: 'hidden',
    marginBottom: 19,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#059669',
  },
  note: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 17,
    marginTop: 2,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },
  recordIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  recordTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172033',
  },
  recordSubtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 5,
  },
  recordAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172033',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 16,
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    flexShrink: 1,
  },
});
