/**
 * NotificationSection Component
 * Displays recent important notifications on Influencer Home
 * Shows latest 5 notifications with unread indicator
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import {
  getRecentNotifications,
  markNotificationAsRead,
  getNotificationStyle,
  formatNotificationTime,
} from '../services/influencerNotification.service';

const NotificationSection = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const result = await getRecentNotifications();
    
    if (result.success) {
      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
    }
    
    setLoading(false);
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }

    // Navigate based on notification type and reference
    switch (notification.type) {
      case 'wallet':
        router.push('/(tabs)/profile'); // Navigate to profile/wallet
        break;
      case 'campaign':
        if (notification.referenceId) {
          router.push(`/campaign-detail?id=${notification.referenceId}`);
        } else {
          router.push('/(tabs)/campaigns');
        }
        break;
      case 'dispute':
        router.push('/(tabs)/profile'); // Navigate to profile (disputes section)
        break;
      case 'account':
        router.push('/(tabs)/profile');
        break;
      default:
        break;
    }
  };

  const handleViewAll = () => {
    // Navigate to full notifications screen
    // Note: Full notifications screen to be created
    // For now, just reload notifications
    loadNotifications();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="bell-off-outline"
          size={40}
          color={COLORS.gray[300]}
        />
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="bell"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <View style={styles.notificationList}>
        {notifications.map((notification) => {
          const style = getNotificationStyle(notification.type);
          
          return (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.isRead && styles.unreadCard,
              ]}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: style.bgColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={style.icon}
                    size={18}
                    color={style.color}
                  />
                </View>

                <View style={styles.textContent}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !notification.isRead && styles.unreadTitle,
                    ]}
                    numberOfLines={1}
                  >
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatNotificationTime(notification.createdAt)}
                  </Text>
                </View>

                {!notification.isRead && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default NotificationSection;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray[400],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  notificationList: {
    gap: 8,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F8FBFF',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.gray[500],
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: COLORS.gray[400],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
});
