import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

const BrandSwipeCard = ({ brand, onSwipeRight, onSwipeLeft, index = 0, isTop = false, onSwipeProgress, onCardTap }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [isRemoved, setIsRemoved] = useState(false);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY * 0.5;
      if (onSwipeProgress) {
        runOnJS(onSwipeProgress)(translateX.value);
      }
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right - liked
        translateX.value = withTiming(SCREEN_WIDTH + 100, { duration: 300 }, (finished) => {
          if (!finished) return;
          runOnJS(setIsRemoved)(true);
          if (onSwipeRight) runOnJS(onSwipeRight)(brand);
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left - rejected
        translateX.value = withTiming(-SCREEN_WIDTH - 100, { duration: 300 }, (finished) => {
          if (!finished) return;
          runOnJS(setIsRemoved)(true);
          if (onSwipeLeft) runOnJS(onSwipeLeft)(brand);
        });
      } else {
        // Return to original position
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10]
    );

    const scale = isTop ? 1 : interpolate(
      index,
      [0, 1, 2],
      [0.95, 0.90, 0.85]
    );

    const offsetY = isTop ? 0 : index * -10;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + offsetY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
      opacity: isRemoved ? 0 : 1,
    };
  });

  const likeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1]
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.5, 1]
    );

    return {
      opacity,
      transform: [{ scale }, { rotate: '-20deg' }],
    };
  });

  const nopeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0]
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0.5]
    );

    return {
      opacity,
      transform: [{ scale }, { rotate: '20deg' }],
    };
  });

  if (isRemoved) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle, { zIndex: 100 - index }]}>
        {/* Like Overlay Stamp */}
        <Animated.View style={[styles.likeOverlay, likeStampStyle]}>
          <View style={styles.likeStampContainer}>
            <Text style={styles.likeText}>LIKE</Text>
          </View>
        </Animated.View>

        {/* Nope Overlay Stamp */}
        <Animated.View style={[styles.nopeOverlay, nopeStampStyle]}>
          <View style={styles.nopeStampContainer}>
            <Text style={styles.nopeText}>NOPE</Text>
          </View>
        </Animated.View>

        {/* Card Main Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={
              typeof brand.image === 'string'
                ? { uri: brand.image }
                : brand.image?.uri
                  ? { uri: brand.image.uri }
                  : { uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' }
            } 
            style={styles.image} 
            resizeMode="cover"
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' }}
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(11, 11, 16, 0.65)', 'rgba(11, 11, 16, 0.95)']}
            style={styles.gradientOverlay}
          />
        </View>

        {/* Floating Dark Glassmorphic Card Overlay (Bottom Left) */}
        <View style={styles.infoOverlayContainer}>
          <View style={styles.glassCardContent}>
            {/* Featured Campaign Badge */}
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.featuredBadgeText}>Featured Campaign</Text>
            </View>

            {/* Title + Verified Badge */}
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{brand.name}</Text>
              {brand.verified !== false && (
                <MaterialIcons name="verified" size={20} color="#0EA5E9" style={styles.verifiedIcon} />
              )}
            </View>

            {/* Payout & Category Badges Row */}
            <View style={styles.badgeRow}>
              <View style={styles.payoutBadge}>
                <Ionicons name="cash-outline" size={13} color="#10B981" />
                <Text style={styles.payoutBadgeText}>{brand.cost || 'Paid'}</Text>
              </View>
              {brand.category ? (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{brand.category}</Text>
                </View>
              ) : null}
              {brand.seats ? (
                <View style={styles.seatsBadge}>
                  <Ionicons name="people-outline" size={12} color="#C084FC" />
                  <Text style={styles.seatsBadgeText}>{brand.seats} Seats</Text>
                </View>
              ) : null}
            </View>

            {/* Description */}
            {brand.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {brand.description}
              </Text>
            ) : null}

            {/* Action Buttons Row: View Campaign & Save */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.viewCampaignBtn}
                onPress={() => onCardTap?.(brand)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#7C3AED', '#9333EA']}
                  style={styles.viewCampaignGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="eye" size={15} color="#FFFFFF" />
                  <Text style={styles.viewCampaignText}>View Campaign</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => onCardTap?.(brand)}
                activeOpacity={0.85}
              >
                <Ionicons name="bookmark-outline" size={15} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: Math.min(SCREEN_WIDTH - 32, 440),
    height: Math.min(SCREEN_HEIGHT * 0.58, 560),
    alignSelf: 'center',
    backgroundColor: '#14141C',
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#6D28FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  infoOverlayContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  glassCardContent: {
    backgroundColor: 'rgba(18, 18, 26, 0.9)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    width: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  payoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  payoutBadgeText: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '800',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(192, 132, 252, 0.16)',
    borderWidth: 1,
    borderColor: '#C084FC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  seatsBadgeText: {
    color: '#C084FC',
    fontSize: 11,
    fontWeight: '800',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(124, 58, 237, 0.28)',
    borderWidth: 1,
    borderColor: '#A855F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: '#E9D5FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewCampaignBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  viewCampaignGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  viewCampaignText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  likeOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 20,
    transform: [{ rotate: '-20deg' }],
  },
  likeStampContainer: {
    borderWidth: 4,
    borderColor: '#22C55E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  likeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#22C55E',
    letterSpacing: 3,
  },
  nopeOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 20,
    transform: [{ rotate: '20deg' }],
  },
  nopeStampContainer: {
    borderWidth: 4,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  nopeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 3,
  },
});

export default BrandSwipeCard;
