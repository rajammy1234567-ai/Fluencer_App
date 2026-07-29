import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

/** Premium dark glass header — violet neon depth */
const WaveHeader = ({ height = 240, children, colors }) => {
  const insets = useSafeAreaInsets();
  const totalHeight = height + insets.top;

  const waveOpacity = useSharedValue(0);
  const waveScale = useSharedValue(0.98);

  useEffect(() => {
    waveOpacity.value = withTiming(1, { duration: 380 });
    waveScale.value = withSpring(1, { damping: 16, stiffness: 100 });
  }, []);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: waveOpacity.value,
    transform: [{ scale: waveScale.value }],
  }));

  const gradientColors = colors || ['#0B0B10', '#1A1025', '#2D1B4E'];

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      <Animated.View style={[styles.ovalWrap, bgStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.ovalBackground}
        />
        <View style={styles.glowOrb} />
        <View style={styles.glowOrb2} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(50).duration(360).springify().damping(16)}
        style={[
          styles.content,
          { paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0) },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    backgroundColor: 'transparent',
  },
  ovalWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  ovalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  glowOrb: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(124, 58, 237, 0.35)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 10,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(236, 72, 153, 0.18)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 1,
    justifyContent: 'flex-start',
  },
});

export default WaveHeader;
