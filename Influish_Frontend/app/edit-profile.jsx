import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/colors';
import { getAuthHeader } from '../utils/storage';
import { API, API_CONFIG } from '../constants/api';
import BackButton from '../components/BackButton';

const PRIMARY_COLOR = '#3b82f6';

/* ================= ANIMATED INPUT FIELD ================= */
const AnimatedInputField = memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  icon, 
  multiline, 
  numberOfLines,
  delay = 0,
  required = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.inputGroup,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          multiline && styles.textAreaContainer,
        ]}
      >
        {icon && (
          <View style={styles.inputIconWrapper}>
            <MaterialCommunityIcons name={icon} size={20} color={PRIMARY_COLOR} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            multiline && styles.textArea,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          returnKeyType={multiline ? 'default' : 'done'}
          blurOnSubmit={!multiline}
        />
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if value changes
  return prevProps.value === nextProps.value && 
         prevProps.placeholder === nextProps.placeholder;
});

AnimatedInputField.displayName = 'AnimatedInputField';

/* ================= ANIMATED CATEGORY CHIP ================= */
const AnimatedCategoryChip = memo(({ category, isSelected, onPress, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!animatedRef.current) {
      animatedRef.current = true;
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [delay, scaleAnim, fadeAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.categoryChip,
          isSelected && styles.categoryChipActive,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={isSelected ? "check-circle" : "circle-outline"}
          size={18}
          color={isSelected ? '#FFFFFF' : PRIMARY_COLOR}
        />
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextActive,
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if selection changes
  return prevProps.isSelected === nextProps.isSelected;
});

AnimatedCategoryChip.displayName = 'AnimatedCategoryChip';

function EditProfile() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    location: '',
    bio: '',
    instagram: '',
    youtube: '',
    twitter: '',
    categories: [],
    gender: '', // Added gender
  });

  const headerAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const categories = [
    'Fashion',
    'Tech',
    'Travel',
    'Food',
    'Fitness',
    'Beauty',
    'Gaming',
    'Lifestyle',
    'Music',
    'Art',
    'Sports',
    'Education',
    'Finance', // Added missing categories from complete-profile if any
  ];

  useEffect(() => {
    fetchProfile();
    animateHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateHeader = () => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const fetchProfile = async () => {
    try {
      const authHeaders = await getAuthHeader();
      const response = await fetch(`${API_CONFIG.BASE_URL}${API.INFLUENCERS.PROFILE}`, {
        headers: authHeaders,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.profile?.name || '',
          location: data.profile?.location || '',
          bio: data.profile?.bio || '',
          instagram: data.profile?.instagram || '',
          youtube: data.profile?.youtube || '',
          twitter: data.profile?.twitter || '',
          categories: data.profile?.categories || [],
          gender: data.profile?.gender || '', // Fetch gender
        });
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = useCallback((category) => {
    setProfile((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const updateProfileField = useCallback((field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSave = async () => {
    // Validation
    if (!profile.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }

    if (profile.name.trim().length < 2) {
      Alert.alert('Validation Error', 'Name must be at least 2 characters long');
      return;
    }

    if (profile.bio && profile.bio.length > 500) {
      Alert.alert('Validation Error', 'Bio must be less than 500 characters');
      return;
    }

    Keyboard.dismiss();
    setSaving(true);

    try {
      const authHeaders = await getAuthHeader();
      const response = await fetch(`${API_CONFIG.BASE_URL}${API.INFLUENCERS.PROFILE}`, {
        method: 'POST', // Changed to POST
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          'Your profile has been updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/profile');
                }
              },
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to update profile. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Animated Header */}
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        }}
      >
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCenter}>
            <MaterialCommunityIcons name="account-edit" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Changed to height for Android
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 40 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
        >
          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account" size={22} color={PRIMARY_COLOR} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <AnimatedInputField
              label="Full Name"
              value={profile.name}
              onChangeText={(text) => updateProfileField('name', text)}
              placeholder="Enter your full name"
              icon="account"
              delay={100}
              required
            />

            <AnimatedInputField
              label="Location"
              value={profile.location}
              onChangeText={(text) => updateProfileField('location', text)}
              placeholder="e.g., Mumbai, India"
              icon="map-marker"
              delay={150}
            />

            <AnimatedInputField
              label="Bio"
              value={profile.bio}
              onChangeText={(text) => updateProfileField('bio', text)}
              placeholder="Tell us about yourself..."
              icon="text"
              multiline
              numberOfLines={4}
              delay={200}
            />
            {profile.bio && (
              <Text style={styles.characterCount}>
                {profile.bio.length}/500 characters
              </Text>
            )}
          </View>

          {/* Social Media Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="share-variant" size={22} color={PRIMARY_COLOR} />
              <Text style={styles.sectionTitle}>Social Media</Text>
            </View>

            <AnimatedInputField
              label="Instagram"
              value={profile.instagram}
              onChangeText={(text) => updateProfileField('instagram', text)}
              placeholder="@username"
              icon="instagram"
              delay={250}
            />

            <AnimatedInputField
              label="YouTube"
              value={profile.youtube}
              onChangeText={(text) => updateProfileField('youtube', text)}
              placeholder="Channel URL or @handle"
              icon="youtube"
              delay={300}
            />

            <AnimatedInputField
              label="Twitter / X"
              value={profile.twitter}
              onChangeText={(text) => updateProfileField('twitter', text)}
              placeholder="@username"
              icon="twitter"
              delay={350}
            />
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="tag-multiple" size={22} color={PRIMARY_COLOR} />
              <Text style={styles.sectionTitle}>Expertise & Interests</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Select categories that best describe your content
            </Text>

            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <AnimatedCategoryChip
                  key={category}
                  category={category}
                  isSelected={profile.categories.includes(category)}
                  onPress={() => toggleCategory(category)}
                  delay={400 + index * 50}
                />
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#64748b" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.7}
            >
              {saving ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.saveText}>Saving...</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.saveText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  inputContainerFocused: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#FFFFFF',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  inputIconWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: -12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});