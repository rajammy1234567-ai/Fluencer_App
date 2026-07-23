/**
 * Brand Admin Controller
 * Handles brand management in admin panel
 */

import User from '../models/User.js';
import BrandProfile from '../models/BrandProfile.js';
import Campaign from '../models/Campaign.js';
import Payment from '../models/Payment.js';

/**
 * Get All Brands with Pagination
 */
export const getAllBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const searchQuery = req.query.search || '';

    const filter = {};
    if (searchQuery) {
      filter.company_name = { $regex: searchQuery, $options: 'i' };
    }

    const total = await BrandProfile.countDocuments(filter);
    const profiles = await BrandProfile.find(filter)
      .skip(offset)
      .limit(limit)
      .lean();

    const brands = await Promise.all(profiles.map(async (bp) => {
      const u = await User.findById(bp.user_id).select('email created_at').lean();
      const totalCampaigns = await Campaign.countDocuments({ brand_id: bp.user_id });

      return {
        id: bp.user_id.toString(),
        email: u ? u.email : '',
        created_at: u ? u.created_at : null,
        company_name: bp.company_name,
        category: bp.category,
        address: bp.address,
        profile_image: bp.profile_image,
        website: bp.website,
        description: bp.description,
        status: 'active',
        totalCampaigns
      };
    }));

    res.json({
      success: true,
      data: brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message,
    });
  }
};
/**
 * Get Brand By ID with Details
 */
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const bp = await BrandProfile.findOne({ user_id: id }).lean();
    const u = await User.findById(id).select('email created_at').lean();

    if (!bp) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    const totalCampaigns = await Campaign.countDocuments({ brand_id: id });

    // Get total spending
    const spendingResult = await Payment.aggregate([
      { $match: { user_id: id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSpending = spendingResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        id: id,
        email: u ? u.email : '',
        created_at: u ? u.created_at : null,
        businessName: bp.company_name,
        category: bp.category,
        address: bp.address,
        website: bp.website,
        description: bp.description,
        profileImage: bp.profile_image,
        status: 'active',
        totalCampaigns,
        totalSpending,
      },
    });
  } catch (error) {
    console.error('Error fetching brand details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand details',
      error: error.message,
    });
  }
};

/**
 * Update Brand Status (Block/Unblock)
 */
export const updateBrandStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active or blocked',
      });
    }

    const brand = await User.findOne({ _id: id, role: 'brand' });
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    // Toggle user status
    brand.is_verified = (status === 'active');
    await brand.save();

    res.json({
      success: true,
      message: `Brand status updated to ${status}`,
      data: { id, status },
    });
  } catch (error) {
    console.error('Error updating brand status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update brand status',
      error: error.message,
    });
  }
};
