import express from 'express';
import BrandProfile from '../models/BrandProfile.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import { uploadProfileImage } from '../middleware/upload.js';

const router = express.Router();

// Upload profile image
router.post('/upload-image', authMiddleware, (req, res) => {
  uploadProfileImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Return file URL
    const fileUrl = `/uploads/profiles/${req.file.filename}`;
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      imageUrl: fileUrl
    });
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
      if (req.body.category) profile.category = req.body.category;
      if (req.body.address) profile.address = req.body.address;
      if (req.body.website) profile.website = req.body.website;
      if (req.body.phone) profile.phone = req.body.phone;
      
      // Handle uploaded image
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
    
    res.status(200).json({
      ...profile,
      id: profile._id.toString(),
      email: user ? user.email : ''
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

export default router;
