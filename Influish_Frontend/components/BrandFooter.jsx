import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { LAYOUT } from "../constants/layout";

// Popular Campaign Categories
const CATEGORIES = ['Ethnic Wear', 'Beauty & Skin', 'Streetwear', 'Fitness', 'Tech'];

const BrandFooter = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.trustText}>POPULAR COLLABORATION CATEGORIES</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat, index) => (
          <View key={index} style={styles.badge}>
            <Text style={styles.badgeText}>{cat}</Text>
          </View>
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
  },
  trustText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: LAYOUT.spacing.md,
    textTransform: 'uppercase',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: LAYOUT.spacing.md,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default BrandFooter;