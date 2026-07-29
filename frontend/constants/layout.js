import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/** Shared layout tokens — keep UI even across screens */
export const LAYOUT = {
  window: { width, height },
  screenPad: 20,
  cardPad: 16,
  sectionGap: 14,
  blockGap: 12,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
  },
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    full: 9999,
  },
  glass: {
    bg: 'rgba(255,255,255,0.06)',
    bgStrong: 'rgba(255,255,255,0.09)',
    border: 'rgba(255,255,255,0.12)',
    borderStrong: 'rgba(168, 85, 247, 0.28)',
  },
  type: {
    h1: 26,
    h2: 18,
    h3: 16,
    body: 14,
    caption: 12,
    micro: 11,
  },
};
