/**
 * Payment Admin Service
 * Manages brand payments, transaction details, and commission calculations
 * 
 * Mock data for admin MVP — replace with APIs
 */

// Mock payment data
const mockPayments = [
  {
    id: 'PAY001',
    brandId: 'B001',
    brandName: 'Nike India',
    campaignId: 'C001',
    campaignName: 'Summer Collection Launch',
    influencerId: 'I001',
    influencerName: 'Priya Sharma',
    totalAmount: 50000,
    commissionRate: 20, // 20%
    commissionAmount: 10000,
    influencerAmount: 40000,
    razorpayTransactionId: 'pay_NK12345ABC',
    razorpayOrderId: 'order_NK12345',
    paymentStatus: 'Success',
    paymentMethod: 'UPI',
    paymentDate: '2026-01-20T10:30:00Z',
    refundStatus: null,
    refundAmount: 0,
    refundDate: null,
    createdAt: '2026-01-20T10:30:00Z',
  },
  {
    id: 'PAY002',
    brandId: 'B002',
    brandName: 'Myntra Fashion',
    campaignId: 'C002',
    campaignName: 'Festival Sale Campaign',
    influencerId: 'I002',
    influencerName: 'Rahul Verma',
    totalAmount: 75000,
    commissionRate: 20,
    commissionAmount: 15000,
    influencerAmount: 60000,
    razorpayTransactionId: 'pay_MN67890XYZ',
    razorpayOrderId: 'order_MN67890',
    paymentStatus: 'Success',
    paymentMethod: 'Credit Card',
    paymentDate: '2026-01-22T14:15:00Z',
    refundStatus: null,
    refundAmount: 0,
    refundDate: null,
    createdAt: '2026-01-22T14:15:00Z',
  },
  {
    id: 'PAY003',
    brandId: 'B003',
    brandName: 'Zomato',
    campaignId: 'C003',
    campaignName: 'Food Delivery Awareness',
    influencerId: 'I003',
    influencerName: 'Anjali Mehta',
    totalAmount: 30000,
    commissionRate: 20,
    commissionAmount: 6000,
    influencerAmount: 24000,
    razorpayTransactionId: 'pay_ZM11223ABC',
    razorpayOrderId: 'order_ZM11223',
    paymentStatus: 'Refunded',
    paymentMethod: 'UPI',
    paymentDate: '2026-01-18T09:00:00Z',
    refundStatus: 'Completed',
    refundAmount: 30000,
    refundDate: '2026-01-19T11:00:00Z',
    refundReason: 'Campaign cancelled by brand',
    createdAt: '2026-01-18T09:00:00Z',
  },
  {
    id: 'PAY004',
    brandId: 'B004',
    brandName: 'Amazon Fashion',
    campaignId: 'C004',
    campaignName: 'Prime Day Special',
    influencerId: 'I004',
    influencerName: 'Vikram Singh',
    totalAmount: 100000,
    commissionRate: 20,
    commissionAmount: 20000,
    influencerAmount: 80000,
    razorpayTransactionId: 'pay_AZ99887XYZ',
    razorpayOrderId: 'order_AZ99887',
    paymentStatus: 'Success',
    paymentMethod: 'Net Banking',
    paymentDate: '2026-01-25T16:45:00Z',
    refundStatus: null,
    refundAmount: 0,
    refundDate: null,
    createdAt: '2026-01-25T16:45:00Z',
  },
  {
    id: 'PAY005',
    brandId: 'B001',
    brandName: 'Nike India',
    campaignId: 'C005',
    campaignName: 'Sports Gear Promotion',
    influencerId: 'I005',
    influencerName: 'Sneha Patel',
    totalAmount: 60000,
    commissionRate: 20,
    commissionAmount: 12000,
    influencerAmount: 48000,
    razorpayTransactionId: 'pay_NK55667DEF',
    razorpayOrderId: 'order_NK55667',
    paymentStatus: 'Success',
    paymentMethod: 'Debit Card',
    paymentDate: '2026-01-24T12:20:00Z',
    refundStatus: null,
    refundAmount: 0,
    refundDate: null,
    createdAt: '2026-01-24T12:20:00Z',
  },
];

/**
 * Get all payments with optional filters
 */
export const getAllPayments = async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockPayments];

      // Filter by status
      if (filters.status) {
        filtered = filtered.filter(p => p.paymentStatus === filters.status);
      }

      // Filter by brand
      if (filters.brandId) {
        filtered = filtered.filter(p => p.brandId === filters.brandId);
      }

      // Filter by date range
      if (filters.startDate && filters.endDate) {
        filtered = filtered.filter(p => {
          const payDate = new Date(p.paymentDate);
          return payDate >= new Date(filters.startDate) && payDate <= new Date(filters.endDate);
        });
      }

      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

      resolve({
        success: true,
        data: filtered,
        total: filtered.length,
      });
    }, 500);
  });
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const payment = mockPayments.find(p => p.id === paymentId);
      
      if (payment) {
        resolve({
          success: true,
          data: payment,
        });
      } else {
        resolve({
          success: false,
          error: 'Payment not found',
        });
      }
    }, 300);
  });
};

/**
 * Search payments by brand name or transaction ID
 */
export const searchPayments = async (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const searchTerm = query.toLowerCase();
      const results = mockPayments.filter(p =>
        p.brandName.toLowerCase().includes(searchTerm) ||
        p.campaignName.toLowerCase().includes(searchTerm) ||
        p.razorpayTransactionId.toLowerCase().includes(searchTerm) ||
        p.influencerName.toLowerCase().includes(searchTerm)
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
 * Get payment statistics for dashboard
 */
export const getPaymentStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const totalPayments = mockPayments.length;
      const successfulPayments = mockPayments.filter(p => p.paymentStatus === 'Success').length;
      const refundedPayments = mockPayments.filter(p => p.paymentStatus === 'Refunded').length;
      
      const totalRevenue = mockPayments
        .filter(p => p.paymentStatus === 'Success')
        .reduce((sum, p) => sum + p.totalAmount, 0);
      
      const totalCommission = mockPayments
        .filter(p => p.paymentStatus === 'Success')
        .reduce((sum, p) => sum + p.commissionAmount, 0);
      
      const totalInfluencerPayout = mockPayments
        .filter(p => p.paymentStatus === 'Success')
        .reduce((sum, p) => sum + p.influencerAmount, 0);

      resolve({
        success: true,
        data: {
          totalPayments,
          successfulPayments,
          refundedPayments,
          totalRevenue,
          totalCommission,
          totalInfluencerPayout,
        },
      });
    }, 300);
  });
};

/**
 * Format currency to Indian Rupees
 */
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Get payment status color
 */
export const getPaymentStatusColor = (status) => {
  const colors = {
    'Success': '#10B981',
    'Refunded': '#EF4444',
    'Pending': '#F59E0B',
    'Failed': '#DC2626',
  };
  return colors[status] || '#6B7280';
};
