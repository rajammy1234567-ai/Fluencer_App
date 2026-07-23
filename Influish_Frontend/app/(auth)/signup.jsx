import React, { useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API, getApiUrl } from '../../constants/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Signup = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Default to creator if no role passed (fallback)
  const isBrand = role === 'brand' || role === 'business';
  const displayRole = isBrand ? 'Business' : 'Creator';

  const handleSignup = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending OTP request...');
      const response = await fetch(getApiUrl(API.AUTH.SIGNUP_REQUEST), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: isBrand ? 'brand' : 'influencer' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const generatedOtp = data.otp || '';
        if (generatedOtp) {
          Alert.alert(
            '🔑 Verification OTP',
            `Your OTP is: ${generatedOtp}\n\n(This code will be auto-filled on the next screen)`
          );
        } else {
          Alert.alert('Success', 'OTP sent to your email!');
        }
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { email, role: isBrand ? 'brand' : 'influencer', initialOtp: generatedOtp },
        });
      } else {
        // Specific error handling for cross-role registration
        Alert.alert('Signup Failed', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Connection Error', 'Could not connect to the server.');
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
      
      {/* Abstract Shapes */}
      <View style={styles.shape1} />
      <View style={styles.shape2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textDark} />
            </TouchableOpacity>

            <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.logoInfo}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/logo_fluencer.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subText}>Sign up as a {displayRole}</Text>
            </Animated.View>
          </View>

          <Animated.View 
            entering={FadeInDown.delay(400).duration(800)} 
            style={styles.formContainer}
          >
            <View style={styles.card}>
              {/* Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor={COLORS.textLight}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.signupButton, loading && styles.disabledButton]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                   colors={[COLORS.primary, '#2563EB']}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 0 }}
                   style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.signupButtonText}>Send OTP</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Why Influish?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Value Props */}
            <View style={styles.valueProps}>
              <View style={styles.valuePropItem}>
                <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={18} color="#0284c7" />
                </View>
                <Text style={styles.valuePropText}>Instant Connect</Text>
              </View>
              <View style={styles.valuePropItem}>
               <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
                  <MaterialCommunityIcons name="shield-check" size={18} color="#16a34a" />
                </View>
                <Text style={styles.valuePropText}>Secure & Verified</Text>
              </View>
              <View style={styles.valuePropItem}>
                <View style={[styles.iconBox, { backgroundColor: '#fce7f3' }]}>
                  <MaterialCommunityIcons name="chart-box" size={18} color="#db2777" />
                </View>
                <Text style={styles.valuePropText}>Growth Tools</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginText}>Log In</Text>
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
    backgroundColor: COLORS.white,
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoInfo: {
    alignItems: 'center',
  },
  logoContainer: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  logo: {
    width: 150,
    height: 150,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  formContainer: {
    width: '100%',
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
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  signupButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '500',
  },
  valueProps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  valuePropItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  valuePropText: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '600',
    textAlign: 'center',
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
  loginText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default Signup;
