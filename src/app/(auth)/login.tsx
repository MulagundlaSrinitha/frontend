
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

type LoginMode = 'phone' | 'email';

export default function LoginScreen() {
  const [mode, setMode] = useState<LoginMode>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setSession = useAuthStore((state) => state.setSession);
  const setAuthLoading = useAuthStore((state) => state.setLoading);

  const handlePhoneLogin = async () => {
    const digits = phone.replace(/\D/g, '');

    if (!/^\d{10}$/.test(digits)) {
      Alert.alert(
        'Invalid number',
        'Enter a valid 10-digit mobile number.',
      );
      return;
    }

    try {
      setLoading(true);
      setAuthLoading(true);

      await authService.sendOtp(digits);

      router.push({
        pathname: '/(auth)/verify-otp' as any,
        params: { phone: digits },
      });
    } catch (error) {
      Alert.alert(
        'Unable to send OTP',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }

    if (!password) {
      Alert.alert('Password required', 'Enter your password.');
      return;
    }

    try {
      setLoading(true);
      setAuthLoading(true);

      const response = await authService.login(
        normalizedEmail,
        password,
      );

      if (response.user?.role !== 'VENDOR') {
        await authService.logout();

        Alert.alert(
          'Vendor account required',
          'Please sign in with an authorized vendor account.',
        );
        return;
      }

      // Save the authenticated user in Zustand.
      setSession(response.user);

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>V</Text>
          </View>

          <Text style={styles.brand}>NEXT360 VENDOR</Text>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your store, products and orders.
          </Text>

          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setMode('phone')}
              disabled={loading}
              style={[
                styles.modeButton,
                mode === 'phone' && styles.modeActive,
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'phone' && styles.modeTextActive,
                ]}
              >
                Phone OTP
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode('email')}
              disabled={loading}
              style={[
                styles.modeButton,
                mode === 'email' && styles.modeActive,
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'email' && styles.modeTextActive,
                ]}
              >
                Email & Password
              </Text>
            </Pressable>
          </View>

          {mode === 'phone' ? (
            <>
              <Text style={styles.label}>Mobile number</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <View style={styles.separator} />

                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(value) =>
                    setPhone(value.replace(/\D/g, '').slice(0, 10))
                  }
                  editable={!loading}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Email address</Text>

              <TextInput
                style={styles.fullInput}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <Text style={styles.label}>Password</Text>

              <TextInput
                style={styles.fullInput}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </>
          )}

          <Pressable
            style={[styles.button, loading && styles.disabled]}
            onPress={
              mode === 'phone' ? handlePhoneLogin : handleEmailLogin
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'phone'
                  ? 'Continue with OTP'
                  : 'Sign in with Email'}
              </Text>
            )}
          </Pressable>

          <Text style={styles.footer}>
            Secure access to your vendor dashboard
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 26,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  brand: {
    textAlign: 'center',
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    paddingHorizontal: 5,
  },
  modeActive: {
    backgroundColor: '#FFFFFF',
  },
  modeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#15803D',
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 9,
  },
  inputContainer: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  countryCode: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 24,
    width: 1,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    paddingVertical: 12,
  },
  fullInput: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#111827',
    fontSize: 15,
    marginBottom: 18,
  },
  button: {
    height: 54,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  disabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 28,
  },
});


/*
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '../../services/auth';


type LoginMode = 'phone' | 'email';

export default function LoginScreen() {
  const [mode, setMode] = useState<LoginMode>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneLogin = async () => {
    const digits = phone.replace(/\D/g, '');

    if (!/^\d{10}$/.test(digits)) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);
      await authService.sendOtp(digits);

      router.push({
        pathname: '/(auth)/verify-otp' as any,
        params: { phone: digits },
      });
    } catch (error) {
      Alert.alert(
        'Unable to send OTP',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }

    if (!password) {
      Alert.alert('Password required', 'Enter your password.');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.user?.role !== 'VENDOR') {
        await authService.logout();
        Alert.alert(
          'Vendor account required',
          'Please sign in with an authorized vendor account.',
        );
        return;
      }

      router.replace('/' as any);
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>V</Text>
          </View>

          <Text style={styles.brand}>NEXT360 VENDOR</Text>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your store, products and orders.
          </Text>

          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setMode('phone')}
              style={[styles.modeButton, mode === 'phone' && styles.modeActive]}
            >
              <Text style={[styles.modeText, mode === 'phone' && styles.modeTextActive]}>
                Phone OTP
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode('email')}
              style={[styles.modeButton, mode === 'email' && styles.modeActive]}
            >
              <Text style={[styles.modeText, mode === 'email' && styles.modeTextActive]}>
                Email & Password
              </Text>
            </Pressable>
          </View>

          {mode === 'phone' ? (
            <>
              <Text style={styles.label}>Mobile number</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <View style={styles.separator} />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(value) =>
                    setPhone(value.replace(/\D/g, '').slice(0, 10))
                  }
                  editable={!loading}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.fullInput}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.fullInput}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </>
          )}

          <Pressable
            style={[styles.button, loading && styles.disabled]}
            onPress={mode === 'phone' ? handlePhoneLogin : handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'phone' ? 'Continue with OTP' : 'Sign in with Email'}
              </Text>
            )}
          </Pressable>

          <Text style={styles.footer}>
            Secure access to your vendor dashboard
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 26 },
  logo: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: '#16A34A',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
    marginBottom: 18,
  },
  logoText: { color: '#FFFFFF', fontSize: 34, fontWeight: '800' },
  brand: {
    textAlign: 'center', color: '#16A34A', fontSize: 12,
    fontWeight: '800', letterSpacing: 2, marginBottom: 14,
  },
  title: { fontSize: 29, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: {
    color: '#6B7280', fontSize: 14, lineHeight: 21, textAlign: 'center',
    marginTop: 10, marginBottom: 25,
  },
  modeRow: {
    flexDirection: 'row', backgroundColor: '#E5E7EB',
    padding: 4, borderRadius: 12, marginBottom: 24,
  },
  modeButton: {
    flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center',
    borderRadius: 9, paddingHorizontal: 5,
  },
  modeActive: { backgroundColor: '#FFFFFF' },
  modeText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  modeTextActive: { color: '#15803D' },
  label: { color: '#374151', fontSize: 14, fontWeight: '600', marginBottom: 9 },
  inputContainer: {
    minHeight: 56, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 12, paddingHorizontal: 14,
  },
  countryCode: { color: '#111827', fontSize: 16, fontWeight: '600' },
  separator: { height: 24, width: 1, backgroundColor: '#D1D5DB', marginHorizontal: 12 },
  input: { flex: 1, color: '#111827', fontSize: 16, paddingVertical: 12 },
  fullInput: {
    height: 54, backgroundColor: '#FFFFFF', borderWidth: 1,
    borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 14,
    color: '#111827', fontSize: 15, marginBottom: 18,
  },
  button: {
    height: 54, backgroundColor: '#16A34A', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 22,
  },
  disabled: { opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footer: { color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 28 },
});
*/