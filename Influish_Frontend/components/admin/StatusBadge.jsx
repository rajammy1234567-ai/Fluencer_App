/**
 * StatusBadge Component
 * Displays account status badge (Active/Blocked)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const StatusBadge = ({ status }) => {
  const isActive = status === 'Active';
  
  return (
    <View style={[
      styles.badge,
      isActive ? styles.badgeActive : styles.badgeBlocked
    ]}>
      <View style={[
        styles.dot,
        isActive ? styles.dotActive : styles.dotBlocked
      ]} />
      <Text style={[
        styles.text,
        isActive ? styles.textActive : styles.textBlocked
      ]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
  },
  badgeBlocked: {
    backgroundColor: '#FEE2E2',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: '#16A34A',
  },
  dotBlocked: {
    backgroundColor: '#DC2626',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textActive: {
    color: '#16A34A',
  },
  textBlocked: {
    color: '#DC2626',
  },
});

export default StatusBadge;
