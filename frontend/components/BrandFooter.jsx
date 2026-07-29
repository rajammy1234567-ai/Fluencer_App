import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { LAYOUT } from "../constants/layout";

// Mock brands for display
const BRAND_LOGOS = [
  'https://via.placeholder.com/60x30?text=Tag',
  'https://via.placeholder.com/60x30?text=Zero',
  'https://via.placeholder.com/60x30?text=TMM',
  'https://via.placeholder.com/60x30?text=Evora',
  'https://via.placeholder.com/60x30?text=Yuvary',
];

const BrandFooter = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.trustText}>TRUSTED BY 18884+ BRANDS</Text>
      <View style={styles.logoRow}>
        {BRAND_LOGOS.map((uri, index) => (
          <Image 
            key={index} 
            source={{ uri }} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.xl,
    opacity: 0.7, // Visual hierarchy
  },
  trustText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: LAYOUT.spacing.md,
    textTransform: 'uppercase',
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: LAYOUT.spacing.md,
  },
  logo: {
    width: 50,
    height: 25,
    tintColor: COLORS.text, // Makes logos greyscale/black
  }
});

export default BrandFooter;