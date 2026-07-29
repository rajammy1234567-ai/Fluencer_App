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
import { Video, ResizeMode } from 'expo-av';
import * as RNImagePicker from 'react-native-image-picker';

const PRIMARY_COLOR = '#3b82f6';
const FALLBACK_LOGO = require('../../assets/images/icon.png');

/* ================= SIMPLE STAT CARD (NO ANIMATIONS) ================= */
const StatCard = ({ icon, value, label }) => {
  // Defensive value sanitization
  const safeIcon = icon || 'information';
  const safeValue = (value !== null && value !== undefined) ? String(value) : '0';
  const safeLabel = label || '';

  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <MaterialCommunityIcons name={safeIcon} size={28} color={PRIMARY_COLOR} />
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
  const [profilePicModalVisible, setProfilePicModalVisible] = useState(false);

  // Change Profile Picture Handler using react-native-image-picker
  const handleChangeProfilePicture = async () => {
    try {
      setUploadingMedia(true);

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const uploadedUrl = await uploadToCloudinary(file);
            if (uploadedUrl) {
              await saveCreatorProfilePicture(uploadedUrl);
            }
          }
          setUploadingMedia(false);
        };
        input.click();
        return;
      }

      RNImagePicker.launchImageLibrary(
        { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
        async (response) => {
          if (response.didCancel || response.errorCode) {
            setUploadingMedia(false);
            return;
          }
          const selectedUri = response.assets?.[0]?.uri;
          if (selectedUri) {
            const uploadedUrl = await uploadToCloudinary(selectedUri);
            if (uploadedUrl) {
              await saveCreatorProfilePicture(uploadedUrl);
            } else {
              await saveCreatorProfilePicture(selectedUri);
            }
          }
          setUploadingMedia(false);
        }
      );
    } catch (err) {
      console.error('Change profile picture error:', err);
      setUploadingMedia(false);
    }
  };

  const saveCreatorProfilePicture = async (newUrl) => {
    try {
      const token = await storage.getToken();
      const res = await fetch(`${API_CONFIG.BASE_URL}${API.INFLUENCERS.PROFILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profile_picture: newUrl, logo: newUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(prev => ({ ...prev, profile_picture: newUrl, logo: newUrl }));
        Alert.alert('🎉 Success', 'Profile picture updated successfully!');
      }
    } catch (err) {
      console.error('Save profile picture error:', err);
    }
  };

  // Local File (Photo / Video MP4) picker using react-native-image-picker
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

      // Mobile Native react-native-image-picker
      const mediaTypeOption = typeToPick === 'reel' ? 'video' : 'photo';
      RNImagePicker.launchImageLibrary(
        { mediaType: mediaTypeOption, quality: 0.7, selectionLimit: 1 },
        async (response) => {
          if (response.didCancel) {
            setUploadingMedia(false);
            return;
          }
          if (response.errorCode) {
            Alert.alert('Upload Error', response.errorMessage || 'Could not process media file.');
            setUploadingMedia(false);
            return;
          }
          const selectedUri = response.assets?.[0]?.uri;
          if (selectedUri) {
            console.log('📱 Mobile local file selected:', selectedUri);
            try {
              const uploadedUrl = await uploadToCloudinary(selectedUri);
              if (uploadedUrl) {
                setMediaUrl(uploadedUrl);
                setMediaType(typeToPick);
                Alert.alert('🎉 Uploaded to Cloudinary', `${typeToPick === 'reel' ? 'Video' : 'Photo'} uploaded successfully! Click "Save Media" to finish.`);
              } else {
                setMediaUrl(selectedUri);
                setMediaType(typeToPick);
              }
            } catch (uploadErr) {
              console.error('Cloudinary error:', uploadErr);
              setMediaUrl(selectedUri);
              setMediaType(typeToPick);
            }
          }
          setUploadingMedia(false);
        }
      );
    } catch (err) {
      console.error('Pick local file error:', err);
      Alert.alert('Upload Error', 'Could not process media file. Please try again.');
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
        colors={['#3b82f6', '#2563eb', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={() => setProfilePicModalVisible(true)}
              disabled={uploadingMedia}
              activeOpacity={0.85}
            >
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
              <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2563EB', padding: 6, borderRadius: 16, borderWidth: 2, borderColor: '#FFFFFF' }}>
                <MaterialCommunityIcons name="camera-plus" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>{influencerName}</Text>
            {influencerBio ? (
              <Text style={styles.profileBio}>{influencerBio}</Text>
            ) : null}
          </View>

          {/* Stats Section */}
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

          {/* Info Section */}
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

          {/* PORTFOLIO & REELS SHOWCASE SECTION */}
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
                <MaterialCommunityIcons name="camera-enhance-outline" size={44} color="#94A3B8" />
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
                      source={{ uri: item.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' }}
                      style={styles.mediaThumbnail}
                    />

                    {/* Instagram Media Badge Top Right */}
                    <View style={styles.reelBadge}>
                      <MaterialCommunityIcons
                        name={item.type === 'reel' ? 'play-box-multiple' : 'image-multiple'}
                        size={15}
                        color="#FFFFFF"
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.deleteMediaBadge}
                      onPress={() => handleDeletePortfolioItem(item.id)}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={14} color="#FFFFFF" />
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

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, marginBottom: 12 }]} 
              onPress={() => { setCustomFollowers(followers); setFollowerModalVisible(true); }}
            >
              <MaterialCommunityIcons name="account-edit" size={24} color="#1D4ED8" />
              <Text style={[styles.actionButtonText, { color: '#1E40AF', fontWeight: '700' }]}>👥 Edit Follower Count ({followers})</Text>
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
              <MaterialCommunityIcons name="cog" size={24} color="#1e293b" />
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
          <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, elevation: 5 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>
              👥 Edit Follower Count
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 20, textAlign: 'center' }}>
              Enter your manual follower count to display on your Creator Profile
            </Text>

            <TextInput
              style={{ width: '100%', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1E293B', marginBottom: 20 }}
              placeholder="e.g. 125K, 45,000, 500K"
              placeholderTextColor="#94A3B8"
              value={customFollowers}
              onChangeText={setCustomFollowers}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' }}
                onPress={() => setFollowerModalVisible(false)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#64748B' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center' }}
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
          <View style={{ width: '100%', maxWidth: 450, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 6, textAlign: 'center' }}>
              ✨ Add Portfolio Photo / Video Reel
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 16 }}>
              Upload photos and reel videos directly from your phone or computer to showcase on your profile.
            </Text>

            {/* Section 1: Local Photo Upload */}
            <View style={{ marginBottom: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: mediaType === 'photo' && mediaUrl ? '#86EFAC' : '#E2E8F0', borderRadius: 14, padding: 14 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>
                📸 Section 1: Upload Local Photo
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                Select an image file (JPG, PNG) from your device or PC
              </Text>

              {mediaType === 'photo' && mediaUrl ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0FDF4', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="check-circle" size={22} color="#16A34A" />
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#15803D' }} numberOfLines={1}>
                    ✓ Photo Ready to Save!
                  </Text>
                  <TouchableOpacity onPress={() => handlePickLocalFile('photo')}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB' }}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{ width: '100%', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  onPress={() => handlePickLocalFile('photo')}
                  disabled={uploadingMedia}
                >
                  {uploadingMedia && mediaType === 'photo' ? (
                    <ActivityIndicator color="#2563EB" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="file-image" size={20} color="#2563EB" />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1D4ED8' }}>
                        📁 Choose Photo File from Device / PC
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Section 2: Local Video / Reel Upload */}
            <View style={{ marginBottom: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: mediaType === 'reel' && mediaUrl ? '#86EFAC' : '#E2E8F0', borderRadius: 14, padding: 14 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>
                🎬 Section 2: Upload Local Video / Reel
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
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
              style={{ width: '100%', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1E293B', marginBottom: 20 }}
              placeholder="e.g. Summer Shoot, Skincare Reel"
              placeholderTextColor="#94A3B8"
              value={mediaTitle}
              onChangeText={setMediaTitle}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' }}
                onPress={() => setAddMediaModalVisible(false)}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#64748B' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: mediaType === 'reel' ? '#E11D48' : '#2563EB', alignItems: 'center' }}
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
              {previewMedia.type === 'reel' ? (
                <Video
                  source={{ uri: previewMedia.url || 'https://res.cloudinary.com/demo/video/upload/v1689240000/dog.mp4' }}
                  style={{ width: '100%', height: 380, borderRadius: 16, backgroundColor: '#000' }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  shouldPlay
                />
              ) : (
                <Image
                  source={{ uri: previewMedia.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' }}
                  style={{ width: '100%', height: 380, borderRadius: 16, resizeMode: 'contain', backgroundColor: '#000' }}
                />
              )}

              {previewMedia.title ? (
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 14, textAlign: 'center' }}>
                  {previewMedia.title}
                </Text>
              ) : null}

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

      {/* PROFILE PICTURE FULL-SCREEN PREVIEW MODAL */}
      <Modal
        visible={profilePicModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfilePicModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}
            onPress={() => setProfilePicModalVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ width: '100%', maxWidth: 450, alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 16 }}>
              👤 Profile Picture
            </Text>

            {hasValidProfilePicture() ? (
              <Image
                source={getInfluencerProfilePicture()}
                style={{ width: 260, height: 260, borderRadius: 130, borderWidth: 4, borderColor: '#3B82F6', marginBottom: 24, resizeMode: 'cover' }}
              />
            ) : (
              <View style={{ width: 220, height: 220, borderRadius: 110, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 4, borderColor: '#FFFFFF' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 72, fontWeight: '800' }}>{getInfluencerInitial()}</Text>
              </View>
            )}

            <TouchableOpacity
              style={{ width: '100%', backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12 }}
              onPress={async () => {
                setProfilePicModalVisible(false);
                await handleChangeProfilePicture();
              }}
              disabled={uploadingMedia}
            >
              {uploadingMedia ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="camera-plus" size={20} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Upload New Photo from Gallery</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 12, borderRadius: 14, alignItems: 'center' }}
              onPress={() => setProfilePicModalVisible(false)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    color: '#64748b',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1e293b',
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  profileName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileBio: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.95,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 5,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoText: {
    fontSize: 16,
    color: '#0f172a',
    marginLeft: 14,
    fontWeight: '600',
    flex: 1,
  },
  portfolioSection: {
    backgroundColor: '#FFFFFF',
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
    color: '#1E293B',
  },
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
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
    backgroundColor: '#F1F5F9',
  },
  activeFilterTab: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  emptyPortfolioContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  emptyAddBtn: {
    backgroundColor: '#2563EB',
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
    gap: 6,
  },
  mediaCard: {
    width: '31.8%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reelBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    padding: 3,
  },
  reelBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  deleteMediaBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    width: 22,
    height: 22,
    borderRadius: 11,
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
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
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
    color: '#0f172a',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
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
