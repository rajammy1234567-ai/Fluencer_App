/**
 * Fluencer — Premium Dark Glassmorphism
 * CRED · Linear · Stripe · Apple · Notion inspired
 * Deep charcoal · violet neon · pink accents · frosted glass
 */
export const COLORS = {
  // Violet primary system
  primary: '#7C3AED',
  primaryDark: '#6D28FF',
  primaryDeep: '#5B21B6',
  primaryLight: '#A855F7',
  primaryLighter: 'rgba(168, 85, 247, 0.16)',

  ink: '#FFFFFF',
  inkSoft: 'rgba(255,255,255,0.72)',

  // Pink accent
  accent: '#EC4899',
  accentDark: '#DB2777',
  accentLight: '#F472B6',
  accentSoft: 'rgba(236, 72, 153, 0.16)',

  gold: '#F5A623',
  goldDark: '#D4891A',
  goldSoft: 'rgba(245, 166, 35, 0.14)',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#A855F7',

  // Deep charcoal surfaces
  background: '#0B0B10',
  backgroundAlt: '#121218',
  surface: '#14141C',
  white: '#FFFFFF',
  cardBg: 'rgba(255,255,255,0.06)',
  glass: 'rgba(255,255,255,0.08)',
  glassStrong: 'rgba(255,255,255,0.12)',
  glassBorder: 'rgba(255,255,255,0.12)',
  darkBg: '#0B0B10',
  darkCard: '#14141C',

  black: '#0B0B10',
  text: 'rgba(255,255,255,0.92)',
  textDark: '#FFFFFF',
  textLight: 'rgba(255,255,255,0.62)',
  textMuted: 'rgba(255,255,255,0.42)',
  textGray: 'rgba(255,255,255,0.55)',
  textWhite: '#FFFFFF',
  darkGray: 'rgba(255,255,255,0.55)',
  mutedGray: 'rgba(255,255,255,0.42)',
  // String aliases (admin + older screens use COLORS.gray as a color, not a palette)
  lightGray: 'rgba(255,255,255,0.16)',

  border: 'rgba(255,255,255,0.10)',
  divider: 'rgba(255,255,255,0.08)',
  secondary: 'rgba(255,255,255,0.55)',

  // Glow / neon
  glow: 'rgba(124, 58, 237, 0.45)',
  glowSoft: 'rgba(124, 58, 237, 0.22)',
  neon: 'rgba(168, 85, 247, 0.55)',
  neonPink: 'rgba(236, 72, 153, 0.40)',

  gray: {
    50: 'rgba(255,255,255,0.04)',
    100: 'rgba(255,255,255,0.06)',
    200: 'rgba(255,255,255,0.10)',
    300: 'rgba(255,255,255,0.16)',
    400: 'rgba(255,255,255,0.42)',
    500: 'rgba(255,255,255,0.55)',
    600: 'rgba(255,255,255,0.72)',
  },

  blue: {
    50: 'rgba(168, 85, 247, 0.12)',
    100: 'rgba(168, 85, 247, 0.18)',
    200: 'rgba(168, 85, 247, 0.28)',
    300: '#A855F7',
    400: '#8B5CF6',
    500: '#7C3AED',
    600: '#6D28FF',
    700: '#5B21B6',
    800: '#0B0B10',
  },

  navy: {
    500: '#14141C',
    600: '#0B0B10',
  },

  gradient: {
    main: ['#6D28FF', '#7C3AED'],
    mainDeg: '135deg',
    light: ['rgba(109,40,255,0.25)', 'rgba(11,11,16,0.95)'],
    elegant: ['#6D28FF', '#A855F7'],
    sunset: ['#7C3AED', '#EC4899'],
    soft: ['#0B0B10', '#121218', '#1A1025'],
    hero: ['#0B0B10', '#1A1025', '#2D1B4E'],
    card: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)'],
    glass: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)'],
    dark: ['#0B0B10', '#121218', '#1A1025'],
    gold: ['#F5A623', '#D4891A'],
    neon: ['#6D28FF', '#A855F7', '#EC4899'],
  },
  gradientPrimary: ['#6D28FF', '#7C3AED'],
  gradientGold: ['#F5A623', '#D4891A'],
  gradientAccent: ['#7C3AED', '#EC4899'],

  // Shared component tokens
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    full: 999,
  },
  shadow: {
    soft: {
      shadowColor: '#6D28FF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    glow: {
      shadowColor: '#A855F7',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 12,
    },
  },
};
