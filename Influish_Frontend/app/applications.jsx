import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { getAuthHeader } from '../utils/storage';
import { API, getApiUrl } from '../constants/api';
import { router, useLocalSearchParams } from 'expo-router';

// Brand color scheme
const BRAND_COLORS = {
  primary: '#7C3AED',
  primaryDark: '#6D28FF',
  gradientPrimary: ['#7C3AED', '#6D28FF'],
  white: '#FFFFFF',
  textGray: COLORS.textGray || '#6B7280',
  text: COLORS.text || '#FFFFFF',
  background: COLORS.background || '#F8FBFF',
};

export default function ApplicationsScreen() {
  const { campaignId } = useLocalSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState({});
  const [campaignName, setCampaignName] = useState('');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Creator Profile & Portfolio Viewer State
  const [selectedCreatorProfile, setSelectedCreatorProfile] = useState(null);
  const [creatorModalVisible, setCreatorModalVisible] = useState(false);
  const [loadingCreatorProfile, setLoadingCreatorProfile] = useState(false);
  const [creatorPortfolioFilter, setCreatorPortfolioFilter] = useState('all');
  const [creatorPreviewMedia, setCreatorPreviewMedia] = useState(null);

  const handleOpenCreatorProfile = async (influencerId) => {
    setLoadingCreatorProfile(true);
    setCreatorModalVisible(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(getApiUrl(`/api/influencers/profile/${influencerId}`), { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedCreatorProfile(data.profile);
      } else {
        setSelectedCreatorProfile(null);
      }
    } catch (err) {
      console.error('Error fetching creator profile:', err);
    } finally {
      setLoadingCreatorProfile(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [campaignId]);

  const fetchApplications = async () => {
    try {
      const headers = await getAuthHeader();
      
      // If campaignId is provided, fetch only for that campaign
      const url = campaignId 
        ? getApiUrl(`/api/campaigns/${campaignId}/applications`)
        : getApiUrl('/api/campaigns/applications/all');
      
      const response = await fetch(url, { headers });

      const data = await response.json();

      if (response.ok && data.success) {
        setApplications(data.applications || []);
        // Get campaign name from first application
        if (campaignId && data.applications.length > 0) {
          setCampaignName(data.applications[0].campaign_name);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const handleAccept = async (applicationId) => {
    setSelectedApplication(applicationId);
    setShowAcceptModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedApplication) return;
    
    setShowAcceptModal(false);
    setProcessing((prev) => ({ ...prev, [selectedApplication]: true }));

    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        getApiUrl(`/api/campaigns/applications/${selectedApplication}/accept`),
        {
          method: 'POST',
          headers,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const chatId = data.chatId;
        // Auto-refresh the list first
        await fetchApplications();
        
        // APK SAFETY: Validate chatId exists before navigation to prevent Hermes crash
        if (!chatId || chatId === 'undefined') {
          console.error('❌ Accept succeeded but chatId is invalid:', chatId);
          Alert.alert(
            '⚠️ Partial Success',
            'Application accepted, but chat could not be opened. Please find the chat in your messages.',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          if (window.confirm('🎉 Application accepted! Open chat with influencer now?')) {
            if (chatId && chatId !== 'undefined') {
              router.push(`/conversation?chatId=${chatId}`);
            }
          }
        } else {
          Alert.alert(
            '✓ Success',
            'Application accepted! You can now chat with this influencer.',
            [
              {
                text: 'Open Chat',
                style: 'default',
                onPress: () => {
                  if (chatId && chatId !== 'undefined') {
                    router.push(`/conversation?chatId=${chatId}`);
                  }
                },
              },
              {
                text: 'Later',
                style: 'cancel',
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to accept application');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      Alert.alert('Error', 'Failed to accept application');
    } finally {
      setProcessing((prev) => ({ ...prev, [selectedApplication]: false }));
      setSelectedApplication(null);
    }
  };

  const handleReject = async (applicationId) => {
    setSelectedApplication(applicationId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedApplication) return;
    
    setShowRejectModal(false);
    setProcessing((prev) => ({ ...prev, [selectedApplication]: true }));

    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        getApiUrl(`/api/campaigns/applications/${selectedApplication}/reject`),
        {
          method: 'POST',
          headers,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Auto-refresh the list
        await fetchApplications();
        Alert.alert('✓ Success', 'Application has been rejected.');
      } else {
        Alert.alert('Error', data.message || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      Alert.alert('Error', 'Failed to reject application');
    } finally {
      setProcessing((prev) => ({ ...prev, [selectedApplication]: false }));
      setSelectedApplication(null);
    }
  };

  const renderApplication = ({ item }) => {
    const isProcessing = processing[item.id];
    const isPending = item.status === 'pending';
    const isAccepted = item.status === 'accepted';
    const isRejected = item.status === 'rejected';

    const formattedDate = new Date(item.created_at || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <View style={styles.applicationCard}>
        {/* Card Header Row: Status Badge + Date */}
        <View style={styles.cardHeaderRow}>
          <View style={[
            styles.statusBadge,
            isPending && styles.statusPending,
            isAccepted && styles.statusAccepted,
            isRejected && styles.statusRejected,
          ]}>
            <MaterialCommunityIcons
              name={isPending ? "clock-outline" : isAccepted ? "check-circle-outline" : "close-circle-outline"}
              size={13}
              color={isPending ? "#F59E0B" : isAccepted ? "#10B981" : "#EF4444"}
            />
            <Text style={[
              styles.statusText,
              isPending && { color: '#F59E0B' },
              isAccepted && { color: '#10B981' },
              isRejected && { color: '#EF4444' },
            ]}>
              {isPending ? 'PENDING REVIEW' : item.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.appliedDateRow}>
            <MaterialCommunityIcons name="calendar-outline" size={13} color="rgba(255,255,255,0.45)" />
            <Text style={styles.appliedDateText}>Applied on {formattedDate}</Text>
          </View>
        </View>

        {/* Creator Main Header Info */}
        <View style={styles.creatorHeader}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ 
                uri: item.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.influencer_name || 'Creator')}&size=200&background=7c3aed&color=fff`
              }}
              style={styles.creatorAvatar}
            />
            {/* Rating Badge */}
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={11} color="#FBBF24" />
              <Text style={styles.ratingText}>{item.rating || '4.9'}</Text>
            </View>
          </View>

          <View style={styles.creatorMainInfo}>
            <View style={styles.creatorNameRow}>
              <Text style={styles.creatorName} numberOfLines={1}>{item.influencer_name}</Text>
              <MaterialCommunityIcons name="check-decagram" size={17} color="#7C3AED" />
            </View>
            <Text style={styles.creatorCategory}>{item.categories || 'Fashion Creator'}</Text>
            <View style={styles.creatorLocationRow}>
              <MaterialCommunityIcons name="map-marker" size={13} color="#C084FC" />
              <Text style={styles.creatorLocationText}>{item.location || 'India'}</Text>
            </View>
          </View>
        </View>

        {/* 3 Stats Row: Followers | Audience | Campaigns */}
        <View style={styles.statsThreeColRow}>
          <View style={styles.statCol}>
            <View style={styles.statIconValRow}>
              <MaterialCommunityIcons name="instagram" size={16} color="#C084FC" />
              <Text style={styles.statValText}>{item.followers || '54K'}</Text>
            </View>
            <Text style={styles.statLblText}>Followers</Text>
          </View>

          <View style={styles.statCol}>
            <View style={styles.statIconValRow}>
              <MaterialCommunityIcons name="account-group-outline" size={16} color="#C084FC" />
              <Text style={styles.statValText}>{item.audience || '2.3K'}</Text>
            </View>
            <Text style={styles.statLblText}>Audience</Text>
          </View>

          <View style={styles.statCol}>
            <View style={styles.statIconValRow}>
              <MaterialCommunityIcons name="shopping-outline" size={16} color="#C084FC" />
              <Text style={styles.statValText}>{item.collabs || item.collaborations || item.completed_campaigns || '12'}</Text>
            </View>
            <Text style={styles.statLblText}>Campaigns</Text>
          </View>
        </View>

        {/* View Profile & Portfolio Inner Card */}
        <TouchableOpacity
          style={styles.innerPortfolioBtnCard}
          onPress={() => handleOpenCreatorProfile(item.influencer_id || item.user_id)}
          activeOpacity={0.8}
        >
          <View style={styles.innerPortIconBox}>
            <MaterialCommunityIcons name="image-multiple-outline" size={18} color="#C084FC" />
          </View>
          <View style={styles.innerPortTextCol}>
            <Text style={styles.innerPortTitle}>View Profile & Portfolio</Text>
            <Text style={styles.innerPortSub}>Photos • Reels • Collaborations</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        {/* Proposal Message Card */}
        {item.message && (
          <View style={styles.proposalBox}>
            <View style={styles.proposalTitleRow}>
              <MaterialCommunityIcons name="message-text-outline" size={16} color="#A855F7" />
              <Text style={styles.proposalHeaderTitle}>Proposal</Text>
            </View>
            <Text style={styles.proposalBodyText}>{item.message}</Text>
          </View>
        )}

        {/* Action Buttons - Only for Pending */}
        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectOutlineBtn}
              onPress={() => handleReject(item.id)}
              disabled={isProcessing}
              activeOpacity={0.75}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#F87171" />
              ) : (
                <>
                  <MaterialCommunityIcons name="close-circle-outline" size={18} color="#F87171" />
                  <Text style={styles.rejectOutlineBtnText}>Reject</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptSolidBtn}
              onPress={() => handleAccept(item.id)}
              disabled={isProcessing}
              activeOpacity={0.75}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.acceptSolidBtnText}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Chat Button - Only for Accepted */}
        {isAccepted && (
          <TouchableOpacity
            style={styles.chatSolidBtn}
            onPress={() => {
              const targetChatId = item.chat_id || item.id || item._id;
              if (targetChatId) {
                router.push(`/conversation?chatId=${targetChatId}`);
              } else {
                Alert.alert('Info', 'Chat will be available soon');
              }
            }}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="chat-outline" size={18} color="#FFFFFF" />
            <Text style={styles.chatSolidBtnText}>Open Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/(brand-tabs)/record');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark Glassmorphism Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {campaignName || 'Applications'}
            </Text>
            <View style={styles.headerSubtitleRow}>
              <View style={styles.dotBadgePending} />
              <Text style={styles.subBadgePending}>{applications.filter(a => a.status === 'pending').length} Pending</Text>
              <Text style={styles.subDot}>|</Text>
              <View style={styles.dotBadgeAccepted} />
              <Text style={styles.subBadgeAccepted}>{applications.filter(a => a.status === 'accepted').length} Accepted</Text>
              <Text style={styles.subDot}>|</Text>
              <View style={styles.dotBadgeRejected} />
              <Text style={styles.subBadgeRejected}>{applications.filter(a => a.status === 'rejected').length} Rejected</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.filterIconButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="tune-variant" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Banner Card */}
      <View style={styles.topBannerCard}>
        <View style={styles.topBannerLeftIcon}>
          <MaterialCommunityIcons name="account-search-outline" size={22} color="#C084FC" />
        </View>
        <View style={styles.topBannerTextCol}>
          <Text style={styles.topBannerTitle}>View Creator Profile & Portfolio</Text>
          <Text style={styles.topBannerSubtitle}>Check photos, reels and previous brand collaborations.</Text>
        </View>
        <TouchableOpacity
          style={styles.topBannerBtn}
          onPress={() => {
            if (applications.length > 0) {
              const firstApp = applications[0];
              handleOpenCreatorProfile(firstApp.influencer_id || firstApp.user_id);
            } else {
              Alert.alert('Info', 'No creator applications available yet.');
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.topBannerBtnText}>View ➔</Text>
        </TouchableOpacity>
      </View>

      {/* Applications List */}
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BRAND_COLORS.primary}
            colors={[BRAND_COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={64}
              color={BRAND_COLORS.textGray}
            />
            <Text style={styles.emptyText}>No Applications Yet</Text>
            <Text style={styles.emptySubtext}>
              {campaignId 
                ? 'No one has applied to this campaign yet'
                : 'Applications from influencers will appear here'}
            </Text>
          </View>
        }
      />
      
      {/* Custom Accept Modal */}
      <Modal
        visible={showAcceptModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAcceptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Icon */}
            <View style={styles.modalIconContainer}>
              <LinearGradient
                colors={BRAND_COLORS.gradientPrimary}
                style={styles.modalIconGradient}
              >
                <MaterialCommunityIcons name="check-circle" size={48} color="#fff" />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Accept Influencer</Text>
            
            {/* Message */}
            <Text style={styles.modalMessage}>
              Accept this influencer for your campaign? A chat room will be created to start collaboration.
            </Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAcceptModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalAcceptButton}
                onPress={confirmAccept}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={BRAND_COLORS.gradientPrimary}
                  style={styles.modalAcceptGradient}
                >
                  <MaterialCommunityIcons name="check" size={20} color="#fff" />
                  <Text style={styles.modalAcceptText}>Accept</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Icon */}
            <View style={styles.modalIconContainer}>
              <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                style={styles.modalIconGradient}
              >
                <MaterialCommunityIcons name="close-circle" size={48} color="#fff" />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Reject Application</Text>
            
            {/* Message */}
            <Text style={styles.modalMessage}>
              Are you sure you want to reject this application? This action cannot be undone.
            </Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowRejectModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalRejectButton}
                onPress={confirmReject}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#DC2626', '#B91C1C']}
                  style={styles.modalRejectGradient}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#fff" />
                  <Text style={styles.modalRejectText}>Reject</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CREATOR PROFILE & PORTFOLIO VIEWER MODAL */}
      <Modal
        visible={creatorModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCreatorModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.75)', justifyContent: 'flex-end' }}>
          <View style={{ width: '100%', height: '88%', backgroundColor: '#14141C', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
            {/* Header Bar */}
            <View style={{ backgroundColor: '#6D28FF', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="account-star" size={26} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>Creator Profile & Portfolio</Text>
              </View>

              <TouchableOpacity
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 6 }}
                onPress={() => setCreatorModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {loadingCreatorProfile ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6D28FF" />
                <Text style={{ marginTop: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>Loading Creator Portfolio...</Text>
              </View>
            ) : selectedCreatorProfile ? (
              <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                {/* Profile Overview Card */}
                <View style={{ backgroundColor: '#14141C', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <Image
                      source={{ uri: selectedCreatorProfile.profile_image || selectedCreatorProfile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCreatorProfile.name || 'Creator')}&size=200` }}
                      style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#6D28FF' }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }}>{selectedCreatorProfile.name}</Text>
                      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{selectedCreatorProfile.location || 'Location Not Set'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <MaterialCommunityIcons name="star" size={18} color="#F59E0B" />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>{selectedCreatorProfile.rating || 4.9}</Text>
                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>• {(selectedCreatorProfile.followers && selectedCreatorProfile.followers !== '0') ? selectedCreatorProfile.followers : (selectedCreatorProfile.followers_count && selectedCreatorProfile.followers_count > 0) ? (selectedCreatorProfile.followers_count >= 1000 ? (selectedCreatorProfile.followers_count / 1000).toFixed(1) + 'K' : selectedCreatorProfile.followers_count) : '125K'} Followers</Text>
                      </View>
                    </View>
                  </View>

                  {selectedCreatorProfile.bio ? (
                    <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 14 }}>
                      {`"${selectedCreatorProfile.bio}"`}
                    </Text>
                  ) : null}

                  {/* Social Handles */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                    {selectedCreatorProfile.instagram ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FDF2F8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                        <MaterialCommunityIcons name="instagram" size={16} color="#E11D48" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#BE123C' }}>@{selectedCreatorProfile.instagram}</Text>
                      </View>
                    ) : null}

                    {selectedCreatorProfile.youtube ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                        <MaterialCommunityIcons name="youtube" size={16} color="#DC2626" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#991B1B' }}>{selectedCreatorProfile.youtube}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Portfolio & Reels Showcase Section */}
                <View style={{ backgroundColor: '#14141C', borderRadius: 20, padding: 20, elevation: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF' }}>📸 Creator Portfolio & Reels</Text>
                  </View>

                  {/* Filter Tabs */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: creatorPortfolioFilter === 'all' ? '#6D28FF' : 'rgba(255,255,255,0.08)' }}
                      onPress={() => setCreatorPortfolioFilter('all')}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: creatorPortfolioFilter === 'all' ? '#FFFFFF' : 'rgba(255,255,255,0.55)' }}>
                        All ({(selectedCreatorProfile?.portfolio || []).length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: creatorPortfolioFilter === 'photo' ? '#6D28FF' : 'rgba(255,255,255,0.08)' }}
                      onPress={() => setCreatorPortfolioFilter('photo')}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: creatorPortfolioFilter === 'photo' ? '#FFFFFF' : 'rgba(255,255,255,0.55)' }}>
                        📸 Photos ({(selectedCreatorProfile?.portfolio || []).filter(i => i.type === 'photo').length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: creatorPortfolioFilter === 'reel' ? '#6D28FF' : 'rgba(255,255,255,0.08)' }}
                      onPress={() => setCreatorPortfolioFilter('reel')}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: creatorPortfolioFilter === 'reel' ? '#FFFFFF' : 'rgba(255,255,255,0.55)' }}>
                        🎬 Reels ({(selectedCreatorProfile?.portfolio || []).filter(i => i.type === 'reel').length})
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Portfolio Grid */}
                  {((selectedCreatorProfile?.portfolio || []).filter(item => creatorPortfolioFilter === 'all' || item.type === creatorPortfolioFilter)).length === 0 ? (
                    <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#14141C', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderStyle: 'dashed' }}>
                      <MaterialCommunityIcons name="image-off-outline" size={40} color="rgba(255,255,255,0.45)" />
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 8 }}>No portfolio media added yet</Text>
                      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 4 }}>{"This creator hasn't uploaded sample photos or reels yet."}</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                      {((selectedCreatorProfile?.portfolio || []).filter(item => creatorPortfolioFilter === 'all' || item.type === creatorPortfolioFilter)).map((item, idx) => (
                        <TouchableOpacity
                          key={item.id || idx}
                          style={{ width: '47%', height: 160, borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', position: 'relative' }}
                          onPress={() => setCreatorPreviewMedia(item)}
                          activeOpacity={0.85}
                        >
                          <Image
                            source={{ uri: item.url || 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80' }}
                            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                          />

                          {item.type === 'reel' && (
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                              <MaterialCommunityIcons name="play-circle" size={32} color="#FFFFFF" />
                              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800', marginTop: 2 }}>REEL</Text>
                            </View>
                          )}

                          {item.title ? (
                            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 8, paddingVertical: 4 }}>
                              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600' }} numberOfLines={1}>{item.title}</Text>
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <MaterialCommunityIcons name="account-search-outline" size={48} color="rgba(255,255,255,0.45)" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 10 }}>Creator Profile Not Available</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* CREATOR MEDIA PREVIEW MODAL */}
      <Modal
        visible={!!creatorPreviewMedia}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCreatorPreviewMedia(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}
            onPress={() => setCreatorPreviewMedia(null)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {creatorPreviewMedia && (
            <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
              <Image
                source={{ uri: creatorPreviewMedia.url }}
                style={{ width: '100%', height: 380, borderRadius: 16, resizeMode: 'contain', backgroundColor: '#000' }}
              />

              {creatorPreviewMedia.title ? (
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 14, textAlign: 'center' }}>
                  {creatorPreviewMedia.title}
                </Text>
              ) : null}

              {creatorPreviewMedia.type === 'reel' && (
                <View style={{ marginTop: 12, backgroundColor: '#E11D48', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="play-circle" size={20} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Sample Reel Video Preview</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#07080F',
  },
  header: {
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#07080F',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#141422',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  filterIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#141422',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  dotBadgePending: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  subBadgePending: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  dotBadgeAccepted: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  subBadgeAccepted: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  dotBadgeRejected: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  subBadgeRejected: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  subDot: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
  },

  // Top Action Banner Card
  topBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F111E',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.22)',
  },
  topBannerLeftIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topBannerTextCol: {
    flex: 1,
    marginRight: 10,
  },
  topBannerTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topBannerSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2,
  },
  topBannerBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  topBannerBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  applicationCard: {
    backgroundColor: '#0F111E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.22)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: '#1F170E',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  statusAccepted: {
    backgroundColor: '#0E1F18',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusRejected: {
    backgroundColor: '#1F0E12',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appliedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  appliedDateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Creator Header
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    backgroundColor: '#1E1B4B',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#1E192D',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FBBF24',
  },
  creatorMainInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  creatorName: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  creatorCategory: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 4,
  },
  creatorLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorLocationText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#C084FC',
  },

  // 3 Column Stats Row
  statsThreeColRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#141727',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statIconValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statValText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLblText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },

  // Inner Portfolio Button
  innerPortfolioBtnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141727',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.22)',
  },
  innerPortIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  innerPortTextCol: {
    flex: 1,
  },
  innerPortTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  innerPortSub: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 1,
  },

  // Proposal Box
  proposalBox: {
    backgroundColor: '#141727',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.22)',
  },
  proposalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  proposalHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C084FC',
  },
  proposalBodyText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 19,
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rejectOutlineBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7F1D1D',
    backgroundColor: '#1A0B10',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectOutlineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F87171',
  },
  acceptSolidBtn: {
    flex: 1.6,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#065F46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  acceptSolidBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34D399',
  },
  chatSolidBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chatSolidBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#0F111E',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 46,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  modalAcceptButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalAcceptGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  modalAcceptText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalRejectButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalRejectGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  modalRejectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
