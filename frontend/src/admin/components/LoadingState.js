/**
 * Loading State Component
 * 
 * Consistent loading indicator for admin screens.
 * Shows while fetching data or processing actions.
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingState = ({
  message = 'Loading...',
  size = 'large',
  color = '#2196F3',
  showMessage = true,
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {showMessage && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});

export default LoadingState;
