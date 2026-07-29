/**
 * Admin Dashboard Service
 * Connects to real database via backend APIs
 * Tables: users, influencer_profiles, brand_profiles, campaigns,
 *         campaign_applications, payment_orders, transactions
 */

import { getApiUrl, API } from '../constants/api.js';

/**
 * Get dashboard statistics from database
 * Database tables: users, influencer_profiles, brand_profiles, campaigns,
 *                  campaign_applications, payment_orders, transactions
 * @returns {Promise<Object>} Dashboard stats
 */
export const getDashboardStats = async () => {
  try {
    const url = getApiUrl(API.ADMIN.DASHBOARD_STATS);
    console.log('Fetching dashboard stats from:', url);
    
    const response = await fetch(url);
    console.log('Dashboard stats response status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard stats');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      message: error.message,
      data: {
        totalInfluencers: 0,
        totalBrands: 0,
        totalCampaigns: 0,
        activeDeals: 0,
        platformEarnings: 0,
        pendingWithdrawals: 0,
        openDisputes: 0,
      },
    };
  }
};

/**
 * Get recent campaigns from database
 * Database tables: campaigns, brand_profiles, users
 * @param {number} limit - Number of campaigns to fetch
 * @returns {Promise<Object>} Recent campaigns list
 */
export const getRecentCampaigns = async (limit = 5) => {
  try {
    const url = `${getApiUrl(API.ADMIN.RECENT_CAMPAIGNS)}?limit=${limit}`;
    console.log('Fetching recent campaigns from:', url);
    
    const response = await fetch(url);
    console.log('Recent campaigns response status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch recent campaigns');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching recent campaigns:', error.message);
    console.error('Full error:', error);
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

/**
 * Get recent payments from database
 * Database tables: payment_orders, users, brand_profiles
 * @param {number} limit - Number of payments to fetch
 * @returns {Promise<Object>} Recent payments list
 */
export const getRecentPayments = async (limit = 5) => {
  try {
    const url = `${getApiUrl(API.ADMIN.RECENT_PAYMENTS)}?limit=${limit}`;
    console.log('Fetching recent payments from:', url);
    
    const response = await fetch(url);
    console.log('Recent payments response status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch recent payments');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching recent payments:', error.message);
    console.error('Full error:', error);
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

/**
 * Get withdraw requests from database
 * Database tables: transactions, users, influencer_profiles
 * @param {number} limit - Number of requests to fetch
 * @returns {Promise<Object>} Withdraw requests list
 */
export const getWithdrawRequests = async (limit = 5) => {
  try {
    const url = `${getApiUrl(API.ADMIN.WITHDRAW_REQUESTS)}?limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch withdraw requests');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching withdraw requests:', error);
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

/**
 * Format currency to Indian Rupees
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

