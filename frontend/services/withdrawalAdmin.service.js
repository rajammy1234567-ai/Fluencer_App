/**
 * Withdrawal Admin Service
 * Manages influencer withdrawal requests and wallet operations
 * 
 * Mock data for admin MVP — replace with APIs
 */

// Mock withdrawal requests
const mockWithdrawals = [
  {
    id: 'WD001',
    influencerId: 'I001',
    influencerName: 'Priya Sharma',
    influencerEmail: 'priya@example.com',
    requestedAmount: 40000,
    walletBalance: 88000,
    bankName: 'HDFC Bank',
    accountNumber: '****5678',
    ifscCode: 'HDFC0001234',
    accountHolderName: 'Priya Sharma',
    status: 'Pending',
    requestDate: '2026-01-24T10:00:00Z',
    processedDate: null,
    processedBy: null,
    rejectionReason: null,
    transactionId: null,
    createdAt: '2026-01-24T10:00:00Z',
  },
  {
    id: 'WD002',
    influencerId: 'I002',
    influencerName: 'Rahul Verma',
    influencerEmail: 'rahul@example.com',
    requestedAmount: 60000,
    walletBalance: 120000,
    bankName: 'ICICI Bank',
    accountNumber: '****9012',
    ifscCode: 'ICIC0002345',
    accountHolderName: 'Rahul Verma',
    status: 'Approved',
    requestDate: '2026-01-22T14:30:00Z',
    processedDate: '2026-01-23T09:15:00Z',
    processedBy: 'admin',
    rejectionReason: null,
    transactionId: 'TXN_WD002_123456',
    createdAt: '2026-01-22T14:30:00Z',
  },
  {
    id: 'WD003',
    influencerId: 'I004',
    influencerName: 'Vikram Singh',
    influencerEmail: 'vikram@example.com',
    requestedAmount: 80000,
    walletBalance: 80000,
    bankName: 'SBI',
    accountNumber: '****3456',
    ifscCode: 'SBIN0003456',
    accountHolderName: 'Vikram Singh',
    status: 'Pending',
    requestDate: '2026-01-25T11:20:00Z',
    processedDate: null,
    processedBy: null,
    rejectionReason: null,
    transactionId: null,
    createdAt: '2026-01-25T11:20:00Z',
  },
  {
    id: 'WD004',
    influencerId: 'I005',
    influencerName: 'Sneha Patel',
    influencerEmail: 'sneha@example.com',
    requestedAmount: 25000,
    walletBalance: 73000,
    bankName: 'Axis Bank',
    accountNumber: '****7890',
    ifscCode: 'UTIB0004567',
    accountHolderName: 'Sneha Patel',
    status: 'Rejected',
    requestDate: '2026-01-20T16:45:00Z',
    processedDate: '2026-01-21T10:30:00Z',
    processedBy: 'admin',
    rejectionReason: 'Insufficient completed campaigns. Minimum 3 campaigns required.',
    transactionId: null,
    createdAt: '2026-01-20T16:45:00Z',
  },
  {
    id: 'WD005',
    influencerId: 'I001',
    influencerName: 'Priya Sharma',
    influencerEmail: 'priya@example.com',
    requestedAmount: 48000,
    walletBalance: 88000,
    bankName: 'HDFC Bank',
    accountNumber: '****5678',
    ifscCode: 'HDFC0001234',
    accountHolderName: 'Priya Sharma',
    status: 'Approved',
    requestDate: '2026-01-18T09:00:00Z',
    processedDate: '2026-01-19T14:20:00Z',
    processedBy: 'admin',
    rejectionReason: null,
    transactionId: 'TXN_WD005_789012',
    createdAt: '2026-01-18T09:00:00Z',
  },
];

// Mock wallet data for influencers
const mockWallets = {
  'I001': {
    influencerId: 'I001',
    influencerName: 'Priya Sharma',
    pendingBalance: 40000,
    availableBalance: 88000,
    withdrawnBalance: 48000,
    totalEarnings: 176000,
    transactions: [
      {
        id: 'TXN001',
        type: 'Credit',
        amount: 40000,
        description: 'Campaign: Summer Collection Launch',
        status: 'Completed',
        date: '2026-01-20T10:30:00Z',
      },
      {
        id: 'TXN002',
        type: 'Debit',
        amount: 48000,
        description: 'Withdrawal to HDFC Bank',
        status: 'Completed',
        date: '2026-01-19T14:20:00Z',
      },
      {
        id: 'TXN003',
        type: 'Credit',
        amount: 48000,
        description: 'Campaign: Brand X Promotion',
        status: 'Pending',
        date: '2026-01-15T12:00:00Z',
      },
    ],
  },
  'I002': {
    influencerId: 'I002',
    influencerName: 'Rahul Verma',
    pendingBalance: 0,
    availableBalance: 120000,
    withdrawnBalance: 60000,
    totalEarnings: 180000,
    transactions: [
      {
        id: 'TXN004',
        type: 'Credit',
        amount: 60000,
        description: 'Campaign: Festival Sale Campaign',
        status: 'Completed',
        date: '2026-01-22T14:15:00Z',
      },
      {
        id: 'TXN005',
        type: 'Debit',
        amount: 60000,
        description: 'Withdrawal to ICICI Bank',
        status: 'Completed',
        date: '2026-01-23T09:15:00Z',
      },
    ],
  },
};

/**
 * Get all withdrawal requests with optional filters
 */
export const getAllWithdrawals = async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockWithdrawals];

      // Filter by status
      if (filters.status) {
        filtered = filtered.filter(w => w.status === filters.status);
      }

      // Filter by influencer
      if (filters.influencerId) {
        filtered = filtered.filter(w => w.influencerId === filters.influencerId);
      }

      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

      resolve({
        success: true,
        data: filtered,
        total: filtered.length,
      });
    }, 500);
  });
};

/**
 * Get withdrawal by ID
 */
export const getWithdrawalById = async (withdrawalId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const withdrawal = mockWithdrawals.find(w => w.id === withdrawalId);
      
      if (withdrawal) {
        resolve({
          success: true,
          data: withdrawal,
        });
      } else {
        resolve({
          success: false,
          error: 'Withdrawal not found',
        });
      }
    }, 300);
  });
};

/**
 * Search withdrawals by influencer name
 */
export const searchWithdrawals = async (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const searchTerm = query.toLowerCase();
      const results = mockWithdrawals.filter(w =>
        w.influencerName.toLowerCase().includes(searchTerm) ||
        w.influencerEmail.toLowerCase().includes(searchTerm) ||
        w.id.toLowerCase().includes(searchTerm)
      );

      resolve({
        success: true,
        data: results,
        total: results.length,
      });
    }, 400);
  });
};

/**
 * Approve withdrawal request
 */
export const approveWithdrawal = async (withdrawalId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const withdrawal = mockWithdrawals.find(w => w.id === withdrawalId);
      
      if (withdrawal && withdrawal.status === 'Pending') {
        withdrawal.status = 'Approved';
        withdrawal.processedDate = new Date().toISOString();
        withdrawal.processedBy = 'admin';
        withdrawal.transactionId = `TXN_${withdrawalId}_${Date.now()}`;
        
        resolve({
          success: true,
          message: 'Withdrawal approved successfully',
          data: withdrawal,
        });
      } else {
        resolve({
          success: false,
          error: 'Cannot approve this withdrawal',
        });
      }
    }, 800);
  });
};

/**
 * Reject withdrawal request
 */
export const rejectWithdrawal = async (withdrawalId, reason) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const withdrawal = mockWithdrawals.find(w => w.id === withdrawalId);
      
      if (withdrawal && withdrawal.status === 'Pending') {
        withdrawal.status = 'Rejected';
        withdrawal.processedDate = new Date().toISOString();
        withdrawal.processedBy = 'admin';
        withdrawal.rejectionReason = reason;
        
        resolve({
          success: true,
          message: 'Withdrawal rejected',
          data: withdrawal,
        });
      } else {
        resolve({
          success: false,
          error: 'Cannot reject this withdrawal',
        });
      }
    }, 800);
  });
};

/**
 * Get influencer wallet details
 */
export const getInfluencerWallet = async (influencerId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const wallet = mockWallets[influencerId];
      
      if (wallet) {
        resolve({
          success: true,
          data: wallet,
        });
      } else {
        resolve({
          success: false,
          error: 'Wallet not found',
        });
      }
    }, 300);
  });
};

/**
 * Get withdrawal statistics
 */
export const getWithdrawalStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const totalRequests = mockWithdrawals.length;
      const pendingRequests = mockWithdrawals.filter(w => w.status === 'Pending').length;
      const approvedRequests = mockWithdrawals.filter(w => w.status === 'Approved').length;
      const rejectedRequests = mockWithdrawals.filter(w => w.status === 'Rejected').length;
      
      const totalWithdrawn = mockWithdrawals
        .filter(w => w.status === 'Approved')
        .reduce((sum, w) => sum + w.requestedAmount, 0);
      
      const pendingAmount = mockWithdrawals
        .filter(w => w.status === 'Pending')
        .reduce((sum, w) => sum + w.requestedAmount, 0);

      resolve({
        success: true,
        data: {
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalWithdrawn,
          pendingAmount,
        },
      });
    }, 300);
  });
};

/**
 * Format currency to Indian Rupees
 */
export const formatCurrency = (amount) => {
  // Handle null, undefined, or invalid values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

/**
 * Get withdrawal status color
 */
export const getWithdrawalStatusColor = (status) => {
  const colors = {
    'Pending': '#F59E0B',
    'Approved': '#10B981',
    'Rejected': '#EF4444',
  };
  return colors[status] || '#6B7280';
};
