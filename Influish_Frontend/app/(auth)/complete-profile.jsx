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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API, API_CONFIG } from '../../constants/api';
import { getToken } from '../../utils/storage';

const CATEGORIES = [
  'Cosmetics',
  'Medical',
  'Sports',
  'Fashion',
  'Technology',
  'Travel',
  'Food',
  'Lifestyle',
  'Beauty',
  'Fitness',
  'Education',
  'Finance',
];

const GENDERS = ['Male', 'Female', 'Other'];

const CompleteProfile = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { token, userId } = params;

  const [name, setName] = useState('');
  const [gender, setGender] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleComplete = async () => {
    if (!name.trim() || !gender || selectedCategories.length === 0 || !location.trim()) {
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

      const apiUrl = `${API_CONFIG.BASE_URL}${API.INFLUENCERS.PROFILE}`;
      console.log('📤 Creating profile at:', apiUrl);
      console.log('📦 Profile data:', { name, gender: gender.toLowerCase(), categories: selectedCategories, location });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name,
          gender: gender.toLowerCase(),
          categories: selectedCategories,
          location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Failed to save profile');
        return;
      }

      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Profile error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F8FAFC', '#E2E8F0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
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
                <Text style={styles.title}>Complete Your Profile</Text>
                <Text style={styles.subtitle}>
                  Tell us more about your expertise
                </Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={20}
                      color={COLORS.mutedGray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Your full name"
                      placeholderTextColor={COLORS.mutedGray}
                      value={name}
                      onChangeText={setName}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Gender Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.selectionGrid}>
                    {GENDERS.map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.selectionItem,
                          gender === g && styles.selectedItem,
                        ]}
                        onPress={() => setGender(g)}
                        disabled={loading}
                      >
                        <LinearGradient
                          colors={
                            gender === g
                              ? [COLORS.primary, COLORS.primaryDark]
                              : ['transparent', 'transparent']
                          }
                          style={styles.selectionGradient}
                        >
                          <Text
                            style={[
                              styles.selectionText,
                              gender === g && styles.selectedText,
                            ]}
                          >
                            {g}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Categories Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Select Your Expertise ({selectedCategories.length})
                  </Text>
                  <View style={styles.categoryGrid}>
                    {CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          selectedCategories.includes(category) &&
                            styles.selectedChip,
                        ]}
                        onPress={() => toggleCategory(category)}
                        disabled={loading}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={
                            selectedCategories.includes(category)
                              ? [COLORS.primary, COLORS.primaryDark]
                              : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                          }
                          style={styles.chipGradient}
                        >
                          <View style={styles.chipContent}>
                            {selectedCategories.includes(category) && (
                              <MaterialCommunityIcons
                                name="check-circle"
                                size={16}
                                color={COLORS.white}
                                style={styles.checkIcon}
                              />
                            )}
                            <Text
                              style={[
                                styles.categoryText,
                                selectedCategories.includes(category) &&
                                  styles.selectedCategoryText,
                              ]}
                            >
                              {category}
                            </Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Location Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Location</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={20}
                      color={COLORS.mutedGray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="City, Country"
                      placeholderTextColor={COLORS.mutedGray}
                      value={location}
                      onChangeText={setLocation}
                      editable={!loading}
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
                          name="check"
                          size={20}
                          color={COLORS.white}
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.buttonText}>Complete Profile</Text>
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
  selectionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  selectionItem: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(2, 16, 36, 0.2)',
  },
  selectedItem: {
    borderColor: '#052659',
  },
  selectionGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#021024',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 6,
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

export default CompleteProfile;
