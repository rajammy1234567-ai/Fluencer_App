import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Shadow } from 'react-native-shadow-2';

// Premium clean white theme colors
const THEME = {
  blue: '#3B82F6',
  blueLight: '#93C5FD',
  blueDark: '#2563EB',
  pink: '#F472B6',
  cardBg: 'rgba(255, 255, 255, 0.98)',
  text: '#1F2937',
  textLight: '#6B7280',
};

const TrendingAudio = () => {
  const audioItems = [
    { id: 1, title: 'The Facs of Oph...', image: require('../assets/images/1.jpg') },
    { id: 2, title: 'Devananchar Re...', image: require('../assets/images/2.jpg') },
    { id: 3, title: 'Boyfriend', image: require('../assets/images/unnamed.jpg') },
    { id: 4, title: 'Trending Audio 4', image: require('../assets/images/c20a3b09-eb5a-4f81-bee4-c6456b964b5e.jpg') },
  ];

  return (
    <Shadow
      distance={12}
      startColor="rgba(0, 0, 0, 0.06)"
      endColor="rgba(0, 0, 0, 0)"
      offset={[0, 3]}
      style={styles.shadowContainer}
    >
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
              <Shadow
                distance={10}
                startColor="rgba(139, 92, 246, 0.12)"
                endColor="rgba(139, 92, 246, 0)"
                offset={[0, 4]}
                style={styles.cardShadow}
              >
                <View style={styles.card}>
                  <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                  <View style={styles.cardOverlay}>
                    <View style={styles.playButton}>
                      <Text style={styles.playIcon}>▶</Text>
                    </View>
                  </View>
                </View>
              </Shadow>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Shadow>
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
