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

/**
 * Get Pending Escrow Release Applications
 */
export const getPendingEscrows = async (req, res) => {
  try {
    const list = await Application.find({ 
      deliverable_status: { $in: ['submitted', 'brand_approved'] }
    }).sort({ updated_at: -1 }).lean();

    const pendingEscrows = await Promise.all(list.map(async (app) => {
      const campaign = await Campaign.findById(app.campaign_id).select('campaign_name cost_per_influencer brand_id').lean();
      const ip = await InfluencerProfile.findOne({ user_id: app.influencer_id }).select('name profile_image upi_id').lean();
      const bp = campaign ? await BrandProfile.findOne({ user_id: campaign.brand_id }).select('company_name').lean() : null;

      const escrowAmount = app.escrow_amount || (campaign ? campaign.cost_per_influencer : 0);
      const commissionAmount = Math.round(escrowAmount * 0.18); // 18% Commission
      const finalPayout = escrowAmount - commissionAmount;

      return {
        id: app._id.toString(),
        application_id: app._id.toString(),
        campaign_name: campaign ? campaign.campaign_name : 'Campaign',
        brand_name: bp ? bp.company_name : 'Brand',
        influencer_name: ip ? ip.name : 'Influencer',
        influencer_upi: ip ? ip.upi_id : '',
        submission_url: app.submission_url,
        submission_notes: app.submission_notes,
        deliverable_status: app.deliverable_status,
        escrow_amount: escrowAmount,
        commission_rate: '18%',
        commission_amount: commissionAmount,
        final_payout: finalPayout,
        submitted_at: app.submitted_at || app.updated_at
      };
    }));

    res.json({
      success: true,
      count: pendingEscrows.length,
      data: pendingEscrows
    });
  } catch (error) {
    console.error('Error fetching pending escrows:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Release Escrow Payout (Admin approves deliverable & credits Influencer Wallet after 18% commission)
 */
export const releaseEscrowPayout = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const campaign = await Campaign.findById(application.campaign_id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Associated campaign not found' });
    }

    const escrowAmount = application.escrow_amount || campaign.cost_per_influencer || 0;
    const commissionAmount = Math.round(escrowAmount * 0.18); // 18% Commission
    const finalPayout = escrowAmount - commissionAmount;

    // Deduct Brand Escrow Balance
    const brandProfile = await BrandProfile.findOne({ user_id: campaign.brand_id });
    if (brandProfile) {
      brandProfile.escrow_balance = Math.max(0, (brandProfile.escrow_balance || 0) - escrowAmount);
      await brandProfile.save();
    }

    // Credit Influencer Wallet Balance & Deduct from Influencer Escrow Balance
    const influencerProfile = await InfluencerProfile.findOne({ user_id: application.influencer_id });
    if (!influencerProfile) {
      return res.status(404).json({ success: false, message: 'Influencer profile not found' });
    }

    influencerProfile.escrow_balance = Math.max(0, (influencerProfile.escrow_balance || 0) - escrowAmount);
    influencerProfile.wallet_balance = (influencerProfile.wallet_balance || 0) + finalPayout;
    await influencerProfile.save();

    // Update Application Status
    application.deliverable_status = 'payout_released';
    application.commission_amount = commissionAmount;
    application.final_influencer_amount = finalPayout;
    await application.save();

    // Create Wallet Transaction for Influencer (Credit)
    const WalletTransaction = (await import('../models/WalletTransaction.js')).default;
    await WalletTransaction.create({
      user_id: application.influencer_id,
      user_role: 'influencer',
      type: 'escrow_release',
      amount: finalPayout,
      commission: commissionAmount,
      status: 'completed',
      description: `Escrow Released for ${campaign.campaign_name} (18% GST/Commission Deducted)`,
      reference_id: application._id.toString()
    });

    res.json({
      success: true,
      message: `Escrow payout released successfully! ₹${finalPayout} credited to Influencer wallet (18% commission ₹${commissionAmount} retained).`,
      data: {
        escrow_amount: escrowAmount,
        commission_deducted: commissionAmount,
        credited_to_influencer: finalPayout,
        influencer_new_balance: influencerProfile.wallet_balance
      }
    });
  } catch (error) {
    console.error('Error releasing escrow payout:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
