/**
 * Error State Component
 * 
 * Displays error message when data fetch or action fails.
 * Provides retry option for better UX.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ErrorState = ({
  message = 'Something went wrong',
  description = 'Unable to load data. Please try again.',
  icon = 'alert-circle-outline',
  onRetry,
  retryText = 'Try Again',
  showRetry = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Error Icon */}
      <View style={styles.iconContainer}>
        <Icon name={icon} size={64} color="#F44336" />
      </View>

      {/* Error Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Description */}
      {description && <Text style={styles.description}>{description}</Text>}

      {/* Retry Button */}
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Icon name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ErrorState;
