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
  withDelay,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { router } from 'expo-router';
import { storage } from '../utils/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(40);
  const loadingWidth = useSharedValue(0);
  const pulse = useSharedValue(1);
  const badgeOpacity = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    width: `${loadingWidth.value}%`,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.35 + (pulse.value - 1) * 0.5,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: (1 - badgeOpacity.value) * 12 }],
  }));

  const checkAuthAndNavigate = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const userAuth = await storage.isAuthenticated();
      if (userAuth) {
        const role = await storage.getRole();
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
      router.replace('/role-selection');
    } catch (error) {
      console.error('Auth restore error:', error);
      try {
        await storage.clearAuth();
        router.replace('/role-selection');
      } catch (err) {}
    }
  };

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700 });
    logoScale.value = withSpring(1, { damping: 11 });

    textOpacity.value = withDelay(350, withTiming(1, { duration: 700 }));
    textTranslateY.value = withDelay(350, withSpring(0, { damping: 12 }));
    badgeOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    loadingWidth.value = withDelay(
      500,
      withTiming(100, { duration: 1600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );

    pulse.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1200 }),
          withTiming(1, { duration: 1200 })
        ),
        -1,
        false
      )
    );

    checkAuthAndNavigate();
  }, []);

  return (
    <LinearGradient
      colors={['#0B0B10', '#1A1025', '#2D1B4E']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <Animated.View style={[styles.glowOrb, styles.glow1, glowStyle]} />
      <View style={styles.glowOrb2} />
      <View style={styles.glowOrb3} />

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)']}
          style={styles.logoRing}
        >
          <View style={styles.logoInner}>
            <Image
              source={require('../assets/images/logo_fluencer.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.appName}>FLUENCER</Text>
        <LinearGradient
          colors={COLORS.gradient.main}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.taglineBar}
        >
          <Text style={styles.tagline}>India’s Collab OS</Text>
        </LinearGradient>
        <Text style={styles.mission}>
          Swipe brands · Apply in 1 tap · Create · Cash out
        </Text>
      </Animated.View>

      <Animated.View style={[styles.pillRow, badgeStyle]}>
        <View style={styles.pill}>
          <MaterialCommunityIcons name="handshake" size={14} color={COLORS.primary} />
          <Text style={styles.pillText}>Collab</Text>
        </View>
        <View style={styles.pill}>
          <MaterialCommunityIcons name="currency-inr" size={14} color={COLORS.primary} />
          <Text style={styles.pillText}>Earn</Text>
        </View>
        <View style={styles.pill}>
          <MaterialCommunityIcons name="rocket-launch" size={14} color={COLORS.primary} />
          <Text style={styles.pillText}>Grow</Text>
        </View>
      </Animated.View>

      <View style={styles.loadingContainer}>
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingBarWrap, loadingStyle]}>
            <LinearGradient
              colors={COLORS.gradient.main}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loadingBar}
            />
          </Animated.View>
        </View>
        <Text style={styles.loadingLabel}>Loading your collab world…</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.25,
  },
  glow1: {
    top: height * 0.18,
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -40,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primaryLighter,
    opacity: 0.8,
  },
  glowOrb3: {
    position: 'absolute',
    top: 60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.accentSoft,
    opacity: 0.6,
  },
  logoContainer: {
    marginBottom: 28,
    zIndex: 2,
  },
  logoRing: {
    width: 168,
    height: 168,
    borderRadius: 48,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 158,
    height: 158,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 2,
  },
  appName: {
    fontSize: 42,
    fontFamily: FONTS?.bold || 'System',
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 6,
    marginBottom: 14,
  },
  taglineBar: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  mission: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
    zIndex: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 72,
    width: width * 0.72,
    alignItems: 'center',
  },
  loadingTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  loadingBarWrap: {
    height: '100%',
  },
  loadingBar: {
    flex: 1,
    borderRadius: 4,
  },
  loadingLabel: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.textLight,
    letterSpacing: 0.4,
  },
});
