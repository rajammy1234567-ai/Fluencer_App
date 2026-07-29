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

    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
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
        Alert.alert('Login Failed', data.message || 'Please check your credentials');
        setLoading(false);
        return;
      }

      if (params.role && data.role !== params.role && data.role !== 'admin') {
        Alert.alert(
          'Account Role Mismatch',
          `This account is registered as a "${data.role}". Please go back and select the correct role.`
        );
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
      Alert.alert('Connection Error', 'Could not connect to the server.');
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
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.mutedGray}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
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
});

export default Login;
