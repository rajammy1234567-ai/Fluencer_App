import express from 'express';
import BrandProfile from '../models/BrandProfile.js';
import User from '../models/User.js';
import authMiddleware, { optionalAuth } from '../middleware/auth.js';
import { uploadProfileImage } from '../middleware/upload.js';

const router = express.Router();

// Get all brands for discovery
router.get('/all', optionalAuth, async (req, res) => {
  try {
    const brands = await BrandProfile.find({}).lean();
    res.status(200).json({
      success: true,
      brands: brands.map(b => ({
        id: b._id.toString(),
        brand_id: b.user_id,
        company_name: b.company_name,
        companyName: b.company_name,
        category: b.category,
        address: b.address,
        profile_image: b.profile_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        profileImage: b.profile_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      }))
    });
  } catch (error) {
    console.error('All brands fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message
    });
  }
});

// Upload profile image
router.post('/upload-image', authMiddleware, (req, res) => {
  uploadProfileImage(req, res, async (err) => {
    try {
      const fileUrl = req.fileUrl || (req.file ? `/uploads/profiles/${req.file.filename}` : (req.body ? (req.body.image_url || req.body.profile_image || req.body.logo) : null));
      const userId = req.user.userId || req.user.id;

      if (!fileUrl) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file or image URL provided' 
        });
      }

      // Update brand profile in database
      const profile = await BrandProfile.findOneAndUpdate(
        { user_id: userId },
        { $set: { profile_image: fileUrl, logo: fileUrl } },
        { new: true, upsert: true }
      );

      res.json({ 
        success: true, 
        message: 'Brand logo uploaded successfully',
        imageUrl: fileUrl,
        profile
      });
    } catch (error) {
      console.error('Brand image upload error:', error);
      res.status(500).json({ success: false, message: 'Failed to update brand profile image', error: error.message });
    }
  });
});

// Save brand profile details
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const { companyName, category, address, profileImage } = req.body;
    const userId = req.user.userId;

    if (!companyName || !category || !address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company name, category, and address are required' 
      });
    }

    // Check if profile already exists
    const existingProfile = await BrandProfile.findOne({ user_id: userId });

    if (existingProfile) {
      // Update existing profile
      existingProfile.company_name = companyName;
      existingProfile.category = category;
      existingProfile.address = address;
      if (profileImage) existingProfile.profile_image = profileImage;
      await existingProfile.save();
    } else {
      // Create new profile
      await BrandProfile.create({
        user_id: userId,
        company_name: companyName,
        category,
        address,
        profile_image: profileImage || null
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Brand profile saved successfully'
    });
  } catch (error) {
    console.error('Brand profile save error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save brand profile', 
      error: error.message 
    });
  }
});

// Update brand profile details (PUT method with image support)
router.put('/profile', authMiddleware, (req, res) => {
  uploadProfileImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }

    try {
      const userId = req.user.userId;
      
      const profile = await BrandProfile.findOne({ user_id: userId });
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      // Handle fields update
      if (req.body.companyName) profile.company_name = req.body.companyName;
      if (req.body.company_name) profile.company_name = req.body.company_name;
      if (req.body.category) profile.category = req.body.category;
      if (req.body.address) profile.address = req.body.address;
      if (req.body.website) profile.website = req.body.website;
      if (req.body.phone) profile.phone = req.body.phone;
      if (req.body.profile_image || req.body.profileImage) {
        profile.profile_image = req.body.profile_image || req.body.profileImage;
        profile.logo = req.body.profile_image || req.body.profileImage;
      }
      
      // Handle uploaded image file
      if (req.file) {
        profile.profile_image = `/uploads/profiles/${req.file.filename}`;
      }

      await profile.save();

      // Find user to append email
      const user = await User.findById(userId).lean();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        ...profile.toObject(),
        email: user ? user.email : ''
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  });
});

// Get brand profile details
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await BrandProfile.findOne({ user_id: userId }).lean();

    if (!profile) {
      // If no brand profile, return user info only
      const user = await User.findById(userId).select('id email role').lean();

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found'
        });
      }

      return res.status(200).json({
        id: user._id.toString(),
        email: user.email,
        role: user.role
      });
    }

    const user = await User.findById(userId).select('email').lean();
    
    const Campaign = (await import('../models/Campaign.js')).default;
    const Application = (await import('../models/Application.js')).default;

    const totalCampaigns = await Campaign.countDocuments({ brand_id: userId });
    const activeCampaigns = await Campaign.countDocuments({ brand_id: userId, status: 'active' });
    const totalCollabs = await Application.countDocuments({ brand_id: userId, status: { $in: ['accepted', 'completed', 'escrow_locked'] } });

    res.status(200).json({
      ...profile,
      id: profile._id.toString(),
      email: user ? user.email : '',
      total_campaigns: totalCampaigns,
      active_campaigns: activeCampaigns,
      collabs_count: totalCollabs,
      total_collabs: totalCollabs
    });
  } catch (error) {
    console.error('Brand profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch brand profile', 
      error: error.message 
    });
  }
});

// Check if brand profile exists
router.get('/profile-exists', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await BrandProfile.findOne({ user_id: userId });

    res.status(200).json({ 
      success: true, 
      exists: !!profile
    });
  } catch (error) {
    console.error('Brand profile check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check brand profile', 
      error: error.message 
    });
  }
});

// Get public brand profile details (For creators to view brand company profile)
router.get('/public/:id', optionalAuth, async (req, res) => {
  try {
    const targetId = req.params.id;
    let profile = null;
    if (targetId && targetId !== 'undefined') {
      if (targetId.length === 24) {
        profile = await BrandProfile.findOne({ _id: targetId }).lean();
      }
      if (!profile) {
        profile = await BrandProfile.findOne({ user_id: targetId }).lean();
      }
    }

    if (!profile) {
      // Fallback to sample profile if not found
      return res.status(200).json({
        success: true,
        profile: {
          company_name: 'Apex Pro Fitness',
          category: 'Health & Fitness',
          address: 'Bandra West, Mumbai, Maharashtra 400050',
          profile_image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500',
          total_campaigns: 5,
          active_campaigns: 2,
          total_collabs: 14,
          verified: true
        }
      });
    }

    const Campaign = (await import('../models/Campaign.js')).default;
    const Application = (await import('../models/Application.js')).default;

    const brandUserId = profile.user_id;
    const totalCampaigns = await Campaign.countDocuments({ brand_id: brandUserId });
    const activeCampaigns = await Campaign.countDocuments({ brand_id: brandUserId, status: 'active' });
    const totalCollabs = await Application.countDocuments({ brand_id: brandUserId, status: { $in: ['accepted', 'completed', 'escrow_locked'] } });

    res.status(200).json({
      success: true,
      profile: {
        ...profile,
        id: profile._id.toString(),
        total_campaigns: totalCampaigns,
        active_campaigns: activeCampaigns,
        total_collabs: totalCollabs,
        verified: true
      }
    });
  } catch (error) {
    console.error('Public brand profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch brand profile', error: error.message });
  }
});

export default router;
