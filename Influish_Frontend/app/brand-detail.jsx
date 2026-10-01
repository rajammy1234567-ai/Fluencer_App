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
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthHeader } from '../utils/storage';
import { API, API_CONFIG, getApiUrl } from '../constants/api';

const APPLIED_CAMPAIGNS_KEY = '@creator_applied_campaign_ids';

const DEFAULT_COMPANY_CAMPAIGNS = [];

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

  // UGC Moderation State
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('harassment');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);

  useEffect(() => {
    fetchBrandProfile();
    loadAppliedCampaigns();
  }, [brandId]);

  const loadAppliedCampaigns = async () => {
    try {
      const stored = await AsyncStorage.getItem(APPLIED_CAMPAIGNS_KEY);
      let localApplied = stored ? JSON.parse(stored) : [];

      try {
        const headers = await getAuthHeader();
        const res = await fetch(getApiUrl('/api/campaigns/active/all'), { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.campaigns && Array.isArray(data.campaigns)) {
            const serverApplied = data.campaigns
              .filter((c) => c.already_applied || c.application_status || c.is_applied)
              .map((c) => c.id || c._id);
            localApplied = Array.from(new Set([...localApplied, ...serverApplied]));
          }
        }
      } catch (err) {
        console.log('Server applied check note:', err);
      }

      setAppliedIds(localApplied);
    } catch (e) {
      console.error('Error loading applied IDs:', e);
    }
  };

  const fetchBrandProfile = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const targetId = brandId || 'sample';

      // 1. Fetch active campaigns to get campaign & brand details
      let allCampaigns = [];
      let targetCampaign = null;
      try {
        const campRes = await fetch(getApiUrl(API.CAMPAIGNS.ACTIVE_ALL), { headers });
        if (campRes.ok) {
          const campData = await campRes.json();
          allCampaigns = campData.campaigns || campData.data || [];
          targetCampaign = allCampaigns.find(c =>
            String(c.id || c._id) === String(targetId) ||
            String(c.brand_id || c.brandId) === String(targetId) ||
            (passedName && (c.brand_name === passedName || c.company_name === passedName || c.campaign_name === passedName))
          );
        }
      } catch (campErr) {
        console.warn('Campaigns fetch note:', campErr);
      }

      const realBrandId = targetCampaign?.brand_id || targetId;
      const fallbackName = targetCampaign?.brand_name || targetCampaign?.company_name || passedName || 'Brand Partner';
      const fallbackCategory = targetCampaign?.brand_category || 'Fashion & Apparel';
      const fallbackLogo = targetCampaign?.brand_image || params.logo || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
      const fallbackDesc = targetCampaign?.brand_description || 'Brand partner offering campaign collaboration opportunities.';

      // 2. Fetch brand profile from backend API
      let loadedProfile = null;
      try {
        const url = getApiUrl(`/api/brands/public/${realBrandId}`);
        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            loadedProfile = data.profile;
          }
        }
      } catch (pErr) {
        console.warn('Public brand profile note:', pErr);
      }

      // 3. Filter all campaigns belonging to this brand
      let brandCampaigns = [];
      if (allCampaigns.length > 0) {
        const searchName = (loadedProfile?.company_name || fallbackName).toLowerCase();
        brandCampaigns = allCampaigns.filter(c => {
          const cBrandId = String(c.brand_id || c.brandId || '');
          const cCompName = (c.company_name || c.brand_name || '').toLowerCase();
          return (
            (realBrandId && cBrandId === String(realBrandId)) ||
            (searchName && cCompName === searchName) ||
            (targetCampaign && String(c.id || c._id) === String(targetCampaign.id || targetCampaign._id))
          );
        });
      }

      if (brandCampaigns.length === 0 && targetCampaign) {
        brandCampaigns = [targetCampaign];
      }

      const targetUserId = loadedProfile?.user_id || loadedProfile?._id || realBrandId;

      setBrand({
        user_id: targetUserId,
        company_name: loadedProfile?.company_name || fallbackName,
        category: loadedProfile?.category || fallbackCategory,
        address: loadedProfile?.address || targetCampaign?.influencer_location || 'Verified Brand Location',
        profile_image: loadedProfile?.profile_image || fallbackLogo,
        total_campaigns: loadedProfile?.total_campaigns || brandCampaigns.length,
        active_campaigns: loadedProfile?.active_campaigns || brandCampaigns.length,
        total_collabs: loadedProfile?.total_collabs || 0,
        verified: true,
        description: loadedProfile?.description || fallbackDesc,
      });

      if (targetUserId) {
        try {
          const modRes = await fetch(getApiUrl(`/api/moderation/status/${targetUserId}`), { headers });
          if (modRes.ok) {
            const modData = await modRes.json();
            if (modData.success) {
              setIsBlocked(!!modData.isBlocked);
              setBlockedByMe(!!modData.blockedByMe);
            }
          }
        } catch (modErr) {
          console.warn('Moderation status check note:', modErr);
        }
      }

      setCampaigns(brandCampaigns);

    } catch (err) {
      console.error('Error loading brand profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockBrand = () => {
    const targetUserId = brand?.user_id || brandId;
    if (!targetUserId) return;
    Alert.alert(
      'Block Brand?',
      `Are you sure you want to block ${brand?.company_name || 'this brand'}? You will no longer receive communications, proposals, or messages from them.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getAuthHeader();
              const res = await fetch(getApiUrl('/api/moderation/block'), {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId, reason: 'user_request' }),
              });
              const data = await res.json();
              if (res.ok && data.success) {
                setIsBlocked(true);
                setBlockedByMe(true);
                setShowActionMenu(false);
                Alert.alert('Brand Blocked', 'This brand has been blocked.');
              } else {
                Alert.alert('Error', data.message || 'Failed to block brand');
              }
            } catch (e) {
              Alert.alert('Error', e.message || 'Network error while blocking');
            }
          },
        },
      ]
    );
  };

  const handleUnblockBrand = () => {
    const targetUserId = brand?.user_id || brandId;
    if (!targetUserId) return;
    Alert.alert(
      'Unblock Brand?',
      `Allow ${brand?.company_name || 'this brand'} to contact and collaborate with you again?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              const headers = await getAuthHeader();
              const res = await fetch(getApiUrl('/api/moderation/unblock'), {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId }),
              });
              const data = await res.json();
              if (res.ok && data.success) {
                setIsBlocked(false);
                setBlockedByMe(false);
                setShowActionMenu(false);
                Alert.alert('Brand Unblocked', 'This brand has been unblocked.');
              } else {
                Alert.alert('Error', data.message || 'Failed to unblock brand');
              }
            } catch (e) {
              Alert.alert('Error', e.message || 'Network error while unblocking');
            }
          },
        },
      ]
    );
  };

  const handleSubmitReport = async () => {
    const reportedUserId = brand?.user_id || brandId;
    if (!reportedUserId) {
      Alert.alert('Notice', 'Unable to determine brand identity to report.');
      return;
    }
    setSubmittingReport(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(getApiUrl('/api/moderation/report'), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedUserId,
          contentType: 'user',
          reason: reportReason,
          details: reportDetails,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowReportModal(false);
        setReportDetails('');
        Alert.alert(
          'Report Submitted',
          'Thank you. Our moderation team reviews reports within 24 hours. Zero tolerance is enforced for objectionable content or bad faith behavior.'
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to submit report');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Network error while submitting report');
    } finally {
      setSubmittingReport(false);
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
        <TouchableOpacity
          style={styles.menuHeaderButton}
          onPress={() => setShowActionMenu(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Blocked Alert Banner */}
      {isBlocked && (
        <View style={styles.blockedBanner}>
          <Ionicons name="shield-outline" size={18} color="#EF4444" />
          <Text style={styles.blockedBannerText}>
            {blockedByMe ? 'You have blocked this brand.' : 'Communications are restricted.'}
          </Text>
          {blockedByMe && (
            <TouchableOpacity onPress={handleUnblockBrand} style={styles.unblockBannerBtn}>
              <Text style={styles.unblockBannerBtnText}>Unblock</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
                  <MaterialCommunityIcons name="check-decagram" size={13} color="#A855F7" />
                  <Text style={styles.completedPillText}>Already Applied</Text>
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

      {/* Moderation Action Menu Modal */}
      <Modal
        visible={showActionMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionMenu(false)}
        >
          <View style={styles.actionMenuCard}>
            <Text style={styles.actionMenuTitle}>{companyName}</Text>
            <Text style={styles.actionMenuSubtitle}>Safety & Moderation Options</Text>

            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowActionMenu(false);
                setShowReportModal(true);
              }}
            >
              <Ionicons name="flag-outline" size={20} color="#F59E0B" />
              <View style={styles.actionMenuTextContainer}>
                <Text style={styles.actionMenuItemText}>Report Brand</Text>
                <Text style={styles.actionMenuItemSubtext}>Flag scam, harassment or policy violations</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowActionMenu(false);
                if (isBlocked && blockedByMe) {
                  handleUnblockBrand();
                } else {
                  handleBlockBrand();
                }
              }}
            >
              <Ionicons
                name={isBlocked && blockedByMe ? 'checkmark-circle-outline' : 'ban-outline'}
                size={20}
                color={isBlocked && blockedByMe ? '#10B981' : '#EF4444'}
              />
              <View style={styles.actionMenuTextContainer}>
                <Text style={[styles.actionMenuItemText, { color: isBlocked && blockedByMe ? '#10B981' : '#EF4444' }]}>
                  {isBlocked && blockedByMe ? 'Unblock Brand' : 'Block Brand'}
                </Text>
                <Text style={styles.actionMenuItemSubtext}>
                  {isBlocked && blockedByMe
                    ? 'Allow brand to communicate and collaborate'
                    : 'Prevent messages, offers, and collaborations'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionMenuCancelBtn}
              onPress={() => setShowActionMenu(false)}
            >
              <Text style={styles.actionMenuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModalCard}>
            <View style={styles.reportModalHeader}>
              <Ionicons name="flag" size={22} color="#F59E0B" />
              <Text style={styles.reportModalTitle}>Report {companyName}</Text>
            </View>

            <Text style={styles.reportSectionLabel}>Select Violation Reason:</Text>
            {[
              { id: 'harassment', label: 'Harassment or Bullying' },
              { id: 'scam_fraud', label: 'Scam, Fraud, or Deception' },
              { id: 'inappropriate_content', label: 'Inappropriate or Explicit Content' },
              { id: 'spam', label: 'Spam or Commercial Solicitation' },
              { id: 'hate_speech', label: 'Hate Speech or Discrimination' },
              { id: 'other', label: 'Other Safety Concern' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.reasonOption,
                  reportReason === option.id && styles.reasonOptionSelected,
                ]}
                onPress={() => setReportReason(option.id)}
              >
                <Ionicons
                  name={reportReason === option.id ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={reportReason === option.id ? THEME.primaryLight : THEME.textMuted}
                />
                <Text
                  style={[
                    styles.reasonOptionText,
                    reportReason === option.id && styles.reasonOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.reportSectionLabel, { marginTop: 12 }]}>Additional Details (Optional):</Text>
            <TextInput
              style={styles.reportTextInput}
              placeholder="Describe what occurred..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={reportDetails}
              onChangeText={setReportDetails}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.reportDisclaimer}>
              Reports are confidentially investigated by our 24/7 moderation team under our Zero Tolerance Policy.
            </Text>

            <View style={styles.reportActionRow}>
              <TouchableOpacity
                style={styles.reportCancelBtn}
                onPress={() => setShowReportModal(false)}
                disabled={submittingReport}
              >
                <Text style={styles.reportCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reportSubmitBtn}
                onPress={handleSubmitReport}
                disabled={submittingReport}
              >
                {submittingReport ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.reportSubmitBtnText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  menuHeaderButton: {
    padding: 6,
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  blockedBannerText: {
    flex: 1,
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
  },
  unblockBannerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unblockBannerBtnText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionMenuCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#181824',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionMenuTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionMenuSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.55)',
    marginBottom: 16,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  actionMenuTextContainer: {
    flex: 1,
  },
  actionMenuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionMenuItemSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  actionMenuCancelBtn: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  actionMenuCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  reportModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#181824',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  reportModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reportModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  reportSectionLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 6,
    gap: 10,
  },
  reasonOptionSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  reasonOptionText: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  reasonOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reportTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 13.5,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  reportDisclaimer: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 10,
    lineHeight: 16,
  },
  reportActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
  },
  reportCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  reportCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  reportSubmitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
  },
  reportSubmitBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
