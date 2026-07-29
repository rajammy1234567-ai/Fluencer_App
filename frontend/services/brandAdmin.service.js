/**
 * Brand Admin Service
 * Service for brand management in admin panel
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
 * Get all brands from database
 * @returns {Promise<Object>} List of brands
 */
export const getAllBrands = async () => {
  try {
    const headers = await getAdminHeaders();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API.ADMIN.BRANDS}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch brands');
    }

    const data = await response.json();
    
    // Transform backend data to match frontend format - aligned with DB schema
    const transformedData = (data.data || []).map(brand => ({
      id: brand.id,
      businessName: brand.company_name || 'N/A',
      email: brand.email || 'N/A',
      logo: brand.profile_image || null,
      category: brand.category || 'N/A',
      address: brand.address || 'N/A',
      website: brand.website || '',
      description: brand.description || '',
      accountStatus: brand.status || 'Active',
      totalCampaigns: brand.totalCampaigns || 0,
      joinedDate: brand.created_at ? new Date(brand.created_at).toLocaleDateString() : 'N/A',
      isBlocked: brand.status === 'Blocked',
      isVerified: false,
    }));
    
    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error('Error fetching brands:', error);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

/**
 * Get brand by ID from database
 * @param {number} brandId - Brand ID
 * @returns {Promise<Object>} Brand details
 */
export const getBrandById = async (brandId) => {
  try {
    const headers = await getAdminHeaders();
    const url = `${API_CONFIG.BASE_URL}${API.ADMIN.BRAND_BY_ID.replace(':id', brandId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Brand not found');
    }

    const data = await response.json();
    const brand = data.data;
    
    // Transform to frontend format - aligned with DB schema
    const transformedData = {
      id: brand.id,
      businessName: brand.company_name || 'N/A',
      email: brand.email || 'N/A',
      logo: brand.profile_image || null,
      category: brand.category || 'N/A',
      address: brand.address || 'N/A',
      website: brand.website || '',
      description: brand.description || '',
      accountStatus: brand.status || 'Active',
      totalCampaigns: brand.totalCampaigns || 0,
      joinedDate: brand.created_at ? new Date(brand.created_at).toLocaleDateString() : 'N/A',
    };
    
    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error('Error fetching brand:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Search brands by name or email in database
 * @param {string} query - Search query
 * @returns {Promise<Object>} Filtered brands
 */
export const searchBrands = async (query) => {
  try {
    const headers = await getAdminHeaders();
    const url = `${API_CONFIG.BASE_URL}${API.ADMIN.BRANDS}?search=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to search brands');
    }

    const data = await response.json();
    
    // Transform backend data - aligned with DB schema
    const transformedData = (data.data || []).map(brand => ({
      id: brand.id,
      businessName: brand.company_name || 'N/A',
      email: brand.email || 'N/A',
      logo: brand.profile_image || null,
      category: brand.category || 'N/A',
      address: brand.address || 'N/A',
      accountStatus: brand.status || 'Active',
      isBlocked: brand.status === 'Blocked',
    }));
    
    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error('Error searching brands:', error);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

/**
 * Block a brand
 * @param {number} brandId - Brand ID
 * @returns {Promise<Object>} Result
 */
export const blockBrand = async (brandId) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const brand = MOCK_BRANDS.find(b => b.id === brandId);
  
  if (!brand) {
    return {
      success: false,
      error: 'Brand not found',
    };
  }
  
  // Update mock data
  brand.accountStatus = 'Blocked';
  
  return {
    success: true,
    message: 'Brand blocked successfully',
  };
};

/**
 * Unblock a brand
 * @param {number} brandId - Brand ID
 * @returns {Promise<Object>} Result
 */
export const unblockBrand = async (brandId) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const brand = MOCK_BRANDS.find(b => b.id === brandId);
  
  if (!brand) {
    return {
      success: false,
      error: 'Brand not found',
    };
  }
  
  // Update mock data
  brand.accountStatus = 'Active';
  
  return {
    success: true,
    message: 'Brand unblocked successfully',
  };
};
