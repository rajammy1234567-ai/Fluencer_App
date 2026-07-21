/**
 * MoreTabScreen
 * Tab 5: More options - displays drawer menu items as a screen
 * Provides access to secondary admin sections
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../../components/admin/AdminLayout';
import { COLORS } from '../../../constants/colors';
import { clearAdminAuth } from '../../../utils/adminStorage';
import { clearAuth } from '../../../utils/storage';

const MoreTabScreen = () => {
  const router = useRouter();

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
            const { clearAuth } = require('../../../utils/storage');
            await clearAuth();
            console.log('✅ Full logout: all auth data cleared');
            // Navigate to role selection, not admin login
            router.replace('/role-selection');
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'Main',
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          icon: 'view-dashboard',
          route: '/(admin)/(tabs)/dashboard',
          color: COLORS.primary,
        },
        {
          id: 'users',
          title: 'User Management',
          icon: 'account-group',
          route: '/(admin)/(tabs)/users',
          color: COLORS.primary,
        },
        {
          id: 'campaigns',
          title: 'Campaigns',
          icon: 'bullhorn',
          route: '/(admin)/(tabs)/campaigns',
          color: COLORS.primary,
        },
        {
          id: 'payments',
          title: 'Payments',
          icon: 'credit-card',
          route: '/(admin)/(tabs)/payments',
          color: COLORS.primary,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          id: 'withdrawals',
          title: 'Withdrawals',
          icon: 'bank-transfer',
          route: '/(admin)/withdrawals',
          color: '#10B981',
        },
        {
          id: 'disputes',
          title: 'Disputes',
          icon: 'alert-circle',
          route: '/(admin)/disputes',
          color: '#F59E0B',
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          id: 'settings',
          title: 'Settings',
          icon: 'cog',
          route: '/(admin)/settings',
          color: COLORS.gray,
        },
      ],
    },
  ];

  const handleNavigate = (route) => {
    if (route) {
      router.push(route);
    }
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleNavigate(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={item.color}
        />
      </View>
      <Text style={styles.menuItemText}>{item.title}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={COLORS.gray}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AdminLayout title="More">
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {menuSections.map((section, index) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map(renderMenuItem)}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.logoutIconContainer}>
                <MaterialCommunityIcons
                  name="logout"
                  size={24}
                  color="#DC2626"
                />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Fluencer Admin Panel</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </AdminLayout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F3FF',
  },
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8FF',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  logoutSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  appInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default MoreTabScreen;
