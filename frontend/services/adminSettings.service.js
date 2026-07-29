/**
 * Admin Settings Service
 * Mock service for global platform settings management
 * 
 * Mock admin controls — replace with backend APIs
 * 
 * IMPORTANT: Changes apply only to NEW actions. Existing deals are not affected.
 * All settings changes should be logged for audit purposes.
 */

// Mock global settings state
let mockSettings = {
  // Platform Settings
  platform: {
    commissionPercentage: 20, // Platform commission on all NEW campaigns
    minWithdrawalAmount: 500, // Minimum amount for NEW withdrawal requests
    maxCampaignsPerBrand: null, // Optional limit (null = unlimited)
    lastUpdated: new Date('2024-01-20T10:00:00').toISOString(),
    updatedBy: 'Admin',
  },

  // Security Settings
  security: {
    withdrawalsEnabled: true, // Enable/disable NEW withdrawal requests
    campaignCreationEnabled: true, // Enable/disable NEW campaign creation (emergency stop)
    lastUpdated: new Date('2024-01-18T14:30:00').toISOString(),
    updatedBy: 'Admin',
  },

  // App Settings
  app: {
    maintenanceMode: false, // Enable maintenance mode (blocks all users)
    noticeMessage: '', // App-wide notice message (shown to all users)
    noticeEnabled: false, // Show/hide notice banner
    lastUpdated: new Date('2024-01-15T09:00:00').toISOString(),
    updatedBy: 'Admin',
  },
};

// Settings history for audit log (mock data)
let mockSettingsHistory = [
  {
    id: 'HIST001',
    action: 'update_commission',
    field: 'platform.commissionPercentage',
    oldValue: 18,
    newValue: 20,
    reason: 'Adjusted to match industry standards',
    changedBy: 'Admin',
    changedAt: new Date('2024-01-20T10:00:00').toISOString(),
  },
  {
    id: 'HIST002',
    action: 'update_withdrawal',
    field: 'platform.minWithdrawalAmount',
    oldValue: 1000,
    newValue: 500,
    reason: 'Lowered to support smaller influencers',
    changedBy: 'Admin',
    changedAt: new Date('2024-01-18T14:30:00').toISOString(),
  },
  {
    id: 'HIST003',
    action: 'toggle_maintenance',
    field: 'app.maintenanceMode',
    oldValue: true,
    newValue: false,
    reason: 'System upgrade completed successfully',
    changedBy: 'Admin',
    changedAt: new Date('2024-01-15T09:00:00').toISOString(),
  },
];

/**
 * Get current global settings
 * @returns {Promise<Object>} Settings object
 */
export const getSettings = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(mockSettings))); // Deep clone
    }, 300);
  });
};

/**
 * Update platform settings
 * @param {Object} updates - { commissionPercentage, minWithdrawalAmount, maxCampaignsPerBrand }
 * @param {string} reason - Reason for change (required for audit)
 * @returns {Promise<Object>} Updated settings
 */
export const updatePlatformSettings = async (updates, reason = 'Admin update') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const oldSettings = { ...mockSettings.platform };

      // Update platform settings
      if (updates.commissionPercentage !== undefined) {
        mockSettings.platform.commissionPercentage = updates.commissionPercentage;
        
        // Log to history
        mockSettingsHistory.unshift({
          id: `HIST${String(mockSettingsHistory.length + 1).padStart(3, '0')}`,
          action: 'update_commission',
          field: 'platform.commissionPercentage',
          oldValue: oldSettings.commissionPercentage,
          newValue: updates.commissionPercentage,
          reason,
          changedBy: 'Admin',
          changedAt: new Date().toISOString(),
        });
      }

      if (updates.minWithdrawalAmount !== undefined) {
        mockSettings.platform.minWithdrawalAmount = updates.minWithdrawalAmount;
        
        mockSettingsHistory.unshift({
          id: `HIST${String(mockSettingsHistory.length + 1).padStart(3, '0')}`,
          action: 'update_withdrawal',
          field: 'platform.minWithdrawalAmount',
          oldValue: oldSettings.minWithdrawalAmount,
          newValue: updates.minWithdrawalAmount,
          reason,
          changedBy: 'Admin',
          changedAt: new Date().toISOString(),
        });
      }

      if (updates.maxCampaignsPerBrand !== undefined) {
        mockSettings.platform.maxCampaignsPerBrand = updates.maxCampaignsPerBrand;
        
        mockSettingsHistory.unshift({
          id: `HIST${String(mockSettingsHistory.length + 1).padStart(3, '0')}`,
          action: 'update_max_campaigns',
          field: 'platform.maxCampaignsPerBrand',
          oldValue: oldSettings.maxCampaignsPerBrand,
          newValue: updates.maxCampaignsPerBrand,
          reason,
          changedBy: 'Admin',
          changedAt: new Date().toISOString(),
        });
      }

      mockSettings.platform.lastUpdated = new Date().toISOString();
      mockSettings.platform.updatedBy = 'Admin';

      resolve(JSON.parse(JSON.stringify(mockSettings)));
    }, 500);
  });
};

/**
 * Update security settings
 * @param {Object} updates - { withdrawalsEnabled, campaignCreationEnabled }
 * @param {string} reason - Reason for change (required for audit)
 * @returns {Promise<Object>} Updated settings
 */
export const updateSecuritySettings = async (updates, reason = 'Admin update') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const oldSettings = { ...mockSettings.security };

      if (updates.withdrawalsEnabled !== undefined) {
        mockSettings.security.withdrawalsEnabled = updates.withdrawalsEnabled;
        
        mockSettingsHistory.unshift({
          id: `HIST${String(mockSettingsHistory.length + 1).padStart(3, '0')}`,
          action: 'toggle_withdrawals',
          field: 'security.withdrawalsEnabled',
          oldValue: oldSettings.withdrawalsEnabled,
          newValue: updates.withdrawalsEnabled,
          reason,
          changedBy: 'Admin',
          changedAt: new Date().toISOString(),
        });
      }

      if (updates.campaignCreationEnabled !== undefined) {
        mockSettings.security.campaignCreationEnabled = updates.campaignCreationEnabled;
        
        mockSettingsHistory.unshift({
          id: `HIST${String(mockSettingsHistory.length + 1).padStart(3, '0')}`,
          action: 'toggle_campaign_creation',
          field: 'security.campaignCreationEnabled',
          oldValue: oldSettings.campaignCreationEnabled,
          newValue: updates.campaignCreationEnabled,
          reason,
          changedBy: 'Admin',
          changedAt: new Date().toISOString(),
        });
      }

      mockSettings.security.lastUpdated = new Date().toISOString();
      mockSettings.security.updatedBy = 'Admin';

      resolve(JSON.parse(JSON.stringify(mockSettings)));
    }, 500);
  });
};

/**
 * Update app settings
 * @param {Object} updates - { maintenanceMode, noticeMessage, noticeEnabled }
 * @param {string} reason - Reason for change (required for audit)
 * @returns {Promise<Object>} Updated settings
 */
export const updateAppSettings = async (updates, reason = 'Admin update') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const oldSettings = { ...mockSettings.app };

      if (updates.maintenanceMode !== undefined) {
        mockSettings.app.maintenanceMode = updates.maintenanceMode;
        
        mockSettingsHistory.unshift({
          id: `HIST${String(mockSettingsHistory.length + 1).padStart(3, '0')}`,
          action: 'toggle_maintenance',
          field: 'app.maintenanceMode',
          oldValue: oldSettings.maintenanceMode,
          newValue: updates.maintenanceMode,
          reason,
          changedBy: 'Admin',
          changedAt: new Date().toISOString(),
        });
      }

      if (updates.noticeMessage !== undefined) {
        mockSettings.app.noticeMessage = updates.noticeMessage;
        
        mockSettingsHistory.unshift({
          id: `HIST${String(mockSettingsHistory.length + 1).padStart(3, '0')}`,
          action: 'update_notice',
          field: 'app.noticeMessage',
          oldValue: oldSettings.noticeMessage,
          newValue: updates.noticeMessage,
          reason,
          changedBy: 'Admin',
          changedAt: new Date().toISOString(),
        });
      }

      if (updates.noticeEnabled !== undefined) {
        mockSettings.app.noticeEnabled = updates.noticeEnabled;
        
        mockSettingsHistory.unshift({
          id: `HIST${String(mockSettingsHistory.length + 1).padStart(3, '0')}`,
          action: 'toggle_notice',
          field: 'app.noticeEnabled',
          oldValue: oldSettings.noticeEnabled,
          newValue: updates.noticeEnabled,
          reason,
          changedBy: 'Admin',
          changedAt: new Date().toISOString(),
        });
      }

      mockSettings.app.lastUpdated = new Date().toISOString();
      mockSettings.app.updatedBy = 'Admin';

      resolve(JSON.parse(JSON.stringify(mockSettings)));
    }, 500);
  });
};

/**
 * Get settings change history
 * @param {number} limit - Number of history entries to return
 * @returns {Promise<Array>} History entries
 */
export const getSettingsHistory = async (limit = 20) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const history = [...mockSettingsHistory].slice(0, limit);
      resolve(history);
    }, 300);
  });
};

/**
 * Validate setting value
 * @param {string} setting - Setting name
 * @param {any} value - Setting value
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateSetting = (setting, value) => {
  switch (setting) {
    case 'commissionPercentage':
      if (typeof value !== 'number' || value < 0 || value > 50) {
        return { valid: false, error: 'Commission must be between 0% and 50%' };
      }
      break;

    case 'minWithdrawalAmount':
      if (typeof value !== 'number' || value < 100 || value > 10000) {
        return { valid: false, error: 'Min withdrawal must be between ₹100 and ₹10,000' };
      }
      break;

    case 'maxCampaignsPerBrand':
      if (value !== null && (typeof value !== 'number' || value < 1 || value > 100)) {
        return { valid: false, error: 'Max campaigns must be between 1 and 100 (or leave empty)' };
      }
      break;

    case 'noticeMessage':
      if (value && value.length > 200) {
        return { valid: false, error: 'Notice message cannot exceed 200 characters' };
      }
      break;

    default:
      break;
  }

  return { valid: true, error: null };
};

/**
 * Reset settings to default values
 * @param {string} reason - Reason for reset (required for audit)
 * @returns {Promise<Object>} Default settings
 */
export const resetToDefaults = async (reason = 'Admin reset to defaults') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const oldSettings = JSON.parse(JSON.stringify(mockSettings));

      // Default values
      mockSettings = {
        platform: {
          commissionPercentage: 20,
          minWithdrawalAmount: 500,
          maxCampaignsPerBrand: null,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin',
        },
        security: {
          withdrawalsEnabled: true,
          campaignCreationEnabled: true,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin',
        },
        app: {
          maintenanceMode: false,
          noticeMessage: '',
          noticeEnabled: false,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin',
        },
      };

      // Log reset to history
      mockSettingsHistory.unshift({
        id: `HIST${String(mockSettingsHistory.length + 1).padStart(3, '0')}`,
        action: 'reset_to_defaults',
        field: 'all_settings',
        oldValue: oldSettings,
        newValue: mockSettings,
        reason,
        changedBy: 'Admin',
        changedAt: new Date().toISOString(),
      });

      resolve(JSON.parse(JSON.stringify(mockSettings)));
    }, 500);
  });
};

/**
 * Utility: Format last updated text
 */
export const formatLastUpdated = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Utility: Get setting change impact message
 */
export const getImpactMessage = (setting, newValue) => {
  const messages = {
    commissionPercentage: `All NEW campaigns will have ${newValue}% platform commission. Existing campaigns are not affected.`,
    minWithdrawalAmount: `Influencers can withdraw from ₹${newValue} onwards for NEW requests. Pending withdrawals are not affected.`,
    maxCampaignsPerBrand: newValue
      ? `Brands can create up to ${newValue} campaigns. Existing campaigns are not affected.`
      : 'Brands can create unlimited campaigns.',
    withdrawalsEnabled: newValue
      ? 'Withdrawal requests are now enabled for all influencers.'
      : '⚠️ WARNING: New withdrawal requests will be BLOCKED. Pending withdrawals will continue.',
    campaignCreationEnabled: newValue
      ? 'Campaign creation is now enabled for all brands.'
      : '⚠️ WARNING: New campaign creation will be BLOCKED. Existing campaigns will continue.',
    maintenanceMode: newValue
      ? '⚠️ WARNING: App will enter maintenance mode. All users will be blocked.'
      : 'Maintenance mode disabled. Users can access the app normally.',
    noticeEnabled: newValue
      ? 'Notice banner will be shown to all users.'
      : 'Notice banner will be hidden from users.',
  };
  return messages[setting] || '';
};
