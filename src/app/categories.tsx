
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type Category = {
  id: string;
  name: string;
  description: string;
  productCount: number;
  active: boolean;
};


export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const filteredCategories = categories.filter((category) => {
    const query = search.trim().toLowerCase();

    return (
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query)
    );
  });

  const openAddForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setShowForm(true);
  };

  const openEditForm = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required field', 'Please enter a category name.');
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        category.id !== editingId,
    );

    if (duplicate) {
      Alert.alert('Category exists', 'Please enter a different category name.');
      return;
    }

    if (editingId) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingId
            ? {
                ...category,
                name: name.trim(),
                description: description.trim(),
              }
            : category,
        ),
      );
    } else {
      const newCategory: Category = {
        id: `${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        productCount: 0,
        active: true,
      };

      setCategories((current) => [newCategory, ...current]);
    }

    setShowForm(false);
    setEditingId(null);
    setName('');
    setDescription('');

    Alert.alert(
      'Success',
      editingId ? 'Category updated successfully.' : 'Category added successfully.',
    );
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const toggleStatus = (id: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === id
          ? { ...category, active: !category.active }
          : category,
      ),
    );
  };

  const confirmDelete = (category: Category) => {
    Alert.alert(
      'Delete category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCategories((current) =>
              current.filter((item) => item.id !== category.id),
            );
          },
        },
      ],
    );
  };

  const activeCount = categories.filter((item) => item.active).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={23} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>
            Organize your store products
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={openAddForm}
        >
          <Ionicons name="add" size={25} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="grid-outline" size={21} color="#059669" />
            </View>
            <Text style={styles.summaryNumber}>{categories.length}</Text>
            <Text style={styles.summaryLabel}>Total Categories</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, styles.activeIcon]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#2563EB"
              />
            </View>
            <Text style={styles.summaryNumber}>{activeCount}</Text>
            <Text style={styles.summaryLabel}>Active Categories</Text>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={19} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.listHeading}>
          <View>
            <Text style={styles.sectionTitle}>All Categories</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredCategories.length} categories found
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addTextButton}
            onPress={openAddForm}
          >
            <Ionicons name="add-circle-outline" size={19} color="#059669" />
            <Text style={styles.addText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId ? 'Edit Category' : 'Add New Category'}
            </Text>

            <Text style={styles.label}>Category Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter category name"
              placeholderTextColor="#94A3B8"
              maxLength={60}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter category description"
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              maxLength={200}
            />

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={19}
                  color="#FFFFFF"
                />
                <Text style={styles.saveText}>
                  {editingId ? 'Update' : 'Save Category'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {filteredCategories.length === 0 ? (
  <View style={styles.emptyState}>
    <Ionicons
      name="file-tray-outline"
      size={45}
      color="#94A3B8"
    />

    <Text style={styles.emptyTitle}>
      {categories.length === 0
        ? 'No categories yet'
        : 'No categories found'}
    </Text>

    <Text style={styles.emptyDescription}>
      {categories.length === 0
        ? 'Add your first category to organize your store products.'
        : 'Try another search or add a new category.'}
    </Text>

    <TouchableOpacity
      style={styles.emptyButton}
      onPress={openAddForm}
    >
      <Text style={styles.emptyButtonText}>Add Category</Text>
    </TouchableOpacity>
  </View>
) : (
          filteredCategories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryTop}>
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name="pricetags-outline"
                    size={24}
                    color="#059669"
                  />
                </View>

                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>
                    {category.description || 'No description added'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    category.active
                      ? styles.activeBadge
                      : styles.inactiveBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      category.active
                        ? styles.activeText
                        : styles.inactiveText,
                    ]}
                  >
                    {category.active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <View style={styles.categoryDivider} />

              <View style={styles.categoryBottom}>
                <View>
                  <Text style={styles.productCount}>
                    {category.productCount} products
                  </Text>
                </View>

                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleStatus(category.id)}
                  >
                    <Ionicons
                      name={
                        category.active
                          ? 'pause-circle-outline'
                          : 'play-circle-outline'
                      }
                      size={19}
                      color="#475569"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditForm(category)}
                  >
                    <Ionicons
                      name="create-outline"
                      size={19}
                      color="#2563EB"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => confirmDelete(category)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color="#DC2626"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <Text style={styles.footerNote}>
          Categories added here are temporary and will reset when the screen reloads.
        </Text>
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  headerAddButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 15,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activeIcon: {
    backgroundColor: '#DBEAFE',
  },
  summaryNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    minHeight: 50,
    marginBottom: 24,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 12,
  },
  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  addTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingLeft: 8,
  },
  addText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  descriptionInput: {
    minHeight: 85,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1.5,
    minHeight: 48,
    backgroundColor: '#059669',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 15,
    marginBottom: 13,
  },
  categoryTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  categoryDescription: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
    lineHeight: 16,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  activeText: {
    color: '#047857',
  },
  inactiveText: {
    color: '#64748B',
  },
  categoryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 13,
  },
  categoryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 12,
  },
});
