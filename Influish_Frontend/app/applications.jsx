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
  primary: '#3b82f6',
  primaryDark: '#2563EB',
  gradientPrimary: ['#3b82f6', '#2563EB'],
  white: '#FFFFFF',
  textGray: COLORS.textGray || '#6B7280',
  text: COLORS.text || '#1E293B',
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

        // Show success with custom modal
        Alert.alert(
          '✓ Success',
          'Application accepted! You can now chat with this influencer.',
          [
            {
              text: 'Open Chat',
              style: 'default',
              onPress: () => {
                // APK SAFETY: Double-check chatId before navigation
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

    return (
      <View style={styles.applicationCard}>
        {/* Gradient Top Border */}
        <LinearGradient
          colors={BRAND_COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardTopBorder}
        />
        
        <View style={styles.cardContent}>
          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            isPending && styles.statusPending,
            isAccepted && styles.statusAccepted,
            isRejected && styles.statusRejected,
          ]}>
            <MaterialCommunityIcons
              name={isPending ? "clock-outline" : isAccepted ? "check-circle" : "close-circle"}
              size={14}
              color={isPending ? "#D97706" : isAccepted ? "#059669" : "#DC2626"}
            />
            <Text style={[
              styles.statusText,
              isPending && { color: '#D97706' },
              isAccepted && { color: '#059669' },
              isRejected && { color: '#DC2626' },
            ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>

        {/* Influencer Profile Card */}
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => handleOpenCreatorProfile(item.influencer_id || item.user_id)}
          activeOpacity={0.9}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={BRAND_COLORS.gradientPrimary}
                style={styles.avatarGradientBorder}
              >
                <Image
                  source={{ 
                    uri: item.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.influencer_name)}&size=200&background=5483b3&color=fff`
                  }}
                  style={styles.profileAvatar}
                />
              </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{item.influencer_name}</Text>
              <Text style={styles.profileEmail}>{item.email}</Text>
              {item.location && (
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={BRAND_COLORS.primary} />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="account-group" size={24} color={BRAND_COLORS.primary} />
              <Text style={styles.statNumber}>
                {item.followers_count ? (item.followers_count / 1000).toFixed(1) + 'K' : '0'}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            {item.categories && typeof item.categories === 'string' && (
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="tag-multiple" size={24} color={COLORS.secondary} />
                <Text style={styles.statNumber}>{item.categories.split(',').length}</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
            )}
          </View>

          {/* Categories Tags */}
          {item.categories && typeof item.categories === 'string' && (
            <View style={styles.tagsContainer}>
              {item.categories.split(',').slice(0, 3).map((cat, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{cat.trim()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* View Profile & Portfolio Button */}
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => handleOpenCreatorProfile(item.influencer_id || item.user_id)}
          >
            <MaterialCommunityIcons name="account-eye" size={18} color="#2563EB" />
            <Text style={styles.viewProfileBtnText}>View Creator Profile & Portfolio (Photos & Reels) ➔</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Proposal Message */}
        {item.message && (
          <View style={styles.proposalCard}>
            <View style={styles.proposalHeader}>
              <MaterialCommunityIcons name="message-text" size={20} color={BRAND_COLORS.primary} />
              <Text style={styles.proposalTitle}>Proposal</Text>
            </View>
            <Text style={styles.proposalText}>{item.message}</Text>
          </View>
        )}

        {/* Application Date */}
        <View style={styles.dateRow}>
          <MaterialCommunityIcons name="calendar" size={16} color={COLORS.textGray} />
          <Text style={styles.dateLabel}>Applied on: </Text>
          <Text style={styles.dateValue}>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </Text>
        </View>

        {/* Action Buttons - Only for Pending */}
        {isPending && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(item.id)}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <MaterialCommunityIcons name="close-circle-outline" size={20} color="#DC2626" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAccept(item.id)}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <LinearGradient
                  colors={['#059669', '#10B981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.acceptGradient}
                >
                  <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.white} />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Chat Button - Only for Accepted */}
        {isAccepted && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => {
              const targetChatId = item.chat_id || item.id || item._id;
              console.log('Opening chat with targetChatId:', targetChatId);
              if (targetChatId) {
                router.push(`/conversation?chatId=${targetChatId}`);
              } else {
                Alert.alert('Info', 'Chat will be available soon');
              }
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={BRAND_COLORS.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chatGradient}
            >
              <MaterialCommunityIcons name="chat" size={20} color={COLORS.white} />
              <Text style={styles.chatButtonText}>Open Chat</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <LinearGradient colors={BRAND_COLORS.gradientPrimary} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={BRAND_COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {campaignName || 'Applications'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {applications.filter(a => a.status === 'pending').length} pending • {' '}
              {applications.filter(a => a.status === 'accepted').length} accepted • {' '}
              {applications.filter(a => a.status === 'rejected').length} rejected
            </Text>
          </View>
        </View>
      </LinearGradient>

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
          <View style={{ width: '100%', height: '88%', backgroundColor: '#F8FAFC', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
            {/* Header Bar */}
            <View style={{ backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Loading Creator Portfolio...</Text>
              </View>
            ) : selectedCreatorProfile ? (
              <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                {/* Profile Overview Card */}
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <Image
                      source={{ uri: selectedCreatorProfile.profile_image || selectedCreatorProfile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCreatorProfile.name || 'Creator')}&size=200` }}
                      style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#2563EB' }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B' }}>{selectedCreatorProfile.name}</Text>
                      <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{selectedCreatorProfile.location || 'Location Not Set'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <MaterialCommunityIcons name="star" size={18} color="#F59E0B" />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>{selectedCreatorProfile.rating || 4.9}</Text>
                        <Text style={{ fontSize: 13, color: '#64748B' }}>• {selectedCreatorProfile.followers || '125K'} Followers</Text>
                      </View>
                    </View>
                  </View>

                  {selectedCreatorProfile.bio ? (
                    <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 14 }}>
                      "{selectedCreatorProfile.bio}"
                    </Text>
                  ) : null}

                  {/* Social Handles */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTopWidth: 1, borderColor: '#F1F5F9' }}>
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
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#1E293B' }}>📸 Creator Portfolio & Reels</Text>
                  </View>

                  {/* Filter Tabs */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: creatorPortfolioFilter === 'all' ? '#2563EB' : '#F1F5F9' }}
                      onPress={() => setCreatorPortfolioFilter('all')}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: creatorPortfolioFilter === 'all' ? '#FFFFFF' : '#64748B' }}>
                        All ({(selectedCreatorProfile.portfolio || []).length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: creatorPortfolioFilter === 'photo' ? '#2563EB' : '#F1F5F9' }}
                      onPress={() => setCreatorPortfolioFilter('photo')}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: creatorPortfolioFilter === 'photo' ? '#FFFFFF' : '#64748B' }}>
                        📸 Photos ({(selectedCreatorProfile.portfolio || []).filter(i => i.type === 'photo').length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: creatorPortfolioFilter === 'reel' ? '#2563EB' : '#F1F5F9' }}
                      onPress={() => setCreatorPortfolioFilter('reel')}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: creatorPortfolioFilter === 'reel' ? '#FFFFFF' : '#64748B' }}>
                        🎬 Reels ({(selectedCreatorProfile.portfolio || []).filter(i => i.type === 'reel').length})
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Portfolio Grid */}
                  {((selectedCreatorProfile.portfolio || []).filter(item => creatorPortfolioFilter === 'all' || item.type === creatorPortfolioFilter)).length === 0 ? (
                    <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' }}>
                      <MaterialCommunityIcons name="image-off-outline" size={40} color="#94A3B8" />
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 8 }}>No portfolio media added yet</Text>
                      <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4 }}>This creator hasn't uploaded sample photos or reels yet.</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                      {((selectedCreatorProfile.portfolio || []).filter(item => creatorPortfolioFilter === 'all' || item.type === creatorPortfolioFilter)).map((item, idx) => (
                        <TouchableOpacity
                          key={item.id || idx}
                          style={{ width: '47%', height: 160, borderRadius: 14, overflow: 'hidden', backgroundColor: '#F1F5F9', position: 'relative' }}
                          onPress={() => setCreatorPreviewMedia(item)}
                          activeOpacity={0.85}
                        >
                          <Image
                            source={{ uri: item.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' }}
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
                <MaterialCommunityIcons name="account-search-outline" size={48} color="#94A3B8" />
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
    backgroundColor: COLORS.background,
  },
  viewProfileBtn: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewProfileBtnText: {
    color: '#1E40AF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  applicationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 0,
    marginBottom: 20,
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardTopBorder: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusAccepted: {
    backgroundColor: '#D1FAE5',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatarGradientBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: BRAND_COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tagText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: BRAND_COLORS.primary,
  },
  proposalCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: BRAND_COLORS.primary,
  },
  proposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  proposalTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: BRAND_COLORS.primary,
  },
  proposalText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 22,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
  },
  dateValue: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  rejectButtonText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#DC2626',
  },
  acceptButton: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  chatButton: {
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chatGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chatButtonText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#6B7280',
  },
  modalAcceptButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalAcceptGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  modalAcceptText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  modalRejectButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalRejectGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  modalRejectText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
});
