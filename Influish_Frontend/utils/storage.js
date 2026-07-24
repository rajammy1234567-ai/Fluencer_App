// Persistent auth storage using AsyncStorage
// Stores authentication tokens and user data for session persistence
// TODO: Replace with expo-secure-store for production (more secure)

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Persisting auth session on login
  async saveAuth(token, id, role) {
    try {
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['userId', String(id)],
        ['userRole', role],
      ]);
      console.log('✅ Auth session saved:', { id, role });
      return true;
    } catch (error) {
      console.error('❌ Error saving auth:', error);
      return false;
    }
  },

  // Get authentication token
  async getToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  },

  // Get user ID
  async getUserId() {
    try {
      const id = await AsyncStorage.getItem('userId');
      return id ? String(id).trim() : null;
    } catch (error) {
      console.error('❌ Error getting user ID:', error);
      return null;
    }
  },

  // Get user role
  async getRole() {
    try {
      return await AsyncStorage.getItem('userRole');
    } catch (error) {
      console.error('❌ Error getting role:', error);
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },

  // Clear all authentication data (on logout)
  // Full credential & session cleanup on logout
  async clearAuth() {
    try {
      await AsyncStorage.multiRemove([
        'authToken',
        'userId',
        'userRole',
        'userEmail',      // Clear email if stored
        'userPassword',   // Clear password if stored
        'userSession',    // Clear any session flags
        'cachedProfile',  // Clear cached profile data
      ]);
      console.log('✅ Auth session cleared (including credentials)');
      return true;
    } catch (error) {
      console.error('❌ Error clearing auth:', error);
      return false;
    }
  },

  async getAuthHeader() {
    try {
      const token = await this.getToken();
      if (!token) return {};
      return { Authorization: `Bearer ${token}` };
    } catch (error) {
      console.error('❌ Error getting auth header:', error);
      return {};
    }
  },
};

// Export individual functions for convenience
export const saveAuth = storage.saveAuth.bind(storage);
export const getToken = storage.getToken.bind(storage);
export const getUserId = storage.getUserId.bind(storage);
export const getRole = storage.getRole.bind(storage);
export const isAuthenticated = storage.isAuthenticated.bind(storage);
export const clearAuth = storage.clearAuth.bind(storage);
export const getAuthHeader = storage.getAuthHeader.bind(storage);

export default storage;
