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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API, API_CONFIG } from '../../constants/api';
import { getToken } from '../../utils/storage';

const BRAND_CATEGORIES = [
  'Fashion', 'Beauty & Cosmetics', 'Technology', 'Food & Beverage',
  'Health & Fitness', 'Travel & Tourism', 'Automotive', 'Real Estate',
  'Education', 'Entertainment', 'Sports', 'Finance', 'Lifestyle', 'Other'
];

const CompleteBrandProfile = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { token, userId } = params;

  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState(null);
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleImagePicker = () => {
    // TODO: Implement image picker
    Alert.alert('Coming Soon', 'Image upload will be implemented with expo-image-picker');
  };

  const handleComplete = async () => {
    if (!companyName.trim() || !category || !address.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const authToken = token || await getToken();
      if (!authToken) {
        Alert.alert('Error', 'Authentication token missing');
        router.replace('/(auth)/signup');
        return;
      }

      const apiUrl = `${API_CONFIG.BASE_URL}${API.BRANDS.PROFILE}`;
      console.log('📤 Creating brand profile at:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          companyName,
          category,
          address,
          profileImage: profileImage || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Failed to save profile');
        return;
      }

      router.replace('/brand-onboarding');
    } catch (error) {
      console.error('Brand profile error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#14141C', 'rgba(255,255,255,0.12)']}
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
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Setup Your Brand</Text>
                <Text style={styles.subtitle}>{"Let's create your brand profile"}</Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Profile Image */}
                <View style={styles.imageSection}>
                  <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={handleImagePicker}
                    disabled={loading}
                  >
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                      <LinearGradient
                        colors={[COLORS.accent, COLORS.gold]}
                        style={styles.imagePlaceholder}
                      >
                        <MaterialCommunityIcons
                          name="camera-plus"
                          size={40}
                          color={COLORS.white}
                        />
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.imageLabel}>Upload Company Logo</Text>
                </View>

                {/* Company Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company Name</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="office-building"
                      size={20}
                      color={COLORS.mutedGray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Your company name"
                      placeholderTextColor={COLORS.mutedGray}
                      value={companyName}
                      onChangeText={setCompanyName}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Category Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Industry Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    <View style={styles.categoryGrid}>
                      {BRAND_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryChip,
                            category === cat && styles.selectedChip,
                          ]}
                          onPress={() => setCategory(cat)}
                          disabled={loading}
                          activeOpacity={0.7}
                        >
                          <LinearGradient
                            colors={
                              category === cat
                                ? [COLORS.primary, COLORS.primaryDark]
                                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                            }
                            style={styles.chipGradient}
                          >
                            <Text
                              style={[
                                styles.categoryText,
                                category === cat && styles.selectedCategoryText,
                              ]}
                            >
                              {cat}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company Address</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={20}
                      color={COLORS.mutedGray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Full company address"
                      placeholderTextColor={COLORS.mutedGray}
                      value={address}
                      onChangeText={setAddress}
                      editable={!loading}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleComplete}
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
                      <>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color={COLORS.white}
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.buttonText}>Complete Setup</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#021024',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(2, 16, 36, 0.7)',
  },
  formContainer: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  imageLabel: {
    fontSize: 14,
    color: '#021024',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#021024',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  categoryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(2, 16, 36, 0.2)',
  },
  selectedChip: {
    borderColor: '#052659',
  },
  chipGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(2, 16, 36, 0.7)',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  floatingShape1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(161, 213, 255, 0.3)',
  },
  floatingShape2: {
    position: 'absolute',
    top: 150,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(193, 232, 255, 0.2)',
  },
  floatingShape3: {
    position: 'absolute',
    bottom: 200,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(232, 244, 253, 0.4)',
  },
  floatingShape4: {
    position: 'absolute',
    bottom: -30,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(125, 160, 202, 0.2)',
  },
});

export default CompleteBrandProfile;
