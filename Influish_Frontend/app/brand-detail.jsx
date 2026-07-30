import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthHeader } from '../utils/storage';
import { API, API_CONFIG } from '../constants/api';

const APPLIED_CAMPAIGNS_KEY = '@creator_applied_campaign_ids';

const DEFAULT_COMPANY_CAMPAIGNS = [
  {
    id: 'c1',
    campaign_name: 'Apex Pro Whey Shake Unboxing & Fitness Review',
    content_type: 'Reel',
    number_of_seats: 10,
    cost_per_influencer: 8500,
    influencer_location: 'Bandra West, Mumbai',
    status: 'active',
  },
  {
    id: 'c2',
    campaign_name: 'Pre-Workout Energy Drink Launch Reel',
    content_type: 'Reel',
    number_of_seats: 8,
    cost_per_influencer: 12000,
    influencer_location: 'Delhi NCR & Pan India',
    status: 'active',
  },
  {
    id: 'c3',
    campaign_name: 'Gymwear Lifestyle Apparel Lookbook',
    content_type: 'Post & Story',
    number_of_seats: 15,
    cost_per_influencer: 6500,
    influencer_location: 'Bengaluru, Karnataka',
    status: 'active',
  },
  {
    id: 'c4',
    campaign_name: 'BCAA Fitness Hydration Summer Special',
    content_type: 'Reel',
    number_of_seats: 12,
    cost_per_influencer: 9500,
    influencer_location: 'Hyderabad & Pune',
    status: 'active',
  },
];

const THEME = {
  bg: '#0B0B10',
  cardBg: '#181824',
  primary: '#7C3AED',
  primaryDark: '#6D28FF',
  primaryLight: '#A855F7',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.65)',
  border: 'rgba(255,255,255,0.12)',
  success: '#10B981',
};

export default function BrandDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const brandId = params.brandId || params.id;
  const passedName = params.name || params.companyName;

  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);

  useEffect(() => {
    fetchBrandProfile();
    loadAppliedCampaigns();
  }, [brandId]);

  const loadAppliedCampaigns = async () => {
    try {
      const stored = await AsyncStorage.getItem(APPLIED_CAMPAIGNS_KEY);
      if (stored) {
        setAppliedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading applied IDs:', e);
    }
  };

  const fetchBrandProfile = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const targetId = brandId || 'sample';
      const url = `${API_CONFIG.BASE_URL}/api/brands/public/${targetId}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setBrand(data.profile);
        }
      } else {
        setBrand({
          company_name: passedName || 'Apex Pro Fitness',
          category: 'Health & Fitness',
          address: 'Bandra West, Mumbai, Maharashtra 400050',
          profile_image: params.logo || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500',
          total_campaigns: 4,
          active_campaigns: 4,
          total_collabs: 14,
          verified: true,
          description: 'Leading performance fitness & wellness brand empowering athletes and fitness creators across India.'
        });
      }

      // Fetch all campaigns by this brand
      const campUrl = `${API_CONFIG.BASE_URL}${API.CAMPAIGNS.ACTIVE_ALL}`;
      const campRes = await fetch(campUrl, { headers });
      if (campRes.ok) {
        const campData = await campRes.json();
        const list = campData.campaigns || campData.data || [];
        if (list.length > 0) {
          setCampaigns(list);
        } else {
          setCampaigns(DEFAULT_COMPANY_CAMPAIGNS);
        }
      } else {
        setCampaigns(DEFAULT_COMPANY_CAMPAIGNS);
      }
    } catch (err) {
      console.error('Error loading brand profile:', err);
      setBrand({
        company_name: passedName || 'Apex Pro Fitness',
        category: 'Health & Fitness',
        address: 'Bandra West, Mumbai, Maharashtra 400050',
        profile_image: params.logo || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500',
        total_campaigns: 4,
        active_campaigns: 4,
        total_collabs: 14,
        verified: true,
        description: 'Leading performance fitness & wellness brand empowering athletes and fitness creators across India.'
      });
      setCampaigns(DEFAULT_COMPANY_CAMPAIGNS);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPress = async (campaign) => {
    const cId = campaign.id || campaign._id;
    if (appliedIds.includes(cId)) {
      Alert.alert(
        'Already Applied! 🎯',
        `You have already submitted an application for "${campaign.campaign_name || 'this campaign'}". The brand team is reviewing your profile and will get back to you soon!`
      );
      return;
    }

    // Save to applied IDs and state
    const updated = [...appliedIds, cId];
    setAppliedIds(updated);
    await AsyncStorage.setItem(APPLIED_CAMPAIGNS_KEY, JSON.stringify(updated));

    router.push({
      pathname: '/campaigns',
      params: { campaignId: cId, openApply: 'true' }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Loading company profile...</Text>
      </View>
    );
  }

  const companyName = brand?.company_name || brand?.companyName || passedName || 'Company Profile';
  const category = brand?.category || 'Verified Brand';
  const address = brand?.address || brand?.location || 'Mumbai, Maharashtra';
  const profileImage = brand?.profile_image || brand?.logo;
  const displayCampaigns = campaigns.length > 0 ? campaigns : DEFAULT_COMPANY_CAMPAIGNS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      {/* Header Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack && router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/home');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Company Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Card Header */}
        <LinearGradient
          colors={['#1F1135', '#120A21']}
          style={styles.profileBannerCard}
        >
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{companyName.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            )}
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={18} color="#10B981" />
            </View>
          </View>

          <Text style={styles.companyName}>{companyName}</Text>

          <View style={styles.categoryPill}>
            <MaterialCommunityIcons name="tag-outline" size={14} color={THEME.primaryLight} />
            <Text style={styles.categoryText}>{category}</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color={THEME.textMuted} />
            <Text style={styles.locationText}>{address}</Text>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="bullhorn-outline" size={22} color={THEME.primaryLight} />
            <Text style={styles.statValue}>{displayCampaigns.length}</Text>
            <Text style={styles.statLabel}>Campaigns</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="handshake-outline" size={22} color={THEME.success} />
            <Text style={styles.statValue}>{brand?.total_collabs || 14}</Text>
            <Text style={styles.statLabel}>Collabs</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="certificate" size={22} color="#F59E0B" />
            <Text style={styles.statValue}>4.9 ★</Text>
            <Text style={styles.statLabel}>Trust Score</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>About Company</Text>
          <Text style={styles.descriptionText}>
            {brand?.description || `${companyName} is a verified brand on Fluencer offering premium collaboration opportunities to creators and influencers.`}
          </Text>
        </View>

        {/* ALL COMPANY CAMPAIGNS SECTION */}
        <View style={styles.campaignsHeaderRow}>
          <Text style={styles.campaignsHeaderTitle}>Company Campaigns</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{displayCampaigns.length} Active</Text>
          </View>
        </View>

        {displayCampaigns.map((camp, index) => (
          <View key={camp.id || index} style={styles.companyCampaignCard}>
            <View style={styles.campCardHeader}>
              <Text style={styles.campTitle} numberOfLines={2}>
                {camp.campaign_name || camp.name || 'Campaign Opportunity'}
              </Text>
              {appliedIds.includes(camp.id || camp._id) ? (
                <View style={styles.completedPill}>
                  <MaterialCommunityIcons name="check-all" size={13} color="#A855F7" />
                  <Text style={styles.completedPillText}>Completed</Text>
                </View>
              ) : (
                <View style={styles.activePill}>
                  <MaterialCommunityIcons name="check-circle" size={12} color="#10B981" />
                  <Text style={styles.activePillText}>Active</Text>
                </View>
              )}
            </View>

            <View style={styles.campLocationRow}>
              <Ionicons name="location-outline" size={13} color={THEME.textMuted} />
              <Text style={styles.campLocationText}>{camp.influencer_location || address}</Text>
            </View>

            {/* Campaign Pills */}
            <View style={styles.pillsRow}>
              <View style={styles.pillItem}>
                <MaterialCommunityIcons name="instagram" size={14} color={THEME.primaryLight} />
                <Text style={styles.pillText}>{camp.content_type || 'Reel'}</Text>
              </View>

              <View style={styles.pillItem}>
                <MaterialCommunityIcons name="account-group" size={14} color={THEME.primaryLight} />
                <Text style={styles.pillText}>{camp.number_of_seats || 10} seats</Text>
              </View>

              <View style={styles.pillItemPay}>
                <MaterialCommunityIcons name="currency-inr" size={14} color={THEME.success} />
                <Text style={styles.pillTextPay}>₹{camp.cost_per_influencer || camp.price || 8500}</Text>
              </View>
            </View>

            {/* Action Apply / Completed Button */}
            {appliedIds.includes(camp.id || camp._id) ? (
              <TouchableOpacity
                style={styles.completedBtn}
                onPress={() => handleApplyPress(camp)}
                activeOpacity={0.85}
              >
                <View style={styles.completedGradient}>
                  <MaterialCommunityIcons name="check-decagram" size={18} color="#A855F7" />
                  <Text style={styles.completedBtnText}>Application Completed ✓</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => handleApplyPress(camp)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[THEME.primary, THEME.primaryDark]}
                  style={styles.applyGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.applyBtnText}>Apply Now</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: THEME.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: THEME.textMuted,
    marginTop: 12,
    fontSize: 14,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: {
    padding: 6,
  },
  shareButton: {
    padding: 6,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileBannerCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: THEME.primaryLight,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0B0B10',
    borderRadius: 12,
    padding: 2,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.primaryLight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: THEME.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: THEME.textMuted,
    lineHeight: 22,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.primaryLight,
  },
  campaignsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 14,
  },
  campaignsHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.text,
  },
  countBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.primaryLight,
  },
  companyCampaignCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 14,
  },
  campCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  campTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    flex: 1,
    lineHeight: 22,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.success,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  completedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.primaryLight,
  },
  campLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  campLocationText: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text,
  },
  pillItemPay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  pillTextPay: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.success,
  },
  applyBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  completedBtn: {
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    overflow: 'hidden',
  },
  completedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  completedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primaryLight,
  },
  appliedBtn: {
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    overflow: 'hidden',
  },
  appliedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  appliedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
});
