import { getApiUrl, API_CONFIG } from '../constants/api';
import { storage } from './storage';

// Generic API call handler with error handling & fast timeout protection
export const apiCall = async (endpoint, options = {}, timeoutMs = 15000) => {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const url = getApiUrl(endpoint);
    console.log('🌐 API Call:', url);
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
      signal: controller ? controller.signal : undefined,
    };

    console.log('📤 Request:', { method: fetchOptions.method || 'GET', body: options.body?.substring(0, 100) });

    const response = await fetch(url, fetchOptions);
    if (timeoutId) clearTimeout(timeoutId);
    console.log('📥 Response status:', response.status);

    const data = await response.json();
    console.log('✅ Response data:', { success: data.success, hasToken: !!data.token });

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Request failed',
        data,
      };
    }

    return { success: true, data };
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error('❌ API call error:', {
      message: error.message || error.name,
      status: error.status,
      name: error.name,
      endpoint,
    });
    return {
      success: false,
      error: error.name === 'AbortError' ? 'Request timed out' : (error.message || 'Network error'),
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
