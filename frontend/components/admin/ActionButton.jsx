/**
 * ActionButton Component
 * Reusable action button for admin operations
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';

const ActionButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false 
}) => {
  const isDestructive = variant === 'destructive';
  const isSecondary = variant === 'secondary';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDestructive && styles.buttonDestructive,
        isSecondary && styles.buttonSecondary,
        (disabled || loading) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={isSecondary ? COLORS.primary : COLORS.white} 
        />
      ) : (
        <Text style={[
          styles.buttonText,
          isDestructive && styles.buttonTextDestructive,
          isSecondary && styles.buttonTextSecondary,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDestructive: {
    backgroundColor: '#DC2626',
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonTextDestructive: {
    color: COLORS.white,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
});

export default ActionButton;
