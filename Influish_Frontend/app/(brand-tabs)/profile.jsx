/**
 * Brand Profile Screen - Production-Ready APK-Safe Implementation
 * 
 * BRAND ONLY - NO ROLE DETECTION - NO INFLUENCER LOGIC
 * 
 * ARCHITECTURE:
 * - Single useEffect for lifecycle management
 * - useRef for mount state tracking
 * - HARDCODED to brand API endpoint only
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


/* ================= BRAND PROFILE COMPONENT ================= */
export default function BrandProfile() {
  const router = useRouter();
  
  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lifecycle safety
  const isMountedRef = useRef(true);

  /**
   * SINGLE useEffect for brand profile initialization
   * - Check auth token
   * - Fetch BRAND profile only
   * - No role detection
   */
  useEffect(() => {
    isMountedRef.current = true;
    loadBrandProfile();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Load brand profile with defensive guards
   */
  const loadBrandProfile = async () => {
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

      // Step 2: Fetch BRAND profile from API (no role detection)
      await fetchBrandProfileData(token);

    } catch (err) {
      console.error('❌ Brand profile load error:', err);
      if (isMountedRef.current) {
        setError('Failed to load profile');
        setLoading(false);
      }
    }
  };

  /**
   * Fetch brand profile from BRAND API ONLY
   * NO ROLE DETECTION - HARDCODED TO BRAND ENDPOINT
   */
  const fetchBrandProfileData = async (token) => {
    if (!isMountedRef.current) return;

    // BRAND ONLY - Hardcoded endpoint
    const apiEndpoint = API.BRANDS.PROFILE;

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
    console.log('📡 Fetching brand profile from:', url);

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
      console.log('📊 Brand profile response:', data);

      // Strict validation - check for data or data.profile
      if (response.ok && data) {
        if (isMountedRef.current) {
          // Handle both response formats: {profile: {...}} or direct {...}
          const profileData = data.profile || data;
          setProfile(profileData);
          setLoading(false);
          setError(null);
        }
      } else {
        console.error('❌ Invalid brand profile response');
        if (isMountedRef.current) {
          setError(data.message || 'Failed to load brand profile');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('❌ Brand profile fetch error:', err);
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
        console.log('🚪 Brand logging out...');
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
   * Navigate to Create Campaign
   */
  const handleCreateCampaign = () => {
    if (!isMountedRef.current) return;
    router.push('/(brand-tabs)/create');
  };

  /**
   * Navigate to Edit Profile
   */
  const handleEditProfile = () => {
    if (!isMountedRef.current) return;
    router.push('/(auth)/complete-brand-profile');
  };

  /**
   * Get brand initial letter for display
   */
  const getBrandInitial = () => {
    if (!profile) return 'B';
    const name = profile.company_name || profile.name || profile.brand_name || 'Brand';
    return name.charAt(0).toUpperCase();
  };

  /**
   * Check if brand has a valid logo image
   */
  const hasValidLogo = () => {
    const logoUri = profile?.logo || profile?.profile_image || profile?.company_logo;
    if (logoUri) {
      const uri = String(logoUri).trim();
      return uri.startsWith('http://') || uri.startsWith('https://');
    }
    return false;
  };

  /**
   * Get safe brand logo URI
   * - Only accept valid http/https URLs
   * - Fallback to local placeholder
   * - Android decoder safe
   */
  const getBrandLogoSource = () => {
    const logoUri = profile?.logo || profile?.profile_image || profile?.company_logo;
    
    if (logoUri) {
      const uri = String(logoUri).trim();
      if (uri.startsWith('http://') || uri.startsWith('https://')) {
        return { uri };
      }
    }
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
          <Text style={styles.loadingText}>Loading brand profile...</Text>
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
            {error || 'Unable to load brand profile'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadBrandProfile}
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
  const brandName = profile.company_name || profile.name || profile.brand_name || 'Brand';
  const brandBio = profile.category || profile.bio || profile.description || '';
  const brandLocation = profile.address || profile.location || 'Not set';
  const brandEmail = profile.email || 'Not set';
  const brandPhone = profile.phone || 'Not set';
  const brandWebsite = profile.website || 'Not set';
  
  // Brand-specific stats (live database counts)
  const campaigns = getSafeStatValue(profile.total_campaigns ?? profile.campaigns ?? profile.campaigns_count ?? profile.totalCampaigns, 0);
  const activeCampaigns = getSafeStatValue(profile.active_campaigns ?? profile.activeCampaigns, 0);
  const collaborations = getSafeStatValue(profile.total_collabs ?? profile.collabs_count ?? profile.collaborations ?? profile.collaborations_count, 0);

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
              {hasValidLogo() ? (
                <Image
                  source={getBrandLogoSource()}
                  style={styles.logo}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.logoInitialContainer}>
                  <Text style={styles.logoInitialText}>{getBrandInitial()}</Text>
                </View>
              )}
            </View>
            <Text style={styles.brandName}>{brandName}</Text>
            {brandBio ? (
              <Text style={styles.brandBio}>{brandBio}</Text>
            ) : null}
            
            {/* Edit Profile Button */}
            <TouchableOpacity 
              style={styles.editProfileButton} 
              onPress={handleEditProfile}
            >
              <MaterialCommunityIcons name="pencil" size={18} color={PRIMARY_COLOR} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <StatCard
              icon="rocket-launch"
              value={campaigns}
              label="Campaigns"
            />
            <StatCard
              icon="play-circle"
              value={activeCampaigns}
              label="Active"
            />
            <StatCard
              icon="account-group"
              value={collaborations}
              label="Collabs"
            />
          </View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons 
                name="email" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{brandEmail}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons 
                name="phone" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{brandPhone}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{brandLocation}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons 
                name="web" 
                size={20} 
                color={PRIMARY_COLOR} 
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Website</Text>
                <Text style={styles.infoValue}>{brandWebsite}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton, { width: '100%' }]} 
              onPress={handleCreateCampaign}
            >
              <MaterialCommunityIcons name="plus-circle" size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>New Campaign</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F0FDFA', borderColor: '#CCFBF1', borderWidth: 1, width: '100%' }]} 
              onPress={() => router.push('/wallet')}
            >
              <MaterialCommunityIcons name="wallet" size={24} color="#0D9488" />
              <Text style={[styles.actionButtonText, { color: '#0F766E', fontWeight: '700' }]}>💳 Brand Wallet & Escrow Funds (Available: ₹{(brandProfile?.wallet_balance || 0).toLocaleString('en-IN')})</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { width: '100%' }]} 
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
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandBio: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.95,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
    marginBottom: 12,
    lineHeight: 22,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY_COLOR,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 18,
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
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoContent: {
    flex: 1,
    marginLeft: 14,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 5,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
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
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
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
