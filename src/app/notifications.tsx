import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  unread: boolean;
};

export default function NotificationsScreen() {
  const [notifications] = useState<NotificationItem[]>([]);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const markAllRead = () => {
    // No notifications are currently available.
  };

  const openNotification = (id: number) => {
    // Notification details can be handled when real notifications are available.
    console.log('Notification selected:', id);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={23} color="#111827" />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              Stay updated about your store
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="notifications-outline"
              size={26}
              color="#059669"
            />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>Your notifications</Text>
            <Text style={styles.summarySubtitle}>
              {unreadCount} unread notification
              {unreadCount === 1 ? '' : 's'}
            </Text>
          </View>

          <Pressable
            onPress={markAllRead}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <Text style={styles.markRead}>Mark all read</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Recent activity</Text>

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="notifications-off-outline"
                size={32}
                color="#94A3B8"
              />
            </View>

            <Text style={styles.emptyTitle}>No notifications yet</Text>

            <Text style={styles.emptyMessage}>
              Your store notifications will appear here when available.
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openNotification(item.id)}
              style={[
                styles.notificationCard,
                item.unread && styles.unreadCard,
              ]}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: `${item.color}18` },
                ]}
              >
                <Ionicons name={item.icon} size={23} color={item.color} />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle}>
                    {item.title}
                  </Text>
                  {item.unread && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </Pressable>
          ))
        )}

        <Text style={styles.sectionTitle}>
          Notification preferences
        </Text>

        <View style={styles.preferencesCard}>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceIcon}>
              <Ionicons
                name="phone-portrait-outline"
                size={21}
                color="#059669"
              />
            </View>

            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>
                Push notifications
              </Text>
              <Text style={styles.preferenceSubtitle}>
                {pushEnabled
                  ? 'Preference enabled (local only)'
                  : 'Preference disabled (local only)'}
              </Text>
            </View>

            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{
                false: '#CBD5E1',
                true: '#A7F3D0',
              }}
              thumbColor={pushEnabled ? '#059669' : '#F8FAFC'}
              accessibilityLabel="Push notification preference"
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceIcon}>
              <Ionicons
                name="mail-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>
                Email notifications
              </Text>
              <Text style={styles.preferenceSubtitle}>
                {emailEnabled
                  ? 'Preference enabled (local only)'
                  : 'Preference disabled (local only)'}
              </Text>
            </View>

            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{
                false: '#CBD5E1',
                true: '#A7F3D0',
              }}
              thumbColor={emailEnabled ? '#059669' : '#F8FAFC'}
              accessibilityLabel="Email notification preference"
            />
          </View>
        </View>

        <Text style={styles.note}>
          These switches save preferences for the current screen session only.
          Actual notifications are not enabled by these settings.
        </Text>
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
    padding: 18,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 24,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  summarySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  markRead: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 28,
    marginBottom: 24,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 7,
    textAlign: 'center',
    lineHeight: 18,
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  unreadCard: {
    borderColor: '#A7F3D0',
  },
  notificationIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  message: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
    lineHeight: 17,
  },
  time: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 7,
  },
  preferencesCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    paddingHorizontal: 13,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
  },
  preferenceIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  preferenceSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  note: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 17,
    marginTop: 18,
    textAlign: 'center',
  },
});