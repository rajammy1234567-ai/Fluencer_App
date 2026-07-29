// TAB 4: LIKED BRANDS - Saved Brands & Company Profile Viewer
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';
import { API, API_CONFIG, getApiUrl } from '../../constants/api';
import { getAuthHeader } from '../../utils/storage';
import WaveHeader from '../../components/WaveHeader';

const LIKED_BRANDS_KEY = '@influencer_liked_brands';

export default function LikedBrands() {
  const router = useRouter();
  const [likedBrands, setLikedBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Brand Profile Modal State
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [brandCampaigns, setBrandCampaigns] = useState([]);
  const [loadingBrandCampaigns, setLoadingBrandCampaigns] = useState(false);

  // Apply Pitch State
  const [applyingCampaignId, setApplyingCampaignId] = useState(null);
  const [pitchModalVisible, setPitchModalVisible] = useState(false);
  const [pitchMessage, setPitchMessage] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  // Fetch liked brands on screen focus
  useFocusEffect(
    React.useCallback(() => {
      loadLikedBrands();
    }, [])
  );

  const loadLikedBrands = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIKED_BRANDS_KEY);
      if (stored) {
        setLikedBrands(JSON.parse(stored));
      } else {
        setLikedBrands([]);
      }
    } catch (error) {
      console.error('Failed to load liked brands:', error);
      setLikedBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (brandId) => {
    Alert.alert(
      'Remove Brand',
      'Remove this brand from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = likedBrands.filter(b => (b.id !== brandId && b.brand_id !== brandId && b._id !== brandId));
            setLikedBrands(updated);
            await AsyncStorage.setItem(LIKED_BRANDS_KEY, JSON.stringify(updated));
          },
        },
      ]
    );
  };

  // Open Brand Profile & Fetch All Active Campaigns for this Brand
  const handleOpenBrandModal = async (brandItem) => {
    setSelectedBrand(brandItem);
    setBrandModalVisible(true);
    setLoadingBrandCampaigns(true);
    setBrandCampaigns([]);

    try {
      const headers = await getAuthHeader();
      const res = await fetch(getApiUrl(API.CAMPAIGNS.LIST), { headers });
      const data = await res.json();
      
      if (res.ok && data.success) {
        const allCampaigns = data.campaigns || [];
        const targetBrandId = String(brandItem.brand_id || brandItem.id || brandItem._id || '');
        const targetCompanyName = String(brandItem.company_name || brandItem.brand_name || brandItem.name || '').toLowerCase().trim();

        // Filter campaigns matching this brand's ID or company name
        const filtered = allCampaigns.filter(c => {
          const cBrandId = String(c.brand_id || c.user_id || c.brand?._id || '');
          const cCompanyName = String(c.company_name || c.brand_name || c.brand?.company_name || '').toLowerCase().trim();
          
          return (targetBrandId && cBrandId === targetBrandId) || 
                 (targetCompanyName && cCompanyName && cCompanyName.includes(targetCompanyName)) ||
                 (c.campaign_name && targetCompanyName && c.campaign_name.toLowerCase().includes(targetCompanyName));
        });

        // Fallback: If no exact brand matches filtered, display open campaigns so creator sees active options
        setBrandCampaigns(filtered.length > 0 ? filtered : allCampaigns.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching brand campaigns:', err);
    } finally {
      setLoadingBrandCampaigns(false);
    }
  };

  // Open Apply Pitch Modal
  const handleOpenApplyPitch = (campaign) => {
    setApplyingCampaignId(campaign.id || campaign._id);
    setPitchMessage(`Hi! I love ${selectedBrand?.company_name || selectedBrand?.brand_name || 'your brand'} and would love to create an aesthetic ${campaign.content_type || 'reel'} for this campaign.`);
    setPitchModalVisible(true);
  };

  // Submit Application Pitch
  const handleSubmitApplication = async () => {
    if (!applyingCampaignId) return;
    setSubmittingApply(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(getApiUrl(`/api/campaigns/${applyingCampaignId}/apply`), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: pitchMessage || 'Excited to collaborate!' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert('🎉 Application Sent!', 'Your pitch has been submitted directly to the brand!');
        setPitchModalVisible(false);
        setPitchMessage('');
      } else {
        Alert.alert('Notice', data.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Apply submit error:', err);
      Alert.alert('Error', 'Network error while submitting application');
    } finally {
      setSubmittingApply(false);
    }
  };

  const renderBrand = ({ item }) => {
    const brandName = item.company_name || item.brand_name || item.name || 'Brand Partner';
    const category = item.brand_category || item.category || 'Fashion & Lifestyle';
    const logoUrl = item.brand_image || item.logo || item.product_image;
    const campaignsCount = item.campaigns || 1;

    return (
      <TouchableOpacity
        style={styles.brandCard}
        onPress={() => handleOpenBrandModal(item)}
        activeOpacity={0.8}
      >
        <View style={styles.brandHeader}>
          <View style={styles.brandLeft}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.brandLogo} />
            ) : (
              <View style={[styles.brandLogo, styles.logoPlaceholder]}>
                <MaterialCommunityIcons name="office-building" size={24} color="#3B82F6" />
              </View>
            )}

            <View style={styles.brandInfo}>
              <Text style={styles.brandName} numberOfLines={1}>{brandName}</Text>
              <Text style={styles.brandCategory}>{category}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.unlikeButton}
            onPress={() => handleUnlike(item.id || item.brand_id || item._id)}
          >
            <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.brandStats}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="account-group" size={16} color="#64748B" />
            <Text style={styles.statText}>1.2M followers</Text>
          </View>

          <View style={styles.stat}>
            <MaterialCommunityIcons name="bullhorn" size={16} color="#64748B" />
            <Text style={styles.statText}>{campaignsCount} active campaigns</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.viewButton} onPress={() => handleOpenBrandModal(item)}>
          <Text style={styles.viewButtonText}>View Campaigns</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#3B82F6" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="heart-outline" size={64} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>No Liked Brands Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring campaigns and save brands you are interested in collaborating with!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)/campaigns')}
      >
        <Text style={styles.exploreButtonText}>Explore Campaigns</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <WaveHeader height={120}>
        <Text style={styles.headerTitle}>Liked Brands</Text>
        <Text style={styles.headerSubtitle}>
          {likedBrands.length} {likedBrands.length === 1 ? 'brand' : 'brands'} saved
        </Text>
      </WaveHeader>

      {/* Brands List */}
      <FlatList
        data={likedBrands}
        renderItem={renderBrand}
        keyExtractor={(item, index) => String(item.id || item.brand_id || item._id || index)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* BRAND ACCOUNT & ACTIVE CAMPAIGNS MODAL */}
      <Modal
        visible={brandModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBrandModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.brandModalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setBrandModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedBrand && (
                <View>
                  {/* Brand Profile Header */}
                  <View style={styles.modalBrandHeader}>
                    <Image
                      source={{ uri: selectedBrand.brand_image || selectedBrand.logo || selectedBrand.product_image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800' }}
                      style={styles.modalBrandLogo}
                    />
                    <Text style={styles.modalBrandName}>
                      {selectedBrand.company_name || selectedBrand.brand_name || selectedBrand.name || 'Company Partner'}
                    </Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {selectedBrand.brand_category || selectedBrand.category || 'Fashion & Luxury'}
                      </Text>
                    </View>
                    <Text style={styles.modalBrandDesc}>
                      {selectedBrand.brand_description || selectedBrand.description || 'Official verified brand partner offering premium paid campaigns and product gifts.'}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Active Campaigns Section */}
                  <Text style={styles.campaignsHeaderTitle}>
                    📢 Active Campaigns ({brandCampaigns.length})
                  </Text>

                  {loadingBrandCampaigns ? (
                    <View style={styles.loaderContainer}>
                      <ActivityIndicator size="large" color="#3B82F6" />
                      <Text style={styles.loaderText}>Loading brand's active campaigns...</Text>
                    </View>
                  ) : brandCampaigns.length === 0 ? (
                    <View style={styles.emptyCampaigns}>
                      <MaterialCommunityIcons name="bullhorn-outline" size={40} color="#94A3B8" />
                      <Text style={styles.emptyCampaignsText}>No active campaigns at the moment.</Text>
                    </View>
                  ) : (
                    brandCampaigns.map((camp, idx) => (
                      <View key={camp.id || camp._id || idx} style={styles.campCard}>
                        <Image
                          source={{ uri: camp.product_image || camp.reference_images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' }}
                          style={styles.campImage}
                        />
                        <View style={styles.campDetails}>
                          <Text style={styles.campTitle}>{camp.campaign_name}</Text>
                          <View style={styles.campMetaRow}>
                            <View style={styles.pillTag}>
                              <MaterialCommunityIcons name={camp.content_type === 'reel' ? 'video' : 'camera'} size={14} color="#3B82F6" />
                              <Text style={styles.pillTagText}>{camp.content_type || 'Reel'}</Text>
                            </View>
                            {camp.cost_per_influencer > 0 && (
                              <View style={[styles.pillTag, { backgroundColor: '#DCFCE7' }]}>
                                <MaterialCommunityIcons name="currency-inr" size={14} color="#16A34A" />
                                <Text style={[styles.pillTagText, { color: '#15803D' }]}>₹{camp.cost_per_influencer}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.campDesc} numberOfLines={2}>{camp.description}</Text>

                          <TouchableOpacity
                            style={styles.applyBtn}
                            onPress={() => handleOpenApplyPitch(camp)}
                          >
                            <Text style={styles.applyBtnText}>Apply Now</Text>
                            <MaterialCommunityIcons name="send" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* APPLY PITCH MODAL */}
      <Modal
        visible={pitchModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPitchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pitchModalContent}>
            <Text style={styles.pitchTitle}>🚀 Submit Application Pitch</Text>
            <Text style={styles.pitchSub}>Tell the brand why you are a great fit for this campaign!</Text>

            <TextInput
              style={styles.pitchInput}
              multiline
              numberOfLines={4}
              value={pitchMessage}
              onChangeText={setPitchMessage}
              placeholder="Write your pitch here..."
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.pitchActionRow}>
              <TouchableOpacity
                style={styles.cancelPitchBtn}
                onPress={() => setPitchModalVisible(false)}
              >
                <Text style={styles.cancelPitchText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendPitchBtn}
                onPress={handleSubmitApplication}
                disabled={submittingApply}
              >
                {submittingApply ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendPitchText}>Send Pitch</Text>
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
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  brandCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  brandCategory: {
    fontSize: 13,
    color: '#64748B',
  },
  unlikeButton: {
    padding: 4,
  },
  brandStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  brandModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
  },
  modalCloseBtn: {
    alignSelf: 'flex-end',
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    marginBottom: 10,
  },
  modalBrandHeader: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  modalBrandLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  modalBrandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryBadgeText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
  },
  modalBrandDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  campaignsHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  loaderContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
  },
  emptyCampaigns: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyCampaignsText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  campCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  campImage: {
    width: 80,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
  },
  campDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  campTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  campMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  pillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  campDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  applyBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  pitchModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    elevation: 10,
  },
  pitchTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  pitchSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  pitchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  pitchActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelPitchBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  cancelPitchText: {
    color: '#64748B',
    fontWeight: '700',
  },
  sendPitchBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  sendPitchText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
