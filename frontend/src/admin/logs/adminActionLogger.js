/**
 * Admin Action Logger
 * 
 * Tracks all critical admin actions for audit and security purposes.
 * Logs user blocks, payment approvals, dispute resolutions, settings changes, etc.
 * 
 * PRODUCTION IMPLEMENTATION:
 * - Replace console.log with backend API calls
 * - Store logs in secure database with encryption
 * - Set up log retention policies
 * - Implement log analysis for suspicious patterns
 * - Add real-time alerts for critical actions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Action Types for Logging
 */
export const ACTION_TYPES = {
  // User Management
  USER_BLOCKED: 'USER_BLOCKED',
  USER_UNBLOCKED: 'USER_UNBLOCKED',
  USER_DELETED: 'USER_DELETED',
  USER_DETAILS_UPDATED: 'USER_DETAILS_UPDATED',

  // Payment & Wallet
  WITHDRAWAL_APPROVED: 'WITHDRAWAL_APPROVED',
  WITHDRAWAL_REJECTED: 'WITHDRAWAL_REJECTED',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  WALLET_CREDITED: 'WALLET_CREDITED',
  WALLET_DEBITED: 'WALLET_DEBITED',

  // Campaign Management
  CAMPAIGN_CANCELLED: 'CAMPAIGN_CANCELLED',
  CAMPAIGN_MODIFIED: 'CAMPAIGN_MODIFIED',

  // Dispute Management
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  DISPUTE_ESCALATED: 'DISPUTE_ESCALATED',
  DISPUTE_CLOSED: 'DISPUTE_CLOSED',

  // Platform Settings
  COMMISSION_CHANGED: 'COMMISSION_CHANGED',
  WITHDRAWAL_LIMIT_CHANGED: 'WITHDRAWAL_LIMIT_CHANGED',
  MAINTENANCE_MODE_ENABLED: 'MAINTENANCE_MODE_ENABLED',
  MAINTENANCE_MODE_DISABLED: 'MAINTENANCE_MODE_DISABLED',
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  FEATURE_ENABLED: 'FEATURE_ENABLED',

  // Notifications
  BROADCAST_SENT: 'BROADCAST_SENT',
  NOTIFICATION_SENT: 'NOTIFICATION_SENT',

  // Admin Management
  ADMIN_CREATED: 'ADMIN_CREATED',
  ADMIN_DELETED: 'ADMIN_DELETED',
  ADMIN_ROLE_CHANGED: 'ADMIN_ROLE_CHANGED',
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_LOGOUT: 'ADMIN_LOGOUT',
};

/**
 * Log an admin action
 * @param {string} actionType - Type of action (from ACTION_TYPES)
 * @param {object} details - Action details
 * @param {string} details.targetId - ID of affected entity (user, payment, etc.)
 * @param {string} details.targetType - Type of target (user, payment, dispute, etc.)
 * @param {object} details.metadata - Additional context
 * @param {string} details.reason - Reason for action (optional)
 */
export const logAdminAction = async (actionType, details = {}) => {
  try {
    // Get admin info from storage
    const adminEmail = await AsyncStorage.getItem('adminEmail');
    const adminName = await AsyncStorage.getItem('adminName');
    const adminRole = await AsyncStorage.getItem('adminRole');

    // Build log entry
    const logEntry = {
      actionType,
      adminEmail: adminEmail || 'unknown@admin.com',
      adminName: adminName || 'Unknown Admin',
      adminRole: adminRole || 'SUPER_ADMIN',
      targetId: details.targetId || null,
      targetType: details.targetType || null,
      metadata: details.metadata || {},
      reason: details.reason || null,
      timestamp: new Date().toISOString(),
      ipAddress: null, // TODO: Get from device/network info
      deviceInfo: null, // TODO: Get device details
    };

    // TODO: Replace with backend API call
    // await fetch('https://api.influish.com/admin/logs', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${adminToken}`,
    //   },
    //   body: JSON.stringify(logEntry),
    // });

    // For now, just log to console
    console.log('📝 ADMIN ACTION LOG:', logEntry);

    // Store locally for debugging (remove in production)
    await storeLocalLog(logEntry);

    return { success: true, logId: generateLogId() };
  } catch (error) {
    console.error('Failed to log admin action:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Store log locally (for debugging, remove in production)
 */
const storeLocalLog = async (logEntry) => {
  try {
    const existingLogs = await AsyncStorage.getItem('adminActionLogs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];

    // Keep only last 100 logs locally
    if (logs.length >= 100) {
      logs.shift();
    }

    logs.push(logEntry);
    await AsyncStorage.setItem('adminActionLogs', JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to store local log:', error);
  }
};

/**
 * Get local logs (for debugging)
 */
export const getLocalLogs = async (limit = 50) => {
  try {
    const existingLogs = await AsyncStorage.getItem('adminActionLogs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    return logs.slice(-limit).reverse(); // Most recent first
  } catch (error) {
    console.error('Failed to get local logs:', error);
    return [];
  }
};

/**
 * Clear local logs
 */
export const clearLocalLogs = async () => {
  try {
    await AsyncStorage.removeItem('adminActionLogs');
    return { success: true };
  } catch (error) {
    console.error('Failed to clear local logs:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate unique log ID
 */
const generateLogId = () => {
  return `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Helper: Log user block action
 */
export const logUserBlock = async (userId, userType, reason) => {
  return await logAdminAction(ACTION_TYPES.USER_BLOCKED, {
    targetId: userId,
    targetType: userType, // 'influencer' or 'brand'
    reason,
    metadata: { blockedAt: new Date().toISOString() },
  });
};

/**
 * Helper: Log user unblock action
 */
export const logUserUnblock = async (userId, userType, reason) => {
  return await logAdminAction(ACTION_TYPES.USER_UNBLOCKED, {
    targetId: userId,
    targetType: userType,
    reason,
    metadata: { unblockedAt: new Date().toISOString() },
  });
};

/**
 * Helper: Log withdrawal approval
 */
export const logWithdrawalApproval = async (withdrawalId, amount, userId) => {
  return await logAdminAction(ACTION_TYPES.WITHDRAWAL_APPROVED, {
    targetId: withdrawalId,
    targetType: 'withdrawal',
    metadata: {
      amount,
      userId,
      approvedAt: new Date().toISOString(),
    },
  });
};

/**
 * Helper: Log withdrawal rejection
 */
export const logWithdrawalRejection = async (withdrawalId, amount, userId, reason) => {
  return await logAdminAction(ACTION_TYPES.WITHDRAWAL_REJECTED, {
    targetId: withdrawalId,
    targetType: 'withdrawal',
    reason,
    metadata: {
      amount,
      userId,
      rejectedAt: new Date().toISOString(),
    },
  });
};

/**
 * Helper: Log dispute resolution
 */
export const logDisputeResolution = async (disputeId, resolution, winner) => {
  return await logAdminAction(ACTION_TYPES.DISPUTE_RESOLVED, {
    targetId: disputeId,
    targetType: 'dispute',
    metadata: {
      resolution,
      winner,
      resolvedAt: new Date().toISOString(),
    },
  });
};

/**
 * Helper: Log commission change
 */
export const logCommissionChange = async (oldValue, newValue, reason) => {
  return await logAdminAction(ACTION_TYPES.COMMISSION_CHANGED, {
    targetType: 'platform_setting',
    reason,
    metadata: {
      oldValue,
      newValue,
      changedAt: new Date().toISOString(),
    },
  });
};

/**
 * Helper: Log maintenance mode toggle
 */
export const logMaintenanceModeToggle = async (enabled, reason) => {
  return await logAdminAction(
    enabled ? ACTION_TYPES.MAINTENANCE_MODE_ENABLED : ACTION_TYPES.MAINTENANCE_MODE_DISABLED,
    {
      targetType: 'platform_setting',
      reason,
      metadata: {
        enabled,
        toggledAt: new Date().toISOString(),
      },
    }
  );
};

/**
 * Helper: Log notification broadcast
 */
export const logNotificationBroadcast = async (notificationId, targetType, recipientCount) => {
  return await logAdminAction(ACTION_TYPES.BROADCAST_SENT, {
    targetId: notificationId,
    targetType: 'notification',
    metadata: {
      targetType,
      recipientCount,
      sentAt: new Date().toISOString(),
    },
  });
};

/**
 * Get action type label
 */
export const getActionTypeLabel = (actionType) => {
  const labels = {
    [ACTION_TYPES.USER_BLOCKED]: 'User Blocked',
    [ACTION_TYPES.USER_UNBLOCKED]: 'User Unblocked',
    [ACTION_TYPES.USER_DELETED]: 'User Deleted',
    [ACTION_TYPES.USER_DETAILS_UPDATED]: 'User Details Updated',
    [ACTION_TYPES.WITHDRAWAL_APPROVED]: 'Withdrawal Approved',
    [ACTION_TYPES.WITHDRAWAL_REJECTED]: 'Withdrawal Rejected',
    [ACTION_TYPES.REFUND_PROCESSED]: 'Refund Processed',
    [ACTION_TYPES.WALLET_CREDITED]: 'Wallet Credited',
    [ACTION_TYPES.WALLET_DEBITED]: 'Wallet Debited',
    [ACTION_TYPES.CAMPAIGN_CANCELLED]: 'Campaign Cancelled',
    [ACTION_TYPES.CAMPAIGN_MODIFIED]: 'Campaign Modified',
    [ACTION_TYPES.DISPUTE_RESOLVED]: 'Dispute Resolved',
    [ACTION_TYPES.DISPUTE_ESCALATED]: 'Dispute Escalated',
    [ACTION_TYPES.DISPUTE_CLOSED]: 'Dispute Closed',
    [ACTION_TYPES.COMMISSION_CHANGED]: 'Commission Changed',
    [ACTION_TYPES.WITHDRAWAL_LIMIT_CHANGED]: 'Withdrawal Limit Changed',
    [ACTION_TYPES.MAINTENANCE_MODE_ENABLED]: 'Maintenance Mode Enabled',
    [ACTION_TYPES.MAINTENANCE_MODE_DISABLED]: 'Maintenance Mode Disabled',
    [ACTION_TYPES.FEATURE_DISABLED]: 'Feature Disabled',
    [ACTION_TYPES.FEATURE_ENABLED]: 'Feature Enabled',
    [ACTION_TYPES.BROADCAST_SENT]: 'Broadcast Sent',
    [ACTION_TYPES.NOTIFICATION_SENT]: 'Notification Sent',
    [ACTION_TYPES.ADMIN_CREATED]: 'Admin Created',
    [ACTION_TYPES.ADMIN_DELETED]: 'Admin Deleted',
    [ACTION_TYPES.ADMIN_ROLE_CHANGED]: 'Admin Role Changed',
    [ACTION_TYPES.ADMIN_LOGIN]: 'Admin Login',
    [ACTION_TYPES.ADMIN_LOGOUT]: 'Admin Logout',
  };

  return labels[actionType] || actionType;
};

/**
 * SECURITY & COMPLIANCE NOTES:
 * 
 * 1. Data Retention:
 *    - Store logs for minimum 90 days (adjust per compliance requirements)
 *    - Archive old logs to cold storage
 *    - Implement automated log cleanup policies
 * 
 * 2. Log Protection:
 *    - Encrypt logs at rest and in transit
 *    - Restrict log access to authorized personnel only
 *    - Use write-only log storage (prevent tampering)
 * 
 * 3. Sensitive Data:
 *    - Never log passwords or full payment card numbers
 *    - Mask PII (email, phone) in logs where possible
 *    - Comply with GDPR/data protection regulations
 * 
 * 4. Monitoring & Alerts:
 *    - Set up alerts for suspicious action patterns
 *    - Monitor for bulk operations (mass blocks, deletions)
 *    - Track failed action attempts
 *    - Implement rate limiting on critical actions
 * 
 * 5. Audit Reports:
 *    - Generate regular audit reports for management
 *    - Track admin activity trends
 *    - Identify potential security risks
 *    - Maintain immutable audit trail
 */
