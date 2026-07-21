/**
 * Commission Service
 * Manages platform commission rates and calculations
 * 
 * Mock data for admin MVP — replace with APIs
 */

// Mock commission settings
let commissionSettings = {
  currentRate: 20, // 20% platform commission
  minRate: 10,
  maxRate: 30,
  lastUpdated: '2026-01-01T00:00:00Z',
  updatedBy: 'admin',
  appliesTo: 'new_deals', // Only new deals get updated rate
};

// Commission history
const commissionHistory = [
  {
    id: 'CH001',
    previousRate: 15,
    newRate: 20,
    changedBy: 'admin',
    changedAt: '2026-01-01T00:00:00Z',
    reason: 'Platform operational costs increase',
  },
];

/**
 * Get current commission rate
 */
export const getCommissionRate = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: commissionSettings,
      });
    }, 200);
  });
};

/**
 * Update commission rate
 * Only affects NEW deals, not existing ones
 */
export const updateCommissionRate = async (newRate, reason) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (newRate < commissionSettings.minRate || newRate > commissionSettings.maxRate) {
        resolve({
          success: false,
          error: `Commission rate must be between ${commissionSettings.minRate}% and ${commissionSettings.maxRate}%`,
        });
        return;
      }

      // Log history
      commissionHistory.unshift({
        id: `CH${String(commissionHistory.length + 1).padStart(3, '0')}`,
        previousRate: commissionSettings.currentRate,
        newRate: newRate,
        changedBy: 'admin',
        changedAt: new Date().toISOString(),
        reason: reason || 'No reason provided',
      });

      // Update settings
      const previousRate = commissionSettings.currentRate;
      commissionSettings.currentRate = newRate;
      commissionSettings.lastUpdated = new Date().toISOString();
      commissionSettings.updatedBy = 'admin';

      resolve({
        success: true,
        message: `Commission rate updated from ${previousRate}% to ${newRate}%`,
        data: commissionSettings,
      });
    }, 600);
  });
};

/**
 * Get commission change history
 */
export const getCommissionHistory = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: commissionHistory,
      });
    }, 300);
  });
};

/**
 * Calculate commission breakdown for a payment amount
 */
export const calculateCommission = (totalAmount, commissionRate = null) => {
  const rate = commissionRate || commissionSettings.currentRate;
  const commissionAmount = Math.round((totalAmount * rate) / 100);
  const influencerAmount = totalAmount - commissionAmount;

  return {
    totalAmount,
    commissionRate: rate,
    commissionAmount,
    influencerAmount,
    breakdown: {
      platform: commissionAmount,
      influencer: influencerAmount,
    },
  };
};

/**
 * Get commission statistics
 */
export const getCommissionStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // These would come from payment data
      const totalCommissionEarned = 63000; // Sum of all commission amounts
      const averageCommissionRate = 20;
      const dealsUnderCurrentRate = 5;

      resolve({
        success: true,
        data: {
          currentRate: commissionSettings.currentRate,
          totalCommissionEarned,
          averageCommissionRate,
          dealsUnderCurrentRate,
          lastUpdated: commissionSettings.lastUpdated,
        },
      });
    }, 300);
  });
};

/**
 * Validate commission rate
 */
export const validateCommissionRate = (rate) => {
  if (typeof rate !== 'number') {
    return {
      valid: false,
      error: 'Commission rate must be a number',
    };
  }

  if (rate < commissionSettings.minRate || rate > commissionSettings.maxRate) {
    return {
      valid: false,
      error: `Rate must be between ${commissionSettings.minRate}% and ${commissionSettings.maxRate}%`,
    };
  }

  return {
    valid: true,
  };
};

/**
 * Format percentage
 */
export const formatPercentage = (rate) => {
  return `${rate}%`;
};

/**
 * Format currency to Indian Rupees
 */
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
