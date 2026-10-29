
import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type OrderFilter = 'All' | OrderStatus;

type Order = {
  id: string;
  customer: string;
  date: string;
  items: number;
  amount: number;
  status: OrderStatus;
};


const filters: OrderFilter[] = [
  'All',
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

function statusColors(status: OrderStatus) {
  switch (status) {
    case 'Pending':
      return { bg: '#FEF3C7', text: '#92400E' };
    case 'Processing':
      return { bg: '#DBEAFE', text: '#1D4ED8' };
    case 'Shipped':
      return { bg: '#EDE9FE', text: '#6D28D9' };
    case 'Delivered':
      return { bg: '#D1FAE5', text: '#047857' };
    case 'Cancelled':
      return { bg: '#FEE2E2', text: '#B91C1C' };
  }
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('All');

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query);

      return matchesSearch && (filter === 'All' || order.status === filter);
    });
  }, [orders, search, filter]);

  const updateStatus = (order: Order) => {
    const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
      Pending: 'Processing',
      Processing: 'Shipped',
      Shipped: 'Delivered',
    };

    const next = nextStatus[order.status];

    if (!next) {
      Alert.alert('Order status', `This order is ${order.status.toLowerCase()}.`);
      return;
    }

    Alert.alert(
      'Update order',
      `Move ${order.id} from ${order.status} to ${next}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setOrders((current) =>
              current.map((item) =>
                item.id === order.id ? { ...item, status: next } : item,
              ),
            );
          },
        },
      ],
    );
  };

  const pendingCount = orders.filter(
    (order) => order.status === 'Pending',
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === 'Delivered',
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status === 'Delivered')
    .reduce((total, order) => total + order.amount, 0);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>NEXT360 VENDOR</Text>
            <Text style={styles.title}>Orders</Text>
            <Text style={styles.subtitle}>Track and manage customer orders</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="receipt-outline" size={25} color="#059669" />
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Orders</Text>
            <Text style={styles.summaryValue}>{orders.length}</Text>
            <Ionicons name="bag-outline" size={20} color="#059669" />
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryValue}>{pendingCount}</Text>
            <Ionicons name="time-outline" size={20} color="#D97706" />
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Delivered</Text>
            <Text style={styles.summaryValue}>{deliveredCount}</Text>
            <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
          </View>
        </View>

        <View style={styles.revenueCard}>
          <View style={styles.revenueIcon}>
            <Ionicons name="wallet-outline" size={23} color="#059669" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Delivered Order Value</Text>
            <Text style={styles.revenueValue}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search order ID or customer"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={19} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Order Status</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterButton,
                filter === item && styles.filterActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Text style={styles.resultCount}>{visibleOrders.length} orders</Text>
        </View>

        {/*{visibleOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={34} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyText}>
              Try changing your search or status filter.
            </Text>
          </View>
        ) : (*/}
          {visibleOrders.length === 0 ? (
            <View style={styles.emptyCard}>
            <Ionicons
              name="receipt-outline"
              size={34}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>
              {orders.length === 0 ? 'No orders yet' : 'No orders found'}
            </Text>

            <Text style={styles.emptyText}>
              {orders.length === 0
                ? 'Your customer orders will appear here when available.'
                : 'Try changing your search or status filter.'}
            </Text>
         </View>
       ) : (
          visibleOrders.map((order) => {
            const colors = statusColors(order.status);

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View style={styles.orderIcon}>
                    <Ionicons name="bag-handle-outline" size={22} color="#059669" />
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.customer}>{order.customer}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View>
                    <Text style={styles.detailLabel}>Order Date</Text>
                    <Text style={styles.detailValue}>{order.date}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Items</Text>
                    <Text style={styles.detailValue}>{order.items}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.amount}>
                      ₹{order.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.actionButton}
                  onPress={() => updateStatus(order)}
                >
                  <Text style={styles.actionText}>
                    {order.status === 'Pending'
                      ? 'Start Processing'
                      : order.status === 'Processing'
                        ? 'Mark Shipped'
                        : order.status === 'Shipped'
                          ? 'Mark Delivered'
                          : 'View Order Status'}
                  </Text>
                  <Ionicons name="chevron-forward" size={17} color="#047857" />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FB' },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: { flex: 1 },
  eyebrow: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 5 },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  summaryGrid: { flexDirection: 'row', gap: 9, marginBottom: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 7,
  },
  summaryLabel: { fontSize: 11, color: '#64748B' },
  summaryValue: { fontSize: 23, fontWeight: '800', color: '#111827' },
  revenueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    marginBottom: 18,
  },
  revenueIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueValue: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    gap: 9,
    marginBottom: 22,
  },
  searchInput: { flex: 1, color: '#111827', fontSize: 13, paddingVertical: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  filters: { gap: 8, paddingBottom: 14 },
  filterButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterActive: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  filterText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  filterTextActive: { color: '#047857' },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultCount: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  orderTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: { flex: 1 },
  orderId: { fontSize: 13, fontWeight: '800', color: '#111827' },
  customer: { fontSize: 11, color: '#64748B', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 14,
    paddingTop: 12,
  },
  detailLabel: { fontSize: 10, color: '#64748B', marginBottom: 5 },
  detailValue: { fontSize: 11, color: '#334155', fontWeight: '600' },
  amount: { fontSize: 13, color: '#111827', fontWeight: '800' },
  actionButton: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 12,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: { fontSize: 12, fontWeight: '700', color: '#047857' },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
});
