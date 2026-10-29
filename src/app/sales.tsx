
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Period = 'Today' | '7 Days' | '30 Days';

type Sale = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Processing' | 'Cancelled';
};

type SalesPeriodData = {
  total: number;
  orders: number;
  average: number;
  chart: number[];
  labels: string[];
};

// No demo values. Real sales data can be connected later.
const salesByPeriod: Record<Period, SalesPeriodData> = {
  Today: {
    total: 0,
    orders: 0,
    average: 0,
    chart: [],
    labels: [],
  },
  '7 Days': {
    total: 0,
    orders: 0,
    average: 0,
    chart: [],
    labels: [],
  },
  '30 Days': {
    total: 0,
    orders: 0,
    average: 0,
    chart: [],
    labels: [],
  },
};

const topProducts: {
  name: string;
  sold: number;
  revenue: number;
}[] = [];

function money(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function SalesScreen() {
  const [period, setPeriod] = useState<Period>('7 Days');
  const [sales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');

  const data = salesByPeriod[period];

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sales.filter(
      (sale) =>
        sale.id.toLowerCase().includes(query) ||
        sale.customer.toLowerCase().includes(query) ||
        sale.product.toLowerCase().includes(query),
    );
  }, [sales, search]);

  const maxChartValue = Math.max(...data.chart, 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#172B4D" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Sales</Text>
          <Text style={styles.headerSubtitle}>
            Track your store sales
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Period selector */}
        <View style={styles.periodRow}>
          {(['Today', '7 Days', '30 Days'] as Period[]).map((item) => {
            const selected = period === item;

            return (
              <Pressable
                key={item}
                onPress={() => setPeriod(item)}
                style={[
                  styles.periodButton,
                  selected && styles.periodSelected,
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    selected && styles.periodTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Total sales */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Sales</Text>
          <Text style={styles.totalValue}>{money(data.total)}</Text>

          <View style={styles.growthRow}>
            <Ionicons
              name="trending-up"
              size={17}
              color="#D1FAE5"
            />
            <Text style={styles.growthText}>
              Sales overview · {period}
            </Text>
          </View>
        </View>

        {/* Sales metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                { backgroundColor: '#E8F1FF' },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <Text style={styles.metricLabel}>Orders</Text>
            <Text style={styles.metricValue}>{data.orders}</Text>
          </View>

          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                { backgroundColor: '#DDF8EB' },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={20}
                color="#059669"
              />
            </View>

            <Text style={styles.metricLabel}>Avg. Order Value</Text>
            <Text style={styles.metricValue}>
              {money(data.average)}
            </Text>
          </View>
        </View>

        {/* Sales trend */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Sales Trend</Text>
              <Text style={styles.cardSubtitle}>
                Sales activity by period
              </Text>
            </View>

            <Ionicons
              name="bar-chart-outline"
              size={22}
              color="#059669"
            />
          </View>

          {data.chart.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="bar-chart-outline"
                size={32}
                color="#94A3B8"
              />
              <Text style={styles.emptyTitle}>
                No sales data yet
              </Text>
              <Text style={styles.emptySubtitle}>
                Chart will appear when sales data is available.
              </Text>
            </View>
          ) : (
            <View style={styles.chart}>
              {data.chart.map((value, index) => (
                <View
                  key={`${period}-${index}`}
                  style={styles.chartColumn}
                >
                  <Text style={styles.barValue}>
                    {Math.round(
                      (value / maxChartValue) * 100,
                    )}%
                  </Text>

                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${
                            (value / maxChartValue) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.chartLabel}>
                    {data.labels[index]}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Top-selling products */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Top-Selling Products
              </Text>
              <Text style={styles.cardSubtitle}>
                Product performance overview
              </Text>
            </View>

            <Ionicons
              name="trophy-outline"
              size={22}
              color="#D97706"
            />
          </View>

          {topProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="pricetag-outline"
                size={32}
                color="#94A3B8"
              />
              <Text style={styles.emptyTitle}>
                No product sales data yet
              </Text>
              <Text style={styles.emptySubtitle}>
                Product performance will appear when sales data
                is available.
              </Text>
            </View>
          ) : (
            topProducts.map((product, index) => (
              <View
                key={product.name}
                style={styles.topProductRow}
              >
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.topProductInfo}>
                  <Text style={styles.topProductName}>
                    {product.name}
                  </Text>
                  <Text style={styles.topProductSold}>
                    {product.sold} units sold
                  </Text>
                </View>

                <Text style={styles.topProductRevenue}>
                  {money(product.revenue)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Recent sales heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Recent Sales</Text>
          <Text style={styles.resultCount}>
            {filteredSales.length} orders
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={19}
            color="#718096"
          />

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search order, customer, product..."
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={19}
                color="#94A3B8"
              />
            </Pressable>
          )}
        </View>

        {/* Recent sales list */}
        {filteredSales.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={36}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>
              {sales.length === 0
                ? 'No sales yet'
                : 'No sales found'}
            </Text>

            <Text style={styles.emptySubtitle}>
              {sales.length === 0
                ? 'Sales records will appear here when data is available.'
                : 'Try another search.'}
            </Text>
          </View>
        ) : (
          filteredSales.map((sale) => (
            <View key={sale.id} style={styles.saleCard}>
              <View style={styles.saleIcon}>
                <Ionicons
                  name="bag-handle-outline"
                  size={21}
                  color="#059669"
                />
              </View>

              <View style={styles.saleInfo}>
                <Text style={styles.saleId}>{sale.id}</Text>
                <Text style={styles.saleProduct}>
                  {sale.product}
                </Text>

                <Text style={styles.saleMeta}>
                  {sale.customer} · {sale.date}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    sale.status === 'Completed'
                      ? styles.completedBadge
                      : sale.status === 'Processing'
                        ? styles.processingBadge
                        : styles.cancelledBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      sale.status === 'Completed'
                        ? styles.completedText
                        : sale.status === 'Processing'
                          ? styles.processingText
                          : styles.cancelledText,
                    ]}
                  >
                    {sale.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.saleAmount}>
                {money(sale.amount)}
              </Text>
            </View>
          ))
        )}

        {/* Information */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            Sales reports are not connected to live data yet.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
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
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#172B4D',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 11,
  },
  periodSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  periodText: {
    fontSize: 12,
    color: '#526174',
    fontWeight: '600',
  },
  periodTextSelected: {
    color: '#FFFFFF',
  },
  totalCard: {
    backgroundColor: '#047857',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },
  totalLabel: {
    color: '#D1FAE5',
    fontSize: 13,
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 7,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  growthText: {
    color: '#D1FAE5',
    fontSize: 11,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  metricLabel: {
    color: '#718096',
    fontSize: 11,
  },
  metricValue: {
    color: '#172B4D',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172B4D',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 175,
    gap: 7,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 9,
    color: '#718096',
    marginBottom: 5,
  },
  barTrack: {
    width: '75%',
    height: 125,
    justifyContent: 'flex-end',
    backgroundColor: '#F0F5F3',
    borderRadius: 7,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: '#059669',
    borderRadius: 7,
    minHeight: 5,
  },
  chartLabel: {
    fontSize: 9,
    color: '#718096',
    marginTop: 8,
  },
  chartNote: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 14,
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FFF1D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#172B4D',
  },
  topProductSold: {
    fontSize: 10,
    color: '#718096',
    marginTop: 4,
  },
  topProductRevenue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#172B4D',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 11,
    color: '#718096',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 11,
    fontSize: 12,
    color: '#172B4D',
  },
  saleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    marginBottom: 10,
  },
  saleIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#DDF8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saleInfo: {
    flex: 1,
  },
  saleId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#172B4D',
  },
  saleProduct: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
  saleMeta: {
    fontSize: 10,
    color: '#718096',
    marginTop: 4,
  },
  saleAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#172B4D',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 7,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  completedBadge: {
    backgroundColor: '#DDF8EB',
  },
  completedText: {
    color: '#047857',
  },
  processingBadge: {
    backgroundColor: '#FFF1D6',
  },
  processingText: {
    color: '#B45309',
  },
  cancelledBadge: {
    backgroundColor: '#FEE8E7',
  },
  cancelledText: {
    color: '#B91C1C',
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
  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#355580',
  },
});
