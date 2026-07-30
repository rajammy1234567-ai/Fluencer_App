import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BackButton = ({ color = '#0f172a', style, backgroundColor = 'rgba(255,255,255,0.08)', fallbackRoute = '/(tabs)/profile' }) => {
  const router = useRouter();

  const handlePress = () => {
    try {
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        router.replace(fallbackRoute);
      }
    } catch (e) {
      router.replace(fallbackRoute);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor }]} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={color} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 16, // Padding to separate from heading
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackButton;
