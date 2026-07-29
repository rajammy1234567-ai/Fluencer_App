/**
 * AmountBadge Component
 * Displays formatted currency amount with icon
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const AmountBadge = ({ amount, size = 'medium', color = COLORS.primary, showIcon = true }) => {
  const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;
  
  const sizeStyles = {
    small: {
      fontSize: 14,
      iconSize: 16,
      padding: 6,
    },
    medium: {
      fontSize: 18,
      iconSize: 20,
      padding: 10,
    },
    large: {
      fontSize: 24,
      iconSize: 28,
      padding: 12,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, { padding: currentSize.padding }]}>
      {showIcon && (
        <MaterialCommunityIcons
          name="currency-inr"
          size={currentSize.iconSize}
          color={color}
          style={styles.icon}
        />
      )}
      <Text style={[styles.amount, { fontSize: currentSize.fontSize, color }]}>
        {formattedAmount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blue[50],
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  amount: {
    fontWeight: 'bold',
  },
});

export default AmountBadge;
