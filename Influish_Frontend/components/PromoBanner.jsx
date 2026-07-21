import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { LinearGradient } from 'expo-linear-gradient';

// Premium clean white theme colors
const THEME = {
  blue: '#3B82F6',
  blueLight: '#93C5FD',
  blueDark: '#2563EB',
  pink: '#F472B6',
  text: '#1F2937',
  textLight: '#6B7280',
};

const PromoBanner = () => {
  return (
    <Shadow
      distance={15}
      startColor="rgba(0, 0, 0, 0.08)"
      endColor="rgba(0, 0, 0, 0)"
      offset={[0, 4]}
      style={styles.shadowContainer}
    >
      <LinearGradient
        colors={[THEME.blue, THEME.blueDark, '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />
        
        <View style={styles.content}>
          <Text style={styles.mainText}>
            Built for{'\n'}influencers,{'\n'}by influencers.
          </Text>
          <View style={styles.subContainer}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>🥳</Text>
            </View>
            <Text style={styles.subText}>
              Guaranteed paid collabs.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    marginHorizontal: 0,
    borderRadius: 28,
  },
  container: {
    padding: 28,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(167, 139, 250, 0.25)',
  },
  decorCircle3: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(244, 114, 182, 0.3)',
  },
  content: {
    zIndex: 1,
  },
  mainText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 44,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  subText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default PromoBanner;
