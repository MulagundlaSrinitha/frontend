
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type CustomerStatus = 'Regular' | 'VIP' | 'New';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  status: CustomerStatus;
};

type Filter = 'All' | CustomerStatus;



const filters: Filter[] = ['All', 'New', 'Regular', 'VIP'];

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function CustomersScreen() {
  const [customers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const totalOrders = customers.reduce((sum, customer) => sum + customer.orders, 0);
  const totalSpent = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0,
  );
  const vipCount = customers.filter((customer) => customer.status === 'VIP').length;

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch = [
        customer.name,
        customer.email,
        customer.phone,
        customer.city,
        customer.id,
      ].some((value) => value.toLowerCase().includes(query));

      return matchesSearch && (filter === 'All' || customer.status === filter);
    });
  }, [customers, search, filter]);

  function showContact(customer: Customer) {
    Alert.alert(
      `Contact ${customer.name}`,
      `Email: ${customer.email}\nPhone: ${customer.phone}`,
      [{ text: 'Close' }],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#172B4D" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Customers</Text>
          <Text style={styles.headerSubtitle}>Manage your store customers</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="people-outline" size={27} color="#FFFFFF" />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Customer Overview</Text>
            <Text style={styles.welcomeSubtitle}>
              Understand your customers and their purchases.
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E8F1FF' }]}>
              <Ionicons name="people-outline" size={20} color="#2563EB" />
            </View>
            <Text style={styles.summaryValue}>{customers.length}</Text>
            <Text style={styles.summaryLabel}>Customers</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#DDF8EB' }]}>
              <Ionicons name="star-outline" size={20} color="#059669" />
            </View>
            <Text style={styles.summaryValue}>{vipCount}</Text>
            <Text style={styles.summaryLabel}>VIP Customers</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FFF1D6' }]}>
              <Ionicons name="bag-handle-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.summaryValue}>{totalOrders}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="wallet-outline" size={20} color="#9333EA" />
            </View>
            <Text style={styles.summaryValue}>
              {formatAmount(totalSpent)}
            </Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, email, phone..."
            placeholderTextColor="#94A3B8"
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
                <Text style={[styles.filterText, selected && styles.selectedText]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Customer List</Text>
          <Text style={styles.resultCount}>
            {filteredCustomers.length} customers
          </Text>
        </View>

       {filteredCustomers.length === 0 ? (
  <View style={styles.emptyState}>
    <Ionicons
      name="people-outline"
      size={42}
      color="#94A3B8"
    />

    <Text style={styles.emptyTitle}>
      {customers.length === 0
        ? 'No customers yet'
        : 'No customers found'}
    </Text>

    <Text style={styles.emptySubtitle}>
      {customers.length === 0
        ? 'Your store customers will appear here when customer data is available.'
        : 'Try a different search or filter.'}
    </Text>
  </View>
) : (
          filteredCustomers.map((customer) => {
            const expanded = selectedCustomer === customer.id;

            return (
              <View key={customer.id} style={styles.customerCard}>
                <View style={styles.customerTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {customer.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    <Text style={styles.customerId}>{customer.id}</Text>
                    <Text style={styles.customerCity}>
                      <Ionicons name="location-outline" size={12} color="#718096" />{' '}
                      {customer.city}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      customer.status === 'VIP'
                        ? styles.vipBadge
                        : customer.status === 'New'
                          ? styles.newBadge
                          : styles.regularBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        customer.status === 'VIP'
                          ? styles.vipText
                          : customer.status === 'New'
                            ? styles.newText
                            : styles.regularText,
                      ]}
                    >
                      {customer.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Orders</Text>
                    <Text style={styles.metricValue}>{customer.orders}</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Total spent</Text>
                    <Text style={styles.metricValue}>
                      {formatAmount(customer.totalSpent)}
                    </Text>
                  </View>
                </View>

                <View style={styles.lastOrderRow}>
                  <Ionicons name="time-outline" size={15} color="#718096" />
                  <Text style={styles.lastOrderText}>
                    Last order: {customer.lastOrder}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.contactButton}
                    onPress={() => showContact(customer)}
                  >
                    <Ionicons name="call-outline" size={16} color="#059669" />
                    <Text style={styles.contactButtonText}>Contact</Text>
                  </Pressable>

                  <Pressable
                    style={styles.detailsButton}
                    onPress={() =>
                      setSelectedCustomer(expanded ? null : customer.id)
                    }
                  >
                    <Text style={styles.detailsButtonText}>
                      {expanded ? 'Hide Details' : 'View Details'}
                    </Text>
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>

                {expanded && (
                  <View style={styles.detailsPanel}>
                    <Text style={styles.detailsTitle}>Customer Details</Text>
                    <Text style={styles.detailsText}>
                      Email: {customer.email}
                    </Text>
                    <Text style={styles.detailsText}>
                      Phone: {customer.phone}
                    </Text>
                    <Text style={styles.detailsText}>
                      Customer ID: {customer.id}
                    </Text>
                    <Text style={styles.detailsText}>
                      Total orders: {customer.orders}
                    </Text>
                    <Text style={styles.detailsText}>
                      Lifetime spend: {formatAmount(customer.totalSpent)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}

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
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#047857',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  welcomeIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: { flex: 1 },
  welcomeTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  welcomeSubtitle: { fontSize: 11, lineHeight: 17, color: '#D1FAE5', marginTop: 4 },
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
  summaryValue: { fontSize: 21, fontWeight: '800', color: '#172B4D' },
  summaryLabel: { fontSize: 11, color: '#718096', marginTop: 4 },
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
    paddingVertical: 12,
    fontSize: 13,
    color: '#172B4D',
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
  filterText: { fontSize: 12, fontWeight: '600', color: '#526174' },
  selectedText: { color: '#FFFFFF' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#172B4D' },
  resultCount: { fontSize: 12, color: '#718096' },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  customerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DDF8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#047857' },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: '800', color: '#172B4D' },
  customerId: { fontSize: 10, color: '#94A3B8', marginTop: 3 },
  customerCity: { fontSize: 11, color: '#718096', marginTop: 4 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: '700' },
  vipBadge: { backgroundColor: '#F3E8FF' },
  vipText: { color: '#7E22CE' },
  newBadge: { backgroundColor: '#E0F2FE' },
  newText: { color: '#0369A1' },
  regularBadge: { backgroundColor: '#DDF8EB' },
  regularText: { color: '#047857' },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    padding: 13,
    marginTop: 16,
  },
  metric: { flex: 1 },
  metricLabel: { fontSize: 11, color: '#718096' },
  metricValue: { fontSize: 15, fontWeight: '800', color: '#172B4D', marginTop: 5 },
  metricDivider: { width: 1, height: 35, backgroundColor: '#DCE4ED', marginHorizontal: 12 },
  lastOrderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 },
  lastOrderText: { fontSize: 11, color: '#718096' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 11,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
  },
  contactButtonText: { color: '#047857', fontSize: 12, fontWeight: '700' },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 11,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  detailsButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  detailsPanel: {
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    padding: 13,
    marginTop: 13,
  },
  detailsTitle: { fontSize: 13, fontWeight: '800', color: '#172B4D', marginBottom: 8 },
  detailsText: { fontSize: 12, color: '#526174', lineHeight: 21 },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#172B4D', marginTop: 10 },
  emptySubtitle: { fontSize: 12, color: '#718096', marginTop: 5, textAlign: 'center' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
    backgroundColor: '#EAF2FF',
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 11, lineHeight: 17, color: '#355580' },
});
