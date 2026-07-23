import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Text, TouchableOpacity, Image, Animated, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAuthHeader } from '../../utils/storage';
import { API, API_CONFIG } from '../../constants/api';

const { width } = Dimensions.get('window');

// Custom Blue Theme
const THEME = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  secondary: '#FF6B9D',
  secondaryLight: '#FFB8D2',
  accent1: '#A78BFA',
  accent2: '#34D399',
  accent3: '#FBBF24',
  accent4: '#F87171',
  white: '#FFFFFF',
  black: '#1A1A2E',
  darkGray: '#3D3D4E',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  extraLightGray: '#F8F9FA',
  shadow: 'rgba(0, 0, 0, 0.12)',
  shadowStrong: 'rgba(0, 0, 0, 0.18)',
};

// Sample Data
const bannerImages = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
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

// Navbar Component - Updated with profile navigation
const Navbar = ({ children, profileImage, onProfilePress }) => {
  return (
    <View style={styles.navbarWrapper}>
      {/* Gradient Wave Background */}
      <LinearGradient
        colors={['#FFFFFF', '#E0F2FE', '#BFDBFE', '#3B82F6']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.navbarBackground}
      >
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
      </LinearGradient>
      
      <View style={styles.navbar}>
        <View style={styles.navTop}>
          <Text style={styles.appName}>FLUENCER</Text>
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <LinearGradient
                colors={[THEME.primary, THEME.primaryDark]}
                style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
              >
                <Ionicons name="person" size={20} color="#fff" />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={THEME.gray} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search campaigns, brands..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={THEME.white} />
          </TouchableOpacity>
        </View>
        
        {/* Carousel inside the wave */}
        {children}
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
        const response = await fetch(getApiUrl(API.BANNERS));
        const data = await response.json();
        if (data.success && data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        }
      } catch (err) {
        console.warn('Failed to fetch banners:', err);
      }
    };
    fetchBanners();
  }, []);

  const displayBanners = banners.length > 0 ? banners : [
    {
      id: 'default_1',
      title: 'Monetize Your Influence',
      subtitle: 'Connect with Top Fashion & Lifestyle Brands',
      image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'default_2',
      title: 'Summer Campaign Drop 2026',
      subtitle: 'Paid Reel Deals starting at ₹5,000 / Creator',
      image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'default_3',
      title: 'Zero Commission Deduction on First Deal',
      subtitle: 'Grow, Learn & Earn with Fluencer',
      image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80',
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
            x: nextIndex * (width - 48),
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
          snapToInterval={width - 48}
        >
          {displayBanners.map((item, index) => (
            <AnimatedCard key={item.id || index} delay={index * 100}>
              <View style={styles.bannerItem}>
                <Image source={{ uri: item.image_url }} style={styles.bannerImage} />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                  <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/campaigns')}>
                    <Text style={styles.bannerButtonText}>Explore Deals</Text>
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
      pathname: '/brand-profile',
      params: { brandId: brand.id }
    });
  };

  if (loading) {
    return (
      <View style={styles.brandsLoadingContainer}>
        <ActivityIndicator size="small" color={THEME.primary} />
      </View>
    );
  }

  if (error || !brands.length) {
    return null;
  }

  // Triple the brands for infinite scroll effect
  const infiniteBrands = [...brands, ...brands, ...brands];

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
                  source={{ uri: video.image || video.banner || video.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop' }} 
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
                <Text style={styles.trendingTitle} numberOfLines={2}>{video.name || video.title}</Text>
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
                      {opportunity.price ? `₹${opportunity.price}` : 'Paid'}
                    </Text>
                 </View>
              </View>
              
              <Text style={styles.compactTitle} numberOfLines={2}>
                {opportunity.name || opportunity.title}
              </Text>
              
              <Text style={styles.compactCompany} numberOfLines={1}>
                {opportunity.company_name || 'Brand Partner'}
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
      subtitle: 'Learn proven techniques',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=400&fit=crop',
      duration: '12 min',
    },
    { 
      id: 2, 
      title: 'Build Your Media Kit',
      subtitle: 'Stand out professionally',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=400&fit=crop',
      duration: '8 min',
    },
    { 
      id: 3, 
      title: 'Boost Engagement',
      subtitle: 'Proven growth hacks',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=400&fit=crop',
      duration: '15 min',
    },
    { 
      id: 4, 
      title: 'Avoid Creator Burnout',
      subtitle: 'Sustainable strategies',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=400&fit=crop',
      duration: '10 min',
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
          <Text style={styles.metaTitle}>Grow your audience and</Text>
          <Text style={styles.metaTitle}>collaborate with brands.</Text>
          <View style={styles.metaBadge}>
            <Ionicons name="shield-checkmark" size={18} color={THEME.primary} />
            <Text style={styles.metaText}>Powered by Official META APIs</Text>
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
      <StatusBar barStyle="dark-content" backgroundColor={THEME.white} translucent={false} />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Navbar profileImage={profile?.profile_image} onProfilePress={handleProfilePress}>
            <BannerSlider />
          </Navbar>
          <BrandsSection />
          <TrendingVideosSection />
          <OpportunitiesSection />
          <GrowthTipsSection />
          <MetaFooter />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default InfluencerHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
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
  
  // Navbar Styles
  navbarWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  navbarBackground: {
    position: 'absolute',
    top: 0,
    left: '-25%',
    width: '150%',
    height: 310,
    borderBottomLeftRadius: 1000,
    borderBottomRightRadius: 1000,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: 50,
    right: 0,
  },
  circle2: {
    width: 200,
    height: 200,
    top: 150,
    left: -20,
  },
  
  navbar: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  navTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 30,
    fontWeight: '900',
    color: THEME.primary,
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: THEME.primary,
    overflow: 'hidden',
  },
  
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: THEME.black,
    fontWeight: '500',
  },
  filterBtn: {
    backgroundColor: THEME.primary,
    padding: 6,
    borderRadius: 10,
  },

  // Banner Styles
  bannerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
    marginTop: 8,
  },
  bannerScroll: {
    paddingLeft: 0,
    paddingRight: 12,
  },
  bannerItem: {
    width: width - 60,
    height: 170,
    marginRight: 16,
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: THEME.white,
    shadowColor: THEME.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 24,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: THEME.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: THEME.white,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerButtonText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: THEME.secondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '15deg'}],
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    backgroundColor: '#CBD5E1',
  },
  paginationDotActive: {
    backgroundColor: THEME.primary,
    width: 24,
    height: 6,
    borderRadius: 3,
  },

  // Brands Section Styles - Infinite Carousel
  brandsWrapper: {
    marginTop: 24,
    marginBottom: 16,
  },
  brandsLoadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandsContent: {
    paddingHorizontal: 0,
    gap: 0,
  },
  brandItem: {
    width: 100,
    paddingHorizontal: 8,
  },
  brandCard: {
    alignItems: 'center',
  },
  brandImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: THEME.primary,
    backgroundColor: THEME.white,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
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
    backgroundColor: THEME.extraLightGray,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.black,
    textAlign: 'center',
  },

  // General Section Styles
  section: {
    marginVertical: 22,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.black,
    letterSpacing: -0.5,
  },
  viewAllText: {
    fontSize: 16,
    color: THEME.primary,
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
    paddingHorizontal: 24,
    gap: 16,
  },
  trendingCard: {
    width: 220,
    borderRadius: 10,
    backgroundColor: THEME.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  trendingImageContainer: {
    width: '100%',
    height: 120,
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
    padding: 14,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.black,
    marginBottom: 10,
    lineHeight: 22,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  companyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME.extraLightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.darkGray,
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
    paddingHorizontal: 24,
    gap: 16,
  },
  opportunityCard: {
    backgroundColor: THEME.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
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
    fontSize: 13,
    color: THEME.gray,
    fontWeight: '600',
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
    paddingHorizontal: 24,
    gap: 16,
  },
  growthTipCard: {
    width: 190,
  },
  growthTipImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 12,
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
    color: '#1E293B', // Darker for better contrast
    textAlign: 'left', // Changed from center to left
    lineHeight: 46, // Increased line height
    letterSpacing: -0.5,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 22,
    backgroundColor: THEME.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  metaText: {
    color: THEME.primary,
    fontWeight: '700',
    fontSize: 15, // Increased from default
    fontSize: 15,
  },
  
  // Premium Opportunities Styles
  opportunityCardPremium: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compensationBadgePremium: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compensationTextPremium: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 14,
  },
  opportunityTitlePremium: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
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
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  opportunityCompanyPremium: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#3B82F6',
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
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  
  // Compact Opportunities Styles
  opportunitiesContent: {
    paddingHorizontal: 24,
    paddingBottom: 20, // Space for shadow
  },
  compactCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compactBadgeText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 12,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    height: 40,
  },
  compactCompany: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  compactTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compactTagText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  compactApplyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});