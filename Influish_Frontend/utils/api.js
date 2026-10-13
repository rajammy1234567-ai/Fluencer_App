import { getApiUrl, API_CONFIG } from '../constants/api';
import { storage } from './storage';
import { fetchWithTimeoutAndRetry } from './apiClient';

// Generic API call handler with cold-start timeout & retry protection
export const apiCall = async (endpoint, options = {}, timeoutMs = 35000) => {
  try {
    const url = getApiUrl(endpoint);
    const authHeader = await storage.getAuthHeader();

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
    };

    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetchWithTimeoutAndRetry(url, fetchOptions, {
      timeoutMs,
      retries: 2,
      delayMs: 1500,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Request failed',
        data,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ API call error:', {
      message: error.message || error.name,
      status: error.status,
      name: error.name,
      endpoint,
    });
    return {
      success: false,
      error: error.message || 'Network error',
      status: error.status,
      data: error.data,
    };
  }
};

// Auth API calls
export const authApi = {
  // Request OTP for signup
  async signupRequest(email, role) {
    return apiCall(API_CONFIG.endpoints.signupRequest, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  // Verify OTP and create account
  async verifyOTP(email, otp, password) {
    const result = await apiCall(API_CONFIG.endpoints.verifyOTP, {
      method: 'POST',
      body: JSON.stringify({ email, otp, password }),
    });

    // Save auth data if successful
    if (result.success && result.data.token) {
      await storage.saveAuth(
        result.data.token,
        result.data.userId,
        result.data.role
      );
    }

    return result;
  },

  // Login
  async login(email, password) {
    console.log('Login attempt:', { email, passwordLength: password?.length });
    const result = await apiCall(API_CONFIG.endpoints.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log('Login result:', { success: result.success, error: result.error });

    // Save auth data if successful
    if (result.success && result.data.token) {
      await storage.saveAuth(
        result.data.token,
        result.data.userId,
        result.data.role
      );
    }

    return result;
  },

  // Get current user
  async getCurrentUser() {
    return apiCall(API_CONFIG.endpoints.getCurrentUser, {
      method: 'GET',
    });
  },

  // Logout
  async logout() {
    await storage.clearAuth();
    return { success: true };
  },
};

// Influencer API calls
export const influencerApi = {
  // Save profile
  async saveProfile(profileData) {
    return apiCall(API_CONFIG.endpoints.saveProfile, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Get profile
  async getProfile() {
    return apiCall(API_CONFIG.endpoints.getProfile, {
      method: 'GET',
    });
  },

  // Check if profile exists
  async checkProfile() {
    return apiCall(API_CONFIG.endpoints.checkProfile, {
      method: 'GET',
    });
  },
};

// Helper to handle API errors in UI
export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  if (typeof error === 'string') {
    return error;
  }
  return error?.message || error?.error || defaultMessage;
};
