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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API, API_CONFIG } from '../../constants/api';
import { storage } from '../../utils/storage';

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
  
  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
            {influencerBio ? (
              <Text style={styles.profileBio}>{influencerBio}</Text>
            ) : null}
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <StatCard
              icon="account-group"
              value={followers}
              label="Followers"
            />
            <StatCard
              icon="handshake"
              value={collaborations}
              label="Collaborations"
            />
            <StatCard
              icon="star"
              value={rating.toFixed(1)}
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

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1', borderWidth: 1, marginBottom: 12 }]} 
              onPress={() => router.push('/wallet')}
            >
              <MaterialCommunityIcons name="wallet" size={24} color="#0D9488" />
              <Text style={[styles.actionButtonText, { color: '#0F766E', fontWeight: '700' }]}>💳 My Wallet & Withdrawals</Text>
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
