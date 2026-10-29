
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type DiscountType = 'Percentage' | 'Fixed Amount';
type CouponStatus = 'Active' | 'Inactive' | 'Expired';

type Coupon = {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  usageLimit: number;
  used: number;
  expiryDate: string;
  status: CouponStatus;
};

type CouponFilter = 'All' | CouponStatus;


const filters: CouponFilter[] = ['All', 'Active', 'Inactive', 'Expired'];

const emptyForm = {
  code: '',
  description: '',
  discountType: 'Percentage' as DiscountType,
  discountValue: '',
  minOrder: '',
  usageLimit: '',
  expiryDate: '',
};

function formatDiscount(coupon: Coupon) {
  return coupon.discountType === 'Percentage'
    ? `${coupon.discountValue}% OFF`
    : `₹${coupon.discountValue} OFF`;
}

export default function CouponsScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CouponFilter>('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const activeCount = coupons.filter((c) => c.status === 'Active').length;
  const inactiveCount = coupons.filter((c) => c.status === 'Inactive').length;
  const expiredCount = coupons.filter((c) => c.status === 'Expired').length;

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        coupon.code.toLowerCase().includes(query) ||
        coupon.description.toLowerCase().includes(query);

      return matchesSearch && (filter === 'All' || coupon.status === filter);
    });
  }, [coupons, search, filter]);

  function updateField<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrder: String(coupon.minOrder),
      usageLimit: String(coupon.usageLimit),
      expiryDate: coupon.expiryDate,
    });
    setShowForm(true);
  }

  function saveCoupon() {
    const code = form.code.trim().toUpperCase();
    const discountValue = Number(form.discountValue);
    const minOrder = Number(form.minOrder);
    const usageLimit = Number(form.usageLimit);

    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
      Alert.alert(
        'Invalid coupon code',
        'Use 3–20 letters, numbers, hyphens or underscores.',
      );
      return;
    }

    if (
      form.discountValue.trim() === '' ||
      !Number.isFinite(discountValue) ||
      discountValue <= 0 ||
      (form.discountType === 'Percentage' && discountValue > 100)
    ) {
      Alert.alert(
        'Invalid discount',
        'Enter a positive discount. Percentage cannot exceed 100.',
      );
      return;
    }

    if (
      form.minOrder.trim() === '' ||
      !Number.isFinite(minOrder) ||
      minOrder < 0 ||
      !Number.isInteger(minOrder)
    ) {
      Alert.alert('Invalid minimum order', 'Enter a valid minimum order value.');
      return;
    }

    if (
      form.usageLimit.trim() === '' ||
      !Number.isInteger(usageLimit) ||
      usageLimit <= 0
    ) {
      Alert.alert('Invalid usage limit', 'Enter a whole number greater than 0.');
      return;
    }

    if (!form.expiryDate.trim()) {
      Alert.alert('Expiry date required', 'Enter the coupon expiry date.');
      return;
    }

    const duplicate = coupons.some(
      (coupon) =>
        coupon.code.toUpperCase() === code && coupon.id !== editingId,
    );

    if (duplicate) {
      Alert.alert('Coupon already exists', 'Choose a different coupon code.');
      return;
    }

    const couponData = {
      code,
      description: form.description.trim() || 'Special discount',
      discountType: form.discountType,
      discountValue,
      minOrder,
      usageLimit,
      expiryDate: form.expiryDate.trim(),
    };

    if (editingId) {
      setCoupons((current) =>
        current.map((coupon) =>
          coupon.id === editingId ? { ...coupon, ...couponData } : coupon,
        ),
      );
    } else {
      setCoupons((current) => [
        {
          id: String(Date.now()),
          ...couponData,
          used: 0,
          status: 'Active',
        },
        ...current,
      ]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    Alert.alert('Success', editingId ? 'Coupon updated.' : 'Coupon created.');
  }

  function toggleStatus(coupon: Coupon, enabled: boolean) {
    if (coupon.status === 'Expired' && enabled) {
      Alert.alert('Expired coupon', 'Create a new coupon for a new promotion.');
      return;
    }

    setCoupons((current) =>
      current.map((item) =>
        item.id === coupon.id
          ? { ...item, status: enabled ? 'Active' : 'Inactive' }
          : item,
      ),
    );
  }

  function deleteCoupon(coupon: Coupon) {
    Alert.alert('Delete coupon?', `Delete ${coupon.code}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setCoupons((current) =>
            current.filter((item) => item.id !== coupon.id),
          );
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#172B4D" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Coupons</Text>
          <Text style={styles.headerSubtitle}>Manage discount codes</Text>
        </View>
        <Pressable style={styles.addButton} onPress={openCreateForm}>
          <Ionicons name="add" size={23} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{coupons.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>
              {activeCount}
            </Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: '#D97706' }]}>
              {inactiveCount}
            </Text>
            <Text style={styles.summaryLabel}>Inactive</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: '#DC2626' }]}>
              {expiredCount}
            </Text>
            <Text style={styles.summaryLabel}>Expired</Text>
          </View>
        </View>

        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingId ? 'Edit Coupon' : 'Create Coupon'}
              </Text>
              <Pressable onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={23} color="#718096" />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Coupon Code *</Text>
            <TextInput
              style={styles.input}
              value={form.code}
              onChangeText={(v) => updateField('code', v.toUpperCase())}
              placeholder="e.g. SAVE10"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              maxLength={20}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.input}
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Describe this coupon"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.fieldLabel}>Discount Type *</Text>
            <View style={styles.typeRow}>
              {(['Percentage', 'Fixed Amount'] as DiscountType[]).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => updateField('discountType', type)}
                  style={[
                    styles.typeButton,
                    form.discountType === type && styles.typeButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      form.discountType === type && styles.typeTextSelected,
                    ]}
                  >
                    {type === 'Percentage' ? '% Percentage' : '₹ Fixed Amount'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>
              Discount Value * {form.discountType === 'Percentage' ? '(%)' : '(₹)'}
            </Text>
            <TextInput
              style={styles.input}
              value={form.discountValue}
              onChangeText={(v) => updateField('discountValue', v)}
              placeholder="Enter discount"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Minimum Order Value (₹) *</Text>
            <TextInput
              style={styles.input}
              value={form.minOrder}
              onChangeText={(v) => updateField('minOrder', v)}
              placeholder="e.g. 499"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>Usage Limit *</Text>
            <TextInput
              style={styles.input}
              value={form.usageLimit}
              onChangeText={(v) => updateField('usageLimit', v)}
              placeholder="e.g. 100"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>Expiry Date * (e.g. 31 Dec 2026)</Text>
            <TextInput
              style={styles.input}
              value={form.expiryDate}
              onChangeText={(v) => updateField('expiryDate', v)}
              placeholder="31 Dec 2026"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
            />

            <View style={styles.formActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={saveCoupon}>
                <Text style={styles.saveText}>
                  {editingId ? 'Save Changes' : 'Create Coupon'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search coupon code..."
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
          <Text style={styles.sectionTitle}>Your Coupons</Text>
          <Text style={styles.resultCount}>{filteredCoupons.length} coupons</Text>
        </View>

       {filteredCoupons.length === 0 ? (
  <View style={styles.emptyState}>
    <Ionicons
      name="pricetag-outline"
      size={40}
      color="#94A3B8"
    />

    <Text style={styles.emptyTitle}>
      {coupons.length === 0 ? 'No coupons yet' : 'No coupons found'}
    </Text>

    <Text style={styles.emptySubtitle}>
      {coupons.length === 0
        ? 'Create your first coupon to offer discounts to customers.'
        : 'Try another filter or search for a different coupon.'}
    </Text>
  </View>
) : (
          filteredCoupons.map((coupon) => (
            <View key={coupon.id} style={styles.couponCard}>
              <View style={styles.couponTop}>
                <View style={styles.discountBox}>
                  <Text style={styles.discountValue}>
                    {coupon.discountValue}
                    {coupon.discountType === 'Percentage' ? '%' : ''}
                  </Text>
                  <Text style={styles.discountLabel}>
                    {coupon.discountType === 'Percentage' ? 'OFF' : 'RUPEES OFF'}
                  </Text>
                </View>

                <View style={styles.couponInfo}>
                  <Text style={styles.couponCode}>{coupon.code}</Text>
                  <Text style={styles.couponDescription}>
                    {coupon.description}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      coupon.status === 'Active'
                        ? styles.activeBadge
                        : coupon.status === 'Inactive'
                          ? styles.inactiveBadge
                          : styles.expiredBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        coupon.status === 'Active'
                          ? styles.activeText
                          : coupon.status === 'Inactive'
                            ? styles.inactiveText
                            : styles.expiredText,
                      ]}
                    >
                      {coupon.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.couponDetails}>
                <View>
                  <Text style={styles.detailLabel}>Minimum order</Text>
                  <Text style={styles.detailValue}>
                    {formatDiscount(coupon)} · ₹{coupon.minOrder}+
                  </Text>
                </View>
                <View style={styles.usageBox}>
                  <Text style={styles.detailLabel}>Usage</Text>
                  <Text style={styles.detailValue}>
                    {coupon.used}/{coupon.usageLimit}
                  </Text>
                </View>
              </View>

              <View style={styles.usageTrack}>
                <View
                  style={[
                    styles.usageFill,
                    {
                      width: `${
                        Math.min(
                          100,
                          (coupon.used / Math.max(coupon.usageLimit, 1)) * 100,
                        )
                      }%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.expiryRow}>
                <Ionicons name="calendar-outline" size={15} color="#718096" />
                <Text style={styles.expiryText}>
                  Expires: {coupon.expiryDate}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <View style={styles.activeToggle}>
                  <Switch
                    value={coupon.status === 'Active'}
                    onValueChange={(value) => toggleStatus(coupon, value)}
                    trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                    thumbColor={coupon.status === 'Active' ? '#059669' : '#F8FAFC'}
                    disabled={coupon.status === 'Expired'}
                  />
                  <Text style={styles.toggleLabel}>Active</Text>
                </View>

                <Pressable
                  style={styles.iconButton}
                  onPress={() => openEditForm(coupon)}
                  accessibilityLabel={`Edit ${coupon.code}`}
                >
                  <Ionicons name="create-outline" size={19} color="#2563EB" />
                </Pressable>

                <Pressable
                  style={[styles.iconButton, styles.deleteIconButton]}
                  onPress={() => deleteCoupon(coupon)}
                  accessibilityLabel={`Delete ${coupon.code}`}
                >
                  <Ionicons name="trash-outline" size={19} color="#DC2626" />
                </Pressable>
              </View>
            </View>
          ))
        )}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
          <Text style={styles.infoText}>
            Coupons are stored in local app state for now. Discounts are not
            applied to real orders until backend integration is added.
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
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
  },
  content: { padding: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    borderRadius: 14,
    padding: 12,
  },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#172B4D' },
  summaryLabel: { fontSize: 10, color: '#718096', marginTop: 4 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE4ED',
    padding: 15,
    marginBottom: 18,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  formTitle: { fontSize: 17, fontWeight: '800', color: '#172B4D' },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 13,
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCE4ED',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#172B4D',
    fontSize: 13,
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 10,
    padding: 11,
    alignItems: 'center',
  },
  typeButtonSelected: { borderColor: '#059669', backgroundColor: '#E7F8F0' },
  typeText: { fontSize: 11, fontWeight: '600', color: '#526174' },
  typeTextSelected: { color: '#047857' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelButton: {
    flex: 1,
    padding: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE4ED',
    borderRadius: 10,
  },
  cancelText: { color: '#526174', fontSize: 12, fontWeight: '700' },
  saveButton: {
    flex: 1,
    padding: 13,
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 10,
  },
  saveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
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
  resultCount: { color: '#718096', fontSize: 12 },
  couponCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  couponTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  discountBox: {
    width: 75,
    height: 78,
    borderRadius: 13,
    backgroundColor: '#E7F8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountValue: { fontSize: 23, fontWeight: '800', color: '#047857' },
  discountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    marginTop: 2,
  },
  couponInfo: { flex: 1 },
  couponCode: { fontSize: 16, fontWeight: '800', color: '#172B4D' },
  couponDescription: { fontSize: 11, color: '#718096', marginTop: 4 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 7,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  activeBadge: { backgroundColor: '#DDF8EB' },
  activeText: { color: '#047857' },
  inactiveBadge: { backgroundColor: '#FFF1D6' },
  inactiveText: { color: '#B45309' },
  expiredBadge: { backgroundColor: '#FEE8E7' },
  expiredText: { color: '#B91C1C' },
  couponDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  usageBox: { alignItems: 'flex-end' },
  detailLabel: { fontSize: 11, color: '#718096' },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 5,
  },
  usageTrack: {
    height: 6,
    borderRadius: 10,
    backgroundColor: '#EDF1F5',
    overflow: 'hidden',
    marginTop: 11,
  },
  usageFill: { height: 6, borderRadius: 10, backgroundColor: '#059669' },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 },
  expiryText: { fontSize: 11, color: '#718096' },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    marginTop: 13,
    paddingTop: 10,
  },
  activeToggle: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { fontSize: 11, fontWeight: '600', color: '#526174' },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconButton: { backgroundColor: '#FEE8E7' },
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
  infoText: { flex: 1, fontSize: 11, lineHeight: 17, color: '#355580' },
});
