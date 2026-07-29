/**
 * EmptyState Component
 * Displays when a list has no data
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const EmptyState = ({ icon, message }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name={icon || 'inbox'} 
        size={48} 
        color={COLORS.gray[500]} 
      />
      <Text style={styles.message}>{message || 'No data available'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E9D5FF',
    borderStyle: 'dashed',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default EmptyState;
