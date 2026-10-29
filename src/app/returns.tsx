
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type ReturnStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';

type ReturnRequest = {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  reason: string;
  amount: number;
  date: string;
  status: ReturnStatus;
};

type Filter = 'All' | ReturnStatus;


const filters: Filter[] = [
  'All',
  'Pending',
  'Approved',
  'Rejected',
  'Completed',
];

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getStatusStyle(status: ReturnStatus) {
  switch (status) {
    case 'Pending':
      return { badge: styles.pendingBadge, text: styles.pendingText };
    case 'Approved':
      return { badge: styles.approvedBadge, text: styles.approvedText };
    case 'Rejected':
      return { badge: styles.rejectedBadge, text: styles.rejectedText };
    case 'Completed':
      return { badge: styles.completedBadge, text: styles.completedText };
  }
}

export default function ReturnsScreen() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      total: returns.length,
      pending: returns.filter((item) => item.status === 'Pending').length,
      approved: returns.filter((item) => item.status === 'Approved').length,
      completed: returns.filter((item) => item.status === 'Completed').length,
    }),
    [returns],
  );

  const filteredReturns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return returns.filter((item) => {
      const matchesSearch = [
        item.id,
        item.orderId,
        item.customer,
        item.product,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesFilter = filter === 'All' || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [returns, search, filter]);

  function updateStatus(item: ReturnRequest, status: ReturnStatus) {
    const action = status === 'Approved' ? 'approve' : 'reject';

    Alert.alert(
      `${status} return?`,
      `Are you sure you want to ${action} ${item.id} for ${item.product}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status,
          style: status === 'Rejected' ? 'destructive' : 'default',
          onPress: () => {
            setReturns((current) =>
              current.map((request) =>
                request.id === item.id
                  ? { ...request, status }
                  : request,
              ),
            );
            setExpandedId(null);
            Alert.alert('Updated', `${item.id} is now ${status}.`);
          },
        },
      ],
    );
  }

  function completeReturn(item: ReturnRequest) {
    Alert.alert(
      'Complete return?',
      `Mark ${item.id} as completed after the return/refund process is finished?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Completed',
          onPress: () => {
            setReturns((current) =>
              current.map((request) =>
                request.id === item.id
                  ? { ...request, status: 'Completed' }
                  : request,
              ),
            );
            setExpandedId(null);
            Alert.alert('Updated', `${item.id} marked as completed.`);
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#172B4D" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Returns</Text>
          <Text style={styles.headerSubtitle}>
            Manage product return requests
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E8F1FF' }]}>
              <Ionicons name="receipt-outline" size={21} color="#2563EB" />
            </View>
            <Text style={styles.summaryValue}>{counts.total}</Text>
            <Text style={styles.summaryLabel}>Total Returns</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FFF1D6' }]}>
              <Ionicons name="time-outline" size={21} color="#D97706" />
            </View>
            <Text style={styles.summaryValue}>{counts.pending}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#DDF8EB' }]}>
              <Ionicons name="checkmark-circle-outline" size={21} color="#059669" />
            </View>
            <Text style={styles.summaryValue}>{counts.approved}</Text>
            <Text style={styles.summaryLabel}>Approved</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="checkmark-done-outline" size={21} color="#0284C7" />
            </View>
            <Text style={styles.summaryValue}>{counts.completed}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search return, order, customer..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={19} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((item) => {
            const selected = filter === item;

            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.filterChip, selected && styles.selectedChip]}
              >
                <Text
                  style={[styles.filterText, selected && styles.selectedText]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Return Requests</Text>
          <Text style={styles.resultCount}>{filteredReturns.length} requests</Text>
        </View>

        {filteredReturns.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={40} color="#94A3B8" />
           <Text style={styles.emptyTitle}>
  {returns.length === 0
    ? 'No return requests yet'
    : 'No return requests found'}
</Text>

<Text style={styles.emptySubtitle}>
  {returns.length === 0
    ? 'Return requests will appear here when data is available.'
    : 'Try changing the filter or search term.'}
</Text>
            <Text style={styles.emptySubtitle}>
              Try changing the filter or search term.
            </Text>
          </View>
        ) : (
          filteredReturns.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            const expanded = expandedId === item.id;

            return (
              <View key={item.id} style={styles.returnCard}>
                <View style={styles.cardTop}>
                  <View style={styles.returnIcon}>
                    <Ionicons
                      name="return-down-back-outline"
                      size={23}
                      color="#059669"
                    />
                  </View>

                  <View style={styles.returnInfo}>
                    <Text style={styles.returnId}>{item.id}</Text>
                    <Text style={styles.orderId}>Order #{item.orderId}</Text>
                  </View>

                  <View style={[styles.statusBadge, statusStyle.badge]}>
                    <Text style={[styles.statusText, statusStyle.text]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.productName}>{item.product}</Text>
                <Text style={styles.customerName}>
                  <Ionicons name="person-outline" size={13} color="#718096" />{' '}
                  {item.customer}
                </Text>

                <View style={styles.detailRow}>
                  <View style={styles.reasonBox}>
                    <Text style={styles.detailLabel}>Return reason</Text>
                    <Text style={styles.reasonText}>{item.reason}</Text>
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.amountText}>
                      {formatAmount(item.amount)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>Requested on {item.date}</Text>

                <Pressable
                  style={styles.detailsButton}
                  onPress={() => setExpandedId(expanded ? null : item.id)}
                >
                  <Text style={styles.detailsButtonText}>
                    {expanded ? 'Hide Details' : 'View Details'}
                  </Text>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={17}
                    color="#059669"
                  />
                </Pressable>

                {expanded && (
                  <View style={styles.expandedPanel}>
                    <Text style={styles.panelTitle}>Return Summary</Text>
                    <Text style={styles.panelText}>Return ID: {item.id}</Text>
                    <Text style={styles.panelText}>Order ID: {item.orderId}</Text>
                    <Text style={styles.panelText}>Customer: {item.customer}</Text>
                    <Text style={styles.panelText}>Product: {item.product}</Text>
                    <Text style={styles.panelText}>Reason: {item.reason}</Text>
                    <Text style={styles.panelText}>
                      Refund amount: {formatAmount(item.amount)}
                    </Text>

                    {item.status === 'Pending' && (
                      <View style={styles.actionRow}>
                        <Pressable
                          style={styles.rejectButton}
                          onPress={() => updateStatus(item, 'Rejected')}
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={17}
                            color="#DC2626"
                          />
                          <Text style={styles.rejectText}>Reject</Text>
                        </Pressable>

                        <Pressable
                          style={styles.approveButton}
                          onPress={() => updateStatus(item, 'Approved')}
                        >
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={17}
                            color="#FFFFFF"
                          />
                          <Text style={styles.approveText}>Approve</Text>
                        </Pressable>
                      </View>
                    )}

                    {item.status === 'Approved' && (
                      <Pressable
                        style={styles.completeButton}
                        onPress={() => completeReturn(item)}
                      >
                        <Ionicons
                          name="checkmark-done-outline"
                          size={17}
                          color="#FFFFFF"
                        />
                        <Text style={styles.approveText}>
                          Mark as Completed
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2563EB"
          />
          <Text style={styles.infoText}>
            Return requests are not connected to live data yet.
No actual refund is processed from this screen.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F8FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF3',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#172B4D' },
  headerSubtitle: { fontSize: 12, color: '#718096', marginTop: 4 },
  content: { padding: 16, paddingBottom: 32 },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: { fontSize: 24, fontWeight: '800', color: '#172B4D' },
  summaryLabel: { fontSize: 12, color: '#718096', marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 9,
    color: '#172B4D',
    fontSize: 13,
    paddingVertical: 12,
  },
  filters: { gap: 8, paddingBottom: 18 },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE4ED',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  selectedChip: { backgroundColor: '#059669', borderColor: '#059669' },
  filterText: { color: '#526174', fontSize: 12, fontWeight: '600' },
  selectedText: { color: '#FFFFFF' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#172B4D' },
  resultCount: { color: '#718096', fontSize: 12 },
  returnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  returnIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DDF8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnInfo: { flex: 1 },
  returnId: { fontSize: 14, fontWeight: '800', color: '#172B4D' },
  orderId: { fontSize: 11, color: '#718096', marginTop: 4 },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  pendingBadge: { backgroundColor: '#FFF1D6' },
  pendingText: { color: '#B45309' },
  approvedBadge: { backgroundColor: '#DDF8EB' },
  approvedText: { color: '#047857' },
  rejectedBadge: { backgroundColor: '#FEE8E7' },
  rejectedText: { color: '#B91C1C' },
  completedBadge: { backgroundColor: '#E0F2FE' },
  completedText: { color: '#0369A1' },
  divider: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginVertical: 14,
  },
  productName: { fontSize: 15, fontWeight: '700', color: '#172B4D' },
  customerName: { fontSize: 12, color: '#718096', marginTop: 7 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  reasonBox: { flex: 1 },
  amountBox: { alignItems: 'flex-end' },
  detailLabel: { fontSize: 11, color: '#718096' },
  reasonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 5,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172B4D',
    marginTop: 5,
  },
  dateText: { fontSize: 11, color: '#718096', marginTop: 14 },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    marginTop: 14,
    paddingTop: 13,
  },
  detailsButtonText: { fontSize: 12, color: '#059669', fontWeight: '700' },
  expandedPanel: {
    backgroundColor: '#F6F8FB',
    padding: 13,
    borderRadius: 12,
    marginTop: 13,
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 9,
  },
  panelText: {
    fontSize: 12,
    color: '#526174',
    lineHeight: 20,
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  rejectText: { fontSize: 12, color: '#DC2626', fontWeight: '700' },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: '#059669',
    padding: 12,
  },
  approveText: { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    padding: 12,
    marginTop: 14,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 5,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
    backgroundColor: '#EAF2FF',
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: { flex: 1, color: '#355580', fontSize: 11, lineHeight: 17 },
});
