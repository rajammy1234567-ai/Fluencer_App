import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BrandSwipeCard from '../../components/BrandSwipeCard';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { getAuthHeader } from '../../utils/storage';
import { API, getApiUrl } from '../../constants/api';
import WaveHeader from '../../components/WaveHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function InfluencerCampaigns() {
  const insets = useSafeAreaInsets();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  
  // Categories for the top filter
  const CATEGORIES = [
    { id: 'all', name: 'All', icon: 'check-all' },
    { id: 'cosmetics', name: 'Cosmetics', icon: 'lipstick' },
    { id: 'herbal', name: 'Herbal', icon: 'leaf' },
    { id: 'fashion', name: 'Fashion', icon: 'tshirt-crew' },
    { id: 'tech', name: 'Tech', icon: 'laptop' },
  ];
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Animation states for action buttons
  const [likeScale] = useState(new Animated.Value(1));
  const [nopeScale] = useState(new Animated.Value(1));

  // Apply Modal State (old - keeping for now)
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Detail Modal State (new)
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchCampaigns();
    }, [])
  );



  const fetchCampaigns = async () => {
    try {
      const headers = await getAuthHeader();
      console.log('Fetching campaigns from:', getApiUrl(API.CAMPAIGNS.ACTIVE_ALL));
      const response = await fetch(getApiUrl(API.CAMPAIGNS.ACTIVE_ALL), {
        headers,
      });

      const data = await response.json();
      console.log('Campaigns Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        // Relaxed filtering for debugging - show all campaigns returned
        const allCampaigns = data.campaigns || [];
        console.log('Campaigns count:', allCampaigns.length);
        setCampaigns(allCampaigns);
      } else {
        console.log('Fetch failed:', data.message);
        Alert.alert('Error', data.message || 'Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      Alert.alert('Error', 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Map campaign data to BrandSwipeCard format
  const formattedCampaigns = campaigns.map(item => ({
    id: item.id,
    name: item.campaign_name, // Main Title
    image: { uri: item.brand_image || item.company_logo || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80' }, // Fallback image
    rating: item.brand_rating || 'New',
    description: item.description || `Looking for ${item.content_type} creators in ${item.influencer_location}`,
    category: item.content_type?.toUpperCase(),
    verified: true, // Assuming active brands are verified
    // Extra data for display
    cost: item.campaign_type === 'paid' ? `₹${item.cost_per_influencer}` : 'Barter',
    seats: item.number_of_seats,
    shooting_location_guide: item.shooting_location_guide || '',
    sample_reel_url: item.sample_reel_url || '',
    guidelines: item.guidelines || '',
    reference_images: item.reference_images || []
  }));

  const handleSwipeRight = async (cardData) => {
    try {
      // 1. Apply to campaign via API
      const headers = await getAuthHeader();
      const response = await fetch(
        getApiUrl(API.CAMPAIGNS.APPLY.replace(':id', cardData.id)),
        {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Interested in this campaign!' }),
        }
      );
      const data = await response.json();
      
      if (response.ok && data.success) {
        // 2. Save to Liked Brands
        const stored = await AsyncStorage.getItem('@influencer_liked_brands');
        
        // APK SAFETY: Wrap JSON.parse in try-catch to prevent Hermes crash on corrupted data
        let liked = [];
        try {
          liked = stored ? JSON.parse(stored ?? "[]") : [];
        } catch (parseError) {
          console.error('Failed to parse liked brands, resetting to empty:', parseError);
          liked = [];
        }
        
        // APK SAFETY: Validate array before using .find()
        if (!Array.isArray(liked)) {
          console.warn('Liked brands is not an array, resetting');
          liked = [];
        }
        
        if (!liked.find(b => b.id === cardData.id)) {
          const newLike = {
            id: cardData.id,
            name: cardData.name,
            logo: cardData.image?.uri,
            category: cardData.category,
            followers: '1.2M',
            campaigns: '5',
          };
          liked.push(newLike);
          await AsyncStorage.setItem('@influencer_liked_brands', JSON.stringify(liked));
        }
        
        Alert.alert('Success!', 'Application submitted! Brand will review and create a chat if accepted.');
      } else {
        Alert.alert('Error', data.message || 'Failed to apply');
      }
    } catch (error) {
      console.error('Error in swipe right:', error);
      Alert.alert('Error', 'Failed to submit application');
    }

    setCurrentIndex(prev => prev + 1);
    setSwipeDirection(null);
  };

  const handleSwipeLeft = () => {
    setCurrentIndex(prev => prev + 1);
    setSwipeDirection(null);
  };

  const submitApplication = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        getApiUrl(API.CAMPAIGNS.APPLY.replace(':id', selectedCampaignId)),
        {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: applicationMessage }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setApplyModalVisible(false);
        Alert.alert('Success', 'Application submitted!');
        // Remove from local list or refresh?
        // Current index already moved.
      } else {
        Alert.alert('Error', data.message || 'Failed to apply');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  // Manual Button Handlers
  const handleReject = () => {
    if (currentIndex < formattedCampaigns.length) {
      // Animate button
      Animated.sequence([
        Animated.timing(nopeScale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(nopeScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleLike = () => {
    if (currentIndex < formattedCampaigns.length) {
      // Animate button
      Animated.sequence([
        Animated.timing(likeScale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(likeScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      handleSwipeRight(formattedCampaigns[currentIndex]);
    }
  };

  const handleRewind = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };
  
  // Card tap handler - opens detail modal
  const handleCardTap = (cardData) => {
    setSelectedCampaign(cardData);
    setDetailModalVisible(true);
  };
  
  // Apply from detail modal
  const handleApplyFromDetail = async () => {
    if (!selectedCampaign || submitting) return;
    
    setSubmitting(true);
    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        getApiUrl(API.CAMPAIGNS.APPLY.replace(':id', selectedCampaign.id)),
        {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: applicationMessage || 'Interested in this campaign!' }),
        }
      );
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Save to liked
        const stored = await AsyncStorage.getItem('@influencer_liked_brands');
        
        // APK SAFETY: Wrap JSON.parse in try-catch to prevent Hermes crash on corrupted data
        let liked = [];
        try {
          liked = stored ? JSON.parse(stored ?? "[]") : [];
        } catch (parseError) {
          console.error('Failed to parse liked brands, resetting to empty:', parseError);
          liked = [];
        }
        
        // APK SAFETY: Validate array before using .find()
        if (!Array.isArray(liked)) {
          console.warn('Liked brands is not an array, resetting');
          liked = [];
        }
        
        if (!liked.find(b => b.id === selectedCampaign.id)) {
          liked.push({
            id: selectedCampaign.id,
            name: selectedCampaign.name,
            logo: selectedCampaign.image?.uri,
            category: selectedCampaign.category,
            followers: '1.2M',
            campaigns: '5',
          });
          await AsyncStorage.setItem('@influencer_liked_brands', JSON.stringify(liked));
        }
        
        setDetailModalVisible(false);
        setApplicationMessage('');
        Alert.alert('Success!', 'Application submitted! Brand will review and start a chat.');
      } else {
        Alert.alert('Error', data.message || 'Failed to apply');
      }
    } catch (error) {
      console.error('Apply error:', error);
      Alert.alert('Error', 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }



  const visibleCards = formattedCampaigns.slice(currentIndex, currentIndex + 3);
  const isFinished = currentIndex >= formattedCampaigns.length;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        
        {/* Header Section */}
        <WaveHeader height={160}>
          <Text style={styles.headerTitle}>Brand Categories</Text>
          <Text style={styles.headerSubtitle}>Choose one or more categories to find brands</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
            {CATEGORIES.filter(c => c.id !== 'unselect').map((cat) => {
              const isActive = selectedCategory === 'all' ? true : selectedCategory === cat.id;
              
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    isActive ? styles.activePill : styles.inactivePill
                  ]}
                  onPress={() => {
                    if (cat.id === 'all') {
                      setSelectedCategory(selectedCategory === 'all' ? null : 'all');
                    } else {
                      setSelectedCategory(cat.id);
                    }
                  }}
                >
                  <MaterialCommunityIcons 
                    name={cat.icon} 
                    size={16} 
                    color={isActive ? '#3b82f6' : '#FFFFFF'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    isActive ? styles.activeText : styles.inactiveText
                  ]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </WaveHeader>

        {/* Card Stack Area */}
        <View style={styles.cardContainer}>
          {isFinished ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="check-all" size={60} color="#8B5CF6" />
              </View>
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptySubtitle}>No new campaigns available right now.</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={() => { setLoading(true); setCurrentIndex(0); fetchCampaigns(); }}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            visibleCards.map((campaign, index) => (
              <BrandSwipeCard
                key={campaign.id}
                brand={campaign}
                index={index}
                isTop={index === 0}
                onSwipeRight={handleSwipeRight}
                onSwipeLeft={handleSwipeLeft}
                onCardTap={handleCardTap}
                onSwipeProgress={(x) => {
                  if (x > 30) setSwipeDirection('right');
                  else if (x < -30) setSwipeDirection('left');
                  else setSwipeDirection(null);
                }}
              />
            )).reverse() 
          )}
        </View>

        {/* Bottom Actions - Floating above the tab bar */}
        {!isFinished && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.smallButton]} 
              onPress={handleRewind}
              disabled={currentIndex === 0}
            >
              <MaterialCommunityIcons name="undo" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: nopeScale }] }}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.nopeBtn]}
                onPress={handleReject}
              >
                <MaterialCommunityIcons name="close" size={30} color="#EF4444" />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={[styles.smallButton]}>
              <MaterialCommunityIcons name="star" size={20} color="#3B82F6" />
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.likeBtn]}
                onPress={handleLike}
              >
                <MaterialCommunityIcons name="heart" size={30} color="#10B981" />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={[styles.smallButton]}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        )}

      </View>

      {/* Apply Modal */}
      <Modal
        visible={applyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setApplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply to Campaign</Text>
            <Text style={styles.modalSubtitle}>Send a message to the brand (Optional)</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Why are you a good fit?"
              value={applicationMessage}
              onChangeText={setApplicationMessage}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setApplyModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitApplication} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Send Application</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Campaign Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selectedCampaign?.name || 'Campaign Details'}</Text>
              
              {selectedCampaign && (
                <>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                    <Text style={styles.detailLabel}>Rating: {selectedCampaign.rating}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="tag" size={20} color="#8B5CF6" />
                    <Text style={styles.detailLabel}>Category: {selectedCampaign.category}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="cash" size={20} color="#10B981" />
                    <Text style={styles.detailLabel}>Payment: {selectedCampaign.cost || 'Barter'}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="account-group" size={20} color="#3B82F6" />
                    <Text style={styles.detailLabel}>Seats Available: {selectedCampaign.seats}</Text>
                  </View>
                  
                  <Text style={styles.detailSectionTitle}>Description</Text>
                  <Text style={styles.detailDescription}>{selectedCampaign.description}</Text>

                  {!!selectedCampaign.shooting_location_guide && (
                    <View style={{ marginTop: 12, backgroundColor: '#F0F9FF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#BAE6FD' }}>
                      <Text style={{ fontWeight: '700', color: '#0369A1', marginBottom: 4 }}>📍 Shooting Location & Concept Guide:</Text>
                      <Text style={{ color: '#0C4A6E', fontSize: 13 }}>{selectedCampaign.shooting_location_guide}</Text>
                    </View>
                  )}

                  {!!selectedCampaign.guidelines && (
                    <View style={{ marginTop: 10, backgroundColor: '#FEF3C7', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A' }}>
                      <Text style={{ fontWeight: '700', color: '#92400E', marginBottom: 4 }}>📋 Brand Guidelines & Do's/Don'ts:</Text>
                      <Text style={{ color: '#78350F', fontSize: 13 }}>{selectedCampaign.guidelines}</Text>
                    </View>
                  )}
                  
                  <Text style={styles.modalSubtitle}>Why are you interested? (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tell the brand why you're a great fit..."
                    value={applicationMessage}
                    onChangeText={setApplicationMessage}
                    multiline
                    numberOfLines={4}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                setDetailModalVisible(false);
                setApplicationMessage('');
              }}>
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleApplyFromDetail} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Apply Now</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  headerContainer: {
    paddingHorizontal: 0, 
    paddingTop: 0,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#3b82f6', // REQUESTED BLUE
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#FFFFFF', // Changed to white
    marginBottom: 14,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryContent: {
    gap: 10,
    paddingRight: 20,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activePill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  inactivePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  unselectPill: {
    borderColor: '#EF4444',
    backgroundColor: '#FFFFFF',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: { color: '#3b82f6' },
  inactiveText: { color: '#FFFFFF' },
  unselectText: { color: '#EF4444' },

  // Card Container
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 170, // Push down below absolute header
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#8B5CF6',
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 160, // Space above the tab bar
  },
  smallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  nopeBtn: {
    borderWidth: 1,
    borderColor: '#EF4444', // Red border hint
  },
  likeBtn: {
    borderWidth: 1,
    borderColor: '#10B981', // Green border hint
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  
  // Detail Modal Styles
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  detailSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 16,
  },
});
