import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type TransactionType = 'Credit' | 'Debit';
type Filter = 'All' | TransactionType;

type Transaction = {
  id: string;
  description: string;
  reference: string;
  date: string;
  amount: number;
  type: TransactionType;
  status: 'Completed' | 'Pending';
};

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

export default function TransactionsScreen() {
  const router = useRouter();

  const [transactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        transaction.id.toLowerCase().includes(query) ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.reference.toLowerCase().includes(query);

      const matchesFilter =
        filter === 'All' || transaction.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  const totalCredits = transactions
    .filter((item) => item.type === 'Credit')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalDebits = transactions
    .filter((item) => item.type === 'Debit')
    .reduce((sum, item) => sum + item.amount, 0);

  const showDetails = (transaction: Transaction) => {
    Alert.alert(
      'Transaction Details',
      `Transaction ID: ${transaction.id}\nDescription: ${transaction.description}\nReference: ${transaction.reference}\nDate: ${transaction.date}\nType: ${transaction.type}\nAmount: ${formatCurrency(transaction.amount)}\nStatus: ${transaction.status}`,
      [{ text: 'Close', style: 'cancel' }],
    );
  };

  const resetFilters = () => {
    setSearch('');
    setFilter('All');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#172033"
              />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.title}>Transactions</Text>
              <Text style={styles.subtitle}>
                Track credits and debits
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="receipt-outline"
                size={23}
                color="#059669"
              />
            </View>
          </View>

          {/* Net Transaction Amount */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>
              Net Transaction Amount
            </Text>

            <Text style={styles.heroAmount}>
              {formatCurrency(totalCredits - totalDebits)}
            </Text>

            <Text style={styles.heroNote}>
              Total credits minus total debits
            </Text>
          </View>

          {/* Credit and Debit Summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View
                style={[styles.summaryIcon, styles.creditIcon]}
              >
                <Ionicons
                  name="arrow-down-outline"
                  size={20}
                  color="#059669"
                />
              </View>

              <Text style={styles.summaryLabel}>
                Total Credits
              </Text>

              <Text style={styles.summaryAmount}>
                {formatCurrency(totalCredits)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View
                style={[styles.summaryIcon, styles.debitIcon]}
              >
                <Ionicons
                  name="arrow-up-outline"
                  size={20}
                  color="#DC2626"
                />
              </View>

              <Text style={styles.summaryLabel}>
                Total Debits
              </Text>

              <Text style={styles.summaryAmount}>
                {formatCurrency(totalDebits)}
              </Text>
            </View>
          </View>

          {/* Total Transactions */}
          <View style={styles.countCard}>
            <View style={styles.countIcon}>
              <Ionicons
                name="swap-horizontal-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View style={styles.countInfo}>
              <Text style={styles.countTitle}>
                Total Transactions
              </Text>

              <Text style={styles.countSubtitle}>
                Available transaction records
              </Text>
            </View>

            <Text style={styles.countNumber}>
              {transactions.length}
            </Text>
          </View>

          {/* Transaction History */}
          <Text style={styles.sectionTitle}>
            Transaction History
          </Text>

          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#94A3B8"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search ID, description or reference"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              autoCapitalize="none"
              returnKeyType="search"
            />

            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                accessibilityLabel="Clear search"
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Filters */}
          <View style={styles.filterRow}>
            {(['All', 'Credit', 'Debit'] as Filter[]).map(
              (item) => {
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
              },
            )}
          </View>

          {/* Results Count */}
          <View style={styles.resultsRow}>
            <Text style={styles.resultsText}>
              {filteredTransactions.length} transactions found
            </Text>
          </View>

          {/* Transaction List / Empty State */}
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="receipt-outline"
                size={36}
                color="#94A3B8"
              />

              <Text style={styles.emptyTitle}>
                {transactions.length === 0
                  ? 'No transactions yet'
                  : 'No transactions found'}
              </Text>

              <Text style={styles.emptyText}>
                {transactions.length === 0
                  ? 'Your transaction history will appear here when data is available.'
                  : 'Try another search or transaction type.'}
              </Text>

              {(search.length > 0 || filter !== 'All') && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetFilters}
                >
                  <Text style={styles.resetButtonText}>
                    Reset Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredTransactions.map((transaction) => {
              const isCredit = transaction.type === 'Credit';

              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  activeOpacity={0.75}
                  onPress={() => showDetails(transaction)}
                >
                  <View
                    style={[
                      styles.transactionIcon,
                      isCredit
                        ? styles.creditIcon
                        : styles.debitIcon,
                    ]}
                  >
                    <Ionicons
                      name={
                        isCredit
                          ? 'arrow-down-outline'
                          : 'arrow-up-outline'
                      }
                      size={22}
                      color={isCredit ? '#059669' : '#DC2626'}
                    />
                  </View>

                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>
                      {transaction.description}
                    </Text>

                    <Text style={styles.transactionReference}>
                      {transaction.id} · {transaction.reference}
                    </Text>

                    <Text style={styles.transactionDate}>
                      {transaction.date}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        transaction.status === 'Completed'
                          ? styles.completedBadge
                          : styles.pendingBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          transaction.status === 'Completed'
                            ? styles.completedText
                            : styles.pendingText,
                        ]}
                      >
                        {transaction.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.amountColumn}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color: isCredit ? '#059669' : '#DC2626',
                        },
                      ]}
                    >
                      {isCredit ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#94A3B8"
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color="#64748B"
            />

            <Text style={styles.footerText}>
              Transaction history is not connected to live data yet.
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
    marginBottom: 16,
  },
  heroLabel: {
    color: '#D1FAE5',
    fontSize: 13,
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '800',
    marginTop: 8,
  },
  heroNote: {
    color: '#D1FAE5',
    fontSize: 11,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },
  summaryIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  creditIcon: {
    backgroundColor: '#D1FAE5',
  },
  debitIcon: {
    backgroundColor: '#FEE2E2',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#718096',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
    marginTop: 7,
  },
  countCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF1F6',
    marginBottom: 27,
  },
  countIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countInfo: {
    flex: 1,
    marginLeft: 12,
  },
  countTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172033',
  },
  countSubtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 5,
  },
  countNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#172033',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 13,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#172033',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    paddingVertical: 9,
    paddingHorizontal: 17,
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
  resultsRow: {
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 12,
    color: '#718096',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },
  transactionIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 5,
  },
  transactionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#172033',
  },
  transactionReference: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 5,
  },
  transactionDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
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
  amountColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 12,
    fontWeight: '800',
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
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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