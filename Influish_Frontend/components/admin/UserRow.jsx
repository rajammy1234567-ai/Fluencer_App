/**
 * UserRow Component
 * Reusable row component for user lists (Influencer/Brand)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import StatusBadge from './StatusBadge';

const UserRow = ({ 
  icon, 
  iconColor, 
  title, 
  subtitle, 
  stat, 
  statLabel,
  status, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor || COLORS.gray[100] }]}>
          <MaterialCommunityIcons 
            name={icon || 'account'} 
            size={24} 
            color={COLORS.primary} 
          />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        {stat !== undefined && (
          <Text style={styles.stat}>
            {statLabel}: <Text style={styles.statValue}>{stat}</Text>
          </Text>
        )}
      </View>
      
      <View style={styles.rightSection}>
        <StatusBadge status={status} />
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={20} 
          color={COLORS.gray} 
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 2,
  },
  stat: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statValue: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  chevron: {
    marginTop: 4,
  },
});

export default UserRow;
