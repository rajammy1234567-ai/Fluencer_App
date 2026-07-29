/**
 * Fluencer signature UI — polished, even dark-glass layout
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

const { width } = Dimensions.get('window');
const PAD = LAYOUT.screenPad;
const R = LAYOUT.borderRadius.lg;
const CARD_W = width - PAD * 2;

const NICHES = [
  { id: 'reels', label: 'Reels', emoji: '🎬' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'beauty', label: 'Beauty', emoji: '✨' },
  { id: 'food', label: 'Food', emoji: '🍛' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'comedy', label: 'Comedy', emoji: '😂' },
  { id: 'edu', label: 'Edu', emoji: '📚' },
];

const PATH = [
  { n: '01', t: 'Swipe', d: 'Find brand', icon: 'swap-horizontal' },
  { n: '02', t: 'Apply', d: '1-tap pitch', icon: 'send' },
  { n: '03', t: 'Create', d: 'Shoot reel', icon: 'videocam' },
  { n: '04', t: 'Cash', d: 'Wallet ₹', icon: 'wallet' },
];

/** Compact greeting — even header rhythm */
export function FluencerGreeting({ name = 'Creator' }) {
  const h = new Date().getHours();
  let line = 'Good evening';
  if (h < 12) line = 'Good morning';
  else if (h < 17) line = 'Good afternoon';

  return (
    <View style={styles.greetWrap}>
      <View style={styles.indiaBadge}>
        <Text style={styles.indiaBadgeText}>🇮🇳 India’s Collab OS</Text>
      </View>
      <Text style={styles.greetLine}>{line}</Text>
      <Text style={styles.greetName} numberOfLines={1}>{name}</Text>
    </View>
  );
}

/** Even 4-step path card */
export function CollabPath() {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Your collab path</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/campaigns')} hitSlop={8}>
          <Text style={styles.cardCta}>Start →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.pathRow}>
        {PATH.map((p, i) => (
          <React.Fragment key={p.n}>
            <View style={styles.pathStep}>
              <View style={styles.pathIconWrap}>
                <Ionicons name={p.icon} size={16} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.pathN}>{p.n}</Text>
              <Text style={styles.pathT}>{p.t}</Text>
              <Text style={styles.pathD} numberOfLines={1}>{p.d}</Text>
            </View>
            {i < PATH.length - 1 && <View style={styles.pathLine} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

/** Even niche chips */
export function NicheRail({ onSelect }) {
  const router = useRouter();
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionLabel}>Your niche radar</Text>
      <Text style={styles.sectionHint}>Pick what you create — brands match faster</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.nicheScroll}
      >
        {NICHES.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={styles.nicheChip}
            activeOpacity={0.85}
            onPress={() => {
              onSelect?.(n.id);
              router.push('/(tabs)/campaigns');
            }}
          >
            <Text style={styles.nicheEmoji}>{n.emoji}</Text>
            <Text style={styles.nicheLabel}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

/** Hero match card — fixed height, even padding */
export function MatchPulse() {
  const pulse = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push('/(tabs)/campaigns')}
      style={styles.pulseOuter}
    >
      <LinearGradient
        colors={['#5B21B6', '#7C3AED', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.pulseGrad}
      >
        <View style={styles.pulseLeft}>
          <Text style={styles.pulseEyebrow}>LIVE MATCH</Text>
          <Text style={styles.pulseTitle}>Brands looking for{'\n'}creators like you</Text>
          <View style={styles.pulseCta}>
            <Text style={styles.pulseCtaText}>Open collab deck</Text>
            <Ionicons name="arrow-forward" size={14} color="#5B21B6" />
          </View>
        </View>
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }] }]}>
          <View style={styles.pulseCore}>
            <Text style={styles.pulseScore}>₹</Text>
            <Text style={styles.pulseScoreSub}>earn</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/** Even shortcut dock */
export function CreatorDock() {
  const router = useRouter();
  return (
    <View style={styles.dock}>
      <TouchableOpacity
        style={styles.dockMain}
        onPress={() => router.push('/(tabs)/campaigns')}
        activeOpacity={0.9}
      >
        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.dockMainGrad}>
          <MaterialCommunityIcons name="cards-playing-outline" size={22} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.dockMainTitle}>Collab Deck</Text>
            <Text style={styles.dockMainSub}>Swipe · apply fast</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <View style={styles.dockSide}>
        <TouchableOpacity style={styles.dockMini} onPress={() => router.push('/wallet')}>
          <Ionicons name="wallet-outline" size={18} color={COLORS.primaryLight} />
          <Text style={styles.dockMiniT}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dockMini} onPress={() => router.push('/(tabs)/chat')}>
          <Ionicons name="chatbubbles-outline" size={18} color={COLORS.primaryLight} />
          <Text style={styles.dockMiniT}>Chats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Even promise strip */
export function FluencerPromise() {
  const items = [
    { icon: 'shield-checkmark', t: 'Escrow-safe' },
    { icon: 'flash', t: '1-tap apply' },
    { icon: 'people', t: 'Brand chats' },
  ];
  return (
    <View style={styles.promise}>
      {items.map((it) => (
        <View key={it.t} style={styles.promiseItem}>
          <Ionicons name={it.icon} size={14} color={COLORS.primaryLight} />
          <Text style={styles.promiseText}>{it.t}</Text>
        </View>
      ))}
    </View>
  );
}

const glassCard = {
  backgroundColor: LAYOUT.glass.bg,
  borderRadius: R,
  borderWidth: 1,
  borderColor: LAYOUT.glass.border,
};

const styles = StyleSheet.create({
  greetWrap: {
    paddingRight: 4,
  },
  indiaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 8,
  },
  indiaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F5A623',
  },
  greetLine: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },
  greetName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginTop: 2,
  },

  card: {
    ...glassCard,
    marginHorizontal: PAD,
    marginTop: LAYOUT.blockGap,
    padding: LAYOUT.cardPad,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardCta: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pathStep: {
    flex: 1,
    alignItems: 'center',
  },
  pathIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  pathN: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 1,
  },
  pathT: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pathD: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 2,
  },
  pathLine: {
    width: 10,
    height: 2,
    backgroundColor: 'rgba(168, 85, 247, 0.35)',
    marginBottom: 28,
  },

  sectionBlock: {
    marginTop: LAYOUT.blockGap,
    marginHorizontal: PAD,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    marginBottom: 10,
  },
  nicheScroll: {
    gap: 8,
    paddingRight: 4,
  },
  nicheChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LAYOUT.glass.bg,
    borderWidth: 1,
    borderColor: LAYOUT.glass.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
  },
  nicheEmoji: { fontSize: 14 },
  nicheLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  pulseOuter: {
    marginHorizontal: PAD,
    marginTop: LAYOUT.blockGap,
    borderRadius: R,
    overflow: 'hidden',
  },
  pulseGrad: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 120,
  },
  pulseLeft: { flex: 1, paddingRight: 10 },
  pulseEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  pulseTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginTop: 6,
    marginBottom: 10,
  },
  pulseCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },
  pulseCtaText: {
    fontWeight: '800',
    fontSize: 12,
    color: '#5B21B6',
  },
  pulseRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseScore: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  pulseScoreSub: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.45)',
    marginTop: -2,
  },

  dock: {
    flexDirection: 'row',
    marginHorizontal: PAD,
    marginTop: LAYOUT.blockGap,
    gap: 10,
    height: 88,
  },
  dockMain: {
    flex: 1.45,
    borderRadius: R,
    overflow: 'hidden',
  },
  dockMainGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  dockMainTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  dockMainSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 2,
  },
  dockSide: {
    flex: 0.9,
    gap: 8,
  },
  dockMini: {
    flex: 1,
    backgroundColor: LAYOUT.glass.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LAYOUT.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dockMiniT: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  promise: {
    marginHorizontal: PAD,
    marginTop: LAYOUT.blockGap,
    flexDirection: 'row',
    gap: 8,
  },
  promiseItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.22)',
  },
  promiseText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
});

export default {
  FluencerGreeting,
  CollabPath,
  NicheRail,
  MatchPulse,
  CreatorDock,
  FluencerPromise,
};
