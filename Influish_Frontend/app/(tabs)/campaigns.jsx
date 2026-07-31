import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';

import BrandSwipeCard from '../../components/BrandSwipeCard';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { getAuthHeader, storage } from '../../utils/storage';
import { API, getApiUrl } from '../../constants/api';
import WaveHeader from '../../components/WaveHeader';
import { SlideInCard, SlideUp } from '../../components/motion';
import { FALLBACK_INDIAN } from '../../constants/sampleImages';
import { initiatePayment } from '../../utils/payment';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function InfluencerCampaigns() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [isProMember, setIsProMember] = useState(false);
  const [showProModal, setShowProModal] = useState(true);
  const [unlockingPro, setUnlockingPro] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const handleBackToHome = () => {
    setShowProModal(false);
    router.replace('/(tabs)/home');
  };
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

  // Apply Modal State
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Detail Modal State
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      checkProStatus();
      fetchCampaigns();
    }, [params.campaignId])
  );

  const checkProStatus = async () => {
    try {
      const role = await storage.getRole();
      if (role !== 'influencer') {
        setIsProMember(true);
        setShowProModal(false);
        return;
      }
      const headers = await getAuthHeader();
      const res = await fetch(getApiUrl('/api/influencers/profile'), { headers });
      if (!res.ok) {
        setIsProMember(false);
        setShowProModal(true);
        return;
      }
      const data = await res.json();
      if (data.success && data.profile) {
        const isPro = !!data.profile.is_pro_member;
        setIsProMember(isPro);
        setShowProModal(!isPro);
      } else {
        setIsProMember(false);
        setShowProModal(true);
      }
    } catch (e) {
      setIsProMember(false);
      setShowProModal(true);
    }
  };

  const handleUnlockProPass = () => {
    setUnlockingPro(true);
    initiatePayment({
      amount: 499,
      description: '₹499 Pro Membership Pass - Unlimited Brand Campaign Access',
      onSuccess: async () => {
        try {
          const headers = await getAuthHeader();
          await fetch(getApiUrl('/api/influencers/unlock-pass'), {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.warn('Unlock pass API warning:', err);
        }
        setIsProMember(true);
        setUnlockingPro(false);
        fetchCampaigns();
      },
      onFailure: (err) => {
        setUnlockingPro(false);
        console.log('Payment cancelled/failed:', err);
      }
    });
    // Immediately stop button spinner so Razorpay Alert is active
    setTimeout(() => setUnlockingPro(false), 300);
  };



  const fetchCampaigns = async () => {
    try {
      const headers = await getAuthHeader();
      console.log('Fetching campaigns from:', getApiUrl(API.CAMPAIGNS.ACTIVE_ALL));
      const response = await fetch(getApiUrl(API.CAMPAIGNS.ACTIVE_ALL), {
        headers,
      });

      const data = await response.json();
      console.log('Campaigns Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success && Array.isArray(data.campaigns)) {
        if (data.is_pro_member === false) {
          setIsProMember(false);
          setShowProModal(true);
        }

        let skippedIds = [];
        let localAppliedIds = [];
        try {
          const storedSkipped = await AsyncStorage.getItem('@influencer_skipped_campaigns');
          skippedIds = storedSkipped ? JSON.parse(storedSkipped) : [];
        } catch (e) {
          skippedIds = [];
        }
        try {
          const storedApplied = await AsyncStorage.getItem('@influencer_applied_campaigns');
          localAppliedIds = storedApplied ? JSON.parse(storedApplied) : [];
        } catch (e) {
          localAppliedIds = [];
        }

        const filtered = data.campaigns.filter(c => {
          const cId = String(c._id || c.id);
          const isApplied = c.already_applied || c.alreadyApplied || !!c.application_status || localAppliedIds.includes(cId);
          const isSkipped = skippedIds.includes(cId);
          return !isApplied && !isSkipped;
        });

        setCampaigns(filtered);

        if (params.campaignId) {
          const target = data.campaigns.find(c => String(c._id || c.id) === String(params.campaignId));
          if (target) {
            const formatted = {
              id: target._id || target.id,
              brandName: target.brand_name || 'Krishna Private Limited',
              title: target.campaign_name,
              category: target.content_type?.toUpperCase() || 'REEL',
              followers: '10K+',
              payout: `₹${target.cost_per_influencer}`,
              seats: target.number_of_seats || 5,
              description: target.description || '',
              rating: 'New',
              verified: true,
              referenceImages: target.reference_images || [],
              productImage: target.product_image || (target.reference_images && target.reference_images[0]),
            };
            setSelectedCampaign(formatted);
            setDetailModalVisible(true);
          }
        }
      } else {
        console.log('Fetch campaigns response note:', data?.message);
      }
    } catch (error) {
      console.warn('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map campaign data to BrandSwipeCard format
  const formattedCampaigns = campaigns.map(item => {
    let imgUri = item.product_image || (item.reference_images && item.reference_images[0]) || item.brand_image || item.company_logo || FALLBACK_INDIAN;
    if (Platform.OS === 'web' && String(imgUri).startsWith('file://')) {
      imgUri = FALLBACK_INDIAN;
    }
    return {
      id: item.id,
      name: item.campaign_name, // Main Title
      image: { uri: imgUri },
      rating: item.brand_rating || 'New',
      description: item.description || `Looking for ${item.content_type} creators in ${item.influencer_location}`,
      category: item.content_type?.toUpperCase(),
      verified: true, // Assuming active brands are verified
      cost: item.campaign_type === 'paid' ? `₹${item.cost_per_influencer}` : 'Barter',
      seats: item.number_of_seats,
      shooting_location_guide: item.shooting_location_guide || '',
      sample_reel_url: item.sample_reel_url || '',
      guidelines: item.guidelines || '',
      reference_images: item.reference_images || []
    };
  });

  const handleSwipeRight = async (cardData) => {
    try {
      // Save ID to local applied list immediately
      const cId = String(cardData.id);
      try {
        const storedApplied = await AsyncStorage.getItem('@influencer_applied_campaigns');
        let applied = storedApplied ? JSON.parse(storedApplied) : [];
        if (!applied.includes(cId)) {
          applied.push(cId);
          await AsyncStorage.setItem('@influencer_applied_campaigns', JSON.stringify(applied));
        }
      } catch (e) {}

      // Remove from campaigns feed state immediately
      setCampaigns(prev => prev.filter(c => String(c._id || c.id) !== cId));

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
      
      if (response.status === 403 || data.is_pro_required) {
        // UNDO APPLIED & LIKED BRANDS FOR UNPAID USER
        try {
          const storedApplied = await AsyncStorage.getItem('@influencer_applied_campaigns');
          let applied = storedApplied ? JSON.parse(storedApplied) : [];
          applied = applied.filter(id => id !== cId);
          await AsyncStorage.setItem('@influencer_applied_campaigns', JSON.stringify(applied));
        } catch (e) {}

        setIsProMember(false);
        setShowProModal(true);
        Alert.alert(
          '🔒 Pro Membership Required',
          'Application could not be saved because Pro Pass is required. Please pay ₹499 to unlock Pro Pass access!'
        );
        return;
      }

      if (!response.ok && (data.message?.toLowerCase().includes('already') || response.status === 400)) {
        console.log('Already applied to this campaign:', cardData.id);
        return;
      }
      
      if (response.ok && data.success) {
        // 2. Save to Liked Brands
        const stored = await AsyncStorage.getItem('@influencer_liked_brands');
        
        let liked = [];
        try {
          liked = stored ? JSON.parse(stored ?? "[]") : [];
        } catch (parseError) {
          liked = [];
        }
        
        if (!Array.isArray(liked)) liked = [];
        
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
        Alert.alert('Notice', data.message || 'Application submitted');
      }
    } catch (error) {
      console.error('Error in swipe right:', error);
    }

    setCurrentIndex(prev => prev + 1);
    setSwipeDirection(null);
  };

  const handleSwipeLeft = async (cardData) => {
    try {
      const targetId = cardData?.id || (formattedCampaigns[currentIndex] && formattedCampaigns[currentIndex].id);
      if (targetId) {
        const cId = String(targetId);
        const storedSkipped = await AsyncStorage.getItem('@influencer_skipped_campaigns');
        let skipped = [];
        try {
          skipped = storedSkipped ? JSON.parse(storedSkipped) : [];
        } catch (e) {
          skipped = [];
        }
        if (!skipped.includes(cId)) {
          skipped.push(cId);
          await AsyncStorage.setItem('@influencer_skipped_campaigns', JSON.stringify(skipped));
        }
        setCampaigns(prev => prev.filter(c => String(c._id || c.id) !== cId));
      }
    } catch (err) {
      console.warn('Error saving skipped campaign:', err);
    }
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
        Alert.alert('🎉 Success!', 'Application submitted successfully! You can track your application status in your Creator Dashboard.');
        fetchCampaigns();
      } else {
        setApplyModalVisible(false);
        Alert.alert(
          data.already_applied ? '⚠️ Already Applied' : 'Notice',
          data.message || 'You have already applied to this campaign.'
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit application');
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
      
      const card = formattedCampaigns[currentIndex];
      handleSwipeLeft(card);
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
      
      if (!response.ok && (data.message?.toLowerCase().includes('already') || response.status === 400)) {
        Alert.alert('📌 Application Status', 'You have already applied for this campaign. Chat will open once the brand approves!');
        setDetailModalVisible(false);
        setApplicationMessage('');
        return;
      }
      
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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0B0B10' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B10" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        
        {/* Header Section */}
        <WaveHeader height={170}>
          <Text style={styles.headerTitle}>Collab Deck</Text>
          <Text style={styles.headerSubtitle}>Swipe brands · 1-tap apply · Get paid</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
            {CATEGORIES.filter(c => c.id !== 'unselect').map((cat, catIndex) => {
              const isActive = selectedCategory === 'all' ? true : selectedCategory === cat.id;
              
              return (
                <SlideInCard key={cat.id} index={catIndex} from="right">
                <TouchableOpacity
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
                    color={isActive ? '#FFFFFF' : '#7C3AED'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    isActive ? styles.activeText : styles.inactiveText
                  ]}>{cat.name}</Text>
                </TouchableOpacity>
                </SlideInCard>
              );
            })}
          </ScrollView>
        </WaveHeader>

        {/* Card Stack Area */}
        <View style={styles.cardContainer}>
          {isFinished ? (
            <SlideUp delay={80}>
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="check-all" size={60} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptySubtitle}>No new campaigns available right now.</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={() => { setLoading(true); setCurrentIndex(0); fetchCampaigns(); }}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
            </SlideUp>
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
              <MaterialCommunityIcons name="undo" size={20} color="rgba(255,255,255,0.16)" />
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
              <MaterialCommunityIcons name="star" size={20} color="#7C3AED" />
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
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#7C3AED" />
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
      {/* Campaign Details & Application Modal (Redesigned) */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.newDesignModalCard}>
            {/* Close Icon Button */}
            <TouchableOpacity 
              style={styles.modalCloseIconBtn} 
              onPress={() => {
                setDetailModalVisible(false);
                setApplicationMessage('');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.newDesignModalScrollContent}
            >
              <View style={styles.newDesignDualColumn}>
                {/* LEFT COLUMN: Product Image + Thumbnails */}
                <View style={styles.newDesignLeftCol}>
                  <View style={styles.newDesignMainImageContainer}>
                    <Image 
                      source={
                        selectedCampaign?.product_image 
                          ? { uri: selectedCampaign.product_image }
                          : selectedCampaign?.image?.uri 
                            ? { uri: selectedCampaign.image.uri } 
                            : { uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' }
                      } 
                      style={styles.newDesignMainImage} 
                    />

                    {/* Featured Campaign Badge (Top Left) */}
                    <View style={styles.newDesignFeaturedBadge}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.newDesignFeaturedText}>Featured Campaign</Text>
                    </View>

                    {/* Gallery Thumbnails Row (Bottom Left) */}
                    <View style={styles.newDesignThumbnailsRow}>
                      <Image 
                        source={{ uri: selectedCampaign?.product_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c' }} 
                        style={styles.newDesignThumbImage} 
                      />
                      <Image 
                        source={{ uri: selectedCampaign?.product_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c' }} 
                        style={styles.newDesignThumbImage} 
                      />
                      <Image 
                        source={{ uri: selectedCampaign?.product_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c' }} 
                        style={styles.newDesignThumbImage} 
                      />
                      <View style={styles.newDesignMoreThumbBox}>
                        <Text style={styles.newDesignMoreThumbText}>+3</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* RIGHT COLUMN: Specs & Application Form */}
                <View style={styles.newDesignRightCol}>
                  {/* Title + Verified Badge */}
                  <View style={styles.newDesignTitleRow}>
                    <Text style={styles.newDesignTitle}>
                      {selectedCampaign?.name || selectedCampaign?.campaign_name || 'Silk Anarkali Suit Drop'}
                    </Text>
                    <MaterialIcons name="verified" size={22} color="#0EA5E9" style={{ marginLeft: 6 }} />
                  </View>

                  {/* Subtitle / Company Description */}
                  <Text style={styles.newDesignSubtitle}>
                    {selectedCampaign?.brand_description || selectedCampaign?.description || 'The Real tonifing Unstitched Chanderi Silk Anarkali suit.'}
                  </Text>

                  {/* 4 Spec Rows Container */}
                  <View style={styles.newDesignSpecContainer}>
                    {/* Row 1: Rating */}
                    <View style={styles.newDesignSpecRow}>
                      <View style={styles.newDesignSpecLeft}>
                        <Ionicons name="star-outline" size={17} color="#C084FC" />
                        <Text style={styles.newDesignSpecLabel}>Rating</Text>
                      </View>
                      <View style={styles.newDesignSpecBadge}>
                        <Text style={styles.newDesignSpecBadgeText}>{selectedCampaign?.rating || 'New'}</Text>
                      </View>
                    </View>

                    {/* Row 2: Category */}
                    <View style={styles.newDesignSpecRow}>
                      <View style={styles.newDesignSpecLeft}>
                        <Ionicons name="pricetag-outline" size={17} color="#C084FC" />
                        <Text style={styles.newDesignSpecLabel}>Category</Text>
                      </View>
                      <View style={styles.newDesignSpecBadge}>
                        <Text style={styles.newDesignSpecBadgeText}>{String(selectedCampaign?.category || selectedCampaign?.content_type || 'REEL').toUpperCase()}</Text>
                      </View>
                    </View>

                    {/* Row 3: Payment */}
                    <View style={styles.newDesignSpecRow}>
                      <View style={styles.newDesignSpecLeft}>
                        <Ionicons name="card-outline" size={17} color="#C084FC" />
                        <Text style={styles.newDesignSpecLabel}>Payment</Text>
                      </View>
                      <View style={styles.newDesignSpecBadge}>
                        <Text style={styles.newDesignSpecBadgeText}>
                          {selectedCampaign?.cost || (selectedCampaign?.cost_per_influencer ? `₹${selectedCampaign.cost_per_influencer.toLocaleString()}` : 'Barter')}
                        </Text>
                      </View>
                    </View>

                    {/* Row 4: Seats Available */}
                    <View style={styles.newDesignSpecRow}>
                      <View style={styles.newDesignSpecLeft}>
                        <Ionicons name="people-outline" size={17} color="#C084FC" />
                        <Text style={styles.newDesignSpecLabel}>Seats Available</Text>
                      </View>
                      <View style={styles.newDesignSpecBadge}>
                        <Text style={styles.newDesignSpecBadgeText}>{selectedCampaign?.seats || selectedCampaign?.number_of_seats || 6}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Description Header & Subtext */}
                  <View style={{ marginTop: 12 }}>
                    <View style={styles.newDesignSectionHeaderRow}>
                      <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.newDesignSectionHeaderTitle}>Description</Text>
                    </View>
                    <Text style={styles.newDesignDescriptionText}>
                      {selectedCampaign?.description || 'Elegant slow-motion transition Reel wearing Krishna Chanderi Silk Anarkali suit.'}
                    </Text>
                  </View>

                  {/* Why are you interested? Section */}
                  <View style={{ marginTop: 14 }}>
                    <View style={styles.newDesignSectionHeaderRow}>
                      <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.newDesignSectionHeaderTitle}>Why are you interested? <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '400' }}>(Optional)</Text></Text>
                    </View>
                    <TextInput
                      style={styles.newDesignInput}
                      placeholder="Tell the brand why you're a great fit..."
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={applicationMessage}
                      onChangeText={setApplicationMessage}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {/* Apply Now Button (Aligned Right) */}
                  <View style={{ alignItems: 'flex-end', marginTop: 14 }}>
                    <TouchableOpacity 
                      style={styles.newDesignApplyBtn} 
                      onPress={handleApplyFromDetail} 
                      disabled={submitting}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#7C3AED', '#9333EA']}
                        style={styles.newDesignApplyGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        {submitting ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <>
                            <Ionicons name="send" size={15} color="#FFFFFF" />
                            <Text style={styles.newDesignApplyText}>Apply Now</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Creator Pro Pass Unlock Modal (₹499) */}
      <Modal
        visible={!isProMember && !loading && showProModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleBackToHome}
      >
        <View style={styles.proModalOverlay}>
          <View style={styles.proModalCard}>
            <LinearGradient colors={['#7C3AED', '#6D28FF']} style={styles.proHeaderGradient}>
              <TouchableOpacity 
                style={styles.proBackButton}
                onPress={handleBackToHome}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <MaterialCommunityIcons name="crown" size={48} color="#FFD700" />
              <Text style={styles.proHeaderTitle}>FLUENCER CREATOR PRO</Text>
              <Text style={styles.proHeaderSubtitle}>Unlock Premium Campaigns Pass</Text>
            </LinearGradient>

            <View style={styles.proBody}>
              <Text style={styles.proPriceText}>₹499 <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', fontWeight: '400' }}>/ Lifetime Pass</Text></Text>
              
              <View style={styles.proFeatureList}>
                <View style={styles.proFeatureItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.proFeatureText}>Access & Apply to All Brand Campaigns</Text>
                </View>

                <View style={styles.proFeatureItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.proFeatureText}>Direct Escrow Payment Protection</Text>
                </View>

                <View style={styles.proFeatureItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.proFeatureText}>1-on-1 Chat with Top Brands</Text>
                </View>

                <View style={styles.proFeatureItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.proFeatureText}>Priority Creator Approval</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.proUnlockButton}
                onPress={handleUnlockProPass}
                disabled={unlockingPro}
              >
                <LinearGradient colors={['#10B981', '#059669']} style={styles.proUnlockGradient}>
                  {unlockingPro ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="lock-open" size={22} color="#FFF" />
                      <Text style={styles.proUnlockText}>Pay ₹499 & Unlock Campaigns</Text>
                    </>
                  )}
                </LinearGradient>
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
    backgroundColor: '#0B0B10',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0B10',
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
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7C3AED',
    marginBottom: 14,
    fontWeight: '600',
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
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  activePill: {
    backgroundColor: '#7C3AED',
    borderColor: '#A855F7',
    shadowColor: '#A855F7',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  inactivePill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  unselectPill: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: { color: '#FFFFFF' },
  inactiveText: { color: '#FFFFFF' },
  unselectText: { color: '#C47070' },

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
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#7C3AED',
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
    gap: 18,
    marginBottom: 120,
  },
  smallButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#14141C',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
    color: 'rgba(255,255,255,0.55)',
  },
  submitBtn: {
    backgroundColor: '#7C3AED',
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
    color: '#FFFFFF',
    fontWeight: '500',
  },
  detailSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 22,
    marginBottom: 16,
  },
  proModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  proModalCard: {
    width: '100%',
    backgroundColor: '#14141C',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  proHeaderGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  proBackButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  proHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 1,
  },
  proHeaderSubtitle: {
    fontSize: 14,
    color: '#E0F2FE',
    marginTop: 4,
  },
  proBody: {
    padding: 24,
  },
  proPriceText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  proFeatureList: {
    gap: 12,
    marginBottom: 24,
  },
  proFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proFeatureText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  proUnlockButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  proUnlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  proUnlockText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Redesigned Campaign Modal Styles (Matching Screenshot)
  newDesignModalCard: {
    width: '94%',
    maxWidth: 840,
    backgroundColor: '#0F0E17',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    padding: Platform.OS === 'web' ? 22 : 16,
    maxHeight: '90%',
    position: 'relative',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  modalCloseIconBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newDesignModalScrollContent: {
    paddingBottom: 10,
  },
  newDesignDualColumn: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 20,
  },
  newDesignLeftCol: {
    width: Platform.OS === 'web' ? 320 : '100%',
  },
  newDesignRightCol: {
    flex: 1,
  },
  newDesignMainImageContainer: {
    width: '100%',
    height: 440,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#14141C',
  },
  newDesignMainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newDesignFeaturedBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  newDesignFeaturedText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  newDesignThumbnailsRow: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newDesignThumbImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  newDesignMoreThumbBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newDesignMoreThumbText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  newDesignTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  newDesignTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  newDesignSubtitle: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 19,
    marginBottom: 16,
  },
  newDesignSpecContainer: {
    backgroundColor: '#161522',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  newDesignSpecRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newDesignSpecLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newDesignSpecLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  newDesignSpecBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newDesignSpecBadgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  newDesignSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  newDesignSectionHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  newDesignDescriptionText: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  newDesignInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#FFFFFF',
    minHeight: 64,
    textAlignVertical: 'top',
  },
  newDesignApplyBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  newDesignApplyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  newDesignApplyText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
