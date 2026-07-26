import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay,
  Easing 
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { router } from 'expo-router';
import { storage } from '../utils/storage';
import { isAdminAuthenticated } from '../utils/adminStorage';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  // Shared values for animations
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const loadingWidth = useSharedValue(0);

  // Animated styles
  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const loadingStyle = useAnimatedStyle(() => {
    return {
      width: `${loadingWidth.value}%`,
    };
  });

  const checkAuthAndNavigate = async () => {
    try {
      console.log('🔍 Checking for saved auth session...');
      
      // Artificial delay for splash animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check user auth session
      const userAuth = await storage.isAuthenticated();
      if (userAuth) {
        const role = await storage.getRole();
        console.log('✅ Saved user session found, role:', role);
        
        if (role === 'influencer') {
          router.replace('/(tabs)/home');
        } else if (role === 'business' || role === 'brand') {
          router.replace('/(brand-tabs)/home');
        } else {
          await storage.clearAuth();
          router.replace('/role-selection');
        }
        return;
      }

      // No active session -> show role selection
      console.log('ℹ️ No active session found, showing role selection');
      router.replace('/role-selection');

    } catch (error) {
      console.error('❌ Auth restore error:', error);
      try {
        await storage.clearAuth();
        router.replace('/role-selection');
      } catch (err) {}
    }
  };

  useEffect(() => {
    // Start Animation Sequence
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSpring(1, { damping: 12 });

    textOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 12 }));
    
    loadingWidth.value = withDelay(800, withTiming(100, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }));

    checkAuthAndNavigate();
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.white, '#f0f9ff', '#e0f2fe']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background Decor */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={require('../assets/images/logo_fluencer.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.appName}>FLUENCER</Text>
        <Text style={styles.tagline}>Connect. Create. Collaborate.</Text>
      </Animated.View>

      <View style={styles.loadingContainer}>
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingBar, loadingStyle]} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Primary blue light opacity
  },
  circle2: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  logoContainer: {
    marginBottom: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 160,
    height: 160,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 48,
    fontFamily: FONTS?.bold || 'System',
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: FONTS?.medium || 'System',
    color: COLORS.textLight,
    letterSpacing: 1.5,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.7,
  },
  loadingTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});
