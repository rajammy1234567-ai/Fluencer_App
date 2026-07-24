import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withDelay,
  withSequence 
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

const { width } = Dimensions.get('window');

const RoleCard = ({ role, title, description, icon, onPress, delay }) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={role === 'influencer' 
            ? ['#ffffff', '#f0f9ff'] 
            : ['#ffffff', '#f0f9ff']}
          style={styles.cardGradient}
        >
          <View style={[
            styles.iconContainer, 
            { backgroundColor: role === 'influencer' ? '#dbeafe' : '#e0e7ff' }
          ]}>
            <MaterialCommunityIcons 
              name={icon} 
              size={36} 
              color={COLORS.primary} 
            />
          </View>
          
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{description}</Text>
          </View>

          <View style={styles.arrowContainer}>
             <MaterialCommunityIcons name="arrow-right" size={24} color={COLORS.primary} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RoleSelection = () => {
  const router = useRouter();
  
  const { mode } = useLocalSearchParams(); // 'login' or 'signup'

  // Header Animations
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSpring(1, { damping: 10 });
    
    textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(300, withSpring(0));
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const handleRoleSelect = (role) => {
    const targetPath = (mode === 'signup' || (Array.isArray(mode) && mode[0] === 'signup')) 
      ? '/(auth)/signup' 
      : '/(auth)/login';
    
    router.push({
      pathname: targetPath,
      params: { role }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.white, '#eff6ff', '#bfdbfe']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Background Shapes */}
      <View style={styles.shape1} />
      <View style={styles.shape2} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          {/* Header Section */}
          <View style={styles.header}>
            <Animated.View style={[styles.logoWrapper, logoStyle]}>
              <Image
                source={require('../assets/images/logo_fluencer.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Animated.View style={[styles.titleWrapper, textStyle]}>
              <Text style={styles.headerTitle}>Welcome to Fluencer</Text>
              <Text style={styles.headerSubtitle}>
                Choose your journey to get started
              </Text>
            </Animated.View>
          </View>

          {/* Cards Section */}
          <View style={styles.cardsWrapper}>
            <RoleCard
              role="influencer"
              title="Content Creator"
              description="Collaborate with top brands and monetize your influence."
              icon="camera-account"
              delay={500}
              onPress={() => handleRoleSelect('influencer')}
            />
            
            <RoleCard
              role="brand"
              title="Business Brand"
              description="Find the perfect creators to skyrocket your marketing."
              icon="briefcase-search"
              delay={700}
              onPress={() => handleRoleSelect('brand')}
            />
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 40 : 20,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
  },
  titleWrapper: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS?.bold || 'System',
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    maxWidth: '80%',
  },

  // Cards
  cardsWrapper: {
    gap: 20,
    marginVertical: 40,
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    borderRadius: 24,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  textContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: 8,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    opacity: 0.8,
  },
  adminText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  // Background Shapes
  shape1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  shape2: {
    position: 'absolute',
    top: 200,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
});

export default RoleSelection;