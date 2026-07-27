import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, ScrollView, Text, TouchableOpacity, Image, Animated, Dimensions, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import HomeNavbar from '../../components/Navbar';
import PromoBanner from '../../components/PromoBanner';
import TrendingAudio from '../../components/TrendingAudio';
import TipsTricks from '../../components/TipsTricks';
import MyCampaigns from '../../components/MyCampaigns';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuthHeader } from '../../utils/storage';
import { API, getApiUrl } from '../../constants/api';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Fresh Color Palette - Travel App Inspired
const THEME = {
  // Primary Colors
  primary: '#3b82f6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  // Secondary Colors
  secondary: '#FF6B9D',
  secondaryLight: '#FFB8D2',
  
  // Accent Colors
  accent1: '#A78BFA', // Purple
  accent2: '#34D399', // Green
  accent3: '#FBBF24', // Yellow
  accent4: '#F87171', // Red
  
  // Neutrals
  white: '#FFFFFF',
  black: '#1A1A2E',
  darkGray: '#3D3D4E',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  extraLightGray: '#F8F9FA',
  
  // Footer Gray
  footerTextGray: '#B8BCC4',
  
  // Gradients
  gradientStart: '#3b82f6',
  gradientEnd: '#2563EB',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.12)',
  shadowStrong: 'rgba(0, 0, 0, 0.18)',
};

// Sample data (same as original)
const bannerImages = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
];

const productCategories = [
  { id: 1, name: 'Ethnic Sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=150&h=150&fit=crop', color: '#3B82F6' },
  { id: 2, name: 'Linen Kurtas', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=150&h=150&fit=crop', color: '#10B981' },
  { id: 3, name: 'Bridal Lehengas', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=150&h=150&fit=crop', color: '#8B5CF6' },
  { id: 4, name: 'Organza Dupattas', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=150&h=150&fit=crop', color: '#F59E0B' },
  { id: 5, name: 'Urban Hoodies', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=150&h=150&fit=crop', color: '#EF4444' },
  { id: 6, name: 'Gold Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&h=150&fit=crop', color: '#EC4899' },
];

const trendingProducts = [
  { id: 1, name: 'Banarasi Silk Saree', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=150&h=150&fit=crop' },
  { id: 2, name: 'Summer Linen Kurta', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=150&h=150&fit=crop' },
  { id: 3, name: 'Bridal Zardozi Lehenga', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=150&h=150&fit=crop' },
  { id: 4, name: '18K Gold Plated Set', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&h=150&fit=crop' },
  { id: 5, name: 'Streetwear Oversized Hoodie', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=150&h=150&fit=crop' },
];

const businessHackProducts = [
  { 
    id: 1, 
    name: 'Choose brand for your Niche', 
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=300&fit=crop',
    type: 'video',
    gradient: ['#FF6B9D', '#FF8CAD']
  },
  { 
    id: 2, 
    name: 'Why Are Reels Skipped?', 
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=300&fit=crop',
    type: 'video',
    gradient: ['#3b82f6', '#60A5FA']
  },
  { 
    id: 3, 
    name: 'Overpaying Influencers', 
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=200&h=300&fit=crop',
    type: 'video',
    gradient: ['#A78BFA', '#C4B5FD']
  },
  { 
    id: 4, 
    name: 'Brand Marketing Tips', 
    image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=200&h=300&fit=crop',
    type: 'video',
    gradient: ['#34D399', '#6EE7B7']
  },
];

const forYouProducts = [
  { 
    id: 1, 
    name: 'Hawaiian shirt', 
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&h=150&fit=crop',
    rating: 4.5,
    reviews: '4.5'
  },
  { 
    id: 2, 
    name: 'Designer Sunglasses', 
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=150&fit=crop',
    rating: 4.8,
    reviews: '4.8'
  },
  { 
    id: 3, 
    name: 'Smart Watch Pro', 
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=150&fit=crop',
    rating: 4.3,
    reviews: '4.3'
  },
  { 
    id: 4, 
    name: 'Wireless Headphones', 
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=150&fit=crop',
    rating: 4.6,
    reviews: '4.6'
  },
  { 
    id: 5, 
    name: 'Leather Jacket', 
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=150&fit=crop',
    rating: 4.7,
    reviews: '4.7'
  },
  { 
    id: 6, 
    name: 'Running Shoes', 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=150&fit=crop',
    rating: 4.9,
    reviews: '4.9'
  },
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

// Navbar Component - Redesigned with Oval Wave & Search
const Navbar = ({ children, profileImage, unreadCount }) => {
  return (
    <View style={styles.navbarWrapper}>
      {/* Gradient Wave Background - OVAL SHAPE with White to Blue gradient */}
      <LinearGradient
        colors={['#FFFFFF', '#EFF6FF', '#DBEAFE', '#3b82f6']}
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
          <View style={styles.navRightIcons}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.navigate('/(brand-tabs)/notifications')}
            >
              <Ionicons name="notifications-outline" size={26} color={THEME.primary} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.navigate('/(brand-tabs)/profile')}
            >
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
                  <Ionicons
                    name="person"
                    size={20}
                    color="#fff"
                  />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={THEME.gray} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search brands, products..."
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

// Banner Slider Component - Redesigned
const BannerSlider = () => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    let animRef = null;
    const interval = setInterval(() => {
      if (!isMounted) return;
      // Fade out
      animRef = Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      });
      animRef.start(() => {
        if (!isMounted) return;
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % bannerImages.length;
          if (isMounted && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: nextIndex * (width - 48),
              animated: true,
            });
          }
          return nextIndex;
        });
        if (!isMounted) return;
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      fadeAnim.stopAnimation();
    };
  }, []);

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
          {bannerImages.map((image, index) => (
            <AnimatedCard key={index} delay={index * 100}>
              <View style={styles.bannerItem}>
                <Image source={{ uri: image }} style={styles.bannerImage} />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>Grab the Best Deals on Your</Text>
                  <Text style={styles.bannerSubtitle}>Favorite Products</Text>
                  <TouchableOpacity style={styles.bannerButton}>
                    <Text style={styles.bannerButtonText}>Shop Now</Text>
                    <Ionicons name="arrow-forward" size={18} color={THEME.primary} />
                  </TouchableOpacity>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>45%</Text>
                    <Text style={styles.discountSubText}>OFF</Text>
                  </View>
                </View>
              </View>
            </AnimatedCard>
          ))}
        </ScrollView>
      </Animated.View>
      
      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {bannerImages.map((_, index) => (
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

// Product Categories Component - Redesigned as Brands with Smooth Infinite Scroll
const ProductCategories = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const cardWidth = 96; // Card width + gap (bigger)
  const totalWidth = productCategories.length * cardWidth;
  
  // Duplicate data for seamless infinite scroll
  const duplicatedCategories = [...productCategories, ...productCategories, ...productCategories];

  useEffect(() => {
    let isMounted = true;
    let currentPosition = totalWidth;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: currentPosition, animated: false });
    }

    const animateScroll = () => {
      if (!isMounted || !scrollViewRef.current) return;
      currentPosition += 1;
      if (currentPosition >= totalWidth * 2) {
        currentPosition = totalWidth;
        scrollViewRef.current.scrollTo({ x: currentPosition, animated: false });
      }
      scrollViewRef.current.scrollTo({ x: currentPosition, animated: false });
    };

    const interval = setInterval(animateScroll, 30);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.categoriesWrapper}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Brands</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
        scrollEventThrottle={16}
      >
        {duplicatedCategories.map((category, index) => (
          <TouchableOpacity key={`${category.id}-${index}`} style={styles.categoryItem}>
            <View style={[styles.categorySquare, { backgroundColor: category.color + '20' }]}>
              <Image source={{ uri: category.image }} style={styles.categoryImage} />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryRole}>Influencer</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Business Hack Section Component - Redesigned with Video and Text Below
const BusinessHackSection = () => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Business Hacks</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.businessHackContent}
      >
        {businessHackProducts.map((product, index) => (
          <AnimatedCard key={product.id} delay={index * 100}>
            <TouchableOpacity style={styles.businessHackCard}>
              {/* Video Container */}
              <View style={styles.businessHackVideoContainer}>
                <View style={styles.businessHackGradient}>
                  <Image source={{ uri: product.image }} style={styles.businessHackImage} />
                  <TouchableOpacity style={styles.playButton}>
                    <Ionicons name="play" size={28} color={THEME.white} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Text Below Video */}
              <View style={styles.businessHackTextContainer}>
                <Text style={styles.businessHackTitle}>{product.name}</Text>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}
      </ScrollView>
    </View>
  );
};

// Meta Footer Component - Redesigned to match screenshot
const MetaFooter = () => {
  return (
    <View style={styles.metaFooter}>
      {/* Decorative Circles at Bottom */}
      
      
      
      <Text style={styles.metaTitle}>Find desired and</Text>
      <Text style={styles.metaTitle}>verified influencers.</Text>
        <Text style={styles.metaText}>Backed by Official META API'S</Text>
              
    </View>
  );
};

const BrandHome = () => {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(getApiUrl(API.BRANDS.PROFILE), { headers });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    }
  };

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(getApiUrl('/api/notifications/unread-count'), { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.count);
        }
      }
    } catch (error) {
      console.log('Error fetching unread count:', error);
    }
  };

  // Refresh profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchUnreadCount();
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
          <Navbar profileImage={profile?.profile_image || profile?.company_logo} unreadCount={unreadCount}>
            <BannerSlider />
          </Navbar>
          <ProductCategories />
          <BusinessHackSection />
          <MetaFooter />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default BrandHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background for better contrast
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
  
  // Navbar Styles - Oval Shape with White to Blue Gradient
  navbarWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  navbarBackground: {
    position: 'absolute',
    top: 0,
    left: '-25%',
    width: '150%',
    height: 350, // Smaller - crosses mid carousel
    borderBottomLeftRadius: 1000,
    borderBottomRightRadius: 1000,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
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
    paddingTop:60,
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
    marginLeft: 0,
    flex: 1,
  },
  navRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
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

  // Banner Styles - Inside Wave Shape
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
    width: width - 60, // Slightly exposed next card
    height: 170, // Taller cards
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

  // Categories/Brands Styles
  categoriesWrapper: {
    marginTop: 18,
    marginBottom: 16,
    position: 'relative',
    overflow: 'visible',
  },
  
  // Decorative Gradient Blobs
  decorBlobRight: {
    position: 'absolute',
    top: -30,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  decorBlobLeft: {
    position: 'absolute',
    top: -20,
    left: -80,
    width: 200,
    height: 250,
    borderRadius: 100,
  },
  decorBlobRightLarge: {
    position: 'absolute',
    top: 0,
    right: -60,
    width: 220,
    height: 300,
    borderRadius: 110,
  },
  decorBlobLeftSmall: {
    position: 'absolute',
    top: -10,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  categoryItem: {
    alignItems: 'center',
    width: 90,
  },
  categorySquare: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    resizeMode: 'cover',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.black,
    textAlign: 'center',
  },
  categoryRole: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '500',
    marginTop: 2,
  },

  // General Section Styles
  section: {
    marginVertical: 20,
    position: 'relative',
    overflow: 'visible',
  },
  sectionHeader: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0,
  },
  viewAllText: {
    fontSize: 16,
    color: THEME.primary,
    fontWeight: '600',
  },

  // Routes / Trending Styles
  routesContent: {
    paddingHorizontal: 24,
    gap: 14,
    paddingBottom: 8,
  },
  routeCard: {
    width: 280,
    height: 200,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routeGradient: {
    width: '100%',
    height: '100%',
  },
  routeImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  routeContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  routeFlag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  routeInfo: {},
  routeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    marginBottom: 8,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  routePrice: {
    fontSize: 15,
    color: THEME.white,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 10,
  },
  routeDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginLeft: 4,
  },
  routeAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    color: THEME.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Rent Car Styles
  rentCarContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  rentCarCard: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderRadius: 26,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rentCarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  rentCarInfo: {
    flex: 1,
  },
  rentCarDate: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.black,
    marginBottom: 4,
  },
  rentCarDetails: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: '500',
  },
  rentCarButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Business Hack Styles
  businessHackContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  businessHackCard: {
    width: 240,
  },
  businessHackVideoContainer: {
    width: '100%',
    height: 300,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: THEME.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  businessHackGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#000',
  },
  businessHackImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  businessHackTextContainer: {
    paddingTop: 12,
    paddingHorizontal: 2,
  },
  businessHackTitle: {
    color: THEME.black,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  
  // Meta Footer
  metaFooter: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  footerCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
  },
  footerCircle1: {
    width: 200,
    height: 200,
    bottom: -80,
    left: -60,
  },
  footerCircle2: {
    width: 150,
    height: 150,
    bottom: -40,
    right: -50,
  },
  footerGradientBlob: {
    position: 'absolute',
    bottom: -50,
    left: -80,
    width: 250,
    height: 200,
    borderRadius: 100,
  },
  metaTitle: {
    fontSize: 36,
    fontWeight: '500',
    color: '#9CA3AF',
    lineHeight: 44,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: THEME.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  metaText: {
    paddingVertical: 4,
    paddingLeft: 8,
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 16,
  },
  metaLogo: {
    width: 70, 
    height: 24,
    marginHorizontal: 4,
  },
});