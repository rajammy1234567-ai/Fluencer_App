import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS } from "../../constants/colors";
import { FONTS } from "../../constants/fonts";
import { LAYOUT } from "../../constants/layout";

// Components
import UnlockFeatureCard from '../../components/UnlockFeatureCard';
import SocialProofBanner from '../../components/SocialProofBanner';
import BrandFooter from '../../components/BrandFooter';

const Search = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* 1. Header Section */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Text style={styles.headline}>
            Unlock Brand{'\n'}
            <Text style={{ color: COLORS.secondary }}>Campaigns</Text>
          </Text>
          <Text style={styles.subHeadline}>
            Verify Instagram to access collabs.
          </Text>
        </Animated.View>

        {/* 2. Features List */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            
            <UnlockFeatureCard 
                icon="star" // Pass actual icon name if using library
                color="#DBEAFE" // Light Blue
                title="Why is this required?"
                subtitle="Brands need to verify your Insights (Reach & Engagement) before hiring you."
            />

            <UnlockFeatureCard 
                icon="shield"
                color="#DCFCE7" // Light Green
                title="100% Safe & Secure"
                subtitle="We use official Meta APIs. We cannot see your password or post for you."
            />

            <UnlockFeatureCard 
                icon="megaphone"
                color="#F3E8FF" // Light Purple
                title="Unlock Campaign"
                subtitle="Get instant access to paid and barter campaigns after verifying."
            />

        </Animated.View>

        {/* 3. Social Proof */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={{ marginTop: LAYOUT.spacing.md }}>
            <SocialProofBanner />
        </Animated.View>

        {/* 4. CTA Section */}
        <View style={styles.ctaSection}>
            <Text style={styles.communityText}>Join community of 160K influencers.</Text>
            
            <TouchableOpacity style={styles.verifyButton} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Verify with Instagram</Text>
                {/* Instagram Icon Placeholder - Replace with Image or Icon */}
                <View style={styles.instaIcon} />
            </TouchableOpacity>
        </View>

        {/* 5. Footer */}
        <BrandFooter />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#c1e8ff',
  },
  scrollContent: {
    padding: LAYOUT.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
    marginTop: LAYOUT.spacing.md,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: COLORS.primary, // Using primary for "Unlock Brand"
    lineHeight: 40,
    marginBottom: LAYOUT.spacing.sm,
  },
  subHeadline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  ctaSection: {
      alignItems: 'center',
      marginBottom: LAYOUT.spacing.lg,
  },
  communityText: {
      fontSize: FONTS.sizes.sm,
      color: COLORS.textLight,
      marginBottom: LAYOUT.spacing.md,
  },
  verifyButton: {
      backgroundColor: COLORS.primary, // Main Purple
      width: '100%',
      paddingVertical: LAYOUT.spacing.md,
      borderRadius: 50, // Pill shape
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      // Shadow
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
  },
  buttonText: {
      color: COLORS.textWhite,
      fontSize: FONTS.sizes.lg,
      fontWeight: 'bold',
      marginRight: LAYOUT.spacing.sm,
  },
  instaIcon: {
      width: 24,
      height: 24,
      backgroundColor: 'white', // Placeholder for actual logo
      borderRadius: 6,
  }
});

export default Search;