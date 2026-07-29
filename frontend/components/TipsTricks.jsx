import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { INDIAN_PEOPLE } from '../constants/sampleImages';

// Soft sage theme
const THEME = {
  purple: '#7C3AED',
  purpleLight: '#A855F7',
  purpleDark: '#6D28FF',
  pink: '#EC4899',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  text: '#FFFFFF',
  textLight: 'rgba(255,255,255,0.55)',
};

const TipsTricks = () => {
  const tipsItems = [
    { id: 1, title: 'Why Are Reels Skipped?', image: { uri: INDIAN_PEOPLE.woman1 }, emoji: '🎬' },
    { id: 2, title: 'Better Protect With This Tool', image: { uri: INDIAN_PEOPLE.man1 }, emoji: '🛡️' },
    { id: 3, title: 'Fake Followers? Do This', image: { uri: INDIAN_PEOPLE.woman2 }, emoji: '🔍' },
    { id: 4, title: 'Choose Better Creators', image: { uri: INDIAN_PEOPLE.woman3 }, emoji: '✨' },
    { id: 5, title: 'Desi Content Tips', image: { uri: INDIAN_PEOPLE.man2 }, emoji: '🇮🇳' },
  ];

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>💡</Text>
            </View>
            <Text style={styles.title}>Tips & Tricks</Text>
          </View>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {tipsItems.map((item, index) => (
            <TouchableOpacity key={item.id} activeOpacity={0.8}>
              <View>
                <View style={styles.card}>
                  <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                  <View style={styles.cardOverlay}>
                    <View style={styles.emojiCircle}>
                      <Text style={styles.cardEmoji}>{item.emoji}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    marginHorizontal: 0,
    borderRadius: 24,
  },
  container: {
    backgroundColor: THEME.cardBg,
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(244, 114, 182, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: 0.3,
  },
  seeAllButton: {
    backgroundColor: 'rgba(244, 114, 182, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeAll: {
    fontSize: 13,
    color: THEME.pink,
    fontWeight: '600',
  },
  scrollContent: {
    gap: 14,
    paddingRight: 4,
  },
  cardShadow: {
    borderRadius: 16,
  },
  card: {
    width: 110,
    height: 145,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(244, 114, 182, 0.1)',
  },
  cardOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emojiCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 14,
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 12,
    color: THEME.text,
    fontWeight: '500',
    textAlign: 'center',
    width: 110,
    lineHeight: 16,
  },
});

export default TipsTricks;
