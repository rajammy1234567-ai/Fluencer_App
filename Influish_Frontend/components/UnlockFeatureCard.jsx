import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { LAYOUT } from "../constants/layout";

const UnlockFeatureCard = ({ icon, color, title, subtitle }) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <View style={styles.mockIcon} /> 
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.borderRadius.lg,
    marginBottom: LAYOUT.spacing.md,
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.spacing.md,
  },
  mockIcon: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.text, 
    opacity: 0.5,
    borderRadius: 4,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: FONTS?.sizes?.md || 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  }
});

export default UnlockFeatureCard;