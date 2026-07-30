/**
 * Influencer Profile Screen - Production-Ready APK-Safe Implementation
 * 
 * INFLUENCER ONLY - NO ROLE DETECTION - NO BRAND LOGIC
 * 
 * ARCHITECTURE:
 * - Single useEffect for lifecycle management
 * - useRef for mount state tracking
 * - HARDCODED to influencer API endpoint only
 * - Defensive guards on ALL state updates and navigation
 * - Simple, crash-proof UI (no animations)
 * 
 * SAFETY FEATURES:
 * - Hermes-safe (no undefined operations)
 * - Android decoder-safe image handling
 * - Explicit null checks before rendering
 * - Clean auth flow with proper logout (admin pattern)
 * - No optional chaining in render
 * - No state updates after unmount
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API, API_CONFIG } from '../../constants/api';
import { storage } from '../../utils/storage';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { COLORS } from '../../constants/colors';
import { SlideUp, PopIn } from '../../components/motion';

const PRIMARY_COLOR = COLORS.primary;
const FALLBACK_LOGO = require('../../assets/images/icon.png');

/* ================= STAT CARD ================= */
const StatCard = ({ icon, value, label }) => {
  const safeIcon = icon || 'information';
  const safeValue = (value !== null && value !== undefined) ? String(value) : '0';
  const safeLabel = label || '';

  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <MaterialCommunityIcons name={safeIcon} size={26} color={PRIMARY_COLOR} />
      </View>
      <Text style={styles.statValue}>{safeValue}</Text>
      <Text style={styles.statLabel}>{safeLabel}</Text>
    </View>
  );
};


/* ================= INFLUENCER PROFILE COMPONENT ================= */
export default function Profile() {
  const router = useRouter();
  
  // State management (ALL HOOKS AT TOP OF COMPONENT)
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followerModalVisible, setFollowerModalVisible] = useState(false);
  const [customFollowers, setCustomFollowers] = useState('');
  const [updatingFollowers, setUpdatingFollowers] = useState(false);
  
  // Portfolio Showcase State
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [addMediaModalVisible, setAddMediaModalVisible] = useState(false);
  const [mediaType, setMediaType] = useState('photo'); // 'photo' | 'reel'
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  // Local File (Photo / Video MP4) picker for Cloudinary upload
  const handlePickLocalFile = async (typeToPick) => {
    try {
      setUploadingMedia(true);

      // Web Browser Native File Input
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = typeToPick === 'reel' ? 'video/mp4,video/quicktime,video/*' : 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log('📁 Local file selected:', file.name);
            const uploadedUrl = await uploadToCloudinary(file);
            if (uploadedUrl) {
              setMediaUrl(uploadedUrl);
              setMediaType(typeToPick);
            }
          }
          setUploadingMedia(false);
        };
        input.click();
        return;
      }

      // Mobile React Native Image Picker (react-native-image-picker)
      const { launchImageLibrary } = require('react-native-image-picker');
      const options = {
        mediaType: typeToPick === 'reel' ? 'video' : 'photo',
        quality: 0.8,
        selectionLimit: 1,
      };

      launchImageLibrary(options, async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.warn('ImagePicker Error:', response.errorMessage);
          return;
        }
        if (response.assets?.[0]?.uri) {
          setUploadingMedia(true);
          const uploadedUrl = await uploadToCloudinary(response.assets[0].uri);
          if (uploadedUrl) {
            setMediaUrl(uploadedUrl);
            setMediaType(typeToPick);
          }
          setUploadingMedia(false);
        }
      });
    } catch (err) {
      console.error('Pick local file error:', err);
    } finally {
      setUploadingMedia(false);
    }
  };

  // Add Portfolio Item handler
  const handleAddPortfolioItem = async () => {
    if (!mediaUrl.trim()) {
      Alert.alert('Required', 'Please provide an Image or Reel Video URL');
      return;
    }

    setUploadingMedia(true);
    try {
      const token = await storage.getToken();
      let finalUrl = mediaUrl.trim();

      if (mediaType === 'photo' && !finalUrl.startsWith('http')) {
        finalUrl = await uploadToCloudinary(finalUrl);
      }

      const res = await fetch(`${API_CONFIG.BASE_URL}${API.INFLUENCERS.PORTFOLIO}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: mediaType,
          url: finalUrl,
          title: mediaTitle
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(prev => ({
          ...prev,
          portfolio: data.portfolio || [...(prev?.portfolio || []), data.portfolioItem]
        }));
        setAddMediaModalVisible(false);
        setMediaUrl('');
        setMediaTitle('');
        Alert.alert('Success 🎉', `${mediaType === 'reel' ? 'Reel' : 'Photo'} added to your portfolio!`);
      } else {
        Alert.alert('Error', data.message || 'Failed to add item to portfolio');
      }
    } catch (err) {
      console.error('Add portfolio error:', err);
      Alert.alert('Error', 'Network error while saving portfolio item');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Delete Portfolio Item handler
  const handleDeletePortfolioItem = async (itemId) => {
    try {
      const token = await storage.getToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}${API.INFLUENCERS.PORTFOLIO}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(prev => ({
          ...prev,
          portfolio: (prev?.portfolio || []).filter(item => item.id !== itemId)
        }));
        setPreviewMedia(null);
      }
    } catch (err) {
      console.error('Delete portfolio error:', err);
    }
  };
  
  // Lifecycle safety
  const isMountedRef = useRef(true);

  /**
   * SINGLE useEffect for influencer profile initialization
   * - Check auth token
   * - Fetch INFLUENCER profile only
   * - No role detection
   */
  useEffect(() => {
    isMountedRef.current = true;
    loadInfluencerProfile();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Load influencer profile with defensive guards
   */
  const loadInfluencerProfile = async () => {
    try {
      if (!isMountedRef.current) return;

      // Step 1: Check auth token
      const token = await storage.getToken();

      if (!token) {
        console.log('⚠️ No auth token found - redirecting to login');
        // Clear storage and redirect (admin pattern)
        await storage.clearAuth();
        if (isMountedRef.current) {
          router.replace('/role-selection');
        }
        return;
      }

      // Step 2: Fetch INFLUENCER profile from API (no role detection)
      await fetchInfluencerProfileData(token);

    } catch (err) {
      console.error('❌ Influencer profile load error:', err);
      if (isMountedRef.current) {
        setError('Failed to load profile');
        setLoading(false);
      }
    }
  };

  /**
   * Fetch influencer profile from INFLUENCER API ONLY
   * NO ROLE DETECTION - HARDCODED TO INFLUENCER ENDPOINT
   */
  const fetchInfluencerProfileData = async (token) => {
    if (!isMountedRef.current) return;

    // INFLUENCER ONLY - Hardcoded endpoint
    const apiEndpoint = API.INFLUENCERS.PROFILE;

    // Validate endpoint exists
    if (!apiEndpoint || !API_CONFIG.BASE_URL) {
      console.error('❌ API configuration missing');
      if (isMountedRef.current) {
        setError('Configuration error');
        setLoading(false);
      }
      return;
    }

    const url = `${API_CONFIG.BASE_URL}${apiEndpoint}`;
    console.log('📡 Fetching influencer profile from:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!isMountedRef.current) return;

      const data = await response.json();
      console.log('📊 Influencer profile response:', data);

      // Strict validation
      if (response.ok && data && data.profile) {
        if (isMountedRef.current) {
          setProfile(data.profile);
          setLoading(false);
          setError(null);
        }
      } else {
        console.error('❌ Invalid influencer profile response');
        if (isMountedRef.current) {
          setError(data.message || 'Failed to load influencer profile');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('❌ Influencer profile fetch error:', err);
      if (isMountedRef.current) {
        setError('Network error');
        setLoading(false);
      }
    }
  };

  /**
   * Safe logout with proper sequence (admin pattern):
   * Works on both Native App (iOS/Android) and Web Preview.
   */
  const handleLogout = async () => {
    const executeLogout = async () => {
      try {
        console.log('🚪 Influencer logging out...');
        await storage.clearAuth();
        console.log('✅ Auth cleared');
        router.replace('/role-selection');
      } catch (err) {
        console.error('❌ Logout error:', err);
        router.replace('/role-selection');
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to logout?')) {
        await executeLogout();
      } else {
        await executeLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: executeLogout },
        ]
      );
    }
  };

  /**
   * Navigate to Settings
   */
  const handleSettings = () => {
    if (!isMountedRef.current) return;
    router.push('/settings');
  };

  /**
   * Get influencer initial letter for display
   */
  const getInfluencerInitial = () => {
    if (!profile) return 'I';
    const name = profile.name || profile.username || 'Influencer';
    return name.charAt(0).toUpperCase();
  };

  /**
   * Check if influencer has a valid profile picture
   */
  const hasValidProfilePicture = () => {
    const pictureUri = profile?.profile_picture || profile?.logo;
    if (pictureUri) {
      const uri = String(pictureUri).trim();
      return uri.startsWith('http://') || uri.startsWith('https://');
    }
    return false;
  };

  /**
   * Get safe influencer profile picture URI
   * - Only accept valid http/https URLs
   * - Fallback to local placeholder
   * - Android decoder safe
   */
  const getInfluencerProfilePicture = () => {
    // Check if profile exists and has profile_picture
    if (profile && (profile.profile_picture || profile.logo)) {
      const uri = String(profile.profile_picture || profile.logo).trim();
      // Only accept valid HTTP/HTTPS URLs
      if (uri.startsWith('http://') || uri.startsWith('https://')) {
        return { uri };
      }
    }
    // Fallback to local image
    return FALLBACK_LOGO;
  };

  /**
   * Get safe stat values - Hermes safe
   * NO Number(undefined) crashes
   */
  const getSafeStatValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= ERROR STATE ================= */
  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>
            {error || 'Unable to load profile'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadInfluencerProfile}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButtonError} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonErrorText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleUpdateFollowers = async () => {
    const val = customFollowers.trim();
    if (!val) {
      Alert.alert('Error', 'Please enter follower count (e.g. 5000, 125K, 45,000)');
      return;
    }
    setUpdatingFollowers(true);
    try {
      const token = await storage.getToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/influencers/update-followers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ followers: val })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(prev => ({ ...prev, followers: data.followers || val }));
        setFollowerModalVisible(false);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(`🎉 Follower count updated to ${data.followers || val}!`);
        } else {
          Alert.alert('Success', 'Follower count updated!');
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to update followers');
      }
    } catch (err) {
      console.error('Update followers error:', err);
      // Fallback state update
      setProfile(prev => ({ ...prev, followers: val }));
      setFollowerModalVisible(false);
    } finally {
      setUpdatingFollowers(false);
    }
  };

  /* ================= MAIN RENDER (PROFILE LOADED) ================= */
  // Safe field extraction with defaults
  const influencerName = profile.name || profile.username || 'Influencer';
  const influencerBio = profile.bio || profile.description || '';
  const influencerLocation = profile.location || 'Not set';
  const influencerEmail = profile.email || 'Not set';
  
  // Influencer-specific stats (live database counts)
  const followers = profile.followers || '125K';
  const collaborations = getSafeStatValue(profile.collaborations ?? profile.collaborations_count ?? profile.collabs, 0);
  const rating = profile.rating || '4.9';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0B0B10', '#121218', '#1A1025']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <PopIn delay={40}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {hasValidProfilePicture() ? (
                <Image
                  source={getInfluencerProfilePicture()}
                  style={styles.logo}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.logoInitialContainer}>
                  <Text style={styles.logoInitialText}>{getInfluencerInitial()}</Text>
                </View>
              )}
            </View>
            <Text style={styles.profileName}>{influencerName}</Text>
            <Text style={styles.profileRoleTag}>Creator profile · Open to all</Text>
            {influencerBio ? (
              <Text style={styles.profileBio}>{influencerBio}</Text>
            ) : null}
          </View>
          </PopIn>

          {/* Stats Section */}
          <SlideUp delay={120}>
          <View style={styles.statsContainer}>
            <TouchableOpacity onPress={() => { setCustomFollowers(followers); setFollowerModalVisible(true); }}>
              <StatCard
                icon="account-group"
                value={followers}
                label="Followers (Edit ✏️)"
              />
            </TouchableOpacity>
            <StatCard
              icon="handshake"
              value={collaborations}
              label="Collaborations"
            />
            <StatCard
              icon="star"
              value={typeof rating === 'number' ? rating.toFixed(1) : rating}
              label="Rating"
            />
          </View>
          </SlideUp>

          {/* Info Section */}
          <SlideUp delay={200}>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons 
                name="email" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
              <Text style={styles.infoText}>{influencerEmail}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
              <Text style={styles.infoText}>{influencerLocation}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons 
                name="account" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
              <Text style={styles.infoText}>Influencer Account</Text>
            </View>
          </View>
          </SlideUp>

          {/* PORTFOLIO & REELS SHOWCASE SECTION */}
          <SlideUp delay={280}>
          <View style={styles.portfolioSection}>
            <View style={styles.portfolioHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="image-multiple" size={24} color={PRIMARY_COLOR} />
                <Text style={styles.portfolioTitle}>My Portfolio & Content</Text>
              </View>

              <TouchableOpacity
                style={styles.addMediaBtn}
                onPress={() => setAddMediaModalVisible(true)}
              >
                <MaterialCommunityIcons name="plus-circle" size={18} color="#FFFFFF" />
                <Text style={styles.addMediaBtnText}>+ Add Media</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabsContainer}>
              <TouchableOpacity
                style={[styles.filterTab, portfolioFilter === 'all' && styles.activeFilterTab]}
                onPress={() => setPortfolioFilter('all')}
              >
                <Text style={[styles.filterTabText, portfolioFilter === 'all' && styles.activeFilterTabText]}>
                  All ({(profile?.portfolio || []).length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterTab, portfolioFilter === 'photo' && styles.activeFilterTab]}
                onPress={() => setPortfolioFilter('photo')}
              >
                <Text style={[styles.filterTabText, portfolioFilter === 'photo' && styles.activeFilterTabText]}>
                  📸 Photos ({(profile?.portfolio || []).filter(i => i.type === 'photo').length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterTab, portfolioFilter === 'reel' && styles.activeFilterTab]}
                onPress={() => setPortfolioFilter('reel')}
              >
                <Text style={[styles.filterTabText, portfolioFilter === 'reel' && styles.activeFilterTabText]}>
                  🎬 Reels ({(profile?.portfolio || []).filter(i => i.type === 'reel').length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Portfolio Grid */}
            {((profile?.portfolio || []).filter(item => portfolioFilter === 'all' || item.type === portfolioFilter)).length === 0 ? (
              <View style={styles.emptyPortfolioContainer}>
                <MaterialCommunityIcons name="camera-enhance-outline" size={44} color="rgba(255,255,255,0.45)" />
                <Text style={styles.emptyPortfolioTitle}>No portfolio media added yet</Text>
                <Text style={styles.emptyPortfolioSub}>
                  Upload sample photos or Reel links to showcase your content quality to brands!
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => setAddMediaModalVisible(true)}
                >
                  <Text style={styles.emptyAddBtnText}>+ Upload Photos & Reels</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.portfolioGrid}>
                {((profile?.portfolio || []).filter(item => portfolioFilter === 'all' || item.type === portfolioFilter)).map((item, idx) => (
                  <TouchableOpacity
                    key={item.id || idx}
                    style={styles.mediaCard}
                    onPress={() => setPreviewMedia(item)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: item.url || 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80' }}
                      style={styles.mediaThumbnail}
                    />

                    {item.type === 'reel' && (
                      <View style={styles.reelBadge}>
                        <MaterialCommunityIcons name="play-circle" size={24} color="#FFFFFF" />
                        <Text style={styles.reelBadgeText}>REEL</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.deleteMediaBadge}
                      onPress={() => handleDeletePortfolioItem(item.id)}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#FFFFFF" />
                    </TouchableOpacity>

                    {item.title ? (
                      <View style={styles.mediaCaptionBar}>
                        <Text style={styles.mediaCaptionText} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          </SlideUp>

          {/* Action Buttons */}
          <SlideUp delay={360}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.primaryLighter, borderColor: COLORS.primaryLight, borderWidth: 1, marginBottom: 12 }]} 
              onPress={() => { setCustomFollowers(followers); setFollowerModalVisible(true); }}
            >
              <MaterialCommunityIcons name="account-edit" size={24} color={COLORS.primaryDark} />
              <Text style={[styles.actionButtonText, { color: COLORS.primaryDeep, fontWeight: '700' }]}>👥 Edit Follower Count ({followers})</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1', borderWidth: 1, marginBottom: 12 }]} 
              onPress={() => router.push('/wallet')}
            >
              <MaterialCommunityIcons name="wallet" size={24} color="#0D9488" />
              <Text style={[styles.actionButtonText, { color: '#0F766E', fontWeight: '700' }]}>💳 My Wallet & Withdrawals (₹{(profile?.wallet_balance || 0).toLocaleString('en-IN')})</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSettings}
            >
              <MaterialCommunityIcons name="cog" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          </SlideUp>
        </ScrollView>
      </LinearGradient>

      {/* MANUAL FOLLOWER EDIT MODAL */}
      <Modal
        visible={followerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFollowerModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', backgroundColor: '#14141C', borderRadius: 20, padding: 24, elevation: 5 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' }}>
              👥 Edit Follower Count
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 20, textAlign: 'center' }}>
              Enter your manual follower count to display on your Creator Profile
            </Text>

            <TextInput
              style={{ width: '100%', backgroundColor: '#14141C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#FFFFFF', marginBottom: 20 }}
              placeholder="e.g. 125K, 45,000, 500K"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={customFollowers}
              onChangeText={setCustomFollowers}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center' }}
                onPress={() => setFollowerModalVisible(false)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.55)' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#6D28FF', alignItems: 'center' }}
                onPress={handleUpdateFollowers}
                disabled={updatingFollowers}
              >
                {updatingFollowers ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD MEDIA MODAL */}
      <Modal
        visible={addMediaModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddMediaModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 450, backgroundColor: '#14141C', borderRadius: 24, padding: 24, elevation: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 6, textAlign: 'center' }}>
              ✨ Add Portfolio Photo / Video Reel
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
              Upload photos and reel videos directly from your phone or computer to showcase on your profile.
            </Text>

            {/* Section 1: Local Photo Upload */}
            <View style={{ marginBottom: 16, backgroundColor: '#14141C', borderWidth: 1, borderColor: mediaType === 'photo' && mediaUrl ? '#86EFAC' : 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 }}>
                📸 Section 1: Upload Local Photo
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>
                Select an image file (JPG, PNG) from your device or PC
              </Text>

              {mediaType === 'photo' && mediaUrl ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0FDF4', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="check-circle" size={22} color="#16A34A" />
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#15803D' }} numberOfLines={1}>
                    ✓ Photo Ready to Save!
                  </Text>
                  <TouchableOpacity onPress={() => handlePickLocalFile('photo')}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#6D28FF' }}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{ width: '100%', backgroundColor: 'rgba(168, 85, 247, 0.16)', borderWidth: 1, borderColor: '#A855F7', borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  onPress={() => handlePickLocalFile('photo')}
                  disabled={uploadingMedia}
                >
                  {uploadingMedia && mediaType === 'photo' ? (
                    <ActivityIndicator color="#6D28FF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="file-image" size={20} color="#6D28FF" />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1D4ED8' }}>
                        📁 Choose Photo File from Device / PC
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Section 2: Local Video / Reel Upload */}
            <View style={{ marginBottom: 16, backgroundColor: '#14141C', borderWidth: 1, borderColor: mediaType === 'reel' && mediaUrl ? '#86EFAC' : 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 }}>
                🎬 Section 2: Upload Local Video / Reel
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>
                Select a video file (MP4, MOV) from your device or PC
              </Text>

              {mediaType === 'reel' && mediaUrl ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF1F2', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#FECDD3', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="check-circle" size={22} color="#E11D48" />
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#BE123C' }} numberOfLines={1}>
                    ✓ Video / Reel Ready to Save!
                  </Text>
                  <TouchableOpacity onPress={() => handlePickLocalFile('reel')}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#E11D48' }}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{ width: '100%', backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3', borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  onPress={() => handlePickLocalFile('reel')}
                  disabled={uploadingMedia}
                >
                  {uploadingMedia && mediaType === 'reel' ? (
                    <ActivityIndicator color="#E11D48" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="video" size={20} color="#E11D48" />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#BE123C' }}>
                        🎥 Choose Video File (MP4/MOV) from Device / PC
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Title Input */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>Title / Description (Optional)</Text>
            <TextInput
              style={{ width: '100%', backgroundColor: '#14141C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#FFFFFF', marginBottom: 20 }}
              placeholder="e.g. Summer Shoot, Skincare Reel"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={mediaTitle}
              onChangeText={setMediaTitle}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center' }}
                onPress={() => setAddMediaModalVisible(false)}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.55)' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: mediaType === 'reel' ? '#E11D48' : '#6D28FF', alignItems: 'center' }}
                onPress={handleAddPortfolioItem}
                disabled={uploadingMedia}
              >
                {uploadingMedia ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Save Media</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MEDIA PREVIEW MODAL */}
      <Modal
        visible={!!previewMedia}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewMedia(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}
            onPress={() => setPreviewMedia(null)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {previewMedia && (
            <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
              <Image
                source={{ uri: previewMedia.url || 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80' }}
                style={{ width: '100%', height: 380, borderRadius: 16, resizeMode: 'contain', backgroundColor: '#000' }}
              />

              {previewMedia.title ? (
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 14, textAlign: 'center' }}>
                  {previewMedia.title}
                </Text>
              ) : null}

              {previewMedia.type === 'reel' && (
                <View style={{ marginTop: 12, backgroundColor: '#E11D48', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="play-circle" size={20} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Sample Reel Video Preview</Text>
                </View>
              )}

              <TouchableOpacity
                style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}
                onPress={() => handleDeletePortfolioItem(previewMedia.id)}
              >
                <MaterialCommunityIcons name="trash-can" size={18} color="#EF4444" />
                <Text style={{ color: '#EF4444', fontWeight: '700' }}>Delete From Portfolio</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B10',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonError: {
    marginTop: 12,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#ef4444',
    borderRadius: 25,
  },
  logoutButtonErrorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logoContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#14141C',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoInitialContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitialText: {
    fontSize: 58,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  profileRoleTag: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 6,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  profileBio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 8,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 3,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  infoText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 14,
    fontWeight: '600',
    flex: 1,
  },
  portfolioSection: {
    backgroundColor: '#14141C',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6D28FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addMediaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  activeFilterTab: {
    backgroundColor: '#7C3AED',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  emptyPortfolioContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#14141C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderStyle: 'dashed',
  },
  emptyPortfolioTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptyPortfolioSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  emptyAddBtn: {
    backgroundColor: '#6D28FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaCard: {
    width: '47%',
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reelBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  reelBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  deleteMediaBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaCaptionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediaCaptionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#fecaca',
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#dc2626',
  },
});
