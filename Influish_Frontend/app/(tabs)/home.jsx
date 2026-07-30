import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Text, TouchableOpacity, Image, Animated, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAuthHeader } from '../../utils/storage';
import { API, API_CONFIG } from '../../constants/api';
import { SlideUp } from '../../components/motion';
import { INDIAN_LIFESTYLE, INDIAN_FASHION } from '../../constants/sampleImages';
import {
  FluencerGreeting,
  CollabPath,
  NicheRail,
  MatchPulse,
  CreatorDock,
  FluencerPromise,
} from '../../components/FluencerUnique';

const { width } = Dimensions.get('window');

// Premium dark glassmorphism — even tokens
const THEME = {
  primary: '#7C3AED',
  primaryDark: '#6D28FF',
  primaryLight: '#A855F7',
  secondary: '#EC4899',
  secondaryLight: '#F472B6',
  accent1: 'rgba(255,255,255,0.55)',
  accent2: '#7C3AED',
  accent3: '#EC4899',
  accent4: '#A855F7',
  white: '#FFFFFF',
  black: '#FFFFFF',
  darkGray: 'rgba(255,255,255,0.55)',
  gray: 'rgba(255,255,255,0.55)',
  lightGray: '#121218',
  extraLightGray: '#0B0B10',
  ink: '#FFFFFF',
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
  pad: 20,
  radius: 20,
  shadow: 'rgba(109, 40, 255, 0.28)',
  shadowStrong: 'rgba(168, 85, 247, 0.35)',
};

// Sample Data — India context only
const bannerImages = [
  INDIAN_FASHION.saree,
  INDIAN_FASHION.lehenga,
  INDIAN_FASHION.kurta,
];

// Animated Card Component
const AnimatedCard = ({ children, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Signature Fluencer header — not a generic app bar
const Navbar = ({ profileImage, onProfilePress, onBellPress }) => {
  return (
    <View style={styles.navbarWrapper}>
      <LinearGradient
        colors={['#0B0B10', '#1A1025', '#2D1B4E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.navbarBackground}
      />
      <View style={styles.navbar}>
        <View style={styles.navTop}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <FluencerGreeting name="Creator" />
          </View>
          <View style={styles.navActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={onBellPress}>
              <Ionicons name="notifications-outline" size={20} color={THEME.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <View style={styles.profileFallback}>
                  <Ionicons name="person" size={18} color={THEME.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={THEME.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search brands, reels niches, payouts..."
            placeholderTextColor="rgba(255,255,255,0.42)"
          />
          <TouchableOpacity style={styles.filterBtn}>
            <View style={styles.filterBtnGrad}>
              <Ionicons name="options-outline" size={18} color={THEME.white} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Banner Slider Component
const BannerSlider = () => {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API.CAMPAIGNS.ACTIVE_ALL}`);
        if (response.ok) {
          const data = await response.json();
          const activeList = data.campaigns || data.data || [];
          if (activeList.length > 0) {
            const mappedBanners = activeList.map(c => ({
              id: c.id || c._id,
              title: c.campaign_name || c.name || 'Active Campaign Drop',
              subtitle: `${c.company_name || 'Krishna Private Limited'} • ₹${c.cost_per_influencer || 5000} Payout`,
              image_url: c.product_image || (c.reference_images && c.reference_images[0]) || INDIAN_FASHION.saree
            }));
            setBanners(mappedBanners);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch active campaign banners:', err);
      }
    };
    fetchBanners();
  }, []);

  const displayBanners = banners.length > 0 ? banners : [
    {
      id: 'active_1',
      title: 'Banarasi Silk Saree Campaign 2026',
      subtitle: 'Krishna Private Limited • ₹8,500 Payout per Reel',
      image_url: INDIAN_FASHION.saree,
    },
    {
      id: 'active_2',
      title: 'Bridal Designer Lehenga Collection',
      subtitle: 'Krishna Private Limited • ₹12,000 Payout per Reel',
      image_url: INDIAN_FASHION.lehenga,
    },
    {
      id: 'active_3',
      title: 'Summer Linen Kurta & Ethnic Sets',
      subtitle: 'Krishna Private Limited • ₹6,500 Payout per Reel',
      image_url: INDIAN_FASHION.kurta,
    }
  ];

  useEffect(() => {
    if (displayBanners.length === 0) return;
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % displayBanners.length;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * (width - 40 + 12),
            animated: true,
          });
          return nextIndex;
        });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [displayBanners.length]);

  return (
    <View style={styles.bannerContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.bannerScroll}
          decelerationRate="fast"
          snapToInterval={width - 40 + 12}
        >
          {displayBanners.map((item, index) => (
            <AnimatedCard key={item.id || index} delay={index * 100}>
              <View style={styles.bannerItem}>
                <Image source={{ uri: item.image_url }} style={styles.bannerImage} />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                  <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/campaigns')}>
                    <Text style={styles.bannerButtonText}>Apply Now</Text>
                    <Ionicons name="arrow-forward" size={18} color={THEME.primary} />
                  </TouchableOpacity>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>HOT</Text>
                    <Text style={styles.discountSubText}>DEAL</Text>
                  </View>
                </View>
              </View>
            </AnimatedCard>
          ))}
        </ScrollView>
      </Animated.View>
      
      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {displayBanners.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// Brands Section - Infinite Sliding Carousel
const BrandsSection = () => {
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const scrollX = useRef(0);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      try {
        const authHeaders = await getAuthHeader();
        const apiUrl = `${API_CONFIG.BASE_URL}${API.BRANDS.LIST}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBrands(data.brands || data.data || []);
        } else {
          setError('Failed to load brands');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (brands.length === 0) return;

    const interval = setInterval(() => {
      scrollX.current += 1;
      const brandWidth = 100;
      const totalWidth = brands.length * brandWidth;

      if (scrollX.current >= totalWidth) {
        scrollX.current = 0;
      }

      scrollViewRef.current?.scrollTo({
        x: scrollX.current,
        animated: false,
      });
    }, 30);

    return () => clearInterval(interval);
  }, [brands]);

  const handleBrandPress = (brand) => {
    router.push({
      pathname: '/brand-detail',
      params: { 
        brandId: brand.id || brand._id,
        name: brand.company_name || brand.companyName || brand.name,
        logo: brand.profile_image || brand.logo
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.brandsLoadingContainer}>
        <ActivityIndicator size="small" color={THEME.primary} />
      </View>
    );
  }

  const displayBrands = brands.length > 0 ? brands : [
    { id: 'b1', company_name: 'Krishna Silk', profile_image: INDIAN_FASHION.saree, companyName: 'Krishna Silk' },
    { id: 'b2', company_name: 'GlowAura Beauty', profile_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500', companyName: 'GlowAura Beauty' },
    { id: 'b3', company_name: 'UrbanThread Denim', profile_image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500', companyName: 'UrbanThread Denim' },
    { id: 'b4', company_name: 'Apex Pro Fitness', profile_image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500', companyName: 'Apex Pro Fitness' },
  ];

  // Triple the brands for infinite scroll effect
  const infiniteBrands = [...displayBrands, ...displayBrands, ...displayBrands];

  return (
    <View style={styles.brandsWrapper}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Partner Brands</Text>
        <TouchableOpacity onPress={() => router.push('/brands')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandsContent}
        scrollEnabled={false}
      >
        {infiniteBrands.map((brand, index) => (
          <TouchableOpacity 
            key={`${brand.id}-${index}`} 
            style={styles.brandItem} 
            onPress={() => handleBrandPress(brand)}
          >
            <View style={styles.brandCard}>
              <View style={styles.brandImageContainer}>
                {brand.profile_image || brand.logo ? (
                  <Image 
                    source={{ uri: brand.profile_image || brand.logo }} 
                    style={styles.brandImage} 
                  />
                ) : (
                  <View style={styles.brandPlaceholder}>
                    <Ionicons name="business" size={32} color={THEME.primary} />
                  </View>
                )}
              </View>
              <Text style={styles.brandName} numberOfLines={1}>
                {brand.name || brand.company_name || brand.brand_name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Trending Videos Section - Company uploaded videos
const TrendingVideosSection = () => {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const authHeaders = await getAuthHeader();
        const apiUrl = `${API_CONFIG.BASE_URL}${API.CAMPAIGNS.ACTIVE_ALL}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setVideos(data.campaigns || data.data || []);
        } else {
          setError('Failed to load videos');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingVideos();
  }, []);

  const handleVideoPress = (video) => {
    router.push({
      pathname: '/campaigns',
      params: { 
        campaignId: video.id,
        fromTrending: 'true'
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Loading trending content...</Text>
      </View>
    );
  }

  if (error || !videos.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Trending Campaigns</Text>
          <Text style={styles.sectionSubtitle}>Hot right now 🔥</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/campaigns')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingContent}
      >
        {videos.map((video, index) => (
          <AnimatedCard key={video.id} delay={index * 80}>
            <TouchableOpacity style={styles.trendingCard} onPress={() => handleVideoPress(video)}>
              <View style={styles.trendingImageContainer}>
                <Image 
                  source={{ uri: video.product_image || (video.reference_images && video.reference_images[0]) || video.brand_image || INDIAN_FASHION.saree }} 
                  style={styles.trendingImage} 
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
                  style={styles.trendingGradient}
                />
                <View style={styles.playIconContainer}>
                   <View style={styles.playIconBlur}>
                      <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 2 }} />
                   </View>
                </View>
                <View style={styles.trendingBadge}>
                  <Text style={styles.trendingBadgeText}>LIVE</Text>
                </View>
              </View>
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingTitle} numberOfLines={2}>{video.campaign_name || video.name || video.title}</Text>
                <View style={styles.companyOverlay}>
                   <Text style={styles.companyNameOverlay} numberOfLines={1}>
                     {video.company_name || video.brand_name || 'Brand'}
                   </Text>
                   <Text style={styles.videoDurationOverlay}>
                     • {video.duration || 'Short'}
                   </Text>
                </View>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}
      </ScrollView>
    </View>
  );
};

// Opportunities Section - Compact Horizontal Design
const OpportunitiesSection = () => {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      setError(null);
      try {
        const authHeaders = await getAuthHeader();
        const apiUrl = `${API_CONFIG.BASE_URL}${API.CAMPAIGNS.ACTIVE_ALL}`;
        console.log('Fetching campaigns from:', apiUrl);
        console.log('Auth headers:', authHeaders);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
        });
        
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (response.ok) {
          const data = JSON.parse(responseText);
          // Filter out trending if needed, or just show latest
          const campaignData = data.campaigns || data.data || [];
          setOpportunities(campaignData.slice(0, 5)); // Show top 5
        } else {
          console.error('Failed response:', responseText);
          setError(`Failed to load opportunities: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  const handleApplyPress = (opportunity) => {
    router.push({
      pathname: '/campaigns',
      params: { 
        campaignId: opportunity.id,
        openApply: 'true'
      }
    });
  };

  if (loading) return <ActivityIndicator size="small" color={THEME.primary} style={{ marginVertical: 20 }} />;
  if (error || !opportunities.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Top Opportunities</Text>
          <Text style={styles.sectionSubtitle}>Fresh campaigns for you</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/campaigns')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.opportunitiesContent}
      >
        {opportunities.map((opportunity, index) => (
          <AnimatedCard key={opportunity.id} delay={index * 100}>
            <TouchableOpacity 
              style={styles.compactCard}
              onPress={() => handleApplyPress(opportunity)}
              activeOpacity={0.8}
            >
              <View style={styles.compactCardHeader}>
                 <View style={styles.compactCompanyIcon}>
                    <Ionicons name="business" size={16} color={THEME.primary} />
                 </View>
                 <View style={styles.compactBadge}>
                    <Text style={styles.compactBadgeText}>
                      {opportunity.cost_per_influencer ? `₹${opportunity.cost_per_influencer}` : (opportunity.price ? `₹${opportunity.price}` : 'Paid')}
                    </Text>
                 </View>
              </View>
              
              <Text style={styles.compactTitle} numberOfLines={2}>
                {opportunity.campaign_name || opportunity.name || opportunity.title}
              </Text>
              
              <Text style={styles.compactCompany} numberOfLines={1}>
                {opportunity.company_name || 'Krishna Private Limited'}
              </Text>
              
              <View style={styles.compactFooter}>
                <View style={styles.compactTag}>
                  <Text style={styles.compactTagText}>
                    {opportunity.category || 'Campaign'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.compactApplyBtn} onPress={() => handleApplyPress(opportunity)}>
                   <Ionicons name="arrow-forward" size={14} color={THEME.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}
      </ScrollView>
    </View>
  );
};

// Growth Tips Section - Redesigned
const GrowthTipsSection = () => {
  const growthTips = [
    { 
      id: 1, 
      title: 'Master Brand Pitching',
      subtitle: 'Indian creator playbook',
      image: INDIAN_LIFESTYLE.creatorWork1,
      duration: '12 min',
    },
    { 
      id: 2, 
      title: 'Build Your Media Kit',
      subtitle: 'Stand out professionally',
      image: INDIAN_LIFESTYLE.creatorWork2,
      duration: '8 min',
    },
    { 
      id: 3, 
      title: 'Boost Engagement',
      subtitle: 'Desi content growth hacks',
      image: INDIAN_LIFESTYLE.creatorWork3,
      duration: '15 min',
    },
    { 
      id: 4, 
      title: 'Avoid Creator Burnout',
      subtitle: 'Sustainable strategies',
      image: INDIAN_LIFESTYLE.creatorWork4,
      duration: '10 min',
    },
    { 
      id: 5, 
      title: 'Festive Collab Season',
      subtitle: 'Win Diwali brand deals',
      image: INDIAN_LIFESTYLE.creatorWork5,
      duration: '9 min',
    },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Growth Tips</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.growthTipsContent}
      >
        {growthTips.map((tip, index) => (
          <AnimatedCard key={tip.id} delay={index * 100}>
            <TouchableOpacity style={styles.growthTipCard}>
              <View style={styles.growthTipImageContainer}>
                <Image source={{ uri: tip.image }} style={styles.growthTipImage} />
                <View style={styles.growthTipOverlay}>
                  <View style={styles.playButtonLarge}>
                    <Ionicons name="play" size={30} color={THEME.white} />
                  </View>
                  <View style={styles.durationBadge}>
                    <Ionicons name="time-outline" size={12} color={THEME.white} />
                    <Text style={styles.durationText}>{tip.duration}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.growthTipInfo}>
                <Text style={styles.growthTipTitle}>{tip.title}</Text>
                <Text style={styles.growthTipSubtitle}>{tip.subtitle}</Text>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}
      </ScrollView>
    </View>
  );
};

// Meta Footer Component
const MetaFooter = () => {
  return (
    <View style={styles.metaFooter}>
      <LinearGradient
        colors={['transparent', THEME.extraLightGray]}
        style={styles.metaGradient}
      >
        <View style={styles.metaContent}>
          <Ionicons name="trending-up" size={44} color={THEME.primary} style={styles.metaIcon} />
          <Text style={styles.metaTitle}>Fluencer</Text>
          <Text style={styles.metaTitle}>India’s brand × creator OS</Text>
          <View style={styles.metaBadge}>
            <Ionicons name="shield-checkmark" size={18} color={THEME.primary} />
            <Text style={styles.metaText}>Swipe · Apply · Create · Get paid</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const InfluencerHome = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  
  const fetchProfile = async () => {
    // Placeholder for profile fetch logic
    setProfile({ profile_image: null });
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B10" translucent={false} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Navbar
            profileImage={profile?.profile_image}
            onProfilePress={handleProfilePress}
            onBellPress={() => router.push('/notifications')}
          />

          {/* Signature Fluencer blocks — unique identity */}
          <SlideUp delay={40}><MatchPulse /></SlideUp>
          <SlideUp delay={80}><CreatorDock /></SlideUp>
          <SlideUp delay={110}><CollabPath /></SlideUp>
          <SlideUp delay={140}><NicheRail /></SlideUp>
          <SlideUp delay={160}><FluencerPromise /></SlideUp>

          {/* Content rails */}
          <SlideUp delay={180}>
            <View style={styles.bannerPad}>
              <BannerSlider />
            </View>
          </SlideUp>
          <SlideUp delay={200}><BrandsSection /></SlideUp>
          <SlideUp delay={220}><TrendingVideosSection /></SlideUp>
          <SlideUp delay={240}><OpportunitiesSection /></SlideUp>
          <SlideUp delay={260}><GrowthTipsSection /></SlideUp>
          <SlideUp delay={280}><MetaFooter /></SlideUp>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default InfluencerHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B10',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 30,
  },

  navbarWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  navbarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  navbar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  navTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  profileFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  filterBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterBtnGrad: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: THEME.primary,
  },
  bannerPad: {
    marginTop: 4,
  },
  // leftover style anchor (unused earnings styles removed)
  walletCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  walletCtaText: {
    color: THEME.white,
    fontWeight: '800',
    fontSize: 13,
  },
  earningsStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    borderRadius: 14,
    paddingVertical: 12,
  },
  earnStat: {
    flex: 1,
    alignItems: 'center',
  },
  earnStatNum: {
    color: THEME.primary,
    fontWeight: '900',
    fontSize: 14,
  },
  earnStatLbl: {
    color: THEME.darkGray,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  earnStatDivider: {
    width: 1,
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
  },
  whyCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  whyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.black,
    marginBottom: 10,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  whyText: {
    flex: 1,
    fontSize: 13,
    color: THEME.gray,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Banner Styles — even width & radius
  bannerContainer: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  bannerScroll: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  bannerItem: {
    width: width - 40,
    height: 160,
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.42)',
    padding: 18,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: THEME.white,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerButtonText: {
    color: THEME.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: THEME.secondary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '900',
  },
  discountSubText: {
    color: THEME.white,
    fontSize: 10,
    fontWeight: '700',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  paginationDotActive: {
    backgroundColor: THEME.primary,
    width: 24,
    height: 6,
    borderRadius: 3,
  },

  // Brands Section Styles - Infinite Carousel
  brandsWrapper: {
    marginTop: 8,
    marginBottom: 4,
  },
  brandsLoadingContainer: {
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandsContent: {
    paddingHorizontal: 12,
    gap: 0,
  },
  brandItem: {
    width: 88,
    paddingHorizontal: 6,
  },
  brandCard: {
    alignItems: 'center',
  },
  brandImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(168,85,247,0.12)',
  },
  brandName: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },

  // General Section Styles — even rhythm
  section: {
    marginTop: 18,
    marginBottom: 4,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 13,
    color: THEME.primaryLight,
    fontWeight: '700',
  },

  // Trending Videos Section
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  loadingText: {
    color: THEME.primary,
    marginTop: 6,
    fontSize: 15,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  errorText: {
    color: THEME.gray,
    marginTop: 12,
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  emptyText: {
    color: THEME.gray,
    marginTop: 12,
    fontSize: 15,
  },
  trendingContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  trendingCard: {
    width: 200,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  trendingImageContainer: {
    width: '100%',
    height: 112,
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -26 }, { translateY: -26 }],
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: THEME.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  trendingBadgeText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '800',
  },
  trendingInfo: {
    padding: 12,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 19,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  companyAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(168,85,247,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    flex: 1,
  },
  videoStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 13,
    color: THEME.gray,
    fontWeight: '600',
  },

  // Opportunities Section
  opportunitiesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  opportunityCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  compensationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.extraLightGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compensationText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.primary,
  },
  opportunityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.black,
    marginBottom: 12,
    lineHeight: 24,
  },
  opportunityDetails: {
    marginBottom: 14,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  opportunityCompany: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.darkGray,
    flex: 1,
  },
  opportunityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: THEME.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: THEME.lightGray,
    marginHorizontal: 12,
  },
  applyButton: {
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  applyButtonText: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: '800',
  },

  // Growth Tips Section
  growthTipsContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  growthTipCard: {
    width: 168,
  },
  growthTipImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  growthTipImage: {
    width: '100%',
    height: '100%',
  },
  growthTipOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  durationText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '700',
  },
  growthTipInfo: {
    paddingHorizontal: 4,
  },
  growthTipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.black,
    marginBottom: 4,
    lineHeight: 22,
  },
  growthTipSubtitle: {
    fontSize: 13,
    color: THEME.gray,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Meta Footer
  metaFooter: {
    marginTop: 34,
    marginBottom: 24,
  },
  metaGradient: {
    borderRadius: 32,
    paddingVertical: 44,
    paddingHorizontal: 26,
  },
  metaContent: {
    alignItems: 'flex-start', // Changed from center to flex-start for left alignment
    paddingHorizontal: 8, // Added horizontal padding
  },
  metaIcon: {
    marginBottom: 18,
  },
  metaTitle: {
    fontSize: 38, // Increased from 32
    fontWeight: '800', // Bolder
    color: '#FFFFFF', // Darker for better contrast
    textAlign: 'left', // Changed from center to left
    lineHeight: 46, // Increased line height
    letterSpacing: -0.5,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  // Premium Opportunities Styles
  opportunityCardPremium: {
    backgroundColor: '#14141C',
    borderRadius: 24,
    padding: 20,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  compensationBadgePremium: {
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compensationTextPremium: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 14,
  },
  opportunityTitlePremium: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 26,
  },
  opportunityCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#14141C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  opportunityCompanyPremium: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  opportunityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  applyButtonPremium: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  applyButtonTextPremium: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Trending Premium Styles
  playIconBlur: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  companyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  companyNameOverlay: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  videoDurationOverlay: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
    fontWeight: '500',
  },
  
  // Compact Opportunities Styles
  opportunitiesContent: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Space for shadow
  },
  compactCard: {
    width: 188,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  compactCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  compactCompanyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compactBadgeText: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 11,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    minHeight: 36,
  },
  compactCompany: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 12,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  compactTag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compactTagText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '600',
  },
  compactApplyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
});