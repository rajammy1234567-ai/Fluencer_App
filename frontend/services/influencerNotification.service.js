/**
 * Influencer Notification Service
 * Smart notification system for important events only
 * 
 * Notification logic – mock data (replace with API later)
 * Syncs with Admin actions: wallet, campaigns, disputes, account status
 */

// Mock notifications - Important events only
const mockNotifications = [
  {
    id: 'NOTIF_INF_001',
    title: '💰 Payment Received',
    message: '₹15,000 has been credited to your wallet from Nike Summer Campaign',
    type: 'wallet',
    createdAt: new Date('2026-01-26T10:30:00').toISOString(),
    isRead: false,
    referenceId: 'WLT_TXN_001',
    referenceType: 'wallet_transaction',
  },
  {
    id: 'NOTIF_INF_002',
    title: '📢 Campaign Application Accepted',
    message: 'Your application for "Myntra Fashion Week 2026" has been approved! Check campaign details.',
    type: 'campaign',
    createdAt: new Date('2026-01-25T14:20:00').toISOString(),
    isRead: false,
    referenceId: 'CAMP_123',
    referenceType: 'campaign',
  },
  {
    id: 'NOTIF_INF_003',
    title: '💰 Withdrawal Approved',
    message: 'Your withdrawal request of ₹40,000 has been approved and will be transferred within 2-3 business days.',
    type: 'wallet',
    createdAt: new Date('2026-01-25T09:15:00').toISOString(),
    isRead: true,
    referenceId: 'WD_001',
    referenceType: 'withdrawal',
  },
  {
    id: 'NOTIF_INF_004',
    title: '📢 New Campaign Available',
    message: 'Boat Lifestyle posted a new campaign in Electronics category matching your profile!',
    type: 'campaign',
    createdAt: new Date('2026-01-24T16:45:00').toISOString(),
    isRead: true,
    referenceId: 'CAMP_124',
    referenceType: 'campaign',
  },
  {
    id: 'NOTIF_INF_005',
    title: '🚨 Dispute Resolved',
    message: 'Your dispute for "Fitness Campaign" has been resolved in your favor. ₹5,000 credited to wallet.',
    type: 'dispute',
    createdAt: new Date('2026-01-23T11:00:00').toISOString(),
    isRead: true,
    referenceId: 'DISP_001',
    referenceType: 'dispute',
  },
  {
    id: 'NOTIF_INF_006',
    title: '💰 Pending Amount Released',
    message: '₹8,000 from completed campaign has been moved to your available balance.',
    type: 'wallet',
    createdAt: new Date('2026-01-22T10:30:00').toISOString(),
    isRead: true,
    referenceId: 'WLT_TXN_002',
    referenceType: 'wallet_transaction',
  },
  {
    id: 'NOTIF_INF_007',
    title: '📢 Campaign Completed',
    message: 'Congratulations! You successfully completed "Nike Summer Fitness" campaign.',
    type: 'campaign',
    createdAt: new Date('2026-01-21T15:20:00').toISOString(),
    isRead: true,
    referenceId: 'CAMP_122',
    referenceType: 'campaign',
  },
];

/**
 * Get all notifications for influencer
 * @param {Object} filters - Optional filters { isRead, type }
 * @returns {Promise<Object>} - { success, data: notifications }
 */
export const getInfluencerNotifications = async (filters = {}) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

    let notifications = [...mockNotifications];

    // Apply filters
    if (filters.isRead !== undefined) {
      notifications = notifications.filter(n => n.isRead === filters.isRead);
    }

    if (filters.type) {
      notifications = notifications.filter(n => n.type === filters.type);
    }

    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      success: true,
      data: notifications,
      unreadCount: mockNotifications.filter(n => !n.isRead).length,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      data: [],
      unreadCount: 0,
      error: error.message,
    };
  }
};

/**
 * Get recent notifications for Home screen (latest 5)
 * @returns {Promise<Object>}
 */
export const getRecentNotifications = async () => {
  try {
    const result = await getInfluencerNotifications();
    
    if (result.success) {
      return {
        success: true,
        data: result.data.slice(0, 5), // Latest 5 notifications
        unreadCount: result.unreadCount,
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    return {
      success: false,
      data: [],
      unreadCount: 0,
      error: error.message,
    };
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId
 * @returns {Promise<Object>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay

    const notification = mockNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      console.log('✅ Notification marked as read:', notificationId);
      
      return {
        success: true,
        message: 'Notification marked as read',
      };
    }

    return {
      success: false,
      message: 'Notification not found',
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>}
 */
export const markAllNotificationsAsRead = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

    mockNotifications.forEach(n => n.isRead = true);
    console.log('✅ All notifications marked as read');

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get unread notification count
 * @returns {Promise<number>}
 */
export const getUnreadCount = async () => {
  try {
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    return unreadCount;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Get notification icon and color based on type
 * @param {string} type - wallet, campaign, account, dispute
 * @returns {Object} - { icon, color }
 */
export const getNotificationStyle = (type) => {
  const styles = {
    wallet: {
      icon: 'wallet',
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
    },
    campaign: {
      icon: 'megaphone',
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    account: {
      icon: 'shield-checkmark',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    dispute: {
      icon: 'alert-circle',
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
  };

  return styles[type] || {
    icon: 'notifications',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  };
};

/**
 * Format notification time (e.g., "2h ago", "1d ago")
 * @param {string} dateString
 * @returns {string}
 */
export const formatNotificationTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

// Export mock data for testing (remove in production)
export const __mockNotifications = mockNotifications;
