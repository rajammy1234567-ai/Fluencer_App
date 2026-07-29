// Admin storage utility
// Uses AsyncStorage for persistent admin authentication
// TODO: Replace with expo-secure-store for production

import AsyncStorage from '@react-native-async-storage/async-storage';

export const adminStorage = {
  // Save admin authentication data
  async saveAdminAuth(token, id, role) {
    try {
      await AsyncStorage.multiSet([
        ['adminToken', String(token)],
        ['adminId', String(id)],
        ['adminRole', String(role)],
        ['adminEmail', 'admin@fluencer.app'], // For compatibility with guard
        ['adminName', 'Admin User'],
      ]);
      console.log('✅ Admin auth saved:', { id, role });
      return true;
    } catch (error) {
      console.error('❌ Error saving admin auth:', error);
      return false;
    }
  },

  // Get admin authentication token
  async getAdminToken() {
    try {
      return await AsyncStorage.getItem('adminToken');
    } catch (error) {
      console.error('❌ Error getting admin token:', error);
      return null;
    }
  },

  // Get admin ID
  async getAdminId() {
    try {
      return await AsyncStorage.getItem('adminId');
    } catch (error) {
      console.error('❌ Error getting admin ID:', error);
      return null;
    }
  },

  // Get admin role
  async getAdminRole() {
    try {
      return await AsyncStorage.getItem('adminRole');
    } catch (error) {
      console.error('❌ Error getting admin role:', error);
      return null;
    }
  },

  // Check if admin is authenticated
  async isAdminAuthenticated() {
    const token = await this.getAdminToken();
    return !!token;
  },

  // Clear admin authentication data
  // Full credential & session cleanup on logout
  async clearAdminAuth() {
    try {
      await AsyncStorage.multiRemove([
        'adminToken',
        'adminId',
        'adminRole',
        'adminEmail',
        'adminName',
        'adminPassword', // Clear password if stored
        'adminSession',  // Clear any session flags
      ]);
      console.log('✅ Admin auth cleared (including credentials)');
      return true;
    } catch (error) {
      console.error('❌ Error clearing admin auth:', error);
      return false;
    }
  },

  // Get admin auth header for API requests
  async getAdminAuthHeader() {
    const token = await this.getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Export individual functions for convenience
export const saveAdminAuth = adminStorage.saveAdminAuth.bind(adminStorage);
export const getAdminToken = adminStorage.getAdminToken.bind(adminStorage);
export const getAdminId = adminStorage.getAdminId.bind(adminStorage);
export const getAdminRole = adminStorage.getAdminRole.bind(adminStorage);
export const isAdminAuthenticated = adminStorage.isAdminAuthenticated.bind(adminStorage);
export const clearAdminAuth = adminStorage.clearAdminAuth.bind(adminStorage);
export const getAdminAuthHeader = adminStorage.getAdminAuthHeader.bind(adminStorage);
