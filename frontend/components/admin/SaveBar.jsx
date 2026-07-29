import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

/**
 * SaveBar Component
 * Bottom fixed bar showing unsaved changes with Save/Discard actions
 * 
 * @param {boolean} visible - Show/hide bar
 * @param {Function} onSave - Save button handler
 * @param {Function} onDiscard - Discard button handler
 * @param {boolean} saving - Saving state (shows loading)
 * @param {string} message - Custom message (optional)
 */
const SaveBar = ({ visible, onSave, onDiscard, saving = false, message }) => {
  const [slideAnim] = React.useState(new Animated.Value(100));

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 100,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  if (!visible && slideAnim._value === 100) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left: Icon + Message */}
        <View style={styles.leftContent}>
          <Icon name="alert-circle" size={20} color="#FF9800" />
          <Text style={styles.message}>
            {message || 'You have unsaved changes'}
          </Text>
        </View>

        {/* Right: Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.discardButton]}
            onPress={onDiscard}
            disabled={saving}
          >
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
            onPress={onSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Icon name="loading" size={16} color="#FFFFFF" />
                <Text style={styles.saveText}>Saving...</Text>
              </>
            ) : (
              <>
                <Icon name="content-save" size={16} color="#FFFFFF" />
                <Text style={styles.saveText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  discardButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  discardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#616161',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default SaveBar;
