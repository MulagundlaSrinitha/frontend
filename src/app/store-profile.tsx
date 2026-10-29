
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

type StoreProfile = {
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  city: string;
  pincode: string;
};

const initialProfile: StoreProfile = {
  storeName: '',
  ownerName: '',
  email: '',
  phone: '',
  category: '',
  address: '',
  city: '',
  pincode: '',
};

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  multiline?: boolean;
};

function FormField({
  label,
  value,
  placeholder,
  icon,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color="#64748B"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCapitalize={
            keyboardType === 'email-address' ? 'none' : 'sentences'
          }
        />
      </View>
    </View>
  );
}

export default function StoreProfileScreen() {
  const [profile, setProfile] = useState<StoreProfile>(initialProfile);

  // Keeps the last saved details separate from the form being edited.
  const [savedProfile, setSavedProfile] =
    useState<StoreProfile>(initialProfile);

  const [isEditing, setIsEditing] = useState(false);

  const updateField = (field: keyof StoreProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    if (!profile.storeName.trim()) {
      Alert.alert('Required field', 'Please enter your store name.');
      return;
    }

    // Update the store card only after Save Changes is pressed.
    const updatedProfile = { ...profile };
    setSavedProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsEditing(false);

    Alert.alert('Profile saved', 'Your store profile has been updated.');
  };

  const handleCancel = () => {
    // Restore the last saved details.
    setProfile({ ...savedProfile });
    setIsEditing(false);
  };

  const startEditing = () => {
    setProfile({ ...savedProfile });
    setIsEditing(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={23} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Store Profile</Text>
            <Text style={styles.headerSubtitle}>
              Manage your store information
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerEditButton}
            onPress={startEditing}
            disabled={isEditing}
            accessibilityLabel="Edit store profile"
          >
            <Ionicons name="create-outline" size={20} color="#059669" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Store card shows saved values, not unsaved form edits. */}
          <View style={styles.storeCard}>
            <View style={styles.storeIcon}>
              <Ionicons
                name="storefront-outline"
                size={34}
                color="#059669"
              />
            </View>

            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>
                {savedProfile.storeName.trim() || 'Your Store'}
              </Text>

              {savedProfile.category.trim() !== '' && (
                <Text style={styles.storeDescription}>
                    {savedProfile.category}
                </Text>
              )}

              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Store profile</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Text style={styles.sectionSubtitle}>
              Details about your business
            </Text>
          </View>

          <View style={styles.formCard}>
            <FormField
              label="Store Name *"
              value={profile.storeName}
              placeholder="Enter store name"
              icon="storefront-outline"
              onChangeText={(value) => updateField('storeName', value)}
            />

            <FormField
              label="Owner Name"
              value={profile.ownerName}
              placeholder="Enter owner name"
              icon="person-outline"
              onChangeText={(value) => updateField('ownerName', value)}
            />

            <FormField
              label="Store Category"
              value={profile.category}
              placeholder="e.g. Fashion, Electronics"
              icon="grid-outline"
              onChangeText={(value) => updateField('category', value)}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.sectionSubtitle}>
              How customers can contact you
            </Text>
          </View>

          <View style={styles.formCard}>
            <FormField
              label="Email Address"
              value={profile.email}
              placeholder="store@example.com"
              icon="mail-outline"
              keyboardType="email-address"
              onChangeText={(value) => updateField('email', value)}
            />

            <FormField
              label="Phone Number"
              value={profile.phone}
              placeholder="Enter phone number"
              icon="call-outline"
              keyboardType="phone-pad"
              onChangeText={(value) => updateField('phone', value)}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Store Address</Text>
            <Text style={styles.sectionSubtitle}>
              Your store's location details
            </Text>
          </View>

          <View style={styles.formCard}>
            <FormField
              label="Address"
              value={profile.address}
              placeholder="House number, street, area"
              icon="location-outline"
              multiline
              onChangeText={(value) => updateField('address', value)}
            />

            <FormField
              label="City"
              value={profile.city}
              placeholder="Enter city"
              icon="business-outline"
              onChangeText={(value) => updateField('city', value)}
            />

            <FormField
              label="PIN Code"
              value={profile.pincode}
              placeholder="Enter PIN code"
              icon="navigate-outline"
              keyboardType="number-pad"
              onChangeText={(value) => updateField('pincode', value)}
            />
          </View>

          {isEditing ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={startEditing}
            >
              <Ionicons name="create-outline" size={19} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                Edit Store Profile
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.footerNote}>
            Changes appear in the store card after you save. API integration
            will be added later.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#F6F8FB' },

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
  headerTextContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 3 },
  headerEditButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { padding: 18, paddingBottom: 36 },

  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 26,
  },
  storeIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfo: { flex: 1, marginLeft: 14 },
  storeName: { fontSize: 19, fontWeight: '800', color: '#0F172A' },
  storeDescription: { fontSize: 13, color: '#64748B', marginTop: 5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 9 },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginRight: 6,
  },
  statusText: { color: '#059669', fontSize: 12, fontWeight: '700' },

  sectionHeader: { marginBottom: 12, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  sectionSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4 },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
  },
  fieldContainer: { marginBottom: 17 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#0F172A', paddingVertical: 12 },
  multilineWrapper: { alignItems: 'flex-start', minHeight: 95 },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },

  actionRow: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1,
    minHeight: 51,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: { color: '#334155', fontSize: 14, fontWeight: '700' },
  saveButton: {
    flex: 1.5,
    minHeight: 51,
    borderRadius: 13,
    backgroundColor: '#059669',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#059669',
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  footerNote: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 17,
  },
});
