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
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { saveAdminAuth } from '../../utils/adminStorage';
import { getApiUrl } from '../../constants/api';

/**
 * Admin Login Screen
 * Temporary admin auth for MVP - No API integration
 * Predefined credentials:
 * - Email: admin@fluencer.app
 * - Password: Admin@123
 */
const AdminLogin = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAdminLogin = async () => {
    // Prevent double-click during login
    if (loading) {
      console.log('⚠️ Login already in progress');
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Clear any stale user auth before admin login to prevent cross-role conflicts
      const { clearAuth } = require('../../utils/storage');
      await clearAuth();
      
      console.log('🔐 Admin Login Attempt');
      console.log('📧 Email:', email.trim());
      
      // Call backend API for admin login
      const response = await fetch(getApiUrl('/api/auth/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();
      console.log('📊 Login response:', data);

      if (data.success) {
        console.log('✅ Admin credentials valid');
        
        // Save admin auth state with real JWT token
        await saveAdminAuth(data.token, data.userId, data.role);
        console.log('✅ Admin auth saved to AsyncStorage');
        
        // Notify AuthGuard to update state
        const { DeviceEventEmitter } = require('react-native');
        DeviceEventEmitter.emit('admin_login');
        
        // Use a longer delay or retry mechanism if simple delay fails, 
        // but typically ensuring await saveAdminAuth completes is key.
        // We keep a small delay just to be safe for async storage propagation.
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('🚀 Navigating to dashboard...');
        
        // IMPORTANT: router.replace should suffice. 
        // If AuthGuard is active, it will re-render and see IS_AUTHENTICATED.
        router.replace('/(admin)/(tabs)/dashboard');
        
        // Return here so we don't clear loading state, preventing button re-enable before nav
        return; 
      } else {
        console.log('❌ Login failed:', data.message);
        Alert.alert(
          'Error', 
          data.message || 'Invalid admin credentials\n\nUse:\nadmin@fluencer.app\nAdmin@123'
        );
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      Alert.alert('Error', 'Connection failed. Please check your internet connection and try again.');
    } finally {
      // Only clear loading if we didn't succeed (success leads to unmount/nav)
      // or if we want to allow retry after failure
      if (loading) setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#E8F4FD', '#C1E8FF', '#A8D5FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Floating organic shapes */}
      <View style={styles.floatingShape1} />
      <View style={styles.floatingShape2} />
      <View style={styles.floatingShape3} />
      <View style={styles.floatingShape4} />
      
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
                  color={COLORS.white}
                />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <MaterialCommunityIcons
                  name="shield-account"
                  size={64}
                  color={COLORS.primary}
                  style={styles.shieldIcon}
                />
                <Text style={styles.logo}>Fluencer Admin</Text>
                <Text style={styles.title}>Admin Portal</Text>
                <Text style={styles.subtitle}>Sign in to access admin panel</Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Admin Email</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color={COLORS.mutedGray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="admin@fluencer.app"
                      placeholderTextColor={COLORS.mutedGray}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
                      color={COLORS.mutedGray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter admin password"
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

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleAdminLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.primaryDark, COLORS.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <View style={styles.buttonContent}>
                        <MaterialCommunityIcons
                          name="shield-lock"
                          size={20}
                          color={COLORS.white}
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.buttonText}>Login as Admin</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Info Text */}
                <View style={styles.infoContainer}>
                  <MaterialCommunityIcons
                    name="information"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.infoText}>
                    Admin access only. Unauthorized access is prohibited.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  shieldIcon: {
    marginBottom: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 8,
    flex: 1,
  },
  floatingShape1: {
    position: 'absolute',
    top: 100,
    right: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  floatingShape2: {
    position: 'absolute',
    top: 250,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  floatingShape3: {
    position: 'absolute',
    bottom: 150,
    right: 50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  floatingShape4: {
    position: 'absolute',
    bottom: 50,
    left: 40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default AdminLogin;
