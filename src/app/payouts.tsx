
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type PayoutStatus = 'Completed' | 'Pending' | 'Processing';
type Filter = 'All' | PayoutStatus;

type Payout = {
  id: string;
  reference: string;
  date: string;
  amount: number;
  method: string;
  status: PayoutStatus;
};


const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

export default function PayoutsScreen() {
  const router = useRouter();
  const [payouts] = useState<Payout[]>([]);
  const [filter, setFilter] = useState<Filter>('All');

  const filteredPayouts = useMemo(() => {
    if (filter === 'All') return payouts;
    return payouts.filter((payout) => payout.status === filter);
  }, [filter, payouts]);

  const completedAmount = payouts
    .filter((payout) => payout.status === 'Completed')
    .reduce((sum, payout) => sum + payout.amount, 0);

  const pendingAmount = payouts
    .filter((payout) => payout.status === 'Pending')
    .reduce((sum, payout) => sum + payout.amount, 0);

  const processingAmount = payouts
    .filter((payout) => payout.status === 'Processing')
    .reduce((sum, payout) => sum + payout.amount, 0);

  const showPayoutDetails = (payout: Payout) => {
    Alert.alert(
      `Payout ${payout.reference}`,
      `Amount: ${formatCurrency(payout.amount)}\nDate: ${payout.date}\nMethod: ${payout.method}\nStatus: ${payout.status}`,
      [{ text: 'Close', style: 'cancel' }],
    );
  };

  const statusStyle = (status: PayoutStatus) => {
    switch (status) {
      case 'Completed':
        return {
          backgroundColor: '#D1FAE5',
          color: '#047857',
        };
      case 'Pending':
        return {
          backgroundColor: '#FEF3C7',
          color: '#B45309',
        };
      case 'Processing':
        return {
          backgroundColor: '#DBEAFE',
          color: '#1D4ED8',
        };
    }
  };

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
              <Text style={styles.title}>Payouts</Text>
              <Text style={styles.subtitle}>
                Track your store payments
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons name="wallet-outline" size={23} color="#059669" />
            </View>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Payouts Completed</Text>
            <Text style={styles.heroAmount}>
              {formatCurrency(completedAmount)}
            </Text>

            <View style={styles.heroDivider} />

            <View style={styles.heroFooter}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#D1FAE5"
              />
              <Text style={styles.heroFooterText}>
                {payouts.filter((p) => p.status === 'Completed').length}{' '}
                completed payouts
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.greenIcon]}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={21}
                  color="#059669"
                />
              </View>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(completedAmount)}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.orangeIcon]}>
                <Ionicons name="time-outline" size={21} color="#D97706" />
              </View>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(pendingAmount)}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, styles.blueIcon]}>
                <Ionicons
                  name="sync-outline"
                  size={21}
                  color="#2563EB"
                />
              </View>
              <Text style={styles.statLabel}>Processing</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(processingAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#2563EB"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Payout information</Text>
              <Text style={styles.infoText}>
                Payout timelines and bank details will be shown here when
                your store is connected to the backend.
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payout History</Text>
            <Text style={styles.recordCount}>
              {filteredPayouts.length} records
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {(
              ['All', 'Completed', 'Pending', 'Processing'] as Filter[]
            ).map((item) => {
              const selected = filter === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterButton,
                    selected && styles.filterButtonActive,
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

          {filteredPayouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="wallet-outline"
                size={34}
                color="#94A3B8"
              />
              <Text style={styles.emptyTitle}>
  {payouts.length === 0 ? 'No payouts yet' : 'No payouts found'}
</Text>
<Text style={styles.emptySubtitle}>
  {payouts.length === 0
    ? 'Payout history will appear here when payment data is available.'
    : 'Try selecting a different status.'}
</Text>
              <Text style={styles.emptySubtitle}>
                Try selecting a different status.
              </Text>
            </View>
          ) : (
            filteredPayouts.map((payout) => {
              const badge = statusStyle(payout.status);

              return (
                <TouchableOpacity
                  key={payout.id}
                  style={styles.payoutCard}
                  onPress={() => showPayoutDetails(payout)}
                  activeOpacity={0.75}
                >
                  <View style={styles.payoutIcon}>
                    <Ionicons
                      name="card-outline"
                      size={22}
                      color="#059669"
                    />
                  </View>

                  <View style={styles.payoutInfo}>
                    <Text style={styles.reference}>
                      {payout.reference}
                    </Text>
                    <Text style={styles.payoutDate}>{payout.date}</Text>
                    <Text style={styles.payoutMethod}>
                      {payout.method}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: badge.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: badge.color },
                        ]}
                      >
                        {payout.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.amountContainer}>
                    <Text style={styles.payoutAmount}>
                      {formatCurrency(payout.amount)}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={17}
                      color="#94A3B8"
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color="#64748B"
            />
            <Text style={styles.footerText}>
              Payout information is not connected to live data yet.
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
  heroCard: {
    backgroundColor: '#047857',
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
  },
  heroLabel: {
    color: '#D1FAE5',
    fontSize: 13,
    fontWeight: '500',
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginVertical: 18,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroFooterText: {
    color: '#D1FAE5',
    fontSize: 12,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  greenIcon: {
    backgroundColor: '#D1FAE5',
  },
  orangeIcon: {
    backgroundColor: '#FEF3C7',
  },
  blueIcon: {
    backgroundColor: '#DBEAFE',
  },
  statLabel: {
    fontSize: 11,
    color: '#718096',
  },
  statAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#172033',
    marginTop: 7,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    marginBottom: 27,
    gap: 11,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
  },
  recordCount: {
    fontSize: 12,
    color: '#718096',
  },
  filterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  filterButton: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
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
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },
  payoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 5,
  },
  reference: {
    fontSize: 13,
    fontWeight: '800',
    color: '#172033',
  },
  payoutDate: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
  },
  payoutMethod: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 7,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 9,
  },
  payoutAmount: {
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
  emptySubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 5,
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
