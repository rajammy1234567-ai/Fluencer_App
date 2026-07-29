/**
 * Shared motion helpers — soft slide / fade for lists & screens
 * Uses react-native-reanimated (already in project)
 */
import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  FadeInLeft,
  ZoomIn,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

/** Screen root fade+slide on mount */
export function ScreenEnter({ children, style, delay = 0 }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(420).springify().damping(16)}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </Animated.View>
  );
}

/** Soft fade-in (headers, empty states) */
export function FadeInView({ children, style, delay = 0, duration = 400 }) {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(duration)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Slide up + fade (cards, sections) */
export function SlideUp({ children, style, delay = 0, distance = 28 }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(450).springify().damping(15)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

/** List row: staggered slide from bottom */
export function StaggerItem({ children, index = 0, style, baseDelay = 40 }) {
  const delay = Math.min(index * baseDelay, 480);
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(380).springify().damping(16)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

/** Horizontal chip / card slide */
export function SlideInCard({ children, index = 0, style, from = 'right' }) {
  const delay = Math.min(index * 50, 400);
  const entering =
    from === 'left'
      ? FadeInLeft.delay(delay).duration(360)
      : FadeInRight.delay(delay).duration(360);
  return (
    <Animated.View entering={entering.springify().damping(15)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Scale pop for badges / icons */
export function PopIn({ children, style, delay = 0 }) {
  return (
    <Animated.View entering={ZoomIn.delay(delay).duration(320).springify()} style={style}>
      {children}
    </Animated.View>
  );
}

/** Press scale feedback (buttons / cards) */
export function PressScale({ children, onPress, style, disabled }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 250 });
      }}
    >
      <Animated.View style={[style, animStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Horizontal auto-slide marquee feel for a row of children */
export function SoftScrollHint({ children, style }) {
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withTiming(1, { duration: 1200 });
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, 1], [0.4, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(x.value, [0, 1], [12, 0], Extrapolation.CLAMP),
      },
    ],
  }));
  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}

export {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  FadeInLeft,
  ZoomIn,
  SlideInRight,
};

export default {
  ScreenEnter,
  FadeInView,
  SlideUp,
  StaggerItem,
  SlideInCard,
  PopIn,
  PressScale,
};
