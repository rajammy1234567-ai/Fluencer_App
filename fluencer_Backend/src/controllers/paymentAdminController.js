/**
 * Payment Admin Controller
 * Handles payment management in admin panel
 */

import Payment from '../models/Payment.js';
import User from '../models/User.js';
import BrandProfile from '../models/BrandProfile.js';
import Campaign from '../models/Campaign.js';

/**
 * Get All Payments with Pagination
 */
export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status || '';

    const filter = {};
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const total = await Payment.countDocuments(filter);
    const list = await Payment.find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const payments = await Promise.all(list.map(async (po) => {
      const bp = await BrandProfile.findOne({ user_id: po.user_id }).select('company_name').lean();
      return {
        id: po._id.toString(),
        razorpayOrderId: po.order_id,
        razorpayPaymentId: po.payment_id,
        brandName: bp ? bp.company_name : 'Brand',
        campaignId: po.campaign_id ? po.campaign_id.toString() : null,
        amount: po.amount,
        currency: po.currency,
        status: po.status,
        description: po.description,
        transactionDate: po.created_at,
        completedAt: po.completed_at
      };
    }));

    res.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message,
    });
  }
};

/**
 * Get Payment By ID with Details
 */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const po = await Payment.findById(id).lean();

    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    const bp = await BrandProfile.findOne({ user_id: po.user_id }).select('company_name').lean();
    const u = await User.findById(po.user_id).select('email').lean();
    
    let campaignName = '';
    if (po.campaign_id) {
      const c = await Campaign.findById(po.campaign_id).select('campaign_name').lean();
      campaignName = c ? c.campaign_name : '';
    }

    res.json({
      success: true,
      data: {
        id: po._id.toString(),
        razorpayOrderId: po.order_id,
        razorpayPaymentId: po.payment_id,
        brandName: bp ? bp.company_name : 'Brand',
        brandEmail: u ? u.email : '',
        campaignId: po.campaign_id ? po.campaign_id.toString() : null,
        campaignName,
        amount: po.amount,
        currency: po.currency,
        status: po.status,
        description: po.description,
        transactionDate: po.created_at,
        completedAt: po.completed_at
      },
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
};

/**
 * Process Refund for a Payment
 */
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded',
      });
    }

    payment.status = 'refunded';
    payment.description = `${payment.description} | Refund Reason: ${reason || 'Admin initiated refund'}`;
    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        paymentId: id,
        refundAmount: payment.amount,
        status: 'refunded',
      },
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};
