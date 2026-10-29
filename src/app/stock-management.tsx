
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type Filter = 'All' | StockStatus;

type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  threshold: number;
};

function getStatus(product: Product): StockStatus {
  if (product.stock === 0) return 'Out of Stock';
  if (product.stock <= product.threshold) return 'Low Stock';
  return 'In Stock';
}

export default function StockManagementScreen() {
  // No dummy products. Connect the real inventory API when ready.
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');

  const counts = useMemo(
    () => ({
      total: products.length,
      low: products.filter((p) => getStatus(p) === 'Low Stock').length,
      out: products.filter((p) => getStatus(p) === 'Out of Stock').length,
      units: products.reduce((sum, p) => sum + p.stock, 0),
    }),
    [products],
  );

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

  function startEditing(product: Product) {
    setEditingProduct(product);
    setQuantity(String(product.stock));
  }

  function saveStock() {
    const nextQuantity = Number(quantity);

    if (
      quantity.trim() === '' ||
      !Number.isInteger(nextQuantity) ||
      nextQuantity < 0
    ) {
      Alert.alert(
        'Invalid quantity',
        'Enter a valid whole number greater than or equal to 0.',
      );
      return;
    }

    if (!editingProduct) return;

    setProducts((current) =>
      current.map((product) =>
        product.id === editingProduct.id
          ? { ...product, stock: nextQuantity }
          : product,
      ),
    );

    setEditingProduct(null);
    setQuantity('');
    Alert.alert('Stock updated', 'Product quantity updated successfully.');
  }

  function adjustQuantity(amount: number) {
    const current = Number(quantity || 0);
    setQuantity(String(Math.max(0, current + amount)));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#172B4D" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Stock Management</Text>
          <Text style={styles.headerSubtitle}>
            Monitor and update product inventory
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
            <View style={[styles.iconBox, { backgroundColor: '#E8F1FF' }]}>
              <Ionicons name="cube-outline" size={21} color="#2563EB" />
            </View>
            <Text style={styles.summaryValue}>{counts.total}</Text>
            <Text style={styles.summaryLabel}>Products</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3D6' }]}>
              <Ionicons name="alert-circle-outline" size={21} color="#D97706" />
            </View>
            <Text style={styles.summaryValue}>{counts.low}</Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FEE8E7' }]}>
              <Ionicons name="close-circle-outline" size={21} color="#DC2626" />
            </View>
            <Text style={styles.summaryValue}>{counts.out}</Text>
            <Text style={styles.summaryLabel}>Out of Stock</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#DDF8EB' }]}>
              <Ionicons name="layers-outline" size={21} color="#059669" />
            </View>
            <Text style={styles.summaryValue}>{counts.units}</Text>
            <Text style={styles.summaryLabel}>Total Units</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product, SKU or category..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={19} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as Filter[]).map(
            (item) => {
              const selected = filter === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <Text style={styles.resultCount}>
            {filteredProducts.length} products
          </Text>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={38} color="#94A3B8" />
            <Text style={styles.emptyTitle}>
              {search.trim() ? 'No products found' : 'No inventory yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search.trim()
                ? 'Try another search or change the filter.'
                : 'Your inventory will appear here when products are connected.'}
            </Text>
            {search.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearch('');
                  setFilter('All');
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear search and filters</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredProducts.map((product) => {
            const status = getStatus(product);

            const statusStyle =
              status === 'In Stock'
                ? styles.inStockBadge
                : status === 'Low Stock'
                  ? styles.lowStockBadge
                  : styles.outStockBadge;

            const statusTextStyle =
              status === 'In Stock'
                ? styles.inStockText
                : status === 'Low Stock'
                  ? styles.lowStockText
                  : styles.outStockText;

            return (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productTop}>
                  <View style={styles.productIcon}>
                    <Ionicons name="cube-outline" size={24} color="#059669" />
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productMeta}>
                      {product.category} · SKU: {product.sku}
                    </Text>
                  </View>
                </View>

                <View style={styles.stockRow}>
                  <View>
                    <Text style={styles.stockLabel}>Available quantity</Text>
                    <View style={styles.quantityRow}>
                      <Text style={styles.quantityValue}>{product.stock}</Text>
                      <Text style={styles.quantityUnit}> units</Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, statusStyle]}>
                    <Text style={[styles.statusText, statusTextStyle]}>
                      {status}
                    </Text>
                  </View>
                </View>

                <View style={styles.productFooter}>
                  <Text style={styles.thresholdText}>
                    Alert threshold: {product.threshold} units
                  </Text>

                  <Pressable
                    style={styles.updateButton}
                    onPress={() => startEditing(product)}
                  >
                    <Ionicons name="create-outline" size={17} color="#FFFFFF" />
                    <Text style={styles.updateButtonText}>Update Stock</Text>
                  </Pressable>
                </View>

                {editingProduct?.id === product.id && (
                  <View style={styles.editor}>
                    <Text style={styles.editorTitle}>
                      Update {product.name}
                    </Text>

                    <View style={styles.quantityEditor}>
                      <Pressable
                        style={styles.adjustButton}
                        onPress={() => adjustQuantity(-1)}
                        accessibilityLabel="Decrease quantity"
                      >
                        <Ionicons name="remove" size={22} color="#172B4D" />
                      </Pressable>

                      <TextInput
                        style={styles.quantityInput}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="number-pad"
                        selectTextOnFocus
                        accessibilityLabel="Stock quantity"
                      />

                      <Pressable
                        style={styles.adjustButton}
                        onPress={() => adjustQuantity(1)}
                        accessibilityLabel="Increase quantity"
                      >
                        <Ionicons name="add" size={22} color="#172B4D" />
                      </Pressable>
                    </View>

                    <View style={styles.editorActions}>
                      <Pressable
                        style={styles.cancelButton}
                        onPress={() => {
                          setEditingProduct(null);
                          setQuantity('');
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </Pressable>

                      <Pressable
                        style={styles.saveButton}
                        onPress={saveStock}
                      >
                        <Text style={styles.saveButtonText}>Save Stock</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2563EB"
          />
          <Text style={styles.noteText}>
            Inventory is not connected to the backend yet. Stock changes are
            not persisted. Connect the inventory API to load and save real stock.
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
    paddingBottom: 100,
  },
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
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172B4D',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
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
  filters: {
    gap: 8,
    paddingBottom: 18,
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE4ED',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  filterChipSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterText: {
    color: '#526174',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172B4D',
  },
  resultCount: {
    color: '#718096',
    fontSize: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  productTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#E7F8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
  },
  productMeta: {
    fontSize: 11,
    color: '#718096',
    marginTop: 5,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  stockLabel: {
    fontSize: 11,
    color: '#718096',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 3,
  },
  quantityValue: {
    fontSize: 23,
    fontWeight: '800',
    color: '#172B4D',
  },
  quantityUnit: {
    fontSize: 12,
    color: '#718096',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inStockBadge: {
    backgroundColor: '#DDF8EB',
  },
  inStockText: {
    color: '#047857',
  },
  lowStockBadge: {
    backgroundColor: '#FFF1D6',
  },
  lowStockText: {
    color: '#B45309',
  },
  outStockBadge: {
    backgroundColor: '#FEE8E7',
  },
  outStockText: {
    color: '#B91C1C',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 13,
  },
  thresholdText: {
    fontSize: 10,
    color: '#718096',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
  },
  updateButtonText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  editor: {
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    padding: 13,
    marginTop: 14,
  },
  editorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 12,
  },
  quantityEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  adjustButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    minWidth: 85,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 12,
    padding: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#172B4D',
  },
  editorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 13,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 10,
    padding: 12,
  },
  cancelButtonText: {
    color: '#526174',
    fontSize: 12,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 10,
    padding: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 18,
  },
  clearButton: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#E7F8F0',
  },
  clearButtonText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
    backgroundColor: '#EAF2FF',
    borderRadius: 12,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    color: '#355580',
    fontSize: 11,
    lineHeight: 17,
  },
});

/*
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  threshold: number;
};

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    category: 'Electronics',
    sku: 'ELEC-001',
    stock: 24,
    threshold: 10,
  },
  {
    id: '2',
    name: 'Cotton T-Shirt',
    category: 'Fashion',
    sku: 'FASH-002',
    stock: 6,
    threshold: 10,
  },
  {
    id: '3',
    name: 'Smart Watch',
    category: 'Electronics',
    sku: 'ELEC-003',
    stock: 0,
    threshold: 5,
  },
  {
    id: '4',
    name: 'Travel Backpack',
    category: 'Accessories',
    sku: 'ACCS-004',
    stock: 15,
    threshold: 5,
  },
  {
    id: '5',
    name: 'Bluetooth Speaker',
    category: 'Electronics',
    sku: 'ELEC-005',
    stock: 3,
    threshold: 8,
  },
];

type Filter = 'All' | StockStatus;

function getStatus(product: Product): StockStatus {
  if (product.stock === 0) return 'Out of Stock';
  if (product.stock <= product.threshold) return 'Low Stock';
  return 'In Stock';
}

export default function StockManagementScreen() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');

  const counts = useMemo(
    () => ({
      total: products.length,
      low: products.filter((p) => getStatus(p) === 'Low Stock').length,
      out: products.filter((p) => getStatus(p) === 'Out of Stock').length,
      units: products.reduce((sum, p) => sum + p.stock, 0),
    }),
    [products],
  );

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

  function startEditing(product: Product) {
    setEditingProduct(product);
    setQuantity(String(product.stock));
  }

  function saveStock() {
    const nextQuantity = Number(quantity);

    if (
      quantity.trim() === '' ||
      !Number.isInteger(nextQuantity) ||
      nextQuantity < 0
    ) {
      Alert.alert(
        'Invalid quantity',
        'Enter a valid whole number greater than or equal to 0.',
      );
      return;
    }

    if (!editingProduct) return;

    setProducts((current) =>
      current.map((product) =>
        product.id === editingProduct.id
          ? { ...product, stock: nextQuantity }
          : product,
      ),
    );

    setEditingProduct(null);
    setQuantity('');

    Alert.alert('Stock updated', 'Product quantity updated successfully.');
  }

  function adjustQuantity(amount: number) {
    const current = Number(quantity || 0);
    setQuantity(String(Math.max(0, current + amount)));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#172B4D" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Stock Management</Text>
          <Text style={styles.headerSubtitle}>
            Monitor and update product inventory
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
            <View style={[styles.iconBox, { backgroundColor: '#E8F1FF' }]}>
              <Ionicons name="cube-outline" size={21} color="#2563EB" />
            </View>
            <Text style={styles.summaryValue}>{counts.total}</Text>
            <Text style={styles.summaryLabel}>Products</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3D6' }]}>
              <Ionicons name="alert-circle-outline" size={21} color="#D97706" />
            </View>
            <Text style={styles.summaryValue}>{counts.low}</Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FEE8E7' }]}>
              <Ionicons name="close-circle-outline" size={21} color="#DC2626" />
            </View>
            <Text style={styles.summaryValue}>{counts.out}</Text>
            <Text style={styles.summaryLabel}>Out of Stock</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#DDF8EB' }]}>
              <Ionicons name="layers-outline" size={21} color="#059669" />
            </View>
            <Text style={styles.summaryValue}>{counts.units}</Text>
            <Text style={styles.summaryLabel}>Total Units</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product, SKU or category..."
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
          {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as Filter[]).map(
            (item) => {
              const selected = filter === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <Text style={styles.resultCount}>
            {filteredProducts.length} products
          </Text>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try another search or change the filter.
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const status = getStatus(product);

            const statusStyle =
              status === 'In Stock'
                ? styles.inStockBadge
                : status === 'Low Stock'
                  ? styles.lowStockBadge
                  : styles.outStockBadge;

            const statusTextStyle =
              status === 'In Stock'
                ? styles.inStockText
                : status === 'Low Stock'
                  ? styles.lowStockText
                  : styles.outStockText;

            return (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productTop}>
                  <View style={styles.productIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={24}
                      color="#059669"
                    />
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productMeta}>
                      {product.category} · SKU: {product.sku}
                    </Text>
                  </View>
                </View>

                <View style={styles.stockRow}>
                  <View>
                    <Text style={styles.stockLabel}>Available quantity</Text>
                    <View style={styles.quantityRow}>
                      <Text style={styles.quantityValue}>{product.stock}</Text>
                      <Text style={styles.quantityUnit}> units</Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, statusStyle]}>
                    <Text style={[styles.statusText, statusTextStyle]}>
                      {status}
                    </Text>
                  </View>
                </View>

                <View style={styles.productFooter}>
                  <Text style={styles.thresholdText}>
                    Alert threshold: {product.threshold} units
                  </Text>

                  <Pressable
                    style={styles.updateButton}
                    onPress={() => startEditing(product)}
                  >
                    <Ionicons name="create-outline" size={17} color="#FFFFFF" />
                    <Text style={styles.updateButtonText}>Update Stock</Text>
                  </Pressable>
                </View>

                {editingProduct?.id === product.id && (
                  <View style={styles.editor}>
                    <Text style={styles.editorTitle}>
                      Update {product.name}
                    </Text>

                    <View style={styles.quantityEditor}>
                      <Pressable
                        style={styles.adjustButton}
                        onPress={() => adjustQuantity(-1)}
                      >
                        <Ionicons name="remove" size={22} color="#172B4D" />
                      </Pressable>

                      <TextInput
                        style={styles.quantityInput}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="number-pad"
                        selectTextOnFocus
                        accessibilityLabel="Stock quantity"
                      />

                      <Pressable
                        style={styles.adjustButton}
                        onPress={() => adjustQuantity(1)}
                      >
                        <Ionicons name="add" size={22} color="#172B4D" />
                      </Pressable>
                    </View>

                    <View style={styles.editorActions}>
                      <Pressable
                        style={styles.cancelButton}
                        onPress={() => {
                          setEditingProduct(null);
                          setQuantity('');
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </Pressable>

                      <Pressable
                        style={styles.saveButton}
                        onPress={saveStock}
                      >
                        <Text style={styles.saveButtonText}>Save Stock</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
          <Text style={styles.noteText}>
            Stock changes are currently saved in app memory only. They will
            reset when the app restarts. We will connect the backend later.
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
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172B4D',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
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
  filters: {
    gap: 8,
    paddingBottom: 18,
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE4ED',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  filterChipSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterText: {
    color: '#526174',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172B4D',
  },
  resultCount: {
    color: '#718096',
    fontSize: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  productTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#E7F8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
  },
  productMeta: {
    fontSize: 11,
    color: '#718096',
    marginTop: 5,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  stockLabel: {
    fontSize: 11,
    color: '#718096',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 3,
  },
  quantityValue: {
    fontSize: 23,
    fontWeight: '800',
    color: '#172B4D',
  },
  quantityUnit: {
    fontSize: 12,
    color: '#718096',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inStockBadge: {
    backgroundColor: '#DDF8EB',
  },
  inStockText: {
    color: '#047857',
  },
  lowStockBadge: {
    backgroundColor: '#FFF1D6',
  },
  lowStockText: {
    color: '#B45309',
  },
  outStockBadge: {
    backgroundColor: '#FEE8E7',
  },
  outStockText: {
    color: '#B91C1C',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 13,
  },
  thresholdText: {
    fontSize: 10,
    color: '#718096',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
  },
  updateButtonText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  editor: {
    backgroundColor: '#F6F8FB',
    borderRadius: 12,
    padding: 13,
    marginTop: 14,
  },
  editorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 12,
  },
  quantityEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  adjustButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    minWidth: 85,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 12,
    padding: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#172B4D',
  },
  editorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 13,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 10,
    padding: 12,
  },
  cancelButtonText: {
    color: '#526174',
    fontSize: 12,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 10,
    padding: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
    backgroundColor: '#EAF2FF',
    borderRadius: 12,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    color: '#355580',
    fontSize: 11,
    lineHeight: 17,
  },
});
*/