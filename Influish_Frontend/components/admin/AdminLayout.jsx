import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { useRouter, useFocusEffect } from 'expo-router';
import AdminDrawer from './AdminDrawer';
import { getUnreadCount } from '../../services/adminNotification.service';

/**
 * Admin Layout Component
 * Provides consistent header with hamburger menu for all admin screens
 */
const AdminLayout = ({ children, title = 'Admin Panel' }) => {
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="menu"
              size={28}
              color={COLORS.white}
            />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <MaterialCommunityIcons
              name="shield-account"
              size={24}
              color={COLORS.white}
            />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(admin)/notifications')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="bell"
              size={24}
              color={COLORS.white}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Drawer */}
      <AdminDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 4,
    width: 48,
  },
  notificationButton: {
    padding: 4,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 8,
  },
  headerRight: {
    width: 48,
  },
  content: {
    flex: 1,
    backgroundColor: '#F7F3FF',
  },
});

export default AdminLayout;
