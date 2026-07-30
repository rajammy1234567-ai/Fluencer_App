// TAB 4: LIKED BRANDS - Saved Brands with soft slide animations

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';
import WaveHeader from '../../components/WaveHeader';
import { StaggerItem, SlideUp, PressScale } from '../../components/motion';

const LIKED_BRANDS_KEY = '@influencer_liked_brands';

export default function LikedBrands() {
  const router = useRouter();
  const [likedBrands, setLikedBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadLikedBrands();
    }, [])
  );

  const loadLikedBrands = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIKED_BRANDS_KEY);
      if (stored) {
        setLikedBrands(JSON.parse(stored));
      } else {
        setLikedBrands([]);
      }
    } catch (error) {
      console.error('Failed to load liked brands:', error);
      setLikedBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (brandId) => {
    Alert.alert('Unlike Brand', 'Remove this brand from your liked list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = likedBrands.filter((b) => b.id !== brandId);
          setLikedBrands(updated);
          await AsyncStorage.setItem(LIKED_BRANDS_KEY, JSON.stringify(updated));
        },
      },
    ]);
  };

  const handleViewCompanyProfile = (item) => {
    router.push({
      pathname: '/brand-detail',
      params: {
        brandId: item.id || item._id || item.brand_id,
        name: item.name || item.company_name || item.companyName,
        logo: item.logo || item.profile_image,
      },
    });
  };

  const renderBrand = ({ item, index }) => (
    <StaggerItem index={index} baseDelay={60}>
      <PressScale onPress={() => handleViewCompanyProfile(item)} style={styles.brandCard}>
        <View style={styles.brandHeader}>
          <View style={styles.brandLeft}>
            {item.logo ? (
              <Image source={{ uri: item.logo }} style={styles.brandLogo} />
            ) : (
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={[styles.brandLogo, styles.logoPlaceholder]}
              >
                <MaterialCommunityIcons name="office-building" size={24} color={COLORS.white} />
              </LinearGradient>
            )}

            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>{item.name}</Text>
              <Text style={styles.brandCategory}>{item.category || 'Brand'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.unlikeButton} onPress={() => handleUnlike(item.id)}>
            <MaterialCommunityIcons name="heart" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.brandStats}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="account-group" size={16} color={COLORS.gray[400]} />
            <Text style={styles.statText}>{item.followers || '—'} followers</Text>
          </View>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="bullhorn" size={16} color={COLORS.gray[400]} />
            <Text style={styles.statText}>{item.campaigns || '—'} campaigns</Text>
          </View>
        </View>

        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Company Profile</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.primary} />
        </View>
      </PressScale>
    </StaggerItem>
  );

  const renderEmptyState = () => (
    <SlideUp delay={100}>
      <View style={styles.emptyState}>
        <LinearGradient colors={COLORS.gradient.light} style={styles.emptyIconWrap}>
          <MaterialCommunityIcons name="heart-outline" size={56} color={COLORS.primary} />
        </LinearGradient>
        <Text style={styles.emptyTitle}>No Liked Brands Yet</Text>
        <Text style={styles.emptySubtitle}>
          Swipe or explore campaigns and save brands you love
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push('/(tabs)/campaigns')}
          activeOpacity={0.85}
        >
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.exploreGrad}>
            <Text style={styles.exploreButtonText}>Explore Campaigns</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SlideUp>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <WaveHeader height={120}>
          <Text style={styles.headerTitle}>Liked Brands</Text>
          <Text style={styles.headerSubtitle}>Loading…</Text>
        </WaveHeader>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WaveHeader height={120}>
        <Text style={styles.headerTitle}>Liked Brands</Text>
        <Text style={styles.headerSubtitle}>
          {likedBrands.length} {likedBrands.length === 1 ? 'brand saved' : 'brands saved'}
        </Text>
      </WaveHeader>

      <FlatList
        data={likedBrands}
        renderItem={renderBrand}
        keyExtractor={(item, i) => String(item.id ?? i)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
    paddingTop: 140,
    paddingBottom: 120,
    flexGrow: 1,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 120,
  },
  brandCard: {
    backgroundColor: '#14141C',
    marginHorizontal: 16,
    marginVertical: 7,
    borderRadius: 20,
    padding: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginRight: 12,
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  brandCategory: {
    fontSize: 13,
    color: COLORS.gray[400],
  },
  unlikeButton: {
    padding: 8,
    backgroundColor: COLORS.primaryLighter,
    borderRadius: 12,
  },
  brandStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: COLORS.gray[500],
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLighter,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  exploreButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  exploreGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
});
