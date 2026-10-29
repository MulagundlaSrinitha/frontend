
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  threshold: number;
};

type Filter = 'All' | 'Low Stock' | 'Out of Stock';


function getStatus(product: Product): Filter {
  return product.stock === 0 ? 'Out of Stock' : 'Low Stock';
}

export default function LowStockScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('10');

  const lowCount = products.filter((p) => p.stock > 0).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesFilter =
        filter === 'All' || getStatus(product) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  function openRestock(product: Product) {
    setRestockProduct(product);
    setRestockQuantity('10');
  }

  function saveRestock() {
    const amount = Number(restockQuantity);

    if (
      restockQuantity.trim() === '' ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      Alert.alert('Invalid quantity', 'Enter a whole number greater than 0.');
      return;
    }

    if (!restockProduct) return;

    setProducts((current) =>
      current.map((product) =>
        product.id === restockProduct.id
          ? { ...product, stock: product.stock + amount }
          : product,
      ),
    );

    Alert.alert(
      'Restock successful',
      `${restockProduct.name} stock increased by ${amount} units.`,
    );
    setRestockProduct(null);
    setRestockQuantity('10');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#172B4D" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Low Stock Alerts</Text>
          <Text style={styles.subtitle}>Products that need restocking</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={25} color="#B45309" />
          <View style={styles.warningTextWrap}>
            <Text style={styles.warningTitle}>Inventory status</Text>
            <Text style={styles.warningSubtitle}>
              Inventory alerts will appear here when product stock data is available.
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="alert-circle-outline" size={22} color="#D97706" />
            </View>
            <Text style={styles.summaryValue}>{lowCount}</Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, styles.outIcon]}>
              <Ionicons name="close-circle-outline" size={22} color="#DC2626" />
            </View>
            <Text style={styles.summaryValue}>{outCount}</Text>
            <Text style={styles.summaryLabel}>Out of Stock</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products or SKU..."
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
          {(['All', 'Low Stock', 'Out of Stock'] as Filter[]).map((item) => {
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
          <Text style={styles.sectionTitle}>Products to Restock</Text>
          <Text style={styles.resultCount}>{filteredProducts.length} items</Text>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={products.length === 0 ? 'cube-outline' : 'search-outline'}
              size={42}
              color="#94A3B8"
            />
            <Text style={styles.emptyTitle}>
              {products.length === 0 ? 'No inventory data yet' : 'No matching alerts'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {products.length === 0
                ? 'Products needing restock will appear here when inventory data is available.'
                : 'Try another filter or search term.'}
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const outOfStock = product.stock === 0;

            return (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productRow}>
                  <View
                    style={[
                      styles.productIcon,
                      outOfStock && styles.productIconOut,
                    ]}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={24}
                      color={outOfStock ? '#DC2626' : '#D97706'}
                    />
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productMeta}>
                      {product.category} · {product.sku}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        outOfStock ? styles.outBadge : styles.lowBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          outOfStock ? styles.outText : styles.lowText,
                        ]}
                      >
                        {getStatus(product)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.stockDetails}>
                  <View>
                    <Text style={styles.detailLabel}>Current stock</Text>
                    <Text
                      style={[
                        styles.stockValue,
                        outOfStock && styles.outStockValue,
                      ]}
                    >
                      {product.stock} units
                    </Text>
                  </View>
                  <View style={styles.thresholdBox}>
                    <Text style={styles.detailLabel}>Minimum required</Text>
                    <Text style={styles.thresholdValue}>
                      {product.threshold} units
                    </Text>
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          Math.min(
                            100,
                            (product.stock / Math.max(product.threshold, 1)) *
                              100,
                          )
                        }%`,
                      },
                      outOfStock && styles.progressFillOut,
                    ]}
                  />
                </View>

                <Pressable
                  style={styles.restockButton}
                  onPress={() => openRestock(product)}
                >
                  <Ionicons name="add-circle-outline" size={19} color="#FFFFFF" />
                  <Text style={styles.restockButtonText}>Restock Product</Text>
                </Pressable>

                {restockProduct?.id === product.id && (
                  <View style={styles.restockEditor}>
                    <Text style={styles.editorTitle}>Add stock quantity</Text>
                    <TextInput
                      style={styles.quantityInput}
                      value={restockQuantity}
                      onChangeText={setRestockQuantity}
                      keyboardType="number-pad"
                      placeholder="Enter quantity"
                      placeholderTextColor="#94A3B8"
                    />
                    <View style={styles.editorActions}>
                      <Pressable
                        style={styles.cancelButton}
                        onPress={() => setRestockProduct(null)}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={styles.saveButton}
                        onPress={saveRestock}
                      >
                        <Text style={styles.saveText}>Confirm Restock</Text>
                      </Pressable>
                    </View>
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
            Inventory is not connected to live data yet. Restock changes are
            temporary and will reset when the app restarts.
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
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  title: { fontSize: 20, fontWeight: '700', color: '#172B4D' },
  subtitle: { fontSize: 12, color: '#718096', marginTop: 4 },
  content: { padding: 16, paddingBottom: 32 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    backgroundColor: '#FFF5E5',
    borderColor: '#FDE3B0',
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    marginBottom: 14,
  },
  warningTextWrap: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  warningSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#92400E',
    marginTop: 5,
  },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF1D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outIcon: { backgroundColor: '#FEE8E7' },
  summaryValue: { fontSize: 25, fontWeight: '800', color: '#172B4D' },
  summaryLabel: { fontSize: 12, color: '#718096', marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 13,
    paddingHorizontal: 13,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
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
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#172B4D' },
  resultCount: { fontSize: 12, color: '#718096' },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  productRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#FFF1D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productIconOut: { backgroundColor: '#FEE8E7' },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: '#172B4D' },
  productMeta: { fontSize: 11, color: '#718096', marginTop: 5 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 8,
  },
  lowBadge: { backgroundColor: '#FFF1D6' },
  outBadge: { backgroundColor: '#FEE8E7' },
  statusText: { fontSize: 10, fontWeight: '700' },
  lowText: { color: '#B45309' },
  outText: { color: '#B91C1C' },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 12,
  },
  detailLabel: { fontSize: 11, color: '#718096' },
  stockValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 5,
  },
  outStockValue: { color: '#DC2626' },
  thresholdBox: { alignItems: 'flex-end' },
  thresholdValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
    marginTop: 5,
  },
  progressTrack: {
    height: 7,
    borderRadius: 10,
    backgroundColor: '#EDF1F5',
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: {
    height: 7,
    borderRadius: 10,
    backgroundColor: '#D97706',
  },
  progressFillOut: { backgroundColor: '#DC2626' },
  restockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 11,
  },
  restockButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  restockEditor: {
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    padding: 13,
    marginTop: 13,
  },
  editorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 9,
  },
  quantityInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#172B4D',
  },
  editorActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
  },
  cancelText: { color: '#526174', fontWeight: '700', fontSize: 12 },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
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
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 11, lineHeight: 17, color: '#355580' },
});
