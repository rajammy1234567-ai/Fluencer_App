import React from 'react';
import { View, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const WaveHeader = ({ height = 240, children }) => {
  const insets = useSafeAreaInsets();
  // Adjust height to accommodate safe area
  const totalHeight = height + insets.top;

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      <LinearGradient
        colors={['#FFFFFF', '#E0F2FE', '#BFDBFE', '#3B82F6']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.ovalBackground}
      >
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
      </LinearGradient>
      
      <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0) }]}>
        {children}
      </View>
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
  ovalBackground: {
    position: 'absolute',
    top: 0,
    left: '-25%',
    width: '150%',
    height: '100%',
    borderBottomLeftRadius: 2500, // Increased for more circular shape
    borderBottomRightRadius: 2500, // Increased for more circular shape
    overflow: 'hidden',
    backgroundColor: '#3b82f6', // Fallback
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: 50,
    right: 0,
  },
  circle2: {
    width: 200,
    height: 200,
    top: 150,
    left: -20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20, // Add top padding inside the safe zone
    zIndex: 1,
    justifyContent: 'flex-start', // Align to top (White area)
  },
});

export default WaveHeader;
