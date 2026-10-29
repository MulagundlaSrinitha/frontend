
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const faqs = [
  {
    question: 'How can I manage my products?',
    answer:
      'Open Products to view your product list, add products, and update stock information.',
  },
  {
    question: 'Where can I check my orders?',
    answer:
      'Open Orders to review order details and update order statuses.',
  },
  {
    question: 'Where can I view my payouts?',
    answer:
      'Open More → Payouts to review your payout information when available.',
  },
  {
    question: 'How do I update my store details?',
    answer:
      'Open More → Store Profile to edit your store information.',
  },
];

const categories = [
  'Orders',
  'Products',
  'Payments',
  'Account',
  'Other',
];

export default function SupportScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [category, setCategory] = useState('Orders');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const submitRequest = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert(
        'Required fields',
        'Please enter a subject and describe your issue.',
      );
      return;
    }

    Alert.alert(
      'Demo support request',
      'Your form is valid. Submitting a real support ticket will be available after backend integration.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSubject('');
            setDescription('');
            setCategory('Orders');
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color="#172033" />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.title}>Help & Support</Text>
              <Text style={styles.subtitle}>
                How can we help your store?
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="headset-outline"
                size={24}
                color="#059669"
              />
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="chatbubbles-outline"
                size={30}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.heroTitle}>We're here to help</Text>
            <Text style={styles.heroText}>
              Find answers to common questions or describe the issue
              you're facing with your vendor dashboard.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Support Options</Text>

          <View style={styles.optionsGrid}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() =>
                Alert.alert(
                  'Help Center',
                  'Help articles can be connected here later.',
                )
              }
            >
              <View style={[styles.optionIcon, styles.greenBg]}>
                <Ionicons
                  name="book-outline"
                  size={23}
                  color="#059669"
                />
              </View>
              <Text style={styles.optionTitle}>Help Center</Text>
              <Text style={styles.optionSubtitle}>
                Guides and instructions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() =>
                Alert.alert(
                  'Contact Support',
                  'A real support contact will be configured later.',
                )
              }
            >
              <View style={[styles.optionIcon, styles.blueBg]}>
                <Ionicons
                  name="mail-outline"
                  size={23}
                  color="#2563EB"
                />
              </View>
              <Text style={styles.optionTitle}>Contact Us</Text>
              <Text style={styles.optionSubtitle}>
                Get help with an issue
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>
            Frequently Asked Questions
          </Text>

          <View style={styles.faqCard}>
            {faqs.map((faq, index) => {
              const expanded = expandedFaq === index;

              return (
                <View key={faq.question}>
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() =>
                      setExpandedFaq(expanded ? null : index)
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.questionText}>
                      {faq.question}
                    </Text>
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={19}
                      color="#64748B"
                    />
                  </TouchableOpacity>

                  {expanded && (
                    <Text style={styles.answerText}>
                      {faq.answer}
                    </Text>
                  )}

                  {index < faqs.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Submit a Support Request</Text>

          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Issue Category</Text>

            <View style={styles.categoryContainer}>
              {categories.map((item) => {
                const selected = category === item;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoryButton,
                      selected && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Subject</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Briefly describe your issue"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              maxLength={100}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell us more about the problem..."
              placeholderTextColor="#94A3B8"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />

            <Text style={styles.characterCount}>
              {description.length}/1000 characters
            </Text>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitRequest}
              activeOpacity={0.8}
            >
              <Ionicons
                name="paper-plane-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.submitButtonText}>
                Submit Request
              </Text>
            </TouchableOpacity>

            <Text style={styles.formNote}>
              Demo only: this form does not send a real support ticket yet.
            </Text>
          </View>

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color="#64748B"
            />
            <Text style={styles.footerText}>
              Support submission will be connected to the API later.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  content: {
    padding: 20,
    paddingTop: 52,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#172033',
  },
  subtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#047857',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    marginBottom: 26,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroText: {
    fontSize: 12,
    lineHeight: 19,
    color: '#D1FAE5',
    textAlign: 'center',
    marginTop: 9,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 14,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 26,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  greenBg: {
    backgroundColor: '#D1FAE5',
  },
  blueBg: {
    backgroundColor: '#DBEAFE',
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#172033',
  },
  optionSubtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 5,
    lineHeight: 16,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EDF1F6',
    marginBottom: 26,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#172033',
  },
  answerText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 19,
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#EDF1F6',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 9,
    marginTop: 7,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 13,
  },
  categoryButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#047857',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: '#172033',
    fontSize: 13,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 115,
  },
  characterCount: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: -6,
    marginBottom: 15,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#059669',
    borderRadius: 13,
    paddingVertical: 14,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  formNote: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
