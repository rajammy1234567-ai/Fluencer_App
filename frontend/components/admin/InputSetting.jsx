import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

/**
 * InputSetting Component
 * Reusable input field for numeric or text settings
 * 
 * @param {string} label - Setting label
 * @param {string} description - Setting description (optional)
 * @param {string|number} value - Current value
 * @param {Function} onChangeText - Change handler
 * @param {string} icon - Icon name (optional)
 * @param {string} placeholder - Placeholder text (optional)
 * @param {string} keyboardType - Keyboard type (optional)
 * @param {string} suffix - Suffix text (e.g., '%', '₹') (optional)
 * @param {boolean} disabled - Disabled state (optional)
 * @param {string} error - Error message (optional)
 * @param {number} maxLength - Max input length (optional)
 */
const InputSetting = ({
  label,
  description,
  value,
  onChangeText,
  icon,
  placeholder,
  keyboardType = 'default',
  suffix,
  disabled = false,
  error,
  maxLength,
}) => {
  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.headerRow}>
        {icon && (
          <View style={styles.iconContainer}>
            <Icon name={icon} size={24} color="#2196F3" />
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

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            suffix && styles.inputWithSuffix,
            error && styles.inputError,
            disabled && styles.inputDisabled,
          ]}
          value={value?.toString() || ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#BDBDBD"
          keyboardType={keyboardType}
          editable={!disabled}
          maxLength={maxLength}
        />
        {suffix && (
          <View style={styles.suffixContainer}>
            <Text style={styles.suffixText}>{suffix}</Text>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={14} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputWithSuffix: {
    paddingRight: 60,
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  inputDisabled: {
    backgroundColor: '#EEEEEE',
    color: '#9E9E9E',
  },
  suffixContainer: {
    position: 'absolute',
    right: 16,
    height: 48,
    justifyContent: 'center',
  },
  suffixText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#757575',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    flex: 1,
  },
});

export default InputSetting;
