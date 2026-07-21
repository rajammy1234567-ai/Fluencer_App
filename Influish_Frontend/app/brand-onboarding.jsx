import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Brand logos/images data - matching the screenshot layout
const brandCards = [
  // Row 1 - 3 cards
  [
    { id: 1, type: 'logo', name: 'pinterest', bg: '#E60023', icon: 'P' },
    { id: 2, type: 'person', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    { id: 3, type: 'logo', name: 'skype', bg: '#00AFF0', icon: 'S' },
  ],
  // Row 2 - 3 cards
  [
    { id: 4, type: 'person', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
    { id: 5, type: 'logo', name: 'apple', bg: '#000000', icon: '' },
    { id: 6, type: 'count', count: '+11k' },
  ],
  // Row 3 - 3 cards
  [
    { id: 7, type: 'logo', name: 'linkedin', bg: '#0A66C2', icon: 'in' },
    { id: 8, type: 'person', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
    { id: 9, type: 'logo', name: 'facebook', bg: '#1877F2', icon: 'f' },
  ],
];

// Bottom row persons
const bottomPersons = [
  { id: 10, type: 'person', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
  { id: 11, type: 'person', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
];

const THEME = {
  primary: '#00D4FF',
  white: '#FFFFFF',
  black: '#1A1A2E',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
};

const BrandOnboarding = () => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // All cards for animation (flattened)
  const allCards = [...brandCards.flat(), ...bottomPersons];
  
  // Individual card animations
  const cardAnims = useRef(
    allCards.map(() => ({
      translateY: new Animated.Value(30),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.85),
    }))
  ).current;

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Staggered card animations
    const animations = cardAnims.map((anim, index) => {
      return Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 500,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.spring(anim.scale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(60, animations).start();

    // Continuous slow slide animation - very smooth
    const startSlideAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: -10,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 10,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    setTimeout(startSlideAnimation, 800);
  }, []);

  const handleStart = () => {
    router.replace('/(brand-tabs)/home');
  };

  const renderCard = (item, globalIndex) => {
    const anim = cardAnims[globalIndex];
    
    return (
      <Animated.View
        key={item.id}
        style={[
          styles.card,
          {
            opacity: anim.opacity,
            transform: [
              { translateY: anim.translateY },
              { scale: anim.scale },
            ],
          },
        ]}
      >
        {item.type === 'logo' && (
          <View style={[styles.logoCard, { backgroundColor: item.bg }]}>
            {item.name === 'apple' ? (
              <Text style={styles.appleIcon}></Text>
            ) : item.name === 'pinterest' ? (
              <Text style={styles.logoText}>P</Text>
            ) : item.name === 'skype' ? (
              <Text style={styles.logoText}>S</Text>
            ) : item.name === 'linkedin' ? (
              <Text style={styles.logoText}>in</Text>
            ) : item.name === 'facebook' ? (
              <Text style={styles.logoText}>f</Text>
            ) : null}
          </View>
        )}
        {item.type === 'person' && (
          <View style={styles.personCard}>
            <Image source={{ uri: item.image }} style={styles.personImage} />
          </View>
        )}
        {item.type === 'count' && (
          <View style={styles.countCard}>
            <Text style={styles.countText}>{item.count}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  let globalIndex = 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Cards Grid */}
        <Animated.View 
          style={[
            styles.cardsContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {brandCards.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.cardRow}>
              {row.map((item) => {
                const card = renderCard(item, globalIndex);
                globalIndex++;
                return card;
              })}
            </View>
          ))}
          
          {/* Bottom persons row */}
          <View style={styles.bottomPersonsRow}>
            {bottomPersons.map((person) => {
              const card = renderCard(person, globalIndex);
              globalIndex++;
              return card;
            })}
          </View>
        </Animated.View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>GET YOUR</Text>
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>DREAM </Text>
            <LinearGradient
              colors={['#00D4FF', '#0099CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.jobBadge}
            >
              <Text style={styles.jobText}>JOB</Text>
            </LinearGradient>
          </View>
          
          <Text style={styles.subtitle}>
            Explore thousands of opportunities, connect{'\n'}with top companies, and apply effortlessly!
          </Text>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.9}>
          <Text style={styles.startButtonText}>Lets start</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default BrandOnboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  content: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  cardsContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  bottomPersonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  card: {
    marginHorizontal: 3,
  },
  logoCard: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.white,
  },
  appleIcon: {
    fontSize: 32,
    color: THEME.white,
  },
  personCard: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  personImage: {
    width: '100%',
    height: '100%',
  },
  countCard: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  countText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.black,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: THEME.black,
    letterSpacing: -1,
  },
  jobBadge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  jobText: {
    fontSize: 34,
    fontWeight: '800',
    color: THEME.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.lightGray,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 18,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: THEME.black,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  startButtonText: {
    color: THEME.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
