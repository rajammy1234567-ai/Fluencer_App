import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { LAYOUT } from "../constants/layout";
import { INDIAN_PEOPLE } from '../constants/sampleImages';

const SocialProofBanner = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: INDIAN_PEOPLE.woman1 }} 
        style={styles.avatar} 
      />
      <Text style={styles.text}>
        <Text style={styles.highlight}>Priyanka</Text> with <Text style={styles.highlight}>1.2M followers</Text>, connected their Instagram.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLighter,
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.borderRadius.lg,
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: LAYOUT.spacing.md,
    backgroundColor: COLORS.gray[200],
  },
  text: {
    flex: 1,
    fontSize: FONTS?.sizes?.sm || 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  highlight: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  }
});

export default SocialProofBanner;
