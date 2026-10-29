
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Period = '7 Days' | '30 Days' | 'All';
type Filter = 'All' | 'Completed' | 'Pending';

type Earning = {
  id: string;
  orderId: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending';
};

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

export default function EarningsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('30 Days');
  const [filter, setFilter] = useState<Filter>('All');

  // Empty until real earnings data is available.
  const earnings: Earning[] = [];

  const completedTotal = 0;
  const pendingTotal = 0;
  const totalEarnings = completedTotal + pendingTotal;

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
              <Text style={styles.title}>Earnings Overview</Text>
              <Text style={styles.subtitle}>
                Track your store earnings
              </Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Total Earnings</Text>
                <Text style={styles.heroAmount}>
                  {formatCurrency(totalEarnings)}
                </Text>
              </View>

              <View style={styles.heroIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={26}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroFooter}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color="#D1FAE5"
              />
              <Text style={styles.heroFooterText}>
                Earnings will appear here when data is available
              </Text>
            </View>
          </View>

          <View style={styles.balanceGrid}>
            <View style={styles.balanceCard}>
              <View style={styles.balanceIconGreen}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#059669"
                />
              </View>

              <Text style={styles.cardLabel}>Completed</Text>
              <Text style={styles.cardAmount}>
                {formatCurrency(completedTotal)}
              </Text>
            </View>

            <View style={styles.balanceCard}>
              <View style={styles.balanceIconOrange}>
                <Ionicons
                  name="time-outline"
                  size={21}
                  color="#D97706"
                />
              </View>

              <Text style={styles.cardLabel}>Pending</Text>
              <Text style={styles.cardAmount}>
                {formatCurrency(pendingTotal)}
              </Text>
            </View>
          </View>

          <View style={styles.availableCard}>
            <View style={styles.availableIcon}>
              <Ionicons
                name="cash-outline"
                size={23}
                color="#2563EB"
              />
            </View>

            <View style={styles.availableInfo}>
              <Text style={styles.availableLabel}>
                Available Balance
              </Text>
              <Text style={styles.availableAmount}>
                {formatCurrency(completedTotal)}
              </Text>
              <Text style={styles.availableHint}>
                Actual withdrawable balance requires API data
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Earnings History</Text>

          <View style={styles.periodRow}>
            {(['7 Days', '30 Days', 'All'] as Period[]).map((item) => {
              const selected = period === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setPeriod(item)}
                  style={[
                    styles.periodButton,
                    selected && styles.periodActive,
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {(['All', 'Completed', 'Pending'] as Filter[]).map((item) => {
              const selected = filter === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterButton,
                    selected && styles.filterActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.historySummary}>
            <Text style={styles.historySummaryText}>
              {earnings.length} records
            </Text>
            <Text style={styles.historySummaryText}>
              {formatCurrency(
                earnings.reduce((sum, item) => sum + item.amount, 0),
              )}
            </Text>
          </View>

          {earnings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="receipt-outline"
                size={32}
                color="#94A3B8"
              />
              <Text style={styles.emptyTitle}>No earnings yet</Text>
              <Text style={styles.emptyText}>
                Your earnings history will appear here when data is available.
              </Text>
            </View>
          ) : (
            earnings.map((item) => (
              <View key={item.id} style={styles.earningCard}>
                <View style={styles.recordIcon}>
                  <Ionicons
                    name="receipt-outline"
                    size={21}
                    color="#059669"
                  />
                </View>

                <View style={styles.recordInfo}>
                  <Text style={styles.orderTitle}>{item.orderId}</Text>
                  <Text style={styles.orderDate}>{item.date}</Text>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'Completed'
                        ? styles.completedBadge
                        : styles.pendingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === 'Completed'
                          ? styles.completedText
                          : styles.pendingText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.recordAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            ))
          )}

          <View style={styles.footer}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color="#64748B"
            />
            <Text style={styles.footerText}>
              Earnings and payout statuses will be synced with the backend later.
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
    fontSize: 22,
    fontWeight: '800',
    color: '#172033',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 3,
  },
  heroCard: {
    backgroundColor: '#047857',
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    color: '#D1FAE5',
    fontSize: 14,
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 31,
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
  balanceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },
  balanceIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  balanceIconOrange: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#718096',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
    marginTop: 7,
  },
  availableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF1F6',
    marginBottom: 27,
  },
  availableIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableInfo: {
    flex: 1,
    marginLeft: 12,
  },
  availableLabel: {
    fontSize: 12,
    color: '#718096',
  },
  availableAmount: {
    fontSize: 21,
    fontWeight: '800',
    color: '#172033',
    marginTop: 4,
  },
  availableHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 14,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#E9EEF5',
    borderRadius: 11,
  },
  periodActive: {
    backgroundColor: '#D1FAE5',
  },
  periodText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#047857',
    fontWeight: '800',
  },
  filterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  filterButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  historySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historySummaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  earningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
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
    marginRight: 6,
  },
  orderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172033',
  },
  orderDate: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 7,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  completedText: {
    color: '#047857',
  },
  pendingText: {
    color: '#B45309',
  },
  recordAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#172033',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172033',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
