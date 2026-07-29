import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API, API_CONFIG } from '../../constants/api';
import { saveAuth } from '../../utils/storage';

const VerifyOTP = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { email, role, initialOtp } = params;

  const [otp, setOtp] = useState(initialOtp || '');
  const [displayOtp, setDisplayOtp] = useState(initialOtp || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API.AUTH.VERIFY_OTP}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          password,
        }),
      });

      const text = await response.text();
      
      // APK SAFETY: Wrap JSON.parse in try-catch to prevent Hermes crash on invalid JSON
      let data;
      try {
        data = JSON.parse(text ?? "{}");
      } catch (parseError) {
        console.error('Failed to parse OTP verification response:', parseError);
        console.error('Response text:', text);
        Alert.alert('Error', 'Invalid server response. Please try again.');
        return;
      }

      if (!response.ok) {
        Alert.alert('Error', data.message || 'OTP verification failed');
        return;
      }

      // APK SAFETY: Validate required fields exist before saving
      if (!data.token || !data.userId) {
        console.error('Missing token or userId in response:', data);
        Alert.alert('Error', 'Invalid authentication data received');
        return;
      }

      await saveAuth(data.token, data.userId, role);

      Alert.alert('Success', 'Account created successfully!');
      router.push({
        pathname: role === 'influencer' ? '/(auth)/complete-profile' : '/(auth)/complete-brand-profile',
        params: { token: data.token, userId: data.userId },
      });
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Missing email address.');
      return;
    }
    setLoading(true);
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}${API.AUTH.SIGNUP_REQUEST}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role: role || 'influencer',
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const newOtp = data.otp || '';
        if (newOtp) {
          setOtp(newOtp);
          setDisplayOtp(newOtp);
          Alert.alert('🔑 New Verification OTP', `Your new OTP is: ${newOtp}`);
        } else {
          Alert.alert('Success', 'New OTP sent to your email!');
        }
        setTimer(300);
      } else {
        Alert.alert('Resend Failed', data.message || 'Could not resend OTP.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.white, '#eff6ff', '#dbeafe']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating organic shapes */}
      <View style={styles.shape1} />
      <View style={styles.shape2} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
      >
        <SafeAreaView style={styles.wrapper}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={COLORS.textDark}
                />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                   <MaterialCommunityIcons name="email-check-outline" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>Verify Email</Text>
                <Text style={styles.subtitle}>
                  We've sent a verification code to
                </Text>
                <Text style={styles.emailText}>{email}</Text>
              </View>

              {/* Form */}
              <View style={styles.card}>
                {!!displayOtp && (
                  <View style={styles.otpBannerCard}>
                    <MaterialCommunityIcons name="key-wireless" size={22} color="#059669" />
                    <Text style={styles.otpBannerLabel}>Your OTP Code: </Text>
                    <Text style={styles.otpBannerCode}>{displayOtp}</Text>
                  </View>
                )}

                {/* OTP Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Enter OTP</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="shield-check-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="000000"
                      placeholderTextColor={COLORS.mutedGray}
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />
                  </View>
                  <View style={styles.timerContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.timerText}>
                      Expires in {formatTime(timer)}
                    </Text>
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Create Password</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Min 6 characters"
                      placeholderTextColor={COLORS.mutedGray}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={COLORS.mutedGray}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="lock-check-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm password"
                      placeholderTextColor={COLORS.mutedGray}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleVerify}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.primary, '#6D28FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.buttonText}>Verify & Create Account</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>
                    Didn't receive the code?{' '}
                    <Text style={styles.resendLink}>Resend</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14141C',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  shape1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  shape2: {
    position: 'absolute',
    top: 200,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  emailText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14141C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: 8,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  resendButton: {
    alignItems: 'center',
    padding: 12,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  resendLink: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  otpBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  otpBannerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 6,
  },
  otpBannerCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 3,
  },
});

export default VerifyOTP;
