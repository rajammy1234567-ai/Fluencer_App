import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { LAYOUT } from "../constants/layout";

const SocialProofBanner = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: 'https://via.placeholder.com/100' }} 
        style={styles.avatar} 
      />
      <Text style={styles.text}>
        <Text style={styles.highlight}>Piyanka</Text> with <Text style={styles.highlight}>12.0M followers</Text>, connected their Instagram.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.blue[50], // Very light blue
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.borderRadius.lg,
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
    borderWidth: 1,
    borderColor: COLORS.blue[100],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: LAYOUT.spacing.md,
    backgroundColor: '#DDD',
  },
  text: {
    flex: 1,
    fontSize: FONTS?.sizes?.sm || 20,
    color: COLORS.text,
    lineHeight: 20,
  },
  highlight: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  }
});

export default SocialProofBanner;