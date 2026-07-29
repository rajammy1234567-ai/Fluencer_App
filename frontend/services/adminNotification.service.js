/**
 * Admin Notification Service
 * Mock service for admin notification management
 * 
 * Mock admin controls — replace with backend APIs
 */

// Mock notification history (15 notifications)
let mockNotificationHistory = [
  {
    id: 'NOTIF001',
    title: 'Welcome to Influish Platform',
    message: 'We are excited to have you on board! Start exploring campaigns and connect with top brands.',
    targetType: 'all_influencers', // all_influencers, all_brands, specific_influencer, specific_brand
    targetName: 'All Influencers',
    targetId: null,
    sentAt: new Date('2024-01-25T10:00:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1247,
  },
  {
    id: 'NOTIF002',
    title: 'New Brand Verification Process',
    message: 'We have updated our brand verification process. Please ensure all documents are up to date.',
    targetType: 'all_brands',
    targetName: 'All Brands',
    targetId: null,
    sentAt: new Date('2024-01-24T14:30:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 453,
  },
  {
    id: 'NOTIF003',
    title: 'Platform Maintenance Scheduled',
    message: 'We will be performing system maintenance on Jan 28th from 2 AM to 4 AM IST. Services may be temporarily unavailable.',
    targetType: 'all_influencers',
    targetName: 'All Influencers',
    targetId: null,
    sentAt: new Date('2024-01-23T09:15:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1247,
  },
  {
    id: 'NOTIF004',
    title: 'Commission Rate Update',
    message: 'Effective Feb 1st, platform commission will be adjusted to 18% for all new campaigns.',
    targetType: 'all_brands',
    targetName: 'All Brands',
    targetId: null,
    sentAt: new Date('2024-01-22T16:00:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 453,
  },
  {
    id: 'NOTIF005',
    title: 'Payment Verification Required',
    message: 'Hi Priya, we need additional verification for your recent withdrawal request. Please check your email.',
    targetType: 'specific_influencer',
    targetName: 'Priya Sharma',
    targetId: 'INF123',
    sentAt: new Date('2024-01-21T11:45:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1,
  },
  {
    id: 'NOTIF006',
    title: 'Campaign Content Guidelines Updated',
    message: 'We have updated our content guidelines. Please review them before creating new campaigns.',
    targetType: 'all_brands',
    targetName: 'All Brands',
    targetId: null,
    sentAt: new Date('2024-01-20T13:20:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 453,
  },
  {
    id: 'NOTIF007',
    title: 'Profile Completion Bonus',
    message: 'Complete your profile by Jan 31st and get featured in our "Top Influencers" section!',
    targetType: 'all_influencers',
    targetName: 'All Influencers',
    targetId: null,
    sentAt: new Date('2024-01-19T10:00:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1247,
  },
  {
    id: 'NOTIF008',
    title: 'Document Submission Reminder',
    message: 'Dear Nike India, your GST certificate is about to expire. Please upload the renewed document.',
    targetType: 'specific_brand',
    targetName: 'Nike India',
    targetId: 'BRD456',
    sentAt: new Date('2024-01-18T15:30:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1,
  },
  {
    id: 'NOTIF009',
    title: 'New Feature: Bulk Campaign Creation',
    message: 'You can now create multiple campaigns at once! Check out the new bulk upload feature in your dashboard.',
    targetType: 'all_brands',
    targetName: 'All Brands',
    targetId: null,
    sentAt: new Date('2024-01-17T09:45:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 453,
  },
  {
    id: 'NOTIF010',
    title: 'Minimum Withdrawal Amount Updated',
    message: 'The minimum withdrawal amount has been updated to ₹500. This applies to all new withdrawal requests.',
    targetType: 'all_influencers',
    targetName: 'All Influencers',
    targetId: null,
    sentAt: new Date('2024-01-16T12:00:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1247,
  },
  {
    id: 'NOTIF011',
    title: 'Suspicious Activity Alert',
    message: 'Hi Rahul, we detected unusual login activity on your account. Please verify your recent logins.',
    targetType: 'specific_influencer',
    targetName: 'Rahul Verma',
    targetId: 'INF789',
    sentAt: new Date('2024-01-15T08:30:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1,
  },
  {
    id: 'NOTIF012',
    title: 'Holiday Season Campaign Opportunities',
    message: 'Brands are looking for influencers for Valentine\'s Day campaigns. Update your availability now!',
    targetType: 'all_influencers',
    targetName: 'All Influencers',
    targetId: null,
    sentAt: new Date('2024-01-14T10:15:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1247,
  },
  {
    id: 'NOTIF013',
    title: 'Campaign Performance Report',
    message: 'Dear Myntra, your Q4 2023 campaign performance report is ready. Check your dashboard for insights.',
    targetType: 'specific_brand',
    targetName: 'Myntra',
    targetId: 'BRD789',
    sentAt: new Date('2024-01-13T14:00:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1,
  },
  {
    id: 'NOTIF014',
    title: 'Tax Documentation Required',
    message: 'Please submit your Form 16 or equivalent tax documents for the fiscal year 2023-24.',
    targetType: 'all_influencers',
    targetName: 'All Influencers',
    targetId: null,
    sentAt: new Date('2024-01-12T11:30:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1247,
  },
  {
    id: 'NOTIF015',
    title: 'Payment Gateway Upgrade',
    message: 'We are upgrading our payment gateway for faster withdrawals. Expect improved processing times from Feb 1st.',
    targetType: 'all_influencers',
    targetName: 'All Influencers',
    targetId: null,
    sentAt: new Date('2024-01-11T09:00:00').toISOString(),
    sentBy: 'Admin',
    status: 'sent',
    recipientCount: 1247,
  },
];

// Mock user data for dropdowns (simplified)
const mockInfluencers = [
  { id: 'INF123', name: 'Priya Sharma', username: '@priyasharma' },
  { id: 'INF456', name: 'Rahul Verma', username: '@rahulverma' },
  { id: 'INF789', name: 'Amit Patel', username: '@amitpatel' },
  { id: 'INF101', name: 'Sneha Reddy', username: '@snehareddy' },
  { id: 'INF102', name: 'Arjun Singh', username: '@arjunsingh' },
];

const mockBrands = [
  { id: 'BRD123', name: 'Nike India', username: '@nikeindia' },
  { id: 'BRD456', name: 'Myntra', username: '@myntra' },
  { id: 'BRD789', name: 'Zomato', username: '@zomato' },
  { id: 'BRD101', name: 'Amazon Fashion', username: '@amazonfashion' },
  { id: 'BRD102', name: 'Boat Lifestyle', username: '@boatlifestyle' },
];

/**
 * Get notification history with optional filtering
 * @param {Object} filters - { targetType, searchQuery, limit }
 * @returns {Promise<Array>} Notification history
 */
export const getNotificationHistory = async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockNotificationHistory];

      // Filter by target type
      if (filters.targetType && filters.targetType !== 'all') {
        filtered = filtered.filter((notif) => notif.targetType === filters.targetType);
      }

      // Search by title, message, or target name
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (notif) =>
            notif.title.toLowerCase().includes(query) ||
            notif.message.toLowerCase().includes(query) ||
            notif.targetName.toLowerCase().includes(query)
        );
      }

      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

      // Apply limit
      if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
      }

      resolve(filtered);
    }, 300);
  });
};

/**
 * Get notification statistics
 * @returns {Promise<Object>} Stats object
 */
export const getNotificationStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stats = {
        total: mockNotificationHistory.length,
        allInfluencers: mockNotificationHistory.filter((n) => n.targetType === 'all_influencers').length,
        allBrands: mockNotificationHistory.filter((n) => n.targetType === 'all_brands').length,
        specific: mockNotificationHistory.filter(
          (n) => n.targetType === 'specific_influencer' || n.targetType === 'specific_brand'
        ).length,
        last7Days: mockNotificationHistory.filter((n) => {
          const daysDiff = (new Date() - new Date(n.sentAt)) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length,
      };
      resolve(stats);
    }, 200);
  });
};

/**
 * Send notification to all influencers
 * @param {Object} data - { title, message }
 * @returns {Promise<Object>} Created notification
 */
export const sendToAllInfluencers = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newNotification = {
        id: `NOTIF${String(mockNotificationHistory.length + 1).padStart(3, '0')}`,
        title: data.title,
        message: data.message,
        targetType: 'all_influencers',
        targetName: 'All Influencers',
        targetId: null,
        sentAt: new Date().toISOString(),
        sentBy: 'Admin',
        status: 'sent',
        recipientCount: 1247, // Mock count
      };

      mockNotificationHistory.unshift(newNotification); // Add to beginning
      resolve(newNotification);
    }, 500);
  });
};

/**
 * Send notification to all brands
 * @param {Object} data - { title, message }
 * @returns {Promise<Object>} Created notification
 */
export const sendToAllBrands = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newNotification = {
        id: `NOTIF${String(mockNotificationHistory.length + 1).padStart(3, '0')}`,
        title: data.title,
        message: data.message,
        targetType: 'all_brands',
        targetName: 'All Brands',
        targetId: null,
        sentAt: new Date().toISOString(),
        sentBy: 'Admin',
        status: 'sent',
        recipientCount: 453, // Mock count
      };

      mockNotificationHistory.unshift(newNotification);
      resolve(newNotification);
    }, 500);
  });
};

/**
 * Send notification to specific influencer
 * @param {Object} data - { title, message, influencerId }
 * @returns {Promise<Object>} Created notification
 */
export const sendToSpecificInfluencer = async (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const influencer = mockInfluencers.find((inf) => inf.id === data.influencerId);
      
      if (!influencer) {
        reject(new Error('Influencer not found'));
        return;
      }

      const newNotification = {
        id: `NOTIF${String(mockNotificationHistory.length + 1).padStart(3, '0')}`,
        title: data.title,
        message: data.message,
        targetType: 'specific_influencer',
        targetName: influencer.name,
        targetId: influencer.id,
        sentAt: new Date().toISOString(),
        sentBy: 'Admin',
        status: 'sent',
        recipientCount: 1,
      };

      mockNotificationHistory.unshift(newNotification);
      resolve(newNotification);
    }, 500);
  });
};

/**
 * Send notification to specific brand
 * @param {Object} data - { title, message, brandId }
 * @returns {Promise<Object>} Created notification
 */
export const sendToSpecificBrand = async (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const brand = mockBrands.find((b) => b.id === data.brandId);
      
      if (!brand) {
        reject(new Error('Brand not found'));
        return;
      }

      const newNotification = {
        id: `NOTIF${String(mockNotificationHistory.length + 1).padStart(3, '0')}`,
        title: data.title,
        message: data.message,
        targetType: 'specific_brand',
        targetName: brand.name,
        targetId: brand.id,
        sentAt: new Date().toISOString(),
        sentBy: 'Admin',
        status: 'sent',
        recipientCount: 1,
      };

      mockNotificationHistory.unshift(newNotification);
      resolve(newNotification);
    }, 500);
  });
};

/**
 * Get list of influencers for dropdown
 * @returns {Promise<Array>} Influencer list
 */
export const getInfluencersList = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockInfluencers);
    }, 200);
  });
};

/**
 * Get list of brands for dropdown
 * @returns {Promise<Array>} Brand list
 */
export const getBrandsList = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBrands);
    }, 200);
  });
};

/**
 * Delete notification from history
 * @param {string} notificationId - Notification ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteNotification = async (notificationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockNotificationHistory.findIndex((n) => n.id === notificationId);
      if (index !== -1) {
        mockNotificationHistory.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: Always return 3 unread notifications
      resolve(3);
    }, 100);
  });
};

/**
 * Utility: Format date
 */
export const formatNotificationDate = (isoDate) => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Utility: Get target type label
 */
export const getTargetTypeLabel = (targetType) => {
  const labels = {
    all_influencers: 'All Influencers',
    all_brands: 'All Brands',
    specific_influencer: 'Specific Influencer',
    specific_brand: 'Specific Brand',
  };
  return labels[targetType] || 'Unknown';
};

/**
 * Utility: Get target type color
 */
export const getTargetTypeColor = (targetType) => {
  const colors = {
    all_influencers: '#4CAF50', // Green
    all_brands: '#2196F3', // Blue
    specific_influencer: '#FF9800', // Orange
    specific_brand: '#9C27B0', // Purple
  };
  return colors[targetType] || '#757575';
};
