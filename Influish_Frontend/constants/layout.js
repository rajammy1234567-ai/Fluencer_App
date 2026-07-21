import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const LAYOUT = {
  window: {
    width,
    height,
  },
  spacing: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 28,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  }
};