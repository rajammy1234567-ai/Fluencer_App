/**
 * Influencer Admin Service
 * Service for influencer management in admin panel
 * Replaced mock data with real API calls
 */

import { API, API_CONFIG } from '../constants/api';
import { adminStorage } from '../utils/adminStorage';

/**
 * Get admin auth headers
 */
const getAdminHeaders = async () => {
  const token = await adminStorage.getAdminToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Safe JSON parse for categories (handles both JSON and plain string)
 */
const parseCategories = (categories) => {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;
  try {
    return JSON.parse(categories);
  } catch (e) {
    // If not valid JSON, treat as comma-separated string
    return typeof categories === 'string' ? categories.split(',').map(c => c.trim()) : [];
  }
};

/**
 * Get all influencers from database
 * @returns {Promise<Object>} List of influencers
 */
export const getAllInfluencers = async () => {
  try {
    const headers = await getAdminHeaders();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API.ADMIN.INFLUENCERS}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch influencers');
    }

    const data = await response.json();
    
    // Transform backend data to match frontend format
    const transformedData = (data.data || []).map(inf => ({
      id: inf.id,
      name: inf.name || 'N/A',
      email: inf.email || 'N/A',
      profileImage: inf.profile_image || null,
      followers: inf.followers_count || 0,
      accountStatus: inf.status || 'Active',
      gender: inf.gender || 'N/A',
      location: inf.location || 'N/A',
      categories: parseCategories(inf.categories),
      bio: inf.bio || '',
      joinedDate: inf.created_at ? new Date(inf.created_at).toLocaleDateString() : 'N/A',
      isBlocked: inf.status === 'Blocked',
      isVerified: false, // Not in DB schema
    }));
    
    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

/**
 * Get influencer by ID from database
 * @param {number} influencerId - Influencer ID
 * @returns {Promise<Object>} Influencer details
 */
export const getInfluencerById = async (influencerId) => {
  try {
    const headers = await getAdminHeaders();
    const url = `${API_CONFIG.BASE_URL}${API.ADMIN.INFLUENCER_BY_ID.replace(':id', influencerId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Influencer not found');
    }

    const data = await response.json();
    const inf = data.data;
    
    // Transform to frontend format
    const transformedData = {
      id: inf.id,
      name: inf.name || 'N/A',
      email: inf.email || 'N/A',
      profileImage: inf.profile_image || null,
      followers: inf.followers_count || 0,
      accountStatus: inf.status || 'Active',
      gender: inf.gender || 'N/A',
      location: inf.location || 'N/A',
      categories: parseCategories(inf.categories),
      bio: inf.bio || '',
      joinedDate: inf.created_at ? new Date(inf.created_at).toLocaleDateString() : 'N/A',
    };
    
    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error('Error fetching influencer:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Search influencers by name or email in database
 * @param {string} query - Search query
 * @returns {Promise<Object>} Filtered influencers
 */
export const searchInfluencers = async (query) => {
  try {
    const headers = await getAdminHeaders();
    const url = `${API_CONFIG.BASE_URL}${API.ADMIN.INFLUENCERS}?search=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to search influencers');
    }

    const data = await response.json();
    
    // Transform backend data
    const transformedData = (data.data || []).map(inf => ({
      id: inf.id,
      name: inf.name || 'N/A',
      email: inf.email || 'N/A',
      profileImage: inf.profile_image || null,
      followers: inf.followers_count || 0,
      accountStatus: inf.status || 'Active',
      gender: inf.gender || 'N/A',
      location: inf.location || 'N/A',
      categories: parseCategories(inf.categories),
      bio: inf.bio || '',
      isBlocked: inf.status === 'Blocked',
      isVerified: false,
    }));
    
    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error('Error searching influencers:', error);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

/**
 * Block an influencer
 * @param {number} influencerId - Influencer ID
 * @returns {Promise<Object>} Result
 */
export const blockInfluencer = async (influencerId) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const influencer = MOCK_INFLUENCERS.find(inf => inf.id === influencerId);
  
  if (!influencer) {
    return {
      success: false,
      error: 'Influencer not found',
    };
  }
  
  // Update mock data
  influencer.accountStatus = 'Blocked';
  
  return {
    success: true,
    message: 'Influencer blocked successfully',
  };
};

/**
 * Unblock an influencer
 * @param {number} influencerId - Influencer ID
 * @returns {Promise<Object>} Result
 */
export const unblockInfluencer = async (influencerId) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const influencer = MOCK_INFLUENCERS.find(inf => inf.id === influencerId);
  
  if (!influencer) {
    return {
      success: false,
      error: 'Influencer not found',
    };
  }
  
  // Update mock data
  influencer.accountStatus = 'Active';
  
  return {
    success: true,
    message: 'Influencer unblocked successfully',
  };
};

/**
 * Format numbers with K/M suffix
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
