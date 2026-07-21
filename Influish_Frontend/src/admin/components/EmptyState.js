/**
 * Empty State Component
 * 
 * Displays when lists or data are empty.
 * Provides clear messaging and optional action.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EmptyState = ({
  icon = 'folder-open-outline',
  message = 'No data found',
  description,
  actionText,
  onAction,
  iconColor = '#BDBDBD',
}) => {
  return (
    <View style={styles.container}>
      {/* Empty Icon */}
      <View style={styles.iconContainer}>
        <Icon name={icon} size={64} color={iconColor} />
      </View>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Description */}
      {description && <Text style={styles.description}>{description}</Text>}

      {/* Action Button */}
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
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
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#EEEEEE',
    borderStyle: 'dashed',
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
  actionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EmptyState;
