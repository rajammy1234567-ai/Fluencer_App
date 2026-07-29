import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Dimensions, Animated as RNAnimated } from 'react-native';
import { INDIAN_PEOPLE, INDIAN_FASHION } from '../constants/sampleImages';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - 32; // 16px padding on each side

const ImageCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const scaleAnims = useRef(
    [0, 1, 2, 3].map(() => new RNAnimated.Value(0.85))
  ).current;

  // Indian people + Indian fashion only
  const carouselImages = [
    { uri: INDIAN_PEOPLE.woman1 },
    { uri: INDIAN_PEOPLE.man1 },
    { uri: INDIAN_PEOPLE.woman2 },
    { uri: INDIAN_FASHION.saree },
  ];

  useEffect(() => {
    // Animate scales
    scaleAnims.forEach((anim, index) => {
      RNAnimated.timing(anim, {
        toValue: index === activeSlide ? 1 : 0.85,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });
  }, [activeSlide]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % carouselImages.length;
        scrollViewRef.current?.scrollTo({
          x: next * SLIDE_WIDTH,
          animated: true,
        });
        return next;
      });
    }, 4500); // 4.5 seconds per slide (slower)

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    setActiveSlide(slideIndex);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        decelerationRate="fast"
      >
        {carouselImages.map((image, index) => (
          <View key={index} style={styles.slideContainer}>
            <RNAnimated.View
              style={[
                styles.slide,
                {
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              <Image source={image} style={styles.image} resizeMode="cover" />
            </RNAnimated.View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {carouselImages.map((_, index) => (
          <RNAnimated.View
            key={index}
            style={[
              styles.dot,
              activeSlide === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  scrollView: {
    overflow: 'visible',
  },
  slideContainer: {
    width: SLIDE_WIDTH,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transition: 'all 0.3s ease',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
});

export default ImageCarousel;
