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
      duration: 400,
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
      let data;
      try {
        data = JSON.parse(text ?? "{}");
      } catch (parseError) {
        console.error('Failed to parse OTP response:', parseError);
        Alert.alert('Error', 'Invalid server response. Please try again.');
        return;
      }

      if (!response.ok) {
        Alert.alert('Error', data.message || 'OTP verification failed');
        return;
      }

      if (!data.token || !data.userId) {
        Alert.alert('Error', 'Invalid authentication data received');
        return;
      }

      await saveAuth(data.token, data.userId, role);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('🎉 Account created successfully!');
      } else {
        Alert.alert('Success 🎉', 'Account created successfully!');
      }

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
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.alert(`🔑 New Verification OTP: ${newOtp}`);
          } else {
            Alert.alert('🔑 New Verification OTP', `Your new OTP is: ${newOtp}`);
          }
        } else {
          Alert.alert('Success', 'New OTP sent to your email/mobile!');
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

  const isEmailInput = email && String(email).includes('@');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F3EEFF', '#F8F5FF', '#EBE4FF']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative Organic Blobs */}
      <View style={styles.topRightBlob} />
      <View style={styles.topLeftBlob} />
      <View style={styles.bottomRightGridPattern} />

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
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="arrow-left" size={22} color="#4C1D95" />
              </TouchableOpacity>

              {/* Main Card Wrapper */}
              <View style={styles.cardContainer}>
                {/* Header Badge & Title */}
                <View style={styles.header}>
                  <View style={styles.iconCircleOuter}>
                    <View style={styles.iconCircleInner}>
                      <MaterialCommunityIcons 
                        name={isEmailInput ? "email-check-outline" : "cellphone-check"} 
                        size={32} 
                        color="#7C3AED" 
                      />
                    </View>
                  </View>
                  
                  <Text style={styles.title}>
                    Verify <Text style={styles.titleHighlight}>{isEmailInput ? 'Email' : 'Number'}</Text>
                  </Text>
                  
                  <Text style={styles.subtitle}>
                    We've sent a verification code to
                  </Text>
                  <Text style={styles.emailText}>{email || 'Your Contact Number'}</Text>
                </View>

                {/* OTP Code Display Banner */}
                {!!displayOtp && (
                  <View style={styles.otpBannerCard}>
                    <View style={styles.otpCheckBadge}>
                      <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />
                    </View>
                    <Text style={styles.otpBannerLabel}>Your OTP Code: </Text>
                    <Text style={styles.otpBannerCode}>{displayOtp}</Text>
                  </View>
                )}

                {/* Form Fields */}
                <View style={styles.formContainer}>
                  {/* OTP Field */}
                  <View style={styles.inputWrapper}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons name="shield-check-outline" size={18} color="#A855F7" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="000000"
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />
                    {timer > 0 && (
                      <Text style={styles.timerBadge}>{formatTime(timer)}</Text>
                    )}
                  </View>

                  {/* Password Field */}
                  <View style={styles.inputWrapper}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons name="lock-outline" size={18} color="#A855F7" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Min 6 characters"
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="rgba(255,255,255,0.45)"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Confirm Password Field */}
                  <View style={styles.inputWrapper}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons name="lock-check-outline" size={18} color="#A855F7" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm password"
                      placeholderTextColor="rgba(255,255,255,0.45)"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#7C3AED', '#6D28FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="shield-check-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                          <Text style={styles.buttonText}>Verify & Create Account</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Resend Link */}
                  <TouchableOpacity 
                    style={styles.resendButton}
                    onPress={handleResendOTP}
                    disabled={loading}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons name="sync" size={16} color="#7C3AED" style={{ marginRight: 6 }} />
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: '#F3EEFF',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  topRightBlob: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  topLeftBlob: {
    position: 'absolute',
    top: 60,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  bottomRightGridPattern: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(168, 85, 247, 0.06)',
  },
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircleInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 6,
  },
  titleHighlight: {
    color: '#7C3AED',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 15,
    color: '#7C3AED',
    fontWeight: '700',
    marginTop: 4,
  },
  otpBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F4EA',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  otpCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  otpBannerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
  },
  otpBannerCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 4,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    height: 56,
    marginBottom: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1F1B38',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timerBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C084FC',
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  resendLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7C3AED',
  },
});

export default VerifyOTP;
