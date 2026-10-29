
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
type OfferStatus = 'Active' | 'Inactive' | 'Expired';
type OfferFilter = 'All' | OfferStatus;

type Offer = {
  id: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  startDate: string;
  endDate: string;
  status: OfferStatus;
};


const filters: OfferFilter[] = ['All', 'Active', 'Inactive', 'Expired'];

const emptyForm = {
  name: '',
  description: '',
  discountType: 'Percentage' as DiscountType,
  discountValue: '',
  minOrder: '',
  startDate: '',
  endDate: '',
};

function discountLabel(offer: Offer) {
  return offer.discountType === 'Percentage'
    ? `${offer.discountValue}% OFF`
    : `₹${offer.discountValue} OFF`;
}

export default function OffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<OfferFilter>('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const activeCount = offers.filter((o) => o.status === 'Active').length;
  const inactiveCount = offers.filter((o) => o.status === 'Inactive').length;
  const expiredCount = offers.filter((o) => o.status === 'Expired').length;

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return offers.filter((offer) => {
      const matchesSearch =
        offer.name.toLowerCase().includes(query) ||
        offer.description.toLowerCase().includes(query);

      return matchesSearch && (filter === 'All' || offer.status === filter);
    });
  }, [offers, search, filter]);

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

  function openEditForm(offer: Offer) {
    setEditingId(offer.id);
    setForm({
      name: offer.name,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: String(offer.discountValue),
      minOrder: String(offer.minOrder),
      startDate: offer.startDate,
      endDate: offer.endDate,
    });
    setShowForm(true);
  }

  function saveOffer() {
    const name = form.name.trim();
    const discountValue = Number(form.discountValue);
    const minOrder = Number(form.minOrder);

    if (name.length < 3) {
      Alert.alert('Invalid name', 'Enter an offer name with at least 3 characters.');
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
      !Number.isInteger(minOrder) ||
      minOrder < 0
    ) {
      Alert.alert('Invalid minimum order', 'Enter a valid order amount.');
      return;
    }

    if (!form.startDate.trim() || !form.endDate.trim()) {
      Alert.alert('Dates required', 'Enter both start and end dates.');
      return;
    }

    const offerData = {
      name,
      description: form.description.trim() || 'Special offer',
      discountType: form.discountType,
      discountValue,
      minOrder,
      startDate: form.startDate.trim(),
      endDate: form.endDate.trim(),
    };

    if (editingId) {
      setOffers((current) =>
        current.map((offer) =>
          offer.id === editingId ? { ...offer, ...offerData } : offer,
        ),
      );
    } else {
      setOffers((current) => [
        {
          id: String(Date.now()),
          ...offerData,
          status: 'Active',
        },
        ...current,
      ]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    Alert.alert('Success', editingId ? 'Offer updated.' : 'Offer created.');
  }

  function toggleStatus(offer: Offer, enabled: boolean) {
    if (offer.status === 'Expired' && enabled) {
      Alert.alert('Expired offer', 'Create a new offer with future dates.');
      return;
    }

    setOffers((current) =>
      current.map((item) =>
        item.id === offer.id
          ? { ...item, status: enabled ? 'Active' : 'Inactive' }
          : item,
      ),
    );
  }

  function deleteOffer(offer: Offer) {
    Alert.alert('Delete offer?', `Delete "${offer.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          setOffers((current) => current.filter((item) => item.id !== offer.id)),
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
          <Text style={styles.headerTitle}>Offers</Text>
          <Text style={styles.headerSubtitle}>Manage store promotions</Text>
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
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="pricetags-outline" size={25} color="#FFFFFF" />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Promote your products</Text>
            <Text style={styles.bannerSubtitle}>
              Create offers to encourage customers to shop.
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{offers.length}</Text>
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
                {editingId ? 'Edit Offer' : 'Create Offer'}
              </Text>
              <Pressable onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={23} color="#718096" />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Offer Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="e.g. Festive Special"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.input}
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Describe this offer"
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
              placeholder="e.g. 999"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>Start Date * (e.g. 26 Oct 2026)</Text>
            <TextInput
              style={styles.input}
              value={form.startDate}
              onChangeText={(v) => updateField('startDate', v)}
              placeholder="26 Oct 2026"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.fieldLabel}>End Date * (e.g. 30 Nov 2026)</Text>
            <TextInput
              style={styles.input}
              value={form.endDate}
              onChangeText={(v) => updateField('endDate', v)}
              placeholder="30 Nov 2026"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.formActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={saveOffer}>
                <Text style={styles.saveText}>
                  {editingId ? 'Save Changes' : 'Create Offer'}
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
            placeholder="Search offers..."
            placeholderTextColor="#94A3B8"
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
          <Text style={styles.sectionTitle}>Store Offers</Text>
          <Text style={styles.resultCount}>{filteredOffers.length} offers</Text>
        </View>

        {filteredOffers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Create an offer to get started.</Text>
            <Text style={styles.emptySubtitle}>
              Try another filter or create an offer.
            </Text>
          </View>
        ) : (
          filteredOffers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <View style={styles.offerTop}>
                <View style={styles.offerIcon}>
                  <Ionicons name="pricetag-outline" size={25} color="#059669" />
                </View>
                <View style={styles.offerInfo}>
                  <Text style={styles.offerName}>{offer.name}</Text>
                  <Text style={styles.offerDescription}>{offer.description}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    offer.status === 'Active'
                      ? styles.activeBadge
                      : offer.status === 'Inactive'
                        ? styles.inactiveBadge
                        : styles.expiredBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      offer.status === 'Active'
                        ? styles.activeText
                        : offer.status === 'Inactive'
                          ? styles.inactiveText
                          : styles.expiredText,
                    ]}
                  >
                    {offer.status}
                  </Text>
                </View>
              </View>

              <View style={styles.discountPanel}>
                <Text style={styles.discountLabel}>SPECIAL DISCOUNT</Text>
                <Text style={styles.discountValue}>{discountLabel(offer)}</Text>
                <Text style={styles.minimumText}>
                  On orders above ₹{offer.minOrder}
                </Text>
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateItem}>
                  <Text style={styles.detailLabel}>Starts</Text>
                  <Text style={styles.dateValue}>{offer.startDate}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={styles.detailLabel}>Ends</Text>
                  <Text style={styles.dateValue}>{offer.endDate}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <View style={styles.activeToggle}>
                  <Switch
                    value={offer.status === 'Active'}
                    onValueChange={(value) => toggleStatus(offer, value)}
                    disabled={offer.status === 'Expired'}
                    trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                    thumbColor={offer.status === 'Active' ? '#059669' : '#F8FAFC'}
                  />
                  <Text style={styles.toggleLabel}>Active</Text>
                </View>

                <Pressable
                  style={styles.iconButton}
                  onPress={() => openEditForm(offer)}
                  accessibilityLabel={`Edit ${offer.name}`}
                >
                  <Ionicons name="create-outline" size={19} color="#2563EB" />
                </Pressable>

                <Pressable
                  style={[styles.iconButton, styles.deleteIconButton]}
                  onPress={() => deleteOffer(offer)}
                  accessibilityLabel={`Delete ${offer.name}`}
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
            Offers use demo data stored in app memory. Date fields are text
            inputs for now, and no real discounts are applied to orders.
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
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, paddingBottom: 32 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#047857',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bannerIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  bannerSubtitle: { fontSize: 11, lineHeight: 17, color: '#D1FAE5', marginTop: 4 },
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
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  offerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  offerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DDF8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerInfo: { flex: 1 },
  offerName: { fontSize: 14, fontWeight: '800', color: '#172B4D' },
  offerDescription: { fontSize: 11, color: '#718096', marginTop: 4 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: '700' },
  activeBadge: { backgroundColor: '#DDF8EB' },
  activeText: { color: '#047857' },
  inactiveBadge: { backgroundColor: '#FFF1D6' },
  inactiveText: { color: '#B45309' },
  expiredBadge: { backgroundColor: '#FEE8E7' },
  expiredText: { color: '#B91C1C' },
  discountPanel: {
    backgroundColor: '#E7F8F0',
    borderRadius: 12,
    padding: 14,
    marginTop: 15,
  },
  discountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 1,
  },
  discountValue: { fontSize: 23, fontWeight: '800', color: '#047857', marginTop: 4 },
  minimumText: { fontSize: 11, color: '#047857', marginTop: 3 },
  dateRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  dateItem: { flex: 1 },
  detailLabel: { fontSize: 11, color: '#718096' },
  dateValue: { fontSize: 12, fontWeight: '700', color: '#334155', marginTop: 5 },
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
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#172B4D', marginTop: 10 },
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
