/**
 * AdminDrawer Component
 * Side navigation drawer for admin panel with smooth slide animation from left
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { clearAdminAuth } from '../../utils/adminStorage';

const AdminDrawer = ({ visible, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const slideAnim = useRef(new Animated.Value(-280)).current; // Start from left (-280px)

  // Animate drawer slide in/out
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide to visible position
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -280, // Slide back to left (hidden)
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Handle close with animation
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -280,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose(); // Call onClose after animation completes
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Full auth reset on logout to prevent cross-role conflicts
            await clearAdminAuth();
            // Also clear regular user auth to prevent role confusion
            const { clearAuth } = require('../../utils/storage');
            await clearAuth();
            console.log('✅ Full logout: all auth data cleared');
            handleClose();
            // Navigate to role selection, not admin login
            router.replace('/role-selection');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'view-dashboard',
      route: '/(admin)/(tabs)/dashboard',
    },
    {
      id: 'users',
      title: 'Users',
      icon: 'account-group',
      route: '/(admin)/(tabs)/users',
    },
    {
      id: 'campaigns',
      title: 'Campaigns',
      icon: 'bullhorn',
      route: '/(admin)/(tabs)/campaigns',
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: 'credit-card',
      route: '/(admin)/(tabs)/payments',
    },
    {
      id: 'withdrawals',
      title: 'Withdrawals',
      icon: 'bank-transfer',
      route: '/(admin)/withdrawals',
    },
    {
      id: 'disputes',
      title: 'Disputes',
      icon: 'alert-circle',
      route: '/(admin)/disputes',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'bell',
      route: '/(admin)/notifications',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'cog',
      route: '/(admin)/settings',
    },
  ];

  const handleNavigate = (route) => {
    if (route) {
      handleClose();
      setTimeout(() => {
        router.push(route);
      }, 250); // Wait for animation to complete
    }
  };

  const isActive = (route) => {
    return pathname === route;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons
                name="shield-account"
                size={32}
                color={COLORS.primary}
              />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Admin Panel</Text>
                <Text style={styles.headerSubtitle}>Fluencer</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const active = isActive(item.route);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    active && styles.menuItemActive,
                  ]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={active ? COLORS.primary : COLORS.gray}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      active && styles.menuItemTextActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {active && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}

            {/* Logout */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="logout"
                size={22}
                color="#DC2626"
              />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Fluencer Admin v1.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  closeButton: {
    padding: 4,
  },
  menu: {
    flex: 1,
    paddingVertical: 8,
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  menuHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    position: 'relative',
  },
  menuItemIndent: {
    paddingLeft: 40,
  },
  menuItemActive: {
    backgroundColor: COLORS.blue[50],
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primaryDark,
    marginLeft: 16,
    flex: 1,
  },
  menuItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#DC2626',
    marginLeft: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.gray,
  },
});

export default AdminDrawer;
