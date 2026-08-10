import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API, API_CONFIG } from '../../constants/api';
import { saveAuth } from '../../utils/storage';
import { clearAdminAuth } from '../../utils/adminStorage';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Login = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role;
  const isBrand = roleParam === 'brand' || roleParam === 'business';
  const roleLabel = isBrand ? 'Brand' : 'Creator';

  const handleSkip = async () => {
    const guestRole = isBrand ? 'brand' : 'influencer';
    try {
      await saveAuth('guest-skip-token', 'guest-user', guestRole);
      await clearAdminAuth();
      router.replace(guestRole === 'brand' ? '/(brand-tabs)/home' : '/(tabs)/home');
    } catch (error) {
      console.error('Skip navigation error:', error);
      router.replace(isBrand ? '/(brand-tabs)/home' : '/(tabs)/home');
    }
  };

  const handleLogin = async () => {
    if (loading) return;
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      const msg = 'Please enter both your email/mobile number and password.';
      setErrorMessage(msg);
      setShowErrorModal(true);
      Alert.alert('Missing Details', msg);
      return;
    }

    setLoading(true);
    try {
      await clearAdminAuth();

      const apiUrl = `${API_CONFIG.BASE_URL}${API.AUTH.LOGIN}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = data.message || 'Incorrect email/mobile number or password. Please check your credentials or create a new account.';
        setErrorMessage(errorText);
        setShowErrorModal(true);
        Alert.alert('Login Failed', errorText);
        setLoading(false);
        return;
      }

      if (params.role && data.role !== params.role && data.role !== 'admin') {
        const roleLabelStr = data.role === 'influencer' ? 'Creator' : data.role === 'brand' ? 'Brand' : data.role;
        const mismatchMsg = `This account is registered as a "${roleLabelStr}". Please use the ${roleLabelStr} login section.`;
        setErrorMessage(mismatchMsg);
        setShowErrorModal(true);
        Alert.alert('Account Role Mismatch', mismatchMsg);
        setLoading(false);
        return;
      }

      await saveAuth(data.token, data.userId, data.role);

      if (data.role === 'influencer') {
        router.replace('/(tabs)/home');
      } else if (data.role === 'brand' || data.role === 'business') {
        router.replace('/(brand-tabs)/home');
      } else if (data.role === 'admin') {
        Alert.alert(
          'Web-Only Admin Access',
          'The Admin Control Panel is restricted to desktop web browsers.'
        );
        setLoading(false);
        return;
      } else {
        router.replace('/role-selection');
      }
    } catch (error) {
      console.error('Login Error:', error);
      const connMsg = 'Could not connect to server. Please check your internet connection.';
      setErrorMessage(connMsg);
      setShowErrorModal(true);
      Alert.alert('Connection Error', connMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B10', '#1A1025', '#6D28FF']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerOrb} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.textDark} />
        </TouchableOpacity>

        <Animated.View entering={FadeInUp.delay(120).duration(600)} style={styles.headerContent}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/images/logo_fluencer.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.rolePill}>
            <MaterialCommunityIcons
              name={isBrand ? 'storefront' : 'video-vintage'}
              size={14}
              color={COLORS.white}
            />
            <Text style={styles.rolePillText}>{roleLabel} Login</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.subText}>
            {isBrand
              ? 'Sign in to manage campaigns and work with creators'
              : 'Sign in to discover campaigns and work with brands'}
          </Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheet}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(250).duration(650)} style={styles.formContainer}>
            {!!errorMessage && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.errorBanner}>
                <View style={styles.errorBannerHeader}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FF4D4D" />
                  <Text style={styles.errorBannerTitle}>Incorrect Email/ID or Password</Text>
                </View>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
                <TouchableOpacity
                  style={styles.errorBannerSignupBtn}
                  onPress={() => router.push({ pathname: '/role-selection', params: { mode: 'signup' } })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.errorBannerSignupText}>New to Fluencer? Create a new account</Text>
                  <MaterialCommunityIcons name="arrow-right" size={14} color="#C084FC" />
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email or Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email address or Mobile number"
                  placeholderTextColor={COLORS.mutedGray}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="default"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.mutedGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPass}>
              <Text style={styles.forgotPassText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButtonWrap, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={COLORS.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading} activeOpacity={0.85}>
              <Text style={styles.skipButtonText}>Skip login · Explore app</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.skipHint}>No account needed — preview creator / brand UI</Text>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="google" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="apple" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Fluencer? </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: '/role-selection', params: { mode: 'signup' } })
                }
              >
                <Text style={styles.signupText}>Create account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Error Alert Modal */}
      {showErrorModal && (
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.errorIconBadge}>
                <MaterialCommunityIcons name="alert-circle-outline" size={26} color="#FF4D4D" />
              </View>
              <Text style={styles.modalTitle}>Login Failed</Text>
            </View>
            <Text style={styles.modalBodyText}>{errorMessage}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setShowErrorModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSecondaryBtnText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  setShowErrorModal(false);
                  router.push({ pathname: '/role-selection', params: { mode: 'signup' } });
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalPrimaryBtnGradient}
                >
                  <Text style={styles.modalPrimaryBtnText}>Create Account</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 36,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  headerOrb: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#14141C',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#14141C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  logo: {
    width: 52,
    height: 52,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#14141C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rolePillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 21,
    maxWidth: width * 0.85,
  },
  sheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14141C',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 22,
  },
  forgotPassText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  loginButtonWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  loginButton: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  skipButton: {
    marginTop: 14,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  skipButtonText: {
    color: '#A855F7',
    fontSize: 15,
    fontWeight: '800',
  },
  skipHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 26,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 14,
    color: COLORS.textLight,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#14141C',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  signupText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 77, 77, 0.35)',
    marginBottom: 20,
  },
  errorBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  errorBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF4D4D',
  },
  errorBannerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 19,
    marginBottom: 12,
  },
  errorBannerSignupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 77, 77, 0.2)',
  },
  errorBannerSignupText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C084FC',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 9999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#161622',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 77, 77, 0.35)',
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  errorIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.25)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  modalBodyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 21,
    marginBottom: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalSecondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    flex: 1.3,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalPrimaryBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  modalPrimaryBtnText: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});

export default Login;
