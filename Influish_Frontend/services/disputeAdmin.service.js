/**
 * Dispute Admin Service
 * Mock dispute data for admin MVP — replace with APIs later
 * Handles dispute management, chat history, and admin decisions
 */

// Mock dispute data
const mockDisputes = [
  {
    id: 'DIS001',
    type: 'Content Rejection',
    status: 'Open',
    createdAt: '2024-01-20T14:30:00',
    brandId: 'BRD001',
    brandName: 'Nike India',
    influencerId: 'INF001',
    influencerName: 'Priya Sharma',
    campaignId: 'CAMP001',
    campaignName: 'Summer Collection Launch',
    paymentAmount: 25000,
    commissionRate: 20,
    platformCommission: 5000,
    influencerShare: 20000,
    walletState: {
      pending: 20000,
      available: 0,
      status: 'locked',
    },
    rejectionReason: 'Content quality does not meet brand standards',
    influencerClaim: 'Content was delivered as per requirements. All specifications were followed.',
    contentLink: 'https://instagram.com/p/sample123',
    campaignRequirements: 'Minimum 3 photos, brand logo visible, specific hashtags',
    additionalNotes: 'Influencer claims all requirements were met. Submitted proof of work.',
  },
  {
    id: 'DIS002',
    type: 'Fake Rejection',
    status: 'Open',
    createdAt: '2024-01-19T10:15:00',
    brandId: 'BRD002',
    brandName: 'Myntra',
    influencerId: 'INF002',
    influencerName: 'Rahul Verma',
    campaignId: 'CAMP002',
    campaignName: 'Fashion Week Promo',
    paymentAmount: 18500,
    commissionRate: 20,
    platformCommission: 3700,
    influencerShare: 14800,
    walletState: {
      pending: 14800,
      available: 0,
      status: 'locked',
    },
    rejectionReason: 'Deliverables not matching agreed timeline',
    influencerClaim: 'Posted on time. Brand is trying to avoid payment.',
    contentLink: 'https://instagram.com/p/sample456',
    campaignRequirements: 'Post by 15th Jan, 2 stories, 1 reel',
    additionalNotes: 'Influencer provided timestamps. Brand claims late delivery.',
  },
  {
    id: 'DIS003',
    type: 'Post-Payment Cancellation',
    status: 'Resolved',
    createdAt: '2024-01-15T16:45:00',
    resolvedAt: '2024-01-18T11:30:00',
    adminAction: 'Approved Influencer',
    adminReason: 'Content met all requirements. Brand rejection was unjustified.',
    brandId: 'BRD003',
    brandName: 'Zomato',
    influencerId: 'INF003',
    influencerName: 'Amit Kumar',
    campaignId: 'CAMP003',
    campaignName: 'Food Delivery Drive',
    paymentAmount: 30000,
    commissionRate: 20,
    platformCommission: 6000,
    influencerShare: 24000,
    walletState: {
      pending: 0,
      available: 24000,
      status: 'released',
    },
    rejectionReason: 'Brand cancelled campaign after delivery',
    influencerClaim: 'Campaign was completed successfully. Payment should be released.',
    contentLink: 'https://instagram.com/p/sample789',
    campaignRequirements: 'Food review video, Zomato branding, minimum 1 minute',
    additionalNotes: 'Admin reviewed content. All requirements fulfilled.',
  },
  {
    id: 'DIS004',
    type: 'Content Rejection',
    status: 'Resolved',
    createdAt: '2024-01-12T09:20:00',
    resolvedAt: '2024-01-14T15:00:00',
    adminAction: 'Approved Brand',
    adminReason: 'Content quality was significantly below standards. Brand refund justified.',
    brandId: 'BRD004',
    brandName: 'Amazon India',
    influencerId: 'INF004',
    influencerName: 'Sneha Patel',
    campaignId: 'CAMP004',
    campaignName: 'Prime Day Sale',
    paymentAmount: 22000,
    commissionRate: 20,
    platformCommission: 4400,
    influencerShare: 17600,
    walletState: {
      pending: 0,
      available: 0,
      status: 'refunded',
    },
    rejectionReason: 'Poor image quality, brand logo not visible',
    influencerClaim: 'Content was good enough. Brand is being too strict.',
    contentLink: 'https://instagram.com/p/sample321',
    campaignRequirements: 'High-quality photos, clear brand visibility, 4+ images',
    additionalNotes: 'Admin reviewed. Content quality was indeed subpar. Brand refunded.',
  },
  {
    id: 'DIS005',
    type: 'Fake Rejection',
    status: 'Open',
    createdAt: '2024-01-22T13:10:00',
    brandId: 'BRD005',
    brandName: 'Boat Lifestyle',
    influencerId: 'INF005',
    influencerName: 'Vikram Singh',
    campaignId: 'CAMP005',
    campaignName: 'Wireless Earbuds Launch',
    paymentAmount: 15000,
    commissionRate: 20,
    platformCommission: 3000,
    influencerShare: 12000,
    walletState: {
      pending: 12000,
      available: 0,
      status: 'locked',
    },
    rejectionReason: 'Influencer did not use product in video',
    influencerClaim: 'Product was clearly shown and demonstrated. False claim by brand.',
    contentLink: 'https://instagram.com/p/sample654',
    campaignRequirements: 'Unboxing video, product demo, 30+ seconds',
    additionalNotes: 'Pending admin review.',
  },
];

// Mock chat history for disputes
const mockChatHistory = {
  DIS001: [
    {
      id: 'MSG001',
      senderId: 'BRD001',
      senderName: 'Nike India',
      senderType: 'brand',
      message: 'Hi Priya, we need the summer collection posts by this weekend.',
      timestamp: '2024-01-10T10:00:00',
    },
    {
      id: 'MSG002',
      senderId: 'INF001',
      senderName: 'Priya Sharma',
      senderType: 'influencer',
      message: 'Sure! I will have them ready by Saturday.',
      timestamp: '2024-01-10T10:15:00',
    },
    {
      id: 'MSG003',
      senderId: 'INF001',
      senderName: 'Priya Sharma',
      senderType: 'influencer',
      message: 'I have posted all 3 photos as discussed. Please review.',
      timestamp: '2024-01-13T14:30:00',
    },
    {
      id: 'MSG004',
      senderId: 'BRD001',
      senderName: 'Nike India',
      senderType: 'brand',
      message: 'The photos do not meet our quality standards. We are rejecting this submission.',
      timestamp: '2024-01-14T11:00:00',
    },
    {
      id: 'MSG005',
      senderId: 'INF001',
      senderName: 'Priya Sharma',
      senderType: 'influencer',
      message: 'I followed all the requirements! The photos have good engagement too. This is unfair.',
      timestamp: '2024-01-14T11:30:00',
    },
  ],
  DIS002: [
    {
      id: 'MSG006',
      senderId: 'BRD002',
      senderName: 'Myntra',
      senderType: 'brand',
      message: 'Rahul, we need the Fashion Week content by 15th Jan.',
      timestamp: '2024-01-08T09:00:00',
    },
    {
      id: 'MSG007',
      senderId: 'INF002',
      senderName: 'Rahul Verma',
      senderType: 'influencer',
      message: 'Noted. I will post on 14th Jan to be safe.',
      timestamp: '2024-01-08T09:30:00',
    },
    {
      id: 'MSG008',
      senderId: 'INF002',
      senderName: 'Rahul Verma',
      senderType: 'influencer',
      message: 'Content is live! Check my Instagram.',
      timestamp: '2024-01-14T18:00:00',
    },
    {
      id: 'MSG009',
      senderId: 'BRD002',
      senderName: 'Myntra',
      senderType: 'brand',
      message: 'This was supposed to go live on 15th morning, not evening of 14th. Rejecting.',
      timestamp: '2024-01-16T10:00:00',
    },
    {
      id: 'MSG010',
      senderId: 'INF002',
      senderName: 'Rahul Verma',
      senderType: 'influencer',
      message: 'You said "by 15th" which means before 15th! This is a fake rejection.',
      timestamp: '2024-01-16T10:30:00',
    },
  ],
};

/**
 * Get all disputes with optional filters
 * @param {Object} filters - { status: 'Open' | 'Resolved' }
 * @returns {Object} { success: boolean, data: array }
 */
export const getAllDisputes = async (filters = {}) => {
  try {
    let disputes = [...mockDisputes];

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      disputes = disputes.filter((d) => d.status === filters.status);
    }

    // Sort by created date (newest first)
    disputes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      success: true,
      data: disputes,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch disputes',
      data: [],
    };
  }
};

/**
 * Get dispute by ID
 * @param {string} disputeId - Dispute ID
 * @returns {Object} { success: boolean, data: object }
 */
export const getDisputeById = async (disputeId) => {
  try {
    const dispute = mockDisputes.find((d) => d.id === disputeId);

    if (!dispute) {
      return {
        success: false,
        message: 'Dispute not found',
        data: null,
      };
    }

    return {
      success: true,
      data: dispute,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch dispute details',
      data: null,
    };
  }
};

/**
 * Search disputes
 * @param {string} query - Search query
 * @returns {Object} { success: boolean, data: array }
 */
export const searchDisputes = async (query) => {
  try {
    const lowerQuery = query.toLowerCase();

    const results = mockDisputes.filter(
      (d) =>
        d.id.toLowerCase().includes(lowerQuery) ||
        d.brandName.toLowerCase().includes(lowerQuery) ||
        d.influencerName.toLowerCase().includes(lowerQuery) ||
        d.campaignName.toLowerCase().includes(lowerQuery) ||
        d.type.toLowerCase().includes(lowerQuery)
    );

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Search failed',
      data: [],
    };
  }
};

/**
 * Approve influencer - Release pending wallet amount
 * @param {string} disputeId - Dispute ID
 * @param {string} reason - Admin decision reason
 * @returns {Object} { success: boolean, message: string }
 */
export const approveInfluencer = async (disputeId, reason) => {
  try {
    const dispute = mockDisputes.find((d) => d.id === disputeId);

    if (!dispute) {
      return {
        success: false,
        message: 'Dispute not found',
      };
    }

    if (dispute.status !== 'Open') {
      return {
        success: false,
        message: 'Dispute is already resolved',
      };
    }

    // Update dispute status
    dispute.status = 'Resolved';
    dispute.resolvedAt = new Date().toISOString();
    dispute.adminAction = 'Approved Influencer';
    dispute.adminReason = reason;

    // Update wallet state
    dispute.walletState = {
      pending: 0,
      available: dispute.influencerShare,
      status: 'released',
    };

    return {
      success: true,
      message: 'Influencer approved. Wallet amount released.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to approve influencer',
    };
  }
};

/**
 * Approve brand - Refund brand payment
 * @param {string} disputeId - Dispute ID
 * @param {string} reason - Admin decision reason
 * @returns {Object} { success: boolean, message: string }
 */
export const approveBrand = async (disputeId, reason) => {
  try {
    const dispute = mockDisputes.find((d) => d.id === disputeId);

    if (!dispute) {
      return {
        success: false,
        message: 'Dispute not found',
      };
    }

    if (dispute.status !== 'Open') {
      return {
        success: false,
        message: 'Dispute is already resolved',
      };
    }

    // Update dispute status
    dispute.status = 'Resolved';
    dispute.resolvedAt = new Date().toISOString();
    dispute.adminAction = 'Approved Brand';
    dispute.adminReason = reason;

    // Update wallet state (refunded to brand)
    dispute.walletState = {
      pending: 0,
      available: 0,
      status: 'refunded',
    };

    return {
      success: true,
      message: 'Brand approved. Payment refunded.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to approve brand',
    };
  }
};

/**
 * Reject dispute - No fund movement
 * @param {string} disputeId - Dispute ID
 * @param {string} reason - Admin rejection reason (mandatory)
 * @returns {Object} { success: boolean, message: string }
 */
export const rejectDispute = async (disputeId, reason) => {
  try {
    if (!reason || reason.trim().length < 10) {
      return {
        success: false,
        message: 'Rejection reason must be at least 10 characters',
      };
    }

    const dispute = mockDisputes.find((d) => d.id === disputeId);

    if (!dispute) {
      return {
        success: false,
        message: 'Dispute not found',
      };
    }

    if (dispute.status !== 'Open') {
      return {
        success: false,
        message: 'Dispute is already resolved',
      };
    }

    // Update dispute status
    dispute.status = 'Rejected';
    dispute.resolvedAt = new Date().toISOString();
    dispute.adminAction = 'Rejected Dispute';
    dispute.adminReason = reason;

    // No fund movement - wallet stays locked
    dispute.walletState.status = 'locked';

    return {
      success: true,
      message: 'Dispute rejected. No fund movement.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to reject dispute',
    };
  }
};

/**
 * Get chat history for a dispute
 * @param {string} disputeId - Dispute ID
 * @returns {Object} { success: boolean, data: array }
 */
export const getChatHistory = async (disputeId) => {
  try {
    const messages = mockChatHistory[disputeId] || [];

    return {
      success: true,
      data: messages,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch chat history',
      data: [],
    };
  }
};

/**
 * Get dispute statistics
 * @returns {Object} { open, resolved, rejected }
 */
export const getDisputeStats = async () => {
  try {
    const open = mockDisputes.filter((d) => d.status === 'Open').length;
    const resolved = mockDisputes.filter((d) => d.status === 'Resolved').length;
    const rejected = mockDisputes.filter((d) => d.status === 'Rejected').length;

    return {
      success: true,
      data: {
        open,
        resolved,
        rejected,
        total: mockDisputes.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {
        open: 0,
        resolved: 0,
        rejected: 0,
        total: 0,
      },
    };
  }
};

/**
 * Format currency to Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get status color
 * @param {string} status - Dispute status
 * @returns {string} Color code
 */
export const getStatusColor = (status) => {
  const colors = {
    Open: '#FF9800', // Orange
    Resolved: '#4CAF50', // Green
    Rejected: '#F44336', // Red
  };
  return colors[status] || '#9E9E9E';
};
