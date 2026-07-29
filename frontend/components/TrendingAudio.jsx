import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { INDIAN_PEOPLE } from '../constants/sampleImages';

// Soft sage theme
const THEME = {
  blue: '#7C3AED',
  blueLight: '#A855F7',
  blueDark: '#6D28FF',
  pink: '#EC4899',
  cardBg: 'rgba(255, 255, 255, 0.98)',
  text: '#FFFFFF',
  textLight: 'rgba(255,255,255,0.55)',
};

const TrendingAudio = () => {
  const audioItems = [
    { id: 1, title: 'Desi Vibe Mix', image: { uri: INDIAN_PEOPLE.woman1 } },
    { id: 2, title: 'Mumbai Nights', image: { uri: INDIAN_PEOPLE.man1 } },
    { id: 3, title: 'Festive Drop', image: { uri: INDIAN_PEOPLE.woman2 } },
    { id: 4, title: 'Creator Flow', image: { uri: INDIAN_PEOPLE.man2 } },
    { id: 5, title: 'Bollywood Beat', image: { uri: INDIAN_PEOPLE.woman3 } },
  ];

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🎵</Text>
            </View>
            <Text style={styles.title}>Trending IG Audio</Text>
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
          {audioItems.map((item, index) => (
            <TouchableOpacity key={item.id} activeOpacity={0.8}>
              <View>
                <View style={styles.card}>
                  <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                  <View style={styles.cardOverlay}>
                    <View style={styles.playButton}>
                      <Text style={styles.playIcon}>▶</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
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
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
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
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeAll: {
    fontSize: 13,
    color: THEME.blue,
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
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: THEME.blue,
    fontSize: 12,
    marginLeft: 2,
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 12,
    color: THEME.text,
    fontWeight: '500',
    textAlign: 'center',
    width: 110,
  },
});

export default TrendingAudio;
