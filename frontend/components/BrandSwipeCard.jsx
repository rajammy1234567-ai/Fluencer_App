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
        {/* Like Overlay */}
        <Animated.View style={[styles.likeOverlay, likeStampStyle]}>
          <View style={styles.likeStampContainer}>
            <Text style={styles.likeText}>LIKE</Text>
          </View>
        </Animated.View>

        {/* Nope Overlay */}
        <Animated.View style={[styles.nopeOverlay, nopeStampStyle]}>
          <View style={styles.nopeStampContainer}>
            <Text style={styles.nopeText}>NOPE</Text>
          </View>
        </Animated.View>

        {/* Card Content */}
        <View style={styles.imageContainer}>
          <Image source={brand.image} style={styles.image} />
          
          {/* Gradient Overlay - Simple fallback */}
          <View style={styles.gradientOverlay} />
        </View>

        {/* Brand Info at Bottom */}
        <View style={styles.infoOverlay}>
          <View style={styles.companyRow}>
            <MaterialIcons name="business" size={15} color="#38BDF8" />
            <Text style={styles.companyNameText}>{brand.company_name || 'Brand Company'}</Text>
          </View>
          <View style={styles.brandHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{brand.name}</Text>
              {brand.verified && (
                <MaterialIcons name="verified" size={22} color="#29B6F6" />
              )}
            </View>
            
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{brand.rating}</Text>
            </View>
          </View>

          {brand.description && (
            <Text style={styles.description} numberOfLines={2}>
              {brand.description}
            </Text>
          )}

          {/* Tags/Categories */}
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{brand.category}</Text>
            </View>
            {/* Tap hint */}
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => onCardTap?.(brand)}
            >
              <Ionicons name="information-circle" size={24} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.50,
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
    borderColor: 'rgba(255,255,255,0.10)',
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
    height: '55%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    opacity: 0.9,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingBottom: 16,
  },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  companyNameText: { color: '#A855F7', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  likeOverlay: {
    position: 'absolute',
    top: 80,
    left: 30,
    zIndex: 10,
    transform: [{ rotate: '-25deg' }],
  },
  likeStampContainer: {
    borderWidth: 6,
    borderColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  likeText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4CAF50',
    letterSpacing: 4,
  },
  nopeOverlay: {
    position: 'absolute',
    top: 80,
    right: 30,
    zIndex: 10,
    transform: [{ rotate: '25deg' }],
  },
  nopeStampContainer: {
    borderWidth: 6,
    borderColor: '#FF4458',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  nopeText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FF4458',
    letterSpacing: 4,
  },
  infoButton: {
    padding: 4,
    marginLeft: 'auto',
  },
});

export default BrandSwipeCard;
