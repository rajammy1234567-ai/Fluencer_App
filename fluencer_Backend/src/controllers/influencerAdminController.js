/**
 * Influencer Admin Controller
 * Handles influencer management in admin panel
 */

import User from '../models/User.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import Application from '../models/Application.js';

/**
 * Get All Influencers with Pagination
 */
export const getAllInfluencers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const searchQuery = req.query.search || '';

    const filter = {};
    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: 'i' };
    }

    const total = await InfluencerProfile.countDocuments(filter);
    const profiles = await InfluencerProfile.find(filter)
      .skip(offset)
      .limit(limit)
      .lean();

    const influencers = await Promise.all(profiles.map(async (ip) => {
      const u = await User.findById(ip.user_id).select('email created_at').lean();

      return {
        id: ip.user_id.toString(),
        email: u ? u.email : '',
        created_at: u ? u.created_at : null,
        name: ip.name,
        gender: ip.gender,
        categories: ip.categories,
        location: ip.location,
        bio: ip.bio,
        profile_image: ip.profile_image,
        followers_count: ip.followers_count,
        status: 'active'
      };
    }));

    res.json({
      success: true,
      data: influencers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching influencers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch influencers',
      error: error.message,
    });
  }
};

/**
 * Get Influencer By ID with Details
 */
export const getInfluencerById = async (req, res) => {
  try {
    const { id } = req.params;

    const ip = await InfluencerProfile.findOne({ user_id: id }).lean();
    const u = await User.findById(id).select('email created_at').lean();

    if (!ip) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found',
      });
    }

    const totalApplications = await Application.countDocuments({ influencer_id: id });

    // Mock wallet info (MongoDB doesn't have native wallets table unless simulated)
    const walletBalance = {
      pendingBalance: 0,
      availableBalance: 0,
      totalEarnings: 0,
    };

    res.json({
      success: true,
      data: {
        id: id,
        email: u ? u.email : '',
        created_at: u ? u.created_at : null,
        name: ip.name,
        gender: ip.gender,
        followers: ip.followers_count,
        location: ip.location,
        categories: ip.categories,
        bio: ip.bio,
        profileImage: ip.profile_image,
        status: 'active',
        totalApplications,
        wallet: walletBalance,
      },
    });
  } catch (error) {
    console.error('Error fetching influencer details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch influencer details',
      error: error.message,
    });
  }
};

/**
 * Update Influencer Status (Block/Unblock)
 */
export const updateInfluencerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active or blocked',
      });
    }

    const influencer = await User.findOne({ _id: id, role: 'influencer' });
    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found',
      });
    }

    // Toggle user status
    influencer.is_verified = (status === 'active');
    await influencer.save();

    res.json({
      success: true,
      message: `Influencer status updated to ${status}`,
      data: { id, status },
    });
  } catch (error) {
    console.error('Error updating influencer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update influencer status',
      error: error.message,
    });
  }
};
