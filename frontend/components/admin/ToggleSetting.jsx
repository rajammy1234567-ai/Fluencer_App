import React from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * ToggleSetting Component
 * Reusable toggle switch for boolean settings
 * 
 * @param {string} label - Setting label
 * @param {string} description - Setting description (optional)
 * @param {boolean} value - Current value
 * @param {Function} onValueChange - Change handler
 * @param {string} icon - Icon name (optional)
 * @param {boolean} disabled - Disabled state (optional)
 * @param {boolean} warning - Show warning styling (optional)
 */
const ToggleSetting = ({
  label,
  description,
  value,
  onValueChange,
  icon,
  disabled = false,
  warning = false,
}) => {
  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.leftContent}>
        {icon && (
          <View style={[styles.iconContainer, warning && styles.iconWarning]}>
            <Icon
              name={icon}
              size={24}
              color={warning ? '#F44336' : '#2196F3'}
            />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>
            {label}
          </Text>
          {description && (
            <Text style={[styles.description, disabled && styles.descriptionDisabled]}>
              {description}
            </Text>
          )}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: '#E0E0E0',
          true: warning ? '#FFCDD2' : '#BBDEFB',
        }}
        thumbColor={
          value
            ? warning
              ? '#F44336'
              : '#2196F3'
            : Platform.OS === 'android'
            ? '#F5F5F5'
            : '#FFFFFF'
        }
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  containerDisabled: {
    opacity: 0.5,
    backgroundColor: '#FAFAFA',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWarning: {
    backgroundColor: '#FFEBEE',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  labelDisabled: {
    color: '#9E9E9E',
  },
  description: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
  },
  descriptionDisabled: {
    color: '#BDBDBD',
  },
});

export default ToggleSetting;
