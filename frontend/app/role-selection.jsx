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
  ScrollView,
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
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { saveAuth } from '../utils/storage';
import { clearAdminAuth } from '../utils/adminStorage';

const { width } = Dimensions.get('window');

const RoleCard = ({ role, title, badge, description, points, icon, colors, onPress, delay }) => {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 550 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 13 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
          <View style={styles.cardTop}>
            <View style={styles.iconBubble}>
              <MaterialCommunityIcons name={icon} size={30} color={COLORS.white} />
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{description}</Text>

          <View style={styles.pointsRow}>
            {points.map((p) => (
              <View key={p} style={styles.pointChip}>
                <MaterialCommunityIcons name="check-circle" size={14} color="rgba(255,255,255,0.95)" />
                <Text style={styles.pointText}>{p}</Text>
              </View>
            ))}
          </View>

          <View style={styles.ctaRow}>
            <Text style={styles.ctaText}>Continue</Text>
            <View style={styles.ctaArrow}>
              <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.primary} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RoleSelection = () => {
  const router = useRouter();
  const { mode } = useLocalSearchParams();

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700 });
    logoScale.value = withSpring(1, { damping: 11 });
    textOpacity.value = withDelay(250, withTiming(1, { duration: 600 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const handleRoleSelect = (role) => {
    const targetPath =
      mode === 'signup' || (Array.isArray(mode) && mode[0] === 'signup')
        ? '/(auth)/signup'
        : '/(auth)/login';

    router.push({
      pathname: targetPath,
      params: { role },
    });
  };

  const handleSkip = async (role = 'influencer') => {
    const guestRole = role === 'brand' || role === 'business' ? 'brand' : 'influencer';
    try {
      await clearAdminAuth();
      await saveAuth('guest-skip-token', 'guest-user', guestRole);
      router.replace(guestRole === 'brand' ? '/(brand-tabs)/home' : '/(tabs)/home');
    } catch (error) {
      console.error('Skip navigation error:', error);
      router.replace(guestRole === 'brand' ? '/(brand-tabs)/home' : '/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B10', '#1A1025', '#2D1B4E']}
        style={styles.topHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.heroOrb1} />
        <View style={styles.heroOrb2} />
        <SafeAreaView>
          <View style={styles.heroContent}>
            <Animated.View style={[styles.logoRow, logoStyle]}>
              <View style={styles.logoBox}>
                <Image
                  source={require('../assets/images/logo_fluencer.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.brandName}>FLUENCER</Text>
                <Text style={styles.brandTag}>🇮🇳 India’s Collab OS</Text>
              </View>
            </Animated.View>

            <Animated.View style={textStyle}>
              <Text style={styles.heroTitle}>Not another social app.{'\n'}A paid collab engine.</Text>
              <Text style={styles.heroSub}>
                Swipe campaigns · apply once · chat brands · get paid in wallet.
              </Text>
            </Animated.View>

            {/* Always-visible Skip on first screen */}
            <TouchableOpacity
              style={styles.heroSkipBtn}
              onPress={() => handleSkip('influencer')}
              activeOpacity={0.9}
            >
              <Text style={styles.heroSkipText}>Skip login · Explore app</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetScroll}
        >
          <Text style={styles.sectionLabel}>Get started</Text>
          <Text style={styles.sectionTitle}>Choose your path</Text>

          <RoleCard
            role="influencer"
            title="I'm a Creator"
            badge="CREATE"
            description="Apply to brand campaigns, showcase your work, and get paid for collaborations."
            points={['Find campaigns', 'Chat brands', 'Track payouts']}
            icon="account-star-outline"
            colors={['#7C3AED', '#6D28FF', '#5B21B6']}
            delay={300}
            onPress={() => handleRoleSelect('influencer')}
          />

          <RoleCard
            role="brand"
            title="I'm a Brand"
            badge="HIRE"
            description="Discover creators of all kinds, launch campaigns, and grow with the right partners."
            points={['Post campaigns', 'Pick talent', 'Measure ROI']}
            icon="storefront-outline"
            colors={['#A855F7', '#7C3AED', '#6D28FF']}
            delay={480}
            onPress={() => handleRoleSelect('brand')}
          />

          <View style={styles.skipSection}>
            <Text style={styles.skipLabel}>No account needed to look around</Text>
            <TouchableOpacity style={styles.skipButton} onPress={() => handleSkip('influencer')} activeOpacity={0.88}>
              <LinearGradient colors={COLORS.gradient.main} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.skipGradient}>
                <Text style={styles.skipButtonText}>Skip & Explore App</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.skipRoleRow}>
              <TouchableOpacity onPress={() => handleSkip('influencer')} style={styles.skipRoleChip}>
                <MaterialCommunityIcons name="account-star-outline" size={16} color={COLORS.primary} />
                <Text style={styles.skipRoleText}>As Creator</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSkip('brand')} style={styles.skipRoleChip}>
                <MaterialCommunityIcons name="briefcase-outline" size={16} color={COLORS.primary} />
                <Text style={styles.skipRoleText}>As Brand</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHero: {
    paddingBottom: 36,
    overflow: 'hidden',
  },
  heroOrb1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.35,
  },
  heroOrb2: {
    position: 'absolute',
    bottom: 20,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.accentSoft,
    opacity: 0.7,
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 28 : 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#14141C',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 44,
    height: 44,
  },
  brandName: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandTag: {
    color: COLORS.primary,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 36,
    marginBottom: 10,
    fontFamily: FONTS?.bold || 'System',
  },
  heroSub: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 21,
    maxWidth: width * 0.9,
  },
  heroSkipBtn: {
    marginTop: 18,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  heroSkipText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  sheet: {
    flex: 1,
    marginTop: -22,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 18,
  },
  cardContainer: {
    width: '100%',
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  cardGradient: {
    padding: 20,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBubble: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 21,
    marginBottom: 14,
  },
  pointsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pointChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  ctaArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#14141C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipSection: {
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  skipLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  skipButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  skipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  skipButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  skipRoleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  skipRoleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#14141C',
  },
  skipRoleText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default RoleSelection;
