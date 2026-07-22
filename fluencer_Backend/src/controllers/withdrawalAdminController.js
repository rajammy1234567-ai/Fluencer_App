/**
 * Withdrawal Admin Controller
 * Handles withdrawal management in admin panel
 */

import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import InfluencerProfile from '../models/InfluencerProfile.js';

/**
 * Get All Withdrawals with Pagination
 */
export const getAllWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status || '';

    const filter = {};
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const total = await Withdrawal.countDocuments(filter);
    const list = await Withdrawal.find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const withdrawals = await Promise.all(list.map(async (w) => {
      const ip = await InfluencerProfile.findOne({ user_id: w.user_id }).select('name').lean();
      const u = await User.findById(w.user_id).select('email').lean();
      
      return {
        id: w._id.toString(),
        influencerName: ip ? ip.name : 'Influencer',
        influencerEmail: u ? u.email : '',
        amount: w.amount,
        status: w.status,
        requestDate: w.created_at,
        processedDate: w.updated_at,
        method: w.method || 'bank_transfer'
      };
    }));

    res.json({
      success: true,
      data: withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawals',
      error: error.message,
    });
  }
};

/**
 * Get Withdrawal By ID with Details
 */
export const getWithdrawalById = async (req, res) => {
  try {
    const { id } = req.params;

    const w = await Withdrawal.findById(id).lean();

    if (!w) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    const ip = await InfluencerProfile.findOne({ user_id: w.user_id }).select('name').lean();
    const u = await User.findById(w.user_id).select('email').lean();

    res.json({
      success: true,
      data: {
        id: w._id.toString(),
        influencerId: w.user_id.toString(),
        influencerName: ip ? ip.name : 'Influencer',
        influencerEmail: u ? u.email : '',
        amount: w.amount,
        status: w.status,
        requestDate: w.created_at,
        processedDate: w.updated_at,
        method: w.method || 'bank_transfer'
      },
    });
  } catch (error) {
    console.error('Error fetching withdrawal details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal details',
      error: error.message,
    });
  }
};

/**
 * Approve Withdrawal
 */
export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;

    const w = await Withdrawal.findById(id);

    if (!w) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    if (w.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending withdrawals can be approved',
      });
    }

    w.status = 'approved';
    await w.save();

    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      data: {
        id,
        status: 'approved',
        amount: w.amount,
      },
    });
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve withdrawal',
      error: error.message,
    });
  }
};

/**
 * Reject Withdrawal
 */
export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const w = await Withdrawal.findById(id);

    if (!w) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    const infId = w.influencer_id || w.user_id;

    w.status = 'rejected';
    await w.save();

    // Refund amount back to Influencer Wallet Balance
    if (infId) {
      const influencerProfile = await InfluencerProfile.findOne({ user_id: infId });
      if (influencerProfile) {
        influencerProfile.wallet_balance = (influencerProfile.wallet_balance || 0) + w.amount;
        await influencerProfile.save();
      }
    }

    res.json({
      success: true,
      message: 'Withdrawal rejected & amount refunded back to influencer wallet',
      data: {
        id,
        status: 'rejected',
        reason,
      },
    });
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject withdrawal',
      error: error.message,
    });
  }
};
