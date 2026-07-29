import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { formatNotificationDate, getTargetTypeColor } from '../../services/adminNotification.service';

/**
 * NotificationCard Component
 * Reusable card for displaying sent notification history
 * 
 * @param {Object} notification - Notification object
 * @param {Function} onPress - Optional press handler
 * @param {Function} onDelete - Optional delete handler
 */
const NotificationCard = ({ notification, onPress, onDelete }) => {
  const targetColor = getTargetTypeColor(notification.targetType);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="bell-ring" size={20} color="#FF9800" />
          <Text style={styles.notificationId}>{notification.id}</Text>
        </View>
        
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(notification.id)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="delete-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {notification.title}
      </Text>

      {/* Message Preview */}
      <Text style={styles.message} numberOfLines={2}>
        {notification.message}
      </Text>

      {/* Target & Date Row */}
      <View style={styles.footer}>
        <View style={styles.targetContainer}>
          <View style={[styles.targetDot, { backgroundColor: targetColor }]} />
          <Text style={styles.targetText}>{notification.targetName}</Text>
          
          {notification.recipientCount && (
            <View style={styles.recipientBadge}>
              <Icon name="account-multiple" size={12} color="#757575" />
              <Text style={styles.recipientCount}>{notification.recipientCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.dateContainer}>
          <Icon name="clock-outline" size={14} color="#757575" />
          <Text style={styles.dateText}>{formatNotificationDate(notification.sentAt)}</Text>
        </View>
      </View>

      {/* Status Badge */}
      {notification.status === 'sent' && (
        <View style={styles.statusBadge}>
          <Icon name="check-circle" size={12} color="#4CAF50" />
          <Text style={styles.statusText}>Sent</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
    lineHeight: 22,
  },
  message: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  targetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  targetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  recipientCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
});

export default NotificationCard;
