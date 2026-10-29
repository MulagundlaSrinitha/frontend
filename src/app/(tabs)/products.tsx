import type { ViewStyle } from 'react-native';
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
import AppButton from '../../components/ui/AppButton';
import SearchBar from '../../components/ui/SearchBar';
import FilterChips from '../../components/ui/FilterChip';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type ProductFilter = 'All' | ProductStatus;

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};



function getStatus(stock: number): ProductStatus {
  if (stock === 0) return 'Out of Stock';
  if (stock <= 5) return 'Low Stock';
  return 'In Stock';
}

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProductFilter>('All');

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  const resetForm = () => {
    setNewName('');
    setNewCategory('');
    setNewPrice('');
    setNewStock('');
  };

  const cancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  const saveProduct = () => {
    const name = newName.trim();
    const category = newCategory.trim();
    const priceText = newPrice.trim();
    const stockText = newStock.trim();

    const price = Number(priceText);
    const stock = Number(stockText);

    if (!name || !category || !priceText || !stockText) {
      Alert.alert('Missing details', 'Please fill in all product fields.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert('Invalid price', 'Enter a price greater than zero.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      Alert.alert('Invalid stock', 'Enter a whole number of zero or more.');
      return;
    }

    const newProduct: Product = {
      id: `P${Date.now()}`,
      name,
      category,
      price,
      stock,
    };

    setProducts((current) => [...current, newProduct]);
    setSearch('');
    setFilter('All');
    resetForm();
    setShowForm(false);

    Alert.alert('Success', `${name} added to your product list.`);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query);

      const matchesFilter =
        filter === 'All' || getStatus(product.stock) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const lowStockCount = products.filter(
    (product) => product.stock <= 5,
  ).length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>NEXT360 VENDOR</Text>
            <Text style={styles.title}>Products</Text>
            <Text style={styles.subtitle}>
              Manage your store inventory
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="cube-outline" size={25} color="#059669" />
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Ionicons name="layers-outline" size={22} color="#059669" />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Total Products</Text>
            <Text style={styles.summaryValue}>{products.length}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Low / No Stock</Text>
            <Text style={styles.summaryValue}>{lowStockCount}</Text>
          </View>
        </View>

        {/*<Pressable
          style={styles.addButton}
          onPress={() => setShowForm((current) => !current)}
        >
          <Ionicons
            name={showForm ? 'close-circle-outline' : 'add-circle-outline'}
            size={21}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>
            {showForm ? 'Close Form' : 'Add Product'}
          </Text>
        </Pressable>*/}
        {/*<AppButton
            title={showForm ? 'Close Form' : 'Add Product'}
            onPress={() => setShowForm((current) => !current)}
            variant="primary"
            style={{ marginBottom: 16 }}
        />*/}
        <View style={{ marginBottom: 16 }}>
          <AppButton
            title={showForm ? 'Close Form' : 'Add Product'}
            onPress={() => setShowForm((current) => !current)}
            variant="primary"
          />
        </View>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Product</Text>
            <Text style={styles.formSubtitle}>
              Enter the product details below.
            </Text>

            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Wireless Headphones"
              placeholderTextColor="#94A3B8"
              value={newName}
              onChangeText={setNewName}
              maxLength={100}
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Electronics"
              placeholderTextColor="#94A3B8"
              value={newCategory}
              onChangeText={setNewCategory}
              maxLength={60}
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Price (₹)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter price"
              placeholderTextColor="#94A3B8"
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="decimal-pad"
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Stock Quantity</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter available units"
              placeholderTextColor="#94A3B8"
              value={newStock}
              onChangeText={setNewStock}
              keyboardType="number-pad"
              returnKeyType="done"
            />

            <Pressable style={styles.saveButton} onPress={saveProduct}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Save Product</Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={cancelForm}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {/*<View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products or categories"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={19} color="#94A3B8" />
            </Pressable>
          )}
        </View>*/}

        <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search products or categories"
            style={styles.searchBox as ViewStyle}
        />


        <Text style={styles.sectionTitle}>Inventory</Text>

        {/*<ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map(
            (item) => (
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
            ),
          )}
        </ScrollView>
        */}
        
        <FilterChips
            options={['All', 'In Stock', 'Low Stock', 'Out of Stock']}
            selected={filter}
            onSelect={(value) => setFilter(value as ProductFilter)}
            style={styles.filters as ViewStyle}
        />


        <Text style={styles.resultCount}>
          {filteredProducts.length} products found
        </Text>

        {/*{filteredProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>
              Try another search or inventory filter.
            </Text>
          </View>
        ) : (*/}
        {filteredProducts.length === 0 ? (
           <EmptyState
              title={products.length === 0 ? 'No products yet' : 'No products found'}
              message={
                products.length === 0
                  ? 'Your products will appear here once you add them.'
                  : 'Try another search or inventory filter.'
              }
              icon={products.length === 0 ? 'cube-outline' : 'search-outline'}
              style={styles.emptyCard as ViewStyle}
            />
        ) : (
          filteredProducts.map((product) => {
            const status = getStatus(product.stock);

            return (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productTop}>
                  <View style={styles.productIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={25}
                      color="#059669"
                    />
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productCategory}>
                      {product.category} · {product.id}
                    </Text>
                  </View>
                </View>

                <View style={styles.productBottom}>
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>Price</Text>
                    <Text style={styles.price}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>Stock</Text>
                    <Text style={styles.stock}>{product.stock} units</Text>
                  </View>

                  {/*<View
                    style={[
                      styles.statusBadge,
                      status === 'In Stock' && styles.inStock,
                      status === 'Low Stock' && styles.lowStock,
                      status === 'Out of Stock' && styles.outOfStock,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        status === 'In Stock' && styles.inStockText,
                        status === 'Low Stock' && styles.lowStockText,
                        status === 'Out of Stock' && styles.outOfStockText,
                      ]}
                    >
                      {status}
                    </Text>
                  </View>*/}
                  <StatusBadge status={status} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  addButton: {
    minHeight: 48,
    backgroundColor: '#059669',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 7,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    color: '#111827',
    fontSize: 14,
  },
  saveButton: {
    minHeight: 48,
    backgroundColor: '#059669',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 13,
    marginTop: 3,
  },
  cancelText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
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
  searchInput: {
    flex: 1,
    color: '#111827',
    fontSize: 13,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  filters: {
    gap: 8,
    paddingBottom: 12,
  },
  resultCount: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  productTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  productIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  productCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },
  productBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 14,
    paddingTop: 12,
    gap: 8,
  },
  detailBlock: {
    flexShrink: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 5,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  stock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  
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
