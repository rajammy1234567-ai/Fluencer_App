import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CategorySelector from '../../components/CategorySelector';
import BrandSwipeCard from '../../components/BrandSwipeCard';
import SelectedBrandsModal from '../../components/SelectedBrandsModal';

import { CATEGORIES } from '../../data/categories.js';
import { BRANDS } from '../../data/brands.js';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Campaigns = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left', 'right', null

  const toggleCategory = cat => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
    setCurrentIndex(0); // Reset to first card when categories change
  };

  const selectAllCategories = () => {
    setSelectedCategories(CATEGORIES);
    setCurrentIndex(0);
  };

  const unselectAllCategories = () => {
    setSelectedCategories([]);
    setCurrentIndex(0);
  };

  const filteredBrands = useMemo(() => {
    if (!selectedCategories.length) return [];
    // Show all brands if all categories are selected
    if (selectedCategories.length === CATEGORIES.length) return BRANDS;
    return BRANDS.filter(b =>
      selectedCategories.includes(b.category)
    );
  }, [selectedCategories]);

  const handleSwipeRight = brand => {
    setSelectedBrands(prev => {
      // Avoid duplicates
      if (prev.find(b => b.id === brand.id)) {
        return prev;
      }
      return [...prev, brand];
    });
    setCurrentIndex(prev => prev + 1);
    setSwipeDirection(null);
  };

  const handleSwipeLeft = brand => {
    setCurrentIndex(prev => prev + 1);
    setSwipeDirection(null);
  };

  const handleSwipeProgress = (translateX) => {
    if (translateX > 30) {
      setSwipeDirection('right');
    } else if (translateX < -30) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleRewind = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleReject = () => {
    if (currentIndex < filteredBrands.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSuperLike = () => {
    if (currentIndex < filteredBrands.length) {
      const brand = filteredBrands[currentIndex];
      handleSwipeRight(brand);
    }
  };

  const handleLike = () => {
    if (currentIndex < filteredBrands.length) {
      const brand = filteredBrands[currentIndex];
      handleSwipeRight(brand);
    }
  };

  const handleBoost = () => {
    // Placeholder for boost action
    console.log('Boost clicked');
  };

  const handleShowSelected = () => {
    router.push({
      pathname: '/selected-brands',
      params: { brands: JSON.stringify(selectedBrands) }
    });
  };

  const visibleCards = filteredBrands.slice(currentIndex, currentIndex + 3);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={styles.headerTitle}>Discover Brands</Text>
          <Text style={styles.headerSubtitle}>Swipe to find collaboration opportunities</Text>
        </View>

        {/* Selected Brands Button */}
        {selectedBrands.length > 0 && (
          <TouchableOpacity 
            style={styles.topButton}
            onPress={handleShowSelected}
            activeOpacity={0.8}
          >
            <View style={styles.topButtonLeft}>
              <Ionicons name="heart" size={20} color={COLORS.textWhite} />
              <Text style={styles.topButtonCount}>{selectedBrands.length}</Text>
            </View>
            <Text style={styles.topButtonText}>View Selected Brands</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textWhite} />
          </TouchableOpacity>
        )}

        <View style={styles.content}>
          <ScrollView 
            style={styles.categorySection}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <CategorySelector
              categories={CATEGORIES}
              selected={selectedCategories}
              onToggle={toggleCategory}
              onSelectAll={selectAllCategories}
              onUnselectAll={unselectAllCategories}
            />
          </ScrollView>

        {selectedCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏷️</Text>
            <Text style={styles.emptyTitle}>Select Categories</Text>
            <Text style={styles.emptyText}>
              Choose one or more categories above to discover brands for collaboration
            </Text>
          </View>
        ) : filteredBrands.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>All Done!</Text>
            <Text style={styles.emptyText}>
              {"You've reviewed all brands in the selected categories"}
            </Text>
          </View>
        ) : currentIndex >= filteredBrands.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>All Done!</Text>
            <Text style={styles.emptyText}>
              {"You've reviewed all "}{filteredBrands.length}{" brands!"}
            </Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => setCurrentIndex(0)}
            >
              <Text style={styles.resetButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        ) : (          <View style={styles.swipeContainer}>
            {/* Card Stack */}
            <View style={styles.cardStack}>
              {visibleCards.map((brand, idx) => (
                <BrandSwipeCard
                  key={brand.id}
                  brand={brand}
                  index={idx}
                  isTop={idx === 0}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeProgress={handleSwipeProgress}
                />
              ))}
            </View>

            {/* Action Buttons - Positioned above tabs */}
            <View style={styles.actionButtonsContainer}>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rewindButton, currentIndex === 0 && styles.disabledButton]}
                  onPress={handleRewind}
                  disabled={currentIndex === 0}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-undo" size={24} color={currentIndex === 0 ? "#CCC" : "#FFA726"} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    styles.rejectButton,
                    swipeDirection === 'left' && styles.highlightedButton
                  ]}
                  onPress={handleReject}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="close" 
                    size={32} 
                    color={swipeDirection === 'left' ? "#FF1744" : "#FF4458"} 
                  />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.superLikeButton]}
                  onPress={handleSuperLike}
                  activeOpacity={0.7}
                >
                  <Ionicons name="star" size={24} color="#29B6F6" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    styles.likeButton,
                    swipeDirection === 'right' && styles.highlightedButton
                  ]}
                  onPress={handleLike}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="heart" 
                    size={28} 
                    color={swipeDirection === 'right' ? "#2E7D32" : "#4CAF50"} 
                  />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.boostButton]}
                  onPress={handleBoost}
                  activeOpacity={0.7}
                >
                  <Ionicons name="flash" size={24} color="#9C27B0" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Selected Brands Modal */}
      <SelectedBrandsModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        brands={selectedBrands}
      />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c1e8ff',
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: 'rgba(255, 107, 107, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
  topButton: {
    backgroundColor: '#FF6B6B',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  topButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topButtonCount: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  topButtonText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  categorySection: {
    maxHeight: 120,
  },
  swipeContainer: {
    flex: 1,
    position: 'relative',
    paddingBottom:160,
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 125,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    shadowColor: 'rgba(255, 107, 107, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  highlightedButton: {
    transform: [{ scale: 1.15 }],
    elevation: 8,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  disabledButton: {
    opacity: 0.4,
  },
  rewindButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  rejectButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  superLikeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  boostButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  cardsContainer: {
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  brandsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  scrollHint: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Campaigns;
