/**
 * Admin Controller
 * Handles admin dashboard statistics and overview data
 */

import User from '../models/User.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import BrandProfile from '../models/BrandProfile.js';
import Campaign from '../models/Campaign.js';
import Application from '../models/Application.js';
import Payment from '../models/Payment.js';
import Withdrawal from '../models/Withdrawal.js';
import Chat from '../models/Chat.js';
import ChatMessage from '../models/ChatMessage.js';

/**
 * Get Dashboard Statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalInfluencers = await InfluencerProfile.countDocuments({});
    const totalBrands = await BrandProfile.countDocuments({});
    const totalCampaigns = await Campaign.countDocuments({});
    const activeDeals = await Application.countDocuments({ status: 'accepted' });

    // Platform Earnings - sum of completed payments * commission (10% platform fee)
    const earningsResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalEarnings = earningsResult[0]?.total || 0;
    const platformEarnings = Math.round(totalEarnings * 0.10);

    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const openDisputes = await Application.countDocuments({ status: 'rejected' });

    res.json({
      success: true,
      data: {
        totalInfluencers,
        totalBrands,
        totalCampaigns,
        activeDeals,
        platformEarnings,
        pendingWithdrawals,
        openDisputes,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * Get Recent Campaigns
 */
export const getRecentCampaigns = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const list = await Campaign.find({}).sort({ created_at: -1 }).limit(limit).lean();

    const campaigns = await Promise.all(list.map(async (c) => {
      const bp = await BrandProfile.findOne({ user_id: c.brand_id }).select('company_name').lean();
      return {
        id: c._id.toString(),
        campaignName: c.campaign_name,
        status: c.status,
        budget: c.cost_per_influencer,
        createdAt: c.created_at,
        brandName: bp ? bp.company_name : 'Brand'
      };
    }));

    res.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error('Error fetching recent campaigns:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent campaigns',
      error: error.message,
    });
  }
};

/**
 * Get Recent Payments
 */
export const getRecentPayments = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const list = await Payment.find({}).sort({ created_at: -1 }).limit(limit).lean();

    const payments = await Promise.all(list.map(async (p) => {
      const bp = await BrandProfile.findOne({ user_id: p.user_id }).select('company_name').lean();
      return {
        id: p._id.toString(),
        brandName: bp ? bp.company_name : 'Brand',
        amount: p.amount,
        status: p.status,
        transactionDate: p.created_at
      };
    }));

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching recent payments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent payments',
      error: error.message,
    });
  }
};

/**
 * Get Withdraw Requests
 */
export const getWithdrawRequests = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const list = await Withdrawal.find({ status: 'pending' }).sort({ created_at: -1 }).limit(limit).lean();

    const withdrawRequests = await Promise.all(list.map(async (w) => {
      const ip = await InfluencerProfile.findOne({ user_id: w.user_id }).select('name profile_image').lean();
      return {
        id: w._id.toString(),
        influencerName: ip ? ip.name : 'Influencer',
        amount: w.amount,
        status: w.status,
        requestDate: w.created_at
      };
    }));

    res.json({
      success: true,
      data: withdrawRequests,
    });
  } catch (error) {
    console.error('Error fetching withdraw requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdraw requests',
      error: error.message,
    });
  }
};

/**
 * Get All Chats (monitoring)
 */
export const getAllChats = async (req, res) => {
  try {
    const list = await Chat.find({}).lean();

    const chats = await Promise.all(list.map(async (ch) => {
      const campaign = await Campaign.findById(ch.campaign_id).select('campaign_name').lean();
      const bp = await BrandProfile.findOne({ user_id: ch.brand_id }).select('company_name profile_image').lean();
      const ip = await InfluencerProfile.findOne({ user_id: ch.influencer_id }).select('name profile_image').lean();
      
      const lastMsg = await ChatMessage.findOne({ chat_id: ch._id }).sort({ created_at: -1 }).lean();
      const totalMessages = await ChatMessage.countDocuments({ chat_id: ch._id });

      return {
        ...ch,
        id: ch._id.toString(),
        campaign_name: campaign ? campaign.campaign_name : '',
        brand_name: bp ? bp.company_name : '',
        brand_image: bp ? bp.profile_image : null,
        influencer_name: ip ? ip.name : '',
        influencer_image: ip ? ip.profile_image : null,
        last_message: lastMsg ? lastMsg.message : null,
        last_message_time: lastMsg ? lastMsg.created_at : null,
        total_messages: totalMessages
      };
    }));

    // Sort by last message time
    chats.sort((a, b) => new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0));

    res.status(200).json({ 
      success: true, 
      chats: chats
    });
  } catch (error) {
    console.error('Admin chats fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch all chats', 
      error: error.message 
    });
  }
};
