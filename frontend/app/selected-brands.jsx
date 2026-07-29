import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

const SelectedBrandsPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse brands from params (you'll pass this when navigating)
  const brands = params.brands ? JSON.parse(params.brands) : [];

  return (
    <LinearGradient
      colors={['#4A90E2', '#87CEEB', '#E6F3FF', '#FFFFFF']}
      style={styles.gradientContainer}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="heart" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Selected Brands</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Brands List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {brands.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💔</Text>
            <Text style={styles.emptyText}>No brands selected yet</Text>
            <Text style={styles.emptySubtext}>Go back and swipe right on brands you like!</Text>
          </View>
        ) : (
          <View style={styles.brandsList}>
            <Text style={styles.countText}>
              {brands.length} brand{brands.length !== 1 ? 's' : ''} selected
            </Text>
            
            {brands.map((brand, index) => (
              <View key={brand.id} style={styles.brandCard}>
                <View style={styles.brandNumber}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                
                <Image source={brand.image} style={styles.brandImage} />
                
                <View style={styles.brandInfo}>
                  <View style={styles.brandNameRow}>
                    <Text style={styles.brandName}>{brand.name}</Text>
                    {brand.verified && (
                      <MaterialIcons name="verified" size={18} color={COLORS.primary} />
                    )}
                  </View>
                  
                  <Text style={styles.brandCategory}>{brand.category}</Text>
                  
                  <View style={styles.brandRating}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.ratingText}>{brand.rating}</Text>
                  </View>
                  
                  {brand.description && (
                    <Text style={styles.brandDescription} numberOfLines={2}>
                      {brand.description}
                    </Text>
                  )}
                </View>

                <TouchableOpacity style={styles.removeButton}>
                  <Ionicons name="close-circle" size={24} color="#FF4458" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      {brands.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.proceedButton} 
            activeOpacity={0.8}
            onPress={() => {
              // TODO: Navigate to collaboration/campaign creation page
              console.log('Proceeding with brands:', brands);
            }}
          >
            <Text style={styles.proceedText}>
              Proceed with {brands.length} brand{brands.length !== 1 ? 's' : ''}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.textWhite} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  brandsList: {
    padding: 16,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  brandCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  brandNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  brandImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  brandInfo: {
    flex: 1,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  brandCategory: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  brandRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  brandDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    backgroundColor: '#fff',
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  proceedText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectedBrandsPage;
