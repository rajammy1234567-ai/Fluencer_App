// TAB 4: LIKED BRANDS - Saved Brands
// NEW FEATURE – Creating liked brands functionality
// This allows influencers to save/bookmark brands for future reference

import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';
import { API, API_CONFIG } from '../../constants/api';
import { getAuthHeader } from '../../utils/storage';
import WaveHeader from '../../components/WaveHeader';

const LIKED_BRANDS_KEY = '@influencer_liked_brands';

export default function LikedBrands() {
  const router = useRouter();
  const [likedBrands, setLikedBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch liked brands on screen focus
  useFocusEffect(
    React.useCallback(() => {
      loadLikedBrands();
    }, [])
  );

  // Load liked brands from AsyncStorage (synced when user swipes right on campaigns)
  // Replaced dummy data with real storage-based approach
  const loadLikedBrands = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIKED_BRANDS_KEY);
      if (stored) {
        setLikedBrands(JSON.parse(stored));
      } else {
        // Show empty state - brands will be added when user likes campaigns
        setLikedBrands([]);
      }
    } catch (error) {
      console.error('Failed to load liked brands:', error);
      setLikedBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Unlike a brand
  const handleUnlike = async (brandId) => {
    Alert.alert(
      'Unlike Brand',
      'Remove this brand from your liked list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = likedBrands.filter(b => b.id !== brandId);
            setLikedBrands(updated);
            await AsyncStorage.setItem(LIKED_BRANDS_KEY, JSON.stringify(updated));
          },
        },
      ]
    );
  };

  const handleViewCampaigns = (item) => {
    router.push({
      pathname: '/campaigns',
      params: { campaignId: item.id || item._id, openApply: 'true' }
    });
  };

  const handleBrandPress = (brand) => {
    handleViewCampaigns(brand);
  };

  const renderBrand = ({ item }) => (
    <TouchableOpacity
      style={styles.brandCard}
      onPress={() => handleBrandPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.brandHeader}>
        <View style={styles.brandLeft}>
          {item.logo ? (
            <Image source={{ uri: item.logo }} style={styles.brandLogo} />
          ) : (
            <View style={[styles.brandLogo, styles.logoPlaceholder]}>
              <MaterialCommunityIcons
                name="office-building"
                size={24}
                color={COLORS.primary}
              />
            </View>
          )}

          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>{item.name}</Text>
            <Text style={styles.brandCategory}>{item.category}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.unlikeButton}
          onPress={() => handleUnlike(item.id)}
        >
          <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.brandStats}>
        <View style={styles.stat}>
          <MaterialCommunityIcons
            name="account-group"
            size={16}
            color={COLORS.gray[400]}
          />
          <Text style={styles.statText}>{item.followers} followers</Text>
        </View>

        <View style={styles.stat}>
          <MaterialCommunityIcons
            name="bullhorn"
            size={16}
            color={COLORS.gray[400]}
          />
          <Text style={styles.statText}>{item.campaigns} campaigns</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewButton} onPress={() => handleViewCampaigns(item)}>
        <Text style={styles.viewButtonText}>View Campaigns</Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={18}
          color={COLORS.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="heart-outline"
        size={64}
        color={COLORS.gray[300]}
      />
      <Text style={styles.emptyTitle}>No Liked Brands Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring campaigns and save brands you're interested in
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)/campaigns')}
      >
        <Text style={styles.exploreButtonText}>Explore Campaigns</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <WaveHeader height={120}>
        <Text style={styles.headerTitle}>Liked Brands</Text>
        <Text style={styles.headerSubtitle}>
          {likedBrands.length} {likedBrands.length === 1 ? 'brand' : 'brands'}
        </Text>
      </WaveHeader>

      {/* Brands List */}
      <FlatList
        data={likedBrands}
        renderItem={renderBrand}
        keyExtractor={(item) => item.id.toString()}
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
  header: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3b82f6', // REQUESTED BLUE
    marginBottom: 4,
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF', // Changed to white
  },
  listContent: {
    paddingVertical: 8,
    paddingTop: 140, // Increased to push content below wave shape
  },
  brandCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  logoPlaceholder: {
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  brandCategory: {
    fontSize: 13,
    color: COLORS.gray[400],
  },
  unlikeButton: {
    padding: 8,
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
    backgroundColor: COLORS.gray[50],
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray[400],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
