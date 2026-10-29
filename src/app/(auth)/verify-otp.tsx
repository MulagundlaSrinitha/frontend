
import { useEffect, useRef, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';

import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const inputRef = useRef<TextInput>(null);

  const setSession = useAuthStore((state) => state.setSession);
  const setAuthLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = async () => {
    const enteredOtp = otp.trim();
    const phoneNumber = Array.isArray(phone) ? phone[0] : phone;

    if (!/^\d{4,6}$/.test(enteredOtp)) {
      Alert.alert('Invalid OTP', 'Enter the OTP you received.');
      return;
    }

    if (!phoneNumber) {
      Alert.alert(
        'Error',
        'Phone number is missing. Please try again.',
      );
      router.replace('/(auth)/login' as any);
      return;
    }

    try {
      setLoading(true);
      setAuthLoading(true);

      const response = await authService.verifyOtp(
        phoneNumber,
        enteredOtp,
      );

      if (response.user?.role !== 'VENDOR') {
        await authService.logout();

        Alert.alert(
          'Vendor account required',
          'Please sign in with an authorized vendor account.',
        );
        router.replace('/(auth)/login' as any);
        return;
      }

      // Update the shared Zustand authentication state.
      setSession(response.user);

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Verification failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  const handleResend = async () => {
    const phoneNumber = Array.isArray(phone) ? phone[0] : phone;

    if (!phoneNumber || secondsLeft > 0 || resending || loading) {
      return;
    }

    try {
      setResending(true);

      await authService.sendOtp(phoneNumber);

      setOtp('');
      setSecondsLeft(60);

      Alert.alert('OTP requested', 'A new OTP has been requested.');
      inputRef.current?.focus();
    } catch (error) {
      Alert.alert(
        'Could not resend OTP',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
          >
            <Text style={styles.backText}>‹  Back</Text>
          </Pressable>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✉</Text>
          </View>

          <Text style={styles.title}>Verify your number</Text>

          <Text style={styles.subtitle}>
            Enter the OTP sent to +91{' '}
            {Array.isArray(phone) ? phone[0] : phone ?? ''}
          </Text>

          <Text style={styles.label}>One-time password</Text>

          <TextInput
            ref={inputRef}
            style={styles.otpInput}
            value={otp}
            onChangeText={(value) =>
              setOtp(value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="Enter OTP"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
            accessibilityLabel="One-time password"
          />

          <Pressable
            onPress={handleVerify}
            disabled={loading || resending}
            style={[
              styles.button,
              (loading || resending) && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </Pressable>

          <View style={styles.resendContainer}>
            <Text style={styles.resendHint}>
              Didn't receive the OTP?{' '}
            </Text>

            <Pressable
              onPress={handleResend}
              disabled={secondsLeft > 0 || resending || loading}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.resendText,
                  (secondsLeft > 0 || resending || loading) &&
                    styles.resendDisabled,
                ]}
              >
                {resending
                  ? 'Requesting...'
                  : secondsLeft > 0
                    ? `Resend in ${secondsLeft}s`
                    : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  backText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconText: {
    color: '#15803D',
    fontSize: 30,
  },
  title: {
    color: '#111827',
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  otpInput: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  button: {
    height: 54,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 26,
  },
  resendHint: {
    color: '#6B7280',
    fontSize: 13,
  },
  resendText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
});

/*
import { useEffect, useRef, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../../services/auth';

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = async () => {
    const enteredOtp = otp.trim();
    const phoneNumber = Array.isArray(phone) ? phone[0] : phone;

    if (!/^\d{4,6}$/.test(enteredOtp)) {
      Alert.alert('Invalid OTP', 'Enter the OTP you received.');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is missing. Please try again.');
      router.replace('/(auth)/login' as any);
      return;
    }

    try {
      setLoading(true);

      // Verify OTP and save the authentication token.
      await authService.verifyOtp(phoneNumber, enteredOtp);

      // Confirm that a token was saved before navigating.
      const isLoggedIn = await authService.isLoggedIn();

      if (!isLoggedIn) {
        throw new Error(
          'Authentication token was not saved. Please try again.',
        );
      }

      // Navigate to the vendor dashboard.
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Verification failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const phoneNumber = Array.isArray(phone) ? phone[0] : phone;

    if (!phoneNumber || secondsLeft > 0 || resending || loading) return;

    try {
      setResending(true);
      await authService.sendOtp(phoneNumber);
      setOtp('');
      setSecondsLeft(60);
      Alert.alert('OTP requested', 'A new OTP has been requested.');
      inputRef.current?.focus();
    } catch (error) {
      Alert.alert(
        'Could not resend OTP',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
          >
            <Text style={styles.backText}>‹  Back</Text>
          </Pressable>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✉</Text>
          </View>

          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the OTP sent to +91 {Array.isArray(phone) ? phone[0] : phone ?? ''}
          </Text>

          <Text style={styles.label}>One-time password</Text>

          <TextInput
            ref={inputRef}
            style={styles.otpInput}
            value={otp}
            onChangeText={(value) =>
              setOtp(value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="Enter OTP"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
            accessibilityLabel="One-time password"
          />

          <Pressable
            onPress={handleVerify}
            disabled={loading || resending}
            style={[
              styles.button,
              (loading || resending) && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </Pressable>

          <View style={styles.resendContainer}>
            <Text style={styles.resendHint}>Didn't receive the OTP? </Text>
            <Pressable
              onPress={handleResend}
              disabled={secondsLeft > 0 || resending || loading}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.resendText,
                  (secondsLeft > 0 || resending || loading) &&
                    styles.resendDisabled,
                ]}
              >
                {resending
                  ? 'Requesting...'
                  : secondsLeft > 0
                    ? `Resend in ${secondsLeft}s`
                    : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  backText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconText: {
    color: '#15803D',
    fontSize: 30,
  },
  title: {
    color: '#111827',
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  otpInput: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  button: {
    height: 54,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 26,
  },
  resendHint: {
    color: '#6B7280',
    fontSize: 13,
  },
  resendText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
});

/*
import { useEffect, useRef, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../../services/auth';

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = async () => {
    if (!/^\d{4,6}$/.test(otp)) {
      Alert.alert('Invalid OTP', 'Enter the OTP you received.');
      return;
    }

    if (!phone) {
      Alert.alert('Error', 'Phone number is missing. Please try again.');
      router.replace('/(auth)/login' as any);
      return;
    }

    try {
      setLoading(true);

      //await authService.verifyOtp(phone, otp);

      // Token is saved by authService.verifyOtp().
      //router.replace('/' as any);
      await authService.verifyOtp(phone, otp);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Verification failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || secondsLeft > 0 || resending || loading) return;

    try {
      setResending(true);
      await authService.sendOtp(phone);
      setOtp('');
      setSecondsLeft(60);
      Alert.alert('OTP requested', 'A new OTP has been requested.');
      inputRef.current?.focus();
    } catch (error) {
      Alert.alert(
        'Could not resend OTP',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
          >
            <Text style={styles.backText}>‹  Back</Text>
          </Pressable>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✉</Text>
          </View>

          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the OTP sent to +91 {phone ?? ''}
          </Text>

          <Text style={styles.label}>One-time password</Text>

          <TextInput
            ref={inputRef}
            style={styles.otpInput}
            value={otp}
            onChangeText={(value) =>
              setOtp(value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="Enter OTP"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
            accessibilityLabel="One-time password"
          />

          <Pressable
            onPress={handleVerify}
            disabled={loading || resending}
            style={[
              styles.button,
              (loading || resending) && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </Pressable>

          <View style={styles.resendContainer}>
            <Text style={styles.resendHint}>Didn't receive the OTP? </Text>
            <Pressable
              onPress={handleResend}
              disabled={secondsLeft > 0 || resending || loading}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.resendText,
                  (secondsLeft > 0 || resending || loading) &&
                    styles.resendDisabled,
                ]}
              >
                {resending
                  ? 'Requesting...'
                  : secondsLeft > 0
                    ? `Resend in ${secondsLeft}s`
                    : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  backText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconText: {
    color: '#15803D',
    fontSize: 30,
  },
  title: {
    color: '#111827',
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  otpInput: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  button: {
    height: 54,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 26,
  },
  resendHint: {
    color: '#6B7280',
    fontSize: 13,
  },
  resendText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
});
*/