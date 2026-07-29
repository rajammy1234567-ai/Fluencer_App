import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

export default function RoleSelection() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setTimeout(() => {
      router.push({
        pathname: '/(auth)/signup',
        params: { role },
      });
    }, 300);
  };

  return (
    <LinearGradient
      colors={COLORS?.gradient?.main || [COLORS.primary, COLORS.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative Organic Shapes */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />
      <View style={styles.decorCircle4} />
      <View style={styles.decorCircle5} />
      <View style={styles.decorBubble1} />
      <View style={styles.decorBubble2} />
      <View style={styles.decorBubble3} />
      
      <SafeAreaView style={styles.wrapper}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="star-circle" size={90} color={COLORS?.white || '#FFFFFF'} />
            </View>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.title}>Influish</Text>
            <Text style={styles.subtitle}>Enter personal details to your</Text>
            <Text style={styles.subtitle}>employee account</Text>
          </View>

          <View style={styles.roleContainer}>
            {/* Influencer Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleRoleSelect('influencer')}
              style={[
                styles.roleCard,
                selectedRole === 'influencer' && styles.selectedCard,
              ]}
            >
              <LinearGradient
                colors={
                  selectedRole === 'influencer'
                    ? [COLORS?.primaryLight || '#7DA0CA', COLORS?.primary || '#052659']
                    : ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']
                }
                style={styles.cardGradient}
              >
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="account-star" size={56} color={COLORS?.white || '#FFFFFF'} />
                </View>
                <Text style={styles.roleTitle}>{"I'm an Influencer"}</Text>
                <Text style={styles.roleDescription}>
                  Connect with top brands and grow your influence
                </Text>
                <MaterialCommunityIcons 
                  name="arrow-right-circle" 
                  size={32} 
                  color="rgba(255,255,255,0.9)" 
                  style={styles.arrowIcon}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Brand Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleRoleSelect('brand')}
              style={[
                styles.roleCard,
                selectedRole === 'brand' && styles.selectedCard,
              ]}
            >
              <LinearGradient
                colors={
                  selectedRole === 'brand'
                    ? [COLORS?.primaryLighter || '#C1E8FF', COLORS?.primaryLight || '#7DA0CA']
                    : ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']
                }
                style={styles.cardGradient}
              >
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="office-building" size={56} color={COLORS?.white || '#FFFFFF'} />
                </View>
                <Text style={styles.roleTitle}>{"I'm a Brand"}</Text>
                <Text style={styles.roleDescription}>
                  Find perfect influencers for your campaigns
                </Text>
                <MaterialCommunityIcons 
                  name="arrow-right-circle" 
                  size={32} 
                  color="rgba(255,255,255,0.9)" 
                  style={styles.arrowIcon}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Sign in
            </Text>
            <TouchableOpacity style={styles.signUpButton}>
              <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 15,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: FONTS?.bold || 'System',
    color: COLORS?.white || '#FFFFFF',
    marginBottom: 15,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  title: {
    fontSize: 52,
    fontFamily: FONTS?.bold || 'System',
    color: COLORS?.white || '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: FONTS?.regular || 'System',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: 3,
    letterSpacing: 0.4,
    lineHeight: 24,
  },
  roleContainer: {
    marginBottom: 40,
    gap: 18,
    paddingHorizontal: 5,
  },
  roleCard: {
    borderRadius: 25,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  selectedCard: {
    elevation: 15,
    shadowOpacity: 0.4,
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    paddingVertical: 40,
    paddingHorizontal: 35,
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    minHeight: 240,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  roleTitle: {
    fontSize: 30,
    fontFamily: FONTS?.bold || 'System',
    color: COLORS?.white || '#FFFFFF',
    marginBottom: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  roleDescription: {
    fontSize: 17,
    fontFamily: FONTS?.regular || 'System',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 25,
    paddingHorizontal: 15,
    letterSpacing: 0.3,
  },
  arrowIcon: {
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 18,
    fontFamily: FONTS?.medium || 'System',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'left',
  },
  signUpButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  signUpText: {
    fontSize: 16,
    fontFamily: FONTS?.bold || 'System',
    color: COLORS?.white || '#FFFFFF',
    textAlign: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    opacity: 0.7,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.6,
  },
  decorCircle3: {
    position: 'absolute',
    top: 150,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    opacity: 0.5,
  },
  decorCircle4: {
    position: 'absolute',
    bottom: 200,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    opacity: 0.4,
  },
  decorCircle5: {
    position: 'absolute',
    top: '30%',
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    opacity: 0.6,
  },
  decorBubble1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    opacity: 0.8,
  },
  decorBubble2: {
    position: 'absolute',
    bottom: '25%',
    right: '15%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    opacity: 0.7,
  },
  decorBubble3: {
    position: 'absolute',
    top: '60%',
    left: '5%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    opacity: 0.9,
  },
});
