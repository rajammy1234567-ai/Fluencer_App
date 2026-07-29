import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Animated, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import ImageCarousel from './ImageCarousel';
import FilterModal from './FilterModal';
import { COLORS } from '../constants/colors';
import { getUnreadCount } from '../services/influencerNotification.service';

const THEME = {
  blue: '#7C3AED',
  blueLight: '#A855F7',
  blueDark: '#6D28FF',
  pink: '#EC4899',
  text: '#FFFFFF',
  textLight: 'rgba(255,255,255,0.55)',
};

const AnimatedIcon = ({ name, label, delay = 0 }) => {
  return (
    <TouchableOpacity style={styles.iconButton}>
      <View>
        <View style={styles.iconCircle}>
          <Ionicons name={name} size={26} color={THEME.blue} />
        </View>
      </View>
      <Text style={styles.iconLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const HomeNavbar = () => {
  const router = useRouter();
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const placeholders = ['Search for Brands', 'Find Influencers', 'Discover Campaigns'];
  
  // Fetch unread notification count
  useEffect(() => {
    loadUnreadCount();
  }, []);

  // Refresh count when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUnreadCount();
    }, [])
  );

  const loadUnreadCount = async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };
  
  useEffect(() => {
    if (searchText) return; // Stop animation when user is typing
    
    const currentPhrase = placeholders[currentIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (placeholderText.length < currentPhrase.length) {
          setPlaceholderText(currentPhrase.substring(0, placeholderText.length + 1));
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        // Deleting
        if (placeholderText.length > 0) {
          setPlaceholderText(placeholderText.substring(0, placeholderText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % placeholders.length);
        }
      }
    }, isDeleting ? 50 : 100);
    
    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, currentIndex, searchText]);

  return (
    <>
      <LinearGradient
        colors={[THEME.blue, THEME.blueDark, '#2E5984']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles in background */}
        <View style={styles.decorCircle} />
        <View style={styles.decorCircle2} />
        
        {/* Gradient status bar ke peeche start hoga */}
        <SafeAreaView edges={['top']} style={styles.safe}>
          
          <View style={styles.topBar}>
            <Image
              source={require('../assets/images/logo_fluencer.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.right}>
              <TouchableOpacity 
                onPress={handleNotificationPress}
                style={styles.notificationButton}
              >
                <Ionicons name="notifications-outline" size={24} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.profileCircle}
                onPress={() => router.push('/(brand-tabs)/profile')}
              >
                <Ionicons name="person" size={18} color={COLORS?.primary || '#052659'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBoxFull}>
              <Ionicons name="search" size={18} color={THEME.textLight} />
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder={placeholderText}
                placeholderTextColor={THEME.textLight}
              />
            </View>
          </View>

          {/* HEADING */}
          <View style={styles.headingContainer}>
            <Text style={styles.mainHeading}>Influish Hub</Text>
            <Text style={styles.subHeading}>Where Brands & Creators Grow Together</Text>
          </View>

          {/* IMAGE CAROUSEL */}
          <ImageCarousel />

          {/* ICON BUTTONS */}
          <View style={styles.iconRow}>
            <AnimatedIcon name="musical-notes" label="Songs" delay={0} />
            <AnimatedIcon name="videocam" label="Videos" delay={1200} />
            <AnimatedIcon name="cash" label="Earn" delay={2400} />
            <AnimatedIcon name="mail" label="Contact" delay={3600} />
          </View>

        </SafeAreaView>
      </LinearGradient>

      <FilterModal 
        visible={filterVisible} 
        onClose={() => setFilterVisible(false)} 
      />
    </>
  );
};

export default HomeNavbar;

const styles = StyleSheet.create({
  gradient: {
    height: 580,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 120,
    height: 45,
    marginLeft: -10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBoxFull: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.text,
    padding: 0,
  },
  headingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  subHeading: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.90)',
    letterSpacing: 0.4,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  iconButton: {
    alignItems: 'center',
    gap: 8,
  },
  iconShadow: {
    borderRadius: 28,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14141C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  decorCircle: {
    position: 'absolute',
    top: 40,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(167, 139, 250, 0.25)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: 80,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244, 114, 182, 0.2)',
  },
});
